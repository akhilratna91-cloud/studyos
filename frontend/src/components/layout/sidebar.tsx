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
  Headphones,
  Calendar,
  Flame,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Today", href: "/today", icon: CalendarCheck },
  { name: "Planner", href: "/planner", icon: CalendarPlus },
  { name: "Learn", href: "/learn", icon: PlayCircle },
  { name: "Quiz", href: "/quiz", icon: Brain },
  { name: "PYQ", href: "/pyq", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Coach", href: "/coach", icon: Sparkles },
  { name: "Sessions", href: "/sessions", icon: Headphones },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const streak = useUserStore((state) => state.streak);

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-white/10 bg-base/80 backdrop-blur-xl md:flex">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-neon-primary relative">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse blur-[1px]" />
        </div>
        <span className="font-black text-2xl tracking-tighter text-white">Study<span className="text-primary">OS</span></span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div 
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 z-10",
                  isActive ? "text-primary font-bold drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Mini Gamification Widget */}
      <div className="p-4 mx-4 mb-6 rounded-xl bg-gradient-to-t from-black/50 to-transparent border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-500/30">
            <Flame size={20} className="text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Current Streak</div>
            <div className="font-bold text-orange-400 flex items-baseline gap-1 shadow-orange-500">
              <span className="text-xl">{streak}</span>
              <span className="text-xs">Days</span>
            </div>
          </div>
        </div>
      </div>
      
    </aside>
  );
}

