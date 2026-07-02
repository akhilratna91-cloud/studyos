"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatColor = "primary" | "cyan" | "magenta" | "amber" | "emerald" | "red";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  color?: StatColor;
  className?: string;
}

const iconBg: Record<StatColor, string> = {
  primary: "bg-primary/15 text-primary-light",
  cyan: "bg-accent-cyan/15 text-accent-cyan",
  magenta: "bg-accent-magenta/15 text-accent-magenta",
  amber: "bg-accent-amber/15 text-accent-amber",
  emerald: "bg-accent-emerald/15 text-accent-emerald",
  red: "bg-accent-red/15 text-accent-red",
};

const glowShadow: Record<StatColor, string> = {
  primary: "hover:shadow-neon-primary",
  cyan: "hover:shadow-neon-cyan",
  magenta: "hover:shadow-neon-magenta",
  amber: "hover:shadow-neon-amber",
  emerald: "hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
  red: "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
};

export function StatCard({
  icon,
  label,
  value,
  suffix,
  trend,
  trendUp,
  color = "primary",
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 transition-all duration-500 hover:translate-y-[-3px] hover:bg-white/[0.06] hover:border-white/[0.12]",
        glowShadow[color],
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn("rounded-lg p-2", iconBg[color])}>
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-white">{value}</span>
        {suffix && (
          <span className="text-sm font-medium text-gray-500">{suffix}</span>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            "mt-2 text-xs font-medium",
            trendUp ? "text-accent-emerald" : "text-accent-red",
          )}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </motion.div>
  );
}
