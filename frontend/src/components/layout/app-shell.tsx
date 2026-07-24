"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Ambient3DBackground } from "@/components/ui/ambient-3d-bg";

export interface PageThemeConfig {
  className: string;
  primary: string;
  secondary: string;
  gradient: string;
  glowRgba: string;
  borderRgba: string;
  name: string;
}

export const PAGE_THEMES: Record<string, PageThemeConfig> = {
  "/": {
    className: "theme-dashboard",
    primary: "#ec4899", // Pink
    secondary: "#10b981", // Green
    gradient: "from-pink-500 to-emerald-500",
    glowRgba: "rgba(236, 72, 153, 0.25)",
    borderRgba: "rgba(16, 185, 129, 0.35)",
    name: "Pink & Green Blend",
  },
  "/today": {
    className: "theme-today",
    primary: "#10b981", // Green
    secondary: "#84cc16", // Lime
    gradient: "from-emerald-500 to-lime-500",
    glowRgba: "rgba(16, 185, 129, 0.25)",
    borderRgba: "rgba(132, 204, 22, 0.35)",
    name: "Green & Lime Blend",
  },
  "/planner": {
    className: "theme-planner",
    primary: "#ef4444", // Red
    secondary: "#10b981", // Green
    gradient: "from-red-500 to-emerald-500",
    glowRgba: "rgba(239, 68, 68, 0.25)",
    borderRgba: "rgba(16, 185, 129, 0.35)",
    name: "Red & Green Blend",
  },
  "/learn": {
    className: "theme-learn",
    primary: "#06b6d4", // Cyan
    secondary: "#10b981", // Emerald
    gradient: "from-cyan-500 to-emerald-500",
    glowRgba: "rgba(6, 182, 212, 0.25)",
    borderRgba: "rgba(16, 185, 129, 0.35)",
    name: "Cyan & Emerald Blend",
  },
  "/quiz": {
    className: "theme-quiz",
    primary: "#f97316", // Orange
    secondary: "#10b981", // Green
    gradient: "from-orange-500 to-emerald-500",
    glowRgba: "rgba(249, 115, 22, 0.25)",
    borderRgba: "rgba(16, 185, 129, 0.35)",
    name: "Orange & Green Blend",
  },
  "/pyq": {
    className: "theme-pyq",
    primary: "#10b981", // Emerald
    secondary: "#f59e0b", // Amber
    gradient: "from-emerald-500 to-amber-500",
    glowRgba: "rgba(16, 185, 129, 0.25)",
    borderRgba: "rgba(245, 158, 11, 0.35)",
    name: "Emerald & Amber Blend",
  },
  "/analytics": {
    className: "theme-analytics",
    primary: "#6366f1", // Indigo
    secondary: "#a855f7", // Purple
    gradient: "from-indigo-500 to-purple-500",
    glowRgba: "rgba(99, 102, 241, 0.25)",
    borderRgba: "rgba(168, 85, 247, 0.35)",
    name: "Indigo & Purple Blend",
  },
  "/coach": {
    className: "theme-coach",
    primary: "#ef4444", // Red
    secondary: "#ec4899", // Pink
    gradient: "from-red-500 to-pink-500",
    glowRgba: "rgba(239, 68, 68, 0.25)",
    borderRgba: "rgba(236, 72, 153, 0.35)",
    name: "Red & Pink Blend",
  },
  "/sessions": {
    className: "theme-sessions",
    primary: "#8b5cf6", // Purple
    secondary: "#f43f5e", // Rose
    gradient: "from-purple-500 to-rose-500",
    glowRgba: "rgba(139, 92, 246, 0.25)",
    borderRgba: "rgba(244, 63, 94, 0.35)",
    name: "Purple & Rose Blend",
  },
  "/calendar": {
    className: "theme-calendar",
    primary: "#14b8a6", // Teal
    secondary: "#a855f7", // Purple
    gradient: "from-teal-500 to-purple-500",
    glowRgba: "rgba(20, 184, 166, 0.25)",
    borderRgba: "rgba(168, 85, 247, 0.35)",
    name: "Teal & Purple Blend",
  },
  "/profile": {
    className: "theme-profile",
    primary: "#10b981", // Emerald
    secondary: "#8b5cf6", // Purple
    gradient: "from-emerald-500 to-purple-600",
    glowRgba: "rgba(16, 185, 129, 0.25)",
    borderRgba: "rgba(139, 92, 246, 0.35)",
    name: "Emerald & Purple Blend",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentTheme = PAGE_THEMES[pathname] || PAGE_THEMES["/"];

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-orbital transition-colors duration-700",
        currentTheme.className,
      )}
    >
      {/* Ambient 3D Interactive Particle Background - Adapts to Page Color Blend */}
      <Ambient3DBackground
        primaryColor={currentTheme.primary}
        secondaryColor={currentTheme.secondary}
      />

      <Sidebar activeTheme={currentTheme} />

      <div className="relative flex min-h-screen flex-col md:ml-[4.5rem] lg:ml-64 z-10">
        <Topbar activeTheme={currentTheme} />

        <main className="relative z-10 flex-1 px-4 pb-24 pt-24 sm:px-6 lg:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
