/**
 * StudyOS - Result Analysis Service
 *
 * AI-powered agent to analyze a completed QuizAttempt.
 * Detects weak topics/tags, identifies patterns in mistakes,
 * and generates actionable study suggestions.
 */

const { QuizAttempt, Quiz } = require('../quiz/quiz.model');
const Question = require('../question/question.model');
const AppError = require('../../shared/errors/AppError');

class ResultAnalysisService {
  /**
   * Analyze a completed quiz attempt to detect weaknesses and suggest improvements.
   *
   * @param {string} userId - ID of the user
   * @param {string} attemptId - ID of the QuizAttempt
   * @returns {Object} Performance analysis report
   */
  static async analyzeResult(userId, attemptId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    
    if (!attempt) {
      throw AppError.notFound('Quiz attempt not found', 'ATTEMPT_NOT_FOUND');
    }
    
    if (attempt.status !== 'completed' && attempt.status !== 'timed_out') {
      throw AppError.badRequest('Cannot analyze an incomplete quiz', 'NOT_COMPLETED');
    }

    const questionIds = attempt.answers.map((a) => a.questionId);
    if (questionIds.length === 0) {
      throw AppError.badRequest('No answers available to analyze', 'NO_ANSWERS');
    }

    const questions = await Question.find({ _id: { $in: questionIds } }).exec();
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // ── Metrics Tracking ──
    const mistakes = [];
    const topicMistakes = new Map(); // topicName -> count
    const tagMistakes = new Map();   // tag -> count
    const difficultyStats = { easy: { total: 0, wrong: 0 }, medium: { total: 0, wrong: 0 }, hard: { total: 0, wrong: 0 } };

    // Process each answer
    for (const ans of attempt.answers) {
      const q = qMap.get(ans.questionId.toString());
      if (!q) continue;

      const diff = q.difficulty || 'medium';
      difficultyStats[diff].total++;

      if (!ans.isCorrect) {
        difficultyStats[diff].wrong++;
        
        // Track mistake for reporting
        mistakes.push({
          question: q.question,
          difficulty: q.difficulty,
          tags: q.tags,
          explanation: q.explanation
        });

        // Track weak topics/chapters
        const topic = q.topicName || q.chapterName || 'General';
        topicMistakes.set(topic, (topicMistakes.get(topic) || 0) + 1);

        // Track tags
        if (q.tags && q.tags.length > 0) {
          q.tags.forEach(tag => {
            tagMistakes.set(tag, (tagMistakes.get(tag) || 0) + 1);
          });
        }
      }
    }

    // ── Generate Analysis ──
    
    // Sort weak topics
    const weakTopics = Array.from(topicMistakes.entries())
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, mistakes: count }));

    // Sort weak tags
    const weakTags = Array.from(tagMistakes.entries())
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, mistakes: count }));

    // Formulate suggestions
    const suggestions = [];
    
    if (attempt.score >= 90) {
      suggestions.push("Excellent work! You have strong mastery. Focus on speed and taking full mock tests.");
    } else if (attempt.score >= 70) {
      suggestions.push("Good performance. Review specific mistake explanations below.");
    } else {
      suggestions.push("You struggled with this quiz. Consider returning to the study material before retaking.");
    }

    if (weakTopics.length > 0) {
      suggestions.push(`Re-study these specific topics: ${weakTopics.slice(0, 3).map(t => t.topic).join(', ')}.`);
    }

    if (difficultyStats.easy.wrong > 0) {
      suggestions.push(`Review the basics — you missed ${difficultyStats.easy.wrong} easy question(s). Avoid careless mistakes.`);
    } else if (difficultyStats.hard.wrong > 0) {
      suggestions.push(`To improve your score further, spend extra time practicing 'Hard' difficulty questions.`);
    }

    // Combine into final report
    return {
      attemptId,
      score: attempt.score,
      passed: attempt.passed,
      summary: {
        totalQuestions: attempt.totalQuestions,
        correct: attempt.correct,
        wrong: attempt.wrong,
        skipped: attempt.skipped
      },
      weaknessAnalysis: {
        weakTopics: weakTopics.slice(0, 5), // Top 5
        weakConceptTags: weakTags.slice(0, 5) // Top 5
      },
      difficultyBreakdown: difficultyStats,
      mistakesPreview: mistakes.slice(0, 3), // Show first 3 mistakes for context
      improvementPlan: suggestions
    };
  }
}

module.exports = ResultAnalysisService;
