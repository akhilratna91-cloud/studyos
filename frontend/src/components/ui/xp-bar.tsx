"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface XpBarProps {
  xp: number;
  level: number;
  className?: string;
}

export function XpBar({ xp, level, className }: XpBarProps) {
  // Simple calculation: 500 XP per level.
  const currentLevelXp = xp % 500;
  const targetXp = 500;
  const progressPercent = (currentLevelXp / targetXp) * 100;

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 text-xs font-bold font-mono shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            LVL {level}
          </div>
          <span className="text-gray-400 text-sm font-medium">Novice Scholar</span>
        </div>
        <span className="text-primary text-xs font-bold tracking-widest">{currentLevelXp} / {targetXp} XP</span>
      </div>
      
      {/* Track */}
      <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="h-full bg-gradient-to-r from-green-500 to-green-300 relative"
        >
          {/* Shine effect */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
          />
        </motion.div>
      </div>
    </div>
  );
}
