"use client";

import { cn } from "@/lib/utils";

interface OrbitLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const dotSizeMap = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3 w-3",
};

export function OrbitLoader({ size = "md", className }: OrbitLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeMap[size])}>
        {/* Orbit ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-primary/30 animate-orbit",
          )}
        />
        {/* Orbiting dot */}
        <div
          className="absolute inset-0 animate-orbit"
          style={{ animationDuration: "1.5s" }}
        >
          <div
            className={cn(
              "absolute -top-[3px] left-1/2 -translate-x-1/2 rounded-full bg-primary shadow-neon-primary",
              dotSizeMap[size],
            )}
          />
        </div>
        {/* Center pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "rounded-full bg-primary-light/60 animate-pulse-glow",
              dotSizeMap[size],
            )}
          />
        </div>
      </div>
    </div>
  );
}
