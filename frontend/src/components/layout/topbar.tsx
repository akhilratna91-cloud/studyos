"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, Flame } from "lucide-react";
import { useUserStore } from "@/store/user-store";

export function Topbar() {
  const router = useRouter();
  const { level, streak, user, demoMode } = useUserStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-base/80 px-4 backdrop-blur-xl md:left-64 md:px-8">
      <div className="relative hidden w-full max-w-md group md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search topics, notes, or ask AI..." 
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300"
        />
      </div>

      <div className="flex min-w-0 items-center gap-3 md:gap-6">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="min-w-0 text-left"
        >
          <div className="truncate text-sm font-semibold text-white">
            {user?.displayName || "StudyOS Demo"}
          </div>
          <div className="text-xs text-gray-400">
            {demoMode ? "Demo mode" : user?.exam || "Live mode"}
          </div>
        </button>

        <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          <Flame size={16} className="text-orange-500" />
          <span className="text-orange-500 font-bold text-sm tracking-wide">{streak}</span>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30 shadow-neon-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <span className="text-primary font-bold text-sm">LVL {level}</span>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200">
          <Bell size={20} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center p-[2px] cursor-pointer hover:shadow-neon-primary transition-shadow duration-300">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=StudyOS" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
