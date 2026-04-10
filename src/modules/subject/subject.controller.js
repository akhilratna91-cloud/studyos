/**
 * StudyOS - Subject Controller (HTTP Layer)
 *
 * Thin layer — parses HTTP input, delegates to SubjectService,
 * and sends standardized responses.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const SubjectService = require('./subject.service');

/**
 * @route   GET /api/v1/subjects/exam/:examId
 * @desc    Get all subjects for an exam (by exam ID)
 * @access  Public
 */
const getSubjectsByExam = asyncHandler(async (req, res) => {
  const subjects = await SubjectService.getSubjectsByExam(req.params.examId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subjects retrieved successfully',
    data: { subjects, total: subjects.length },
  });
});

/**
 * @route   GET /api/v1/subjects/exam/slug/:examSlug
 * @desc    Get all subjects for an exam (by exam slug)
 * @access  Public
 */
const getSubjectsByExamSlug = asyncHandler(async (req, res) => {
  const result = await SubjectService.getSubjectsByExamSlug(req.params.examSlug);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subjects retrieved successfully',
    data: { exam: result.exam, subjects: result.subjects, total: result.subjects.length },
  });
});

/**
 * @route   GET /api/v1/subjects/:id
 * @desc    Get a single subject by ID (with parent exam)
 * @access  Public
 */
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await SubjectService.getSubjectById(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject retrieved successfully',
    data: { subject },
  });
});

/**
 * @route   POST /api/v1/subjects
 * @desc    Create a new subject under an exam
 * @access  Private
 */
const createSubject = asyncHandler(async (req, res) => {
  const subject = await SubjectService.createSubject(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Subject created successfully',
    data: { subject },
  });
});

/**
 * @route   PATCH /api/v1/subjects/:id
 * @desc    Update a subject
 * @access  Private
 */
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await SubjectService.updateSubject(req.params.id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject updated successfully',
    data: { subject },
  });
});

/**
 * @route   DELETE /api/v1/subjects/:id
 * @desc    Delete a subject
 * @access  Private
 */
const deleteSubject = asyncHandler(async (req, res) => {
  await SubjectService.deleteSubject(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject deleted successfully',
  });
});

/**
 * @route   POST /api/v1/subjects/seed
 * @desc    Seed subjects for all exams (idempotent)
 * @access  Private
 */
const seedSubjects = asyncHandler(async (req, res) => {
  const result = await SubjectService.seedSubjects();

  sendSuccess(res, {
    statusCode: 200,
    message: result.seeded
      ? `Seeded ${result.count} subjects successfully`
      : 'Subjects already exist. Skipped seeding.',
    data: result,
  });
});

module.exports = {
  getSubjectsByExam,
  getSubjectsByExamSlug,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  seedSubjects,
};
