/**
 * StudyOS - Quiz Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const generateChapterRules = [
  body('chapterId').isMongoId().withMessage('Invalid chapter ID'),
  body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count 1-50'),
  body('timeLimitMinutes').optional().isInt({ min: 1, max: 300 }).withMessage('Time limit 1-300 min'),
  body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score 0-100'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'mixed']),
];

const generateSubjectRules = [
  body('subjectId').isMongoId().withMessage('Invalid subject ID'),
  body('count').optional().isInt({ min: 1, max: 50 }),
  body('timeLimitMinutes').optional().isInt({ min: 1, max: 300 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'mixed']),
];

const generateMockRules = [
  body('examId').isMongoId().withMessage('Invalid exam ID'),
  body('count').optional().isInt({ min: 10, max: 200 }),
  body('timeLimitMinutes').optional().isInt({ min: 10, max: 300 }),
];

const submitAnswerRules = [
  body('questionId').isMongoId().withMessage('Invalid question ID'),
  body('selectedAnswer').isInt({ min: 0, max: 3 }).withMessage('Answer must be 0-3'),
  body('timeTakenSeconds').optional().isInt({ min: 0 }),
];

const idParam = [param('id').isMongoId().withMessage('Invalid ID')];

const historyQuery = [
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

const typeQuery = [
  query('type').optional().isIn(['chapter_quiz', 'subject_quiz', 'mock_test', 'custom']),
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

module.exports = {
  generateChapterRules, generateSubjectRules, generateMockRules,
  submitAnswerRules, idParam, historyQuery, typeQuery, validate,
};
