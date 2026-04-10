/**
 * StudyOS - Subject Routes
 *
 * Public endpoints for reading subjects.
 * Protected endpoints for creating/updating/deleting.
 */

const { Router } = require('express');
const subjectController = require('./subject.controller');
const {
  createSubjectRules,
  updateSubjectRules,
  subjectIdParam,
  examIdParam,
  examSlugParam,
  validate,
} = require('./subject.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// ─── Public Routes (read-only) ──────────────────────────────────────────────────
router.get('/exam/slug/:examSlug', examSlugParam,  validate, subjectController.getSubjectsByExamSlug);
router.get('/exam/:examId',        examIdParam,    validate, subjectController.getSubjectsByExam);
router.get('/:id',                 subjectIdParam, validate, subjectController.getSubjectById);

// ─── Protected Routes ───────────────────────────────────────────────────────────
router.post('/',        protect, createSubjectRules, validate, subjectController.createSubject);
router.post('/seed',    protect, subjectController.seedSubjects);
router.patch('/:id',    protect, subjectIdParam, updateSubjectRules, validate, subjectController.updateSubject);
router.delete('/:id',   protect, subjectIdParam, validate, subjectController.deleteSubject);

module.exports = router;
