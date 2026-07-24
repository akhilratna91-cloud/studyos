"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Activity,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ShieldCheck,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { XpBar } from "@/components/ui/xp-bar";
import { ThreeDModel } from "@/components/ui/threed-model";
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
    disciplineScore,
    token,
    user,
    hasHydrated,
    demoMode,
    setSession,
  } = useUserStore();

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [quote, setQuote] = useState("Stay disciplined. Your future self will thank you.");
  const [weeklyData] = useState(demoWeeklyVelocity);
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
      className="space-y-6 theme-dashboard"
    >
      {/* ─── Hero Card ─── */}
      <motion.div variants={itemVariants}>
        <GlassCard glowColor="dual" className="relative overflow-hidden p-6 sm:p-8 border-purple-500/30">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/15 blur-[60px]" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-center">
            {/* Left Column — Text & Progress */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                    AI Flow OS v1.0.2 Matrix
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white text-gradient-emerald-purple">
                  Welcome back, {user?.displayName || "Scholar"}
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-purple-200/80 italic font-medium">
                  &ldquo;{quote}&rdquo;
                </p>

                {demoMode && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <NeonButton
                      variant="solid"
                      glowColor="emerald"
                      onClick={handleDemoLogin}
                      loading={demoLoading}
                    >
                      <Zap size={13} /> Try Live Demo Mode
                    </NeonButton>
                    <NeonButton
                      variant="outline"
                      glowColor="purple"
                      onClick={() => router.push("/profile")}
                    >
                      Account Sign In
                    </NeonButton>
                  </div>
                )}
              </div>

              <XpBar xp={xp} level={level} />
            </div>

            {/* Right Column — Interactive 3D Globe */}
            <div className="relative flex h-60 w-full items-center justify-center lg:h-64">
              <ThreeDModel />
              
              {/* Floating Status Pill */}
              <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3 py-1 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <div className={`h-2 w-2 rounded-full ${health ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
                <span className="font-mono text-[9px] text-emerald-300 font-semibold tracking-wider uppercase">
                  {health ? "System Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Clock3 size={18} className="text-emerald-400" />}
          label="Study Hours"
          value={studyHours.toFixed(1)}
          suffix="hrs"
          trend="Today"
          trendUp
          color="emerald"
        />
        <StatCard
          icon={<Target size={18} className="text-purple-400" />}
          label="Completion"
          value={completionRate}
          suffix="%"
          color="purple"
        />
        <StatCard
          icon={<ShieldCheck size={18} className="text-cyan-400" />}
          label="Accuracy"
          value={accuracy}
          suffix="%"
          color="cyan"
        />
        <StatCard
          icon={<Activity size={18} className="text-emerald-400" />}
          label="Discipline"
          value={disciplineScore}
          suffix="pts"
          color="emerald"
        />
      </motion.div>

      {/* ─── Chart + Side Panel ─── */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard glowColor="emerald" className="flex h-full flex-col p-6 border-emerald-500/25">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Activity size={15} /> Weekly Velocity Graph
              </h3>
              <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Score Matrix
              </span>
            </div>
            
            <div className="min-h-[250px] flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorScoreGreenPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E0919",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#F3F4F6"
                    }}
                    itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#9CA3AF"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    className="font-mono"
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScoreGreenPurple)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* AI Recommendation */}
          <GlassCard glowColor="purple" className="relative overflow-hidden p-5 border-purple-500/30">
            <div className="relative z-10">
              <div className="font-heading mb-3 text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Sparkles size={15} className="text-purple-400" /> AI Coach Advice
              </div>
              <p className="text-xs leading-relaxed text-purple-100/90 font-medium">
                {analytics?.weak_chapters?.length
                  ? <>Target <span className="font-bold text-emerald-300 border-b border-dashed border-emerald-400">{analytics.weak_chapters[0]}</span> today to boost your accuracy and master weak spots.</>
                  : "Excellent streak! Keep building consistent study momentum."}
              </p>
              <NeonButton
                variant="outline"
                glowColor="purple"
                className="mt-4 w-full text-xs"
                onClick={() => router.push("/coach")}
              >
                View AI Coach Insights <ChevronRight size={14} />
              </NeonButton>
            </div>
          </GlassCard>

          {/* Today's Tasks Protocol */}
          <GlassCard glowColor="emerald" className="p-5 border-emerald-500/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400">
                Today&apos;s Protocol
              </h3>
              <span className="font-mono rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                {todayTasks.filter((t) => t.status !== "completed").length} Tasks Left
              </span>
            </div>

            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === "completed";
                const taskId = task.id || task._id || task.chapterName;

                return (
                  <div
                    key={taskId}
                    className={`group flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 ${
                      isCompleted
                        ? "border-purple-500/20 bg-purple-950/20 opacity-75"
                        : "border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-400/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isCompleted
                          ? "border-emerald-400 bg-emerald-500 text-black"
                          : "border-purple-400/60 bg-purple-900/30"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isCompleted ? "text-purple-300/50 line-through" : "text-white"
                        }`}
                      >
                        {task.chapterName}
                      </div>
                      <div className="font-mono text-[10px] text-purple-300/70">
                        {task.subjectName} • {task.durationMinutes} mins
                      </div>
                    </div>
                  </div>
                );
              })}

              {todayTasks.length === 0 && (
                <div className="font-mono rounded-lg border border-dashed border-purple-500/30 p-4 text-center text-xs text-purple-300">
                  No active tasks yet. Generate your study plan to start!
                </div>
              )}
            </div>

            {todayTasks.length > 0 && (
              <NeonButton
                variant="solid"
                glowColor="emerald"
                className="mt-4 w-full text-xs"
                onClick={() => router.push("/today")}
              >
                Execute Today Tasks <ChevronRight size={14} />
              </NeonButton>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
