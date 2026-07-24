"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BookOpenText,
  FileText,
  Layers3,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageHeader } from "@/components/ui/page-header";
import { OrbitLoader } from "@/components/ui/orbit-loader";
import {
  listChaptersBySubject,
  listExams,
  listSubjectsByExam,
  listTopicsByChapter,
  type ChapterSummary,
  type ExamSummary,
  type SubjectSummary,
  type TopicSummary,
} from "@/lib/api";
import { useUserStore } from "@/store/user-store";

function getId(item?: { id?: string; _id?: string }) {
  return item?.id || item?._id || "";
}

function buildSearchUrl(
  exam: ExamSummary,
  subject: SubjectSummary,
  chapter: ChapterSummary,
  suffix: string,
) {
  const query = encodeURIComponent(
    `${exam.name} ${subject.name} ${chapter.name} ${suffix}`,
  );
  return `https://www.youtube.com/results?search_query=${query}`;
}

function difficultyClasses(level: ChapterSummary["difficulty"] | TopicSummary["difficulty"]) {
  if (level === "easy") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (level === "hard") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-400";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-400";
}

export default function LearnPage() {
  const { user, hasHydrated } = useUserStore();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedExamSlug, setSelectedExamSlug] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [status, setStatus] = useState("Loading syllabus map...");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) return;
    let active = true;

    async function loadExams() {
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
          setStatus("Syllabus map initialized. Choose a subject and chapter to explore.");
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? `Could not load syllabus: ${error.message}` : "Could not load syllabus.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadExams();
    return () => { active = false; };
  }, [hasHydrated, user, startTransition]);

  useEffect(() => {
    if (!selectedExamSlug) return;
    let active = true;

    async function loadSubjects() {
      try {
        const list = await listSubjectsByExam(selectedExamSlug);
        if (!active) return;

        startTransition(() => {
          setSubjects(list);
          const firstSubId = getId(list[0]);
          setSelectedSubjectId(firstSubId);
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Failed to load subjects.");
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
        const list = await listChaptersBySubject(selectedSubjectId);
        if (!active) return;

        startTransition(() => {
          setChapters(list);
          const firstChapId = getId(list[0]);
          setSelectedChapterId(firstChapId);
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Failed to load chapters.");
      }
    }

    void loadChapters();
    return () => { active = false; };
  }, [selectedSubjectId, startTransition]);

  useEffect(() => {
    if (!selectedChapterId) return;
    let active = true;

    async function loadTopics() {
      try {
        const list = await listTopicsByChapter(selectedChapterId);
        if (!active) return;

        startTransition(() => {
          setTopics(list);
        });
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Failed to load topics.");
      }
    }

    void loadTopics();
    return () => { active = false; };
  }, [selectedChapterId, startTransition]);

  const selectedExam = useMemo(
    () => exams.find((item) => item.slug === selectedExamSlug) || exams[0],
    [exams, selectedExamSlug],
  );

  const selectedSubject = useMemo(
    () => subjects.find((item) => getId(item) === selectedSubjectId) || subjects[0],
    [subjects, selectedSubjectId],
  );

  const selectedChapter = useMemo(
    () => chapters.find((item) => getId(item) === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId],
  );

  if (!hasHydrated || loading || isPending) {
    return <div className="flex min-h-[60vh] items-center justify-center"><OrbitLoader size="lg" /></div>;
  }

  return (
    <div className="space-y-6 theme-learn">
      <PageHeader
        tag="Syllabus Navigation"
        title="Interactive Learn Matrix"
        subtitle={status}
      />

      {/* Exam Switcher */}
      <GlassCard glowColor="cyan" className="p-4 border-cyan-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Sparkles size={16} className="text-emerald-400" /> Exam Syllabus Stream
          </div>
          <div className="flex flex-wrap gap-2">
            {exams.map((exam) => (
              <button
                key={exam.slug}
                onClick={() => setSelectedExamSlug(exam.slug)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                  selectedExamSlug === exam.slug
                    ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-purple-500/20 bg-purple-950/20 text-purple-300/70 hover:text-white"
                }`}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Subjects & Chapters sidebar vs Details */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Column: Subjects & Chapter List */}
        <div className="space-y-4">
          {/* Subjects */}
          <GlassCard glowColor="cyan" className="p-4 border-cyan-500/25">
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-300 mb-3">
              Subjects
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub) => {
                const subId = getId(sub);
                const isSel = subId === selectedSubjectId;

                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubjectId(subId)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all text-center ${
                      isSel
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "border-purple-500/20 bg-purple-950/20 text-purple-300/70 hover:text-white"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Chapters List */}
          <GlassCard glowColor="emerald" className="p-4 border-emerald-500/25">
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center justify-between">
              <span>Chapters</span>
              <span className="font-mono text-[10px] text-purple-300">{chapters.length} Modules</span>
            </div>
            <div className="no-scrollbar max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {chapters.map((chap) => {
                const chapId = getId(chap);
                const isSel = chapId === selectedChapterId;

                return (
                  <div
                    key={chapId}
                    onClick={() => setSelectedChapterId(chapId)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      isSel
                        ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "border-purple-500/20 bg-purple-950/10 hover:border-purple-400/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{chap.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase font-mono font-bold ${difficultyClasses(chap.difficulty)}`}>
                        {chap.difficulty}
                      </span>
                    </div>
                    <div className="font-mono mt-2 flex items-center justify-between text-[10px] text-purple-300/70">
                      <span>{chap.estimatedHours || 5} Hours</span>
                      <span>Weightage: {chap.weightage || 10}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Selected Chapter Focus & Video Stream Launcher */}
        <div className="space-y-6">
          {selectedChapter ? (
            <>
              <GlassCard glowColor="emerald" className="p-6 border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div>
                    <div className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                      {selectedExam?.name} • {selectedSubject?.name}
                    </div>
                    <h3 className="font-heading text-xl font-extrabold text-white text-gradient-cyan-emerald mt-1">
                      {selectedChapter.name}
                    </h3>
                  </div>
                  <span className={`self-start sm:self-auto rounded-full border px-3 py-1 text-xs uppercase font-mono font-bold ${difficultyClasses(selectedChapter.difficulty)}`}>
                    {selectedChapter.difficulty}
                  </span>
                </div>

                {/* External Video Search Launchers */}
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-300">
                    Curated Video Stream Sources
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedExam && selectedSubject && (
                      <>
                        <a
                          href={buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "full lecture JEE NEET")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <NeonButton variant="solid" glowColor="cyan" className="w-full text-xs">
                            <PlayCircle size={15} /> Search Full Lecture Streams
                          </NeonButton>
                        </a>

                        <a
                          href={buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "one shot revision concept")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <NeonButton variant="outline" glowColor="emerald" className="w-full text-xs">
                            <BookOpenText size={15} /> One-Shot Concept Revision
                          </NeonButton>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Sub-topics breakdown */}
              <div className="grid gap-4 sm:grid-cols-3">
                <GlassCard glowColor="emerald" className="p-5 border-emerald-500/25">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-emerald-400 mb-4">
                    <FileText size={16} /> Syllabus Coverage
                  </div>
                  <div className="space-y-2">
                    {topics.slice(0, 4).map((t) => (
                      <div key={t.slug} className="font-mono rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-emerald-200 truncate">
                        {t.name}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="cyan" className="p-5 border-cyan-500/25">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-cyan-300 mb-4">
                    <Target size={16} /> Practice Protocol
                  </div>
                  <div className="space-y-2">
                    {topics.slice(0, 4).map((t, idx) => (
                      <div key={t.slug} className="font-mono rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-xs text-cyan-200">
                        Set {idx + 1}: {t.name} • {t.estimatedMinutes || 30}m
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="purple" className="p-5 border-purple-500/25">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-purple-300 mb-4">
                    <Layers3 size={16} /> Focus Priority
                  </div>
                  <div className="space-y-2">
                    {topics
                      .slice()
                      .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
                      .slice(0, 4)
                      .map((t) => (
                        <div key={`${t.slug}-priority`} className="font-mono rounded-lg border border-purple-500/20 bg-purple-950/20 p-2.5 text-xs text-purple-200">
                          {t.name} • {t.weightage || 0}% weight
                        </div>
                      ))}
                  </div>
                </GlassCard>
              </div>

              {/* Topic Detailed Roadmap */}
              <GlassCard glowColor="purple" className="p-6 border-purple-500/25">
                <div className="text-xs font-heading font-bold uppercase tracking-wider text-purple-300 mb-4">
                  Detailed Topic Breakdown
                </div>
                <div className="space-y-3">
                  {topics.map((t) => (
                    <div key={t.slug} className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4 transition-all hover:border-purple-400/40">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">{t.name}</div>
                          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] text-purple-300/70">
                            <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5">
                              {t.estimatedMinutes || 30} mins
                            </span>
                            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                              {t.weightage || 0}% focus
                            </span>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] uppercase font-mono font-bold self-start sm:self-center ${difficultyClasses(t.difficulty)}`}>
                          {t.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-6 text-center text-sm text-purple-300">
              Select a chapter from the left menu to view learning topics and resources.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
