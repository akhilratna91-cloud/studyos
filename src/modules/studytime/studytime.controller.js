/**
 * StudyOS - StudyTime Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const StudyTimeService = require('./studytime.service');

/**
 * @route   GET /api/v1/study-time/totals
 * @desc    Total study time — today, this week, this month, all-time
 */
const getTotals = asyncHandler(async (req, res) => {
  const totals = await StudyTimeService.getTotals(req.user._id);
  sendSuccess(res, {
    statusCode: 200,
    message: `Today: ${totals.today.totalHours}h | Week: ${totals.thisWeek.totalHours}h | All-time: ${totals.allTime.totalHours}h`,
    data: { totals },
  });
});

/**
 * @route   POST /api/v1/study-time/goals
 * @desc    Set a study time goal
 */
const setGoal = asyncHandler(async (req, res) => {
  const goal = await StudyTimeService.setGoal(req.user._id, req.body.periodType, req.body.targetMinutes);
  const targetHours = Math.round((req.body.targetMinutes / 60) * 10) / 10;
  sendSuccess(res, {
    statusCode: 201,
    message: `Goal set: ${targetHours} hours ${req.body.periodType} 🎯`,
    data: { goal },
  });
});

/**
 * @route   GET /api/v1/study-time/goals
 * @desc    Get active goals with progress
 */
const getGoals = asyncHandler(async (req, res) => {
  const goals = await StudyTimeService.getGoals(req.user._id);
  sendSuccess(res, {
    statusCode: 200,
    message: `${goals.length} active goal(s)`,
    data: { goals, total: goals.length },
  });
});

/**
 * @route   GET /api/v1/study-time/peak-hours?days=30
 * @desc    Peak study hours analysis
 */
const getPeakHours = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const result = await StudyTimeService.getPeakHours(req.user._id, days);
  sendSuccess(res, {
    statusCode: 200,
    message: `Your best study time is ${result.bestTimeBlock}. ${result.recommendation}`,
    data: { peakHours: result },
  });
});

/**
 * @route   GET /api/v1/study-time/day-patterns?days=30
 * @desc    Day-of-week study patterns
 */
const getDayPatterns = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const result = await StudyTimeService.getDayPatterns(req.user._id, days);
  sendSuccess(res, {
    statusCode: 200,
    message: `Strongest day: ${result.strongestDay} | Weakest: ${result.weakestDay}`,
    data: { dayPatterns: result },
  });
});

/**
 * @route   GET /api/v1/study-time/calendar?year=2026&month=4
 * @desc    Monthly calendar with study data per day
 */
const getCalendar = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const result = await StudyTimeService.getCalendar(req.user._id, year, month);
  sendSuccess(res, {
    statusCode: 200,
    message: `${result.daysStudied}/${result.daysInMonth} days studied (${result.studyRate}%)`,
    data: { calendar: result },
  });
});

/**
 * @route   GET /api/v1/study-time/subject-allocation?days=30
 * @desc    Time distribution across subjects
 */
const getSubjectAllocation = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const allocation = await StudyTimeService.getSubjectAllocation(req.user._id, days);
  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject time allocation',
    data: { subjects: allocation, total: allocation.length },
  });
});

module.exports = { getTotals, setGoal, getGoals, getPeakHours, getDayPatterns, getCalendar, getSubjectAllocation };
