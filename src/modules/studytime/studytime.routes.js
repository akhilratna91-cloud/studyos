/**
 * StudyOS - StudyTime Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const ctrl = require('./studytime.controller');
const {
  setGoalRules, peakHoursQuery, calendarQuery, subjectAllocQuery, validate,
} = require('./studytime.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

// ─── Totals ─────────────────────────────────────────────────────────────────────
router.get('/totals', ctrl.getTotals);

// ─── Goals ──────────────────────────────────────────────────────────────────────
router.post('/goals', setGoalRules, validate, ctrl.setGoal);
router.get('/goals',  ctrl.getGoals);

// ─── Time intelligence ──────────────────────────────────────────────────────────
router.get('/peak-hours',          peakHoursQuery,    validate, ctrl.getPeakHours);
router.get('/day-patterns',        peakHoursQuery,    validate, ctrl.getDayPatterns);
router.get('/calendar',            calendarQuery,     validate, ctrl.getCalendar);
router.get('/subject-allocation',  subjectAllocQuery, validate, ctrl.getSubjectAllocation);

module.exports = router;
