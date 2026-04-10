import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SessionUser } from "@/lib/api";

interface SessionPayload {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

interface UserState {
  xp: number;
  level: number;
  streak: number;
  disciplineScore: number;
  token: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  demoMode: boolean;
  hasHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (payload: SessionPayload) => void;
  clearSession: () => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  setGamification: (payload: {
    xp?: number;
    level?: number;
    streak?: number;
    disciplineScore?: number;
  }) => void;
  setDemoMode: (value: boolean) => void;
}

const calculateLevel = (xp: number) => Math.max(1, Math.floor(xp / 500) + 1);

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 1450,
      level: calculateLevel(1450),
      streak: 24,
      disciplineScore: 84,
      token: null,
      refreshToken: null,
      user: null,
      demoMode: true,
      hasHydrated: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      setSession: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          token: accessToken,
          refreshToken,
          demoMode: false,
        }),
      clearSession: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          demoMode: true,
        }),
      addXp: (amount) =>
        set((state) => {
          const nextXp = state.xp + amount;
          return {
            xp: nextXp,
            level: calculateLevel(nextXp),
          };
        }),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      setGamification: (payload) =>
        set((state) => ({
          xp: payload.xp ?? state.xp,
          level: payload.level ?? state.level,
          streak: payload.streak ?? state.streak,
          disciplineScore: payload.disciplineScore ?? state.disciplineScore,
        })),
      setDemoMode: (value) => set({ demoMode: value }),
    }),
    {
      name: "studyos-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        disciplineScore: state.disciplineScore,
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        demoMode: state.demoMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
