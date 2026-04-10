/**
 * StudyOS - StudyPlan Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const StudyPlanService = require('./studyplan.service');

/**
 * @route   POST /api/v1/plans/generate
 * @desc    Generate a new day-wise study plan
 * @access  Private
 */
const generatePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlanService.generatePlan(req.user._id, req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Study plan generated successfully',
    data: { plan },
  });
});

/**
 * @route   GET /api/v1/plans
 * @desc    List all plans for the authenticated user (lightweight, no schedule)
 * @access  Private
 */
const getUserPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlanService.getUserPlans(req.user._id, req.query);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Study plans retrieved successfully',
    data: { plans, total: plans.length },
  });
});

/**
 * @route   GET /api/v1/plans/:id
 * @desc    Get a full plan with schedule
 * @access  Private (owner only)
 */
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await StudyPlanService.getPlanById(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Study plan retrieved successfully',
    data: { plan },
  });
});

/**
 * @route   GET /api/v1/plans/:id/day/:dayNumber
 * @desc    Get a specific day from a plan
 * @access  Private (owner only)
 */
const getPlanDay = asyncHandler(async (req, res) => {
  const day = await StudyPlanService.getPlanDay(
    req.user._id,
    req.params.id,
    parseInt(req.params.dayNumber, 10)
  );

  sendSuccess(res, {
    statusCode: 200,
    message: `Day ${req.params.dayNumber} retrieved successfully`,
    data: { day },
  });
});

/**
 * @route   PATCH /api/v1/plans/:id
 * @desc    Update plan metadata (title, status)
 * @access  Private (owner only)
 */
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlanService.updatePlan(req.user._id, req.params.id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Study plan updated successfully',
    data: { plan },
  });
});

/**
 * @route   DELETE /api/v1/plans/:id
 * @desc    Delete a plan
 * @access  Private (owner only)
 */
const deletePlan = asyncHandler(async (req, res) => {
  await StudyPlanService.deletePlan(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Study plan deleted successfully',
  });
});

module.exports = {
  generatePlan,
  getUserPlans,
  getPlanById,
  getPlanDay,
  updatePlan,
  deletePlan,
};
