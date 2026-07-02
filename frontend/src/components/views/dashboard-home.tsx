"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Activity,
  Brain,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { XpBar } from "@/components/ui/xp-bar";
import { StatCard } from "@/components/ui/stat-card";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import {
  demoLogin,
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
    setSession,
  } = useUserStore();

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [quote, setQuote] = useState("Stay disciplined. Your future self will thank you.");
  const [weeklyData, setWeeklyData] = useState(demoWeeklyVelocity);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    let active = true;

    async function load() {
      try {
        const [healthResult, motivationResult] = await Promise.all([
          getHealth(),
          getMotivation(),
        ]);

        if (!active) return;

        setHealth(healthResult);
        if (motivationResult?.quote) setQuote(motivationResult.quote);

        if (token) {
          const [dashboardResult, analyticsResult] = await Promise.all([
            getTodayDashboard(token),
            getAnalytics(token),
          ]);

          if (!active) return;

          setDashboard(dashboardResult);
          setAnalytics(analyticsResult);
        } else {
          setDashboard(demoDashboard);
          setAnalytics(demoAnalytics);
        }
      } catch {
        if (!active) return;
        setDashboard(demoDashboard);
        setAnalytics(demoAnalytics);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const result = await demoLogin();
      setSession(result);
    } catch {
      // silently fall back
    } finally {
      setDemoLoading(false);
    }
  }

  const todayTasks = dashboard?.today?.tasks || [];
  const todayProgress = dashboard?.today?.progress;
  const completionRate = todayProgress?.completionRate || 0;
  const studyHours = dashboard?.overall?.completedHours || 0;
  const accuracy = analytics?.accuracy || 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 24, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  if (!hasHydrated || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <OrbitLoader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* ─── Hero ─── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/[0.08] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent-cyan/[0.06] blur-[60px]" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-black tracking-tight text-white sm:text-4xl">
                Welcome back,{" "}
                <span className="text-gradient-primary">
                  {user?.displayName || "Scholar"}
                </span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 italic">
                &ldquo;{quote}&rdquo;
              </p>

              {demoMode && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <NeonButton
                    variant="outline"
                    glowColor="primary"
                    onClick={handleDemoLogin}
                    loading={demoLoading}
                  >
                    <Zap size={14} /> Try Demo
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    glowColor="cyan"
                    onClick={() => router.push("/profile")}
                  >
                    Sign in
                  </NeonButton>
                </div>
              )}
            </div>

            {/* API status */}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2">
              <div className={`h-2 w-2 rounded-full ${health ? "bg-accent-emerald shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-accent-red"}`} />
              <span className="text-xs text-gray-400">
                {health ? "Systems online" : "Connecting..."}
              </span>
            </div>
          </div>

          {/* XP bar */}
          <div className="relative z-10 mt-6">
            <XpBar xp={xp} level={level} />
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Clock3 size={18} />}
          label="Study Hours"
          value={studyHours.toFixed(1)}
          suffix="hrs"
          trend="Today"
          trendUp
          color="amber"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Completion"
          value={completionRate}
          suffix="%"
          color="cyan"
        />
        <StatCard
          icon={<ShieldCheck size={18} />}
          label="Accuracy"
          value={accuracy}
          suffix="%"
          color="primary"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="Discipline"
          value={disciplineScore}
          suffix="pts"
          color="magenta"
        />
      </motion.div>

      {/* ─── Chart + Side Panel ─── */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex h-full flex-col p-6">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Performance Velocity
            </h3>
            <div className="min-h-[250px] flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1128",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#818CF8", fontWeight: "bold" }}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#333"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* AI Recommendation */}
          <GlassCard variant="highlight" className="relative overflow-hidden p-5">
            <Sparkles className="absolute -right-4 -top-4 h-20 w-20 text-accent-magenta/[0.08]" />
            <div className="relative z-10">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gradient-cool">
                AI Coach Insight
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                {analytics?.weak_chapters?.length
                  ? <>Focus on <span className="font-semibold text-white border-b border-dashed border-accent-cyan/40">{analytics.weak_chapters[0]}</span> — your accuracy needs improvement here.</>
                  : "Keep up the momentum! Your consistency is building real skill."}
              </p>
              <NeonButton
                variant="ghost"
                glowColor="cyan"
                className="mt-4 w-full bg-accent-cyan/[0.06] text-xs"
                onClick={() => router.push("/coach")}
              >
                View full analysis <ChevronRight size={14} />
              </NeonButton>
            </div>
          </GlassCard>

          {/* Today&rsquo;s Tasks */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Today&apos;s Protocol</h3>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-gray-400">
                {todayTasks.filter((t) => t.status !== "completed").length} left
              </span>
            </div>

            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === "completed";
                const taskId = task.id || task._id || task.chapterName;

                return (
                  <div
                    key={taskId}
                    className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                      isCompleted
                        ? "border-primary/20 bg-primary/[0.04]"
                        : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                        isCompleted
                          ? "border-primary bg-primary text-white"
                          : "border-gray-600"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isCompleted ? "text-gray-500 line-through" : "text-gray-200"
                        }`}
                      >
                        {task.chapterName}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {task.subjectName} • {task.durationMinutes}m
                      </div>
                    </div>
                  </div>
                );
              })}

              {todayTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-sm text-gray-500">
                  No tasks today. Generate a plan first!
                </div>
              )}
            </div>

            {todayTasks.length > 0 && (
              <NeonButton
                variant="ghost"
                glowColor="primary"
                className="mt-3 w-full text-xs"
                onClick={() => router.push("/today")}
              >
                View all tasks <ChevronRight size={14} />
              </NeonButton>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
