/**
 * StudyOS - Quiz Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const ctrl = require('./quiz.controller');
const v = require('./quiz.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

// ─── Generate quizzes ───────────────────────────────────────────────────────────
router.post('/generate/chapter', v.generateChapterRules, v.validate, ctrl.generateChapterQuiz);
router.post('/generate/subject', v.generateSubjectRules, v.validate, ctrl.generateSubjectQuiz);
router.post('/generate/mock',    v.generateMockRules,    v.validate, ctrl.generateMockTest);

// ─── Attempt lifecycle ──────────────────────────────────────────────────────────
router.post('/:id/start',    v.idParam, v.validate, ctrl.startAttempt);
router.post('/:id/answer',   v.idParam, v.submitAnswerRules, v.validate, ctrl.submitAnswer);
router.post('/:id/finish',   v.idParam, v.validate, ctrl.finishAttempt);
router.post('/:id/abandon',  v.idParam, v.validate, ctrl.abandonAttempt);

// ─── Review & history ───────────────────────────────────────────────────────────
router.get('/history',   v.historyQuery, v.validate, ctrl.getHistory);
router.get('/stats',     ctrl.getUserStats);
router.get('/my',        v.typeQuery, v.validate, ctrl.getUserQuizzes);
router.get('/:id/review', v.idParam, v.validate, ctrl.reviewAttempt);
router.get('/:id',       v.idParam, v.validate, ctrl.getQuizById);

module.exports = router;
