/**
 * StudyOS - Evaluation Validators
 */

const { body, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const evaluateRules = [
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
  body('answers.*.questionId').isMongoId().withMessage('Valid questionId is required'),
  body('answers.*.selectedAnswer').optional({ nullable: true }).isInt({ min: 0, max: 3 }).withMessage('Answer must be 0-3 or omitted for skipped'),
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

module.exports = { evaluateRules, validate };
