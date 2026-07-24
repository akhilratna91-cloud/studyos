"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Activity, Brain, ShieldCheck, Target, Sparkles } from "lucide-react";
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
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6 theme-analytics">
      <PageHeader tag="Intelligence Hub" title="Performance Analytics" subtitle="Track your accuracy, identify weak areas, and optimize your study velocity." />

      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<ShieldCheck size={18} className="text-emerald-400" />} label="Accuracy" value={analytics?.accuracy || 0} suffix="%" color="emerald" />
        <StatCard icon={<Target size={18} className="text-purple-400" />} label="Progress" value={analytics?.progress || 0} suffix="%" color="purple" />
        <StatCard icon={<Activity size={18} className="text-cyan-400" />} label="Tasks Done" value={taskStats?.completedTasks || 0} color="cyan" />
        <StatCard icon={<Brain size={18} className="text-amber-400" />} label="Study Hours" value={(taskStats?.completedHours || 0).toFixed(1)} suffix="hrs" color="amber" />
      </motion.div>

      {/* Weak chapters */}
      <motion.div variants={item}>
        <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
          <h3 className="font-heading mb-4 text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <Sparkles size={16} className="text-pink-400" /> Focus Target Areas
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(analytics?.weak_chapters || []).map((ch) => (
              <div key={ch} className="rounded-lg border border-purple-500/30 bg-purple-950/30 p-4 transition-all hover:border-purple-400/50">
                <div className="text-sm font-semibold text-white">{ch}</div>
                <div className="font-mono mt-1 text-[10px] text-pink-300">Needs Dedicated Revision</div>
              </div>
            ))}
            {(!analytics?.weak_chapters || analytics.weak_chapters.length === 0) && (
              <div className="font-mono col-span-full rounded-lg border border-dashed border-purple-500/20 p-6 text-center text-xs text-purple-300/70">
                No weak chapters detected. Exceptional performance!
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Overall stats */}
      {taskStats && (
        <motion.div variants={item}>
          <GlassCard glowColor="emerald" className="p-6 border-emerald-500/30">
            <h3 className="font-heading mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">Overall Task Execution</h3>
            <div className="grid gap-4 sm:grid-cols-3 font-mono">
              <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4">
                <div className="text-[10px] uppercase text-purple-300">Total Assigned Tasks</div>
                <div className="font-heading mt-1 text-2xl font-bold text-white">{taskStats.totalTasks}</div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-4">
                <div className="text-[10px] uppercase text-emerald-400">Completion Rate</div>
                <div className="font-heading mt-1 text-2xl font-bold text-emerald-300">{taskStats.completionRate}%</div>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
                <div className="text-[10px] uppercase text-amber-300">Skipped Modules</div>
                <div className="font-heading mt-1 text-2xl font-bold text-amber-400">{taskStats.skippedTasks}</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
