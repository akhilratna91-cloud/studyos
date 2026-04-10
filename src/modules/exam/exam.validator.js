/**
 * StudyOS - Exam Input Validators
 * Declarative validation rules for exam endpoints.
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Valid categories (must match model enum) ────────────────────────────────────
const VALID_CATEGORIES = ['engineering', 'medical', 'government', 'banking', 'boards', 'defence', 'law', 'other'];

// ─── Create Exam Rules ──────────────────────────────────────────────────────────

const createExamRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Exam name is required')
    .isLength({ max: 100 }).withMessage('Exam name cannot exceed 100 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe (lowercase letters, numbers, hyphens)'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('subjects')
    .optional()
    .isArray({ max: 30 }).withMessage('Subjects must be an array with at most 30 items'),

  body('subjects.*')
    .optional()
    .isString().withMessage('Each subject must be a string')
    .trim()
    .notEmpty().withMessage('Subject name cannot be empty'),

  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a non-negative integer (minutes)'),

  body('totalMarks')
    .optional()
    .isInt({ min: 0 }).withMessage('Total marks must be a non-negative integer'),

  body('eligibility')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Eligibility text cannot exceed 500 characters'),

  body('officialUrl')
    .optional()
    .trim()
    .isURL().withMessage('Official URL must be a valid URL'),

  body('icon')
    .optional()
    .trim(),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
];

// ─── Update Exam Rules ──────────────────────────────────────────────────────────

const updateExamRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Exam name cannot be empty')
    .isLength({ max: 100 }).withMessage('Exam name cannot exceed 100 characters'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('category')
    .optional()
    .trim()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('subjects')
    .optional()
    .isArray({ max: 30 }).withMessage('Subjects must be an array with at most 30 items'),

  body('subjects.*')
    .optional()
    .isString().withMessage('Each subject must be a string')
    .trim()
    .notEmpty().withMessage('Subject name cannot be empty'),

  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),

  body('totalMarks')
    .optional()
    .isInt({ min: 0 }).withMessage('Total marks must be a non-negative integer'),

  body('eligibility')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Eligibility text cannot exceed 500 characters'),

  body('officialUrl')
    .optional()
    .trim(),

  body('icon')
    .optional()
    .trim(),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
];

// ─── Query Params for Listing ────────────────────────────────────────────────────

const listExamsRules = [
  query('category')
    .optional()
    .trim()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  query('isActive')
    .optional()
    .isIn(['true', 'false']).withMessage('isActive must be true or false'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ─── Param Validators ────────────────────────────────────────────────────────────

const examIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid exam ID'),
];

const examSlugParam = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid slug format'),
];

const examCategoryParam = [
  param('category')
    .trim()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
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
  createExamRules,
  updateExamRules,
  listExamsRules,
  examIdParam,
  examSlugParam,
  examCategoryParam,
  validate,
};
