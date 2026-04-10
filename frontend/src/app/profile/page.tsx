"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GoogleSignIn } from "@/components/ui/google-sign-in";
import { NeonButton } from "@/components/ui/neon-button";
import {
  formatApiError,
  getMe,
  GOOGLE_CLIENT_ID,
  login,
  loginWithGoogle,
  register,
} from "@/lib/api";
import { useUserStore } from "@/store/user-store";

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  email: string;
  password: string;
  className: string;
  exam: string;
};

const defaultLogin: LoginForm = {
  email: "",
  password: "",
};

const defaultRegister: RegisterForm = {
  email: "",
  password: "",
  className: "12",
  exam: "JEE Main",
};

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, hasHydrated, setSession, clearSession } = useUserStore();
  const [loginForm, setLoginForm] = useState<LoginForm>(defaultLogin);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(defaultRegister);
  const [status, setStatus] = useState(
    "Sign in to unlock live StudyOS features.",
  );
  const [busyAction, setBusyAction] = useState<
    "login" | "register" | "google" | null
  >(null);

  useEffect(() => {
    if (!hasHydrated || !token) {
      return;
    }

    const accessToken = token;
    let active = true;

    async function loadUser() {
      try {
        const liveUser = await getMe(accessToken);

        if (!active) {
          return;
        }

        setStatus(`Signed in as ${liveUser.displayName}.`);
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `Session check failed: ${error.message}`
            : "Session check failed.",
        );
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [token, hasHydrated]);

  async function handleLogin() {
    setBusyAction("login");

    try {
      const result = await login(loginForm);
      setSession(result);
      setStatus("Login successful. Live StudyOS is unlocked.");
      router.push("/");
    } catch (error) {
      setStatus(formatApiError(error, "Login failed."));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRegister() {
    setBusyAction("register");

    try {
      const result = await register(registerForm);
      setSession(result);
      setStatus("Registration complete. Your account is ready.");
      router.push("/");
    } catch (error) {
      setStatus(formatApiError(error, "Registration failed."));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setBusyAction("google");

    try {
      const result = await loginWithGoogle({
        credential,
        className: registerForm.className,
        exam: registerForm.exam,
      });
      setSession(result);
      setStatus("Google verified successfully. StudyOS is unlocked.");
      router.push("/");
    } catch (error) {
      setStatus(formatApiError(error, "Google sign-in failed."));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
          Profile and access
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
          Account control center
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{status}</p>
      </div>

      {token && user && (
        <GlassCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <ShieldCheck size={16} />
                Active session
              </div>
              <div className="mt-3 text-xl font-black text-white">{user.displayName}</div>
              <div className="mt-1 text-sm text-gray-400">
                {user.email} - {user.className} - {user.exam}
              </div>
            </div>
            <NeonButton
              variant="outline"
              glowColor="pink"
              onClick={() => {
                clearSession();
                setStatus("Signed out. Demo mode is active again.");
              }}
            >
              <LogOut size={16} />
              Sign out
            </NeonButton>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck size={16} className="text-cyan-300" />
            Google verified access
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            Sign in without typing your email
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            Use your Google account as the identity layer for StudyOS. On first
            sign-in, we use your class and target exam below to finish the setup.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-300">
              <span>Class</span>
              <input
                value={registerForm.className}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    className: event.target.value,
                  }))
                }
                placeholder="Class"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-300">
              <span>Target exam</span>
              <input
                value={registerForm.exam}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    exam: event.target.value,
                  }))
                }
                placeholder="Target exam"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
            Class/exam are only used when Google creates a new StudyOS account
            for the first time. Existing users can just continue with Google.
          </div>

          <div className="mt-5">
            <GoogleSignIn
              clientId={GOOGLE_CLIENT_ID}
              disabled={busyAction === "google"}
              onCredential={handleGoogleCredential}
            />
          </div>

          {busyAction === "google" && (
            <div className="mt-3 text-sm text-cyan-200">
              Verifying your Google account and syncing StudyOS access...
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserRound size={16} className="text-primary" />
            Current access mode
          </div>
          <div className="mt-4 space-y-4 text-sm leading-6 text-gray-400">
            <p>
              Primary path: Google sign-in. This avoids manual email/password entry
              and works as your verified identity layer.
            </p>
            <p>
              Fallback path: email/password is still available below for backup
              access or legacy accounts.
            </p>
            <p>
              Live app status: {token && user ? "authenticated" : "waiting for sign-in"}.
            </p>
          </div>
        </GlassCard>
      </div>

      <details
        open
        className="group rounded-[30px] border border-white/10 bg-white/5 p-6 text-sm text-gray-300"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2 font-semibold">
            <KeyRound size={16} className="text-primary" />
            Use email/password instead
          </div>
          <ChevronDown className="transition group-open:rotate-180" size={18} />
        </summary>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <LogIn size={16} className="text-primary" />
              Sign in with email
            </div>
            <div className="mt-4 space-y-4">
              <input
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <p className="text-xs text-gray-500">
                Use your existing password. If this account was created with
                Google, use Google sign-in above instead.
              </p>
              <NeonButton onClick={() => void handleLogin()}>
                <UserRound size={16} />
                {busyAction === "login" ? "Signing in..." : "Sign in"}
              </NeonButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <UserRoundPlus size={16} className="text-cyan-300" />
              Create account with email
            </div>
            <div className="mt-4 space-y-4">
              <input
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <p className="text-xs text-gray-500">
                Password only needs to be 8 or more characters now.
              </p>
              <input
                value={registerForm.className}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    className: event.target.value,
                  }))
                }
                placeholder="Class"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                value={registerForm.exam}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, exam: event.target.value }))
                }
                placeholder="Target exam"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <NeonButton
                variant="outline"
                glowColor="cyan"
                onClick={() => void handleRegister()}
              >
                <UserRoundPlus size={16} />
                {busyAction === "register" ? "Creating..." : "Create account"}
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </details>
    </div>
  );
}
