"use client";

import { motion } from "framer-motion";

interface XpBarProps {
  xp: number;
  level: number;
}

export function XpBar({ xp, level }: XpBarProps) {
  const xpInLevel = xp % 500;
  const percent = Math.min((xpInLevel / 500) * 100, 100);

  return (
    <div className="flex items-center gap-4">
      {/* Level badge */}
      <div className="relative flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-neon-primary">
          <span className="text-lg font-black text-white">{level}</span>
        </div>
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent-cyan animate-pulse-glow" />
      </div>

      {/* Bar */}
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-300">
            Level {level}
          </span>
          <span className="font-mono text-primary-light">
            {xp.toLocaleString()} XP
          </span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary-light to-accent-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* Glow edge */}
          <motion.div
            className="absolute top-0 h-full w-3 rounded-full bg-white/40 blur-[3px]"
            initial={{ left: 0 }}
            animate={{ left: `calc(${percent}% - 6px)` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1 text-[10px] text-gray-500">
          {500 - xpInLevel} XP to Level {level + 1}
        </div>
      </div>
    </div>
  );
}
