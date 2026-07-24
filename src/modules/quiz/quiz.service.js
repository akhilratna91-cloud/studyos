/**
 * StudyOS - Quiz Service (Business Logic Layer)
 *
 * Orchestrates quiz lifecycle:
 *   1. Generate quiz (select questions from bank)
 *   2. Start attempt (timer begins)
 *   3. Submit answers (one-by-one or all-at-once)
 *   4. Finish attempt (grade, score, pass/fail)
 *   5. Review results (with explanations)
 *   6. Quiz history & analytics
 */

const AppError = require('../../shared/errors/AppError');
const { Quiz, QuizAttempt } = require('./quiz.model');
const Question = require('../question/question.model');
const mongoose = require('mongoose');
const { FisherYates } = require('../../shared/utils/dsa.utils');

class QuizService {
  // ───────────────────────────────────────────────────────────────────────────────
  // GENERATE QUIZ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a chapter quiz.
   */
  static async generateChapterQuiz(userId, chapterId, options = {}) {
    const objectChapterId = new mongoose.Types.ObjectId(chapterId);
    const count = options.count || 10;
    const difficulty = options.difficulty || null;
    const timeLimit = options.timeLimitMinutes || 30;
    const passingScore = options.passingScore || 60;

    const match = { chapterId: objectChapterId, isActive: true };
    if (difficulty && difficulty !== 'mixed') match.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);

    if (questions.length === 0) {
      throw AppError.notFound('No questions available for this chapter', 'NO_QUESTIONS');
    }

    // Get chapter/subject info from first question
    const sample = questions[0];

    const quiz = await Quiz.create({
      title: `${sample.chapterName || 'Chapter'} Quiz`,
      type: 'chapter_quiz',
      examId: sample.examId,
      subjectId: sample.subjectId,
      chapterId: objectChapterId,
      subjectName: sample.subjectName,
      subjectIcon: sample.subjectIcon,
      chapterName: sample.chapterName,
      questions: questions.map((q) => q._id),
      totalQuestions: questions.length,
      timeLimitMinutes: timeLimit,
      passingScore,
      difficulty: difficulty || 'mixed',
      shuffleQuestions: options.shuffle !== false,
      createdBy: userId,
    });

