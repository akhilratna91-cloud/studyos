/**
 * StudyOS - Gamification Service
 *
 * Computes overall progress %, awards XP, tracks milestones.
 *
 * Overall Progress = (completed chapters / total chapters) * 100
 *
 * Pulls from:
 *   - ChapterProgress : completed vs total chapters
 *   - StudySession     : total study hours
 *   - FocusSession     : total focus sessions
 *   - RevisionCard     : total reviews
 *   - Progress (streaks): streak data
 */

const mongoose = require('mongoose');
const StudentStats = require('./gamification.model');
const ChapterProgress = require('../chapterprogress/chapterprogress.model');
const StudySession = require('../progress/progress.model');
const FocusSession = require('../focus/focus.model');
const RevisionCard = require('../revision/revision.model');
const DailyTask = require('../dailytask/dailytask.model');

// ─── XP Values ──────────────────────────────────────────────────────────────────
const XP = {
  TASK_COMPLETED:      10,
  CHAPTER_COMPLETED:   50,
  CHAPTER_MASTERED:   100,
  FOCUS_SESSION:       15,
  REVISION_REVIEW:      5,
  STREAK_DAY:          20,
};

// ─── Level Thresholds ───────────────────────────────────────────────────────────
const LEVEL_NAMES = [
  'Beginner',        // 0
  'Rookie',          // 1
  'Learner',         // 2
  'Student',         // 3
  'Scholar',         // 4
  'Achiever',        // 5
  'Expert',          // 6
  'Master',          // 7
  'Grandmaster',     // 8
  'Legend',          // 9
  'Prodigy',         // 10+
];

// ─── Milestone Definitions ──────────────────────────────────────────────────────
const MILESTONES = {
  syllabus_25:     { label: '25% Syllabus Complete', emoji: '📗' },
  syllabus_50:     { label: 'Halfway There!',        emoji: '📘' },
  syllabus_75:     { label: '75% Syllabus Done',     emoji: '📙' },
  syllabus_100:    { label: 'Full Syllabus!',        emoji: '🎓' },
  first_chapter:   { label: 'First Chapter Done',    emoji: '✅' },
  first_subject:   { label: 'First Subject Done',    emoji: '📚' },
  first_plan:      { label: 'First Plan Created',    emoji: '📋' },
  streak_7:        { label: '7-Day Streak',          emoji: '🔥' },
  streak_30:       { label: '30-Day Streak',         emoji: '💎' },
  streak_100:      { label: '100-Day Streak',        emoji: '👑' },
  hours_10:        { label: '10 Hours Studied',      emoji: '⏰' },
  hours_50:        { label: '50 Hours Studied',      emoji: '📖' },
  hours_100:       { label: '100 Hours Studied',     emoji: '🏅' },
  hours_500:       { label: '500 Hours Studied',     emoji: '🏆' },
  focus_master:    { label: '50 Focus Sessions',     emoji: '🎯' },
  revision_master: { label: '100 Revisions',         emoji: '🧠' },
};

