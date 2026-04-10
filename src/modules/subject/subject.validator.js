/**
 * StudyOS - Subject Input Validators
 * Declarative validation rules for subject endpoints.
 */

const { body, param, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Create Subject Rules ───────────────────────────────────────────────────────

const createSubjectRules = [
  body('examId')
    .notEmpty().withMessage('Exam ID is required')
    .isMongoId().withMessage('Exam ID must be a valid MongoDB ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ max: 100 }).withMessage('Subject name cannot exceed 100 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe (lowercase letters, numbers, hyphens)'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('icon')
    .optional()
    .trim(),

  body('color')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex code'),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('totalMarks')
    .optional()
    .isInt({ min: 0 }).withMessage('Total marks must be a non-negative integer'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Update Subject Rules ───────────────────────────────────────────────────────

const updateSubjectRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Subject name cannot be empty')
    .isLength({ max: 100 }).withMessage('Subject name cannot exceed 100 characters'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('icon')
    .optional()
    .trim(),

  body('color')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex code'),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('totalMarks')
    .optional()
    .isInt({ min: 0 }).withMessage('Total marks must be a non-negative integer'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Param Validators ───────────────────────────────────────────────────────────

const subjectIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid subject ID'),
];

const examIdParam = [
  param('examId')
    .isMongoId().withMessage('Invalid exam ID'),
];

const examSlugParam = [
  param('examSlug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid exam slug format'),
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
  createSubjectRules,
  updateSubjectRules,
  subjectIdParam,
  examIdParam,
  examSlugParam,
  validate,
};
