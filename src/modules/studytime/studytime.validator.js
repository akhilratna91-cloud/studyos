/**
 * StudyOS - StudyTime Validators
 */

const { body, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const setGoalRules = [
  body('periodType')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Period must be daily, weekly, or monthly'),
  body('targetMinutes')
    .isInt({ min: 5, max: 6000 })
    .withMessage('Target must be 5–6000 minutes'),
];

const peakHoursQuery = [
  query('days')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Days must be 7–365'),
];

const calendarQuery = [
  query('year')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be 2020–2100'),
  query('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be 1–12'),
];

const subjectAllocQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be 1–365'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { setGoalRules, peakHoursQuery, calendarQuery, subjectAllocQuery, validate };
