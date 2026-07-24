"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Clock3, PlayCircle, Pause, Flame, Zap } from "lucide-react";
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
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6 theme-sessions">
      <PageHeader tag="Deep Focus Engine (Purple & Rose Blend)" title="Flow State Session Timer" subtitle="Track your intense study sessions with precision and earn XP." />

      {/* Timer Cockpit */}
      <motion.div variants={item}>
        <GlassCard glowColor="purple" className="p-8 text-center border-purple-500/30">
          <div className="relative mx-auto h-48 w-48 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke={timerActive ? "#f43f5e" : "#8b5cf6"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={timerActive ? 2 * Math.PI * 70 * (1 - Math.min(seconds / 1500, 1)) : 2 * Math.PI * 70}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-heading text-4xl font-extrabold text-white text-gradient-emerald-purple">{formatTime(seconds)}</span>
              <span className="font-mono text-[10px] text-purple-300 uppercase tracking-widest mt-1">
                {timerActive ? "Session Running" : "Ready to Focus"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            {!timerActive ? (
              <NeonButton variant="solid" glowColor="purple" className="px-6 py-3 text-xs font-bold" onClick={() => setTimerActive(true)}>
                <PlayCircle size={18} /> Launch Focus Timer
              </NeonButton>
            ) : (
              <>
                <NeonButton variant="outline" glowColor="purple" onClick={() => setTimerActive(false)}>
                  <Pause size={16} /> Pause
                </NeonButton>
                <NeonButton variant="solid" glowColor="emerald" onClick={() => void handleSave()} loading={saving} disabled={seconds < 60}>
                  <Zap size={16} /> Log Session & Claim XP
                </NeonButton>
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats */}
        <motion.div variants={item}>
          <GlassCard glowColor="purple" className="p-6 border-purple-500/25">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-purple-300 mb-4 flex items-center gap-2">
              <Flame size={16} className="text-amber-400" /> Focus Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4 text-center">
                <div className="font-heading text-2xl font-bold text-white">{sessions.length}</div>
                <div className="font-mono text-[10px] text-purple-300/70 uppercase tracking-wider mt-1">Sessions Completed</div>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4 text-center">
                <div className="font-heading text-2xl font-bold text-emerald-400">{(totalMinutes / 60).toFixed(1)}</div>
                <div className="font-mono text-[10px] text-emerald-300 uppercase tracking-wider mt-1">Total Hours Logged</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* History */}
        <motion.div variants={item}>
          <GlassCard glowColor="purple" className="p-6 border-purple-500/25">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-purple-300 mb-4 flex items-center gap-2">
              <Clock3 size={16} className="text-emerald-400" /> Recent Logged Sessions
            </h3>
            <div className="no-scrollbar space-y-2 max-h-60 overflow-y-auto pr-1">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id || s._id || s.createdAt} className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} className="text-emerald-400" />
                    <span className="font-semibold text-white">{s.durationMinutes} Minutes</span>
                  </div>
                  <span className="text-[10px] text-purple-300/70">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="font-mono text-center text-xs text-purple-300/70 py-4">No sessions logged yet. Start timer above!</div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
