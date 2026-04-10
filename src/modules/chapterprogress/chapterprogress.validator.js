/**
 * StudyOS - ChapterProgress Input Validators
 */

const { param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const examIdParam = [
  param('examId').isMongoId().withMessage('Invalid exam ID'),
];

const subjectIdParam = [
  param('subjectId').isMongoId().withMessage('Invalid subject ID'),
];

const chapterIdParam = [
  param('chapterId').isMongoId().withMessage('Invalid chapter ID'),
];

const statusQuery = [
  query('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'mastered'])
    .withMessage('Status must be not_started, in_progress, completed, or mastered'),
  query('examId')
    .optional()
    .isMongoId()
    .withMessage('Invalid exam ID'),
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
  examIdParam,
  subjectIdParam,
  chapterIdParam,
  statusQuery,
  validate,
};
