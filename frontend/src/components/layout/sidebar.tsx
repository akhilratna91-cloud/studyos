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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Today", href: "/today", icon: CalendarCheck },
  { name: "Planner", href: "/planner", icon: CalendarPlus },
  { name: "Learn", href: "/learn", icon: PlayCircle },
  { name: "Quiz", href: "/quiz", icon: Brain },
  { name: "PYQ", href: "/pyq", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Coach", href: "/coach", icon: Sparkles },
  { name: "Sessions", href: "/sessions", icon: Timer },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { streak, level, xp } = useUserStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-white/[0.06] bg-surface/90 backdrop-blur-2xl transition-all duration-300 md:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-neon-primary">
            <span className="text-sm font-black text-white">S</span>
            <div className="absolute -inset-1 rounded-xl border border-primary/20 animate-pulse-glow" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-[family-name:var(--font-heading)] text-xl font-black tracking-tight text-white"
            >
              Study<span className="text-primary-light">OS</span>
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/[0.08] border border-primary/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 z-10",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "text-primary-light font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom widget */}
      <div className={cn("p-3 mb-3", collapsed && "px-2")}>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-amber/15 border border-accent-amber/20">
              <Flame size={18} className="text-accent-amber" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Streak
                </div>
                <div className="flex items-baseline gap-1 font-bold text-accent-amber">
                  <span className="text-lg">{streak}</span>
                  <span className="text-[10px] font-normal text-gray-500">days</span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
              <span>Lvl {level}</span>
              <span className="font-mono text-primary-light">{xp.toLocaleString()} XP</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
