"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline" | "ghost" | "danger";
type GlowColor = "primary" | "cyan" | "magenta" | "amber";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  glowColor?: GlowColor;
  loading?: boolean;
}

const solidBg: Record<GlowColor, string> = {
  primary: "bg-gradient-to-r from-primary to-primary-light text-white shadow-neon-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]",
  cyan: "bg-gradient-to-r from-accent-cyan to-cyan-300 text-gray-900 shadow-neon-cyan hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]",
  magenta: "bg-gradient-to-r from-accent-magenta to-pink-400 text-white shadow-neon-magenta hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]",
  amber: "bg-gradient-to-r from-accent-amber to-yellow-400 text-gray-900 shadow-neon-amber hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]",
};

const outlineBorder: Record<GlowColor, string> = {
  primary: "border-primary/40 text-primary hover:bg-primary/10 hover:shadow-neon-primary",
  cyan: "border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-neon-cyan",
  magenta: "border-accent-magenta/40 text-accent-magenta hover:bg-accent-magenta/10 hover:shadow-neon-magenta",
  amber: "border-accent-amber/40 text-accent-amber hover:bg-accent-amber/10 hover:shadow-neon-amber",
};

const ghostColor: Record<GlowColor, string> = {
  primary: "text-primary hover:bg-primary/10",
  cyan: "text-accent-cyan hover:bg-accent-cyan/10",
  magenta: "text-accent-magenta hover:bg-accent-magenta/10",
  amber: "text-accent-amber hover:bg-accent-amber/10",
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
    "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none overflow-hidden";

  const variantStyles: Record<ButtonVariant, string> = {
    solid: solidBg[glowColor],
    outline: `border ${outlineBorder[glowColor]} bg-transparent`,
    ghost: `${ghostColor[glowColor]} bg-transparent`,
    danger:
      "bg-gradient-to-r from-accent-red to-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
  };

  return (
    <button
      className={cn(base, variantStyles[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
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
