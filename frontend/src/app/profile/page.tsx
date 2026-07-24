"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { LogOut, Mail, Lock, User, Zap, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { XpBar } from "@/components/ui/xp-bar";
import { PageHeader } from "@/components/ui/page-header";
import { GoogleSignIn } from "@/components/ui/google-sign-in";
import {
  register,
  login,
  loginWithGoogle,
  demoLogin,
  listExams,
  formatApiError,
  GOOGLE_CLIENT_ID,
  type ExamSummary,
} from "@/lib/api";
import { useUserStore } from "@/store/user-store";

export default function ProfilePage() {
  const { token, user, xp, level, streak, disciplineScore, hasHydrated, setSession, clearSession } = useUserStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("12");
  const [exam, setExam] = useState("JEE Main");
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadExams() {
      try {
        const result = await listExams();
        if (active) setExams(result);
      } catch { /* fallback */ }
    }
    void loadExams();
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = tab === "register"
        ? await register({ email, password, className, exam })
        : await login({ email, password });
      setSession(result);
    } catch (err) {
      setError(formatApiError(err, "Authentication failed."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle({
        credential,
        className,
        exam,
      });
      setSession(result);
    } catch (err) {
      setError(formatApiError(err, "Google sign-in failed."));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const result = await demoLogin();
      setSession(result);
    } catch (err) {
      setError(formatApiError(err, "Demo login failed."));
    } finally {
      setDemoLoading(false);
    }
  }

  const v: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (!hasHydrated) return null;

  // Logged in view
  if (token && user) {
    return (
      <motion.div initial="hidden" animate="show" variants={v} className="space-y-6 theme-profile">
        <PageHeader tag="Scholar Identity" title="Your Account Profile" />

        <motion.div variants={item}>
          <GlassCard glowColor="dual" className="relative overflow-hidden p-6 sm:p-8 border-purple-500/30">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/15 blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-purple-600 font-heading text-3xl font-extrabold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -inset-1.5 rounded-2xl border border-emerald-400/40 animate-pulse" />
              </div>

              <div className="flex-1">
                <h2 className="font-heading text-2xl font-extrabold text-white text-gradient-emerald-purple">{user.displayName}</h2>
                <p className="font-mono mt-1 text-xs text-purple-300/80">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 font-mono">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs text-emerald-300">
                    Class {user.className}
                  </span>
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs text-purple-300">
                    {user.exam}
                  </span>
                </div>
              </div>

              <NeonButton variant="outline" glowColor="purple" onClick={clearSession}>
                <LogOut size={16} /> Sign Out
              </NeonButton>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
            <XpBar xp={xp} level={level} />
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="grid gap-4 sm:grid-cols-3 font-mono">
          <GlassCard className="p-5 text-center border-amber-500/30" glowColor="amber">
            <div className="font-heading text-3xl font-extrabold text-amber-400">{streak}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-purple-300/70">Daily Fire Streak</div>
          </GlassCard>
          <GlassCard className="p-5 text-center border-emerald-500/30" glowColor="emerald">
            <div className="font-heading text-3xl font-extrabold text-emerald-400">{level}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-emerald-300/70">Mastery Level</div>
          </GlassCard>
          <GlassCard className="p-5 text-center border-purple-500/30" glowColor="purple">
            <div className="font-heading text-3xl font-extrabold text-purple-300">{disciplineScore}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-purple-300/70">Discipline Points</div>
          </GlassCard>
        </motion.div>
      </motion.div>
    );
  }

  // Auth form view
  return (
    <motion.div initial="hidden" animate="show" variants={v} className="mx-auto max-w-lg space-y-6 theme-profile">
      <PageHeader tag="Scholar Access" title="Welcome to StudyOS v1.0.1" subtitle="Sign in to unlock personalized study plans, live quiz arenas, and AI coaching." />

      <motion.div variants={item}>
        <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl border border-purple-500/20 bg-purple-950/20 p-1 font-heading">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === t ? "bg-purple-600/30 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "text-purple-300/70 hover:text-white"
                }`}
              >
                {t === "login" ? "Sign In" : "Register Account"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 font-mono text-xs">
            <label className="block text-purple-200">
              <div className="flex items-center gap-2 mb-2 font-heading text-xs font-bold uppercase text-purple-300"><Mail size={14} className="text-emerald-400" /> Email Address</div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-orbital" placeholder="scholar@studyos.ai" />
            </label>

            <label className="block text-purple-200">
              <div className="flex items-center gap-2 mb-2 font-heading text-xs font-bold uppercase text-purple-300"><Lock size={14} className="text-purple-400" /> Password</div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-orbital" placeholder="••••••••" />
            </label>

            {tab === "register" && (
              <>
                <label className="block text-purple-200">
                  <div className="flex items-center gap-2 mb-2 font-heading text-xs font-bold uppercase text-purple-300"><User size={14} className="text-cyan-400" /> Class / Batch</div>
                  <input value={className} onChange={(e) => setClassName(e.target.value)} className="input-orbital" />
                </label>
                <label className="block text-purple-200">
                  <div className="flex items-center gap-2 mb-2 font-heading text-xs font-bold uppercase text-purple-300">Target Exam Stream</div>
                  <select value={exam} onChange={(e) => setExam(e.target.value)} className="select-orbital">
                    {exams.map((ex) => (
                      <option key={ex.slug} value={ex.name} className="bg-[#0E0919]">{ex.name}</option>
                    ))}
                    {exams.length === 0 && <option className="bg-[#0E0919]">JEE Main</option>}
                  </select>
                </label>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">{error}</div>
            )}

            <NeonButton type="submit" variant="solid" glowColor="emerald" className="w-full text-xs font-bold py-3 mt-2" loading={loading}>
              {tab === "login" ? "Sign In to StudyOS" : "Create Scholar Account"}
            </NeonButton>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-purple-500/20" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300/70">OR</span>
            <div className="h-px flex-1 bg-purple-500/20" />
          </div>

          <div className="space-y-3">
            <GoogleSignIn
              clientId={GOOGLE_CLIENT_ID}
              disabled={googleLoading}
              onCredential={handleGoogleCredential}
            />
            {googleLoading && (
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <ShieldCheck size={14} className="animate-pulse" />
                Verifying Google Credential...
              </div>
            )}
            <NeonButton variant="solid" glowColor="purple" className="w-full text-xs" onClick={() => void handleDemoLogin()} loading={demoLoading}>
              <Zap size={14} /> Launch Live Demo Scholar Account
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
