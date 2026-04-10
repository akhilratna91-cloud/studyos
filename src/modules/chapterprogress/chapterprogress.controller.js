/**
 * StudyOS - ChapterProgress Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ChapterProgressService = require('./chapterprogress.service');

/**
 * @route   POST /api/v1/chapter-progress/initialize/:examId
 * @desc    Initialize chapter progress records for all chapters in an exam
 */
const initialize = asyncHandler(async (req, res) => {
  const result = await ChapterProgressService.initializeForExam(req.user._id, req.params.examId);
  sendSuccess(res, {
    statusCode: 201,
    message: `Initialized progress for ${result.initialized} chapters`,
    data: result,
  });
});

/**
 * @route   POST /api/v1/chapter-progress/sync/:examId
 * @desc    Sync all chapter progress from tasks for an exam
 */
const syncAll = asyncHandler(async (req, res) => {
  const results = await ChapterProgressService.syncAllForExam(req.user._id, req.params.examId);
  const completed = results.filter((r) => r.status === 'completed' || r.status === 'mastered');
  sendSuccess(res, {
    statusCode: 200,
    message: `Synced ${results.length} chapters — ${completed.length} completed`,
    data: { chapters: results, total: results.length },
  });
});

/**
 * @route   POST /api/v1/chapter-progress/sync/chapter/:chapterId
 * @desc    Sync a single chapter's progress from its tasks
 */
const syncChapter = asyncHandler(async (req, res) => {
  const result = await ChapterProgressService.syncChapter(req.user._id, req.params.chapterId);
  sendSuccess(res, {
    statusCode: 200,
    message: `Chapter "${result.chapterName}" — ${result.completionRate}% complete`,
    data: { chapter: result },
  });
});

/**
 * @route   POST /api/v1/chapter-progress/:chapterId/complete
 * @desc    Manually mark a chapter as completed
 */
const markCompleted = asyncHandler(async (req, res) => {
  const result = await ChapterProgressService.markCompleted(req.user._id, req.params.chapterId);
  sendSuccess(res, {
    statusCode: 200,
    message: `"${result.chapterName}" marked as completed ✅`,
    data: { chapter: result },
  });
});

/**
 * @route   POST /api/v1/chapter-progress/:chapterId/master
 * @desc    Manually mark a chapter as mastered
 */
const markMastered = asyncHandler(async (req, res) => {
  const result = await ChapterProgressService.markMastered(req.user._id, req.params.chapterId);
  sendSuccess(res, {
    statusCode: 200,
    message: `"${result.chapterName}" marked as mastered 🏆`,
    data: { chapter: result },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/exam/:examId
 * @desc    Get all chapter progress for an exam
 */
const getByExam = asyncHandler(async (req, res) => {
  const chapters = await ChapterProgressService.getByExam(req.user._id, req.params.examId);
  sendSuccess(res, {
    statusCode: 200,
    message: 'Chapter progress retrieved',
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/subject/:subjectId
 * @desc    Get chapter progress for a subject
 */
const getBySubject = asyncHandler(async (req, res) => {
  const chapters = await ChapterProgressService.getBySubject(req.user._id, req.params.subjectId);
  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject chapter progress retrieved',
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/chapter/:chapterId
 * @desc    Get single chapter progress
 */
const getByChapter = asyncHandler(async (req, res) => {
  const chapter = await ChapterProgressService.getByChapter(req.user._id, req.params.chapterId);
  sendSuccess(res, {
    statusCode: 200,
    message: chapter ? 'Chapter progress retrieved' : 'No progress found',
    data: { chapter },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/status?status=completed&examId=...
 * @desc    Get chapters by status
 */
const getByStatus = asyncHandler(async (req, res) => {
  const chapters = await ChapterProgressService.getByStatus(
    req.user._id,
    req.query.status,
    req.query.examId
  );
  sendSuccess(res, {
    statusCode: 200,
    message: `${chapters.length} chapter(s) with status "${req.query.status}"`,
    data: { chapters, total: chapters.length },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/rollup/subjects?examId=...
 * @desc    Subject-level progress rollup
 */
const getSubjectRollup = asyncHandler(async (req, res) => {
  const rollup = await ChapterProgressService.getSubjectRollup(req.user._id, req.query.examId);
  sendSuccess(res, {
    statusCode: 200,
    message: 'Subject rollup retrieved',
    data: { subjects: rollup, total: rollup.length },
  });
});

/**
 * @route   GET /api/v1/chapter-progress/summary/:examId
 * @desc    Exam-level syllabus coverage
 */
const getExamSummary = asyncHandler(async (req, res) => {
  const summary = await ChapterProgressService.getExamSummary(req.user._id, req.params.examId);
  sendSuccess(res, {
    statusCode: 200,
    message: `Syllabus coverage: ${summary.syllabusCoverage}%`,
    data: { summary },
  });
});

module.exports = {
  initialize, syncAll, syncChapter, markCompleted, markMastered,
  getByExam, getBySubject, getByChapter, getByStatus, getSubjectRollup, getExamSummary,
};
