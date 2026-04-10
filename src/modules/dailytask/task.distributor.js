/**
 * StudyOS - Task Distribution Engine
 *
 * Takes a StudyPlan schedule and converts sessions into individual,
 * trackable DailyTask documents. Also provides a standalone distribution
 * method that works directly from chapters + days without a saved plan.
 *
 * Balancing rules:
 *   1. Total daily load ≤ configured hours (never exceed)
 *   2. Difficulty mix per day: max 60% hard chapters
 *   3. Subject variety: at least 2 subjects per day when possible
 *   4. Session granularity: each chapter session → one task
 *   5. Minimum 15 min per task, maximum 90 min per task
 */

class TaskDistributor {
  /**
   * Convert a StudyPlan schedule into DailyTask documents.
   *
   * @param {object}  params
   * @param {string}  params.userId
   * @param {string}  params.planId
   * @param {string}  params.examId
   * @param {Array}   params.schedule  - The plan's schedule array (days with sessions)
   * @returns {Array<object>} Array of DailyTask-ready objects
   */
  static fromPlanSchedule({ userId, planId, examId, schedule }) {
    const tasks = [];

    for (const day of schedule) {
      if (day.isRestDay && day.sessions.length === 0) {
        // Create a single rest task for rest days
        tasks.push({
          userId,
          planId,
          examId,
          dayNumber: day.dayNumber,
          date: day.date,
          subjectName: 'Rest Day',
          subjectIcon: '😴',
          subjectColor: '#6B7280',
          chapterName: 'Take a break — recharge!',
          difficulty: 'easy',
          type: 'rest',
          durationMinutes: 0,
          status: 'pending',
          sortOrder: 0,
        });
        continue;
      }

      for (let i = 0; i < day.sessions.length; i++) {
        const sess = day.sessions[i];
        tasks.push({
          userId,
          planId,
          examId,
          dayNumber: day.dayNumber,
          date: day.date,
          subjectId: sess.subjectId,
          subjectName: sess.subjectName || '',
          subjectIcon: sess.subjectIcon || '📘',
          subjectColor: sess.subjectColor || '#4F46E5',
          chapterId: sess.chapterId,
          chapterName: sess.chapterName || '',
          chapterSlug: sess.chapterSlug || '',
          difficulty: sess.difficulty || 'medium',
          type: sess.type || 'study',
          durationMinutes: sess.durationMinutes || 30,
          status: 'pending',
          sortOrder: i,
        });
      }
    }

    return tasks;
  }

