"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Brain, CheckCircle2, FileSearch, Sparkles, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
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
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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
              ? "Tagged previous year questions are ready. Pick a year and start solving."
              : "Sign in to open the PYQ bank and verification engine.",
          );
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? `PYQ bootstrap failed: ${error.message}` : "PYQ bootstrap failed.");
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
          setSelectedSubjectId("all");
          setSelectedChapterId("all");
        });
      } catch (error) {
        if (!active) return;
        setSubjects([]);
      }
    }

    void loadSubjects();
    return () => { active = false; };
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
        if (!active) return;
        startTransition(() => {
          setChapters(nextChapters);
          setSelectedChapterId("all");
        });
      } catch (error) {
        if (!active) return;
        setChapters([]);
      }
    }

    void loadChapters();
    return () => { active = false; };
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
      setStatus(error instanceof Error ? error.message : "Could not load PYQs.");
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
      setStatus(error instanceof Error ? error.message : "Could not verify answer.");
    }
  }

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
        tag="PYQ module"
        title="Previous Year Practice Lane"
        subtitle={status}
        action={
          !token ? (
            <NeonButton onClick={() => router.push("/profile")}>
              <Sparkles size={16} /> Sign in for PYQs
            </NeonButton>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Finder filters */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white mb-4">PYQ Finder</div>
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
                Year
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="select-orbital mt-2"
                >
                  {["2024", "2023", "2022", "2021"].map((year) => (
                    <option key={year} value={year} className="bg-surface">
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-300">
                Subject filter
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="select-orbital mt-2"
                >
                  <option value="all" className="bg-surface">All subjects</option>
                  {subjects.map((subject) => (
                    <option key={getId(subject)} value={getId(subject)} className="bg-surface">
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-300">
                Chapter filter
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="select-orbital mt-2"
                >
                  <option value="all" className="bg-surface">All chapters</option>
                  {chapters.map((chapter) => (
                    <option key={getId(chapter)} value={getId(chapter)} className="bg-surface">
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </label>

              <NeonButton onClick={() => void loadPyqs()} className="w-full">
                <FileSearch size={16} /> Load PYQs
              </NeonButton>
            </div>
          </GlassCard>

          <div className="grid gap-4 grid-cols-2">
            <GlassCard className="p-4 text-center animate-float" glowColor="cyan">
              <div className="flex items-center justify-center gap-1.5 text-xs text-accent-cyan">
                <Brain size={14} /> Total Bank
              </div>
              <div className="mt-2 text-2xl font-black text-white">{stats?.grandTotal || 0}</div>
            </GlassCard>
            <GlassCard className="p-4 text-center animate-float" style={{ animationDelay: "-3s" }} glowColor="amber">
              <div className="flex items-center justify-center gap-1.5 text-xs text-accent-amber">
                <Target size={14} /> Filtered PYQs
              </div>
              <div className="mt-2 text-2xl font-black text-white">{filteredQuestions.length}</div>
            </GlassCard>
          </div>
        </div>

        {/* Question board */}
        <GlassCard className="p-5">
          <div className="text-sm font-semibold text-white mb-4">PYQ Review Board</div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
            {filteredQuestions.length ? (
              filteredQuestions.map((question, index) => {
                const result = results[getId(question)];

                return (
                  <div key={getId(question)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                        {question.subjectName}
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                        {question.chapterName}
                      </span>
                      {question.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary-light">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-sm font-semibold leading-relaxed text-gray-200">
                      Q{index + 1}. {question.question}
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const active = result?.selectedAnswer === optionIndex;
                        const correct = result?.correctAnswer === optionIndex;

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => void handleVerify(question, optionIndex)}
                            className={`w-full rounded-xl border p-3.5 text-left text-xs transition-all ${
                              correct
                                ? "border-accent-emerald/30 bg-accent-emerald/10 text-white font-semibold"
                                : active
                                  ? "border-primary/40 bg-primary/10 text-primary-light font-semibold"
                                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                            }`}
                          >
                            {option.label}. {option.text}
                          </button>
                        );
                      })}
                    </div>

                    {result && (
                      <div
                        className={`rounded-xl border p-4 text-xs leading-relaxed ${
                          result.isCorrect
                            ? "border-accent-emerald/20 bg-accent-emerald/5 text-gray-300"
                            : "border-accent-red/20 bg-accent-red/5 text-gray-300"
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 font-bold ${result.isCorrect ? "text-accent-emerald" : "text-accent-red"}`}>
                          <CheckCircle2 size={14} />
                          {result.isCorrect ? "Correct answer" : "Incorrect answer"}
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500">
                          Community Success Rate: {result.successRate}%
                        </div>
                        {result.explanation && (
                          <div className="mt-2 text-gray-400">
                            <span className="font-bold text-gray-200">Explanation:</span> {result.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-gray-500 py-8">
                Load a year-tagged PYQ bank from the left panel to begin.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
