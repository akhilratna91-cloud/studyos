/**
 * StudyOS - Gamification Module Barrel Export
 */

const gamificationRoutes = require('./gamification.routes');
const GamificationService = require('./gamification.service');
const StudentStats = require('./gamification.model');

module.exports = {
  gamificationRoutes,
  GamificationService,
  StudentStats,
};
