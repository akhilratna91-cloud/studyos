/**
 * StudyOS - Topic Routes
 *
 * Public endpoints for reading topics.
 * Protected endpoints for creating/updating/deleting.
 */

const { Router } = require('express');
const topicController = require('./topic.controller');
const {
  createTopicRules,
  updateTopicRules,
  topicIdParam,
  chapterIdParam,
  subjectIdParam,
  topicsBySubjectQuery,
  validate,
} = require('./topic.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.get('/chapter/:chapterId',  chapterIdParam, validate, topicController.getTopicsByChapter);
router.get('/subject/:subjectId',  subjectIdParam, topicsBySubjectQuery, validate, topicController.getTopicsBySubject);
router.get('/:id',                 topicIdParam,   validate, topicController.getTopicById);

// ─── Protected Routes ───────────────────────────────────────────────────────────
router.post('/',        protect, createTopicRules, validate, topicController.createTopic);
router.post('/seed',    protect, topicController.seedTopics);
router.patch('/:id',    protect, topicIdParam, updateTopicRules, validate, topicController.updateTopic);
router.delete('/:id',   protect, topicIdParam, validate, topicController.deleteTopic);

module.exports = router;
