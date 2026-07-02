"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Clock3, PlayCircle, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { getSessions, saveSession, type StudySession } from "@/lib/api";
import { useUserStore } from "@/store/user-store";

export default function SessionsPage() {
  const { token, hasHydrated, addXp } = useUserStore();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function load() {
      try {
        if (token) {
          const result = await getSessions(token);
          if (active) setSessions(result);
        }
      } catch { /* fallback */ }
      finally { if (active) setLoading(false); }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  async function handleSave() {
    if (!token || seconds < 60) return;
    setSaving(true);
    try {
      const minutes = Math.round(seconds / 60);
      await saveSession(token, minutes);
      addXp(minutes * 2);
      const refreshed = await getSessions(token);
      setSessions(refreshed);
      setSeconds(0);
      setTimerActive(false);
    } catch { /* fallback */ }
    finally { setSaving(false); }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated || loading) return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;

  return (
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6">
      <PageHeader tag="Focus mode" title="Study Sessions" subtitle="Track your study time with precision." />

      {/* Timer */}
      <motion.div variants={item}>
        <GlassCard className="p-8 text-center">
          <div className="relative mx-auto h-40 w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke={timerActive ? "#6366F1" : "rgba(99,102,241,0.2)"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={timerActive ? 2 * Math.PI * 70 * (1 - Math.min(seconds / 1500, 1)) : 2 * Math.PI * 70}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-4xl font-black text-white">{formatTime(seconds)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            {!timerActive ? (
              <NeonButton onClick={() => setTimerActive(true)}>
                <PlayCircle size={16} /> Start Session
              </NeonButton>
            ) : (
              <>
                <NeonButton variant="outline" glowColor="cyan" onClick={() => setTimerActive(false)}>
                  Pause
                </NeonButton>
                <NeonButton onClick={() => void handleSave()} loading={saving} disabled={seconds < 60}>
                  Save Session
                </NeonButton>
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                <div className="text-2xl font-black text-white">{sessions.length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Sessions</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                <div className="text-2xl font-black text-primary-light">{(totalMinutes / 60).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Hours Total</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* History */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Recent Sessions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id || s._id || s.createdAt} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} className="text-primary-light" />
                    <span className="text-sm text-gray-300">{s.durationMinutes} min</span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">No sessions yet. Start one above!</div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
