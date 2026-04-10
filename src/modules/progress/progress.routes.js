/**
 * StudyOS - Progress Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const progressController = require('./progress.controller');
const {
  startSessionRules,
  completeSessionRules,
  quickCompleteRules,
  sessionIdParam,
  analyticsQuery,
  recentQuery,
  validate,
} = require('./progress.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

router.use(protect);

// ─── Sessions ───────────────────────────────────────────────────────────────────
router.post('/start',          startSessionRules,    validate, progressController.startSession);
router.post('/quick-complete', quickCompleteRules,   validate, progressController.quickComplete);
router.post('/:id/complete',   sessionIdParam, completeSessionRules, validate, progressController.completeSession);
router.post('/:id/abandon',    sessionIdParam,       validate, progressController.abandonSession);

// ─── Read (specific before parameterized) ───────────────────────────────────────
router.get('/active',     progressController.getActiveSession);
router.get('/recent',     recentQuery,     validate, progressController.getRecentSessions);
router.get('/streaks',    progressController.getStreaks);
router.get('/analytics',  analyticsQuery,  validate, progressController.getAnalytics);
router.get('/:id',        sessionIdParam,  validate, progressController.getSessionById);

module.exports = router;
