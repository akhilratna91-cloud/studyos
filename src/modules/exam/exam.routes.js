/**
 * StudyOS - Exam Routes
 *
 * Public endpoints for reading exam data.
 * Protected endpoints for creating/updating/deleting (admin ops).
 */

const { Router } = require('express');
const examController = require('./exam.controller');
const {
  createExamRules,
  updateExamRules,
  listExamsRules,
  examIdParam,
  examSlugParam,
  examCategoryParam,
  validate,
} = require('./exam.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// ─── Public Routes (read-only) ──────────────────────────────────────────────────
router.get('/',                    listExamsRules,    validate, examController.getAllExams);
router.get('/slug/:slug',          examSlugParam,     validate, examController.getExamBySlug);
router.get('/category/:category',  examCategoryParam, validate, examController.getExamsByCategory);
router.get('/:id',                 examIdParam,       validate, examController.getExamById);

// ─── Protected Routes (admin operations) ────────────────────────────────────────
router.post('/',       protect, createExamRules, validate, examController.createExam);
router.post('/seed',   protect, examController.seedExams);
router.patch('/:id',   protect, examIdParam, updateExamRules, validate, examController.updateExam);
router.delete('/:id',  protect, examIdParam, validate, examController.deleteExam);

module.exports = router;
