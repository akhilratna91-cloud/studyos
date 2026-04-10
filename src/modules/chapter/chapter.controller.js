/**
 * StudyOS - Chapter Controller (HTTP Layer)
 *
 * Thin layer — parses HTTP input, delegates to ChapterService,
 * and sends standardized responses.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ChapterService = require('./chapter.service');

/**
 * @route   GET /api/v1/chapters/subject/:subjectId
 * @desc    Get all chapters for a subject
 * @access  Public
 */
const getChaptersBySubject = asyncHandler(async (req, res) => {
  const chapters = await ChapterService.getChaptersBySubject(req.params.subjectId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapters retrieved successfully',
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/chapters/exam/:examId
 * @desc    Get all chapters for an exam (cross-subject, with optional difficulty filter)
 * @access  Public
 */
const getChaptersByExam = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.difficulty) filters.difficulty = req.query.difficulty;

  const chapters = await ChapterService.getChaptersByExam(req.params.examId, filters);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapters retrieved successfully',
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/chapters/:id
 * @desc    Get a single chapter by ID (with populated subject & exam)
 * @access  Public
 */
const getChapterById = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.getChapterById(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapter retrieved successfully',
    data: { chapter },
  });
});

/**
 * @route   POST /api/v1/chapters
 * @desc    Create a new chapter under a subject
 * @access  Private
 */
const createChapter = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.createChapter(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Chapter created successfully',
    data: { chapter },
  });
});

/**
 * @route   PATCH /api/v1/chapters/:id
 * @desc    Update a chapter
 * @access  Private
 */
const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.updateChapter(req.params.id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapter updated successfully',
    data: { chapter },
  });
});

/**
 * @route   DELETE /api/v1/chapters/:id
 * @desc    Delete a chapter
 * @access  Private
 */
const deleteChapter = asyncHandler(async (req, res) => {
  await ChapterService.deleteChapter(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapter deleted successfully',
  });
});

/**
 * @route   POST /api/v1/chapters/seed
 * @desc    Seed chapters for all subjects (idempotent)
 * @access  Private
 */
const seedChapters = asyncHandler(async (req, res) => {
  const result = await ChapterService.seedChapters();

  sendSuccess(res, {
    statusCode: 200,
    message: result.seeded
      ? `Seeded ${result.count} chapters successfully`
      : 'Chapters already exist. Skipped seeding.',
    data: result,
  });
});

module.exports = {
  getChaptersBySubject,
  getChaptersByExam,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  seedChapters,
};
