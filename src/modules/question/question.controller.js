/**
 * StudyOS - Question Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const QuestionService = require('./question.service');

// ─── CREATE ───────────────────────────────────────────────────────────────────

const createQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionService.createQuestion({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, { statusCode: 201, message: 'Question created', data: { question } });
});

const bulkCreate = asyncHandler(async (req, res) => {
  const questions = await QuestionService.bulkCreate(req.body.chapterId, req.body.questions);
  sendSuccess(res, {
    statusCode: 201,
    message: `${questions.length} questions added`,
    data: { questions, total: questions.length },
  });
});

const seedQuestions = asyncHandler(async (_req, res) => {
  const result = await QuestionService.seedQuestions();
  sendSuccess(res, {
    statusCode: 200,
    message: result.seeded
      ? `Seeded ${result.count} questions successfully`
      : `Questions already exist (${result.count} found). Skipped seeding.`,
    data: result,
  });
});

// ─── READ ─────────────────────────────────────────────────────────────────────

const getByChapter = asyncHandler(async (req, res) => {
  const questions = await QuestionService.getByChapter(req.params.chapterId, req.query);
  sendSuccess(res, {
    statusCode: 200,
    message: `${questions.length} question(s)`,
    data: { questions, total: questions.length },
  });
});

const getBySubject = asyncHandler(async (req, res) => {
  const questions = await QuestionService.getBySubject(req.params.subjectId, req.query);
  sendSuccess(res, {
    statusCode: 200,
    message: `${questions.length} question(s)`,
    data: { questions, total: questions.length },
  });
});

const getByExam = asyncHandler(async (req, res) => {
  const questions = await QuestionService.getByExam(req.params.examId, req.query);
  sendSuccess(res, {
    statusCode: 200,
    message: `${questions.length} question(s)`,
    data: { questions, total: questions.length },
  });
});

const getByTopic = asyncHandler(async (req, res) => {
  const questions = await QuestionService.getByTopic(req.params.topicId);
  sendSuccess(res, {
    statusCode: 200,
    message: `${questions.length} question(s)`,
    data: { questions, total: questions.length },
  });
});

const getById = asyncHandler(async (req, res) => {
  const question = await QuestionService.getById(req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Question retrieved', data: { question } });
});

const searchByTags = asyncHandler(async (req, res) => {
  const tags = req.query.tags.split(',').map((t) => t.trim());
  const questions = await QuestionService.searchByTags(tags, req.query.examId);
  sendSuccess(res, {
    statusCode: 200,
    message: `${questions.length} question(s) matching tags`,
    data: { questions, total: questions.length },
  });
});

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

const generateChapterQuiz = asyncHandler(async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 10;
  const quiz = await QuestionService.generateQuiz(req.params.chapterId, count, req.query.difficulty);
  sendSuccess(res, {
    statusCode: 200,
    message: `Quiz generated — ${quiz.length} questions`,
    data: { quiz, total: quiz.length },
  });
});

const generateSubjectQuiz = asyncHandler(async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 20;
  const quiz = await QuestionService.generateSubjectQuiz(req.params.subjectId, count, req.query.difficulty);
  sendSuccess(res, {
    statusCode: 200,
    message: `Subject quiz generated — ${quiz.length} questions`,
    data: { quiz, total: quiz.length },
  });
});

// ─── VERIFY ───────────────────────────────────────────────────────────────────

const verifyAnswer = asyncHandler(async (req, res) => {
  const result = await QuestionService.verifyAnswer(req.params.id, req.body.selectedAnswer);
  sendSuccess(res, {
    statusCode: 200,
    message: result.isCorrect ? 'Correct! ✅' : 'Incorrect ❌',
    data: { result },
  });
});

// ─── UPDATE / DELETE ──────────────────────────────────────────────────────────

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionService.updateQuestion(req.params.id, req.body);
  sendSuccess(res, { statusCode: 200, message: 'Question updated', data: { question } });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  await QuestionService.deleteQuestion(req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Question deleted' });
});

// ─── STATS ────────────────────────────────────────────────────────────────────

const getStats = asyncHandler(async (req, res) => {
  const stats = await QuestionService.getStats(req.params.examId);
  sendSuccess(res, {
    statusCode: 200,
    message: `${stats.grandTotal} questions in bank`,
    data: { stats },
  });
});

module.exports = {
  createQuestion, bulkCreate, seedQuestions, getByChapter, getBySubject, getByExam, getByTopic,
  getById, searchByTags, generateChapterQuiz, generateSubjectQuiz, verifyAnswer,
  updateQuestion, deleteQuestion, getStats,
};
