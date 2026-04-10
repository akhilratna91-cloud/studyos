"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Activity,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { getAnalytics, getTaskStats, getTodayDashboard, type AnalyticsSnapshot, type UserTaskStats } from "@/lib/api";
import { demoAnalytics, demoDashboard } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

export default function AnalyticsPage() {
  const { token, hasHydrated } = useUserStore();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(demoAnalytics);
  const [taskStats, setTaskStats] = useState<UserTaskStats>(demoDashboard.overall);
  const [revisionDue, setRevisionDue] = useState(demoDashboard.revision.dueCount);
  const [status, setStatus] = useState("Loading analytics...");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function load() {
      if (!token) {
        startTransition(() => {
          setAnalytics(demoAnalytics);
          setTaskStats(demoDashboard.overall);
          setRevisionDue(demoDashboard.revision.dueCount);
          setStatus("Demo analytics loaded. Sign in to pull live precision metrics.");
        });
        return;
      }

      try {
        const [analyticsResult, statsResult, dashboardResult] = await Promise.all([
          getAnalytics(token),
          getTaskStats(token),
          getTodayDashboard(token),
        ]);

        if (!active) {
          return;
        }

        startTransition(() => {
          setAnalytics(analyticsResult);
          setTaskStats(statsResult);
          setRevisionDue(dashboardResult.revision.dueCount);
          setStatus("Live analytics synced from quizzes, tasks and revision load.");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        startTransition(() => {
          setAnalytics(demoAnalytics);
          setTaskStats(demoDashboard.overall);
          setRevisionDue(demoDashboard.revision.dueCount);
          setStatus(
            error instanceof Error
              ? `Live analytics unavailable: ${error.message}`
              : "Live analytics unavailable.",
          );
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token, hasHydrated, startTransition]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          Performance intelligence
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Read the pattern, not just the score
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{status}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5" glowColor="primary">
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldCheck size={16} />
            Accuracy
          </div>
          <div className="mt-3 text-3xl font-black text-white">{analytics.accuracy}%</div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="cyan">
          <div className="flex items-center gap-2 text-sm text-cyan-300">
            <TrendingUp size={16} />
            Completion
          </div>
          <div className="mt-3 text-3xl font-black text-white">{taskStats.completionRate}%</div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="orange">
          <div className="flex items-center gap-2 text-sm text-orange-300">
            <Gauge size={16} />
            Completed hours
          </div>
          <div className="mt-3 text-3xl font-black text-white">{taskStats.completedHours}</div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="pink">
          <div className="flex items-center gap-2 text-sm text-pink-400">
            <Activity size={16} />
            Revision due
          </div>
          <div className="mt-3 text-3xl font-black text-white">{revisionDue}</div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-6">
          <div className="text-sm font-semibold text-white">Weak chapters</div>
          <div className="mt-4 space-y-3">
            {analytics.weak_chapters.map((chapter, index) => (
              <div
                key={chapter}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{chapter}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Priority rank #{index + 1}
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-primary" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-sm font-semibold text-white">Coach summary</div>
          <p className="mt-4 text-sm leading-6 text-gray-300">
            Accuracy is strongest when completion discipline stays above 70%. Use the weak chapter list as your recovery stack, then revisit this panel after two focused sessions.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
