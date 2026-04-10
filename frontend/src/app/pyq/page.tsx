"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Brain, CheckCircle2, FileSearch, Sparkles, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import {
  getQuestionStats,
  listChaptersBySubject,
  listExams,
  listSubjectsByExam,
  searchQuestionsByTags,
  verifyQuestionAnswer,
  type ChapterSummary,
  type ExamSummary,
  type QuestionBankItem,
  type QuestionStatsSummary,
  type SubjectSummary,
} from "@/lib/api";
import { useUserStore } from "@/store/user-store";

function getId(item?: { id?: string; _id?: string } | null) {
  return item?.id || item?._id || "";
}

type VerifySnapshot = {
  selectedAnswer: number;
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  successRate: number;
};

export default function PyqPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useUserStore();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedExamSlug, setSelectedExamSlug] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedChapterId, setSelectedChapterId] = useState("all");
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [stats, setStats] = useState<QuestionStatsSummary | null>(null);
  const [results, setResults] = useState<Record<string, VerifySnapshot>>({});
  const [status, setStatus] = useState("Preparing PYQ lane...");
  const [isPending, startTransition] = useTransition();

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
              ? "Tagged previous year questions are ready. Pick a year and start solving."
              : "Sign in to open the PYQ bank and verification engine.",
          );
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `PYQ bootstrap failed: ${error.message}`
            : "PYQ bootstrap failed.",
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
          setSelectedSubjectId("all");
          setSelectedChapterId("all");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setSubjects([]);
        setStatus(
          error instanceof Error
            ? `Subject filter failed: ${error.message}`
            : "Subject filter failed.",
        );
      }
    }

    void loadSubjects();

    return () => {
      active = false;
    };
  }, [selectedExamSlug, startTransition]);

  useEffect(() => {
    if (selectedSubjectId === "all") {
      setChapters([]);
      setSelectedChapterId("all");
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
          setSelectedChapterId("all");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setChapters([]);
        setStatus(
          error instanceof Error
            ? `Chapter filter failed: ${error.message}`
            : "Chapter filter failed.",
        );
      }
    }

    void loadChapters();

    return () => {
      active = false;
    };
  }, [selectedSubjectId, startTransition]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.slug === selectedExamSlug) || null,
    [exams, selectedExamSlug],
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => getId(subject) === selectedSubjectId) || null,
    [subjects, selectedSubjectId],
  );

  const selectedChapter = useMemo(
    () => chapters.find((chapter) => getId(chapter) === selectedChapterId) || null,
    [chapters, selectedChapterId],
  );

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const subjectPass = selectedSubject ? question.subjectName === selectedSubject.name : true;
      const chapterPass = selectedChapter ? question.chapterName === selectedChapter.name : true;
      return subjectPass && chapterPass;
    });
  }, [questions, selectedSubject, selectedChapter]);

  async function loadPyqs() {
    if (!token || !selectedExam) {
      setStatus("Sign in to load the live PYQ bank.");
      return;
    }

    try {
      const yearTag = `${selectedExam.slug}-${selectedYear}`;
      let pyqQuestions = await searchQuestionsByTags(token, [yearTag], getId(selectedExam));

      if (pyqQuestions.length === 0) {
        pyqQuestions = await searchQuestionsByTags(token, ["pyq"], getId(selectedExam));
      }

      const questionStats = await getQuestionStats(token, getId(selectedExam));
      setQuestions(pyqQuestions);
      setStats(questionStats);
      setResults({});
      setStatus(`Loaded ${pyqQuestions.length} PYQs for ${selectedExam.name}.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not load PYQs.",
      );
    }
  }

  async function handleVerify(question: QuestionBankItem, answerIndex: number) {
    if (!token) {
      setStatus("Sign in to verify PYQ answers.");
      return;
    }

    try {
      const result = await verifyQuestionAnswer(token, getId(question), answerIndex);
      setResults((current) => ({
        ...current,
        [getId(question)]: {
          selectedAnswer: answerIndex,
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          successRate: result.successRate,
        },
      }));
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not verify answer.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
            PYQ module
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
            Previous year practice lane
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
            {status}
          </p>
        </div>

        {!token && (
          <NeonButton onClick={() => router.push("/profile")}>
            <Sparkles size={16} />
            Sign in for PYQs
          </NeonButton>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white">PYQ finder</div>
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
                Year
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  {["2024", "2023", "2022", "2021"].map((year) => (
                    <option key={year} value={year} className="bg-black">
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-300">
                Subject filter
                <select
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  <option value="all" className="bg-black">
                    All subjects
                  </option>
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
                Chapter filter
                <select
                  value={selectedChapterId}
                  onChange={(event) => setSelectedChapterId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  <option value="all" className="bg-black">
                    All chapters
                  </option>
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

              <NeonButton onClick={() => void loadPyqs()}>
                <FileSearch size={16} />
                {isPending ? "Loading..." : "Load PYQs"}
              </NeonButton>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-5" glowColor="cyan">
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <Brain size={16} />
                Question bank
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {stats?.grandTotal || 0}
              </div>
            </GlassCard>

            <GlassCard className="p-5" glowColor="orange">
              <div className="flex items-center gap-2 text-sm text-orange-300">
                <Target size={16} />
                Active PYQs
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {filteredQuestions.length}
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="p-5">
          <div className="text-sm font-semibold text-white">PYQ review board</div>
          <div className="mt-4 space-y-4">
            {filteredQuestions.length ? (
              filteredQuestions.map((question, index) => {
                const result = results[getId(question)];

                return (
                  <div
                    key={getId(question) || `${question.question}-${index}`}
                    className="rounded-2xl border border-white/8 bg-white/4 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        {question.subjectName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        {question.chapterName}
                      </span>
                      {question.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 text-sm font-semibold leading-7 text-white">
                      Q{index + 1}. {question.question}
                    </div>

                    <div className="mt-4 grid gap-3">
                      {question.options.map((option, optionIndex) => {
                        const active = result?.selectedAnswer === optionIndex;
                        const correct = result?.correctAnswer === optionIndex;

                        return (
                          <button
                            key={`${option.label}-${option.text}`}
                            type="button"
                            onClick={() => void handleVerify(question, optionIndex)}
                            className={`rounded-2xl border p-4 text-left transition-colors ${
                              correct
                                ? "border-emerald-400/30 bg-emerald-500/10"
                                : active
                                  ? "border-primary/30 bg-primary/10"
                                  : "border-white/8 bg-white/4 hover:border-white/15"
                            }`}
                          >
                            <div className="text-sm text-white">
                              {option.label}. {option.text}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {result && (
                      <div
                        className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
                          result.isCorrect
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                            : "border-rose-400/20 bg-rose-500/10 text-rose-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 size={14} />
                          {result.isCorrect ? "Correct" : "Review this concept"}
                        </div>
                        <div className="mt-2">
                          Success rate: {result.successRate}%
                        </div>
                        <div className="mt-2 text-sm leading-6">
                          {result.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-gray-400">
                Load a year-tagged PYQ bank to start solving previous year questions.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
