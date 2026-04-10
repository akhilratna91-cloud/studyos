"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Activity,
  Brain,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { XpBar } from "@/components/ui/xp-bar";
import {
  getAnalytics,
  getHealth,
  getMotivation,
  getTodayDashboard,
  type AnalyticsSnapshot,
  type HealthStatus,
  type TodayDashboard,
} from "@/lib/api";
import {
  demoAnalytics,
  demoDashboard,
  demoWeeklyVelocity,
} from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

export default function DashboardHome() {
  const router = useRouter();
  const {
    xp,
    level,
    streak,
    disciplineScore,
    token,
    user,
    hasHydrated,
    demoMode,
    setGamification,
  } = useUserStore();
  const [dashboard, setDashboard] = useState<TodayDashboard>(demoDashboard);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(demoAnalytics);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [statusNote, setStatusNote] = useState("Loading your control room...");
  const [isChartReady, setIsChartReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsChartReady(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function loadDashboard() {
      try {
        const [healthResult, motivationResult] = await Promise.all([
          getHealth(),
          getMotivation(),
        ]);

        let nextDashboard: TodayDashboard = {
          ...demoDashboard,
          motivation: motivationResult.quote,
        };
        let nextAnalytics: AnalyticsSnapshot = demoAnalytics;
        let nextStatus = "Demo mode is active. Sign in to sync your real plan and tasks.";

        if (token) {
          const [dashboardResult, analyticsResult] = await Promise.all([
            getTodayDashboard(token),
            getAnalytics(token),
          ]);

          nextDashboard = {
            ...dashboardResult,
            motivation: motivationResult.quote || dashboardResult.motivation,
          };
          nextAnalytics = analyticsResult;
          nextStatus = "Live data connected to your StudyOS backend.";
        }

        if (!active) {
          return;
        }

        startTransition(() => {
          setHealth(healthResult);
          setDashboard(nextDashboard);
          setAnalytics(nextAnalytics);
          setStatusNote(nextStatus);
          setGamification({
            disciplineScore: Math.max(
              45,
              Math.min(
                98,
                Math.round(
                  (nextDashboard.today.progress.completionRate + nextAnalytics.accuracy) / 2,
                ),
              ),
            ),
          });
        });
      } catch (error) {
        if (!active) {
          return;
        }

        startTransition(() => {
          setHealth(null);
          setDashboard(demoDashboard);
          setAnalytics(demoAnalytics);
          setStatusNote(
            error instanceof Error
              ? `Backend unreachable. Showing demo mode instead: ${error.message}`
              : "Backend unreachable. Showing demo mode instead.",
          );
        });
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [token, hasHydrated, setGamification, startTransition]);

  const displayName = user?.displayName || user?.email.split("@")[0] || "Scholar";
  const nextWeakTopic = analytics.weak_chapters[0];
  const activePlan = dashboard.plans[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
            Study Control Room
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {dashboard.greeting}, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
            {dashboard.motivation}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <NeonButton
            variant="outline"
            glowColor="cyan"
            onClick={() => router.push("/coach")}
          >
            <Sparkles size={16} />
            Ask AI Coach
          </NeonButton>
          <NeonButton glowColor="primary" onClick={() => router.push("/today")}>
            <Zap size={16} />
            Start Today
          </NeonButton>
        </div>
      </div>

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">System status</div>
            <div className="mt-1 text-sm text-gray-400">{statusNote}</div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
              {health ? `API: ${health.environment}` : "API: offline"}
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              {demoMode ? "Mode: demo" : "Mode: live"}
            </span>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-300">
              {streak} day streak
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Zap className="text-primary" size={18} />
              XP and level
            </h2>
            <span className="text-sm text-gray-400">
              {dashboard.today.progress.completed} of {dashboard.today.progress.totalTasks} tasks closed
            </span>
          </div>
          <XpBar xp={xp} level={level} />
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5" glowColor="orange">
          <div className="flex items-center gap-2 text-sm text-orange-300">
            <Clock3 size={16} />
            Study hours
          </div>
          <div className="mt-3 text-3xl font-black text-white">
            {dashboard.overall.completedHours}
            <span className="ml-1 text-sm font-medium text-gray-500">hrs</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Total tracked workload {dashboard.overall.totalHours} hrs
          </div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="cyan">
          <div className="flex items-center gap-2 text-sm text-cyan-300">
            <Target size={16} />
            Completion
          </div>
          <div className="mt-3 text-3xl font-black text-white">
            {dashboard.today.progress.completionRate}
            <span className="ml-1 text-sm font-medium text-gray-500">%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-black/50">
            <div
              className="h-2 rounded-full bg-cyan-400"
              style={{ width: `${dashboard.today.progress.completionRate}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="primary">
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldCheck size={16} />
            Accuracy
          </div>
          <div className="mt-3 text-3xl font-black text-white">
            {analytics.accuracy}
            <span className="ml-1 text-sm font-medium text-gray-500">%</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Progress map is currently at {analytics.progress}%
          </div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="pink">
          <div className="flex items-center gap-2 text-sm text-pink-400">
            <Activity size={16} />
            Discipline
          </div>
          <div className="mt-3 text-3xl font-black text-white">
            {disciplineScore}
            <span className="ml-1 text-sm font-medium text-gray-500">/100</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Weak topic watch: {nextWeakTopic || "No major red flag"}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <GlassCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Weekly rhythm
              </div>
              <div className="mt-1 text-lg font-bold text-white">
                Momentum curve
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {isPending ? "Refreshing..." : "Last synced just now"}
            </div>
          </div>
          <div className="h-72 w-full">
            {isChartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoWeeklyVelocity}>
                  <defs>
                    <linearGradient id="study-velocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#6b7280" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#050505",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#22C55E"
                    strokeWidth={3}
                    fill="url(#study-velocity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-white/8 bg-white/4 text-sm text-gray-500">
                Preparing momentum curve...
              </div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Brain size={16} />
              AI recommendation
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              {nextWeakTopic
                ? `Push ${nextWeakTopic} to the top of today's stack. Accuracy data says this is where the next jump will come from.`
                : "Your weak-topic pressure is low right now. Use today for a timed recap and one clean mock review."}
            </p>
            <div className="mt-5">
              <NeonButton
                variant="ghost"
                glowColor="cyan"
                className="w-full bg-cyan-500/10"
                onClick={() => router.push("/coach")}
              >
                <Sparkles size={16} />
                Open AI Coach
              </NeonButton>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Today&apos;s execution</div>
              <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-400">
                {dashboard.today.progress.pending + dashboard.today.progress.inProgress} left
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {dashboard.today.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id || task.chapterName}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {task.chapterName}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {task.subjectName} | {task.durationMinutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">
                      <CheckCircle2 size={12} />
                      {task.status}
                    </div>
                  </div>
                </div>
              ))}

              {dashboard.today.tasks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-gray-400">
                  No tasks queued yet. Generate a plan to start your daily execution system.
                </div>
              )}
            </div>
          </GlassCard>

          {activePlan && (
            <GlassCard className="p-5">
              <div className="text-sm font-semibold text-white">Active plan</div>
              <div className="mt-3 text-lg font-bold text-primary">{activePlan.title}</div>
              <div className="mt-2 text-sm text-gray-400">
                Day {activePlan.currentDay} of {activePlan.totalDays} | {activePlan.daysRemaining} days left
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}

