"use client";

import { type ReactNode, useState, useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "orbital" | "highlight" | "emerald" | "purple";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  glowColor?: "primary" | "cyan" | "magenta" | "amber" | "emerald" | "purple" | "dual";
  onClick?: () => void;
  style?: React.CSSProperties;
  enableTilt?: boolean;
}

const glowMap: Record<string, string> = {
  primary: "hover:shadow-[0_15px_35px_-10px_rgba(168,85,247,0.35),0_0_20px_rgba(16,185,129,0.25)]",
  cyan: "hover:shadow-[0_15px_35px_-10px_rgba(6,182,212,0.4)]",
  magenta: "hover:shadow-[0_15px_35px_-10px_rgba(236,72,153,0.4)]",
  amber: "hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.4)]",
  emerald: "hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.4)]",
  purple: "hover:shadow-[0_15px_35px_-10px_rgba(168,85,247,0.4)]",
  dual: "hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.4),0_0_30px_rgba(16,185,129,0.3)]",
};

const borderGlowMap: Record<string, string> = {
  primary: "hover:border-purple-500/40",
  cyan: "hover:border-cyan-500/40",
  magenta: "hover:border-pink-500/40",
  amber: "hover:border-amber-500/40",
  emerald: "hover:border-emerald-500/40",
  purple: "hover:border-purple-500/40",
  dual: "hover:border-emerald-400/50",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  glowColor = "dual",
  onClick,
  style,
  enableTilt = true,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6; // max 6deg tilt
    const rotY = ((x - centerX) / centerX) * 6;

    setRotateX(rotX);
    setRotateY(rotY);
    setMousePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const baseStyles =
    "relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E0919]/70 backdrop-blur-xl transition-all duration-300 preserve-3d";

  const variantStyles: Record<CardVariant, string> = {
    default: "",
    elevated:
      "hover:translate-y-[-4px] hover:bg-[#160F26]/80 hover:border-purple-500/30",
    orbital: "animate-float",
    highlight: "border-emerald-500/30 bg-[#0E0919]/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    emerald: "border-emerald-500/25 bg-[#081812]/70 hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    purple: "border-purple-500/25 bg-[#160F26]/70 hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
      style={{
        ...style,
        transform: enableTilt ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined,
      }}
    >
      {/* 3D Glass Radial Light Highlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(168, 85, 247, 0.12), transparent 80%)`,
        }}
      />
      
      {/* Dynamic Glass Top Highlight Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-purple-500/30" />

      {children}
    </div>
  );
}
