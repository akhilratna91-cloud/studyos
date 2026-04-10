/**
 * StudyOS - StudyPlan Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Generate Plan Rules ────────────────────────────────────────────────────────

const generatePlanRules = [
  body('examId')
    .trim()
    .notEmpty().withMessage('Exam ID or slug is required'),

  body('className')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Class name cannot exceed 50 characters'),

  body('totalDays')
    .notEmpty().withMessage('Total days is required')
    .isInt({ min: 1, max: 365 }).withMessage('Total days must be between 1 and 365'),

  body('hoursPerDay')
    .notEmpty().withMessage('Study hours per day is required')
    .isFloat({ min: 0.5, max: 16 }).withMessage('Study hours must be between 0.5 and 16'),

  body('revisionInterval')
    .optional()
    .isInt({ min: 0, max: 30 }).withMessage('Revision interval must be between 0 and 30 days'),

  body('restDayInterval')
    .optional()
    .isInt({ min: 0, max: 14 }).withMessage('Rest day interval must be between 0 and 14 days'),

  body('startDate')
    .optional()
    .trim()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
];

// ─── Update Plan Rules ──────────────────────────────────────────────────────────

const updatePlanRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be draft, active, completed, or archived'),
];

// ─── List Plans Query ───────────────────────────────────────────────────────────

const listPlansQuery = [
  query('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be draft, active, completed, or archived'),

  query('examId')
    .optional()
    .isMongoId().withMessage('Invalid exam ID'),
];

// ─── Param Validators ───────────────────────────────────────────────────────────

const planIdParam = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
];

const dayNumberParam = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
  param('dayNumber')
    .isInt({ min: 1 }).withMessage('Day number must be a positive integer'),
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
  generatePlanRules,
  updatePlanRules,
  listPlansQuery,
  planIdParam,
  dayNumberParam,
  validate,
};
