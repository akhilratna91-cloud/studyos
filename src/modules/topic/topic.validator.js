/**
 * StudyOS - Topic Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// ─── Create ─────────────────────────────────────────────────────────────────────

const createTopicRules = [
  body('chapterId')
    .notEmpty().withMessage('Chapter ID is required')
    .isMongoId().withMessage('Chapter ID must be a valid MongoDB ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Topic name is required')
    .isLength({ max: 200 }).withMessage('Topic name cannot exceed 200 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('description')
    .optional().trim()
    .isLength({ max: 600 }).withMessage('Description cannot exceed 600 characters'),

  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('estimatedMinutes')
    .optional()
    .isInt({ min: 0 }).withMessage('Estimated minutes must be non-negative'),

  body('keyFormulas')
    .optional()
    .isArray({ max: 20 }).withMessage('Key formulas must be an array with at most 20 items'),

  body('keyFormulas.*')
    .optional()
    .isString().withMessage('Each formula must be a string')
    .trim().notEmpty().withMessage('Formula cannot be empty'),

  body('prerequisites')
    .optional()
    .isArray({ max: 10 }).withMessage('Prerequisites must be an array with at most 10 items'),

  body('prerequisites.*')
    .optional()
    .isString().withMessage('Each prerequisite must be a string')
    .trim().notEmpty().withMessage('Prerequisite slug cannot be empty'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Update ─────────────────────────────────────────────────────────────────────

const updateTopicRules = [
  body('name')
    .optional().trim()
    .notEmpty().withMessage('Topic name cannot be empty')
    .isLength({ max: 200 }).withMessage('Topic name cannot exceed 200 characters'),

  body('slug')
    .optional().trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe'),

  body('description')
    .optional().trim()
    .isLength({ max: 600 }).withMessage('Description cannot exceed 600 characters'),

  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),

  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),

  body('estimatedMinutes')
    .optional()
    .isInt({ min: 0 }).withMessage('Estimated minutes must be non-negative'),

  body('keyFormulas')
    .optional()
    .isArray({ max: 20 }).withMessage('Key formulas must be an array with at most 20 items'),

  body('keyFormulas.*')
    .optional()
    .isString().withMessage('Each formula must be a string'),

  body('prerequisites')
    .optional()
    .isArray({ max: 10 }).withMessage('Prerequisites must be an array with at most 10 items'),

  body('prerequisites.*')
    .optional()
    .isString().withMessage('Each prerequisite must be a string'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ─── Params ─────────────────────────────────────────────────────────────────────

const topicIdParam = [
  param('id').isMongoId().withMessage('Invalid topic ID'),
];

const chapterIdParam = [
  param('chapterId').isMongoId().withMessage('Invalid chapter ID'),
];

const subjectIdParam = [
  param('subjectId').isMongoId().withMessage('Invalid subject ID'),
];

// ─── Query ──────────────────────────────────────────────────────────────────────

const topicsBySubjectQuery = [
  query('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES).withMessage(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),
];

// ─── Validation Middleware ──────────────────────────────────────────────────────

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
  createTopicRules,
  updateTopicRules,
  topicIdParam,
  chapterIdParam,
  subjectIdParam,
  topicsBySubjectQuery,
  validate,
};
