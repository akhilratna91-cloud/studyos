/**
 * StudyOS - Question Routes
 * Protected: all write operations require auth.
 * Read operations also require auth (question bank is per-exam, not public).
 */

const { Router } = require('express');
const ctrl = require('./question.controller');
const v = require('./question.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

// ─── Create ─────────────────────────────────────────────────────────────────────
router.post('/',         v.createRules,     v.validate, ctrl.createQuestion);
router.post('/bulk',     v.bulkCreateRules, v.validate, ctrl.bulkCreate);
router.post('/seed',     ctrl.seedQuestions);

// ─── Quiz generation (read — no correct answers) ────────────────────────────────
router.get('/quiz/chapter/:chapterId', v.chapterParam, v.quizQuery, v.validate, ctrl.generateChapterQuiz);
router.get('/quiz/subject/:subjectId', v.subjectParam, v.quizQuery, v.validate, ctrl.generateSubjectQuiz);

// ─── Answer verification ────────────────────────────────────────────────────────
router.post('/:id/verify', v.idParam, v.verifyRules, v.validate, ctrl.verifyAnswer);

// ─── Search ─────────────────────────────────────────────────────────────────────
router.get('/search/tags', v.tagQuery, v.validate, ctrl.searchByTags);

// ─── Read by hierarchy ──────────────────────────────────────────────────────────
router.get('/chapter/:chapterId',  v.chapterParam, v.filterQuery, v.validate, ctrl.getByChapter);
router.get('/subject/:subjectId',  v.subjectParam, v.filterQuery, v.validate, ctrl.getBySubject);
router.get('/exam/:examId',        v.examParam,    v.filterQuery, v.validate, ctrl.getByExam);
router.get('/topic/:topicId',      v.topicParam,   v.validate, ctrl.getByTopic);
router.get('/stats/:examId',       v.examParam,    v.validate, ctrl.getStats);

// ─── Single question CRUD ───────────────────────────────────────────────────────
router.get('/:id',    v.idParam, v.validate, ctrl.getById);
router.put('/:id',    v.idParam, v.updateRules, v.validate, ctrl.updateQuestion);
router.delete('/:id', v.idParam, v.validate, ctrl.deleteQuestion);

module.exports = router;
