"use client";

import { usePathname } from "next/navigation";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { NeonButton } from "@/components/ui/neon-button";
import Link from "next/link";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Night session mode";
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/today": "Today's Target Flow",
  "/planner": "AI Study Planner",
  "/learn": "Syllabus Explorer",
  "/quiz": "Live Quiz Arena",
  "/pyq": "Previous Year Bank",
  "/analytics": "Performance Insights",
  "/coach": "AI Study Coach",
  "/sessions": "Focus Timer",
  "/calendar": "Study Calendar",
  "/profile": "Account & Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { user, demoMode } = useUserStore();
  const greeting = getGreeting();
  const displayName = user?.displayName || "Scholar";
  const pageTitle = pageTitles[pathname] || "StudyOS";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 md:left-[4.5rem] lg:left-64">
      <div className="border-b border-purple-500/20 bg-[#0E0919]/70 backdrop-blur-2xl transition-colors duration-500">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Greeting & page title */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-purple-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {greeting}
                {!demoMode && (
                  <span className="text-purple-300">, {displayName}</span>
                )}
              </p>
              <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white text-gradient-emerald-purple">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Right — Quick actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-200 md:flex">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>v1.0.1 Active</span>
            </div>
            
            <Link href="/sessions">
              <NeonButton variant="outline" glowColor="emerald" className="hidden sm:flex text-xs">
                <Zap size={14} className="text-emerald-400" />
                Focus Timer
              </NeonButton>
            </Link>

            <Link href="/coach">
              <NeonButton variant="solid" glowColor="purple" className="hidden sm:flex text-xs">
                <Sparkles size={14} className="text-purple-200" />
                AI Coach
              </NeonButton>
            </Link>

            {demoMode && (
              <Link href="/profile">
                <NeonButton variant="solid" glowColor="emerald" className="text-xs">
                  Sign In
                </NeonButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
