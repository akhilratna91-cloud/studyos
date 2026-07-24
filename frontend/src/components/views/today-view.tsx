"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2, Circle, Clock3, FastForward, Flame, PlayCircle, Zap, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import {
  getTodayDashboard,
  updateTaskStatus,
  type DailyTaskItem,
  type TodayDashboard,
  type TaskStatus,
} from "@/lib/api";
import { demoDashboard } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

function getId(item: { id?: string; _id?: string }) {
  return item.id || item._id || "";
}

const statusConfig: Record<TaskStatus, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: "text-purple-400", label: "Pending" },
  "in-progress": { icon: PlayCircle, color: "text-cyan-400", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Done" },
  skipped: { icon: FastForward, color: "text-amber-400", label: "Skipped" },
};

export default function TodayView() {
  const { token, hasHydrated, addXp } = useUserStore();
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function load() {
      try {
        if (token) {
          const result = await getTodayDashboard(token);
          if (active) setDashboard(result);
        } else {
          setDashboard(demoDashboard);
        }
      } catch {
        if (active) setDashboard(demoDashboard);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  async function handleStatusChange(task: DailyTaskItem, status: TaskStatus) {
    if (!token) return;
    const taskId = getId(task);
    if (!taskId) return;

    try {
      await updateTaskStatus(token, taskId, status);
      if (status === "completed") addXp(50);

      const refreshed = await getTodayDashboard(token);
      setDashboard(refreshed);
    } catch {
      // silently fail
    }
  }

  const tasks = dashboard?.today?.tasks || [];
  const progress = dashboard?.today?.progress;
  const completionPercent = progress?.completionRate || 0;
  const revisionCards = dashboard?.revision?.cards || [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  if (!hasHydrated || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6 theme-today">
      <PageHeader
        tag="Execution Flow (Green & Lime Blend)"
        title="Today's Mission Protocol"
        subtitle={dashboard?.motivation || "Execute with laser focus. Every task unlocks XP and mastery."}
      />

      {/* Progress Card */}
      <motion.div variants={itemVariants}>
        <GlassCard glowColor="emerald" className="p-6 sm:p-8 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="font-mono text-xs font-semibold text-lime-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <Zap size={15} className="text-emerald-400" /> Daily Completion Target (Green & Lime)
              </span>
              <h3 className="font-heading text-3xl font-extrabold text-white bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                {completionPercent}% Completed
              </h3>
              <p className="text-xs text-emerald-100/80">
                {progress?.completed || 0} of {progress?.totalTasks || tasks.length} daily study modules finished
              </p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-purple-900/40"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${completionPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-heading text-lg font-bold text-emerald-300">{completionPercent}%</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Task List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <ShieldCheck size={16} /> Targeted Modules ({tasks.length})
        </h3>

        <div className="grid gap-3">
          {tasks.map((task) => {
            const taskId = getId(task);
            const status = task.status || "pending";
            const Config = statusConfig[status];

            return (
              <GlassCard
                key={taskId}
                glowColor={status === "completed" ? "emerald" : "purple"}
                className={`p-4 transition-all duration-300 ${
                  status === "completed"
                    ? "border-emerald-500/30 bg-emerald-950/20"
                    : "border-purple-500/20 hover:border-emerald-400/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleStatusChange(task, status === "completed" ? "pending" : "completed")}
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                        status === "completed"
                          ? "border-emerald-400 bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                          : "border-purple-400/50 bg-purple-900/30 hover:border-emerald-400"
                      }`}
                    >
                      <Config.icon size={14} className={status === "completed" ? "text-black" : Config.color} />
                    </button>
                    <div>
                      <h4 className={`text-sm font-semibold ${status === "completed" ? "line-through text-purple-300/50" : "text-white"}`}>
                        {task.chapterName}
                      </h4>
                      <div className="font-mono mt-1 flex flex-wrap items-center gap-3 text-[11px] text-purple-300/70">
                        <span className="text-emerald-400 font-semibold">{task.subjectName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock3 size={12} /> {task.durationMinutes} mins</span>
                        <span>•</span>
                        <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{task.type || "study"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {status !== "completed" && (
                      <NeonButton
                        variant="solid"
                        glowColor="emerald"
                        className="text-[11px] py-1.5 px-3"
                        onClick={() => handleStatusChange(task, "completed")}
                      >
                        Mark Done (+50 XP)
                      </NeonButton>
                    )}
                    {status === "completed" && (
                      <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Flame size={14} /> Done
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>

      {/* Revision Section */}
      {revisionCards.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3 pt-4">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <Flame size={16} className="text-amber-400" /> Active Revision Cards
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {revisionCards.map((card, i) => (
              <GlassCard key={i} glowColor="purple" className="p-4 border-purple-500/30">
                <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider mb-1">
                  {card.subjectName}
                </div>
                <h5 className="text-xs font-bold text-white mb-2">{card.chapterName}</h5>
                <p className="text-xs text-purple-200/80">Difficulty: {card.difficulty || "medium"}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
