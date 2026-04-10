"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  Brain,
  CheckCircle2,
  CircleSlash,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import {
  abandonQuizAttempt,
  finishQuizAttempt,
  generateChapterQuiz,
  generateMockTest,
  generateSubjectQuiz,
  getQuizHistory,
  getQuizStats,
  listChaptersBySubject,
  listExams,
  listSubjectsByExam,
  reviewQuizAttempt,
  startQuizAttempt,
  submitQuizAnswer,
  type ChapterSummary,
  type ExamSummary,
  type QuizAttemptSummary,
  type QuizReviewResult,
  type QuizSessionQuestion,
  type QuizStatsSnapshot,
  type QuizSummary,
  type SubjectSummary,
} from "@/lib/api";
import { useUserStore } from "@/store/user-store";

function getId(item?: { id?: string; _id?: string } | null) {
  return item?.id || item?._id || "";
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getHistoryTitle(attempt: QuizAttemptSummary) {
  if (!attempt.quizId || typeof attempt.quizId === "string") {
    return "Quiz attempt";
  }

  return attempt.quizId.title;
}

export default function QuizPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useUserStore();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedExamSlug, setSelectedExamSlug] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [mode, setMode] = useState<"chapter" | "subject" | "mock">("chapter");
  const [count, setCount] = useState(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(25);
  const [passingScore, setPassingScore] = useState(60);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [status, setStatus] = useState("Preparing practice cockpit...");
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptSummary | null>(null);
  const [questions, setQuestions] = useState<QuizSessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [review, setReview] = useState<QuizReviewResult | null>(null);
  const [history, setHistory] = useState<QuizAttemptSummary[]>([]);
  const [stats, setStats] = useState<QuizStatsSnapshot | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();
  const questionStartedAtRef = useRef(Date.now());
  const finishingRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function bootstrap() {
      try {
        const examList = await listExams();
        const suggestedExam =
          examList.find((exam) =>
            user?.exam
              ? exam.name.toLowerCase().includes(user.exam.toLowerCase())
              : false,
          ) || examList[0];

        if (!active) {
          return;
        }

        startTransition(() => {
          setExams(examList);
          setSelectedExamSlug(suggestedExam?.slug || "");
          setStatus(
            token
              ? "Live practice bank connected. Generate a quiz and start solving."
              : "Sign in to open live quizzes, attempts, and result analysis.",
          );
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `Practice cockpit failed to boot: ${error.message}`
            : "Practice cockpit failed to boot.",
        );
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [hasHydrated, token, user, startTransition]);

  useEffect(() => {
    if (!selectedExamSlug) {
      return;
    }

    let active = true;

    async function loadSubjects() {
      try {
        const nextSubjects = await listSubjectsByExam(selectedExamSlug);

        if (!active) {
          return;
        }

        startTransition(() => {
          setSubjects(nextSubjects);
          setSelectedSubjectId(getId(nextSubjects[0]));
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setSubjects([]);
        setSelectedSubjectId("");
        setStatus(
          error instanceof Error
            ? `Subject list failed: ${error.message}`
            : "Subject list failed.",
        );
      }
    }

    void loadSubjects();

    return () => {
      active = false;
    };
  }, [selectedExamSlug, startTransition]);

  useEffect(() => {
    if (!selectedSubjectId) {
      return;
    }

    let active = true;

    async function loadChapters() {
      try {
        const nextChapters = await listChaptersBySubject(selectedSubjectId);

        if (!active) {
          return;
        }

        startTransition(() => {
          setChapters(nextChapters);
          setSelectedChapterId(getId(nextChapters[0]));
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setChapters([]);
        setSelectedChapterId("");
        setStatus(
          error instanceof Error
            ? `Chapter list failed: ${error.message}`
            : "Chapter list failed.",
        );
      }
    }

    void loadChapters();

    return () => {
      active = false;
    };
  }, [selectedSubjectId, startTransition]);

  useEffect(() => {
    if (!token) {
      setHistory([]);
      setStats(null);
      return;
    }

    const sessionToken: string = token;

    let active = true;

    async function loadPerformance() {
      try {
        const [attempts, statsSnapshot] = await Promise.all([
          getQuizHistory(sessionToken, 6),
          getQuizStats(sessionToken),
        ]);

        if (!active) {
          return;
        }

        startTransition(() => {
          setHistory(attempts);
          setStats(statsSnapshot);
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `Quiz stats fallback: ${error.message}`
            : "Quiz stats fallback active.",
        );
      }
    }

    void loadPerformance();

    return () => {
      active = false;
    };
  }, [token, startTransition]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [attempt]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.slug === selectedExamSlug) || null,
    [exams, selectedExamSlug],
  );

  const currentQuestion = questions[currentIndex] || null;

  const refreshPerformance = useCallback(async () => {
    if (!token) {
      return;
    }

    const [attempts, statsSnapshot] = await Promise.all([
      getQuizHistory(token, 6),
      getQuizStats(token),
    ]);

    setHistory(attempts);
    setStats(statsSnapshot);
  }, [token]);

  async function handleGenerate() {
    if (!token) {
      setStatus("Sign in from Profile to generate live quizzes and save attempts.");
      return;
    }

    try {
      setReview(null);
      setSelectedAnswer(null);

      let nextQuiz: QuizSummary;

      if (mode === "chapter") {
        nextQuiz = await generateChapterQuiz(token, {
          chapterId: selectedChapterId,
          count,
          timeLimitMinutes,
          passingScore,
          difficulty,
        });
      } else if (mode === "subject") {
        nextQuiz = await generateSubjectQuiz(token, {
          subjectId: selectedSubjectId,
          count,
          timeLimitMinutes,
          difficulty,
        });
      } else {
        nextQuiz = await generateMockTest(token, {
          examId: getId(selectedExam),
          count: Math.max(10, count),
          timeLimitMinutes: Math.max(30, timeLimitMinutes),
          passingScore,
        });
      }

      const started = await startQuizAttempt(token, getId(nextQuiz));

      setQuiz(nextQuiz);
      setAttempt(started.attempt);
      setQuestions(started.questions);
      setCurrentIndex(0);
      setSecondsLeft(started.timeLimit * 60);
      questionStartedAtRef.current = Date.now();
      setStatus(`Quiz launched: ${nextQuiz.title}`);
      finishingRef.current = false;
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Quiz generation failed.",
      );
    }
  }

  const handleFinish = useCallback(async (message?: string) => {
    if (!token || !attempt || finishingRef.current) {
      return;
    }

    try {
      finishingRef.current = true;
      const attemptId = getId(attempt);
      const finalAttempt = await finishQuizAttempt(token, attemptId);
      const reviewData = await reviewQuizAttempt(token, attemptId);

      setAttempt(finalAttempt);
      setReview(reviewData);
      setSecondsLeft(0);
      setStatus(
        message ||
          `Quiz finished at ${finalAttempt.score}% with ${finalAttempt.correct} correct answers.`,
      );
      await refreshPerformance();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Quiz submission failed.",
      );
    } finally {
      finishingRef.current = false;
    }
  }, [attempt, refreshPerformance, token]);

  async function handleSubmitCurrent() {
    if (!token || !attempt || !currentQuestion || selectedAnswer === null) {
      return;
    }

    try {
      await submitQuizAnswer(token, getId(attempt), {
        questionId: getId(currentQuestion),
        selectedAnswer,
        timeTakenSeconds: Math.max(
          1,
          Math.round((Date.now() - questionStartedAtRef.current) / 1000),
        ),
      });

      if (currentIndex >= questions.length - 1) {
        await handleFinish("Final answer recorded. Submitting quiz...");
        return;
      }

      setCurrentIndex((index) => index + 1);
      setSelectedAnswer(null);
      questionStartedAtRef.current = Date.now();
      setStatus(`Answer locked. Moving to question ${currentIndex + 2}.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not record answer.",
      );
    }
  }

  async function handleAbandon() {
    if (!token || !attempt) {
      return;
    }

    try {
      const abandoned = await abandonQuizAttempt(token, getId(attempt));
      setAttempt(abandoned);
      setQuestions([]);
      setSelectedAnswer(null);
      setSecondsLeft(0);
      setStatus("Current quiz attempt was abandoned.");
      await refreshPerformance();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not abandon quiz.",
      );
    }
  }

  useEffect(() => {
    if (secondsLeft !== 0 || !attempt || attempt.status !== "in_progress") {
      return;
    }

    void handleFinish("Timer ended. Auto-submitting your attempt.");
  }, [secondsLeft, attempt, handleFinish]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
            Quiz module
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
            Live practice cockpit
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
            {status}
          </p>
        </div>

        {!token && (
          <NeonButton onClick={() => router.push("/profile")}>
            <Sparkles size={16} />
            Sign in for quizzes
          </NeonButton>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white">Quiz builder</div>
            <div className="mt-4 grid gap-4">
              <label className="text-sm text-gray-300">
                Exam
                <select
                  value={selectedExamSlug}
                  onChange={(event) => setSelectedExamSlug(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  {exams.map((exam) => (
                    <option key={exam.slug} value={exam.slug} className="bg-black">
                      {exam.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-300">
                Subject
                <select
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  {subjects.map((subject) => (
                    <option
                      key={getId(subject) || subject.slug}
                      value={getId(subject)}
                      className="bg-black"
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-300">
                Chapter
                <select
                  value={selectedChapterId}
                  onChange={(event) => setSelectedChapterId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  disabled={mode === "mock"}
                >
                  {chapters.map((chapter) => (
                    <option
                      key={getId(chapter) || chapter.slug}
                      value={getId(chapter)}
                      className="bg-black"
                    >
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: "chapter", label: "Chapter" },
                  { value: "subject", label: "Subject" },
                  { value: "mock", label: "Mock" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setMode(item.value as "chapter" | "subject" | "mock")
                    }
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      mode === item.value
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-gray-300">
                  Question count
                  <input
                    type="number"
                    min={mode === "mock" ? 10 : 1}
                    max={50}
                    value={count}
                    onChange={(event) => setCount(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  />
                </label>

                <label className="text-sm text-gray-300">
                  Time limit
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(event) =>
                      setTimeLimitMinutes(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  />
                </label>

                <label className="text-sm text-gray-300">
                  Difficulty
                  <select
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(
                        event.target.value as "easy" | "medium" | "hard" | "mixed",
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    disabled={mode === "mock"}
                  >
                    <option value="mixed" className="bg-black">
                      Mixed
                    </option>
                    <option value="easy" className="bg-black">
                      Easy
                    </option>
                    <option value="medium" className="bg-black">
                      Medium
                    </option>
                    <option value="hard" className="bg-black">
                      Hard
                    </option>
                  </select>
                </label>

                <label className="text-sm text-gray-300">
                  Passing score
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(event) => setPassingScore(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  />
                </label>
              </div>

              <NeonButton onClick={() => void handleGenerate()}>
                <PlayCircle size={16} />
                {isPending ? "Launching..." : "Generate and start"}
              </NeonButton>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-5" glowColor="cyan">
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <Brain size={16} />
                Quiz average
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {stats?.avgScore || 0}%
              </div>
            </GlassCard>

            <GlassCard className="p-5" glowColor="orange">
              <div className="flex items-center gap-2 text-sm text-orange-300">
                <Trophy size={16} />
                Accuracy
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {stats?.accuracy || 0}%
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white">Recent attempts</div>
            <div className="mt-4 space-y-3">
              {history.length ? (
                history.map((entry) => (
                  <div
                    key={getId(entry) || `${entry.startedAt}-${entry.score}`}
                    className="rounded-2xl border border-white/8 bg-white/4 p-4"
                  >
                    <div className="text-sm font-semibold text-white">
                      {getHistoryTitle(entry)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        Score {entry.score}%
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        {entry.correct}/{entry.totalQuestions} correct
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-gray-400">
                  No quiz attempts yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          {attempt && attempt.status === "in_progress" && currentQuestion ? (
            <>
              <GlassCard className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-primary/80">
                      {quiz?.title || "Live quiz"}
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      Question {currentIndex + 1} of {questions.length}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-orange-300">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                      <AlarmClockCheck size={14} />
                      Timer
                    </div>
                    <div className="mt-1 text-2xl font-black">
                      {formatSeconds(secondsLeft)}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="text-sm font-semibold text-cyan-300">
                  {currentQuestion.subjectName} | {currentQuestion.chapterName}
                </div>
                <div className="mt-4 text-xl font-bold leading-8 text-white">
                  {currentQuestion.question}
                </div>
                <div className="mt-5 grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const active = selectedAnswer === index;

                    return (
                      <button
                        key={`${option.label}-${option.text}`}
                        type="button"
                        onClick={() => setSelectedAnswer(index)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          active
                            ? "border-primary/30 bg-primary/10"
                            : "border-white/8 bg-white/4 hover:border-white/15"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">
                          {option.label}. {option.text}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.hint && (
                  <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                    Hint: {currentQuestion.hint}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <NeonButton
                    onClick={() => void handleSubmitCurrent()}
                    disabled={selectedAnswer === null}
                  >
                    <CheckCircle2 size={16} />
                    Lock answer
                  </NeonButton>
                  <NeonButton
                    variant="outline"
                    glowColor="cyan"
                    onClick={() => {
                      if (currentIndex >= questions.length - 1) {
                        void handleFinish("Skipped final question. Submitting attempt.");
                        return;
                      }

                      setCurrentIndex((index) => index + 1);
                      setSelectedAnswer(null);
                      questionStartedAtRef.current = Date.now();
                    }}
                  >
                    <CircleSlash size={16} />
                    Skip
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    glowColor="pink"
                    onClick={() => void handleAbandon()}
                  >
                    Abandon
                  </NeonButton>
                </div>
              </GlassCard>
            </>
          ) : review ? (
            <>
              <GlassCard className="p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-primary/80">
                  Result analysis
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {review.attempt.score}% score
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Correct
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {review.attempt.correct}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Wrong
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {review.attempt.wrong}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Skipped
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {review.attempt.skipped}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-sm font-semibold text-white">Answer review</div>
                <div className="mt-4 space-y-4">
                  {review.review.map((item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-2xl border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">
                          Q{index + 1}. {item.question}
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide ${
                            item.isCorrect
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {item.isCorrect ? "correct" : "review"}
                        </span>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-gray-300">
                        Correct option:{" "}
                        {item.correctAnswer !== null && item.correctAnswer !== undefined
                          ? item.options[item.correctAnswer]?.label
                          : "-"}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-gray-400">
                        {item.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-6 text-sm leading-6 text-gray-400">
              Generate a quiz to open the live attempt view and result analysis.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
