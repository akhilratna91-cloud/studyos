"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export type TaskStatus = "pending" | "in-progress" | "completed" | "skipped";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: FieldError[];

  constructor(
    message: string,
    status = 500,
    code?: string,
    details?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function formatApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    if (error.details && error.details.length > 0) {
      return error.details.map((detail) => detail.message).join(" ");
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ErrorResponse {
  success?: false;
  message?: string;
  code?: string;
  errors?: FieldError[];
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: unknown;
}

export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
}

interface RawUser {
  id?: string;
  _id?: string;
  email: string;
  class: string;
  exam: string;
}

interface RawProfile {
  displayName?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  className: string;
  exam: string;
  displayName: string;
}

export interface AuthResult {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface ExamSummary {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  category: string;
  subjects: string[];
  duration?: number;
  totalMarks?: number;
}

export interface SubjectSummary {
  id?: string;
  _id?: string;
  examId?: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  weightage?: number;
  totalMarks?: number;
  sortOrder?: number;
}

export interface ChapterSummary {
  id?: string;
  _id?: string;
  examId?: string;
  subjectId?: string;
  name: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  weightage?: number;
  estimatedHours?: number;
  sortOrder?: number;
}

export interface TopicSummary {
  id?: string;
  _id?: string;
  examId?: string;
  subjectId?: string;
  chapterId?: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  weightage?: number;
  estimatedMinutes?: number;
  keyFormulas?: string[];
  prerequisites?: string[];
  sortOrder?: number;
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface QuestionBankItem {
  id?: string;
  _id?: string;
  question: string;
  options: QuestionOption[];
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true_false" | "assertion_reason";
  hint?: string;
  explanation?: string;
  chapterName?: string;
  subjectName?: string;
  subjectIcon?: string;
  tags?: string[];
  correctAnswer?: number | null;
}

export interface QuestionStatsSummary {
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    subjectIcon?: string;
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }>;
  grandTotal: number;
}

export interface QuizSummary {
  id?: string;
  _id?: string;
  title: string;
  type: "chapter_quiz" | "subject_quiz" | "mock_test" | "custom";
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  subjectName?: string;
  subjectIcon?: string;
  chapterName?: string;
}

export interface QuizAttemptSummary {
  id?: string;
  _id?: string;
  quizId?: string | QuizSummary;
  userId?: string;
  status: "in_progress" | "completed" | "timed_out" | "abandoned";
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  passed: boolean;
  startedAt?: string;
  completedAt?: string | null;
  timeTakenMinutes: number;
  timeLimitMinutes: number;
}

export interface QuizSessionQuestion {
  id?: string;
  _id?: string;
  question: string;
  options: QuestionOption[];
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true_false" | "assertion_reason";
  hint?: string;
  chapterName?: string;
  subjectName?: string;
  subjectIcon?: string;
  tags?: string[];
}

export interface QuizStartResult {
  attempt: QuizAttemptSummary;
  questions: QuizSessionQuestion[];
  timeLimit: number;
}

export interface QuizAnswerResult {
  isCorrect: boolean;
  answeredSoFar: number;
  totalQuestions: number;
}

export interface QuizReviewItem {
  question: string;
  options: QuestionOption[];
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isCorrect: boolean;
  explanation: string;
  difficulty: string;
  timeTakenSeconds: number;
}

export interface QuizReviewResult {
  attempt: QuizAttemptSummary;
  review: QuizReviewItem[];
}

export interface QuizStatsSnapshot {
  totalQuizzes: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  avgScore: number;
  highestScore: number;
  passRate: number;
  avgTimeTaken: number;
  accuracy: number;
}

export interface StudyPlanSummary {
  id?: string;
  _id?: string;
  title: string;
  status: string;
  stats?: {
    totalStudyDays?: number;
    totalRevisionDays?: number;
    totalStudyHours?: number;
    chaptersCount?: number;
  };
  config?: {
    totalDays?: number;
    hoursPerDay?: number;
    className?: string;
    startDate?: string;
  };
}

export interface DailyTaskItem {
  id?: string;
  _id?: string;
  chapterName: string;
  subjectName: string;
  subjectColor?: string;
  durationMinutes: number;
  status: TaskStatus;
  type?: string;
  dayNumber?: number;
  date?: string;
  notes?: string;
}

export interface TodayProgress {
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
  skipped: number;
  totalMinutes: number;
  completedMinutes: number;
  completionRate: number;
}

export interface TodayDashboard {
  greeting: string;
  motivation: string;
  date: string;
  today: {
    tasks: DailyTaskItem[];
    progress: TodayProgress;
  };
  revision: {
    dueCount: number;
    weakCount: number;
    cards: Array<{
      id?: string;
      chapterName: string;
      subjectName: string;
      difficulty?: string;
      isWeak?: boolean;
    }>;
  };
  plans: Array<{
    id?: string;
    title: string;
    currentDay: number;
    totalDays: number;
    daysRemaining: number;
    progressPercent: number;
    hoursPerDay: number;
  }>;
  overall: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    totalHours: number;
    completedHours: number;
    completionRate: number;
  };
}

export interface UserTaskStats {
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  totalHours: number;
  completedHours: number;
  completionRate: number;
}

export interface AnalyticsSnapshot {
  accuracy: number;
  progress: number;
  weak_chapters: string[];
}

export interface WeakAdvice {
  message: string;
  weak_chapters: string[];
  advice: string[];
}

export interface MotivationResponse {
  quote: string;
}

export interface StudySession {
  id?: string;
  _id?: string;
  durationMinutes: number;
  timestamp?: string;
  createdAt?: string;
}

export interface CalendarRecord {
  id?: string;
  _id?: string;
  dateString: string;
  completed: boolean;
}

export interface NotificationRecord {
  id?: string;
  _id?: string;
  message: string;
  createdAt?: string;
}

async function apiRequest<T>(
  path: string,
  { token, body, headers, ...rest }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as T | ErrorResponse)
    : ((await response.text()) as T);

  if (!response.ok) {
    const errorPayload = payload as ErrorResponse;
    throw new ApiError(
      errorPayload.message || "Request failed",
      response.status,
      errorPayload.code,
      errorPayload.errors,
    );
  }

  return payload as T;
}

