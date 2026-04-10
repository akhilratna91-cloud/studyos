/**
 * StudyOS - Revision Module Barrel Export
 */

const revisionRoutes = require('./revision.routes');
const RevisionService = require('./revision.service');
const RevisionRepository = require('./revision.repository');
const RevisionCard = require('./revision.model');
const SpacedRepetitionEngine = require('./spaced.engine');

module.exports = {
  revisionRoutes,
  RevisionService,
  RevisionRepository,
  RevisionCard,
  SpacedRepetitionEngine,
};
