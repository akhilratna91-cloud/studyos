/**
 * StudyOS - Adaptive Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const AdaptiveService = require('./adaptive.service');

/**
 * @route   GET /api/v1/adaptive/analyze/:planId
 * @desc    Analyze a plan — preview what would change (no mutations)
 * @access  Private
 */
const analyzePlan = asyncHandler(async (req, res) => {
  const result = await AdaptiveService.analyzePlan(req.user._id, req.params.planId);

  sendSuccess(res, {
    statusCode: 200,
    message: result.analysis.onTrack
      ? 'Plan is on track. No adjustments needed.'
      : `Plan is behind schedule. ${result.actions.length} adjustment(s) recommended.`,
    data: result,
  });
});

/**
 * @route   POST /api/v1/adaptive/adjust/:planId
 * @desc    Apply adaptive adjustments to a plan
 * @access  Private
 */
const adjustPlan = asyncHandler(async (req, res) => {
  const trigger = req.body.trigger || 'manual';
  const result = await AdaptiveService.adjustPlan(req.user._id, req.params.planId, trigger);

  sendSuccess(res, {
    statusCode: 200,
    message: result.summary,
    data: result,
  });
});

/**
 * @route   GET /api/v1/adaptive/history/:planId
 * @desc    Get adjustment history for a plan
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const logs = await AdaptiveService.getAdjustmentHistory(req.user._id, req.params.planId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Adjustment history retrieved',
    data: { logs, total: logs.length },
  });
});

/**
 * @route   GET /api/v1/adaptive/latest/:planId
 * @desc    Get the latest adjustment for a plan
 * @access  Private
 */
const getLatest = asyncHandler(async (req, res) => {
  const log = await AdaptiveService.getLatestAdjustment(req.user._id, req.params.planId);

  sendSuccess(res, {
    statusCode: 200,
    message: log ? 'Latest adjustment retrieved' : 'No adjustments found',
    data: { log },
  });
});

/**
 * @route   GET /api/v1/adaptive/log/:id
 * @desc    Get a single adjustment log
 * @access  Private
 */
const getLogById = asyncHandler(async (req, res) => {
  const log = await AdaptiveService.getAdjustmentById(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Adjustment log retrieved',
    data: { log },
  });
});

/**
 * @route   GET /api/v1/adaptive/me
 * @desc    Get all adjustments across all plans for the user
 * @access  Private
 */
const getUserAdjustments = asyncHandler(async (req, res) => {
  const logs = await AdaptiveService.getUserAdjustments(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'User adjustments retrieved',
    data: { logs, total: logs.length },
  });
});

module.exports = {
  analyzePlan,
  adjustPlan,
  getHistory,
  getLatest,
  getLogById,
  getUserAdjustments,
};
