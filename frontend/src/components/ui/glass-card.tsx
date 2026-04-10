"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "orange" | "pink" | "cyan";
  hoverLift?: boolean;
}

export function GlassCard({ children, className, glowColor, hoverLift = true, ...props }: GlassCardProps) {
  const glowVariants = {
    primary: "hover:shadow-neon-primary hover:border-primary/50",
    orange: "hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:border-[#F59E0B]/50",
    pink: "hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:border-[#EC4899]/50",
    cyan: "hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:border-[#22D3EE]/50",
  };

  return (
    <motion.div
      whileHover={hoverLift ? { y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-panel transition-all duration-300",
        glowColor && glowVariants[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
