/**
 * StudyOS - DailyTask Routes
 *
 * All routes require authentication (tasks are user-scoped).
 */

const { Router } = require('express');
const taskController = require('./dailytask.controller');
const {
  generateFromPlanRules,
  distributePreviewRules,
  updateStatusRules,
  updateNotesRules,
  taskIdParam,
  planIdParam,
  planDayParams,
  dateQuery,
  validate,
} = require('./dailytask.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// All task routes require authentication
router.use(protect);

// ─── Generate / Distribute ──────────────────────────────────────────────────────
router.post('/generate',            generateFromPlanRules,   validate, taskController.generateFromPlan);
router.post('/distribute-preview',  distributePreviewRules,  validate, taskController.distributePreview);

// ─── Read (specific routes before parameterized) ────────────────────────────────
router.get('/today',                                                  taskController.getTodayTasks);
router.get('/by-date',              dateQuery,               validate, taskController.getTasksByDate);
router.get('/stats/me',                                               taskController.getUserStats);
router.get('/progress/plan/:planId', planIdParam,            validate, taskController.getPlanProgress);
router.get('/plan/:planId/day/:dayNumber', planDayParams,    validate, taskController.getTasksByPlanDay);
router.get('/plan/:planId',         planIdParam,             validate, taskController.getTasksByPlan);
router.get('/:id',                  taskIdParam,             validate, taskController.getTaskById);

// ─── Update ─────────────────────────────────────────────────────────────────────
router.patch('/:id/status',  taskIdParam, updateStatusRules, validate, taskController.updateTaskStatus);
router.patch('/:id/notes',   taskIdParam, updateNotesRules,  validate, taskController.updateTaskNotes);

// ─── Delete ─────────────────────────────────────────────────────────────────────
router.delete('/plan/:planId', planIdParam, validate, taskController.deleteTasksByPlan);

module.exports = router;
