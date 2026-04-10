/**
 * StudyOS - Analytics Module Barrel Export
 */

const analyticsRoutes = require('./analytics.routes');
const AnalyticsService = require('./analytics.service');

module.exports = {
  analyticsRoutes,
  AnalyticsService,
};