function normalizeUser(user: RawUser, profile?: RawProfile): SessionUser {
  const fallbackName = user.email.split("@")[0] || "Scholar";

  return {
    id: user.id || user._id || "",
    email: user.email,
    className: user.class,
    exam: user.exam,
    displayName: profile?.displayName || fallbackName,
  };
}

export async function getHealth() {
  return apiRequest<HealthStatus>("/health");
}

export async function listExams() {
  const response = await apiRequest<
    WrappedResponse<{ exams: ExamSummary[]; total: number }>
  >("/exams");
  return response.data.exams;
}

export async function listSubjectsByExam(examSlug: string) {
  const response = await apiRequest<
    WrappedResponse<{ exam?: ExamSummary; subjects: SubjectSummary[]; total: number }>
  >(`/subjects/exam/slug/${examSlug}`);
  return response.data.subjects;
}

export async function listChaptersBySubject(subjectId: string) {
  const response = await apiRequest<
    WrappedResponse<{ chapters: ChapterSummary[]; total: number }>
  >(`/chapters/subject/${subjectId}`);
  return response.data.chapters;
}

export async function listTopicsByChapter(chapterId: string) {
  const response = await apiRequest<
    WrappedResponse<{ topics: TopicSummary[]; total: number }>
  >(`/topics/chapter/${chapterId}`);
  return response.data.topics;
}

export async function register(payload: {
  email: string;
  password: string;
  className: string;
  exam: string;
}) {
  const response = await apiRequest<
    WrappedResponse<{
      user: RawUser;
      profile?: RawProfile;
      accessToken: string;
      refreshToken: string;
    }>
  >("/auth/register", {
    method: "POST",
    body: {
      email: payload.email,
      password: payload.password,
      class: payload.className,
      exam: payload.exam,
    },
  });

  return {
    user: normalizeUser(response.data.user, response.data.profile),
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  } satisfies AuthResult;
}

export async function login(payload: { email: string; password: string }) {
  const response = await apiRequest<
    WrappedResponse<{
      user: RawUser;
      accessToken: string;
      refreshToken: string;
    }>
  >("/auth/login", {
    method: "POST",
    body: payload,
  });

  return {
    user: normalizeUser(response.data.user),
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  } satisfies AuthResult;
}

