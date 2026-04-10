/**
 * StudyOS - Revision Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const RevisionService = require('./revision.service');

/**
 * @route   POST /api/v1/revision/initialize
 * @desc    Initialize revision cards for all chapters in an exam
 * @access  Private
 */
const initialize = asyncHandler(async (req, res) => {
  const result = await RevisionService.initializeForExam(req.user._id, req.body.examId);

  sendSuccess(res, {
    statusCode: 201,
    message: `Initialized ${result.created} revision cards (${result.skipped} already existed)`,
    data: result,
  });
});

/**
 * @route   POST /api/v1/revision/:id/review
 * @desc    Process a review for a card (SM-2 algorithm)
 * @access  Private
 */
const processReview = asyncHandler(async (req, res) => {
  const card = await RevisionService.processReview(
    req.user._id,
    req.params.id,
    req.body.quality
  );

  sendSuccess(res, {
    statusCode: 200,
    message: `Review processed — next review in ${card.interval} day(s)`,
    data: { card },
  });
});

/**
 * @route   GET /api/v1/revision/due
 * @desc    Get cards due for review right now
 * @access  Private
 */
const getDueCards = asyncHandler(async (req, res) => {
  const cards = await RevisionService.getDueCards(req.user._id, req.query.examId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Due cards retrieved',
    data: { cards, total: cards.length },
  });
});

/**
 * @route   GET /api/v1/revision/weak
 * @desc    Get weak topics that need extra attention
 * @access  Private
 */
const getWeakTopics = asyncHandler(async (req, res) => {
  const cards = await RevisionService.getWeakTopics(req.user._id, req.query.examId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Weak topics retrieved',
    data: { cards, total: cards.length },
  });
});

/**
 * @route   GET /api/v1/revision/schedule
 * @desc    Get multi-day revision schedule (lookahead)
 * @access  Private
 */
const getSchedule = asyncHandler(async (req, res) => {
  const result = await RevisionService.getRevisionSchedule(req.user._id, {
    examId: req.query.examId,
    days: req.query.days ? parseInt(req.query.days, 10) : 7,
    maxPerDay: req.query.maxPerDay ? parseInt(req.query.maxPerDay, 10) : 10,
  });

  sendSuccess(res, {
    statusCode: 200,
    message: 'Revision schedule generated',
    data: result,
  });
});

/**
 * @route   GET /api/v1/revision/stats
 * @desc    Get revision stats (mastery rate, due count, etc.)
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await RevisionService.getStats(req.user._id, req.query.examId);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Revision stats retrieved',
    data: { stats },
  });
});

/**
 * @route   GET /api/v1/revision/cards
 * @desc    List all revision cards (with filters)
 * @access  Private
 */
const getCards = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.examId) filters.examId = req.query.examId;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.isWeak !== undefined) filters.isWeak = req.query.isWeak === 'true';

  const cards = await RevisionService.getUserCards(req.user._id, filters);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Revision cards retrieved',
    data: { cards, total: cards.length },
  });
});

/**
 * @route   GET /api/v1/revision/:id
 * @desc    Get a single card with full review history
 * @access  Private
 */
const getCardById = asyncHandler(async (req, res) => {
  const card = await RevisionService.getCardById(req.user._id, req.params.id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Revision card retrieved',
    data: { card },
  });
});

/**
 * @route   DELETE /api/v1/revision/reset
 * @desc    Reset all revision cards for an exam (start fresh)
 * @access  Private
 */
const resetForExam = asyncHandler(async (req, res) => {
  const count = await RevisionService.resetForExam(req.user._id, req.body.examId);

  sendSuccess(res, {
    statusCode: 200,
    message: `Reset ${count} revision cards`,
    data: { deletedCount: count },
  });
});

module.exports = {
  initialize,
  processReview,
  getDueCards,
  getWeakTopics,
  getSchedule,
  getStats,
  getCards,
  getCardById,
  resetForExam,
};
