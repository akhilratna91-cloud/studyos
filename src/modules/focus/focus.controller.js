/**
 * StudyOS - Focus Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const FocusService = require('./focus.service');

/**
 * @route   POST /api/v1/focus/start
 * @desc    Start a Pomodoro focus session
 */
const startSession = asyncHandler(async (req, res) => {
  const session = await FocusService.startSession(req.user._id, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: `Focus mode activated — ${session.workMinutes}-min ${session.preset} session. Let's go! 🎯`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/focus/:id/complete-work
 * @desc    Complete a work cycle → transition to break
 */
const completeWork = asyncHandler(async (req, res) => {
  const session = await FocusService.completeWork(req.user._id, req.params.id);
  const msg = session.status === 'completed'
    ? `All ${session.completedCycles} cycles done! Great focus session! 🏆`
    : `Cycle ${session.completedCycles} done! Time for a ${session.phase === 'long_break' ? 'long' : 'short'} break. ☕`;
  sendSuccess(res, { statusCode: 200, message: msg, data: { session } });
});

/**
 * @route   POST /api/v1/focus/:id/complete-break
 * @desc    Complete a break → start next work cycle
 */
const completeBreak = asyncHandler(async (req, res) => {
  const session = await FocusService.completeBreak(req.user._id, req.params.id);
  sendSuccess(res, {
    statusCode: 200,
    message: `Break over! Starting cycle ${session.currentCycle}. Focus time! 💪`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/focus/:id/pause
 */
const pauseSession = asyncHandler(async (req, res) => {
  const session = await FocusService.pauseSession(req.user._id, req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Session paused ⏸️', data: { session } });
});

/**
 * @route   POST /api/v1/focus/:id/resume
 */
const resumeSession = asyncHandler(async (req, res) => {
  const session = await FocusService.resumeSession(req.user._id, req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Session resumed ▶️', data: { session } });
});

/**
 * @route   POST /api/v1/focus/:id/distraction
 */
const logDistraction = asyncHandler(async (req, res) => {
  const session = await FocusService.logDistraction(req.user._id, req.params.id);
  sendSuccess(res, {
    statusCode: 200,
    message: `Distraction logged (${session.distractions} total). Refocus! 🔄`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/focus/:id/end
 */
const endSession = asyncHandler(async (req, res) => {
  const session = await FocusService.endSession(req.user._id, req.params.id, req.body);
  sendSuccess(res, {
    statusCode: 200,
    message: `Focus session complete — ${session.totalWorkMinutes} min of deep work! ✅`,
    data: { session },
  });
});

/**
 * @route   POST /api/v1/focus/:id/abandon
 */
const abandonSession = asyncHandler(async (req, res) => {
  const session = await FocusService.abandonSession(req.user._id, req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Session abandoned', data: { session } });
});

/**
 * @route   GET /api/v1/focus/active
 */
const getActiveSession = asyncHandler(async (req, res) => {
  const session = await FocusService.getActiveSession(req.user._id);
  sendSuccess(res, {
    statusCode: 200,
    message: session ? 'Active focus session found' : 'No active session',
    data: { session },
  });
});

/**
 * @route   GET /api/v1/focus/recent
 */
const getRecentSessions = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const sessions = await FocusService.getRecentSessions(req.user._id, limit);
  sendSuccess(res, { statusCode: 200, message: 'Recent sessions', data: { sessions, total: sessions.length } });
});

/**
 * @route   GET /api/v1/focus/today
 */
const getTodayStats = asyncHandler(async (req, res) => {
  const stats = await FocusService.getTodayStats(req.user._id);
  sendSuccess(res, { statusCode: 200, message: 'Today\'s focus stats', data: { stats } });
});

/**
 * @route   GET /api/v1/focus/analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const analytics = await FocusService.getAnalytics(req.user._id, days);
  sendSuccess(res, { statusCode: 200, message: `Focus analytics for ${days} days`, data: { analytics } });
});

/**
 * @route   GET /api/v1/focus/presets
 */
const getPresets = asyncHandler(async (_req, res) => {
  const presets = FocusService.getPresets();
  sendSuccess(res, { statusCode: 200, message: 'Available presets', data: { presets } });
});

/**
 * @route   GET /api/v1/focus/:id
 */
const getSessionById = asyncHandler(async (req, res) => {
  const session = await FocusService.getSessionById(req.user._id, req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Session retrieved', data: { session } });
});

module.exports = {
  startSession, completeWork, completeBreak, pauseSession, resumeSession,
  logDistraction, endSession, abandonSession, getActiveSession,
  getRecentSessions, getTodayStats, getAnalytics, getPresets, getSessionById,
};
