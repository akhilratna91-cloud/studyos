"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Brain, Flame, Sparkles, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { getMotivation, getWeakAdvice, type WeakAdvice } from "@/lib/api";
import { demoAnalytics } from "@/lib/demo-data";
import { useUserStore } from "@/store/user-store";

const demoAdvice: WeakAdvice = {
  message: "Coach is in demo mode right now, but the action logic is fully wired.",
  weak_chapters: demoAnalytics.weak_chapters,
  advice: [
    "Run one focused revision sprint on your weakest topic.",
    "Follow it with a short recap test.",
    "Close the day by updating your planner instead of letting skipped work pile up.",
  ],
};

export default function CoachPage() {
  const router = useRouter();
  const { token, hasHydrated } = useUserStore();
  const [quote, setQuote] = useState("Loading AI coach...");
  const [advice, setAdvice] = useState<WeakAdvice>(demoAdvice);
  const [status, setStatus] = useState("Preparing your next best move...");
  const [isPending, startTransition] = useTransition();

  const loadCoach = useCallback(async () => {
    try {
      const motivation = await getMotivation();
      const weakAdvice = token ? await getWeakAdvice(token) : demoAdvice;

      startTransition(() => {
        setQuote(motivation.quote);
        setAdvice(weakAdvice);
        setStatus(
          token
            ? "Live coach insights loaded from your current analytics."
            : "Coach is showing smart demo guidance until you sign in.",
        );
      });
    } catch (error) {
      startTransition(() => {
        setQuote("Keep moving. Progress compounds faster than doubt.");
        setAdvice(demoAdvice);
        setStatus(
          error instanceof Error
            ? `Coach fallback active: ${error.message}`
            : "Coach fallback active.",
        );
      });
    }
  }, [token, startTransition]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void loadCoach();
  }, [hasHydrated, loadCoach]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          AI coach
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Personal mentor mode
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{status}</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <Sparkles size={16} />
          Motivation pulse
        </div>
        <div className="mt-4 text-2xl font-black leading-tight text-white">
          {quote}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <NeonButton onClick={() => void loadCoach()}>
            <Brain size={16} />
            {isPending ? "Refreshing..." : "Refresh guidance"}
          </NeonButton>
          <NeonButton
            variant="outline"
            glowColor="cyan"
            onClick={() => router.push("/today")}
          >
            <Target size={16} />
            Open today&apos;s tasks
          </NeonButton>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-5">
          <div className="text-sm font-semibold text-white">Detected pressure points</div>
          <div className="mt-4 space-y-3">
            {advice.weak_chapters.map((chapter) => (
              <div
                key={chapter}
                className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-white"
              >
                {chapter}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-300">
            <Flame size={16} />
            Action board
          </div>
          <div className="mt-4 space-y-3">
            {advice.advice.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-6 text-gray-200"
              >
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
