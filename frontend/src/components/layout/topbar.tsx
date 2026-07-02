"use client";

import { usePathname } from "next/navigation";
import { Sparkles, Zap } from "lucide-react";
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
  "/": "Dashboard",
  "/today": "Today",
  "/planner": "Planner",
  "/learn": "Learn",
  "/quiz": "Quiz",
  "/pyq": "PYQ",
  "/analytics": "Analytics",
  "/coach": "AI Coach",
  "/sessions": "Sessions",
  "/calendar": "Calendar",
  "/profile": "Profile",
};

export function Topbar() {
  const pathname = usePathname();
  const { user, demoMode } = useUserStore();
  const greeting = getGreeting();
  const displayName = user?.displayName || "Scholar";
  const pageTitle = pageTitles[pathname] || "";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 md:left-[4.5rem] lg:left-64">
      <div className="border-b border-white/[0.04] bg-surface/60 backdrop-blur-2xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Greeting & page title */}
          <div className="flex items-center gap-4">
            <div>
              <p className="font-editorial text-[9px] uppercase tracking-[0.2em] text-gray-500">
                {greeting}
                {!demoMode && (
                  <span className="text-white">, {displayName}</span>
                )}
              </p>
              <h2 className="font-editorial text-md font-bold uppercase tracking-wider text-white">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Right — Quick actions */}
          <div className="flex items-center gap-2">
            <Link href="/sessions">
              <NeonButton variant="ghost" glowColor="cyan" className="hidden sm:flex text-xs">
                <Zap size={14} />
                Focus
              </NeonButton>
            </Link>
            <Link href="/coach">
              <NeonButton variant="ghost" glowColor="magenta" className="hidden sm:flex text-xs">
                <Sparkles size={14} />
                AI Coach
              </NeonButton>
            </Link>
            {demoMode && (
              <Link href="/profile">
                <NeonButton variant="outline" glowColor="primary" className="text-xs">
                  Sign in
                </NeonButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
