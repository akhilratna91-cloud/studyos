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
    return "border-accent-emerald/20 bg-accent-emerald/10 text-accent-emerald";
  }

  if (level === "hard") {
    return "border-accent-red/20 bg-accent-red/10 text-accent-red";
  }

  return "border-accent-amber/20 bg-accent-amber/10 text-accent-amber";
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
  const [status, setStatus] = useState("Loading syllabus explorer...");
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
          setStatus("Live syllabus map loaded. Choose a chapter and start learning.");
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
        setStatus(error instanceof Error ? `Subject load failed: ${error.message}` : "Subject load failed.");
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
        setStatus(error instanceof Error ? `Chapter load failed: ${error.message}` : "Chapter load failed.");
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
        const nextTopics = await listTopicsByChapter(selectedChapterId);
        if (!active) return;
        startTransition(() => {
          setTopics(nextTopics);
        });
      } catch (error) {
        if (!active) return;
        setTopics([]);
        setStatus(error instanceof Error ? `Topic load failed: ${error.message}` : "Topic load failed.");
      }
    }

    void loadTopics();
    return () => { active = false; };
  }, [selectedChapterId, startTransition]);

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

  const lectureTracks = useMemo(() => {
    if (!selectedExam || !selectedSubject || !selectedChapter) return [];
    return [
      {
        title: "Foundation lecture",
        duration: "48 min",
        focus: "Concept build and chapter theory",
        href: buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "full lecture"),
      },
      {
        title: "Problem sprint",
        duration: "32 min",
        focus: "Numericals, PYQ logic, and shortcuts",
        href: buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "problems PYQ"),
      },
      {
        title: "Revision one-shot",
        duration: "18 min",
        focus: "Quick recap before a test or revision day",
        href: buildSearchUrl(selectedExam, selectedSubject, selectedChapter, "revision one shot"),
      },
    ];
  }, [selectedChapter, selectedExam, selectedSubject]);

  const topicHighlights = useMemo(() => topics.slice(0, 4).map((t) => t.name), [topics]);
  const difficultTopics = useMemo(() => topics.filter((t) => t.difficulty === "hard").map((t) => t.name).slice(0, 3), [topics]);

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
        tag="Learn module"
        title="Syllabus Explorer"
        subtitle={status}
        action={
          <GlassCard className="p-3">
            <select
              value={selectedExamSlug}
              onChange={(event) => setSelectedExamSlug(event.target.value)}
              className="select-orbital"
            >
              {exams.map((exam) => (
                <option key={exam.slug} value={exam.slug} className="bg-surface">
                  {exam.name}
                </option>
              ))}
            </select>
          </GlassCard>
        }
      />

      {/* Subjects */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const active = getId(subject) === selectedSubjectId;
            return (
              <button
                key={getId(subject) || subject.slug}
                type="button"
                onClick={() => setSelectedSubjectId(getId(subject))}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "border-primary/30 bg-primary/10 text-primary-light"
                    : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:text-white"
                }`}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Chapters list */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Chapters</div>
            <span className="text-xs text-gray-500">
              {isPending ? "Refreshing..." : `${chapters.length} total`}
            </span>
          </div>

          <div className="space-y-2">
            {chapters.map((chapter) => {
              const active = getId(chapter) === selectedChapterId;
              return (
                <button
                  key={getId(chapter) || chapter.slug}
                  type="button"
                  onClick={() => setSelectedChapterId(getId(chapter))}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary/30 bg-primary/[0.04]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{chapter.name}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                          {chapter.weightage || 0}% weight
                        </span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                          {chapter.estimatedHours || 0} hrs
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${difficultyClasses(
                        chapter.difficulty,
                      )}`}
                    >
                      {chapter.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Selected Chapter Details */}
        <div className="space-y-6">
          {selectedExam && selectedSubject && selectedChapter ? (
            <>
              <GlassCard className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light">
                      {selectedExam.name} • {selectedSubject.name}
                    </div>
                    <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-black text-white">
                      {selectedChapter.name}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      Learn through guided track sprints, study resources, and targeted roadmap items.
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase font-bold tracking-widest ${difficultyClasses(
                      selectedChapter.difficulty,
                    )}`}
                  >
                    {selectedChapter.difficulty}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Weightage", value: `${selectedChapter.weightage || 0}%` },
                    { label: "Study Load", value: `${selectedChapter.estimatedHours || 0} hrs` },
                    { label: "Topics", value: topics.length },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</div>
                      <div className="mt-1 text-xl font-bold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Lecture tracks */}
              <div className="grid gap-4 lg:grid-cols-3">
                {lectureTracks.map((track) => (
                  <GlassCard key={track.title} className="p-5" glowColor="cyan">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan">
                      <PlayCircle size={14} />
                      {track.title}
                    </div>
                    <div className="mt-4 text-xl font-black text-white">{track.duration}</div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">{track.focus}</p>
                    <a href={track.href} target="_blank" rel="noreferrer" className="mt-4 block">
                      <NeonButton glowColor="cyan" className="w-full text-xs py-2">
                        <Sparkles size={12} /> Search
                      </NeonButton>
                    </a>
                  </GlassCard>
                ))}
              </div>

              {/* Grid lists */}
              <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                    <BookOpenText size={16} className="text-primary-light" />
                    Concepts Highlight
                  </div>
                  <div className="space-y-2">
                    {topicHighlights.map((item) => (
                      <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-gray-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                    <FileText size={16} className="text-accent-cyan" />
                    Revision Strategy
                  </div>
                  <div className="space-y-2">
                    {(difficultTopics.length ? difficultTopics : topicHighlights).map((item) => (
                      <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-gray-300">
                        Solve formula drill for {item}.
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                    <Target size={16} className="text-accent-amber" />
                    Daily Practice Protocol
                  </div>
                  <div className="space-y-2">
                    {topics.slice(0, 4).map((topic, index) => (
                      <div key={topic.slug} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-gray-300">
                        Set {index + 1}: {topic.name} • {topic.estimatedMinutes || 30}m
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                    <Layers3 size={16} className="text-accent-magenta" />
                    Focus Assignment
                  </div>
                  <div className="space-y-2">
                    {topics
                      .slice()
                      .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
                      .slice(0, 4)
                      .map((topic) => (
                        <div key={`${topic.slug}-assignment`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-gray-300">
                          {topic.name} • priority {topic.weightage || 0}%
                        </div>
                      ))}
                  </div>
                </GlassCard>
              </div>

              {/* Topic roadmap */}
              <GlassCard className="p-5">
                <div className="text-sm font-semibold text-white mb-4">Topic Roadmap</div>
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div key={topic.slug} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">{topic.name}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                              {topic.estimatedMinutes || 30} min
                            </span>
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
                              {topic.weightage || 0}% focus
                            </span>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider sm:self-center self-start ${difficultyClasses(
                            topic.difficulty,
                          )}`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-6 text-center text-sm text-gray-500">
              No chapter selected.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
