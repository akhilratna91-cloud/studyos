"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  CalendarCheck,
  CalendarPlus,
  PlayCircle,
  Brain,
  FileText,
  BarChart3,
  Sparkles,
  Timer,
  Calendar,
  Flame,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home, themeColor: "from-pink-500 to-emerald-500" },
  { name: "Today", href: "/today", icon: CalendarCheck, themeColor: "from-emerald-500 to-lime-500" },
  { name: "Planner", href: "/planner", icon: CalendarPlus, themeColor: "from-red-500 to-emerald-500" },
  { name: "Learn", href: "/learn", icon: PlayCircle, themeColor: "from-cyan-500 to-emerald-500" },
  { name: "Quiz", href: "/quiz", icon: Brain, themeColor: "from-orange-500 to-emerald-500" },
  { name: "PYQ", href: "/pyq", icon: FileText, themeColor: "from-emerald-500 to-amber-500" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, themeColor: "from-indigo-500 to-purple-500" },
  { name: "AI Coach", href: "/coach", icon: Sparkles, themeColor: "from-red-500 to-pink-500" },
  { name: "Sessions", href: "/sessions", icon: Timer, themeColor: "from-purple-500 to-rose-500" },
  { name: "Calendar", href: "/calendar", icon: Calendar, themeColor: "from-teal-500 to-purple-500" },
  { name: "Profile", href: "/profile", icon: User, themeColor: "from-emerald-500 to-purple-600" },
];

import { type PageThemeConfig } from "@/components/layout/app-shell";

export function Sidebar({ activeTheme }: { activeTheme?: PageThemeConfig }) {
  const pathname = usePathname();
  const { streak, level, xp } = useUserStore();
  const [collapsed, setCollapsed] = useState(false);

  const activeColor = activeTheme?.primary || "#10b981";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen flex-col border-r bg-[#0E0919]/90 backdrop-blur-2xl transition-all duration-500 md:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
      style={{ borderColor: activeTheme?.borderRgba || "rgba(16,185,129,0.3)" }}
    >
      {/* Brand Logo */}
      <div className="flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-lg transition-colors duration-500"
            style={{
              borderColor: activeColor,
              boxShadow: `0 0 15px ${activeTheme?.glowRgba || "rgba(16,185,129,0.3)"}`,
            }}
          >
            <Zap size={20} style={{ color: activeColor }} className="animate-pulse" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span
                className="font-heading text-base font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${activeTheme?.primary || "#10b981"}, ${activeTheme?.secondary || "#a855f7"})`,
                }}
              >
                StudyOS
              </span>
              <span
                className="font-mono text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: activeColor }}
              >
                {activeTheme?.name || "v1.0.2 Matrix"}
              </span>
            </motion.div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-purple-400 transition-colors hover:bg-purple-500/10 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-gradient"
                  className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r opacity-20 border border-emerald-400/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
                    item.themeColor,
                  )}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 z-10",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "text-white font-semibold"
                    : "text-purple-300/70 hover:text-white hover:bg-purple-500/10",
                )}
              >
                <Icon
                  size={19}
                  className={cn(
                    "flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-emerald-400" : "text-purple-400/80",
                  )}
                />
                {!collapsed && (
                  <span className="text-xs uppercase tracking-wider font-heading">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Streak & XP Widget */}
      <div className={cn("p-3 mb-3", collapsed && "px-2")}>
        <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-emerald-950/20 to-purple-950/40 p-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Flame size={18} className="text-amber-400 animate-pulse" />
            </div>
            {!collapsed && (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-purple-300/70">
                  Daily Streak
                </div>
                <div className="font-heading flex items-baseline gap-1 font-bold text-white">
                  <span className="text-sm text-amber-300">{streak}</span>
                  <span className="text-[10px] font-normal text-purple-300/70">days fire</span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="font-mono mt-3 flex items-center justify-between text-[10px] font-medium text-emerald-400">
              <span>LVL {level}</span>
              <span className="text-purple-300">{xp.toLocaleString()} XP</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
