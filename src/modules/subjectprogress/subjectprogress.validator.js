/**
 * StudyOS - SubjectProgress Validators
 */

const { param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const examIdQuery = [
  query('examId').optional().isMongoId().withMessage('Invalid exam ID'),
];

const subjectIdParam = [
  param('subjectId').isMongoId().withMessage('Invalid subject ID'),
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

module.exports = { examIdQuery, subjectIdParam, validate };
