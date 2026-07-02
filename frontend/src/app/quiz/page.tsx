"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  Brain,
  CircleSlash,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
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
  const [loading, setLoading] = useState(true);
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
    if (!hasHydrated) return;
    let active = true;

    async function bootstrap() {
      try {
        const examList = await listExams();
        const suggestedExam =
          examList.find((exam) =>
            user?.exam ? exam.name.toLowerCase().includes(user.exam.toLowerCase()) : false,
          ) || examList[0];

        if (!active) return;

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
        if (!active) return;
        setStatus(error instanceof Error ? `Practice cockpit failed to boot: ${error.message}` : "Practice cockpit failed to boot.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();
    return () => { active = false; };
  }, [hasHydrated, token, user, startTransition]);

  useEffect(() => {
    if (!selectedExamSlug) return;
    let active = true;

    async function loadSubjects() {
      try {
        const nextSubjects = await listSubjectsByExam(selectedExamSlug);
        if (!active) return;
        startTransition(() => {
          setSubjects(nextSubjects);
          setSelectedSubjectId(getId(nextSubjects[0]));
        });
      } catch (error) {
        if (!active) return;
        setSubjects([]);
        setSelectedSubjectId("");
      }
    }

    void loadSubjects();
    return () => { active = false; };
  }, [selectedExamSlug, startTransition]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    let active = true;

    async function loadChapters() {
      try {
        const nextChapters = await listChaptersBySubject(selectedSubjectId);
        if (!active) return;
        startTransition(() => {
          setChapters(nextChapters);
          setSelectedChapterId(getId(nextChapters[0]));
        });
      } catch (error) {
        if (!active) return;
        setChapters([]);
        setSelectedChapterId("");
      }
    }

    void loadChapters();
    return () => { active = false; };
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
        if (!active) return;
        startTransition(() => {
          setHistory(attempts);
          setStats(statsSnapshot);
        });
      } catch {
        // fallback
      }
    }

    void loadPerformance();
    return () => { active = false; };
  }, [token, startTransition]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attempt]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.slug === selectedExamSlug) || null,
    [exams, selectedExamSlug],
  );

  const currentQuestion = questions[currentIndex] || null;

  const refreshPerformance = useCallback(async () => {
    if (!token) return;
    try {
      const [attempts, statsSnapshot] = await Promise.all([
        getQuizHistory(token, 6),
        getQuizStats(token),
      ]);
      setHistory(attempts);
      setStats(statsSnapshot);
    } catch { /* fallback */ }
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
      setStatus(error instanceof Error ? error.message : "Quiz generation failed.");
    }
  }

  const handleFinish = useCallback(async (message?: string) => {
    if (!token || !attempt || finishingRef.current) return;

    try {
      finishingRef.current = true;
      const attemptId = getId(attempt);
      const finalAttempt = await finishQuizAttempt(token, attemptId);
      const reviewData = await reviewQuizAttempt(token, attemptId);

      setAttempt(finalAttempt);
      setReview(reviewData);
      setSecondsLeft(0);
      setStatus(message || `Quiz finished at ${finalAttempt.score}% accuracy.`);
      await refreshPerformance();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Quiz submission failed.");
    } finally {
      finishingRef.current = false;
    }
  }, [attempt, refreshPerformance, token]);

  async function handleSubmitCurrent() {
    if (!token || !attempt || !currentQuestion || selectedAnswer === null) return;

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
      setStatus(error instanceof Error ? error.message : "Could not record answer.");
    }
  }

  async function handleAbandon() {
    if (!token || !attempt) return;

    try {
      const abandoned = await abandonQuizAttempt(token, getId(attempt));
      setAttempt(abandoned);
      setQuestions([]);
      setSelectedAnswer(null);
      setSecondsLeft(0);
      setStatus("Current quiz attempt was abandoned.");
      await refreshPerformance();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not abandon quiz.");
    }
  }

  useEffect(() => {
    if (secondsLeft !== 0 || !attempt || attempt.status !== "in_progress") return;
    void handleFinish("Timer ended. Auto-submitting your attempt.");
  }, [secondsLeft, attempt, handleFinish]);

  if (!hasHydrated || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <OrbitLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        tag="Quiz module"
        title="Live Practice Cockpit"
        subtitle={status}
        action={
          !token ? (
            <NeonButton onClick={() => router.push("/profile")}>
              <Sparkles size={16} /> Sign in for quizzes
            </NeonButton>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Left column */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white mb-4">Quiz Builder</div>
            <div className="space-y-4">
              <label className="block text-sm text-gray-300">
                Exam
                <select
                  value={selectedExamSlug}
                  onChange={(e) => setSelectedExamSlug(e.target.value)}
                  className="select-orbital mt-2"
                >
                  {exams.map((exam) => (
                    <option key={exam.slug} value={exam.slug} className="bg-surface">
                      {exam.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-300">
                Subject
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="select-orbital mt-2"
                >
                  {subjects.map((subject) => (
                    <option key={getId(subject)} value={getId(subject)} className="bg-surface">
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-300">
                Chapter
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="select-orbital mt-2"
                  disabled={mode === "mock"}
                >
                  {chapters.map((chapter) => (
                    <option key={getId(chapter)} value={getId(chapter)} className="bg-surface">
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2 grid-cols-3">
                {[
                  { value: "chapter", label: "Chapter" },
                  { value: "subject", label: "Subject" },
                  { value: "mock", label: "Mock" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value as "chapter" | "subject" | "mock")}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      mode === item.value
                        ? "border-primary/30 bg-primary/10 text-primary-light"
                        : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-gray-300">
                  Question count
                  <input
                    type="number"
                    min={mode === "mock" ? 10 : 1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="input-orbital mt-2"
                  />
                </label>

                <label className="block text-sm text-gray-300">
                  Time limit (min)
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="input-orbital mt-2"
                  />
                </label>

                <label className="block text-sm text-gray-300">
                  Difficulty
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                    className="select-orbital mt-2"
                    disabled={mode === "mock"}
                  >
                    <option value="mixed" className="bg-surface">Mixed</option>
                    <option value="easy" className="bg-surface">Easy</option>
                    <option value="medium" className="bg-surface">Medium</option>
                    <option value="hard" className="bg-surface">Hard</option>
                  </select>
                </label>

                <label className="block text-sm text-gray-300">
                  Passing score (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="input-orbital mt-2"
                  />
                </label>
              </div>

              <NeonButton onClick={() => void handleGenerate()} className="w-full">
                <PlayCircle size={16} /> {isPending ? "Launching..." : "Launch Quiz"}
              </NeonButton>
            </div>
          </GlassCard>

          <div className="grid gap-4 grid-cols-2">
            <GlassCard className="p-4 text-center animate-float" glowColor="cyan">
              <div className="flex items-center justify-center gap-1.5 text-xs text-accent-cyan">
                <Brain size={14} /> Average Score
              </div>
              <div className="mt-2 text-2xl font-black text-white">{stats?.avgScore || 0}%</div>
            </GlassCard>
            <GlassCard className="p-4 text-center animate-float" style={{ animationDelay: "-3s" }} glowColor="amber">
              <div className="flex items-center justify-center gap-1.5 text-xs text-accent-amber">
                <Trophy size={14} /> Accuracy
              </div>
              <div className="mt-2 text-2xl font-black text-white">{stats?.accuracy || 0}%</div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white mb-4">Recent Attempts</div>
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {history.length ? (
                history.map((entry) => (
                  <div key={getId(entry)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-white">{getHistoryTitle(entry)}</div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        {entry.correct}/{entry.totalQuestions} correct • {entry.status}
                      </div>
                    </div>
                    <span className="text-sm font-black text-primary-light">{entry.score}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-gray-500 py-4">No recent attempts.</div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column — Live Quiz / Review */}
        <div className="space-y-6">
          {attempt && attempt.status === "in_progress" && currentQuestion ? (
            <>
              <GlassCard className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light">
                      {quiz?.title || "Live quiz"}
                    </div>
                    <h3 className="mt-1 text-lg font-black text-white">
                      Question {currentIndex + 1} of {questions.length}
                    </h3>
                  </div>
                  <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/10 px-4 py-2 text-accent-amber flex items-center gap-2">
                    <AlarmClockCheck size={16} />
                    <span className="font-mono font-bold">{formatSeconds(secondsLeft)}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="text-xs text-accent-cyan font-bold mb-3">
                  {currentQuestion.subjectName} • {currentQuestion.chapterName}
                </div>
                <p className="text-base font-medium leading-relaxed text-gray-200">
                  {currentQuestion.question}
                </p>

                <div className="mt-6 space-y-2">
                  {currentQuestion.options.map((option, index) => {
                    const active = selectedAnswer === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          active
                            ? "border-primary/40 bg-primary/10 text-primary-light"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="font-semibold">{option.label}.</span> {option.text}
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.hint && (
                  <div className="mt-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.05] p-4 text-xs text-gray-300">
                    <span className="font-bold text-accent-cyan">Hint:</span> {currentQuestion.hint}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <NeonButton onClick={() => void handleSubmitCurrent()} disabled={selectedAnswer === null}>
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
                      setCurrentIndex((i) => i + 1);
                      setSelectedAnswer(null);
                      questionStartedAtRef.current = Date.now();
                    }}
                  >
                    <CircleSlash size={14} /> Skip
                  </NeonButton>
                  <NeonButton variant="ghost" glowColor="magenta" onClick={() => void handleAbandon()}>
                    Abandon
                  </NeonButton>
                </div>
              </GlassCard>
            </>
          ) : review ? (
            <>
              <GlassCard className="p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-primary-light font-bold">Result Analysis</div>
                <div className="mt-2 text-3xl font-black text-white">{review.attempt.score}% Score</div>
                <div className="mt-4 grid gap-3 grid-cols-3 text-center">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Correct</div>
                    <div className="text-xl font-bold text-accent-emerald mt-1">{review.attempt.correct}</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Wrong</div>
                    <div className="text-xl font-bold text-accent-red mt-1">{review.attempt.wrong}</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Skipped</div>
                    <div className="text-xl font-bold text-accent-amber mt-1">{review.attempt.skipped}</div>
                  </div>
                </div>
              </GlassCard>

              {/* Review List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                {review.review.map((item, index) => (
                  <GlassCard key={index} className={`p-5 border-l-4 ${item.isCorrect ? "border-l-accent-emerald" : "border-l-accent-red"}`}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Question {index + 1}</div>
                    <p className="mt-2 text-sm font-semibold text-white">{item.question}</p>

                    <div className="mt-4 space-y-2">
                      {item.options.map((option, optIdx) => {
                        const isSelected = item.selectedAnswer === optIdx;
                        const isCorrectOpt = item.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`rounded-xl border p-3 text-xs ${
                              isCorrectOpt
                                ? "border-accent-emerald/30 bg-accent-emerald/10 text-white"
                                : isSelected
                                  ? "border-accent-red/30 bg-accent-red/10 text-white"
                                  : "border-white/[0.06] bg-white/[0.02]"
                            }`}
                          >
                            <span className="font-bold">{option.label}.</span> {option.text}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-gray-400">
                        <span className="font-bold text-gray-200">Explanation:</span> {item.explanation}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </>
          ) : (
            <GlassCard className="p-8 text-center text-sm text-gray-500">
              Launch a quiz to start the practice cockpit.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
