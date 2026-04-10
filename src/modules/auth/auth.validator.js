/**
 * StudyOS - Auth Input Validators
 * Declarative validation rules for all auth endpoints.
 */

const { body, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Registration ───────────────────────────────────────────────────────────────

const registerRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('class')
    .trim()
    .notEmpty().withMessage('Class is required'),

  body('exam')
    .trim()
    .notEmpty().withMessage('Exam is required'),
];

// ─── Login ──────────────────────────────────────────────────────────────────────

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const googleLoginRules = [
  body('credential')
    .trim()
    .notEmpty().withMessage('Google credential is required'),

  body('class')
    .optional()
    .trim()
    .notEmpty().withMessage('Class cannot be empty'),

  body('exam')
    .optional()
    .trim()
    .notEmpty().withMessage('Exam cannot be empty'),
];

// ─── Refresh Token ──────────────────────────────────────────────────────────────

const refreshRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
    .isString().withMessage('Refresh token must be a string'),
];

// ─── Change Password ────────────────────────────────────────────────────────────

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from the current password');
      }
      return true;
    }),
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
  registerRules,
  loginRules,
  googleLoginRules,
  refreshRules,
  changePasswordRules,
  validate,
};
