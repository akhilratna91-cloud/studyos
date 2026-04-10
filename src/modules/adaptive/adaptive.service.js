/**
 * StudyOS - Adaptive Service (Business Logic Layer)
 *
 * Orchestrates the adaptive adjustment workflow:
 *   1. Analyze — scan tasks, detect issues, compute metrics
 *   2. Adjust — apply rescheduling, update tasks in DB
 *   3. Log — record what changed and why
 *   4. Report — return analysis + adjustments to the student
 */

const AppError = require('../../shared/errors/AppError');
const AdaptiveEngine = require('./adaptive.engine');
const AdaptiveRepository = require('./adaptive.repository');
const StudyPlanRepository = require('../studyplan/studyplan.repository');
const DailyTask = require('../dailytask/dailytask.model');
const RevisionCard = require('../revision/revision.model');

class AdaptiveService {
  // ───────────────────────────────────────────────────────────────────────────────
  // ANALYZE ONLY (no changes)
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Analyze a plan's current state without making changes.
   * Returns analysis + recommended adjustments.
   */
  static async analyzePlan(userId, planId) {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }

    const tasks = await DailyTask.find({ userId, planId }).sort({ dayNumber: 1 }).exec();
    if (tasks.length === 0) {
      throw AppError.badRequest('No tasks found for this plan. Generate tasks first.', 'NO_TASKS');
    }

    // Get weak cards for this exam
    const weakCards = await RevisionCard.find({
      userId,
      examId: plan.examId,
      isWeak: true,
    }).exec();

    const result = AdaptiveEngine.analyze({
      tasks: tasks.map((t) => t.toJSON()),
      planConfig: plan.config,
      weakCards: weakCards.map((c) => c.toJSON()),
    });

    return {
      planId,
      planTitle: plan.title,
      ...result,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // ADJUST (analyze + apply changes)
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Analyze and apply adjustments to the plan.
   * Rescheduled tasks are updated in the database.
   */
  static async adjustPlan(userId, planId, trigger = 'manual') {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }

    const tasks = await DailyTask.find({ userId, planId }).sort({ dayNumber: 1 }).exec();
    if (tasks.length === 0) {
      throw AppError.badRequest('No tasks found for this plan', 'NO_TASKS');
    }

    const weakCards = await RevisionCard.find({
      userId,
      examId: plan.examId,
      isWeak: true,
    }).exec();

    const { analysis, actions, rescheduledTasks } = AdaptiveEngine.analyze({
      tasks: tasks.map((t) => t.toJSON()),
      planConfig: plan.config,
      weakCards: weakCards.map((c) => c.toJSON()),
    });

    // ── Apply rescheduling ──────────────────────────────────────────────────
    let appliedCount = 0;

    for (const rescheduled of rescheduledTasks) {
      const result = await DailyTask.findByIdAndUpdate(
        rescheduled.taskId,
        {
          dayNumber: rescheduled.newDayNumber,
          date: rescheduled.newDate,
          status: 'pending',     // reset status
          completedAt: null,
        },
        { new: true }
      );
      if (result) appliedCount++;
    }

    // ── Add revision tasks for weak chapters ────────────────────────────────
    let revisionTasksCreated = 0;

    if (weakCards.length > 0) {
      const now = new Date();
      const maxDay = tasks.reduce((max, t) => Math.max(max, t.dayNumber), 0);

      for (let i = 0; i < weakCards.length; i++) {
        const card = weakCards[i];
        const revDay = maxDay + 1 + Math.floor(i / 3); // 3 revision tasks per day
        const revDate = new Date(now);
        revDate.setDate(now.getDate() + revDay);

        await DailyTask.create({
          userId,
          planId,
          examId: plan.examId,
          dayNumber: revDay,
          date: revDate,
          subjectId: card.subjectId,
          subjectName: card.subjectName,
          subjectIcon: card.subjectIcon,
          subjectColor: card.subjectColor,
          chapterId: card.chapterId,
          chapterName: card.chapterName,
          chapterSlug: card.chapterSlug,
          difficulty: card.difficulty,
          type: 'revision',
          durationMinutes: Math.round((card.interval || 1) <= 3 ? 45 : 30),
          status: 'pending',
          sortOrder: i % 3,
        });
        revisionTasksCreated++;
      }
    }

    // ── Build summary ───────────────────────────────────────────────────────
    const parts = [];
    if (appliedCount > 0) parts.push(`rescheduled ${appliedCount} task(s)`);
    if (revisionTasksCreated > 0) parts.push(`added ${revisionTasksCreated} revision task(s)`);
    if (parts.length === 0) parts.push('no changes needed — plan is on track');
    const summary = parts.join(', ').replace(/^./, (c) => c.toUpperCase());

    // ── Log the adjustment ──────────────────────────────────────────────────
    const log = await AdaptiveRepository.create({
      userId,
      planId,
      trigger,
      analysis,
      adjustments: actions,
      summary,
      tasksRescheduled: appliedCount + revisionTasksCreated,
    });

    return {
      logId: log.id,
      summary,
      analysis,
      adjustments: actions,
      applied: {
        tasksRescheduled: appliedCount,
        revisionTasksCreated,
      },
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get adjustment history for a plan.
   */
  static async getAdjustmentHistory(userId, planId) {
    const logs = await AdaptiveRepository.findByPlanId(userId, planId);
    return logs.map((l) => l.toJSON());
  }

  /**
   * Get the latest adjustment for a plan.
   */
  static async getLatestAdjustment(userId, planId) {
    const log = await AdaptiveRepository.findLatest(userId, planId);
    if (!log) {
      return null;
    }
    return log.toJSON();
  }

  /**
   * Get a single adjustment log by ID.
   */
  static async getAdjustmentById(userId, logId) {
    const log = await AdaptiveRepository.findByIdAndUser(logId, userId);
    if (!log) {
      throw AppError.notFound('Adjustment log not found', 'LOG_NOT_FOUND');
    }
    return log.toJSON();
  }

  /**
   * Get all adjustments across all plans for a user.
   */
  static async getUserAdjustments(userId) {
    const logs = await AdaptiveRepository.findByUserId(userId);
    return logs.map((l) => l.toJSON());
  }
}

module.exports = AdaptiveService;
