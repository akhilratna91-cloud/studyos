/**
 * StudyOS - Analytics Service
 *
 * Comprehensive progress tracking and analytics aggregator.
 * Pulls from DailyTask, StudySession, and RevisionCard to compute:
 *
 *   1. Exam-level completion  (% of syllabus covered)
 *   2. Subject-level progress (per-subject breakdown)
 *   3. Chapter-level status   (which chapters are done, in-progress, pending)
 *   4. Plan completion stats  (trajectory, velocity, ETA)
 *   5. Weekly/monthly trends  (this week vs last week)
 *   6. Heatmap data           (study activity by day)
 */

const DailyTask = require('../dailytask/dailytask.model');
const StudySession = require('../progress/progress.model');
const RevisionCard = require('../revision/revision.model');
const StudyPlan = require('../studyplan/studyplan.model');
const Chapter = require('../chapter/chapter.model');
const Subject = require('../subject/subject.model');
const mongoose = require('mongoose');

class AnalyticsService {
  // ───────────────────────────────────────────────────────────────────────────────
  // OVERVIEW — Single unified progress snapshot
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get a complete progress overview for the user.
   */
  static async getOverview(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [
      taskStats,
      sessionStats,
      revisionStats,
      planCount,
    ] = await Promise.all([
      // Task completion stats
      DailyTask.aggregate([
        { $match: { userId: objectUserId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            totalMinutes: { $sum: '$durationMinutes' },
            completedMinutes: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0] },
            },
          },
        },
      ]),

      // Actual study session stats
      StudySession.aggregate([
        { $match: { userId: objectUserId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            actualMinutes: { $sum: '$actualMinutes' },
            avgRating: { $avg: '$rating' },
          },
        },
      ]),

