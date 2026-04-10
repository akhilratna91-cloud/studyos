/**
 * StudyOS - Question Module Barrel Export
 */

const questionRoutes = require('./question.routes');
const QuestionService = require('./question.service');
const QuestionRepository = require('./question.repository');
const Question = require('./question.model');
const QUESTION_SEEDS = require('./question.seeds');

module.exports = {
  questionRoutes,
  QuestionService,
  QuestionRepository,
  Question,
  QUESTION_SEEDS,
};
