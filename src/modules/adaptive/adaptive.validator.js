/**
 * StudyOS - Adaptive Input Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

// ─── Plan ID Param ──────────────────────────────────────────────────────────────

const planIdParam = [
  param('planId').isMongoId().withMessage('Invalid plan ID'),
];

// ─── Log ID Param ───────────────────────────────────────────────────────────────

const logIdParam = [
  param('id').isMongoId().withMessage('Invalid log ID'),
];

// ─── Adjust Trigger ─────────────────────────────────────────────────────────────

const adjustRules = [
  body('trigger')
    .optional()
    .isIn(['manual', 'auto', 'scheduled'])
    .withMessage('Trigger must be manual, auto, or scheduled'),
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
  planIdParam,
  logIdParam,
  adjustRules,
  validate,
};
