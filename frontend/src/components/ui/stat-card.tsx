"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: string;
}

export function StatCard({
  icon,
  label,
  value,
  suffix,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group rounded-[4px] border border-white/[0.08] bg-[#121212] p-5 transition-all duration-400 hover:translate-y-[-1px] hover:border-white/[0.18]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="rounded-[4px] border border-white/10 bg-white/5 p-2 text-white">
          {icon}
        </div>
        <span className="font-editorial text-[9px] uppercase tracking-[0.15em] text-gray-500">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-editorial text-2xl font-bold text-white">{value}</span>
        {suffix && (
          <span className="font-editorial text-xs text-gray-500">{suffix}</span>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            "font-editorial mt-2 text-[9px] uppercase tracking-wider",
            trendUp ? "text-white" : "text-gray-500",
          )}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </motion.div>
  );
}
