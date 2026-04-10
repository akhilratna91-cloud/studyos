/**
 * StudyOS - ChapterProgress Routes
 * All routes require authentication.
 */

const { Router } = require('express');
const ctrl = require('./chapterprogress.controller');
const {
  examIdParam,
  subjectIdParam,
  chapterIdParam,
  statusQuery,
  validate,
} = require('./chapterprogress.validator');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

// ─── Writes ─────────────────────────────────────────────────────────────────────
router.post('/initialize/:examId',       examIdParam,    validate, ctrl.initialize);
router.post('/sync/:examId',             examIdParam,    validate, ctrl.syncAll);
router.post('/sync/chapter/:chapterId',  chapterIdParam, validate, ctrl.syncChapter);
router.post('/:chapterId/complete',      chapterIdParam, validate, ctrl.markCompleted);
router.post('/:chapterId/master',        chapterIdParam, validate, ctrl.markMastered);

// ─── Reads ──────────────────────────────────────────────────────────────────────
router.get('/status',                statusQuery,    validate, ctrl.getByStatus);
router.get('/rollup/subjects',       statusQuery,    validate, ctrl.getSubjectRollup);
router.get('/exam/:examId',          examIdParam,    validate, ctrl.getByExam);
router.get('/subject/:subjectId',    subjectIdParam, validate, ctrl.getBySubject);
router.get('/summary/:examId',       examIdParam,    validate, ctrl.getExamSummary);
router.get('/chapter/:chapterId',    chapterIdParam, validate, ctrl.getByChapter);

module.exports = router;
