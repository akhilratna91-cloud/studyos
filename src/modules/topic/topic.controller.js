/**
 * StudyOS - Topic Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const TopicService = require('./topic.service');

/**
 * @route   GET /api/v1/topics/chapter/:chapterId
 * @desc    Get all topics for a chapter
 * @access  Public
 */
const getTopicsByChapter = asyncHandler(async (req, res) => {
  const topics = await TopicService.getTopicsByChapter(req.params.chapterId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Topics retrieved successfully',
    data: { topics, total: topics.length },
  });
});

/**
 * @route   GET /api/v1/topics/subject/:subjectId
 * @desc    Get all topics for a subject (cross-chapter, optional difficulty filter)
 * @access  Public
 */
const getTopicsBySubject = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.difficulty) filters.difficulty = req.query.difficulty;

  const topics = await TopicService.getTopicsBySubject(req.params.subjectId, filters);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Topics retrieved successfully',
    data: { topics, total: topics.length },
  });
});

/**
 * @route   GET /api/v1/topics/:id
 * @desc    Get a single topic by ID (with chapter, subject, exam populated)
 * @access  Public
 */
const getTopicById = asyncHandler(async (req, res) => {
  const topic = await TopicService.getTopicById(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Topic retrieved successfully',
    data: { topic },
  });
});

/**
 * @route   POST /api/v1/topics
 * @desc    Create a new topic under a chapter
 * @access  Private
 */
const createTopic = asyncHandler(async (req, res) => {
  const topic = await TopicService.createTopic(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Topic created successfully',
    data: { topic },
  });
});

/**
 * @route   PATCH /api/v1/topics/:id
 * @desc    Update a topic
 * @access  Private
 */
const updateTopic = asyncHandler(async (req, res) => {
  const topic = await TopicService.updateTopic(req.params.id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Topic updated successfully',
    data: { topic },
  });
});

/**
 * @route   DELETE /api/v1/topics/:id
 * @desc    Delete a topic
 * @access  Private
 */
const deleteTopic = asyncHandler(async (req, res) => {
  await TopicService.deleteTopic(req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Topic deleted successfully',
  });
});

/**
 * @route   POST /api/v1/topics/seed
 * @desc    Seed topics for all chapters (idempotent)
 * @access  Private
 */
const seedTopics = asyncHandler(async (req, res) => {
  const result = await TopicService.seedTopics();

  sendSuccess(res, {
    statusCode: 200,
    message: result.seeded
      ? `Seeded ${result.count} topics successfully`
      : 'Topics already exist. Skipped seeding.',
    data: result,
  });
});

module.exports = {
  getTopicsByChapter,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  seedTopics,
};
