/**
 * StudyOS - Quiz Module Barrel Export
 */

const quizRoutes = require('./quiz.routes');
const QuizService = require('./quiz.service');
const { Quiz, QuizAttempt } = require('./quiz.model');

module.exports = { quizRoutes, QuizService, Quiz, QuizAttempt };
