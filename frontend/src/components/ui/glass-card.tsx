"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "orbital" | "highlight";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  glowColor?: "primary" | "cyan" | "magenta" | "amber" | "emerald" | "red";
  onClick?: () => void;
  style?: React.CSSProperties;
}

const glowMap: Record<string, string> = {
  primary: "hover:shadow-neon-primary",
  cyan: "hover:shadow-neon-cyan",
  magenta: "hover:shadow-neon-magenta",
  amber: "hover:shadow-neon-amber",
  emerald: "hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
  red: "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
};

const borderGlowMap: Record<string, string> = {
  primary: "hover:border-primary/30",
  cyan: "hover:border-accent-cyan/30",
  magenta: "hover:border-accent-magenta/30",
  amber: "hover:border-accent-amber/30",
  emerald: "hover:border-accent-emerald/30",
  red: "hover:border-accent-red/30",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  glowColor = "primary",
  onClick,
  style,
}: GlassCardProps) {
  const baseStyles =
    "rounded-[4px] border border-white/[0.08] bg-[#121212] transition-all duration-500";

  const variantStyles: Record<CardVariant, string> = {
    default: "",
    elevated:
      "hover:translate-y-[-2px] hover:bg-[#161616] hover:border-white/[0.18]",
    orbital: "animate-float",
    highlight: "gradient-border",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        glowMap[glowColor],
        borderGlowMap[glowColor],
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      {children}
    </div>
  );
}
