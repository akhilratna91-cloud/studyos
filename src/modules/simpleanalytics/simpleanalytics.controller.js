/**
 * StudyOS - Simple Analytics Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const SimpleAnalyticsService = require('./simpleanalytics.service');

/**
 * @route   GET /api/v1/simple-analytics/:userId
 * @desc    Get simple accuracy, progress, and weak chapters
 */
const getAnalytics = asyncHandler(async (req, res) => {
  // Uses the user ID from the parameter (per the prompt requirements)
  // But we fallback to req.user._id if they just hit /api/v1/simple-analytics/me
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;

  const data = await SimpleAnalyticsService.getAnalytics(idToUse);

  // Return EXACT format requested by the prompt
  res.status(200).json(data);
});

module.exports = { getAnalytics };
