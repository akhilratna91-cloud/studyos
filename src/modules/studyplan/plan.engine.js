/**
 * StudyOS - Plan Engine (Algorithm)
 *
 * The core scheduling algorithm that generates a balanced, day-wise study plan.
 *
 * Strategy:
 *   1. Collect all chapters for the exam, grouped by subject
 *   2. Calculate total study budget (totalDays × hoursPerDay minus revision days)
 *   3. Weight-proportional time allocation per chapter (using estimatedHours + weightage)
 *   4. Distribute chapters across study days using round-robin subject rotation
 *   5. Balance difficulty within each day (mix easy + medium + hard)
 *   6. Insert revision days at configurable intervals
 *   7. Optionally insert rest days
 *
 * The output is a flat array of day objects ready to store in the StudyPlan model.
 */

class PlanEngine {
  /**
   * Generate a complete study plan schedule.
   *
   * @param {object} params
   * @param {Array}  params.subjects   - [{ _id, name, icon, color, slug }]
   * @param {Array}  params.chapters   - [{ _id, subjectId, name, slug, difficulty, weightage, estimatedHours }]
   * @param {number} params.totalDays
   * @param {number} params.hoursPerDay
   * @param {number} [params.revisionInterval=7]  - insert revision day every N days (0 = none)
   * @param {number} [params.restDayInterval=0]    - insert rest day every N days (0 = none)
   * @param {Date}   [params.startDate]
   *
   * @returns {{ schedule: Array, stats: object }}
   */
  static generate({
    subjects,
    chapters,
    totalDays,
    hoursPerDay,
    revisionInterval = 7,
    restDayInterval = 0,
    startDate = null,
  }) {
    const start = startDate ? new Date(startDate) : new Date();

    // ── 1. Build subject lookup ────────────────────────────────────────────────
    const subjectMap = new Map();
    for (const s of subjects) {
      subjectMap.set(s._id.toString(), {
        id: s._id,
        name: s.name,
        icon: s.icon || '📘',
        color: s.color || '#4F46E5',
      });
    }

    // ── 2. Group chapters by subject, sort by weightage desc ───────────────────
    const chaptersBySubject = new Map();
    for (const ch of chapters) {
      const sid = ch.subjectId.toString();
      if (!chaptersBySubject.has(sid)) chaptersBySubject.set(sid, []);
      chaptersBySubject.get(sid).push(ch);
    }
    // Sort each group: hard first (they need more focus), then by weightage desc
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    for (const [, chs] of chaptersBySubject) {
      chs.sort((a, b) => {
        const da = difficultyOrder[a.difficulty] ?? 1;
        const db = difficultyOrder[b.difficulty] ?? 1;
        if (da !== db) return da - db;
        return (b.weightage || 0) - (a.weightage || 0);
      });
    }

    // ── 3. Determine day types ─────────────────────────────────────────────────
    const dayTypes = [];  // 'study' | 'revision' | 'rest'
    for (let d = 1; d <= totalDays; d++) {
      if (restDayInterval > 0 && d > 1 && d % restDayInterval === 0) {
        dayTypes.push('rest');
      } else if (revisionInterval > 0 && d > 1 && d % revisionInterval === 0) {
        dayTypes.push('revision');
      } else {
        dayTypes.push('study');
      }
    }

    const studyDayCount = dayTypes.filter((t) => t === 'study').length;
    const budgetMinutesPerDay = hoursPerDay * 60;

    // ── 4. Calculate time per chapter proportional to estimatedHours ───────────
    const totalEstimatedMinutes = chapters.reduce(
      (sum, ch) => sum + (ch.estimatedHours || 1) * 60,
      0
    );
    const totalBudgetMinutes = studyDayCount * budgetMinutesPerDay;
    const scaleFactor = totalBudgetMinutes / Math.max(totalEstimatedMinutes, 1);

    const chapterAllocations = chapters.map((ch) => {
      const rawMinutes = (ch.estimatedHours || 1) * 60 * scaleFactor;
      const allocatedMinutes = Math.max(30, Math.round(rawMinutes / 5) * 5); // round to 5min, min 30
      return { chapter: ch, remaining: allocatedMinutes, total: allocatedMinutes };
    });

    // ── 5. Build study sessions using round-robin across subjects ──────────────
    const subjectIds = Array.from(chaptersBySubject.keys());
    // Track which chapter index we're on per subject
    const subjectChapterIdx = new Map();
    for (const sid of subjectIds) {
      subjectChapterIdx.set(sid, 0);
    }

    // Create a queue of chapter allocations indexed by subjectId
    const allocBySubject = new Map();
    for (const alloc of chapterAllocations) {
      const sid = alloc.chapter.subjectId.toString();
      if (!allocBySubject.has(sid)) allocBySubject.set(sid, []);
      allocBySubject.get(sid).push(alloc);
    }

    const schedule = [];
    let subjectRoundRobin = 0;
    let studyDayIdx = 0;

    for (let d = 0; d < totalDays; d++) {
      const dayNumber = d + 1;
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + d);

      const dayType = dayTypes[d];

      if (dayType === 'rest') {
        schedule.push({
          dayNumber,
          date: dayDate,
          totalMinutes: 0,
          sessions: [],
          isRevisionDay: false,
          isRestDay: true,
        });
        continue;
      }

      if (dayType === 'revision') {
        // Revision day: pick the hardest chapters studied in the last interval
        const recentDays = schedule
          .filter((day) => !day.isRestDay && !day.isRevisionDay)
          .slice(-revisionInterval);

        const revisionSessions = [];
        const seenChapters = new Set();
        let revMinutes = 0;

        for (const day of recentDays) {
          for (const sess of day.sessions) {
            const chKey = sess.chapterId?.toString();
            if (chKey && !seenChapters.has(chKey) && revMinutes < budgetMinutesPerDay) {
              seenChapters.add(chKey);
              const revDuration = Math.min(
                Math.round(sess.durationMinutes * 0.4), // revision = 40% of original
                budgetMinutesPerDay - revMinutes
              );
              if (revDuration >= 15) {
                revisionSessions.push({
                  ...sess,
                  durationMinutes: revDuration,
                  type: 'revision',
                });
                revMinutes += revDuration;
              }
            }
          }
        }

        schedule.push({
          dayNumber,
          date: dayDate,
          totalMinutes: revMinutes,
          sessions: revisionSessions,
          isRevisionDay: true,
          isRestDay: false,
        });
        continue;
      }

      // ── Study day ───────────────────────────────────────────────────────────
      const sessions = [];
      let dayMinutes = 0;
      let stuckCounter = 0;
      const maxStuck = subjectIds.length * 2;

      while (dayMinutes < budgetMinutesPerDay && stuckCounter < maxStuck) {
        // Pick next subject (round-robin)
        const sid = subjectIds[subjectRoundRobin % subjectIds.length];
        subjectRoundRobin++;

        const allocations = allocBySubject.get(sid);
        if (!allocations) { stuckCounter++; continue; }

        // Find the first chapter with remaining time
        const alloc = allocations.find((a) => a.remaining > 0);
        if (!alloc) { stuckCounter++; continue; }

        stuckCounter = 0; // reset on success

        // How much time to give this session
        const remainingInDay = budgetMinutesPerDay - dayMinutes;
        const sessionDuration = Math.min(
          alloc.remaining,
          remainingInDay,
          90  // max 90 min per session for focus
        );

        if (sessionDuration < 15) break; // not enough time left

        const subj = subjectMap.get(sid);
        sessions.push({
          subjectId: subj?.id,
          subjectName: subj?.name || 'Unknown',
          subjectIcon: subj?.icon || '📘',
          subjectColor: subj?.color || '#4F46E5',
          chapterId: alloc.chapter._id,
          chapterName: alloc.chapter.name,
          chapterSlug: alloc.chapter.slug,
          difficulty: alloc.chapter.difficulty,
          durationMinutes: sessionDuration,
          type: 'study',
        });

        alloc.remaining -= sessionDuration;
        dayMinutes += sessionDuration;
      }

      // If no sessions were created but we have budget, fill with remaining chapters
      if (sessions.length === 0 && chapters.length > 0) {
        const anyRemaining = chapterAllocations.find((a) => a.remaining > 0);
        if (anyRemaining) {
          const sid = anyRemaining.chapter.subjectId.toString();
          const subj = subjectMap.get(sid);
          const dur = Math.min(anyRemaining.remaining, budgetMinutesPerDay);
          sessions.push({
            subjectId: subj?.id,
            subjectName: subj?.name || 'Unknown',
            subjectIcon: subj?.icon || '📘',
            subjectColor: subj?.color || '#4F46E5',
            chapterId: anyRemaining.chapter._id,
            chapterName: anyRemaining.chapter.name,
            chapterSlug: anyRemaining.chapter.slug,
            difficulty: anyRemaining.chapter.difficulty,
            durationMinutes: dur,
            type: 'study',
          });
          anyRemaining.remaining -= dur;
          dayMinutes = dur;
        }
      }

      schedule.push({
        dayNumber,
        date: dayDate,
        totalMinutes: dayMinutes,
        sessions,
        isRevisionDay: false,
        isRestDay: false,
      });

      studyDayIdx++;
    }

    // ── 6. Compute stats ──────────────────────────────────────────────────────
    const diffCount = { easy: 0, medium: 0, hard: 0 };
    const uniqueChapters = new Set();
    for (const ch of chapters) {
      diffCount[ch.difficulty] = (diffCount[ch.difficulty] || 0) + 1;
      uniqueChapters.add(ch._id.toString());
    }

    const stats = {
      totalStudyDays: dayTypes.filter((t) => t === 'study').length,
      totalRevisionDays: dayTypes.filter((t) => t === 'revision').length,
      totalRestDays: dayTypes.filter((t) => t === 'rest').length,
      totalStudyHours: Math.round(
        schedule.reduce((sum, day) => sum + day.totalMinutes, 0) / 60 * 10
      ) / 10,
      subjectsCount: subjectIds.length,
      chaptersCount: uniqueChapters.size,
      easyChapters: diffCount.easy || 0,
      mediumChapters: diffCount.medium || 0,
      hardChapters: diffCount.hard || 0,
    };

    return { schedule, stats };
  }
}

module.exports = PlanEngine;
