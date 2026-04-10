/**
 * StudyOS - Focus Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const VALID_PRESETS = ['pomodoro', 'deepwork', 'sprint', 'marathon', 'custom'];

const startSessionRules = [
  body('preset')
    .optional()
    .isIn(VALID_PRESETS)
    .withMessage(`Preset must be one of: ${VALID_PRESETS.join(', ')}`),
  body('taskId')
    .optional()
    .isMongoId().withMessage('Invalid task ID'),
  body('targetCycles')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Target cycles must be 1-20'),
  body('workMinutes')
    .optional()
    .isInt({ min: 5, max: 120 }).withMessage('Work minutes must be 5-120'),
  body('shortBreakMinutes')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Short break must be 1-30 min'),
  body('longBreakMinutes')
    .optional()
    .isInt({ min: 5, max: 60 }).withMessage('Long break must be 5-60 min'),
];

const endSessionRules = [
  body('focusRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Focus rating must be 1-5'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 chars'),
];

const sessionIdParam = [
  param('id').isMongoId().withMessage('Invalid session ID'),
];

const analyticsQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365'),
];

const recentQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
];

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
  endSessionRules,
  sessionIdParam,
  analyticsQuery,
  recentQuery,
  validate,
};
