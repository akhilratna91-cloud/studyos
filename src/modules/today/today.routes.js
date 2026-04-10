/**
 * StudyOS - Today Dashboard Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const todayController = require('./today.controller');
const { upcomingQuery, validate } = require('./today.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

router.use(protect);

// Full dashboard
router.get('/',         todayController.getDashboard);

// Quick summary (for widgets)
router.get('/summary',  todayController.getQuickSummary);

// Upcoming tasks
router.get('/upcoming', upcomingQuery, validate, todayController.getUpcoming);

// Overdue tasks
router.get('/overdue',  todayController.getOverdue);

module.exports = router;
