/**
 * StudyOS - Answer Evaluation Service
 *
 * Dedicated AI-agent module to evaluate quiz answers in bulk.
 * Independent of the QuizSession state, this provides a stateless
 * evaluation engine for grading any set of answers.
 */

const Question = require('../question/question.model');
const AppError = require('../../shared/errors/AppError');

class AnswerEvaluationService {
  /**
   * Evaluate a set of answers against the database.
   *
   * @param {Array} answers - Array of { questionId, selectedAnswer }
   * @returns {Object} Evaluation results: score, accuracy, breakdown
   */
  static async evaluateAnswers(answers) {
    if (!answers || !answers.length) {
      throw AppError.badRequest('No answers provided for evaluation', 'NO_ANSWERS');
    }

    const questionIds = answers.map((a) => a.questionId);
    
    // Fetch all corresponding questions from DB to get the correct answers
    const questions = await Question.find({ _id: { $in: questionIds } }).select('correctAnswer').exec();
    
    if (questions.length === 0) {
      throw AppError.notFound('None of the specified questions were found', 'QUESTIONS_NOT_FOUND');
    }

    const correctAnswersMap = new Map();
    questions.forEach((q) => {
      correctAnswersMap.set(q._id.toString(), q.correctAnswer);
    });

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const detailedResults = answers.map((ans) => {
      const qId = ans.questionId.toString();
      const correctAnswer = correctAnswersMap.get(qId);
      
      const isFound = correctAnswersMap.has(qId);
      const isSkipped = ans.selectedAnswer === null || ans.selectedAnswer === undefined;
      const isCorrect = isFound && !isSkipped && ans.selectedAnswer === correctAnswer;

      if (!isFound || isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: qId,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: isFound ? correctAnswer : null,
        isCorrect
      };
    });

    const totalValidQuestions = questions.length;
    const answeredCount = correctCount + wrongCount;
    
    // Calculate Score (e.g. 1 point per correct answer out of total questions)
    // Calculate Accuracy (correct answers out of attempted/answered questions)
    const score = totalValidQuestions > 0 ? Math.round((correctCount / totalValidQuestions) * 100) : 0;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return {
      score,
      accuracy,
      summary: {
        totalQuestions: totalValidQuestions,
        attempted: answeredCount,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount
      },
      detailedResults
    };
  }
}

module.exports = AnswerEvaluationService;
