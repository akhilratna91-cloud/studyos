/**
 * StudyOS - Simple Gamification Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const SimpleGamificationService = require('./simplegamification.service');

/**
 * @route   POST /api/v1/simple-gamification/xp
 * @desc    Add XP explicitly
 */
const addXp = asyncHandler(async (req, res) => {
  // Support either body user_id or auth token user depending on how prompt calls it
  const userId = req.body.user_id || req.user._id;
  const points = parseInt(req.body.points || 0, 10);

  const totalXp = await SimpleGamificationService.addXp(userId, points);
  
  res.status(200).json({ success: true, totalXp });
});

/**
 * @route   GET /api/v1/simple-gamification/level/:userId
 * @desc    Get Level computation
 */
const getLevel = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await SimpleGamificationService.getLevel(idToUse);
  
  res.status(200).json({ success: true, level: data.level, xp: data.totalXp });
});

/**
 * @route   GET /api/v1/simple-gamification/streak/:userId
 * @desc    Get streak (optional path to auto-update based on hit)
 */
const getStreak = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  
  // We'll update streak dynamically on fetch just to fulfill the mechanics of update_streak
  const currentStreak = await SimpleGamificationService.updateStreak(idToUse);
  
  res.status(200).json({ success: true, streak: currentStreak });
});


module.exports = { addXp, getLevel, getStreak };
