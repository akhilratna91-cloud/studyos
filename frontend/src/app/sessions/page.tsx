"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Bell, Clock3, Headphones, TimerReset } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import {
  getNotifications,
  getSessions,
  saveSession,
  type NotificationRecord,
  type StudySession,
} from "@/lib/api";
import { demoNotifications, demoSessions } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

const quickDurations = [25, 45, 90];

export default function SessionsPage() {
  const { token, hasHydrated, addXp } = useUserStore();
  const [sessions, setSessions] = useState<StudySession[]>(demoSessions);
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(demoNotifications);
  const [status, setStatus] = useState("Loading sessions...");
  const [, startTransition] = useTransition();

  const loadSessions = useCallback(async () => {
    if (!token) {
      startTransition(() => {
        setSessions(demoSessions);
        setNotifications(demoNotifications);
        setStatus("Demo session history loaded. Sign in to save real records.");
      });
      return;
    }

    try {
      const [sessionData, notificationData] = await Promise.all([
        getSessions(token),
        getNotifications(token),
      ]);

      startTransition(() => {
        setSessions(sessionData);
        setNotifications(notificationData);
        setStatus("Live focus session history synced.");
      });
    } catch (error) {
      startTransition(() => {
        setSessions(demoSessions);
        setNotifications(demoNotifications);
        setStatus(
          error instanceof Error
            ? `Live session sync failed: ${error.message}`
            : "Live session sync failed.",
        );
      });
    }
  }, [token, startTransition]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void loadSessions();
  }, [hasHydrated, loadSessions]);

  async function handleQuickSave(duration: number) {
    if (!token) {
      setStatus("Sign in to persist sessions. Demo mode is showing sample history.");
      return;
    }

    try {
      await saveSession(token, duration);
      addXp(duration);
      setStatus(`${duration} minute session saved.`);
      await loadSessions();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Session save failed.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          Session log
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Focus time, captured properly
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{status}</p>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap gap-3">
          {quickDurations.map((duration) => (
            <NeonButton key={duration} onClick={() => void handleQuickSave(duration)}>
              <TimerReset size={16} />
              Save {duration} min
            </NeonButton>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Headphones size={16} className="text-cyan-300" />
            Recent sessions
          </div>
          <div className="mt-4 space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id || session._id || session.createdAt}
                className="rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">
                    {session.durationMinutes} minute session
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.createdAt || session.timestamp || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Bell size={16} className="text-orange-300" />
            Smart nudges
          </div>
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id || notification._id || notification.message}
                className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-6 text-gray-200"
              >
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock3 size={12} />
                  {new Date(notification.createdAt || Date.now()).toLocaleString()}
                </div>
                <div className="mt-2">{notification.message}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
