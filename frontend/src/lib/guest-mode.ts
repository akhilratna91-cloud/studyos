"use client";

import type {
  AnalyticsSnapshot,
  CalendarRecord,
  DailyTaskItem,
  NotificationRecord,
  QuizAttemptSummary,
  QuizStatsSnapshot,
  StudyPlanSummary,
  StudySession,
  TodayDashboard,
  TodayProgress,
  UserTaskStats,
} from "@/lib/api";
import {
  demoAnalytics,
  demoCalendar,
  demoDashboard,
  demoNotifications,
  demoPlans,
  demoQuizHistory,
  demoQuizStats,
  demoSessions,
  demoTasks,
} from "@/lib/demo-data";

const STORAGE_KEY = "studyos-guest-state";

export interface GuestState {
  plans: StudyPlanSummary[];
  todayTasks: DailyTaskItem[];
  sessions: StudySession[];
  calendar: CalendarRecord[];
  notifications: NotificationRecord[];
  quizHistory: QuizAttemptSummary[];
  quizStats: QuizStatsSnapshot;
}

const defaultGuestState: GuestState = {
  plans: demoPlans,
  todayTasks: demoTasks,
  sessions: demoSessions,
  calendar: demoCalendar,
  notifications: demoNotifications,
  quizHistory: demoQuizHistory,
  quizStats: demoQuizStats,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function computeTaskProgress(tasks: DailyTaskItem[]): TodayProgress {
  const summary = tasks.reduce(
    (acc, task) => {
      acc.totalTasks += 1;
      acc.totalMinutes += task.durationMinutes;

      if (task.status === "completed") {
        acc.completed += 1;
        acc.completedMinutes += task.durationMinutes;
      }

      if (task.status === "pending") {
        acc.pending += 1;
      }

      if (task.status === "in-progress") {
        acc.inProgress += 1;
      }

      if (task.status === "skipped") {
        acc.skipped += 1;
      }

      return acc;
    },
    {
      totalTasks: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      skipped: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      completionRate: 0,
    },
  );

  summary.completionRate = summary.totalTasks
    ? Math.round((summary.completed / summary.totalTasks) * 100)
    : 0;

  return summary;
}

export function buildTaskStats(tasks: DailyTaskItem[]): UserTaskStats {
  const progress = computeTaskProgress(tasks);

  return {
    totalTasks: progress.totalTasks,
    completedTasks: progress.completed,
    skippedTasks: progress.skipped,
    totalHours: Number((progress.totalMinutes / 60).toFixed(1)),
    completedHours: Number((progress.completedMinutes / 60).toFixed(1)),
    completionRate: progress.completionRate,
  };
}

function buildWeakChapters(tasks: DailyTaskItem[]) {
  const weak = tasks
    .filter((task) => task.status !== "completed")
    .map((task) => task.chapterName);

  return weak.length ? weak.slice(0, 3) : demoAnalytics.weak_chapters;
}

function mergeGuestState(partial?: Partial<GuestState>): GuestState {
  return {
    ...defaultGuestState,
    ...partial,
    plans: partial?.plans ?? defaultGuestState.plans,
    todayTasks: partial?.todayTasks ?? defaultGuestState.todayTasks,
    sessions: partial?.sessions ?? defaultGuestState.sessions,
    calendar: partial?.calendar ?? defaultGuestState.calendar,
    notifications: partial?.notifications ?? defaultGuestState.notifications,
    quizHistory: partial?.quizHistory ?? defaultGuestState.quizHistory,
    quizStats: partial?.quizStats ?? defaultGuestState.quizStats,
  };
}

export function loadGuestState(): GuestState {
  if (!canUseStorage()) {
    return defaultGuestState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultGuestState;
    }

    return mergeGuestState(JSON.parse(raw) as Partial<GuestState>);
  } catch {
    return defaultGuestState;
  }
}

export function saveGuestState(next: GuestState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function updateGuestState(updater: (state: GuestState) => GuestState) {
  const next = updater(loadGuestState());
  saveGuestState(next);
  return next;
}

export function appendGuestNotification(state: GuestState, message: string): GuestState {
  return {
    ...state,
    notifications: [
      {
        id: `guest-note-${Date.now()}`,
        message,
        createdAt: new Date().toISOString(),
      },
      ...state.notifications,
    ].slice(0, 12),
  };
}

export function buildGuestDashboard(state: GuestState): TodayDashboard {
  const progress = computeTaskProgress(state.todayTasks);
  const overall = buildTaskStats(state.todayTasks);

  return {
    ...demoDashboard,
    date: new Date().toISOString(),
    today: {
      tasks: state.todayTasks,
      progress,
    },
    plans: state.plans.map((plan, index) => {
      const totalDays = plan.config?.totalDays || 90;
      const currentDay = Math.min(index + 1, totalDays);

      return {
        id: plan.id || plan._id,
        title: plan.title,
        currentDay,
        totalDays,
        daysRemaining: Math.max(0, totalDays - currentDay),
        progressPercent: Math.round((currentDay / totalDays) * 100),
        hoursPerDay: plan.config?.hoursPerDay || 4,
      };
    }),
    overall,
  };
}

export function buildGuestAnalytics(state: GuestState): AnalyticsSnapshot {
  const taskStats = buildTaskStats(state.todayTasks);
  const hasQuizAttempts = state.quizStats.totalQuestionsAttempted > 0;

  return {
    accuracy: hasQuizAttempts ? Math.round(state.quizStats.accuracy) : demoAnalytics.accuracy,
    progress: taskStats.completionRate,
    weak_chapters: buildWeakChapters(state.todayTasks),
  };
}

export function summarizeQuizStats(history: QuizAttemptSummary[]): QuizStatsSnapshot {
  if (!history.length) {
    return {
      totalQuizzes: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      avgScore: 0,
      highestScore: 0,
      passRate: 0,
      avgTimeTaken: 0,
      accuracy: 0,
    };
  }

  const totalQuizzes = history.length;
  const totalQuestionsAttempted = history.reduce(
    (sum, item) => sum + item.totalQuestions,
    0,
  );
  const totalCorrect = history.reduce((sum, item) => sum + item.correct, 0);
  const completedAttempts = history.filter((item) => item.status === "completed");
  const avgScore = Math.round(
    history.reduce((sum, item) => sum + item.score, 0) / totalQuizzes,
  );
  const highestScore = Math.max(...history.map((item) => item.score));
  const passRate = Math.round(
    (history.filter((item) => item.passed).length / totalQuizzes) * 100,
  );
  const avgTimeTaken = Math.round(
    history.reduce((sum, item) => sum + item.timeTakenMinutes, 0) / totalQuizzes,
  );
  const accuracy = totalQuestionsAttempted
    ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
    : 0;

  return {
    totalQuizzes: completedAttempts.length || totalQuizzes,
    totalQuestionsAttempted,
    totalCorrect,
    avgScore,
    highestScore,
    passRate,
    avgTimeTaken,
    accuracy,
  };
}
