/**
 * StudyOS - Simple AI Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const SimpleAIService = require('./simpleai.service');

/**
 * @route   GET /api/v1/ai/recommend/:userId
 * @desc    Get next action recommendation
 */
const recommend = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await SimpleAIService.getStudyRecommendation(idToUse);
  
  res.status(200).json(data);
});

/**
 * @route   GET /api/v1/ai/weak/:userId
 * @desc    Get advice on weak chapters
 */
const weakAdvice = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await SimpleAIService.getWeakAdvice(idToUse);
  
  res.status(200).json(data);
});

/**
 * @route   GET /api/v1/ai/motivate
 * @desc    Get a motivation string
 */
const motivate = asyncHandler(async (req, res) => {
  const data = SimpleAIService.getMotivation();
  
  res.status(200).json(data);
});

/**
 * @route   POST /api/v1/simple-ai/chat
 * @desc    Chat with AI Study Copilot
 */
const chat = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : 'guest';
  const { message = '', context = {} } = req.body || {};
  
  const data = await SimpleAIService.chatWithAI(userId, message, context);
  res.status(200).json({ success: true, data });
});

module.exports = { recommend, weakAdvice, motivate, chat };
