/**
 * StudyOS - Question Validators
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../../shared/utils/response');

const createRules = [
  body('question').trim().notEmpty().withMessage('Question text is required')
    .isLength({ max: 2000 }).withMessage('Max 2000 characters'),
  body('options').isArray({ min: 4, max: 4 }).withMessage('Exactly 4 options required'),
  body('options.*').trim().notEmpty().withMessage('Option text cannot be empty'),
  body('correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be 0-3'),
  body('chapterId').isMongoId().withMessage('Invalid chapter ID'),
  body('topicId').optional().isMongoId().withMessage('Invalid topic ID'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('type').optional().isIn(['mcq', 'true_false', 'assertion_reason']).withMessage('Invalid type'),
  body('explanation').optional().trim().isLength({ max: 2000 }),
  body('hint').optional().trim().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim(),
];

const bulkCreateRules = [
  body('chapterId').isMongoId().withMessage('Invalid chapter ID'),
  body('questions').isArray({ min: 1, max: 100 }).withMessage('1-100 questions required'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text required'),
  body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('4 options required'),
  body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer 0-3'),
];

const updateRules = [
  body('question').optional().trim().notEmpty().isLength({ max: 2000 }),
  body('options').optional().isArray({ min: 4, max: 4 }),
  body('correctAnswer').optional().isInt({ min: 0, max: 3 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('explanation').optional().trim().isLength({ max: 2000 }),
  body('hint').optional().trim().isLength({ max: 500 }),
];

const verifyRules = [
  body('selectedAnswer').isInt({ min: 0, max: 3 }).withMessage('Selected answer must be 0-3'),
];

const idParam = [param('id').isMongoId().withMessage('Invalid ID')];
const chapterParam = [param('chapterId').isMongoId().withMessage('Invalid chapter ID')];
const subjectParam = [param('subjectId').isMongoId().withMessage('Invalid subject ID')];
const examParam = [param('examId').isMongoId().withMessage('Invalid exam ID')];
const topicParam = [param('topicId').isMongoId().withMessage('Invalid topic ID')];

const quizQuery = [
  query('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count 1-50'),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']),
];

const filterQuery = [
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  query('type').optional().isIn(['mcq', 'true_false', 'assertion_reason']),
];

const tagQuery = [
  query('tags').notEmpty().withMessage('Tags required'),
  query('examId').optional().isMongoId(),
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
  createRules, bulkCreateRules, updateRules, verifyRules,
  idParam, chapterParam, subjectParam, examParam, topicParam,
  quizQuery, filterQuery, tagQuery, validate,
};
