"use client";

export { default } from "@/components/views/today-view";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Play, CheckCircle2, Pause, SkipForward, X, Sparkles } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import confetti from "canvas-confetti";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TodayPage() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { addXp } = useUserStore();

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22C55E', '#F59E0B', '#22D3EE', '#EC4899']
    });
    addXp(150);
    setIsFocusMode(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Today&apos;s Protocol</h1>
          <p className="text-gray-400">2 tasks remaining to keep your streak.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* Circular progress */}
           <div className="relative w-14 h-14">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
               <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset="50" className="text-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono">66%</div>
           </div>
        </div>
      </div>

      {/* Main Task Card */}
      <GlassCard className="p-8 relative overflow-hidden" hoverLift={false}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-primary font-bold tracking-wider mb-2 uppercase">UP NEXT</div>
            <h2 className="text-2xl font-bold text-white mb-2">Physics: Electrostatics PYQs</h2>
            <p className="text-gray-400 text-sm max-w-lg mb-6">Solve the last 5 years of JEE Advanced questions focusing heavily on Gauss&apos;s Law and equipotential surfaces.</p>
            <div className="flex gap-3">
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-orange-400">120 mins</span>
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-cyan-400 font-bold">+150 XP</span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              onClick={() => setIsFocusMode(true)}
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary shadow-neon-primary text-primary hover:bg-primary hover:text-black transition-colors"
            >
              <Play size={32} className="ml-2" />
            </button>
          </motion.div>
        </div>
      </GlassCard>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[100] bg-base flex flex-col justify-center items-center"
          >
            {/* Ambient Background Particles (Simulation via blur) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[200px] -z-10 animate-pulse" />
            
            <button 
              onClick={() => setIsFocusMode(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            >
              <X size={32} />
            </button>

            {/* Timer */}
            <div className="text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary drop-shadow-[0_0_40px_rgba(34,197,94,0.4)] tabular-nums tracking-tighter">
              45:00
            </div>
            
            {/* Current Target */}
            <GlassCard className="mt-12 p-6 max-w-2xl w-full text-center border-primary/30" hoverLift={false}>
              <div className="text-primary text-sm font-bold tracking-widest mb-2 flex items-center justify-center gap-2">
                <Sparkles size={16} /> FOCUSING ON
              </div>
              <h2 className="text-2xl font-bold text-white">Physics: Electrostatics PYQs</h2>
            </GlassCard>

            {/* Controls */}
            <div className="mt-16 flex gap-6">
              <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Pause size={24} />
              </button>
              <NeonButton 
                glowColor="primary" 
                onClick={handleComplete}
                className="h-16 px-12 text-xl font-black rounded-full"
              >
                <CheckCircle2 className="mr-2" /> Complete & Claim XP
              </NeonButton>
              <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <SkipForward size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
