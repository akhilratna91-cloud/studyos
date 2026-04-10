/**
 * StudyOS - StudyPlan Module Barrel Export
 * Single entry point for the StudyPlan module.
 */

const studyPlanRoutes = require('./studyplan.routes');
const StudyPlanService = require('./studyplan.service');
const StudyPlanRepository = require('./studyplan.repository');
const StudyPlan = require('./studyplan.model');
const PlanEngine = require('./plan.engine');

module.exports = {
  studyPlanRoutes,
  StudyPlanService,
  StudyPlanRepository,
  StudyPlan,
  PlanEngine,
};
