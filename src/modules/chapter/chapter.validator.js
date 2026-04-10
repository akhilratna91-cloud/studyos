/**
 * StudyOS - Chapter Input Validators
 * Declarative validation rules for chapter endpoints.
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// ─── Create Chapter Rules ───────────────────────────────────────────────────────

const createChapterRules = [
  body('subjectId')
    .notEmpty().withMessage('Subject ID is required')
    .isMongoId().withMessage('Subject ID must be a valid MongoDB ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Chapter name is required')
    .isLength({ max: 150 }).withMessage('Chapter name cannot exceed 150 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be non-negative'),

  body('totalTopics')
    .optional()
    .isInt({ min: 0 }).withMessage('Total topics must be a non-negative integer'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Update Chapter Rules ───────────────────────────────────────────────────────

const updateChapterRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Chapter name cannot be empty')
    .isLength({ max: 150 }).withMessage('Chapter name cannot exceed 150 characters'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be non-negative'),

  body('totalTopics')
    .optional()
    .isInt({ min: 0 }).withMessage('Total topics must be a non-negative integer'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Param Validators ───────────────────────────────────────────────────────────

const chapterIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid chapter ID'),
];

const subjectIdParam = [
  param('subjectId')
    .isMongoId().withMessage('Invalid subject ID'),
];

const examIdParam = [
  param('examId')
    .isMongoId().withMessage('Invalid exam ID'),
];

// ─── Query Validators ───────────────────────────────────────────────────────────

const chaptersByExamQuery = [
  query('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),
];

// ─── Validation Result Middleware ────────────────────────────────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = {
  createChapterRules,
  updateChapterRules,
  chapterIdParam,
  subjectIdParam,
  examIdParam,
  chaptersByExamQuery,
  validate,
};
