/**
 * StudyOS - Today Dashboard Validators
 */

const { query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const upcomingQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30'),
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
  upcomingQuery,
  validate,
};
