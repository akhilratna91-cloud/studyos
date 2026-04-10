/**
 * StudyOS - Revision Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const revisionController = require('./revision.controller');
const {
  initializeRules,
  reviewRules,
  cardIdParam,
  listQuery,
  scheduleQuery,
  statsQuery,
  validate,
} = require('./revision.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

router.use(protect);

// ─── Initialize ─────────────────────────────────────────────────────────────────
router.post('/initialize', initializeRules, validate, revisionController.initialize);

// ─── Review ─────────────────────────────────────────────────────────────────────
router.post('/:id/review', cardIdParam, reviewRules, validate, revisionController.processReview);

// ─── Read (specific before parameterized) ───────────────────────────────────────
router.get('/due',       statsQuery,    validate, revisionController.getDueCards);
router.get('/weak',      statsQuery,    validate, revisionController.getWeakTopics);
router.get('/schedule',  scheduleQuery, validate, revisionController.getSchedule);
router.get('/stats',     statsQuery,    validate, revisionController.getStats);
router.get('/cards',     listQuery,     validate, revisionController.getCards);
router.get('/:id',       cardIdParam,   validate, revisionController.getCardById);

// ─── Reset ──────────────────────────────────────────────────────────────────────
router.delete('/reset', initializeRules, validate, revisionController.resetForExam);

module.exports = router;