export async function loginWithGoogle(payload: {
  credential: string;
  className?: string;
  exam?: string;
}) {
  const response = await apiRequest<
    WrappedResponse<{
      user: RawUser;
      profile?: RawProfile;
      accessToken: string;
      refreshToken: string;
    }>
  >("/auth/google", {
    method: "POST",
    body: {
      credential: payload.credential,
      class: payload.className,
      exam: payload.exam,
    },
  });

  return {
    user: normalizeUser(response.data.user, response.data.profile),
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  } satisfies AuthResult;
}

export async function getMe(token: string) {
  const response = await apiRequest<
    WrappedResponse<{ user: RawUser }>
  >("/auth/me", {
    token,
  });

  return normalizeUser(response.data.user);
}

export async function getPlans(token: string) {
  const response = await apiRequest<
    WrappedResponse<{ plans: StudyPlanSummary[]; total: number }>
  >("/plans", {
    token,
  });
  return response.data.plans;
}

export async function generatePlan(
  token: string,
  payload: {
    examId: string;
    className: string;
    totalDays: number;
    hoursPerDay: number;
    revisionInterval: number;
    restDayInterval: number;
    startDate: string;
  },
) {
  const response = await apiRequest<
    WrappedResponse<{ plan: StudyPlanSummary }>
  >("/plans/generate", {
    method: "POST",
    token,
    body: payload,
  });

  return response.data.plan;
}

export async function generateTasksFromPlan(token: string, planId: string) {
  const response = await apiRequest<
    WrappedResponse<{ tasks: number; days: number; message: string }>
  >("/tasks/generate", {
    method: "POST",
    token,
    body: { planId },
  });

  return response.data;
}

export async function getTodayDashboard(token: string) {
  const response = await apiRequest<WrappedResponse<TodayDashboard>>("/today", {
    token,
  });
  return response.data;
}

export async function getTodayTasks(token: string) {
  const response = await apiRequest<
    WrappedResponse<{ tasks: DailyTaskItem[]; total: number }>
  >("/tasks/today", {
    token,
  });
  return response.data.tasks;
}

