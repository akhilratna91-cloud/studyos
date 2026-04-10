/**
 * StudyOS - StudyTime Module Barrel Export
 */

const studyTimeRoutes = require('./studytime.routes');
const StudyTimeService = require('./studytime.service');
const StudyGoal = require('./studytime.model');

module.exports = { studyTimeRoutes, StudyTimeService, StudyGoal };
