"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, CalendarPlus, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Home", href: "/", icon: Home },
  { name: "Today", href: "/today", icon: CalendarCheck },
  { name: "Planner", href: "/planner", icon: CalendarPlus },
  { name: "Stats", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between rounded-2xl border border-white/10 bg-black/75 p-2 backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon size={18} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
