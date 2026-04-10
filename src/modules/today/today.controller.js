/**
 * StudyOS - Today Dashboard Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const TodayService = require('./today.service');

/**
 * @route   GET /api/v1/today
 * @desc    Full dashboard — today's tasks, due revisions, plan context, progress
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await TodayService.getDashboard(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: `${dashboard.greeting}! Here's your study dashboard.`,
    data: dashboard,
  });
});

/**
 * @route   GET /api/v1/today/summary
 * @desc    Quick summary — task count, study time, revision due (for widgets)
 * @access  Private
 */
const getQuickSummary = asyncHandler(async (req, res) => {
  const summary = await TodayService.getQuickSummary(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Quick summary retrieved',
    data: summary,
  });
});

/**
 * @route   GET /api/v1/today/upcoming?days=7
 * @desc    Upcoming tasks for the next N days
 * @access  Private
 */
const getUpcoming = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;
  const upcoming = await TodayService.getUpcoming(req.user._id, days);

  sendSuccess(res, {
    statusCode: 200,
    message: `Upcoming tasks for the next ${days} days`,
    data: upcoming,
  });
});

/**
 * @route   GET /api/v1/today/overdue
 * @desc    Past-due tasks that need attention
 * @access  Private
 */
const getOverdue = asyncHandler(async (req, res) => {
  const overdue = await TodayService.getOverdue(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: overdue.total > 0
      ? `${overdue.total} overdue task(s) need attention`
      : 'You\'re all caught up! No overdue tasks.',
    data: overdue,
  });
});

module.exports = {
  getDashboard,
  getQuickSummary,
  getUpcoming,
  getOverdue,
};
