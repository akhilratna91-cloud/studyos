/**
 * StudyOS - Exam Module Barrel Export
 * Single entry point for the Exam module.
 */

const examRoutes = require('./exam.routes');
const ExamService = require('./exam.service');
const ExamRepository = require('./exam.repository');
const Exam = require('./exam.model');
const EXAM_SEEDS = require('./exam.seeds');

module.exports = {
  examRoutes,
  ExamService,
  ExamRepository,
  Exam,
  EXAM_SEEDS,
};
