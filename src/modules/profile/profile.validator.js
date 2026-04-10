/**
 * StudyOS - Profile Input Validators
 * Declarative validation rules for all profile endpoints.
 */

const { body, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Update Profile Rules ───────────────────────────────────────────────────────

const updateProfileRules = [
  body('class')
    .optional()
    .trim()
    .notEmpty().withMessage('Class cannot be empty'),

  body('exam')
    .optional()
    .trim()
    .notEmpty().withMessage('Exam cannot be empty'),

  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Display name cannot exceed 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),

  body('subjects')
    .optional()
    .isArray({ max: 20 }).withMessage('Subjects must be an array with at most 20 items'),

  body('subjects.*')
    .optional()
    .isString().withMessage('Each subject must be a string')
    .trim()
    .notEmpty().withMessage('Subject name cannot be empty'),

  body('studyGoal')
    .optional()
    .isInt({ min: 0, max: 1440 }).withMessage('Study goal must be between 0 and 1440 minutes'),
];

// ─── Save Preferences Rules ─────────────────────────────────────────────────────

const savePreferencesRules = [
  body('class')
    .optional()
    .trim()
    .notEmpty().withMessage('Class cannot be empty'),

  body('exam')
    .optional()
    .trim()
    .notEmpty().withMessage('Exam cannot be empty'),

  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),

  body('preferences.notifications')
    .optional()
    .isObject().withMessage('Notifications must be an object'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean().withMessage('Email notification preference must be a boolean'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean().withMessage('Push notification preference must be a boolean'),

  body('preferences.notifications.studyReminders')
    .optional()
    .isBoolean().withMessage('Study reminders preference must be a boolean'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),
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
  updateProfileRules,
  savePreferencesRules,
  validate,
};
