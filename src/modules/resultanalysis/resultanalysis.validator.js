/**
 * StudyOS - Result Analysis Validators
 */

const { param, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const analyzeRules = [
  param('attemptId').isMongoId().withMessage('Valid attemptId is required')
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

module.exports = { analyzeRules, validate };
