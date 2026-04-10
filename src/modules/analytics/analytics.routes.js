/**
 * StudyOS - Analytics Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const analyticsController = require('./analytics.controller');
const {
  subjectIdParam,
  planIdParam,
  examIdQuery,
  heatmapQuery,
  validate,
} = require('./analytics.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

router.use(protect);

// ─── Overview ───────────────────────────────────────────────────────────────────
router.get('/overview',              analyticsController.getOverview);

// ─── Hierarchical progress ──────────────────────────────────────────────────────
router.get('/subjects',    examIdQuery,    validate, analyticsController.getSubjectProgress);
router.get('/chapters/:subjectId', subjectIdParam, validate, analyticsController.getChapterProgress);

// ─── Plan completion ────────────────────────────────────────────────────────────
router.get('/plan/:planId', planIdParam,   validate, analyticsController.getPlanCompletion);

// ─── Trends ─────────────────────────────────────────────────────────────────────
router.get('/weekly',                      analyticsController.getWeeklyComparison);
router.get('/heatmap',     heatmapQuery,   validate, analyticsController.getHeatmap);

module.exports = router;
