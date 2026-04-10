/**
 * StudyOS - SubjectProgress Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const ctrl = require('./subjectprogress.controller');
const { examIdQuery, subjectIdParam, validate } = require('./subjectprogress.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.get('/',                examIdQuery,    validate, ctrl.getAll);
router.get('/strong',          examIdQuery,    validate, ctrl.getStrong);
router.get('/weak',            examIdQuery,    validate, ctrl.getWeak);
router.get('/recommendations', examIdQuery,    validate, ctrl.getRecommendations);
router.get('/:subjectId',     subjectIdParam, validate, ctrl.getDetail);

module.exports = router;
