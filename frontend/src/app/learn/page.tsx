"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  FileText,
  PlayCircle,
  Sparkles,
  Target,
  Search,
  CheckCircle2,
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

const CATEGORY_TABS = [
  { id: "all", label: "All Exams" },
  { id: "engineering", label: "Engineering" },
  { id: "medical", label: "Medical" },
  { id: "government", label: "Govt & SSC" },
  { id: "banking", label: "Banking" },
  { id: "management", label: "Management" },
  { id: "law", label: "Law" },
  { id: "graduate", label: "GATE & Research" },
  { id: "boards", label: "School Boards" },
  { id: "overseas", label: "Overseas & SAT" },
];

export default function LearnPage() {
  const { user, hasHydrated } = useUserStore();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
          setStatus("Syllabus map loaded. Filter by category or search 50+ exams.");
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

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesCat = selectedCategory === "all" || exam.category === selectedCategory;
      const matchesSearch = !searchQuery || exam.name.toLowerCase().includes(searchQuery.toLowerCase()) || exam.slug.includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [exams, selectedCategory, searchQuery]);

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
        tag="Syllabus Navigation (Cyan & Emerald Blend)"
        title="Universal Exam & Syllabus Matrix"
        subtitle={status}
      />

      {/* Category Tabs & Search Bar */}
      <GlassCard glowColor="cyan" className="p-5 border-cyan-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Sparkles size={16} className="text-emerald-400" /> Filter Exam Matrix ({filteredExams.length} Available)
          </div>
          <div className="relative w-full md:w-72 font-mono text-xs">
            <Search size={14} className="absolute left-3 top-2.5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search 50+ exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-cyan-500/30 bg-cyan-950/20 pl-9 pr-3 py-1.5 text-white placeholder-purple-300/50 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "border border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "border border-purple-500/20 bg-purple-950/20 text-purple-300/70 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exam Selection Pills */}
        <div className="no-scrollbar mt-4 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
          {filteredExams.map((exam) => (
            <button
              key={exam.slug}
              onClick={() => setSelectedExamSlug(exam.slug)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                selectedExamSlug === exam.slug
                  ? "border border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "border border-purple-500/15 bg-purple-950/15 text-purple-200/80 hover:border-cyan-400/50 hover:bg-cyan-950/30"
              }`}
            >
              {exam.name}
            </button>
          ))}
          {filteredExams.length === 0 && (
            <div className="font-mono text-xs text-purple-300/70 py-2">No exams matching &quot;{searchQuery}&quot;. Try selecting &quot;All Exams&quot;.</div>
          )}
        </div>
      </GlassCard>

      {/* Main Grid: Subjects & Chapters sidebar vs Details */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Column: Subjects & Chapter List */}
        <div className="space-y-4">
          {/* Subjects */}
          <GlassCard glowColor="cyan" className="p-4 border-cyan-500/25">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
              Subjects for {selectedExam?.name || "Exam"}
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub) => {
                const subId = getId(sub);
                const isSel = subId === selectedSubjectId;

                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubjectId(subId)}
                    className={`flex-1 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition-all text-center ${
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

          {/* Chapters */}
          <GlassCard glowColor="cyan" className="p-4 border-cyan-500/25">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
              Chapters ({chapters.length})
            </div>
            <div className="no-scrollbar space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {chapters.map((chap) => {
                const chapId = getId(chap);
                const isSel = chapId === selectedChapterId;

                return (
                  <button
                    key={chapId}
                    onClick={() => setSelectedChapterId(chapId)}
                    className={`w-full rounded-lg border p-3 text-left font-mono text-xs transition-all ${
                      isSel
                        ? "border-cyan-400 bg-cyan-500/20 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "border-purple-500/20 bg-purple-950/20 text-purple-200/80 hover:border-cyan-400/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{chap.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase border ${difficultyClasses(chap.difficulty)}`}>
                        {chap.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Active Chapter & Topics */}
        <div className="space-y-6">
          {selectedChapter ? (
            <>
              {/* Chapter Card */}
              <GlassCard glowColor="cyan" className="p-6 border-cyan-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">
                      {selectedExam?.name} • {selectedSubject?.name}
                    </span>
                    <h3 className="font-heading text-xl font-bold text-white mt-1">
                      {selectedChapter.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedExam && selectedSubject && selectedChapter && (
                      <>
                        <a
                          href={buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "full lecture")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <NeonButton variant="solid" glowColor="emerald" className="text-xs">
                            <PlayCircle size={14} /> Watch Lectures
                          </NeonButton>
                        </a>
                        <a
                          href={buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "notes pdf")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <NeonButton variant="outline" glowColor="cyan" className="text-xs">
                            <FileText size={14} /> View Notes
                          </NeonButton>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Topics Breakdown */}
              <GlassCard glowColor="cyan" className="p-6 border-cyan-500/30">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
                  <Target size={16} /> Topics & Key Concepts ({topics.length})
                </h4>

                <div className="grid gap-3">
                  {topics.map((t, idx) => (
                    <div key={getId(t) || idx} className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4 font-mono text-xs transition-all hover:border-cyan-400/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400" /> {t.name}
                        </div>
                        <span className={`rounded px-2 py-0.5 text-[10px] uppercase border ${difficultyClasses(t.difficulty)}`}>
                          {t.difficulty}
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-300/70">
                        Estimated: {t.estimatedMinutes || 30} mins • Weightage: {t.weightage || 20}%
                      </div>
                    </div>
                  ))}

                  {topics.length === 0 && (
                    <div className="font-mono text-center text-xs text-purple-300/70 py-6 border border-dashed border-purple-500/20 rounded-lg">
                      No topic breakdown registered for this chapter.
                    </div>
                  )}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-8 text-center text-xs font-mono text-purple-300/70 border-cyan-500/20">
              Select an exam, subject, and chapter to open the interactive syllabus map.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