    return quiz.toJSON();
  }

  /**
   * Generate a subject quiz (mixed chapters).
   */
  static async generateSubjectQuiz(userId, subjectId, options = {}) {
    const objectSubjectId = new mongoose.Types.ObjectId(subjectId);
    const count = options.count || 20;
    const difficulty = options.difficulty || null;
    const timeLimit = options.timeLimitMinutes || 45;

    const match = { subjectId: objectSubjectId, isActive: true };
    if (difficulty && difficulty !== 'mixed') match.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);

    if (questions.length === 0) {
      throw AppError.notFound('No questions available for this subject', 'NO_QUESTIONS');
    }

    const sample = questions[0];

    const quiz = await Quiz.create({
      title: `${sample.subjectName || 'Subject'} Quiz`,
      type: 'subject_quiz',
      examId: sample.examId,
      subjectId: objectSubjectId,
      subjectName: sample.subjectName,
      subjectIcon: sample.subjectIcon,
      questions: questions.map((q) => q._id),
      totalQuestions: questions.length,
      timeLimitMinutes: timeLimit,
      passingScore: options.passingScore || 60,
      difficulty: difficulty || 'mixed',
      createdBy: userId,
    });

    return quiz.toJSON();
  }

  /**
   * Generate a mock test (full exam simulation).
   */
  static async generateMockTest(userId, examId, options = {}) {
    const objectExamId = new mongoose.Types.ObjectId(examId);
    const count = options.count || 50;
    const timeLimit = options.timeLimitMinutes || 120;

    const questions = await Question.aggregate([
      { $match: { examId: objectExamId, isActive: true } },
      { $sample: { size: count } },
    ]);

    if (questions.length === 0) {
      throw AppError.notFound('No questions for this exam', 'NO_QUESTIONS');
    }

    const quiz = await Quiz.create({
      title: `Mock Test — ${questions.length} Questions`,
      type: 'mock_test',
      examId: objectExamId,
      questions: questions.map((q) => q._id),
      totalQuestions: questions.length,
      timeLimitMinutes: timeLimit,
      passingScore: options.passingScore || 60,
      difficulty: 'mixed',
      createdBy: userId,
    });

    return quiz.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // ATTEMPT LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Start a quiz attempt.
   */
  static async startAttempt(userId, quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw AppError.notFound('Quiz not found', 'QUIZ_NOT_FOUND');

    // Check for existing in-progress attempt
    const existing = await QuizAttempt.findOne({ userId, quizId, status: 'in_progress' });

    // Create attempt with empty answers
    const attempt = existing || await QuizAttempt.create({
      quizId,
      userId,
      totalQuestions: quiz.totalQuestions,
      timeLimitMinutes: quiz.timeLimitMinutes,
      startedAt: new Date(),
    });

    // Get questions (without correct answers for quiz mode)
    const questions = await Question.find({ _id: { $in: quiz.questions } })
      .select('question options difficulty type hint tags chapterName subjectName subjectIcon')
      .exec();

    // Shuffle if configured using unbiased Fisher-Yates O(N) algorithm
    const quizQuestions = quiz.shuffleQuestions
      ? FisherYates.shuffle(questions)
      : questions;

    return {
      attempt: attempt.toJSON(),
      questions: quizQuestions.map((q) => q.toJSON()),
      timeLimit: quiz.timeLimitMinutes,
    };
  }

  /**
   * Submit an answer for a specific question.
   */
  static async submitAnswer(userId, attemptId, questionId, selectedAnswer, timeTakenSeconds = 0) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId, status: 'in_progress' });
    if (!attempt) throw AppError.notFound('No active attempt found', 'NO_ATTEMPT');

    // Check time limit
    const elapsed = (Date.now() - attempt.startedAt.getTime()) / 60000;
    if (elapsed > attempt.timeLimitMinutes) {
      await this._timeOut(attempt);
      throw AppError.badRequest('Time is up! Quiz has been auto-submitted.', 'TIMED_OUT');
    }

    // Get correct answer
    const question = await Question.findById(questionId).select('correctAnswer').exec();
    if (!question) throw AppError.notFound('Question not found', 'QUESTION_NOT_FOUND');

    const isCorrect = question.correctAnswer === selectedAnswer;

    // Remove existing answer for this question (if re-answering)
    attempt.answers = attempt.answers.filter(
      (a) => a.questionId.toString() !== questionId
    );

    // Add new answer
    attempt.answers.push({ questionId, selectedAnswer, isCorrect, timeTakenSeconds });
    await attempt.save();

    return { isCorrect, answeredSoFar: attempt.answers.length, totalQuestions: attempt.totalQuestions };
  }

  /**
   * Finish the attempt — grade and score.
   */
  static async finishAttempt(userId, attemptId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId, status: 'in_progress' });
    if (!attempt) throw AppError.notFound('No active attempt', 'NO_ATTEMPT');

    const quiz = await Quiz.findById(attempt.quizId);

    return this._gradeAttempt(attempt, quiz);
  }

  /** @private */
  static async _timeOut(attempt) {
    const quiz = await Quiz.findById(attempt.quizId);
    attempt.status = 'timed_out';
    return this._gradeAttempt(attempt, quiz);
  }

  /** @private */
  static async _gradeAttempt(attempt, quiz) {
    const now = new Date();
    const correct = attempt.answers.filter((a) => a.isCorrect).length;
    const wrong = attempt.answers.filter((a) => !a.isCorrect && a.selectedAnswer !== null).length;
    const skipped = attempt.totalQuestions - attempt.answers.length;
    const score = attempt.totalQuestions > 0
      ? Math.round((correct / attempt.totalQuestions) * 100)
      : 0;

    attempt.status = attempt.status === 'timed_out' ? 'timed_out' : 'completed';
    attempt.correct = correct;
    attempt.wrong = wrong;
    attempt.skipped = skipped;
    attempt.answered = attempt.answers.length;
    attempt.score = score;
    attempt.passed = score >= (quiz ? quiz.passingScore : 60);
    attempt.completedAt = now;
    attempt.timeTakenMinutes = Math.round((now - attempt.startedAt) / 60000);

    await attempt.save();

    // Update question attempt stats
    for (const ans of attempt.answers) {
      await Question.findByIdAndUpdate(ans.questionId, {
        $inc: { timesAttempted: 1, ...(ans.isCorrect ? { timesCorrect: 1 } : {}) },
      });
    }

    return attempt.toJSON();
  }

  /**
   * Abandon an attempt.
   */
  static async abandonAttempt(userId, attemptId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId, status: 'in_progress' });
    if (!attempt) throw AppError.notFound('No active attempt', 'NO_ATTEMPT');

    attempt.status = 'abandoned';
    attempt.completedAt = new Date();
    await attempt.save();
    return attempt.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // REVIEW & RESULTS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Review a completed attempt with explanations.
   */
  static async reviewAttempt(userId, attemptId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) throw AppError.notFound('Attempt not found', 'NOT_FOUND');

    const questionIds = attempt.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).exec();
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const review = attempt.answers.map((ans) => {
      const q = qMap.get(ans.questionId.toString());
      return {
        question: q ? q.question : '',
        options: q ? q.options : [],
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q ? q.correctAnswer : null,
        isCorrect: ans.isCorrect,
        explanation: q ? q.explanation : '',
        difficulty: q ? q.difficulty : '',
        timeTakenSeconds: ans.timeTakenSeconds,
      };
    });

    return {
      attempt: attempt.toJSON(),
      review,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // HISTORY & STATS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get user's quiz history.
   */
  static async getHistory(userId, limit = 20) {
    const attempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title type subjectName chapterName subjectIcon difficulty')
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();

    return attempts.map((a) => a.toJSON());
  }

  /**
   * Get quiz statistics for a user.
   */
  static async getUserStats(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const stats = await QuizAttempt.aggregate([
      { $match: { userId: objectUserId, status: { $in: ['completed', 'timed_out'] } } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correct' },
          avgScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          totalPassed: { $sum: { $cond: ['$passed', 1, 0] } },
          avgTimeTaken: { $avg: '$timeTakenMinutes' },
        },
      },
    ]);

    const s = stats[0] || {
      totalQuizzes: 0, totalQuestions: 0, totalCorrect: 0,
      avgScore: 0, highestScore: 0, totalPassed: 0, avgTimeTaken: 0,
    };

    return {
      totalQuizzes: s.totalQuizzes,
      totalQuestionsAttempted: s.totalQuestions,
      totalCorrect: s.totalCorrect,
      avgScore: Math.round(s.avgScore || 0),
      highestScore: s.highestScore,
      passRate: s.totalQuizzes > 0 ? Math.round((s.totalPassed / s.totalQuizzes) * 100) : 0,
      avgTimeTaken: Math.round(s.avgTimeTaken || 0),
      accuracy: s.totalQuestions > 0 ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0,
    };
  }

  /**
   * Get a quiz by ID.
   */
  static async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw AppError.notFound('Quiz not found', 'QUIZ_NOT_FOUND');
    return quiz.toJSON();
  }

  /**
   * Get user's quizzes.
   */
  static async getUserQuizzes(userId, type = null) {
    const query = { createdBy: userId, isActive: true };
    if (type) query.type = type;
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).exec();
    return quizzes.map((q) => q.toJSON());
  }
}

module.exports = QuizService;
