"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { LogOut, Mail, Lock, User, Zap, Sparkles, ShieldCheck } from "lucide-react";
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
  const { token, user, xp, level, streak, disciplineScore, hasHydrated, demoMode, setSession, clearSession } = useUserStore();
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
      <motion.div initial="hidden" animate="show" variants={v} className="space-y-6">
        <PageHeader tag="Identity" title="Your Profile" />

        <motion.div variants={item}>
          <GlassCard className="relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.06] blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent-cyan text-3xl font-black text-white shadow-neon-primary">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -inset-1.5 rounded-2xl border border-primary/20 animate-pulse-glow" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">{user.displayName}</h2>
                <p className="mt-1 text-sm text-gray-400">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs text-primary-light">
                    Class {user.className}
                  </span>
                  <span className="rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-0.5 text-xs text-accent-cyan">
                    {user.exam}
                  </span>
                </div>
              </div>

              <NeonButton variant="outline" glowColor="magenta" onClick={clearSession}>
                <LogOut size={16} /> Sign out
              </NeonButton>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="p-6">
            <XpBar xp={xp} level={level} />
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
          <GlassCard className="p-5 text-center" glowColor="amber">
            <div className="text-3xl font-black text-accent-amber">{streak}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">Day Streak</div>
          </GlassCard>
          <GlassCard className="p-5 text-center" glowColor="primary">
            <div className="text-3xl font-black text-primary-light">{level}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">Level</div>
          </GlassCard>
          <GlassCard className="p-5 text-center" glowColor="magenta">
            <div className="text-3xl font-black text-accent-magenta">{disciplineScore}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">Discipline</div>
          </GlassCard>
        </motion.div>
      </motion.div>
    );
  }

  // Auth form view
  return (
    <motion.div initial="hidden" animate="show" variants={v} className="mx-auto max-w-lg space-y-6">
      <PageHeader tag="Authentication" title="Welcome to StudyOS" subtitle="Sign in to unlock personalized study plans, quizzes, and AI coaching." />

      <motion.div variants={item}>
        <GlassCard className="p-6">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                  tab === t ? "bg-primary/15 text-primary-light" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block text-sm text-gray-300">
              <div className="flex items-center gap-2 mb-2"><Mail size={14} /> Email</div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-orbital" placeholder="your@email.com" />
            </label>

            <label className="block text-sm text-gray-300">
              <div className="flex items-center gap-2 mb-2"><Lock size={14} /> Password</div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-orbital" placeholder="••••••••" />
            </label>

            {tab === "register" && (
              <>
                <label className="block text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-2"><User size={14} /> Class</div>
                  <input value={className} onChange={(e) => setClassName(e.target.value)} className="input-orbital" />
                </label>
                <label className="block text-sm text-gray-300">
                  Target Exam
                  <select value={exam} onChange={(e) => setExam(e.target.value)} className="select-orbital mt-2">
                    {exams.map((ex) => (
                      <option key={ex.slug} value={ex.name} className="bg-surface">{ex.name}</option>
                    ))}
                    {exams.length === 0 && <option className="bg-surface">JEE Main</option>}
                  </select>
                </label>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.05] p-3 text-sm text-accent-red">{error}</div>
            )}

            <NeonButton type="submit" className="w-full" loading={loading}>
              {tab === "login" ? "Sign In" : "Create Account"}
            </NeonButton>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="space-y-3">
            <GoogleSignIn
              clientId={GOOGLE_CLIENT_ID}
              disabled={googleLoading}
              onCredential={handleGoogleCredential}
            />
            {googleLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-cyan">
                <ShieldCheck size={14} className="animate-pulse" />
                Verifying Google Credential...
              </div>
            )}
            <NeonButton variant="outline" glowColor="amber" className="w-full" onClick={() => void handleDemoLogin()} loading={demoLoading}>
              <Zap size={14} /> Try Demo Account
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
