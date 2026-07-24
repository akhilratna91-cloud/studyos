"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { getCalendar, markCalendar, type CalendarRecord } from "@/lib/api";
import { useUserStore } from "@/store/user-store";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { token, hasHydrated, addXp } = useUserStore();
  const [calendar, setCalendar] = useState<CalendarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const now = new Date();
  const [viewYear] = useState(now.getFullYear());
  const [viewMonth] = useState(now.getMonth());

  const todayStr = now.toISOString().split("T")[0];
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const completedDates = new Set(calendar.filter((c) => c.completed).map((c) => c.dateString));
  const todayMarked = completedDates.has(todayStr);

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function load() {
      try {
        if (token) {
          const result = await getCalendar(token);
          if (active) setCalendar(result);
        }
      } catch { /* fallback */ }
      finally { if (active) setLoading(false); }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  async function handleMarkToday() {
    if (!token || todayMarked) return;
    setMarking(true);
    try {
      await markCalendar(token, todayStr);
      addXp(30);
      const refreshed = await getCalendar(token);
      setCalendar(refreshed);
    } catch { /* fallback */ }
    finally { setMarking(false); }
  }

  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated || loading) return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const gridCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

  return (
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6 theme-calendar">
      <PageHeader tag="Consistency Engine" title="Study Consistency Calendar" subtitle="Log daily study activity and build unbroken fire streaks." />

      {/* Action Header */}
      <motion.div variants={item}>
        <GlassCard glowColor="emerald" className="p-6 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">{monthName}</span>
            <h3 className="font-heading text-xl font-bold text-white mt-0.5">Daily Streak Tracker</h3>
          </div>
          <NeonButton
            variant="solid"
            glowColor={todayMarked ? "purple" : "emerald"}
            disabled={todayMarked || !token}
            onClick={() => void handleMarkToday()}
            loading={marking}
          >
            {todayMarked ? (
              <span className="flex items-center gap-2"><Check size={16} /> Today Marked Active</span>
            ) : (
              <span className="flex items-center gap-2"><Flame size={16} /> Check In Today (+30 XP)</span>
            )}
          </NeonButton>
        </GlassCard>
      </motion.div>

      {/* Interactive Calendar Grid */}
      <motion.div variants={item}>
        <GlassCard glowColor="purple" className="p-6 border-purple-500/25">
          <div className="grid grid-cols-7 gap-2 text-center mb-3">
            {dayNames.map((d) => (
              <div key={d} className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((dayNum, i) => {
              if (dayNum === null) {
                return <div key={`empty-${i}`} className="h-12 rounded-lg bg-purple-950/5" />;
              }

              const dateStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const isDone = completedDates.has(dateStr);

              return (
                <div
                  key={dateStr}
                  className={`flex h-12 flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                    isDone
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : isToday
                        ? "border-purple-400 bg-purple-600/30 text-white font-bold animate-pulse"
                        : "border-purple-500/20 bg-purple-950/20 text-purple-300/70"
                  }`}
                >
                  <span>{dayNum}</span>
                  {isDone && <Check size={12} className="text-emerald-400 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
