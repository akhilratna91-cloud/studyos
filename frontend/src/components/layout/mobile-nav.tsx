"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Brain, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Today", href: "/today", icon: CalendarCheck },
  { name: "Quiz", href: "/quiz", icon: Brain },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20 bg-[#0E0919]/90 backdrop-blur-2xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200",
                isActive
                  ? "text-emerald-400 font-semibold"
                  : "text-purple-300/60 hover:text-purple-200",
              )}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "text-emerald-400" : "text-purple-400/70"} />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                )}
              </div>
              <span className="text-[10px] font-heading tracking-wider uppercase">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
