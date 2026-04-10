/**
 * StudyOS - Chapter Routes
 *
 * Public endpoints for reading chapters.
 * Protected endpoints for creating/updating/deleting.
 */

const { Router } = require('express');
const chapterController = require('./chapter.controller');
const {
  createChapterRules,
  updateChapterRules,
  chapterIdParam,
  subjectIdParam,
  examIdParam,
  chaptersByExamQuery,
  validate,
} = require('./chapter.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// ─── Public Routes (read-only) ──────────────────────────────────────────────────
router.get('/subject/:subjectId', subjectIdParam, validate, chapterController.getChaptersBySubject);
router.get('/exam/:examId',       examIdParam, chaptersByExamQuery, validate, chapterController.getChaptersByExam);
router.get('/:id',                chapterIdParam, validate, chapterController.getChapterById);

// ─── Protected Routes ───────────────────────────────────────────────────────────
router.post('/',        protect, createChapterRules, validate, chapterController.createChapter);
router.post('/seed',    protect, chapterController.seedChapters);
router.patch('/:id',    protect, chapterIdParam, updateChapterRules, validate, chapterController.updateChapter);
router.delete('/:id',   protect, chapterIdParam, validate, chapterController.deleteChapter);

module.exports = router;
