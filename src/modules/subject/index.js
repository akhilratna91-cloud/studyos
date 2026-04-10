/**
 * StudyOS - Subject Module Barrel Export
 * Single entry point for the Subject module.
 */

const subjectRoutes = require('./subject.routes');
const SubjectService = require('./subject.service');
const SubjectRepository = require('./subject.repository');
const Subject = require('./subject.model');
const SUBJECT_SEEDS = require('./subject.seeds');

module.exports = {
  subjectRoutes,
  SubjectService,
  SubjectRepository,
  Subject,
  SUBJECT_SEEDS,
};
