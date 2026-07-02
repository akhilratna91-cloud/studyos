"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2, Circle, Clock3, FastForward, Flame, PlayCircle } from "lucide-react";
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
  pending: { icon: Circle, color: "text-gray-500", label: "Pending" },
  "in-progress": { icon: PlayCircle, color: "text-accent-cyan", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-accent-emerald", label: "Done" },
  skipped: { icon: FastForward, color: "text-accent-amber", label: "Skipped" },
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
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      <PageHeader
        tag="Execution engine"
        title="Today's Mission"
        subtitle={dashboard?.motivation || "Execute with precision. Every task matters."}
      />

      {/* Progress overview */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Circular progress */}
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="url(#progressGrad)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completionPercent / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-white">{completionPercent}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Daily Progress</div>
                <div className="mt-1 text-xs text-gray-400">
                  {progress?.completed || 0} of {progress?.totalTasks || 0} tasks completed
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 text-center">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="text-lg font-black text-white">{progress?.totalMinutes || 0}</div>
                <div className="text-[10px] text-gray-500">Total min</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="text-lg font-black text-accent-emerald">{progress?.completed || 0}</div>
                <div className="text-[10px] text-gray-500">Done</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="text-lg font-black text-accent-amber">{progress?.pending || 0}</div>
                <div className="text-[10px] text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Tasks list */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Task Queue</h3>
          {tasks.map((task) => {
            const taskId = getId(task) || task.chapterName;
            const config = statusConfig[task.status];
            const StatusIcon = config.icon;

            return (
              <GlassCard key={taskId} variant="elevated" className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${task.status === "completed" ? "text-gray-500 line-through" : "text-white"}`}>
                      {task.chapterName}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366F1" }} />
                        {task.subjectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={10} />
                        {task.durationMinutes}m
                      </span>
                      <span className={`rounded-full border px-1.5 py-0.5 ${
                        task.status === "completed" ? "border-accent-emerald/20 text-accent-emerald" :
                        task.status === "in-progress" ? "border-accent-cyan/20 text-accent-cyan" :
                        "border-white/[0.08] text-gray-500"
                      }`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {token && task.status !== "completed" && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      {task.status === "pending" && (
                        <NeonButton
                          variant="ghost"
                          glowColor="cyan"
                          className="text-[10px] px-2 py-1"
                          onClick={() => void handleStatusChange(task, "in-progress")}
                        >
                          Start
                        </NeonButton>
                      )}
                      <NeonButton
                        variant="ghost"
                        glowColor="primary"
                        className="text-[10px] px-2 py-1"
                        onClick={() => void handleStatusChange(task, "completed")}
                      >
                        Done
                      </NeonButton>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}

          {tasks.length === 0 && (
            <GlassCard className="p-8 text-center">
              <div className="text-gray-500 text-sm">No tasks for today. Go to Planner to generate a study plan.</div>
            </GlassCard>
          )}
        </motion.div>

        {/* Revision panel */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Revision Queue</h3>
          {revisionCards.length > 0 ? (
            revisionCards.map((card) => (
              <GlassCard key={card.id || card.chapterName} className="p-4" glowColor="amber">
                <div className="flex items-center gap-3">
                  <Flame size={16} className="text-accent-amber flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{card.chapterName}</div>
                    <div className="text-[10px] text-gray-500">{card.subjectName}</div>
                  </div>
                  {card.isWeak && (
                    <span className="rounded-full bg-accent-red/10 border border-accent-red/20 px-2 py-0.5 text-[10px] text-accent-red">
                      Weak
                    </span>
                  )}
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="p-6 text-center">
              <div className="text-sm text-gray-500">No revisions due today. Great work!</div>
            </GlassCard>
          )}

          {/* Plans summary */}
          {dashboard?.plans && dashboard.plans.length > 0 && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mt-6 mb-3">Active Plans</h3>
              {dashboard.plans.map((plan) => (
                <GlassCard key={plan.id || plan.title} className="p-4">
                  <div className="text-sm font-semibold text-white">{plan.title}</div>
                  <div className="mt-2 text-xs text-gray-400">
                    Day {plan.currentDay} of {plan.totalDays} • {plan.daysRemaining} days left
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </GlassCard>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
