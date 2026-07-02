"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Brain, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import { getWeakAdvice, getMotivation, type WeakAdvice } from "@/lib/api";
import { useUserStore } from "@/store/user-store";

export default function CoachPage() {
  const { token, hasHydrated } = useUserStore();
  const [advice, setAdvice] = useState<WeakAdvice | null>(null);
  const [quote, setQuote] = useState("Keep pushing forward. Every rep counts.");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function load() {
      try {
        const [motivationResult, adviceResult] = await Promise.all([
          getMotivation(),
          token ? getWeakAdvice(token) : Promise.resolve(null),
        ]);
        if (!active) return;
        if (motivationResult?.quote) setQuote(motivationResult.quote);
        if (adviceResult) setAdvice(adviceResult);
      } catch {
        // fallback
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [hasHydrated, token]);

  async function refreshQuote() {
    setRefreshing(true);
    try {
      const result = await getMotivation();
      if (result?.quote) setQuote(result.quote);
    } catch {
      // keep existing
    } finally {
      setRefreshing(false);
    }
  }

  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated || loading) return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;

  return (
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6">
      <PageHeader tag="AI intelligence" title="AI Coach" subtitle="Personalized insights, weakness analysis, and motivational fuel." />

      {/* Motivation card */}
      <motion.div variants={item}>
        <GlassCard variant="highlight" className="relative overflow-hidden p-6 sm:p-8">
          <Sparkles className="absolute -right-6 -top-6 h-28 w-28 text-accent-magenta/[0.06]" />
          <div className="relative z-10">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gradient-cool">Daily Fuel</div>
            <p className="text-lg font-medium leading-relaxed text-gray-200 italic">&ldquo;{quote}&rdquo;</p>
            <NeonButton variant="ghost" glowColor="magenta" className="mt-4 text-xs" onClick={() => void refreshQuote()} loading={refreshing}>
              <RefreshCw size={14} /> New quote
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weak chapters */}
        <motion.div variants={item}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-accent-red" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Weak Areas</h3>
            </div>
            {advice?.weak_chapters && advice.weak_chapters.length > 0 ? (
              <div className="space-y-3">
                {advice.weak_chapters.map((ch) => (
                  <div key={ch} className="rounded-xl border border-accent-red/20 bg-accent-red/[0.05] p-4">
                    <div className="text-sm font-semibold text-white">{ch}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-sm text-gray-500">
                {token ? "No weak areas detected. Excellent!" : "Sign in to see personalized analysis."}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Advice */}
        <motion.div variants={item}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-accent-amber" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Recommendations</h3>
            </div>
            {advice?.advice && advice.advice.length > 0 ? (
              <div className="space-y-3">
                {advice.advice.map((tip, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-light">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-sm text-gray-500">
                {token ? advice?.message || "Keep studying to unlock personalized advice." : "Sign in for AI-powered recommendations."}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
