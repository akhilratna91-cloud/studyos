/**
 * StudyOS - Evaluation Routes
 */

const { Router } = require('express');
const ctrl = require('./evaluation.controller');
const v = require('./evaluation.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.post('/evaluate', v.evaluateRules, v.validate, ctrl.evaluateAnswers);

module.exports = router;
