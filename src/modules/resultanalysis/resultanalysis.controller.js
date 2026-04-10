/**
 * StudyOS - Result Analysis Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ResultAnalysisService = require('./resultanalysis.service');

/**
 * @route   GET /api/v1/result-analysis/:attemptId
 * @desc    Analyze a completed quiz attempt and generate insights/suggestions
 */
const analyzeResult = asyncHandler(async (req, res) => {
  const analysis = await ResultAnalysisService.analyzeResult(req.user._id, req.params.attemptId);

  sendSuccess(res, {
    statusCode: 200,
    message: `Analysis Complete — ${analysis.weaknessAnalysis.weakTopics.length} weak topics detected.`,
    data: { analysis },
  });
});

module.exports = { analyzeResult };
