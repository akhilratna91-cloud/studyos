"use client";

export { default } from "@/components/views/dashboard-home";

import { motion, Variants } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { XpBar } from "@/components/ui/xp-bar";
import { useUserStore } from "@/store/user-store";
import { Clock, Target, ShieldCheck, Zap, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const performanceData = [
  { day: "Mon", score: 45 },
  { day: "Tue", score: 52 },
  { day: "Wed", score: 38 },
  { day: "Thu", score: 65 },
  { day: "Fri", score: 85 },
  { day: "Sat", score: 72 },
  { day: "Sun", score: 90 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Dashboard() {
  const { xp, level } = useUserStore();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Hero Welcome & Quote */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, <span className="neon-text-primary">Creator</span>.</h1>
          <p className="text-gray-400 italic">&quot;Discipline is the bridge between goals and accomplishment. Stay toxic.&quot; &mdash; AI Coach</p>
        </div>
        <div className="flex gap-4">
          <NeonButton variant="outline" glowColor="cyan"><Sparkles size={16} /> Ask AI Coach</NeonButton>
          <NeonButton glowColor="primary">Start Focus Session</NeonButton>
        </div>
      </motion.div>

      {/* Main XP Bar */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-pink-500/20 blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="text-primary animate-pulse" /> Journey Progress
              </h2>
            </div>
            <XpBar xp={xp} level={level} />
          </div>
        </GlassCard>
      </motion.div>

      {/* 4 Stat Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-6">
        <GlassCard className="p-5 flex flex-col gap-3" glowColor="orange">
          <div className="flex items-center gap-2 text-orange-400"><Clock size={16}/> Study Hours</div>
          <div className="text-3xl font-black text-white">4.2<span className="text-sm font-medium text-gray-500 ml-1">hrs</span></div>
          <div className="text-xs text-green-400">+1.5 hrs from yesterday</div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col gap-3" glowColor="cyan">
          <div className="flex items-center gap-2 text-cyan-400"><Target size={16}/> Completion</div>
          <div className="text-3xl font-black text-white">84<span className="text-sm font-medium text-gray-500 ml-1">%</span></div>
          <div className="w-full h-1 bg-black/50 rounded-full mt-2 overflow-hidden"><div className="h-full bg-cyan-400 w-[84%] shadow-[0_0_8px_cyan]"></div></div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col gap-3" glowColor="primary">
          <div className="flex items-center gap-2 text-primary"><ShieldCheck size={16}/> Accuracy</div>
          <div className="text-3xl font-black text-white">92<span className="text-sm font-medium text-gray-500 ml-1">%</span></div>
          <div className="text-xs text-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">Top 5% locally</div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col gap-3" glowColor="pink">
          <div className="flex items-center gap-2 text-pink-500"><Zap size={16}/> Discipline Base</div>
          <div className="text-3xl font-black text-white">S+<span className="text-sm font-medium text-gray-500 ml-1">Tier</span></div>
          <div className="text-xs text-pink-400">Maintained for 12 days</div>
        </GlassCard>
      </motion.div>

      {/* Bottom Area: Area Chart & AI Recommendation & Tasks */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Weekly Chart */}
        <motion.div variants={itemVariants} className="col-span-2">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6">Performance Velocity</h3>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                  />
                  <XAxis dataKey="day" stroke="#555" tickLine={false} axisLine={false} />
                  <Area type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right Stack: AI Config & Tasks */}
        <motion.div variants={itemVariants} className="col-span-1 space-y-6">
          {/* AI Suggestion */}
          <div className="p-[1px] rounded-xl bg-gradient-to-br from-pink-500 via-cyan-500 to-primary">
            <GlassCard className="p-5 h-full relative overflow-hidden !rounded-xl !border-0 bg-base">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-pink-500/10" />
              <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 mb-3">AI COACH RECOMMENDATION</div>
              <p className="text-sm font-medium leading-relaxed text-gray-200 mb-4">
                You struggled with <span className="text-white font-bold border-b border-dashed border-cyan-400">Rotational Dynamics</span> yesterday. I&apos;ve generated a 15-min adaptive quiz to lock in the concepts.
              </p>
              <NeonButton variant="ghost" glowColor="cyan" className="w-full bg-cyan-500/10">Lock In <ChevronRight size={16}/></NeonButton>
            </GlassCard>
          </div>

          {/* Today Tasks */}
          <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-300">Today&apos;s Protocol</h3>
              <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">2 Left</span>
            </div>
            
            <div className="space-y-3">
              <div className="group flex flex-col gap-1 p-3 rounded-lg border border-white/5 hover:border-primary/30 transition-colors cursor-pointer hover:bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">Complete Mock Exam 4</div>
                  <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center p-[2px]"></div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2"><span className="text-orange-400">120 XP</span> • 2 hours</div>
              </div>

              <div className="group flex flex-col gap-1 p-3 rounded-lg border border-primary/30 transition-colors cursor-pointer bg-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
                <div className="relative flex items-center justify-between z-10">
                  <div className="text-sm font-medium text-gray-300 line-through">Revise Optics Formula Sheet</div>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-neon-primary text-black">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <div className="text-xs text-gray-500 relative z-10">Completed 2 hrs ago</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </motion.div>
  );
}
