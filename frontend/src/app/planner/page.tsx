"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarDays, Clock3, Layers3, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function loadPlanner() {
      try {
        const examList = await listExams();
        const suggestedExam =
          examList.find((exam) =>
            user?.exam
              ? exam.name.toLowerCase().includes(user.exam.toLowerCase())
              : false,
          ) || examList[0];

        const livePlans = token ? await getPlans(token) : demoPlans;

        if (!active) {
          return;
        }

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
              ? "Live planner ready. Generate a plan and tasks will be distributed automatically."
              : "Planner is in preview mode. Sign in to save a real study plan.",
          );
        });
      } catch (error) {
        if (!active) {
          return;
        }

        startTransition(() => {
          setPlans(demoPlans);
          setStatus(
            error instanceof Error
              ? `Planner fallback active: ${error.message}`
              : "Planner fallback active.",
          );
        });
      }
    }

    void loadPlanner();

    return () => {
      active = false;
    };
  }, [token, user, hasHydrated, startTransition]);

  function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function getPlanId(plan: StudyPlanSummary) {
    return plan.id || plan._id || "";
  }

  async function handleGenerate() {
    if (!token) {
      setStatus("Sign in from Profile to generate and persist a live plan.");
      return;
    }

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
      setStatus(
        error instanceof Error ? error.message : "Plan generation failed.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          Planner engine
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Build the next study cycle
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
          {status}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-300">
              Target exam
              <select
                value={form.examId}
                onChange={(event) => updateField("examId", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              >
                {exams.map((exam) => (
                  <option key={exam.slug} value={exam.slug} className="bg-black">
                    {exam.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-gray-300">
              Class / batch
              <input
                value={form.className}
                onChange={(event) => updateField("className", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-gray-300">
              Total days
              <input
                type="number"
                min={1}
                max={365}
                value={form.totalDays}
                onChange={(event) =>
                  updateField("totalDays", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-gray-300">
              Hours per day
              <input
                type="number"
                min={1}
                max={16}
                step="0.5"
                value={form.hoursPerDay}
                onChange={(event) =>
                  updateField("hoursPerDay", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-gray-300">
              Revision cycle
              <input
                type="number"
                min={0}
                max={30}
                value={form.revisionInterval}
                onChange={(event) =>
                  updateField("revisionInterval", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-gray-300">
              Rest day interval
              <input
                type="number"
                min={0}
                max={14}
                value={form.restDayInterval}
                onChange={(event) =>
                  updateField("restDayInterval", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-gray-300 md:col-span-2">
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <NeonButton onClick={() => void handleGenerate()}>
              <Zap size={16} />
              {isPending ? "Generating..." : "Generate live plan"}
            </NeonButton>
            <NeonButton variant="outline" glowColor="cyan">
              <Layers3 size={16} />
              Auto-distribute tasks
            </NeonButton>
          </div>
        </GlassCard>

        <div className="space-y-6">
          {lastCreated && (
            <GlassCard className="p-5">
              <div className="text-sm font-semibold text-cyan-300">
                Latest generated plan
              </div>
              <div className="mt-3 text-xl font-black text-white">
                {lastCreated.title}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Study days
                  </div>
                  <div className="mt-2 text-xl font-bold text-white">
                    {lastCreated.stats?.totalStudyDays || "-"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Revision
                  </div>
                  <div className="mt-2 text-xl font-bold text-white">
                    {lastCreated.stats?.totalRevisionDays || 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Hours
                  </div>
                  <div className="mt-2 text-xl font-bold text-white">
                    {lastCreated.stats?.totalStudyHours || "-"}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Existing plans</div>
              <span className="text-xs text-gray-400">{plans.length} total</span>
            </div>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id || plan._id || plan.title}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <div className="text-sm font-semibold text-white">{plan.title}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {plan.config?.totalDays || "-"} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      {plan.config?.hoursPerDay || "-"} h/day
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-primary">
                      {plan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