      // Revision mastery stats
      RevisionCard.aggregate([
        { $match: { userId: objectUserId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Plan count
      StudyPlan.countDocuments({ userId: objectUserId }),
    ]);

    // ── Parse task stats ──────────────────────────────────────────────────────
    const t = taskStats[0] || { total: 0, completed: 0, skipped: 0, pending: 0, inProgress: 0, totalMinutes: 0, completedMinutes: 0 };

    // ── Parse session stats ───────────────────────────────────────────────────
    const s = sessionStats[0] || { totalSessions: 0, actualMinutes: 0, avgRating: 0 };

    // ── Parse revision stats ──────────────────────────────────────────────────
    const revByStatus = { new: 0, learning: 0, review: 0, mastered: 0 };
    let totalCards = 0;
    for (const item of revisionStats) {
      revByStatus[item._id] = item.count;
      totalCards += item.count;
    }

    return {
      tasks: {
        total: t.total,
        completed: t.completed,
        skipped: t.skipped,
        pending: t.pending,
        inProgress: t.inProgress,
        completionRate: t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0,
        allocatedHours: Math.round((t.totalMinutes / 60) * 10) / 10,
        completedHours: Math.round((t.completedMinutes / 60) * 10) / 10,
      },
      sessions: {
        totalSessions: s.totalSessions,
        actualHours: Math.round((s.actualMinutes / 60) * 10) / 10,
        avgRating: Math.round((s.avgRating || 0) * 10) / 10,
      },
      revision: {
        total: totalCards,
        ...revByStatus,
        masteryRate: totalCards > 0 ? Math.round((revByStatus.mastered / totalCards) * 100) : 0,
      },
      plans: planCount,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SUBJECT-LEVEL PROGRESS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get progress broken down by subject.
   */
  static async getSubjectProgress(userId, examId = null) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const taskMatch = { userId: objectUserId };
    if (examId) taskMatch.examId = new mongoose.Types.ObjectId(examId);

    const subjectProgress = await DailyTask.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          subjectColor: { $first: '$subjectColor' },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          totalMinutes: { $sum: '$durationMinutes' },
          completedMinutes: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0] },
          },
        },
      },
      { $sort: { completedMinutes: -1 } },
    ]);

    return subjectProgress.map((s) => ({
      subjectId: s._id,
      subjectName: s.subjectName,
      subjectIcon: s.subjectIcon,
      subjectColor: s.subjectColor,
      total: s.total,
      completed: s.completed,
      skipped: s.skipped,
      completionRate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
      totalHours: Math.round((s.totalMinutes / 60) * 10) / 10,
      completedHours: Math.round((s.completedMinutes / 60) * 10) / 10,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CHAPTER-LEVEL PROGRESS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get progress broken down by chapter for a subject.
   */
  static async getChapterProgress(userId, subjectId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectSubjectId = new mongoose.Types.ObjectId(subjectId);

    const chapterProgress = await DailyTask.aggregate([
      { $match: { userId: objectUserId, subjectId: objectSubjectId } },
      {
        $group: {
          _id: '$chapterId',
          chapterName: { $first: '$chapterName' },
          chapterSlug: { $first: '$chapterSlug' },
          difficulty: { $first: '$difficulty' },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalMinutes: { $sum: '$durationMinutes' },
          completedMinutes: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0] },
          },
        },
      },
      { $sort: { chapterName: 1 } },
    ]);

    return chapterProgress.map((c) => ({
      chapterId: c._id,
      chapterName: c.chapterName,
      chapterSlug: c.chapterSlug,
      difficulty: c.difficulty,
      total: c.total,
      completed: c.completed,
      completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
      totalHours: Math.round((c.totalMinutes / 60) * 10) / 10,
      completedHours: Math.round((c.completedMinutes / 60) * 10) / 10,
      status: c.completed === c.total ? 'done' : c.completed > 0 ? 'in-progress' : 'pending',
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // PLAN COMPLETION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get completion stats for a specific plan with trajectory analysis.
   */
  static async getPlanCompletion(userId, planId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectPlanId = new mongoose.Types.ObjectId(planId);

    const plan = await StudyPlan.findOne({ _id: objectPlanId, userId: objectUserId })
      .select('title config stats status createdAt')
      .populate('examId', 'name slug')
      .exec();

    if (!plan) return null;

    const taskStats = await DailyTask.aggregate([
      { $match: { userId: objectUserId, planId: objectPlanId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalMinutes: { $sum: '$durationMinutes' },
          completedMinutes: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0] },
          },
        },
      },
    ]);

    const t = taskStats[0] || { total: 0, completed: 0, skipped: 0, pending: 0, totalMinutes: 0, completedMinutes: 0 };

    // Trajectory analysis
    const now = new Date();
    const startDate = new Date(plan.config.startDate || plan.createdAt);
    const elapsedDays = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
    const totalDays = plan.config.totalDays;
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    const currentVelocity = t.completed / elapsedDays; // tasks per day
    const requiredVelocity = t.pending > 0 && remainingDays > 0
      ? t.pending / remainingDays
      : 0;

    const eta = currentVelocity > 0
      ? Math.ceil((t.total - t.completed) / currentVelocity)
      : null;

    return {
      plan: {
        id: plan._id,
        title: plan.title,
        exam: plan.examId,
        status: plan.status,
      },
      completion: {
        total: t.total,
        completed: t.completed,
        skipped: t.skipped,
        pending: t.pending,
        completionRate: t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0,
        allocatedHours: Math.round((t.totalMinutes / 60) * 10) / 10,
        completedHours: Math.round((t.completedMinutes / 60) * 10) / 10,
      },
      trajectory: {
        elapsedDays,
        totalDays,
        remainingDays,
        currentVelocity: Math.round(currentVelocity * 10) / 10,
        requiredVelocity: Math.round(requiredVelocity * 10) / 10,
        onTrack: currentVelocity >= requiredVelocity * 0.9,
        estimatedDaysToComplete: eta,
      },
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // WEEKLY COMPARISON
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Compare this week's progress vs last week.
   */
  static async getWeeklyComparison(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    // This week (Mon → today)
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const [thisWeek, lastWeek] = await Promise.all([
      this._getWeekStats(objectUserId, thisWeekStart, now),
      this._getWeekStats(objectUserId, lastWeekStart, lastWeekEnd),
    ]);

    // Calculate deltas
    const delta = {
      tasksCompleted: thisWeek.tasksCompleted - lastWeek.tasksCompleted,
      studyMinutes: thisWeek.studyMinutes - lastWeek.studyMinutes,
      sessions: thisWeek.sessions - lastWeek.sessions,
    };

    return {
      thisWeek,
      lastWeek,
      delta,
      trend: delta.tasksCompleted > 0 ? 'improving' : delta.tasksCompleted < 0 ? 'declining' : 'steady',
    };
  }

  /**
   * @private Get stats for a date range.
   */
  static async _getWeekStats(userId, startDate, endDate) {
    const [tasks, sessions] = await Promise.all([
      DailyTask.aggregate([
        {
          $match: {
            userId,
            completedAt: { $gte: startDate, $lte: endDate },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            minutes: { $sum: '$durationMinutes' },
          },
        },
      ]),

      StudySession.aggregate([
        {
          $match: {
            userId,
            startedAt: { $gte: startDate, $lte: endDate },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            minutes: { $sum: '$actualMinutes' },
            avgRating: { $avg: '$rating' },
          },
        },
      ]),
    ]);

    const t = tasks[0] || { count: 0, minutes: 0 };
    const s = sessions[0] || { count: 0, minutes: 0, avgRating: 0 };

    return {
      tasksCompleted: t.count,
      allocatedMinutes: t.minutes,
      sessions: s.count,
      studyMinutes: s.minutes,
      studyHours: Math.round((s.minutes / 60) * 10) / 10,
      avgRating: Math.round((s.avgRating || 0) * 10) / 10,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // HEATMAP DATA
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get study activity heatmap data (contribution graph, like GitHub).
   */
  static async getHeatmap(userId, days = 90) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const dailyActivity = await StudySession.aggregate([
      {
        $match: {
          userId: objectUserId,
          status: 'completed',
          startedAt: { $gte: cutoff },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          minutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with zeros
    const heatmap = [];
    const today = new Date();
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyActivity.find((a) => a._id === dateStr);
      heatmap.push({
        date: dateStr,
        minutes: found ? found.minutes : 0,
        sessions: found ? found.sessions : 0,
        level: found ? this._activityLevel(found.minutes) : 0,
      });
    }

    return heatmap;
  }

  /**
   * @private Map study minutes to activity level (0–4).
   */
  static _activityLevel(minutes) {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 90) return 2;
    if (minutes < 180) return 3;
    return 4;
  }
}

module.exports = AnalyticsService;