export async function updateTaskStatus(
  token: string,
  taskId: string,
  status: TaskStatus,
) {
  const response = await apiRequest<
    WrappedResponse<{ task: DailyTaskItem }>
  >(`/tasks/${taskId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });

  return response.data.task;
}

export async function getTaskStats(token: string) {
  const response = await apiRequest<
    WrappedResponse<{ stats: UserTaskStats }>
  >("/tasks/stats/me", {
    token,
  });
  return response.data.stats;
}

export async function getAnalytics(token: string) {
  return apiRequest<AnalyticsSnapshot>("/simple-analytics/me", {
    token,
  });
}

export async function getWeakAdvice(token: string) {
  return apiRequest<WeakAdvice>("/ai/weak/me", {
    token,
  });
}

export async function getMotivation() {
  return apiRequest<MotivationResponse>("/ai/motivate");
}

export async function getSessions(token: string) {
  const response = await apiRequest<{
    success: boolean;
    sessions: StudySession[];
  }>("/sessions/me", {
    token,
  });

  return response.sessions;
}

export async function saveSession(token: string, duration: number) {
  return apiRequest<{ success: boolean; message: string }>("/sessions", {
    method: "POST",
    token,
    body: { duration },
  });
}

export async function getCalendar(token: string) {
  const response = await apiRequest<{
    success: boolean;
    calendar: CalendarRecord[];
  }>("/calendar/me", {
    token,
  });

  return response.calendar;
}

export async function markCalendar(token: string, date: string) {
  return apiRequest<{ success: boolean; message: string }>("/calendar/mark", {
    method: "POST",
    token,
    body: { date },
  });
}

export async function getNotifications(token: string) {
  const response = await apiRequest<{
    success: boolean;
    notifications: NotificationRecord[];
  }>("/notifications/me", {
    token,
  });

  return response.notifications;
}

export async function searchQuestionsByTags(
  token: string,
  tags: string[],
  examId?: string,
) {
  const params = new URLSearchParams({
    tags: tags.join(","),
  });

  if (examId) {
    params.set("examId", examId);
  }

  const response = await apiRequest<
    WrappedResponse<{ questions: QuestionBankItem[]; total: number }>
  >(`/questions/search/tags?${params.toString()}`, {
    token,
  });

  return response.data.questions;
}

export async function getQuestionsByChapter(
  token: string,
  chapterId: string,
  difficulty?: "easy" | "medium" | "hard",
) {
  const params = new URLSearchParams();
  if (difficulty) {
    params.set("difficulty", difficulty);
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest<
    WrappedResponse<{ questions: QuestionBankItem[]; total: number }>
  >(`/questions/chapter/${chapterId}${suffix}`, {
    token,
  });

  return response.data.questions;
}

export async function verifyQuestionAnswer(
  token: string,
  questionId: string,
  selectedAnswer: number,
) {
  const response = await apiRequest<
    WrappedResponse<{
      result: {
        isCorrect: boolean;
        correctAnswer: number;
        correctOption: QuestionOption;
        selectedAnswer: number;
        selectedOption: QuestionOption;
        explanation: string;
        successRate: number;
      };
    }>
  >(`/questions/${questionId}/verify`, {
    method: "POST",
    token,
    body: { selectedAnswer },
  });

  return response.data.result;
}

export async function getQuestionStats(token: string, examId: string) {
  const response = await apiRequest<
    WrappedResponse<{ stats: QuestionStatsSummary }>
  >(`/questions/stats/${examId}`, {
    token,
  });

  return response.data.stats;
}

export async function generateChapterQuiz(
  token: string,
  payload: {
    chapterId: string;
    count?: number;
    timeLimitMinutes?: number;
    passingScore?: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
  },
) {
  const response = await apiRequest<
    WrappedResponse<{ quiz: QuizSummary }>
  >("/quizzes/generate/chapter", {
    method: "POST",
    token,
    body: payload,
  });

  return response.data.quiz;
}

export async function generateSubjectQuiz(
  token: string,
  payload: {
    subjectId: string;
    count?: number;
    timeLimitMinutes?: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
  },
) {
  const response = await apiRequest<
    WrappedResponse<{ quiz: QuizSummary }>
  >("/quizzes/generate/subject", {
    method: "POST",
    token,
    body: payload,
  });

  return response.data.quiz;
}

export async function generateMockTest(
  token: string,
  payload: {
    examId: string;
    count?: number;
    timeLimitMinutes?: number;
    passingScore?: number;
  },
) {
  const response = await apiRequest<
    WrappedResponse<{ quiz: QuizSummary }>
  >("/quizzes/generate/mock", {
    method: "POST",
    token,
    body: payload,
  });

  return response.data.quiz;
}

export async function startQuizAttempt(token: string, quizId: string) {
  const response = await apiRequest<
    WrappedResponse<QuizStartResult>
  >(`/quizzes/${quizId}/start`, {
    method: "POST",
    token,
  });

  return response.data;
}

export async function submitQuizAnswer(
  token: string,
  attemptId: string,
  payload: {
    questionId: string;
    selectedAnswer: number;
    timeTakenSeconds?: number;
  },
) {
  const response = await apiRequest<
    WrappedResponse<QuizAnswerResult>
  >(`/quizzes/${attemptId}/answer`, {
    method: "POST",
    token,
    body: payload,
  });

  return response.data;
}

export async function finishQuizAttempt(token: string, attemptId: string) {
  const response = await apiRequest<
    WrappedResponse<{ attempt: QuizAttemptSummary }>
  >(`/quizzes/${attemptId}/finish`, {
    method: "POST",
    token,
  });

  return response.data.attempt;
}

export async function abandonQuizAttempt(token: string, attemptId: string) {
  const response = await apiRequest<
    WrappedResponse<{ attempt: QuizAttemptSummary }>
  >(`/quizzes/${attemptId}/abandon`, {
    method: "POST",
    token,
  });

  return response.data.attempt;
}

export async function reviewQuizAttempt(token: string, attemptId: string) {
  const response = await apiRequest<
    WrappedResponse<QuizReviewResult>
  >(`/quizzes/${attemptId}/review`, {
    token,
  });

  return response.data;
}

export async function getQuizHistory(token: string, limit = 10) {
  const response = await apiRequest<
    WrappedResponse<{ attempts: QuizAttemptSummary[]; total: number }>
  >(`/quizzes/history?limit=${limit}`, {
    token,
  });

  return response.data.attempts;
}

export async function getQuizStats(token: string) {
  const response = await apiRequest<
    WrappedResponse<{ stats: QuizStatsSnapshot }>
  >("/quizzes/stats", {
    token,
  });

  return response.data.stats;
}
