/**
 * StudyOS - Quiz Controller (HTTP Layer)
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const QuizService = require('./quiz.service');

// ─── Generate ─────────────────────────────────────────────────────────────────

const generateChapterQuiz = asyncHandler(async (req, res) => {
  const quiz = await QuizService.generateChapterQuiz(req.user._id, req.body.chapterId, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: `Quiz generated — ${quiz.totalQuestions} questions, ${quiz.timeLimitMinutes} min ⏱️`,
    data: { quiz },
  });
});

const generateSubjectQuiz = asyncHandler(async (req, res) => {
  const quiz = await QuizService.generateSubjectQuiz(req.user._id, req.body.subjectId, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: `Subject quiz — ${quiz.totalQuestions} questions`,
    data: { quiz },
  });
});

const generateMockTest = asyncHandler(async (req, res) => {
  const quiz = await QuizService.generateMockTest(req.user._id, req.body.examId, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: `Mock test — ${quiz.totalQuestions} questions, ${quiz.timeLimitMinutes} min 📝`,
    data: { quiz },
  });
});

// ─── Attempt lifecycle ────────────────────────────────────────────────────────

const startAttempt = asyncHandler(async (req, res) => {
  const result = await QuizService.startAttempt(req.user._id, req.params.id);
  sendSuccess(res, {
    statusCode: 200,
    message: `Quiz started! You have ${result.timeLimit || result.attempt?.timeLimitMinutes} minutes. Good luck! 🍀`,
    data: result,
  });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const result = await QuizService.submitAnswer(
    req.user._id, req.params.id,
    req.body.questionId, req.body.selectedAnswer, req.body.timeTakenSeconds
  );
  sendSuccess(res, {
    statusCode: 200,
    message: `Answer recorded (${result.answeredSoFar}/${result.totalQuestions})`,
    data: result,
  });
});

const finishAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizService.finishAttempt(req.user._id, req.params.id);
  const emoji = attempt.passed ? '🎉' : '📚';
  sendSuccess(res, {
    statusCode: 200,
    message: `Score: ${attempt.score}% — ${attempt.correct}/${attempt.totalQuestions} correct ${emoji}`,
    data: { attempt },
  });
});

const abandonAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizService.abandonAttempt(req.user._id, req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Quiz abandoned', data: { attempt } });
});

// ─── Review & History ─────────────────────────────────────────────────────────

const reviewAttempt = asyncHandler(async (req, res) => {
  const result = await QuizService.reviewAttempt(req.user._id, req.params.id);
  sendSuccess(res, {
    statusCode: 200,
    message: `Review: ${result.attempt.correct}/${result.attempt.totalQuestions} correct`,
    data: result,
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const history = await QuizService.getHistory(req.user._id, limit);
  sendSuccess(res, {
    statusCode: 200,
    message: `${history.length} quiz attempts`,
    data: { attempts: history, total: history.length },
  });
});

const getUserStats = asyncHandler(async (req, res) => {
  const stats = await QuizService.getUserStats(req.user._id);
  sendSuccess(res, {
    statusCode: 200,
    message: `${stats.totalQuizzes} quizzes — ${stats.avgScore}% avg score`,
    data: { stats },
  });
});

const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await QuizService.getQuizById(req.params.id);
  sendSuccess(res, { statusCode: 200, message: 'Quiz retrieved', data: { quiz } });
});

const getUserQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await QuizService.getUserQuizzes(req.user._id, req.query.type);
  sendSuccess(res, {
    statusCode: 200,
    message: `${quizzes.length} quizzes`,
    data: { quizzes, total: quizzes.length },
  });
});

module.exports = {
  generateChapterQuiz, generateSubjectQuiz, generateMockTest,
  startAttempt, submitAnswer, finishAttempt, abandonAttempt,
  reviewAttempt, getHistory, getUserStats, getQuizById, getUserQuizzes,
};
