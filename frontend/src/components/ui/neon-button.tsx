"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "outline" | "ghost";
  glowColor?: "primary" | "orange" | "pink" | "cyan";
  children: React.ReactNode;
}

export function NeonButton({ 
  variant = "primary", 
  glowColor = "primary", 
  className, 
  children, 
  ...props 
}: NeonButtonProps) {
  
  const baseStyles = "px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: {
      primary: "bg-primary text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]",
      orange: "bg-[#F59E0B] text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.8)]",
      pink: "bg-[#EC4899] text-white hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)]",
      cyan: "bg-[#22D3EE] text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]",
    },
    outline: {
      primary: "border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
      orange: "border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      pink: "border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899]/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
      cyan: "border-2 border-[#22D3EE] text-[#22D3EE] hover:bg-[#22D3EE]/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    },
    ghost: {
      primary: "text-gray-300 hover:text-primary hover:bg-white/5",
      orange: "text-gray-300 hover:text-[#F59E0B] hover:bg-white/5",
      pink: "text-gray-300 hover:text-[#EC4899] hover:bg-white/5",
      cyan: "text-gray-300 hover:text-[#22D3EE] hover:bg-white/5",
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant][glowColor], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
