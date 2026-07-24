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
              ? "Previous year questions ready. Filter by year or subject and verify answers instantly."
              : "Sign in from Profile to access the PYQ question bank and verification engine.",
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
      } catch {
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
      } catch {
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

  useEffect(() => {
    if (!token || !selectedExam) return;
    let active = true;

    async function fetchStats() {
      try {
        const examId = getId(selectedExam);
        const data = await getQuestionStats(token!, examId);
        if (active) setStats(data);
      } catch {
        // fallback
      }
    }

    void fetchStats();
    return () => { active = false; };
  }, [token, selectedExam]);

  async function handleSearch() {
    if (!token) {
      router.push("/profile");
      return;
    }

    const tags = [selectedYear, selectedExamSlug].filter(Boolean);
    if (selectedSubjectId !== "all") {
      const sub = subjects.find((s) => getId(s) === selectedSubjectId);
      if (sub) tags.push(sub.name.toLowerCase());
    }

    setStatus("Querying PYQ database...");
    try {
      const items = await searchQuestionsByTags(token, tags);
      setQuestions(items);
      setResults({});
      setStatus(`Retrieved ${items.length} PYQ items for ${selectedYear}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Search failed.");
    }
  }

  async function handleVerify(q: QuestionBankItem, optionIndex: number) {
    if (!token) return;
    const qId = getId(q);
    if (!qId) return;

    try {
      const res = await verifyQuestionAnswer(token, qId, optionIndex);
      setResults((prev) => ({
        ...prev,
        [qId]: {
          selectedAnswer: optionIndex,
          isCorrect: res.isCorrect,
          correctAnswer: res.correctAnswer,
          explanation: res.explanation,
          successRate: res.successRate,
        },
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Verification failed.");
    }
  }

  if (!hasHydrated || loading || isPending) {
    return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;
  }

  return (
    <div className="space-y-6 theme-pyq">
      <PageHeader tag="PYQ Bank (Emerald & Amber Blend)" title="Previous Year Question Vault" subtitle={status} />

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono">
          <GlassCard glowColor="emerald" className="p-4 border-emerald-500/30">
            <div className="text-[10px] uppercase text-emerald-400">Total Questions</div>
            <div className="font-heading mt-1 text-xl font-bold text-white">{stats.grandTotal}</div>
          </GlassCard>
          <GlassCard glowColor="amber" className="p-4 border-amber-500/30">
            <div className="text-[10px] uppercase text-amber-400">Subjects Tracked</div>
            <div className="font-heading mt-1 text-xl font-bold text-amber-300">{stats.subjects?.length || 3}</div>
          </GlassCard>
          <GlassCard glowColor="emerald" className="p-4 border-emerald-500/30">
            <div className="text-[10px] uppercase text-emerald-400">Difficulty Spectrum</div>
            <div className="font-heading mt-1 text-xl font-bold text-white">Mixed</div>
          </GlassCard>
          <GlassCard glowColor="purple" className="p-4 border-purple-500/30">
            <div className="text-[10px] uppercase text-purple-300">Target Stream</div>
            <div className="font-heading mt-1 text-xl font-bold text-purple-200">{selectedExam?.name || "JEE Main"}</div>
          </GlassCard>
        </div>
      )}

      {/* Filter Panel */}
      <GlassCard glowColor="amber" className="p-6 border-amber-500/30">
        <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
          <Sparkles size={16} /> PYQ Search Matrix
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-amber-200">
            Exam Category
            <select value={selectedExamSlug} onChange={(e) => setSelectedExamSlug(e.target.value)} className="select-orbital mt-1.5">
              {exams.map((ex) => (
                <option key={ex.slug} value={ex.slug} className="bg-[#0E0919]">{ex.name}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-amber-200">
            Target Year
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="select-orbital mt-1.5">
              {["2024", "2023", "2022", "2021", "2020"].map((yr) => (
                <option key={yr} value={yr} className="bg-[#0E0919]">Year {yr}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-amber-200">
            Subject Filter
            <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="select-orbital mt-1.5">
              <option value="all" className="bg-[#0E0919]">All Subjects</option>
              {subjects.map((sub) => (
                <option key={getId(sub)} value={getId(sub)} className="bg-[#0E0919]">{sub.name}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-amber-200">
            Chapter Filter
            <select value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} className="select-orbital mt-1.5">
              <option value="all" className="bg-[#0E0919]">All Chapters</option>
              {chapters.map((chap) => (
                <option key={getId(chap)} value={getId(chap)} className="bg-[#0E0919]">{chap.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <NeonButton variant="solid" glowColor="amber" onClick={() => void handleSearch()}>
            <FileSearch size={16} /> Fetch PYQ Questions
          </NeonButton>
        </div>
      </GlassCard>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Target size={16} /> Retrieved PYQ Items ({questions.length})
          </h3>
        </div>

        <div className="grid gap-4">
          {questions.map((q, qIdx) => {
            const qId = getId(q);
            const verify = results[qId];

            return (
              <GlassCard key={qId || qIdx} glowColor={verify?.isCorrect ? "emerald" : "amber"} className="p-6 border-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3 mb-4">
                  <div className="font-mono text-xs font-semibold text-amber-300">
                    {selectedYear} • {selectedExam?.name || "PYQ"} • {q.subjectName || "Core"}
                  </div>
                  <div className="flex items-center gap-2">
                    {q.tags?.map((t) => (
                      <span key={t} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-base font-medium leading-relaxed text-white">
                  {q.question}
                </p>

                <div className="mt-6 space-y-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = verify?.selectedAnswer === optIdx;
                    const isCorrect = verify?.correctAnswer === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => void handleVerify(q, optIdx)}
                        className={`w-full rounded-lg border p-4 text-left font-mono text-xs transition-all ${
                          verify
                            ? isCorrect
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                              : isSelected
                                ? "border-rose-500/40 bg-rose-950/30 text-rose-300"
                                : "border-purple-500/10 bg-purple-950/10 text-purple-300/60"
                            : "border-purple-500/20 bg-purple-950/20 text-purple-200 hover:border-amber-400/50 hover:bg-amber-950/20"
                        }`}
                      >
                        <span className="font-bold text-amber-400 mr-2">{opt.label}.</span> {opt.text}
                      </button>
                    );
                  })}
                </div>

                {verify && (
                  <div className={`mt-4 rounded-lg border p-4 font-mono text-xs ${verify.isCorrect ? "border-emerald-400/40 bg-emerald-950/30 text-emerald-200" : "border-rose-500/40 bg-rose-950/30 text-rose-200"}`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {verify.isCorrect ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-400" /> Correct Verification! (+25 XP)
                        </>
                      ) : (
                        <>
                          <Brain size={16} className="text-rose-400" /> Incorrect Option Selected
                        </>
                      )}
                    </div>
                    {verify.explanation && (
                      <p className="mt-2 text-purple-200/90">{verify.explanation}</p>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}

          {questions.length === 0 && (
            <GlassCard className="p-8 text-center text-xs font-mono text-amber-300/70 border-amber-500/20">
              Click &quot;Fetch PYQ Questions&quot; above to search the question bank.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
