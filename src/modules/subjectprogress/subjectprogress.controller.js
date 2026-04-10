/**
 * StudyOS - SubjectProgress Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const SubjectProgressService = require('./subjectprogress.service');

/**
 * @route   GET /api/v1/subject-progress?examId=...
 * @desc    All subjects with progress, strength score, and classification
 */
const getAll = asyncHandler(async (req, res) => {
  const subjects = await SubjectProgressService.getSubjectProgress(
    req.user._id, req.query.examId
  );
  const strong = subjects.filter((s) => s.classification === 'strong').length;
  const weak = subjects.filter((s) => s.classification === 'weak').length;

  sendSuccess(res, {
    statusCode: 200,
    message: `${subjects.length} subjects — ${strong} strong, ${weak} weak`,
    data: { subjects, total: subjects.length },
  });
});

/**
 * @route   GET /api/v1/subject-progress/strong?examId=...
 * @desc    Strong subjects only (score ≥ 80)
 */
const getStrong = asyncHandler(async (req, res) => {
  const subjects = await SubjectProgressService.getStrongSubjects(
    req.user._id, req.query.examId
  );
  sendSuccess(res, {
    statusCode: 200,
    message: `${subjects.length} strong subject(s) 💪`,
    data: { subjects, total: subjects.length },
  });
});

/**
 * @route   GET /api/v1/subject-progress/weak?examId=...
 * @desc    Weak subjects only (score < 50)
 */
const getWeak = asyncHandler(async (req, res) => {
  const subjects = await SubjectProgressService.getWeakSubjects(
    req.user._id, req.query.examId
  );
  sendSuccess(res, {
    statusCode: 200,
    message: subjects.length > 0
      ? `${subjects.length} weak subject(s) need attention ⚠️`
      : 'No weak subjects — great job! 🎉',
    data: { subjects, total: subjects.length },
  });
});

/**
 * @route   GET /api/v1/subject-progress/recommendations?examId=...
 * @desc    Ranked study recommendations (weakest first)
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await SubjectProgressService.getRecommendations(
    req.user._id, req.query.examId
  );
  sendSuccess(res, {
    statusCode: 200,
    message: 'Study focus recommendations',
    data: { recommendations, total: recommendations.length },
  });
});

/**
 * @route   GET /api/v1/subject-progress/:subjectId
 * @desc    Detailed progress for a single subject with chapter breakdown
 */
const getDetail = asyncHandler(async (req, res) => {
  const detail = await SubjectProgressService.getSubjectDetail(
    req.user._id, req.params.subjectId
  );
  sendSuccess(res, {
    statusCode: 200,
    message: detail ? `${detail.subjectName} — ${detail.completionRate}% complete` : 'No progress found',
    data: { subject: detail },
  });
});

module.exports = { getAll, getStrong, getWeak, getRecommendations, getDetail };
