/**
 * StudyOS - Exam Controller (HTTP Layer)
 *
 * Thin layer — parses HTTP input, delegates to ExamService,
 * and sends standardized responses.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ExamService = require('./exam.service');

/**
 * @route   GET /api/v1/exams
 * @desc    Get all exams (with optional filtering & pagination)
 * @access  Public
 */
const getAllExams = asyncHandler(async (req, res) => {
  const result = await ExamService.getAllExams(req.query);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Exams retrieved successfully',
    data: result,
  });
});

/**
 * @route   GET /api/v1/exams/:id
 * @desc    Get a single exam by ID
 * @access  Public
 */
const getExamById = asyncHandler(async (req, res) => {
  const exam = await ExamService.getExamById(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Exam retrieved successfully',
    data: { exam },
  });
});

/**
 * @route   GET /api/v1/exams/slug/:slug
 * @desc    Get a single exam by slug
 * @access  Public
 */
const getExamBySlug = asyncHandler(async (req, res) => {
  const exam = await ExamService.getExamBySlug(req.params.slug);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Exam retrieved successfully',
    data: { exam },
  });
});

/**
 * @route   GET /api/v1/exams/category/:category
 * @desc    Get all exams in a category
 * @access  Public
 */
const getExamsByCategory = asyncHandler(async (req, res) => {
  const exams = await ExamService.getExamsByCategory(req.params.category);

  sendSuccess(res, {
    statusCode: 200,
    message: `Exams in category "${req.params.category}" retrieved successfully`,
    data: { exams, total: exams.length },
  });
});

/**
 * @route   POST /api/v1/exams
 * @desc    Create a new exam
 * @access  Private (admin — protected by auth)
 */
const createExam = asyncHandler(async (req, res) => {
  const exam = await ExamService.createExam(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Exam created successfully',
    data: { exam },
  });
});

/**
 * @route   PATCH /api/v1/exams/:id
 * @desc    Update an exam
 * @access  Private (admin — protected by auth)
 */
const updateExam = asyncHandler(async (req, res) => {
  const exam = await ExamService.updateExam(req.params.id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Exam updated successfully',
    data: { exam },
  });
});

/**
 * @route   DELETE /api/v1/exams/:id
 * @desc    Delete an exam
 * @access  Private (admin — protected by auth)
 */
const deleteExam = asyncHandler(async (req, res) => {
  await ExamService.deleteExam(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Exam deleted successfully',
  });
});

/**
 * @route   POST /api/v1/exams/seed
 * @desc    Seed default exams (admin only, idempotent)
 * @access  Private (admin — protected by auth)
 */
const seedExams = asyncHandler(async (req, res) => {
  const result = await ExamService.seedExams();

  sendSuccess(res, {
    statusCode: 200,
    message: result.seeded
      ? `Seeded ${result.count} exams successfully`
      : `Exams already exist (${result.count} found). Skipped seeding.`,
    data: result,
  });
});

module.exports = {
  getAllExams,
  getExamById,
  getExamBySlug,
  getExamsByCategory,
  createExam,
  updateExam,
  deleteExam,
  seedExams,
};
