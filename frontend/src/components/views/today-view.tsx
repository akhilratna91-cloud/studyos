"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import {
  getTodayDashboard,
  updateTaskStatus,
  type DailyTaskItem,
  type TaskStatus,
  type TodayProgress,
} from "@/lib/api";
import { demoDashboard, demoTasks } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function computeProgress(tasks: DailyTaskItem[]): TodayProgress {
  const summary = tasks.reduce(
    (acc, task) => {
      acc.totalTasks += 1;
      acc.totalMinutes += task.durationMinutes;

      if (task.status === "completed") {
        acc.completed += 1;
        acc.completedMinutes += task.durationMinutes;
      }
      if (task.status === "pending") {
        acc.pending += 1;
      }
      if (task.status === "in-progress") {
        acc.inProgress += 1;
      }
      if (task.status === "skipped") {
        acc.skipped += 1;
      }

      return acc;
    },
    {
      totalTasks: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      skipped: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      completionRate: 0,
    },
  );

  summary.completionRate = summary.totalTasks
    ? Math.round((summary.completed / summary.totalTasks) * 100)
    : 0;

  return summary;
}

export default function TodayView() {
  const { token, hasHydrated, demoMode, addXp, incrementStreak } = useUserStore();
  const [tasks, setTasks] = useState<DailyTaskItem[]>(demoTasks);
  const [progress, setProgress] = useState<TodayProgress>(demoDashboard.today.progress);
  const [focusTask, setFocusTask] = useState<DailyTaskItem | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("Syncing your mission board...");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function loadTasks() {
      if (!token) {
        startTransition(() => {
          setTasks(demoTasks);
          setProgress(demoDashboard.today.progress);
          setMessage("Demo tasks loaded. Sign in to track your real execution.");
        });
        return;
      }

      try {
        const dashboard = await getTodayDashboard(token);

        if (!active) {
          return;
        }

        startTransition(() => {
          setTasks(dashboard.today.tasks);
          setProgress(dashboard.today.progress);
          setMessage("Live plan synced. Keep the chain moving.");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        startTransition(() => {
          setTasks(demoTasks);
          setProgress(demoDashboard.today.progress);
          setMessage(
            error instanceof Error
              ? `Live sync failed. Staying in demo mode: ${error.message}`
              : "Live sync failed. Staying in demo mode.",
          );
        });
      }
    }

    void loadTasks();

    return () => {
      active = false;
    };
  }, [token, hasHydrated, startTransition]);

  useEffect(() => {
    if (!focusTask) {
      return;
    }

    const focusMinutes = Math.min(25, Math.max(5, focusTask.durationMinutes));
    setSecondsLeft(focusMinutes * 60);
    setIsRunning(true);
  }, [focusTask]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          setMessage("Pomodoro complete. Capture the win and mark the task.");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  const nextTask = useMemo(
    () => tasks.find((task) => task.status !== "completed") || tasks[0] || null,
    [tasks],
  );

  const focusPercent = Math.min(100, Math.max(0, progress.completionRate));

  async function patchTask(task: DailyTaskItem, status: TaskStatus) {
    const taskId = task.id || task._id || "";

    if (token && taskId && !demoMode) {
      await updateTaskStatus(token, taskId, status);
    }

    setTasks((current) => {
      const updated = current.map((item) => {
        if ((item.id || item._id) === taskId || item.chapterName === task.chapterName) {
          return { ...item, status };
        }

        return item;
      });

      setProgress(computeProgress(updated));
      return updated;
    });
  }

  async function handleComplete(task: DailyTaskItem) {
    await patchTask(task, "completed");
    addXp(Math.max(50, Math.round(task.durationMinutes * 1.5)));
    incrementStreak();
    setFocusTask(null);
    setIsRunning(false);
    setMessage(`${task.chapterName} completed. XP claimed and streak protected.`);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#22C55E", "#22D3EE", "#F59E0B"],
    });
  }

  async function handleSkip(task: DailyTaskItem) {
    await patchTask(task, "skipped");
    setMessage(`${task.chapterName} skipped. Planner will need a recovery pass.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
            Today&apos;s execution
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
            Stay on protocol
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            {message}
          </p>
        </div>

        <GlassCard className="w-full max-w-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Progress
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {focusPercent}%
              </div>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * focusPercent) / 100}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {progress.completed}/{progress.totalTasks}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <GlassCard className="p-6" hoverLift={false}>
          {nextTask ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-primary">
                  Up next
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {nextTask.chapterName}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {nextTask.subjectName} | {nextTask.durationMinutes} minutes | {nextTask.status}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <NeonButton onClick={() => setFocusTask(nextTask)}>
                  <Play size={16} />
                  Launch focus mode
                </NeonButton>
                <NeonButton
                  variant="outline"
                  glowColor="cyan"
                  onClick={() => void handleComplete(nextTask)}
                >
                  <CheckCircle2 size={16} />
                  Complete now
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  glowColor="pink"
                  onClick={() => void handleSkip(nextTask)}
                >
                  <SkipForward size={16} />
                  Skip
                </NeonButton>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-400">
              No tasks exist yet. Generate a study plan to begin execution tracking.
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles size={16} className="text-cyan-300" />
            Today&apos;s workload
          </div>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id || task.chapterName}
                className="rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {task.chapterName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <Clock3 size={12} />
                      {task.subjectName} | {task.durationMinutes} min
                    </div>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-wide text-primary">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {focusTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base px-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_48%)]" />
          <button
            type="button"
            onClick={() => {
              setFocusTask(null);
              setIsRunning(false);
            }}
            className="absolute right-6 top-6 text-gray-400 transition-colors hover:text-white"
          >
            <X size={28} />
          </button>

          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.35em] text-primary/80">
              Focus mode
            </div>
            <div className="mt-4 text-[5rem] font-black leading-none text-white sm:text-[7rem]">
              {formatTimer(secondsLeft)}
            </div>
            <div className="mt-4 text-lg font-semibold text-white">
              {focusTask.chapterName}
            </div>
            <div className="mt-2 text-sm text-gray-400">{focusTask.subjectName}</div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              {isRunning ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <NeonButton onClick={() => void handleComplete(focusTask)}>
              <CheckCircle2 size={18} />
              Complete and claim XP
            </NeonButton>
            <button
              type="button"
              onClick={() => void handleSkip(focusTask)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              <SkipForward size={22} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