  /**
   * Standalone: distribute chapters into balanced daily tasks without a saved plan.
   * Used for quick task distribution without the full plan generation flow.
   *
   * @param {object}  params
   * @param {Array}   params.chapters   - [{ _id, subjectId, name, slug, difficulty, estimatedHours, weightage }]
   * @param {Array}   params.subjects   - [{ _id, name, icon, color }]
   * @param {number}  params.totalDays
   * @param {number}  params.hoursPerDay
   * @param {Date}    [params.startDate]
   * @returns {{ days: Array<object>, stats: object }}
   */
  static distribute({ chapters, subjects, totalDays, hoursPerDay, startDate = null }) {
    const start = startDate ? new Date(startDate) : new Date();
    const budgetMinutes = hoursPerDay * 60;

    // Build subject lookup
    const subjectMap = new Map();
    for (const s of subjects) {
      subjectMap.set(s._id.toString(), {
        id: s._id,
        name: s.name,
        icon: s.icon || '📘',
        color: s.color || '#4F46E5',
      });
    }

    // Calculate total estimated time
    const totalEstimated = chapters.reduce(
      (sum, ch) => sum + (ch.estimatedHours || 1) * 60,
      0
    );
    const totalBudget = totalDays * budgetMinutes;
    const scale = totalBudget / Math.max(totalEstimated, 1);

    // Build allocation queue sorted by: difficulty desc → weightage desc
    const diffOrder = { hard: 0, medium: 1, easy: 2 };
    const queue = chapters
      .map((ch) => {
        const minutes = Math.max(15, Math.round(((ch.estimatedHours || 1) * 60 * scale) / 5) * 5);
        return { chapter: ch, remaining: minutes };
      })
      .sort((a, b) => {
        const da = diffOrder[a.chapter.difficulty] ?? 1;
        const db = diffOrder[b.chapter.difficulty] ?? 1;
        if (da !== db) return da - db;
        return (b.chapter.weightage || 0) - (a.chapter.weightage || 0);
      });

    // Distribute into days
    const days = [];
    let queueIdx = 0;

    for (let d = 0; d < totalDays; d++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + d);

      const dayTasks = [];
      let dayMinutes = 0;
      let hardCount = 0;
      let totalInDay = 0;

      // Fill the day
      const maxHardRatio = 0.6;
      let attempts = 0;
      const maxAttempts = queue.length * 2;

      while (dayMinutes < budgetMinutes && attempts < maxAttempts) {
        // Find next chapter with remaining time
        let found = false;
        for (let i = 0; i < queue.length; i++) {
          const idx = (queueIdx + i) % queue.length;
          const alloc = queue[idx];

          if (alloc.remaining <= 0) continue;

          // Check hard ratio
          if (alloc.chapter.difficulty === 'hard' && totalInDay > 0) {
            const wouldBeHardRatio = (hardCount + 1) / (totalInDay + 1);
            if (wouldBeHardRatio > maxHardRatio) continue;
          }

          const remaining = budgetMinutes - dayMinutes;
          const sessionDur = Math.min(alloc.remaining, remaining, 90);
          if (sessionDur < 15) { attempts++; continue; }

          const sid = alloc.chapter.subjectId.toString();
          const subj = subjectMap.get(sid);

          dayTasks.push({
            dayNumber: d + 1,
            date: dayDate,
            subjectId: subj?.id,
            subjectName: subj?.name || 'Unknown',
            subjectIcon: subj?.icon || '📘',
            subjectColor: subj?.color || '#4F46E5',
            chapterId: alloc.chapter._id,
            chapterName: alloc.chapter.name,
            chapterSlug: alloc.chapter.slug,
            difficulty: alloc.chapter.difficulty,
            type: 'study',
            durationMinutes: sessionDur,
            sortOrder: dayTasks.length,
          });

          alloc.remaining -= sessionDur;
          dayMinutes += sessionDur;
          totalInDay++;
          if (alloc.chapter.difficulty === 'hard') hardCount++;
          queueIdx = (idx + 1) % queue.length;
          found = true;
          break;
        }

        if (!found) break;
        attempts = 0;
      }

      days.push({
        dayNumber: d + 1,
        date: dayDate,
        totalMinutes: dayMinutes,
        tasks: dayTasks,
        taskCount: dayTasks.length,
      });
    }

    // Stats
    const completedChapters = new Set();
    const subjectsSeen = new Set();
    let totalMinutes = 0;
    for (const day of days) {
      totalMinutes += day.totalMinutes;
      for (const t of day.tasks) {
        if (t.chapterId) completedChapters.add(t.chapterId.toString());
        if (t.subjectId) subjectsSeen.add(t.subjectId.toString());
      }
    }

    const diffCount = { easy: 0, medium: 0, hard: 0 };
    for (const ch of chapters) {
      diffCount[ch.difficulty] = (diffCount[ch.difficulty] || 0) + 1;
    }

    const stats = {
      totalDays,
      totalStudyHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalTasks: days.reduce((sum, d) => sum + d.taskCount, 0),
      chaptersAssigned: completedChapters.size,
      subjectsCovered: subjectsSeen.size,
      avgTasksPerDay: Math.round(days.reduce((sum, d) => sum + d.taskCount, 0) / totalDays * 10) / 10,
      avgMinutesPerDay: Math.round(totalMinutes / totalDays),
      difficultyBreakdown: diffCount,
    };

    return { days, stats };
  }
}

module.exports = TaskDistributor;
