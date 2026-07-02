"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CalendarDays, Check } from "lucide-react";
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
      addXp(25);
      const refreshed = await getCalendar(token);
      setCalendar(refreshed);
    } catch { /* fallback */ }
    finally { setMarking(false); }
  }

  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated || loading) return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;

  return (
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6">
      <PageHeader
        tag="Consistency tracker"
        title="Study Calendar"
        subtitle="Mark each day you studied. Build an unbreakable streak."
        action={
          token && !todayMarked ? (
            <NeonButton onClick={() => void handleMarkToday()} loading={marking}>
              <CalendarDays size={16} /> Mark Today
            </NeonButton>
          ) : todayMarked ? (
            <div className="flex items-center gap-2 rounded-xl border border-accent-emerald/20 bg-accent-emerald/10 px-4 py-2 text-sm text-accent-emerald">
              <Check size={16} /> Today marked!
            </div>
          ) : undefined
        }
      />

      <motion.div variants={item}>
        <GlassCard className="p-6">
          <h3 className="mb-6 text-center font-[family-name:var(--font-heading)] text-lg font-bold text-white">{monthName}</h3>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const isCompleted = completedDates.has(dateStr);

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCompleted
                      ? "bg-primary/20 text-primary-light border border-primary/30 shadow-neon-primary"
                      : isToday
                        ? "border border-accent-cyan/30 text-accent-cyan bg-accent-cyan/[0.05]"
                        : "text-gray-500 hover:bg-white/[0.04]"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : day}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
              <div className="text-2xl font-black text-primary-light">{completedDates.size}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Days Studied</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
              <div className="text-2xl font-black text-accent-amber">{calendar.length}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Records</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center sm:col-span-1 col-span-2">
              <div className="text-2xl font-black text-accent-emerald">{daysInMonth > 0 ? Math.round((completedDates.size / daysInMonth) * 100) : 0}%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">This Month</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
