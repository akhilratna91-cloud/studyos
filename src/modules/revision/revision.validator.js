/**
 * StudyOS - Revision Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Initialize ─────────────────────────────────────────────────────────────────

const initializeRules = [
  body('examId')
    .trim()
    .notEmpty().withMessage('Exam ID or slug is required'),
];

// ─── Process Review ─────────────────────────────────────────────────────────────

const reviewRules = [
  body('quality')
    .notEmpty().withMessage('Quality rating is required')
    .isInt({ min: 0, max: 5 })
    .withMessage('Quality must be an integer between 0 and 5 (0=blackout, 5=perfect)'),
];

// ─── Params ─────────────────────────────────────────────────────────────────────

const cardIdParam = [
  param('id').isMongoId().withMessage('Invalid card ID'),
];

// ─── Query ──────────────────────────────────────────────────────────────────────

const listQuery = [
  query('examId').optional().trim(),
  query('status')
    .optional()
    .isIn(['new', 'learning', 'review', 'mastered'])
    .withMessage('Status must be new, learning, review, or mastered'),
  query('isWeak')
    .optional()
    .isBoolean()
    .withMessage('isWeak must be a boolean'),
];

const scheduleQuery = [
  query('examId').optional().trim(),
  query('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30'),
  query('maxPerDay')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max per day must be between 1 and 50'),
];

const statsQuery = [
  query('examId').optional().trim(),
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
  initializeRules,
  reviewRules,
  cardIdParam,
  listQuery,
  scheduleQuery,
  statsQuery,
  validate,
};
