"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, type Variants } from "framer-motion";
import { CalendarDays, Clock3, Zap, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import {
  generatePlan,
  generateTasksFromPlan,
  getPlans,
  listExams,
  type ExamSummary,
  type StudyPlanSummary,
} from "@/lib/api";
import { demoPlans } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

type PlanForm = {
  examId: string;
  className: string;
  totalDays: number;
  hoursPerDay: number;
  revisionInterval: number;
  restDayInterval: number;
  startDate: string;
};

const defaultForm: PlanForm = {
  examId: "",
  className: "12",
  totalDays: 90,
  hoursPerDay: 4,
  revisionInterval: 7,
  restDayInterval: 0,
  startDate: new Date().toISOString().split("T")[0],
};

export default function PlannerPage() {
  const { token, user, hasHydrated, addXp } = useUserStore();
  const [form, setForm] = useState<PlanForm>(defaultForm);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [plans, setPlans] = useState<StudyPlanSummary[]>(demoPlans);
  const [status, setStatus] = useState("Loading planner modules...");
  const [lastCreated, setLastCreated] = useState<StudyPlanSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function loadPlanner() {
      try {
        const examList = await listExams();
        const suggestedExam =
          examList.find((exam) =>
            user?.exam ? exam.name.toLowerCase().includes(user.exam.toLowerCase()) : false,
          ) || examList[0];

        const livePlans = token ? await getPlans(token) : demoPlans;

        if (!active) return;

        startTransition(() => {
          setExams(examList);
          setPlans(livePlans);
          setForm((current) => ({
            ...current,
            examId: current.examId || suggestedExam?.slug || "",
            className: user?.className || current.className,
          }));
          setStatus(
            token
              ? "Live AI Planner ready. Custom plan generation will auto-distribute daily learning tasks."
              : "Planner in preview mode. Sign in to persist custom study plans.",
          );
        });
      } catch (error) {
        if (!active) return;
        startTransition(() => {
          setPlans(demoPlans);
          setStatus(error instanceof Error ? `Planner fallback: ${error.message}` : "Planner fallback active.");
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPlanner();
    return () => { active = false; };
  }, [token, user, hasHydrated, startTransition]);

  function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function getPlanId(plan: StudyPlanSummary) {
    return plan.id || plan._id || "";
  }

  async function handleGenerate() {
    if (!token) {
      setStatus("Sign in from Profile to generate and save live plans.");
      return;
    }

    setGenerating(true);
    try {
      const plan = await generatePlan(token, form);
      const planId = getPlanId(plan);

      if (planId) {
        const taskResult = await generateTasksFromPlan(token, planId);
        setStatus(taskResult.message);
      }

      const refreshedPlans = await getPlans(token);
      setPlans(refreshedPlans);
      setLastCreated(plan);
      addXp(200);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Plan generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (!hasHydrated || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6 theme-planner">
      <PageHeader tag="AI Plan Matrix (Red & Green Blend)" title="Build Custom Study Cycle" subtitle={status} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Form */}
        <motion.div variants={itemVariants}>
          <GlassCard glowColor="emerald" className="p-6 border-red-500/30">
            <div className="flex items-center gap-2 mb-4 font-heading text-xs font-bold uppercase tracking-wider text-red-400">
              <Sparkles size={16} className="text-emerald-400" /> Plan Parameters (Red & Green)
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-purple-200">
                Target Exam
                <select value={form.examId} onChange={(e) => updateField("examId", e.target.value)} className="select-orbital mt-2">
                  {exams.map((exam) => (
                    <option key={exam.slug} value={exam.slug} className="bg-[#0E0919]">{exam.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Class / Grade Batch
                <input value={form.className} onChange={(e) => updateField("className", e.target.value)} className="input-orbital mt-2" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Total Horizon (Days)
                <input type="number" min={1} max={365} value={form.totalDays} onChange={(e) => updateField("totalDays", Number(e.target.value))} className="input-orbital mt-2" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Daily Commitment (Hours)
                <input type="number" min={1} max={16} step="0.5" value={form.hoursPerDay} onChange={(e) => updateField("hoursPerDay", Number(e.target.value))} className="input-orbital mt-2" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Revision Interval (Days)
                <input type="number" min={0} max={30} value={form.revisionInterval} onChange={(e) => updateField("revisionInterval", Number(e.target.value))} className="input-orbital mt-2" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Rest Day Interval
                <input type="number" min={0} max={14} value={form.restDayInterval} onChange={(e) => updateField("restDayInterval", Number(e.target.value))} className="input-orbital mt-2" />
              </label>

              <label className="text-xs font-semibold text-purple-200 md:col-span-2">
                Start Date
                <input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className="input-orbital mt-2" />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <NeonButton variant="solid" glowColor="purple" className="w-full text-xs" onClick={() => void handleGenerate()} loading={generating || isPending}>
                <Zap size={16} /> Generate AI Plan (+200 XP)
              </NeonButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Results & Existing Plans */}
        <motion.div variants={itemVariants} className="space-y-4">
          {lastCreated && (
            <GlassCard glowColor="emerald" className="p-5 border-emerald-500/30">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Newly Generated Plan</div>
              <div className="mt-2 text-lg font-bold text-white text-gradient-emerald-purple">{lastCreated.title}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Study Days", value: lastCreated.stats?.totalStudyDays || "-" },
                  { label: "Revision", value: lastCreated.stats?.totalRevisionDays || 0 },
                  { label: "Total Hours", value: lastCreated.stats?.totalStudyHours || "-" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                    <div className="text-[10px] font-mono uppercase text-emerald-300">{stat.label}</div>
                    <div className="mt-1 text-lg font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard glowColor="purple" className="p-5 border-purple-500/25">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-purple-300">Active Study Cycles</div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{plans.length} Total</span>
            </div>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id || plan._id || plan.title} className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4 transition-all hover:border-purple-400/40">
                  <div className="text-sm font-semibold text-white">{plan.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-purple-200/80">
                    <span className="flex items-center gap-1"><CalendarDays size={13} className="text-emerald-400" />{plan.config?.totalDays || "-"} days</span>
                    <span className="flex items-center gap-1"><Clock3 size={13} className="text-purple-400" />{plan.config?.hoursPerDay || "-"} h/day</span>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-300">{plan.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
