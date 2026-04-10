/**
 * StudyOS - Focus Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const focusController = require('./focus.controller');
const {
  startSessionRules,
  endSessionRules,
  sessionIdParam,
  analyticsQuery,
  recentQuery,
  validate,
} = require('./focus.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

// ─── Session lifecycle ──────────────────────────────────────────────────────────
router.post('/start',                startSessionRules,          validate, focusController.startSession);
router.post('/:id/complete-work',    sessionIdParam,             validate, focusController.completeWork);
router.post('/:id/complete-break',   sessionIdParam,             validate, focusController.completeBreak);
router.post('/:id/pause',           sessionIdParam,             validate, focusController.pauseSession);
router.post('/:id/resume',          sessionIdParam,             validate, focusController.resumeSession);
router.post('/:id/distraction',     sessionIdParam,             validate, focusController.logDistraction);
router.post('/:id/end',             sessionIdParam, endSessionRules, validate, focusController.endSession);
router.post('/:id/abandon',         sessionIdParam,             validate, focusController.abandonSession);

// ─── Read (specific before parameterized) ───────────────────────────────────────
router.get('/active',    focusController.getActiveSession);
router.get('/recent',    recentQuery,     validate, focusController.getRecentSessions);
router.get('/today',     focusController.getTodayStats);
router.get('/analytics', analyticsQuery,  validate, focusController.getAnalytics);
router.get('/presets',   focusController.getPresets);
router.get('/:id',       sessionIdParam,  validate, focusController.getSessionById);

module.exports = router;
