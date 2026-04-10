/**
 * StudyOS - DailyTask Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const VALID_STATUSES = ['pending', 'in-progress', 'completed', 'skipped'];

// ─── Generate From Plan ─────────────────────────────────────────────────────────

const generateFromPlanRules = [
  body('planId')
    .notEmpty().withMessage('Plan ID is required')
    .isMongoId().withMessage('Plan ID must be a valid MongoDB ID'),
];

// ─── Distribute Preview ─────────────────────────────────────────────────────────

const distributePreviewRules = [
  body('examId')
    .trim()
    .notEmpty().withMessage('Exam ID or slug is required'),

  body('totalDays')
    .notEmpty().withMessage('Total days is required')
    .isInt({ min: 1, max: 365 }).withMessage('Total days must be between 1 and 365'),

  body('hoursPerDay')
    .notEmpty().withMessage('Hours per day is required')
    .isFloat({ min: 0.5, max: 16 }).withMessage('Hours must be between 0.5 and 16'),

  body('startDate')
    .optional().trim()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
];

// ─── Status Update ──────────────────────────────────────────────────────────────

const updateStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

// ─── Update Notes ───────────────────────────────────────────────────────────────

const updateNotesRules = [
  body('notes')
    .isString().withMessage('Notes must be a string')
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

// ─── Param Validators ───────────────────────────────────────────────────────────

const taskIdParam = [
  param('id').isMongoId().withMessage('Invalid task ID'),
];

const planIdParam = [
  param('planId').isMongoId().withMessage('Invalid plan ID'),
];

const planDayParams = [
  param('planId').isMongoId().withMessage('Invalid plan ID'),
  param('dayNumber').isInt({ min: 1 }).withMessage('Day number must be a positive integer'),
];

// ─── Query Validators ───────────────────────────────────────────────────────────

const dateQuery = [
  query('date')
    .optional().trim()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
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
  generateFromPlanRules,
  distributePreviewRules,
  updateStatusRules,
  updateNotesRules,
  taskIdParam,
  planIdParam,
  planDayParams,
  dateQuery,
  validate,
};
