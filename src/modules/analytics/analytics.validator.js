/**
 * StudyOS - Analytics Input Validators
 */

const { param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const subjectIdParam = [
  param('subjectId').isMongoId().withMessage('Invalid subject ID'),
];

const planIdParam = [
  param('planId').isMongoId().withMessage('Invalid plan ID'),
];

const examIdQuery = [
  query('examId').optional().isMongoId().withMessage('Invalid exam ID'),
];

const heatmapQuery = [
  query('days')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Days must be between 7 and 365'),
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
  subjectIdParam,
  planIdParam,
  examIdQuery,
  heatmapQuery,
  validate,
};
