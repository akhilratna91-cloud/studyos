/**
 * StudyOS - Adaptive Module Barrel Export
 */

const adaptiveRoutes = require('./adaptive.routes');
const AdaptiveService = require('./adaptive.service');
const AdaptiveRepository = require('./adaptive.repository');
const AdaptiveLog = require('./adaptive.model');
const AdaptiveEngine = require('./adaptive.engine');

module.exports = {
  adaptiveRoutes,
  AdaptiveService,
  AdaptiveRepository,
  AdaptiveLog,
  AdaptiveEngine,
};
