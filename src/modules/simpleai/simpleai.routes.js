/**
 * StudyOS - Simple AI Routes
 */

const { Router } = require('express');
const ctrl = require('./simpleai.controller');
const { protect } = require('../../middleware/auth');

const router = Router();

// Motivation can be public, but let's conform to the rest
router.use(protect);

router.get('/recommend/:userId', ctrl.recommend);
router.get('/weak/:userId', ctrl.weakAdvice);
router.get('/motivate', ctrl.motivate);

module.exports = router;
