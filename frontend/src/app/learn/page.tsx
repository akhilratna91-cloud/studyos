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
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
  }

  if (level === "hard") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-300";
  }

  return "border-amber-400/30 bg-amber-500/10 text-amber-300";
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    async function loadExams() {
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
          setStatus("Live syllabus map loaded. Choose a chapter and start learning.");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `Could not load syllabus explorer: ${error.message}`
            : "Could not load syllabus explorer.",
        );
      }
    }

    void loadExams();

    return () => {
      active = false;
    };
  }, [hasHydrated, user, startTransition]);

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
            ? `Subject load failed: ${error.message}`
            : "Subject load failed.",
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
            ? `Chapter load failed: ${error.message}`
            : "Chapter load failed.",
        );
      }
    }

    void loadChapters();

    return () => {
      active = false;
    };
  }, [selectedSubjectId, startTransition]);

  useEffect(() => {
    if (!selectedChapterId) {
      return;
    }

    let active = true;

    async function loadTopics() {
      try {
        const nextTopics = await listTopicsByChapter(selectedChapterId);

        if (!active) {
          return;
        }

        startTransition(() => {
          setTopics(nextTopics);
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setTopics([]);
        setStatus(
          error instanceof Error
            ? `Topic load failed: ${error.message}`
            : "Topic load failed.",
        );
      }
    }

    void loadTopics();

    return () => {
      active = false;
    };
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
    if (!selectedExam || !selectedSubject || !selectedChapter) {
      return [];
    }

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

  const topicHighlights = useMemo(() => {
    return topics.slice(0, 4).map((topic) => topic.name);
  }, [topics]);

  const difficultTopics = useMemo(() => {
    return topics
      .filter((topic) => topic.difficulty === "hard")
      .map((topic) => topic.name)
      .slice(0, 3);
  }, [topics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
            Learn module
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
            Lecture and concept explorer
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
            {status}
          </p>
        </div>

        <GlassCard className="w-full max-w-xl p-4">
          <label className="text-sm text-gray-300">
            Target exam
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
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          {subjects.map((subject) => {
            const active = getId(subject) === selectedSubjectId;
            return (
              <button
                key={getId(subject) || subject.slug}
                type="button"
                onClick={() => setSelectedSubjectId(getId(subject))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-white/10 bg-white/5 text-gray-300 hover:text-white"
                }`}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Chapter lane</div>
            <span className="text-xs text-gray-400">
              {isPending ? "Refreshing..." : `${chapters.length} chapters`}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {chapters.map((chapter) => {
              const active = getId(chapter) === selectedChapterId;

              return (
                <button
                  key={getId(chapter) || chapter.slug}
                  type="button"
                  onClick={() => setSelectedChapterId(getId(chapter))}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-primary/30 bg-primary/10"
                      : "border-white/8 bg-white/4 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {chapter.name}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                          {chapter.weightage || 0}% weightage
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                          {chapter.estimatedHours || 0} hrs
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide ${difficultyClasses(
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

        <div className="space-y-6">
          {selectedExam && selectedSubject && selectedChapter ? (
            <>
              <GlassCard className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-primary/80">
                      {selectedExam.name} | {selectedSubject.name}
                    </div>
                    <h2 className="mt-2 text-3xl font-black text-white">
                      {selectedChapter.name}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      Build from concepts, push through guided practice, and close with a revision shot before moving back into tests.
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] ${difficultyClasses(
                      selectedChapter.difficulty,
                    )}`}
                  >
                    {selectedChapter.difficulty}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Weightage
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {selectedChapter.weightage || 0}%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Study load
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {selectedChapter.estimatedHours || 0} hrs
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Topic count
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {topics.length}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="grid gap-4 lg:grid-cols-3">
                {lectureTracks.map((track) => (
                  <GlassCard key={track.title} className="p-5" glowColor="cyan">
                    <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                      <PlayCircle size={16} />
                      {track.title}
                    </div>
                    <div className="mt-4 text-2xl font-black text-white">
                      {track.duration}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-300">
                      {track.focus}
                    </p>
                    <a
                      href={track.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex w-full"
                    >
                      <NeonButton glowColor="cyan" className="w-full">
                        <Sparkles size={16} />
                        Search lecture
                      </NeonButton>
                    </a>
                  </GlassCard>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <BookOpenText size={16} className="text-primary" />
                    Class notes
                  </div>
                  <div className="mt-4 space-y-3">
                    {topicHighlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-gray-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FileText size={16} className="text-cyan-300" />
                    Revision notes
                  </div>
                  <div className="mt-4 space-y-3">
                    {(difficultTopics.length ? difficultTopics : topicHighlights).map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-gray-200"
                      >
                        Revise {item} with formula recall + 5 fast questions.
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Target size={16} className="text-orange-300" />
                    DPP sequence
                  </div>
                  <div className="mt-4 space-y-3">
                    {topics.slice(0, 4).map((topic, index) => (
                      <div
                        key={topic.slug}
                        className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-gray-200"
                      >
                        Set {index + 1}: {topic.name} | {topic.estimatedMinutes || 30} min
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Layers3 size={16} className="text-pink-300" />
                    Assignment focus
                  </div>
                  <div className="mt-4 space-y-3">
                    {topics
                      .slice()
                      .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
                      .slice(0, 4)
                      .map((topic) => (
                        <div
                          key={`${topic.slug}-assignment`}
                          className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-gray-200"
                        >
                          {topic.name} | priority {topic.weightage || 0}%
                        </div>
                      ))}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="p-5">
                <div className="text-sm font-semibold text-white">Topic roadmap</div>
                <div className="mt-4 space-y-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.slug}
                      className="rounded-2xl border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {topic.name}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              {topic.estimatedMinutes || 30} min
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              {topic.weightage || 0}% focus
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              {topic.prerequisites?.length || 0} prerequisites
                            </span>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide ${difficultyClasses(
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
            <GlassCard className="p-6 text-sm text-gray-400">
              No chapter selected yet.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
