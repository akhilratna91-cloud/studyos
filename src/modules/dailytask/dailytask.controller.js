/**
 * StudyOS - DailyTask Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const DailyTaskService = require('./dailytask.service');

/**
 * @route   POST /api/v1/tasks/generate
 * @desc    Generate tasks from an existing study plan
 * @access  Private
 */
const generateFromPlan = asyncHandler(async (req, res) => {
  const result = await DailyTaskService.generateFromPlan(req.user._id, req.body.planId);

  sendSuccess(res, {
    statusCode: 201,
    message: result.message,
    data: result,
  });
});

/**
 * @route   POST /api/v1/tasks/distribute-preview
 * @desc    Preview task distribution without saving
 * @access  Private
 */
const distributePreview = asyncHandler(async (req, res) => {
  const result = await DailyTaskService.distributePreview(req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Task distribution preview generated',
    data: result,
  });
});

/**
 * @route   GET /api/v1/tasks/today
 * @desc    Get today's tasks for the user
 * @access  Private
 */
const getTodayTasks = asyncHandler(async (req, res) => {
  const tasks = await DailyTaskService.getTodayTasks(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Today\'s tasks retrieved successfully',
    data: { tasks, total: tasks.length },
  });
});

/**
 * @route   GET /api/v1/tasks/by-date?date=2026-04-02
 * @desc    Get tasks for a specific date
 * @access  Private
 */
const getTasksByDate = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString();
  const tasks = await DailyTaskService.getTasksByDate(req.user._id, date);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Tasks retrieved successfully',
    data: { tasks, total: tasks.length },
  });
});

/**
 * @route   GET /api/v1/tasks/plan/:planId
 * @desc    Get all tasks for a plan (grouped by day)
 * @access  Private
 */
const getTasksByPlan = asyncHandler(async (req, res) => {
  const days = await DailyTaskService.getTasksByPlan(req.user._id, req.params.planId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Plan tasks retrieved successfully',
    data: { days, totalDays: days.length },
  });
});

/**
 * @route   GET /api/v1/tasks/plan/:planId/day/:dayNumber
 * @desc    Get tasks for a specific day in a plan
 * @access  Private
 */
const getTasksByPlanDay = asyncHandler(async (req, res) => {
  const tasks = await DailyTaskService.getTasksByPlanDay(
    req.user._id,
    req.params.planId,
    parseInt(req.params.dayNumber, 10)
  );

  sendSuccess(res, {
    statusCode: 200,
    message: `Day ${req.params.dayNumber} tasks retrieved`,
    data: { tasks, total: tasks.length },
  });
});

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get a single task
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await DailyTaskService.getTaskById(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Task retrieved successfully',
    data: { task },
  });
});

/**
 * @route   PATCH /api/v1/tasks/:id/status
 * @desc    Update task status
 * @access  Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await DailyTaskService.updateTaskStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );

  sendSuccess(res, {
    statusCode: 200,
    message: `Task marked as ${req.body.status}`,
    data: { task },
  });
});

/**
 * @route   PATCH /api/v1/tasks/:id/notes
 * @desc    Update task notes
 * @access  Private
 */
const updateTaskNotes = asyncHandler(async (req, res) => {
  const task = await DailyTaskService.updateTaskNotes(
    req.user._id,
    req.params.id,
    req.body.notes
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Task notes updated',
    data: { task },
  });
});

/**
 * @route   GET /api/v1/tasks/progress/plan/:planId
 * @desc    Get completion progress for a plan
 * @access  Private
 */
const getPlanProgress = asyncHandler(async (req, res) => {
  const progress = await DailyTaskService.getPlanProgress(
    req.user._id,
    req.params.planId
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Plan progress retrieved',
    data: { progress },
  });
});

/**
 * @route   GET /api/v1/tasks/stats/me
 * @desc    Get user's overall study stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await DailyTaskService.getUserStats(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'User stats retrieved',
    data: { stats },
  });
});

/**
 * @route   DELETE /api/v1/tasks/plan/:planId
 * @desc    Delete all tasks for a plan
 * @access  Private
 */
const deleteTasksByPlan = asyncHandler(async (req, res) => {
  const count = await DailyTaskService.deleteTasksByPlan(req.user._id, req.params.planId);

  sendSuccess(res, {
    statusCode: 200,
    message: `Deleted ${count} tasks`,
    data: { deletedCount: count },
  });
});

module.exports = {
  generateFromPlan,
  distributePreview,
  getTodayTasks,
  getTasksByDate,
  getTasksByPlan,
  getTasksByPlanDay,
  getTaskById,
  updateTaskStatus,
  updateTaskNotes,
  getPlanProgress,
  getUserStats,
  deleteTasksByPlan,
};
