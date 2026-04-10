/**
 * StudyOS - Gamification Routes
 * All routes require authentication (except XP table).
 */

const { Router } = require('express');
const ctrl = require('./gamification.controller');
const { protect } = require('../../middleware/auth');

const router = Router();

// Public
router.get('/xp-table', ctrl.getXPTable);

// Protected
router.use(protect);
router.get('/stats',       ctrl.getStats);
router.get('/progress',    ctrl.getOverallProgress);
router.get('/milestones',  ctrl.getMilestones);
router.post('/sync',       ctrl.syncStats);

module.exports = router;
