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
      className="space-y-6"
    >
      {/* ─── Hero ─── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/[0.08] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent-cyan/[0.06] blur-[60px]" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
            {/* Left Column — Text & Progress */}
            <div className="space-y-6">
              <div>
                <h1 className="font-editorial text-2xl font-bold uppercase tracking-wider text-white">
                  Welcome back, {user?.displayName || "Scholar"}
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 italic">
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
                      <Zap size={13} /> Try Demo
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

              <XpBar xp={xp} level={level} />
            </div>

            {/* Right Column — 3D Globe center panel */}
            <div className="relative flex h-60 w-full items-center justify-center lg:h-64">
              <ThreeDModel />
              
              {/* Floating API status */}
              <div className="absolute right-0 top-0 flex items-center gap-2 rounded-[2px] border border-white/10 bg-black/60 px-3 py-1">
                <div className={`h-1.5 w-1.5 rounded-full ${health ? "bg-white" : "bg-accent-red"}`} />
                <span className="font-editorial text-[9px] text-gray-400 font-semibold tracking-wider uppercase">
                  {health ? "link // active" : "offline"}
                </span>
              </div>
            </div>
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
            <h3 className="font-editorial mb-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
              [ 01 // PERFORMANCE VELOCITY ]
            </h3>
            <div className="min-h-[250px] flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "2px",
                      fontSize: "11px",
                      fontFamily: "var(--font-editorial)"
                    }}
                    itemStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#525252"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    className="font-editorial"
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
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
          <GlassCard variant="default" className="relative overflow-hidden p-5">
            <div className="relative z-10">
              <div className="font-editorial mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                [ 02 // AI COACH INSIGHT ]
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                {analytics?.weak_chapters?.length
                  ? <>Focus on <span className="font-semibold text-white border-b border-dashed border-white/40">{analytics.weak_chapters[0]}</span> — your accuracy needs improvement here.</>
                  : "Keep up the momentum! Your consistency is building real skill."}
              </p>
              <NeonButton
                variant="ghost"
                glowColor="cyan"
                className="mt-4 w-full bg-white/5 border border-white/10 text-[10px]"
                onClick={() => router.push("/coach")}
              >
                View full analysis <ChevronRight size={12} />
              </NeonButton>
            </div>
          </GlassCard>

          {/* Today&rsquo;s Tasks */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-editorial text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                [ 03 // TODAY&apos;S PROTOCOL ]
              </h3>
              <span className="font-editorial rounded-[2px] border border-white/10 bg-white/5 px-2.5 py-0.5 text-[9px] text-gray-400">
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
                    className={`group flex items-center gap-3 rounded-[2px] border p-3 transition-all duration-200 ${
                      isCompleted
                        ? "border-white/10 bg-white/[0.02]"
                        : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.01]"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[2px] border ${
                        isCompleted
                          ? "border-white bg-white text-black"
                          : "border-gray-600"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 size={10} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isCompleted ? "text-gray-600 line-through" : "text-gray-300"
                        }`}
                      >
                        {task.chapterName}
                      </div>
                      <div className="font-editorial text-[9px] text-gray-500">
                        {task.subjectName} • {task.durationMinutes}m
                      </div>
                    </div>
                  </div>
                );
              })}

              {todayTasks.length === 0 && (
                <div className="font-editorial rounded-[2px] border border-dashed border-white/[0.08] p-4 text-center text-xs text-gray-500">
                  No tasks today. Generate a plan first!
                </div>
              )}
            </div>

            {todayTasks.length > 0 && (
              <NeonButton
                variant="ghost"
                glowColor="primary"
                className="mt-3 w-full text-[10px]"
                onClick={() => router.push("/today")}
              >
                View all tasks <ChevronRight size={12} />
              </NeonButton>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
