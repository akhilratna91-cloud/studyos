/**
 * StudyOS - Adaptive Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const adaptiveController = require('./adaptive.controller');
const {
  planIdParam,
  logIdParam,
  adjustRules,
  validate,
} = require('./adaptive.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

router.use(protect);

// ─── Analyze (read-only preview) ────────────────────────────────────────────────
router.get('/analyze/:planId', planIdParam, validate, adaptiveController.analyzePlan);

// ─── Adjust (apply changes) ─────────────────────────────────────────────────────
router.post('/adjust/:planId', planIdParam, adjustRules, validate, adaptiveController.adjustPlan);

// ─── History ────────────────────────────────────────────────────────────────────
router.get('/me',                                              adaptiveController.getUserAdjustments);
router.get('/history/:planId',  planIdParam, validate,         adaptiveController.getHistory);
router.get('/latest/:planId',   planIdParam, validate,         adaptiveController.getLatest);
router.get('/log/:id',          logIdParam,  validate,         adaptiveController.getLogById);

module.exports = router;
