/**
 * StudyOS - Analytics Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const AnalyticsService = require('./analytics.service');

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Complete progress overview (tasks, sessions, revision, plans)
 * @access  Private
 */
const getOverview = asyncHandler(async (req, res) => {
  const overview = await AnalyticsService.getOverview(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Progress overview retrieved',
    data: { overview },
  });
});

/**
 * @route   GET /api/v1/analytics/subjects?examId=...
 * @desc    Progress broken down by subject
 * @access  Private
 */
const getSubjectProgress = asyncHandler(async (req, res) => {
  const subjects = await AnalyticsService.getSubjectProgress(
    req.user._id,
    req.query.examId
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject progress retrieved',
    data: { subjects, total: subjects.length },
  });
});

/**
 * @route   GET /api/v1/analytics/chapters/:subjectId
 * @desc    Progress broken down by chapter for a subject
 * @access  Private
 */
const getChapterProgress = asyncHandler(async (req, res) => {
  const chapters = await AnalyticsService.getChapterProgress(
    req.user._id,
    req.params.subjectId
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapter progress retrieved',
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/analytics/plan/:planId
 * @desc    Plan completion stats with trajectory analysis
 * @access  Private
 */
const getPlanCompletion = asyncHandler(async (req, res) => {
  const result = await AnalyticsService.getPlanCompletion(
    req.user._id,
    req.params.planId
  );

  if (!result) {
    return sendSuccess(res, {
      statusCode: 404,
      message: 'Plan not found',
      data: null,
    });
  }

  sendSuccess(res, {
    statusCode: 200,
    message: result.trajectory.onTrack
      ? 'Plan is on track! Keep going!'
      : 'You\'re falling behind. Consider adjusting your plan.',
    data: result,
  });
});

/**
 * @route   GET /api/v1/analytics/weekly
 * @desc    This week vs last week comparison
 * @access  Private
 */
const getWeeklyComparison = asyncHandler(async (req, res) => {
  const comparison = await AnalyticsService.getWeeklyComparison(req.user._id);

  const trendMessages = {
    improving: '📈 Great work! You\'re studying more this week.',
    declining: '📉 This week is slower. Push a bit harder!',
    steady: '📊 Consistent pace — keep it up!',
  };

  sendSuccess(res, {
    statusCode: 200,
    message: trendMessages[comparison.trend],
    data: { comparison },
  });
});

/**
 * @route   GET /api/v1/analytics/heatmap?days=90
 * @desc    Study activity heatmap (GitHub-style contribution graph)
 * @access  Private
 */
const getHeatmap = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 90;
  const heatmap = await AnalyticsService.getHeatmap(req.user._id, days);

  sendSuccess(res, {
    statusCode: 200,
    message: `Study heatmap for the last ${days} days`,
    data: { heatmap, totalDays: heatmap.length },
  });
});

module.exports = {
  getOverview,
  getSubjectProgress,
  getChapterProgress,
  getPlanCompletion,
  getWeeklyComparison,
  getHeatmap,
};
