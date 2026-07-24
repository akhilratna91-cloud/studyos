"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline" | "ghost" | "danger" | "emerald" | "purple";
type GlowColor = "primary" | "cyan" | "magenta" | "amber" | "emerald" | "purple";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  glowColor?: GlowColor;
  loading?: boolean;
}

const solidBg: Record<GlowColor, string> = {
  primary: "bg-gradient-to-r from-emerald-500 via-purple-600 to-emerald-500 bg-[length:200%_auto] text-white hover:bg-[position:right_center] shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/40",
  emerald: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50",
  purple: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50",
  cyan: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300",
  magenta: "bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-400",
  amber: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300",
};

const outlineBorder: Record<GlowColor, string> = {
  primary: "border-purple-500/40 text-purple-200 hover:bg-purple-500/10 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  emerald: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  purple: "border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  cyan: "border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10",
  magenta: "border-pink-500/40 text-pink-300 hover:bg-pink-500/10",
  amber: "border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
};

const ghostColor: Record<GlowColor, string> = {
  primary: "text-purple-300 hover:text-emerald-300 hover:bg-white/5",
  emerald: "text-emerald-300 hover:bg-emerald-500/10",
  purple: "text-purple-300 hover:bg-purple-500/10",
  cyan: "text-cyan-300 hover:bg-cyan-500/10",
  magenta: "text-pink-300 hover:bg-pink-500/10",
  amber: "text-amber-300 hover:bg-amber-500/10",
};

export function NeonButton({
  children,
  className,
  variant = "solid",
  glowColor = "primary",
  loading = false,
  disabled,
  ...props
}: NeonButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.97] active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none overflow-hidden backdrop-blur-md cursor-pointer";

  const variantStyles: Record<ButtonVariant, string> = {
    solid: solidBg[glowColor],
    emerald: solidBg["emerald"],
    purple: solidBg["purple"],
    outline: `border ${outlineBorder[glowColor]} bg-transparent`,
    ghost: `${ghostColor[glowColor]} bg-transparent`,
    danger:
      "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
  };

  return (
    <button
      className={cn(base, variantStyles[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-75"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