class GamificationService {
  // ───────────────────────────────────────────────────────────────────────────────
  // SYNC — Recompute all stats from source data
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Full sync of overall progress & gamification stats.
   * Pulls from all modules and computes everything fresh.
   */
  static async syncStats(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [
      chapterStats,
      sessionStats,
      focusStats,
      revisionStats,
      taskStats,
    ] = await Promise.all([
      // Chapter completion
      ChapterProgress.aggregate([
        { $match: { userId: objectUserId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
            },
            mastered: {
              $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
            },
          },
        },
      ]),

      // Study session hours
      StudySession.aggregate([
        { $match: { userId: objectUserId, status: 'completed' } },
        { $group: { _id: null, totalMinutes: { $sum: '$actualMinutes' } } },
      ]),

      // Focus sessions
      FocusSession.aggregate([
        { $match: { userId: objectUserId, status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),

      // Revision reviews
      RevisionCard.aggregate([
        { $match: { userId: objectUserId } },
        { $group: { _id: null, totalReviews: { $sum: '$reviewCount' } } },
      ]),

      // Completed tasks
      DailyTask.countDocuments({ userId: objectUserId, status: 'completed' }),
    ]);

    // Parse
    const ch = chapterStats[0] || { total: 0, completed: 0, mastered: 0 };
    const ss = sessionStats[0] || { totalMinutes: 0 };
    const fs = focusStats[0] || { count: 0 };
    const rv = revisionStats[0] || { totalReviews: 0 };

    // Overall progress = completed chapters / total chapters
    const overallProgress = ch.total > 0
      ? Math.round((ch.completed / ch.total) * 100)
      : 0;

    const totalStudyHours = Math.round((ss.totalMinutes / 60) * 10) / 10;

    // Calculate XP
    const totalXP =
      (taskStats * XP.TASK_COMPLETED) +
      (ch.completed * XP.CHAPTER_COMPLETED) +
      (ch.mastered * XP.CHAPTER_MASTERED) +
      (fs.count * XP.FOCUS_SESSION) +
      (rv.totalReviews * XP.REVISION_REVIEW);

    // Level = floor(sqrt(totalXP / 100))
    const level = Math.floor(Math.sqrt(totalXP / 100));

    // Detect new milestones
    const newMilestones = [];
    const milestoneChecks = [
      { type: 'first_chapter', condition: ch.completed >= 1 },
      { type: 'syllabus_25', condition: overallProgress >= 25 },
      { type: 'syllabus_50', condition: overallProgress >= 50 },
      { type: 'syllabus_75', condition: overallProgress >= 75 },
      { type: 'syllabus_100', condition: overallProgress >= 100 },
      { type: 'hours_10', condition: totalStudyHours >= 10 },
      { type: 'hours_50', condition: totalStudyHours >= 50 },
      { type: 'hours_100', condition: totalStudyHours >= 100 },
      { type: 'hours_500', condition: totalStudyHours >= 500 },
      { type: 'focus_master', condition: fs.count >= 50 },
      { type: 'revision_master', condition: rv.totalReviews >= 100 },
    ];

    // Get existing stats (to preserve milestones)
    let existing = await StudentStats.findOne({ userId: objectUserId });
    const existingMilestoneTypes = existing
      ? new Set(existing.milestones.map((m) => m.type))
      : new Set();

    for (const check of milestoneChecks) {
      if (check.condition && !existingMilestoneTypes.has(check.type)) {
        const def = MILESTONES[check.type];
        newMilestones.push({
          type: check.type,
          label: def.label,
          emoji: def.emoji,
          reachedAt: new Date(),
        });
      }
    }

    // Upsert stats
    const updateData = {
      userId: objectUserId,
      totalXP,
      level,
      overallProgress,
      totalChapters: ch.total,
      completedChapters: ch.completed,
      masteredChapters: ch.mastered,
      totalTasksCompleted: taskStats,
      totalStudyHours,
      totalFocusSessions: fs.count,
      totalReviews: rv.totalReviews,
    };

    if (newMilestones.length > 0) {
      updateData.$push = { milestones: { $each: newMilestones } };
    }

    // Can't $set and $push the same field, so separate them
    const setData = { ...updateData };
    delete setData.$push;

    const result = await StudentStats.findOneAndUpdate(
      { userId: objectUserId },
      {
        $set: setData,
        ...(newMilestones.length > 0
          ? { $push: { milestones: { $each: newMilestones } } }
          : {}),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return {
      stats: result.toJSON(),
      newMilestones,
      levelName: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)],
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get student's gamification profile.
   */
  static async getStats(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    let stats = await StudentStats.findOne({ userId: objectUserId });

    if (!stats) {
      // Auto-sync on first access
      const result = await this.syncStats(userId);
      return result;
    }

    const level = stats.level;
    return {
      stats: stats.toJSON(),
      newMilestones: [],
      levelName: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)],
      nextLevelXP: Math.pow((level + 1), 2) * 100,
      xpToNextLevel: Math.max(0, Math.pow((level + 1), 2) * 100 - stats.totalXP),
    };
  }

  /**
   * Get overall progress % (simple endpoint).
   */
  static async getOverallProgress(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const stats = await StudentStats.findOne({ userId: objectUserId })
      .select('overallProgress totalChapters completedChapters masteredChapters')
      .exec();

    if (!stats) {
      // Compute from ChapterProgress directly
      const chapterStats = await ChapterProgress.aggregate([
        { $match: { userId: objectUserId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
            },
            mastered: {
              $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
            },
          },
        },
      ]);
      const ch = chapterStats[0] || { total: 0, completed: 0, mastered: 0 };
      return {
        overallProgress: ch.total > 0 ? Math.round((ch.completed / ch.total) * 100) : 0,
        totalChapters: ch.total,
        completedChapters: ch.completed,
        masteredChapters: ch.mastered,
      };
    }

    return {
      overallProgress: stats.overallProgress,
      totalChapters: stats.totalChapters,
      completedChapters: stats.completedChapters,
      masteredChapters: stats.masteredChapters,
    };
  }

  /**
   * Get milestones.
   */
  static async getMilestones(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const stats = await StudentStats.findOne({ userId: objectUserId })
      .select('milestones')
      .exec();

    const reached = stats ? stats.milestones : [];
    const reachedTypes = new Set(reached.map((m) => m.type));

    // Show all milestones with locked/unlocked status
    const all = Object.entries(MILESTONES).map(([type, def]) => ({
      type,
      ...def,
      unlocked: reachedTypes.has(type),
      reachedAt: reached.find((m) => m.type === type)?.reachedAt || null,
    }));

    return {
      milestones: all,
      unlocked: reached.length,
      total: all.length,
    };
  }

  /**
   * Get XP breakdown.
   */
  static getXPTable() {
    return {
      xpValues: XP,
      levels: LEVEL_NAMES.map((name, i) => ({
        level: i,
        name,
        requiredXP: i * i * 100,
      })),
    };
  }
}

module.exports = GamificationService;
