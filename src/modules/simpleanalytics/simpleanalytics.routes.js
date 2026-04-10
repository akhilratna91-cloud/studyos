/**
 * StudyOS - Simple Analytics Routes
 */

const { Router } = require('express');
const ctrl = require('./simpleanalytics.controller');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.get('/:userId', ctrl.getAnalytics);

module.exports = router;
