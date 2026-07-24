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
  const [quote, setQuote] = useState("Keep pushing forward. Every rep builds real skill.");
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
    <motion.div initial="hidden" animate="show" variants={v} className="space-y-6 theme-coach">
      <PageHeader tag="AI Guidance Engine" title="AI Study Coach" subtitle="Personalized insights, weakness targeting, and motivational fuel." />

      {/* Motivation card */}
      <motion.div variants={item}>
        <GlassCard glowColor="purple" className="relative overflow-hidden p-6 sm:p-8 border-purple-500/30">
          <Sparkles className="absolute -right-6 -top-6 h-28 w-28 text-purple-500/10" />
          <div className="relative z-10">
            <div className="mb-2 text-xs font-heading font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Sparkles size={15} /> Daily Mindset Fuel
            </div>
            <p className="text-lg font-medium leading-relaxed text-purple-100 italic">&ldquo;{quote}&rdquo;</p>
            <NeonButton variant="outline" glowColor="purple" className="mt-4 text-xs" onClick={() => void refreshQuote()} loading={refreshing}>
              <RefreshCw size={14} /> Refresh Motivation Quote
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weak chapters */}
        <motion.div variants={item}>
          <GlassCard glowColor="emerald" className="p-6 h-full border-emerald-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-emerald-400" />
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400">Target Weak Areas</h3>
            </div>
            {advice?.weak_chapters && advice.weak_chapters.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {advice.weak_chapters.map((ch) => (
                  <div key={ch} className="rounded-lg border border-purple-500/30 bg-purple-950/30 p-4">
                    <div className="text-sm font-semibold text-white">{ch}</div>
                    <div className="text-[10px] text-pink-300 mt-1">High priority practice chapter</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-mono rounded-lg border border-dashed border-emerald-500/20 p-6 text-center text-xs text-emerald-300/70">
                {token ? "No weak chapters detected. Great job!" : "Sign in to activate AI weakness analysis."}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Advice */}
        <motion.div variants={item}>
          <GlassCard glowColor="purple" className="p-6 h-full border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-amber-400" />
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-purple-300">AI Recommendations</h3>
            </div>
            {advice?.advice && advice.advice.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {advice.advice.map((tip, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-purple-500/20 bg-purple-950/20 p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-400/40">
                      {i + 1}
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-mono rounded-lg border border-dashed border-purple-500/20 p-6 text-center text-xs text-purple-300/70">
                {token ? advice?.message || "Continue completing daily tasks to unlock personalized advice." : "Sign in for AI recommendations."}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
