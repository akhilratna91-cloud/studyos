/**
 * StudyOS - Simple Analytics Service
 * 
 * Simple, lightweight analytics to calculate accuracy, progress, 
 * and weak chapters without heavy computation.
 */

const { QuizAttempt } = require('../quiz/quiz.model');
const Gamification = require('../gamification/gamification.model');
const ChapterProgress = require('../chapterprogress/chapterprogress.model');
const mongoose = require('mongoose');

class SimpleAnalyticsService {
  
  /**
   * 1. calculate_accuracy
   * Uses quiz_attempt table (QuizAttempt)
   * accuracy = correct / total attempted
   */
  static async calculateAccuracy(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    // Very simple aggregation
    const result = await QuizAttempt.aggregate([
      { $match: { userId: objectUserId, status: { $in: ['completed', 'timed_out'] } } },
      { 
        $group: { 
          _id: null, 
          totalCorrect: { $sum: '$correct' },
          totalAnswered: { $sum: '$answered' }
        } 
      }
    ]);

    if (!result || result.length === 0 || result[0].totalAnswered === 0) {
      return 0; // Default accuracy
    }

    return Math.round((result[0].totalCorrect / result[0].totalAnswered) * 100);
  }

  /**
   * 2. get_progress
   * return completion %
   */
  static async getProgress(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Simple lookup from overall gamification stats (already calculated)
    const stats = await Gamification.findOne({ userId: objectUserId }).select('overallProgress').exec();
    
    if (stats) {
      return stats.overallProgress;
    }

    // Fallback: simple query to ChapterProgress
    const chapterStats = await ChapterProgress.aggregate([
      { $match: { userId: objectUserId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
          }
        }
      }
    ]);

    if (!chapterStats || chapterStats.length === 0 || chapterStats[0].total === 0) {
      return 0;
    }

    return Math.round((chapterStats[0].completed / chapterStats[0].total) * 100);
  }

  /**
   * 3. get_weak_chapters
   * Find chapters with low accuracy/ratings. Simple queries only.
   */
  static async getWeakChapters(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Simplest approach: Query ChapterProgress for chapters started but with low rating/completion
    const weakChapters = await ChapterProgress.find({ 
      userId: objectUserId,
      status: { $ne: 'not_started' },
      avgRating: { $lt: 3.5 } // Assuming below 3.5 is weak
    })
    .select('chapterName avgRating status')
    .limit(5)
    .lean()
    .exec();

    return weakChapters.map(ch => ch.chapterName);
  }

  /**
   * Generate Full Simple Analytics Payload
   */
  static async getAnalytics(userId) {
    const [accuracy, progress, weak_chapters] = await Promise.all([
      this.calculateAccuracy(userId),
      this.getProgress(userId),
      this.getWeakChapters(userId)
    ]);

    return {
      accuracy,
      progress,
      weak_chapters
    };
  }
}

module.exports = SimpleAnalyticsService;
