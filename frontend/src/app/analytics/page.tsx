"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Activity, Brain, ShieldCheck, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { getAnalytics, getTaskStats, type AnalyticsSnapshot, type UserTaskStats } from "@/lib/api";
import { demoAnalytics } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

export default function AnalyticsPage() {
  const { token, hasHydrated } = useUserStore();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [taskStats, setTaskStats] = useState<UserTaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function load() {
      try {
        if (token) {
          const [a, t] = await Promise.all([getAnalytics(token), getTaskStats(token)]);
          if (active) { setAnalytics(a); setTaskStats(t); }
        } else {
          setAnalytics(demoAnalytics);
        }
      } catch {
        if (active) setAnalytics(demoAnalytics);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated || loading) return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;

  return (
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6">
      <PageHeader tag="Intelligence hub" title="Analytics" subtitle="Track your performance, identify patterns, and optimize your study approach." />

      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<ShieldCheck size={18} />} label="Accuracy" value={analytics?.accuracy || 0} suffix="%" color="primary" />
        <StatCard icon={<Target size={18} />} label="Progress" value={analytics?.progress || 0} suffix="%" color="cyan" />
        <StatCard icon={<Activity size={18} />} label="Tasks Done" value={taskStats?.completedTasks || 0} color="emerald" />
        <StatCard icon={<Brain size={18} />} label="Study Hours" value={(taskStats?.completedHours || 0).toFixed(1)} suffix="hrs" color="amber" />
      </motion.div>

      {/* Weak chapters */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Weak Areas — Focus Here</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(analytics?.weak_chapters || []).map((ch) => (
              <div key={ch} className="rounded-xl border border-accent-red/20 bg-accent-red/[0.05] p-4">
                <div className="text-sm font-semibold text-white">{ch}</div>
                <div className="mt-1 text-[10px] text-accent-red">Needs attention</div>
              </div>
            ))}
            {(!analytics?.weak_chapters || analytics.weak_chapters.length === 0) && (
              <div className="col-span-full rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-sm text-gray-500">
                No weak areas detected. Keep going!
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Overall stats */}
      {taskStats && (
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Overall Statistics</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Total Tasks</div>
                <div className="mt-1 text-2xl font-black text-white">{taskStats.totalTasks}</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Completion Rate</div>
                <div className="mt-1 text-2xl font-black text-accent-emerald">{taskStats.completionRate}%</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Skipped</div>
                <div className="mt-1 text-2xl font-black text-accent-amber">{taskStats.skippedTasks}</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
