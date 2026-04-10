/**
 * StudyOS - Gamification Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const GamificationService = require('./gamification.service');

/**
 * @route   GET /api/v1/gamification/stats
 * @desc    Full gamification profile (XP, level, progress, milestones)
 */
const getStats = asyncHandler(async (req, res) => {
  const result = await GamificationService.getStats(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: `Level ${result.stats.level} ${result.levelName} — ${result.stats.overallProgress}% complete`,
    data: result,
  });
});

/**
 * @route   POST /api/v1/gamification/sync
 * @desc    Recalculate all stats from source modules
 */
const syncStats = asyncHandler(async (req, res) => {
  const result = await GamificationService.syncStats(req.user._id);

  const msg = result.newMilestones.length > 0
    ? `Synced! 🎉 New milestone(s): ${result.newMilestones.map((m) => m.label).join(', ')}`
    : `Synced! Level ${result.stats.level} ${result.levelName} — ${result.stats.totalXP} XP`;

  sendSuccess(res, {
    statusCode: 200,
    message: msg,
    data: result,
  });
});

/**
 * @route   GET /api/v1/gamification/progress
 * @desc    Overall progress % (simple — completed chapters / total chapters)
 */
const getOverallProgress = asyncHandler(async (req, res) => {
  const progress = await GamificationService.getOverallProgress(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: `Overall progress: ${progress.overallProgress}% (${progress.completedChapters}/${progress.totalChapters} chapters)`,
    data: { progress },
  });
});

/**
 * @route   GET /api/v1/gamification/milestones
 * @desc    All milestones with locked/unlocked status
 */
const getMilestones = asyncHandler(async (req, res) => {
  const result = await GamificationService.getMilestones(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: `${result.unlocked}/${result.total} milestones unlocked`,
    data: result,
  });
});

/**
 * @route   GET /api/v1/gamification/xp-table
 * @desc    XP values and level thresholds (public reference)
 */
const getXPTable = asyncHandler(async (_req, res) => {
  const table = GamificationService.getXPTable();

  sendSuccess(res, {
    statusCode: 200,
    message: 'XP and level reference',
    data: table,
  });
});

module.exports = {
  getStats,
  syncStats,
  getOverallProgress,
  getMilestones,
  getXPTable,
};
