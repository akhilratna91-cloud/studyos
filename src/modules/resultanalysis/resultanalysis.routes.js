/**
 * StudyOS - Result Analysis Routes
 */

const { Router } = require('express');
const ctrl = require('./resultanalysis.controller');
const v = require('./resultanalysis.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.get('/:attemptId', v.analyzeRules, v.validate, ctrl.analyzeResult);

module.exports = router;
