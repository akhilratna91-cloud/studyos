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
  primary: "bg-white text-black hover:bg-white/90 border border-white",
  cyan: "bg-white/90 text-black hover:bg-white/80 border border-white/90",
  magenta: "bg-white/85 text-black hover:bg-white/75 border border-white/85",
  amber: "bg-white/95 text-black hover:bg-white/85 border border-white/95",
};

const outlineBorder: Record<GlowColor, string> = {
  primary: "border-white/20 text-white hover:bg-white/5",
  cyan: "border-white/25 text-white hover:bg-white/5",
  magenta: "border-white/15 text-white hover:bg-white/5",
  amber: "border-white/30 text-white hover:bg-white/5",
};

const ghostColor: Record<GlowColor, string> = {
  primary: "text-white hover:bg-white/5",
  cyan: "text-white hover:bg-white/5",
  magenta: "text-white hover:bg-white/5",
  amber: "text-white hover:bg-white/5",
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
    "relative inline-flex items-center justify-center gap-2 rounded-[4px] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none overflow-hidden";

  const variantStyles: Record<ButtonVariant, string> = {
    solid: solidBg[glowColor],
    outline: `border ${outlineBorder[glowColor]} bg-transparent`,
    ghost: `${ghostColor[glowColor]} bg-transparent`,
    danger:
      "bg-orange-600 text-white hover:bg-orange-700 border border-orange-600",
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
