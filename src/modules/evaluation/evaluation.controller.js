/**
 * StudyOS - Answer Evaluation Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const AnswerEvaluationService = require('./evaluation.service');

/**
 * @route   POST /api/v1/evaluation/evaluate
 * @desc    Submit a batch of answers for immediate evaluation (score & accuracy)
 */
const evaluateAnswers = asyncHandler(async (req, res) => {
  const result = await AnswerEvaluationService.evaluateAnswers(req.body.answers);

  sendSuccess(res, {
    statusCode: 200,
    message: `Evaluation Complete — Score: ${result.score}% | Accuracy: ${result.accuracy}%`,
    data: { evaluation: result },
  });
});

module.exports = { evaluateAnswers };
