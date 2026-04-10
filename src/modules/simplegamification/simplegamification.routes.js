/**
 * StudyOS - Simple Gamification Routes
 */

const { Router } = require('express');
const ctrl = require('./simplegamification.controller');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.post('/xp', ctrl.addXp);
router.get('/level/:userId', ctrl.getLevel);
router.get('/streak/:userId', ctrl.getStreak);

module.exports = router;
