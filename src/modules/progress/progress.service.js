/**
 * StudyOS - Progress Service (Business Logic Layer)
 *
 * Manages the task completion + time tracking lifecycle:
 *   1. Start session → marks task "in-progress", records startedAt
 *   2. Complete session → marks task "completed", records actualMinutes, rating
 *   3. Streak tracking → consecutive study days
 *   4. Analytics → by date range, by subject, overall stats
 */

const AppError = require('../../shared/errors/AppError');
const ProgressRepository = require('./progress.repository');
const DailyTask = require('../dailytask/dailytask.model');
const mongoose = require('mongoose');

class ProgressService {
  // ───────────────────────────────────────────────────────────────────────────────
  // START SESSION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Start a study session for a task.
   * Marks the task as "in-progress" and creates a StudySession.
   *
   * @param {string} userId
   * @param {string} taskId
   * @returns {Promise<object>} The created session
   */
  static async startSession(userId, taskId) {
    // Check for existing active session
    const activeSession = await ProgressRepository.findActiveSession(userId);
    if (activeSession) {
      throw AppError.conflict(
        `You already have an active session (${activeSession.chapterName}). Complete or abandon it first.`,
        'SESSION_ACTIVE'
      );
    }

    // Find the task
    const task = await DailyTask.findOne({ _id: taskId, userId });
    if (!task) {
      throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
    }

    if (task.status === 'completed') {
      throw AppError.badRequest('Task is already completed', 'TASK_COMPLETED');
    }

    // Mark task as in-progress
    await DailyTask.findByIdAndUpdate(taskId, { status: 'in-progress' });

    // Create session
    const session = await ProgressRepository.create({
      userId,
      taskId: task._id,
      examId: task.examId,
      subjectId: task.subjectId,
      chapterId: task.chapterId,
      subjectName: task.subjectName,
      subjectIcon: task.subjectIcon,
      subjectColor: task.subjectColor,
      chapterName: task.chapterName,
      allocatedMinutes: task.durationMinutes || 0,
      startedAt: new Date(),
      status: 'active',
    });

    return session;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // COMPLETE SESSION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Complete an active study session.
   * Marks the task as "completed", records actual time and rating.
   *
   * @param {string} userId
   * @param {string} sessionId
   * @param {object} data - { rating, notes, actualMinutes? }
   * @returns {Promise<object>} Updated session
   */
  static async completeSession(userId, sessionId, data = {}) {
    const session = await ProgressRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw AppError.notFound('Session not found', 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'active') {
      throw AppError.badRequest('Session is not active', 'SESSION_NOT_ACTIVE');
    }

    const now = new Date();
    const elapsedMs = now.getTime() - session.startedAt.getTime();
    const calculatedMinutes = Math.round(elapsedMs / 60000);

    // Use provided actualMinutes or calculate from elapsed time
    const actualMinutes = data.actualMinutes || calculatedMinutes;

    // Update session
    const updated = await ProgressRepository.updateById(sessionId, {
      status: 'completed',
      completedAt: now,
      actualMinutes: Math.max(1, actualMinutes),
      rating: data.rating || null,
      notes: data.notes || '',
    });

    // Mark task as completed
    if (session.taskId) {
      await DailyTask.findByIdAndUpdate(session.taskId, {
        status: 'completed',
        completedAt: now,
      });
    }

    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // ABANDON SESSION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Abandon an active session (student quit early).
   */
  static async abandonSession(userId, sessionId) {
    const session = await ProgressRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw AppError.notFound('Session not found', 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'active') {
      throw AppError.badRequest('Session is not active', 'SESSION_NOT_ACTIVE');
    }

    const now = new Date();
    const elapsedMinutes = Math.round(
      (now.getTime() - session.startedAt.getTime()) / 60000
    );

    const updated = await ProgressRepository.updateById(sessionId, {
      status: 'abandoned',
      completedAt: now,
      actualMinutes: Math.max(0, elapsedMinutes),
    });

    // Revert task to pending
    if (session.taskId) {
      await DailyTask.findByIdAndUpdate(session.taskId, { status: 'pending' });
    }

    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // QUICK COMPLETE (no session timer)
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Quickly mark a task as completed without starting a session first.
   * Creates a backdated session record for analytics.
   */
  static async quickComplete(userId, taskId, data = {}) {
    const task = await DailyTask.findOne({ _id: taskId, userId });
    if (!task) {
      throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
    }

    if (task.status === 'completed') {
      throw AppError.badRequest('Task is already completed', 'TASK_COMPLETED');
    }

    const now = new Date();

    // Mark task completed
    await DailyTask.findByIdAndUpdate(taskId, {
      status: 'completed',
      completedAt: now,
    });

    // Create a completed session for tracking
    const session = await ProgressRepository.create({
      userId,
      taskId: task._id,
      examId: task.examId,
      subjectId: task.subjectId,
      chapterId: task.chapterId,
      subjectName: task.subjectName,
      subjectIcon: task.subjectIcon,
      subjectColor: task.subjectColor,
      chapterName: task.chapterName,
      allocatedMinutes: task.durationMinutes || 0,
      actualMinutes: data.actualMinutes || task.durationMinutes || 30,
      startedAt: now,
      completedAt: now,
      status: 'completed',
      rating: data.rating || null,
      notes: data.notes || '',
    });

    return { task: task.toJSON(), session };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get current active session (if any).
   */
  static async getActiveSession(userId) {
    const session = await ProgressRepository.findActiveSession(userId);
    return session ? session.toJSON() : null;
  }

  /**
   * Get recent sessions.
   */
  static async getRecentSessions(userId, limit = 20) {
    const sessions = await ProgressRepository.findRecentSessions(userId, limit);
    return sessions.map((s) => s.toJSON());
  }

  /**
   * Get a session by ID.
   */
  static async getSessionById(userId, sessionId) {
    const session = await ProgressRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw AppError.notFound('Session not found', 'SESSION_NOT_FOUND');
    }
    return session.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STREAKS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate the user's current and longest study streak.
   */
  static async getStreaks(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const studyDates = await ProgressRepository.getStudyDates(objectUserId, 365);

    if (studyDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
    }

    // Convert to Date array, sorted newest first
    const dates = studyDates.map((d) => d._id).sort().reverse();

    // Current streak: count consecutive days from today backwards
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let checkDate = dates[0] === today || dates[0] === yesterday ? dates[0] : null;

    if (checkDate) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i - 1]);
        const prev = new Date(dates[i]);
        const diffDays = Math.round((curr - prev) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest streak
    let longestStreak = 1;
    let streak = 1;
    const sorted = [...dates].sort();

    for (let i = 1; i < sorted.length; i++) {
      const curr = new Date(sorted[i]);
      const prev = new Date(sorted[i - 1]);
      const diffDays = Math.round((curr - prev) / 86400000);
      if (diffDays === 1) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 1;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalStudyDays: dates.length,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get study analytics for a date range.
   */
  static async getAnalytics(userId, days = 30) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [dailyData, subjectData, totalStats, streaks] = await Promise.all([
      ProgressRepository.getStudyTimeByRange(objectUserId, startDate, endDate),
      ProgressRepository.getStudyTimeBySubject(objectUserId),
      ProgressRepository.getTotalStats(objectUserId),
      this.getStreaks(userId),
    ]);

    const total = totalStats[0] || {
      totalSessions: 0, totalMinutes: 0, avgMinutesPerSession: 0, avgRating: 0,
    };

    return {
      period: { startDate, endDate, days },
      daily: dailyData,
      subjects: subjectData,
      totals: {
        totalSessions: total.totalSessions,
        totalHours: Math.round((total.totalMinutes / 60) * 10) / 10,
        avgMinutesPerSession: Math.round(total.avgMinutesPerSession || 0),
        avgRating: Math.round((total.avgRating || 0) * 10) / 10,
      },
      streaks,
    };
  }
}

module.exports = ProgressService;
