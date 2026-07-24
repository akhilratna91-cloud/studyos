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
              ? "Live practice bank connected. Select parameters and generate a quiz."
              : "Sign in to activate live quizzes, track attempts, and view result analysis.",
          );
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? `Practice cockpit failed: ${error.message}` : "Practice cockpit failed.");
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
      } catch {
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
      } catch {
        if (!active) return;
        setChapters([]);
        setSelectedChapterId("");
      }
    }

    void loadChapters();
    return () => { active = false; };
  }, [selectedSubjectId, startTransition]);

  const loadUserData = useCallback(async () => {
    if (!token) return;
    try {
      const [hist, st] = await Promise.all([getQuizHistory(token, 5), getQuizStats(token)]);
      setHistory(hist);
      setStats(st);
    } catch {
      // fallback
    }
  }, [token]);

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  const currentQuestion = useMemo(
    () => questions[currentIndex] || null,
    [questions, currentIndex],
  );

  const handleFinish = useCallback(
    async (completionReason = "Quiz attempt completed.") => {
      if (!token || !attempt || finishingRef.current) return;
      finishingRef.current = true;

      try {
        const attemptId = getId(attempt);
        await finishQuizAttempt(token, attemptId);
        const reviewData = await reviewQuizAttempt(token, attemptId);

        setReview(reviewData);
        setAttempt(null);
        setQuiz(null);
        setQuestions([]);
        setStatus(completionReason);
        void loadUserData();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to finish attempt.");
      } finally {
        finishingRef.current = false;
      }
    },
    [token, attempt, loadUserData],
  );

  useEffect(() => {
    if (!attempt || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleFinish("Time expired. Quiz auto-submitted.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, secondsLeft, handleFinish]);

  async function handleGenerateQuiz() {
    if (!token) {
      router.push("/profile");
      return;
    }

    setStatus("Generating custom quiz parameters...");
    try {
      let createdQuiz: QuizSummary;

      if (mode === "chapter") {
        if (!selectedChapterId) throw new Error("Select a chapter first.");
        createdQuiz = await generateChapterQuiz(token, {
          chapterId: selectedChapterId,
          count,
          timeLimitMinutes,
          difficulty,
        });
      } else if (mode === "subject") {
        if (!selectedSubjectId) throw new Error("Select a subject first.");
        createdQuiz = await generateSubjectQuiz(token, {
          subjectId: selectedSubjectId,
          count,
          timeLimitMinutes,
          difficulty,
        });
      } else {
        const selectedExam = exams.find((e) => e.slug === selectedExamSlug);
        const examId = getId(selectedExam);
        if (!examId) throw new Error("Select an exam first.");

        createdQuiz = await generateMockTest(token, {
          examId,
          count,
          timeLimitMinutes,
          passingScore,
        });
      }

      setQuiz(createdQuiz);
      setStatus(`Quiz generated: ${createdQuiz.title}. Ready to start attempt.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Quiz generation failed.");
    }
  }

  async function handleStartQuiz() {
    if (!token || !quiz) return;

    try {
      const quizId = getId(quiz);
      const session = await startQuizAttempt(token, quizId);

      setAttempt(session.attempt);
      setQuestions(session.questions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setReview(null);
      setSecondsLeft((session.attempt.timeLimitMinutes || 20) * 60);
      questionStartedAtRef.current = Date.now();
      setStatus(`Attempt started for ${quiz.title}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to start quiz.");
    }
  }

  async function handleSubmitCurrent() {
    if (!token || !attempt || !currentQuestion || selectedAnswer === null) return;

    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartedAtRef.current) / 1000),
    );

    try {
      const attemptId = getId(attempt);
      const questionId = getId(currentQuestion);

      await submitQuizAnswer(token, attemptId, {
        questionId,
        selectedAnswer,
        timeTakenSeconds,
      });

      if (currentIndex >= questions.length - 1) {
        await handleFinish("All questions answered. Quiz finished.");
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        questionStartedAtRef.current = Date.now();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to submit answer.");
    }
  }

  async function handleAbandon() {
    if (!token || !attempt) return;
    try {
      const attemptId = getId(attempt);
      await abandonQuizAttempt(token, attemptId);
      setAttempt(null);
      setQuestions([]);
      setQuiz(null);
      setStatus("Attempt abandoned.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to abandon attempt.");
    }
  }

  if (!hasHydrated || loading || isPending) {
    return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;
  }

  return (
    <div className="space-y-6 theme-quiz">
      <PageHeader tag="Quiz Arena" title="Live Interactive Quiz Arena" subtitle={status} />

      {/* Top Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <GlassCard glowColor="purple" className="p-4 border-purple-500/30">
            <div className="font-mono text-[10px] uppercase text-purple-300">Total Quizzes</div>
            <div className="font-heading mt-1 text-xl font-bold text-white">{stats.totalQuizzes}</div>
          </GlassCard>
          <GlassCard glowColor="emerald" className="p-4 border-emerald-500/30">
            <div className="font-mono text-[10px] uppercase text-emerald-300">Pass Rate</div>
            <div className="font-heading mt-1 text-xl font-bold text-emerald-400">{stats.passRate}%</div>
          </GlassCard>
          <GlassCard glowColor="purple" className="p-4 border-purple-500/30">
            <div className="font-mono text-[10px] uppercase text-purple-300 font-semibold">Accuracy</div>
            <div className="font-heading mt-1 text-xl font-bold text-white">{stats.accuracy}%</div>
          </GlassCard>
          <GlassCard glowColor="purple" className="p-4 border-purple-500/30">
            <div className="font-mono text-[10px] uppercase text-pink-300 font-semibold">Avg Score</div>
            <div className="font-heading mt-1 text-xl font-bold text-pink-400">{stats.avgScore}%</div>
          </GlassCard>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Left: Controls & Config */}
        <div className="space-y-6">
          <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
            <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-purple-300 mb-4">
              <Sparkles size={16} className="text-pink-400" /> Quiz Mode & Config
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "chapter", label: "Chapter Focus" },
                { id: "subject", label: "Subject Arena" },
                { id: "mock", label: "Full Mock Test" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as typeof mode)}
                  className={`rounded-lg border p-3 font-mono text-xs font-semibold transition-all ${
                    mode === item.id
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/20 bg-purple-950/20 text-purple-300/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-purple-200">
                Exam Stream
                <select value={selectedExamSlug} onChange={(e) => setSelectedExamSlug(e.target.value)} className="select-orbital mt-1.5">
                  {exams.map((ex) => (
                    <option key={ex.slug} value={ex.slug} className="bg-[#0E0919]">{ex.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Subject Focus
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="select-orbital mt-1.5">
                  {subjects.map((sub) => (
                    <option key={getId(sub)} value={getId(sub)} className="bg-[#0E0919]">{sub.name}</option>
                  ))}
                </select>
              </label>

              {mode === "chapter" && (
                <label className="text-xs font-semibold text-purple-200 sm:col-span-2">
                  Chapter Target
                  <select value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} className="select-orbital mt-1.5">
                    {chapters.map((chap) => (
                      <option key={getId(chap)} value={getId(chap)} className="bg-[#0E0919]">{chap.name}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="text-xs font-semibold text-purple-200">
                Question Count
                <input type="number" min={3} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-orbital mt-1.5" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Time Limit (Mins)
                <input type="number" min={5} max={180} value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(Number(e.target.value))} className="input-orbital mt-1.5" />
              </label>

              <label className="text-xs font-semibold text-purple-200">
                Difficulty
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="select-orbital mt-1.5">
                  <option value="mixed" className="bg-[#0E0919]">Mixed Challenge</option>
                  <option value="easy" className="bg-[#0E0919]">Easy Foundation</option>
                  <option value="medium" className="bg-[#0E0919]">Medium Mastery</option>
                  <option value="hard" className="bg-[#0E0919]">Hard Competition</option>
                </select>
              </label>

              {mode === "mock" && (
                <label className="text-xs font-semibold text-purple-200">
                  Passing Threshold (%)
                  <input type="number" min={30} max={95} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className="input-orbital mt-1.5" />
                </label>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <NeonButton variant="solid" glowColor="purple" onClick={() => void handleGenerateQuiz()}>
                <Brain size={16} /> Generate Quiz
              </NeonButton>
              {quiz && !attempt && (
                <NeonButton variant="solid" glowColor="emerald" onClick={() => void handleStartQuiz()}>
                  <PlayCircle size={16} /> Start Quiz Session
                </NeonButton>
              )}
            </div>
          </GlassCard>

          {/* History */}
          {history.length > 0 && (
            <GlassCard glowColor="purple" className="p-5 border-purple-500/25">
              <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                <Trophy size={16} className="text-amber-400" /> Recent Quiz Attempts
              </div>
              <div className="space-y-2">
                {history.map((hist) => (
                  <div key={getId(hist)} className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 font-mono text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{getHistoryTitle(hist)}</div>
                      <div className="text-[10px] text-purple-300/70">{hist.totalQuestions} Questions • {hist.timeLimitMinutes}m</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{hist.score}%</div>
                      <div className="text-[9px] uppercase text-purple-300">{hist.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right: Live Attempt Cockpit or Review */}
        <div className="space-y-6">
          {attempt && currentQuestion ? (
            <>
              {/* Question Header Bar */}
              <GlassCard glowColor="purple" className="p-5 border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-purple-300 font-semibold uppercase">{quiz?.title || "Live Quiz"}</span>
                    <h3 className="font-heading text-lg font-bold text-white mt-1">
                      Question {currentIndex + 1} of {questions.length}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                    <AlarmClockCheck size={16} />
                    <span className="font-mono font-bold text-sm">{formatSeconds(secondsLeft)}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Question Card */}
              <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
                <div className="font-mono text-xs text-emerald-400 font-semibold mb-3">
                  {currentQuestion.subjectName} • {currentQuestion.chapterName}
                </div>
                <p className="text-base font-medium leading-relaxed text-white">
                  {currentQuestion.question}
                </p>

                <div className="mt-6 space-y-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const active = selectedAnswer === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`w-full rounded-lg border p-4 text-left font-mono text-xs transition-all ${
                          active
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold"
                            : "border-purple-500/20 bg-purple-950/20 text-purple-200 hover:border-purple-400/50 hover:bg-purple-900/30"
                        }`}
                      >
                        <span className="font-bold text-purple-400 mr-2">{option.label}.</span> {option.text}
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.hint && (
                  <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200">
                    <span className="font-bold text-cyan-400">Hint:</span> {currentQuestion.hint}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <NeonButton variant="solid" glowColor="emerald" onClick={() => void handleSubmitCurrent()} disabled={selectedAnswer === null}>
                    Lock Answer
                  </NeonButton>
                  <NeonButton
                    variant="outline"
                    glowColor="purple"
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
                    <CircleSlash size={14} /> Skip Question
                  </NeonButton>
                  <NeonButton variant="ghost" glowColor="magenta" onClick={() => void handleAbandon()}>
                    Abandon Attempt
                  </NeonButton>
                </div>
              </GlassCard>
            </>
          ) : review ? (
            <>
              <GlassCard glowColor="purple" className="p-6 border-purple-500/30">
                <div className="font-mono text-xs font-semibold uppercase tracking-widest text-purple-300">Attempt Results Analysis</div>
                <div className="mt-2 text-3xl font-extrabold text-white text-gradient-emerald-purple">{review.attempt.score}% Score</div>
                <div className="mt-4 grid gap-3 grid-cols-3 text-center font-mono">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
                    <div className="text-[10px] text-emerald-400 uppercase">Correct</div>
                    <div className="text-xl font-bold text-emerald-300 mt-1">{review.attempt.correct}</div>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3">
                    <div className="text-[10px] text-rose-400 uppercase">Wrong</div>
                    <div className="text-xl font-bold text-rose-300 mt-1">{review.attempt.wrong}</div>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3">
                    <div className="text-[10px] text-amber-400 uppercase">Skipped</div>
                    <div className="text-xl font-bold text-amber-300 mt-1">{review.attempt.skipped}</div>
                  </div>
                </div>
              </GlassCard>

              {/* Review Items */}
              <div className="no-scrollbar space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {review.review.map((item, index) => (
                  <GlassCard key={index} className={`p-5 border-l-4 ${item.isCorrect ? "border-l-emerald-400 border-emerald-500/25" : "border-l-rose-500 border-rose-500/25"}`}>
                    <div className="font-mono text-xs font-bold text-purple-300 uppercase">Question {index + 1}</div>
                    <p className="mt-2 text-sm font-semibold text-white">{item.question}</p>

                    <div className="mt-4 space-y-2 font-mono">
                      {item.options.map((option, optIdx) => {
                        const isSelected = item.selectedAnswer === optIdx;
                        const isCorrectOpt = item.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`rounded-lg border p-3 text-xs ${
                              isCorrectOpt
                                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold"
                                : isSelected
                                  ? "border-rose-500/40 bg-rose-950/30 text-rose-300"
                                  : "border-purple-500/10 bg-purple-950/10 text-purple-300/70"
                            }`}
                          >
                            <span className="font-bold mr-2">{option.label}.</span> {option.text}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 text-xs text-purple-200/80">
                        <span className="font-bold text-emerald-400">Explanation:</span> {item.explanation}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </>
          ) : (
            <GlassCard className="p-8 text-center text-sm text-purple-300/80 border-purple-500/25">
              Select parameters on the left and click &quot;Generate Quiz&quot; to begin your practice session.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
