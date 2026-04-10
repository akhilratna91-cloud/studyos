/**
 * StudyOS - DailyTask Service (Business Logic Layer)
 *
 * Two workflows:
 *   A) Generate tasks FROM an existing study plan
 *   B) Distribute chapters into daily tasks standalone (without a plan)
 *
 * Also handles task status updates, today's tasks, and progress stats.
 */

const AppError = require('../../shared/errors/AppError');
const DailyTaskRepository = require('./dailytask.repository');
const StudyPlanRepository = require('../studyplan/studyplan.repository');
const ExamRepository = require('../exam/exam.repository');
const SubjectRepository = require('../subject/subject.repository');
const ChapterRepository = require('../chapter/chapter.repository');
const TaskDistributor = require('./task.distributor');
const mongoose = require('mongoose');

class DailyTaskService {
  // ───────────────────────────────────────────────────────────────────────────────
  // GENERATE FROM PLAN
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Generate daily tasks from an existing study plan's schedule.
   */
  static async generateFromPlan(userId, planId) {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }

    if (!plan.schedule || plan.schedule.length === 0) {
      throw AppError.badRequest('Plan has no schedule to distribute', 'EMPTY_SCHEDULE');
    }

    // Delete existing tasks for this plan (regenerate)
    await DailyTaskRepository.deleteByPlanId(plan._id);

    // Convert schedule sessions → tasks
    const taskDocs = TaskDistributor.fromPlanSchedule({
      userId,
      planId: plan._id,
      examId: plan.examId,
      schedule: plan.schedule,
    });

    if (taskDocs.length === 0) {
      throw AppError.badRequest('No tasks could be generated from this plan', 'NO_TASKS');
    }

    const tasks = await DailyTaskRepository.bulkCreate(taskDocs);
    return {
      tasks: tasks.length,
      days: plan.schedule.length,
      message: `Generated ${tasks.length} tasks across ${plan.schedule.length} days`,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STANDALONE DISTRIBUTE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Distribute chapters into daily tasks without a saved plan (preview mode).
   * Returns the distribution without persisting.
   */
  static async distributePreview(input) {
    const { examId, totalDays, hoursPerDay, startDate } = input;

    // Resolve exam
    let exam;
    if (examId.match(/^[a-f\d]{24}$/i)) {
      exam = await ExamRepository.findById(examId);
    } else {
      exam = await ExamRepository.findBySlug(examId);
    }
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    const subjects = await SubjectRepository.findByExamId(exam._id, true);
    if (subjects.length === 0) {
      throw AppError.badRequest('No subjects found for this exam', 'NO_SUBJECTS');
    }

    const chapters = await ChapterRepository.findByExamId(exam._id, { isActive: true });
    if (chapters.length === 0) {
      throw AppError.badRequest('No chapters found for this exam', 'NO_CHAPTERS');
    }

    const result = TaskDistributor.distribute({
      chapters,
      subjects,
      totalDays,
      hoursPerDay,
      startDate: startDate ? new Date(startDate) : undefined,
    });

    return {
      exam: { id: exam._id, name: exam.name, slug: exam.slug },
      ...result,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get today's tasks for a user.
   */
  static async getTodayTasks(userId) {
    const tasks = await DailyTaskRepository.findTodayTasks(userId);
    return tasks.map((t) => t.toJSON());
  }

  /**
   * Get tasks for a specific date.
   */
  static async getTasksByDate(userId, date) {
    const tasks = await DailyTaskRepository.findByUserAndDate(userId, new Date(date));
    return tasks.map((t) => t.toJSON());
  }

  /**
   * Get tasks for a plan and day number.
   */
  static async getTasksByPlanDay(userId, planId, dayNumber) {
    const tasks = await DailyTaskRepository.findByPlanAndDay(userId, planId, dayNumber);
    return tasks.map((t) => t.toJSON());
  }

  /**
   * Get all tasks for a plan (with day grouping).
   */
  static async getTasksByPlan(userId, planId) {
    const tasks = await DailyTaskRepository.findByPlanId(userId, planId);
    const mapped = tasks.map((t) => t.toJSON());

    // Group by day
    const grouped = {};
    for (const task of mapped) {
      const day = task.dayNumber;
      if (!grouped[day]) grouped[day] = { dayNumber: day, date: task.date, tasks: [] };
      grouped[day].tasks.push(task);
    }

    return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber);
  }

  /**
   * Get a single task by ID.
   */
  static async getTaskById(userId, taskId) {
    const task = await DailyTaskRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
    }
    return task.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STATUS UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update a task's status (pending → in-progress → completed / skipped).
   */
  static async updateTaskStatus(userId, taskId, status) {
    const task = await DailyTaskRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
    }

    const update = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
    } else {
      update.completedAt = null;
    }

    const updated = await DailyTaskRepository.updateById(taskId, update);
    return updated.toJSON();
  }

  /**
   * Add/update notes on a task.
   */
  static async updateTaskNotes(userId, taskId, notes) {
    const task = await DailyTaskRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
    }

    const updated = await DailyTaskRepository.updateById(taskId, { notes });
    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STATS / PROGRESS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get completion progress for a plan.
   */
  static async getPlanProgress(userId, planId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectPlanId = new mongoose.Types.ObjectId(planId);

    const statusCounts = await DailyTaskRepository.countByPlanAndStatus(
      objectUserId,
      objectPlanId
    );

    const result = { total: 0, pending: 0, inProgress: 0, completed: 0, skipped: 0 };
    for (const item of statusCounts) {
      const key = item._id === 'in-progress' ? 'inProgress' : item._id;
      result[key] = item.count;
      result.total += item.count;
    }

    result.completionRate = result.total > 0
      ? Math.round((result.completed / result.total) * 100)
      : 0;

    return result;
  }

  /**
   * Get user's overall study stats.
   */
  static async getUserStats(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const agg = await DailyTaskRepository.getUserStats(objectUserId);

    if (agg.length === 0) {
      return {
        totalTasks: 0, completedTasks: 0, skippedTasks: 0,
        totalHours: 0, completedHours: 0, completionRate: 0,
      };
    }

    const s = agg[0];
    return {
      totalTasks: s.totalTasks,
      completedTasks: s.completedTasks,
      skippedTasks: s.skippedTasks,
      totalHours: Math.round((s.totalMinutes / 60) * 10) / 10,
      completedHours: Math.round((s.completedMinutes / 60) * 10) / 10,
      completionRate: s.totalTasks > 0
        ? Math.round((s.completedTasks / s.totalTasks) * 100)
        : 0,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete all tasks for a plan.
   */
  static async deleteTasksByPlan(userId, planId) {
    // Verify plan ownership
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }
    const result = await DailyTaskRepository.deleteByPlanId(plan._id);
    return result.deletedCount || 0;
  }
}

module.exports = DailyTaskService;
