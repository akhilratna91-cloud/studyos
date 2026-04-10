/**
 * StudyOS - Focus Service (Business Logic Layer)
 *
 * Manages the Pomodoro focus lifecycle:
 *   1. Start focus session (with preset or custom config)
 *   2. Complete a work cycle → transition to break
 *   3. Complete a break → transition to next work cycle
 *   4. Pause / resume
 *   5. Log distraction
 *   6. End session (complete or abandon)
 *   7. Focus analytics
 */

const AppError = require('../../shared/errors/AppError');
const FocusRepository = require('./focus.repository');
const DailyTask = require('../dailytask/dailytask.model');
const mongoose = require('mongoose');

// ─── Preset Configurations ──────────────────────────────────────────────────────
const PRESETS = {
  pomodoro: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cyclesBeforeLongBreak: 4 },
  deepwork: { workMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 20, cyclesBeforeLongBreak: 3 },
  sprint:   { workMinutes: 15, shortBreakMinutes: 3, longBreakMinutes: 10, cyclesBeforeLongBreak: 4 },
  marathon: { workMinutes: 90, shortBreakMinutes: 15, longBreakMinutes: 30, cyclesBeforeLongBreak: 2 },
};

class FocusService {
  // ───────────────────────────────────────────────────────────────────────────────
  // START
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Start a new focus session.
   *
   * @param {string} userId
   * @param {object} input
   * @param {string} [input.preset='pomodoro']
   * @param {string} [input.taskId] - Link to a study task
   * @param {number} [input.targetCycles=4]
   * @param {number} [input.workMinutes] - Custom override
   * @param {number} [input.shortBreakMinutes]
   * @param {number} [input.longBreakMinutes]
   */
  static async startSession(userId, input = {}) {
    // Check for existing active session
    const existing = await FocusRepository.findActiveSession(userId);
    if (existing) {
      throw AppError.conflict(
        'You already have an active focus session. Complete or abandon it first.',
        'FOCUS_ACTIVE'
      );
    }

    const preset = input.preset || 'pomodoro';
    const config = PRESETS[preset] || PRESETS.pomodoro;

    // Allow custom overrides
    const sessionData = {
      userId,
      preset: PRESETS[preset] ? preset : 'custom',
      workMinutes: input.workMinutes || config.workMinutes,
      shortBreakMinutes: input.shortBreakMinutes || config.shortBreakMinutes,
      longBreakMinutes: input.longBreakMinutes || config.longBreakMinutes,
      cyclesBeforeLongBreak: config.cyclesBeforeLongBreak,
      targetCycles: input.targetCycles || 4,
      currentCycle: 1,
      completedCycles: 0,
      status: 'active',
      phase: 'work',
      startedAt: new Date(),
    };

    // Link to task if provided
    if (input.taskId) {
      const task = await DailyTask.findOne({ _id: input.taskId, userId });
      if (task) {
        sessionData.taskId = task._id;
        sessionData.chapterName = task.chapterName || 'Free Study';
        sessionData.subjectName = task.subjectName || '';
        sessionData.subjectIcon = task.subjectIcon || '🎯';
        sessionData.subjectColor = task.subjectColor || '#6366F1';

        // Mark task in-progress
        await DailyTask.findByIdAndUpdate(task._id, { status: 'in-progress' });
      }
    }

    const session = await FocusRepository.create(sessionData);
    return session;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CYCLE TRANSITIONS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Complete a work cycle → transition to break.
   */
  static async completeWork(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');
    if (session.status !== 'active' || session.phase !== 'work') {
      throw AppError.badRequest('Session is not in an active work phase', 'NOT_IN_WORK');
    }

    const newCompletedCycles = session.completedCycles + 1;
    const newWorkMinutes = session.totalWorkMinutes + session.workMinutes;

    // Determine break type
    const isLongBreak = newCompletedCycles % session.cyclesBeforeLongBreak === 0;
    const breakPhase = isLongBreak ? 'long_break' : 'short_break';

    // Check if all target cycles are done
    if (newCompletedCycles >= session.targetCycles) {
      const updated = await FocusRepository.updateById(sessionId, {
        completedCycles: newCompletedCycles,
        totalWorkMinutes: newWorkMinutes,
        status: 'completed',
        phase: 'work',
        completedAt: new Date(),
      });
      return updated.toJSON();
    }

    const updated = await FocusRepository.updateById(sessionId, {
      completedCycles: newCompletedCycles,
      totalWorkMinutes: newWorkMinutes,
      status: 'break',
      phase: breakPhase,
    });

    return updated.toJSON();
  }

  /**
   * Complete a break → transition to next work cycle.
   */
  static async completeBreak(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');
    if (session.status !== 'break') {
      throw AppError.badRequest('Session is not on a break', 'NOT_ON_BREAK');
    }

    const breakDuration = session.phase === 'long_break'
      ? session.longBreakMinutes
      : session.shortBreakMinutes;

    const updated = await FocusRepository.updateById(sessionId, {
      currentCycle: session.currentCycle + 1,
      totalBreakMinutes: session.totalBreakMinutes + breakDuration,
      status: 'active',
      phase: 'work',
    });

    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // PAUSE / RESUME
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Pause the session.
   */
  static async pauseSession(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');
    if (session.status !== 'active') {
      throw AppError.badRequest('Only active sessions can be paused', 'NOT_ACTIVE');
    }

    const updated = await FocusRepository.updateById(sessionId, {
      status: 'paused',
      pausedAt: new Date(),
    });
    return updated.toJSON();
  }

  /**
   * Resume a paused session.
   */
  static async resumeSession(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');
    if (session.status !== 'paused') {
      throw AppError.badRequest('Only paused sessions can be resumed', 'NOT_PAUSED');
    }

    const pauseDuration = session.pausedAt
      ? Math.round((Date.now() - session.pausedAt.getTime()) / 60000)
      : 0;

    const updated = await FocusRepository.updateById(sessionId, {
      status: 'active',
      pausedAt: null,
      totalPauseMinutes: session.totalPauseMinutes + pauseDuration,
    });
    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DISTRACTIONS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Log a distraction during the session.
   */
  static async logDistraction(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');

    const updated = await FocusRepository.updateById(sessionId, {
      distractions: session.distractions + 1,
    });
    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // END SESSION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Complete the session with a rating.
   */
  static async endSession(userId, sessionId, data = {}) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');

    if (session.status === 'completed' || session.status === 'abandoned') {
      throw AppError.badRequest('Session already ended', 'SESSION_ENDED');
    }

    // Calculate actual elapsed work time if session wasn't cycle-managed
    const now = new Date();
    let finalWorkMinutes = session.totalWorkMinutes;
    if (session.phase === 'work' && session.status === 'active') {
      // Add partial current cycle
      const cycleStart = session.pausedAt || session.startedAt;
      const partialMinutes = Math.round((now - cycleStart) / 60000);
      finalWorkMinutes += Math.min(partialMinutes, session.workMinutes);
    }

    const update = {
      status: 'completed',
      completedAt: now,
      totalWorkMinutes: finalWorkMinutes,
    };

    if (data.focusRating) update.focusRating = data.focusRating;
    if (data.notes) update.notes = data.notes;

    const updated = await FocusRepository.updateById(sessionId, update);

    // Mark task as completed if linked
    if (session.taskId && session.completedCycles >= session.targetCycles) {
      await DailyTask.findByIdAndUpdate(session.taskId, {
        status: 'completed',
        completedAt: now,
      });
    }

    return updated.toJSON();
  }

  /**
   * Abandon a session.
   */
  static async abandonSession(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');

    const updated = await FocusRepository.updateById(sessionId, {
      status: 'abandoned',
      completedAt: new Date(),
    });

    // Revert task
    if (session.taskId) {
      await DailyTask.findByIdAndUpdate(session.taskId, { status: 'pending' });
    }

    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get current active focus session.
   */
  static async getActiveSession(userId) {
    const session = await FocusRepository.findActiveSession(userId);
    if (!session) return null;

    const s = session.toJSON();

    // Add computed fields
    s.elapsedMinutes = Math.round((Date.now() - session.startedAt.getTime()) / 60000);
    s.isOnBreak = session.status === 'break';
    s.isPaused = session.status === 'paused';
    s.progressPercent = session.targetCycles > 0
      ? Math.round((session.completedCycles / session.targetCycles) * 100)
      : 0;

    return s;
  }

  /**
   * Get recent focus sessions.
   */
  static async getRecentSessions(userId, limit = 20) {
    const sessions = await FocusRepository.findRecent(userId, limit);
    return sessions.map((s) => s.toJSON());
  }

  /**
   * Get session by ID.
   */
  static async getSessionById(userId, sessionId) {
    const session = await FocusRepository.findByIdAndUser(sessionId, userId);
    if (!session) throw AppError.notFound('Focus session not found', 'SESSION_NOT_FOUND');
    return session.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STATS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get today's focus stats.
   */
  static async getTodayStats(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const stats = await FocusRepository.getTodayStats(objectUserId);

    const s = stats[0] || {
      sessions: 0, totalWorkMinutes: 0, totalBreakMinutes: 0,
      completedCycles: 0, totalDistractions: 0, avgFocusRating: 0,
    };

    return {
      sessions: s.sessions,
      focusHours: Math.round((s.totalWorkMinutes / 60) * 10) / 10,
      breakMinutes: s.totalBreakMinutes,
      cycles: s.completedCycles,
      distractions: s.totalDistractions,
      avgFocusRating: Math.round((s.avgFocusRating || 0) * 10) / 10,
    };
  }

  /**
   * Get focus analytics for N days.
   */
  static async getAnalytics(userId, days = 30) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [overallStats, dailyData] = await Promise.all([
      FocusRepository.getStats(objectUserId, days),
      FocusRepository.getDailyFocusTime(objectUserId, days),
    ]);

    const s = overallStats[0] || {
      sessions: 0, totalWorkMinutes: 0, totalBreakMinutes: 0,
      completedCycles: 0, totalDistractions: 0, avgFocusRating: 0,
      avgWorkPerSession: 0, longestSession: 0,
    };

    return {
      period: { days },
      totals: {
        sessions: s.sessions,
        focusHours: Math.round((s.totalWorkMinutes / 60) * 10) / 10,
        breakHours: Math.round((s.totalBreakMinutes / 60) * 10) / 10,
        cycles: s.completedCycles,
        distractions: s.totalDistractions,
        avgFocusRating: Math.round((s.avgFocusRating || 0) * 10) / 10,
        avgSessionMinutes: Math.round(s.avgWorkPerSession || 0),
        longestSessionMinutes: s.longestSession,
      },
      daily: dailyData,
    };
  }

  /**
   * Get available presets.
   */
  static getPresets() {
    return Object.entries(PRESETS).map(([name, config]) => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      ...config,
      description: {
        pomodoro: 'Classic 25-min work, 5-min break. Perfect for general study.',
        deepwork: '50-min deep focus. Best for complex problem solving.',
        sprint: '15-min bursts. Great for review or flashcards.',
        marathon: '90-min extended sessions. For exam-day preparation.',
      }[name],
    }));
  }
}

module.exports = FocusService;
