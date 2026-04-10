"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarCheck2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { getCalendar, markCalendar, type CalendarRecord } from "@/lib/api";
import { demoCalendar } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

function buildLast28Days() {
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    return date;
  });
}

export default function CalendarPage() {
  const { token, hasHydrated } = useUserStore();
  const [calendar, setCalendar] = useState<CalendarRecord[]>(demoCalendar);
  const [status, setStatus] = useState("Loading calendar...");
  const [isPending, startTransition] = useTransition();

  const recentDays = useMemo(() => buildLast28Days(), []);
  const completedDays = useMemo(
    () => new Set(calendar.filter((entry) => entry.completed).map((entry) => entry.dateString)),
    [calendar],
  );

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    async function loadCalendar() {
      if (!token) {
        startTransition(() => {
          setCalendar(demoCalendar);
          setStatus("Demo calendar active. Sign in to store real completion marks.");
        });
        return;
      }

      try {
        const records = await getCalendar(token);
        startTransition(() => {
          setCalendar(records);
          setStatus("Live study calendar synced.");
        });
      } catch (error) {
        startTransition(() => {
          setCalendar(demoCalendar);
          setStatus(
            error instanceof Error
              ? `Calendar sync failed: ${error.message}`
              : "Calendar sync failed.",
          );
        });
      }
    }

    void loadCalendar();
  }, [hasHydrated, token, startTransition]);

  async function handleMarkToday() {
    const todayKey = new Date().toISOString().split("T")[0];

    if (!token) {
      setCalendar((current) => [{ id: todayKey, dateString: todayKey, completed: true }, ...current]);
      setStatus("Demo calendar marked. Sign in to make it persistent.");
      return;
    }

    try {
      await markCalendar(token, todayKey);
      const records = await getCalendar(token);
      setCalendar(records);
      setStatus("Today marked complete.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to mark today.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          Calendar map
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Visual consistency tracker
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{status}</p>
      </div>

      <GlassCard className="p-5">
        <NeonButton onClick={() => void handleMarkToday()}>
          <CheckCircle2 size={16} />
          {isPending ? "Updating..." : "Mark today complete"}
        </NeonButton>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <CalendarCheck2 size={16} className="text-cyan-300" />
          Last 28 days
        </div>
        <div className="mt-6 grid grid-cols-7 gap-3">
          {recentDays.map((day) => {
            const key = day.toISOString().split("T")[0];
            const isComplete = completedDays.has(key);

            return (
              <div
                key={key}
                className={`rounded-2xl border p-3 text-center text-xs ${
                  isComplete
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-white/8 bg-white/4 text-gray-400"
                }`}
              >
                <div>{day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</div>
                <div className="mt-1 text-sm font-bold">{day.getDate()}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
