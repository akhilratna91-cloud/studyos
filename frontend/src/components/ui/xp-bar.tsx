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
        <div className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-white/15 bg-white/5">
          <span className="font-editorial text-sm font-bold text-white">{level}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-editorial text-[10px] uppercase tracking-wider text-gray-400">
            level {level}
          </span>
          <span className="font-editorial text-[10px] text-white">
            {xp.toLocaleString()} xp
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-[1px] bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-[1px] bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="font-editorial mt-1 text-[9px] text-gray-500">
          {500 - xpInLevel} xp to level {level + 1}
        </div>
      </div>
    </div>
  );
}
