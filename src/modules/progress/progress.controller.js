/**
 * StudyOS - Progress Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ProgressService = require('./progress.service');

/**
 * @route   POST /api/v1/progress/start
 * @desc    Start a study session for a task
 * @access  Private
 */
const startSession = asyncHandler(async (req, res) => {
  const session = await ProgressService.startSession(req.user._id, req.body.taskId);

  sendSuccess(res, {
    statusCode: 201,
    message: `Study session started — ${session.chapterName}. Focus time! 🎯`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/progress/:id/complete
 * @desc    Complete an active study session
 * @access  Private
 */
const completeSession = asyncHandler(async (req, res) => {
  const session = await ProgressService.completeSession(
    req.user._id,
    req.params.id,
    req.body
  );

  sendSuccess(res, {
    statusCode: 200,
    message: `Session completed — ${session.actualMinutes} minutes of focused study! ✅`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/progress/:id/abandon
 * @desc    Abandon an active session
 * @access  Private
 */
const abandonSession = asyncHandler(async (req, res) => {
  const session = await ProgressService.abandonSession(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Session abandoned. Task reverted to pending.',
    data: { session },
  });
});

/**
 * @route   POST /api/v1/progress/quick-complete
 * @desc    Mark a task completed without a session timer
 * @access  Private
 */
const quickComplete = asyncHandler(async (req, res) => {
  const result = await ProgressService.quickComplete(
    req.user._id,
    req.body.taskId,
    req.body
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Task completed! ✅',
    data: result,
  });
});

/**
 * @route   GET /api/v1/progress/active
 * @desc    Get current active session (if any)
 * @access  Private
 */
const getActiveSession = asyncHandler(async (req, res) => {
  const session = await ProgressService.getActiveSession(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: session ? 'Active session found' : 'No active session',
    data: { session },
  });
});

/**
 * @route   GET /api/v1/progress/recent?limit=20
 * @desc    Get recent study sessions
 * @access  Private
 */
const getRecentSessions = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const sessions = await ProgressService.getRecentSessions(req.user._id, limit);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Recent sessions retrieved',
    data: { sessions, total: sessions.length },
  });
});

/**
 * @route   GET /api/v1/progress/:id
 * @desc    Get a session by ID
 * @access  Private
 */
const getSessionById = asyncHandler(async (req, res) => {
  const session = await ProgressService.getSessionById(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Session retrieved',
    data: { session },
  });
});

/**
 * @route   GET /api/v1/progress/streaks
 * @desc    Get current and longest study streak
 * @access  Private
 */
const getStreaks = asyncHandler(async (req, res) => {
  const streaks = await ProgressService.getStreaks(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: streaks.currentStreak > 0
      ? `🔥 ${streaks.currentStreak}-day streak! Keep it going!`
      : 'Start studying today to build your streak!',
    data: { streaks },
  });
});

/**
 * @route   GET /api/v1/progress/analytics?days=30
 * @desc    Get study analytics (daily, by subject, totals, streaks)
 * @access  Private
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const analytics = await ProgressService.getAnalytics(req.user._id, days);

  sendSuccess(res, {
    statusCode: 200,
    message: `Study analytics for the last ${days} days`,
    data: { analytics },
  });
});

module.exports = {
  startSession,
  completeSession,
  abandonSession,
  quickComplete,
  getActiveSession,
  getRecentSessions,
  getSessionById,
  getStreaks,
  getAnalytics,
};
