/**
 * StudyOS - Progress Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Start Session ──────────────────────────────────────────────────────────────

const startSessionRules = [
  body('taskId')
    .notEmpty().withMessage('Task ID is required')
    .isMongoId().withMessage('Task ID must be a valid MongoDB ID'),
];

// ─── Complete Session ───────────────────────────────────────────────────────────

const completeSessionRules = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('actualMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual minutes must be at least 1'),
];

// ─── Quick Complete ─────────────────────────────────────────────────────────────

const quickCompleteRules = [
  body('taskId')
    .notEmpty().withMessage('Task ID is required')
    .isMongoId().withMessage('Task ID must be a valid MongoDB ID'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('actualMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual minutes must be at least 1'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

// ─── Params ─────────────────────────────────────────────────────────────────────

const sessionIdParam = [
  param('id').isMongoId().withMessage('Invalid session ID'),
];

// ─── Query ──────────────────────────────────────────────────────────────────────

const analyticsQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
];

const recentQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
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
  startSessionRules,
  completeSessionRules,
  quickCompleteRules,
  sessionIdParam,
  analyticsQuery,
  recentQuery,
  validate,
};
