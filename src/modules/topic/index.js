/**
 * StudyOS - Topic Module Barrel Export
 * Single entry point for the Topic module.
 */

const topicRoutes = require('./topic.routes');
const TopicService = require('./topic.service');
const TopicRepository = require('./topic.repository');
const Topic = require('./topic.model');
const TOPIC_SEEDS = require('./topic.seeds');

module.exports = {
  topicRoutes,
  TopicService,
  TopicRepository,
  Topic,
  TOPIC_SEEDS,
};
