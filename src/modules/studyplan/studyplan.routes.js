/**
 * StudyOS - StudyPlan Routes
 *
 * All routes require authentication (plans are user-scoped).
 */

const { Router } = require('express');
const studyPlanController = require('./studyplan.controller');
const {
  generatePlanRules,
  updatePlanRules,
  listPlansQuery,
  planIdParam,
  dayNumberParam,
  validate,
} = require('./studyplan.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// All plan routes require authentication
router.use(protect);

// ─── Generate ───────────────────────────────────────────────────────────────────
router.post('/generate', generatePlanRules, validate, studyPlanController.generatePlan);

// ─── List & Read ────────────────────────────────────────────────────────────────
router.get('/',             listPlansQuery, validate, studyPlanController.getUserPlans);
router.get('/:id',          planIdParam,    validate, studyPlanController.getPlanById);
router.get('/:id/day/:dayNumber', dayNumberParam, validate, studyPlanController.getPlanDay);

// ─── Update & Delete ────────────────────────────────────────────────────────────
router.patch('/:id',  planIdParam, updatePlanRules, validate, studyPlanController.updatePlan);
router.delete('/:id', planIdParam, validate, studyPlanController.deletePlan);

module.exports = router;
