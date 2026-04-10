/**
 * StudyOS - Extra Routes
 */

const { Router } = require('express');
const ctrl = require('./extra.controller');
const { protect } = require('../../middleware/auth');

const router = Router();

// Calendar Routes
router.post('/calendar/mark', protect, ctrl.markCalendar);
router.get('/calendar/:userId', protect, ctrl.getCalendar);

// Notification Routes
router.get('/notifications/:userId', protect, ctrl.getNotifications);
// Utility exposed endpoint for generating
router.post('/notifications', protect, ctrl.createNotification);

// Session Routes
router.get('/sessions/:userId', protect, ctrl.getSessions);
// Utility exposed endpoint for generating
router.post('/sessions', protect, ctrl.saveSession);

module.exports = router;
