/**
 * StudyOS - Simple Analytics Service
 * 
 * Simple, lightweight analytics to calculate accuracy, progress, 
 * and weak chapters without heavy computation.
 */

const { QuizAttempt } = require('../quiz/quiz.model');
const Gamification = require('../gamification/gamification.model');
const ChapterProgress = require('../chapterprogress/chapterprogress.model');
const DailyTask = require('../dailytask/dailytask.model');
const mongoose = require('mongoose');
const { Deque, PrefixSum } = require('../../shared/utils/dsa.utils');

class SimpleAnalyticsService {
  
  /**
   * 1. calculate_accuracy
   * Uses quiz_attempt table (QuizAttempt)
   * accuracy = correct / total attempted
   */
  static async calculateAccuracy(userId) {
    const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
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
    const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

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
    const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

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
   * 4. 7-Day Sliding Window Burnout Monitor (Deque)
   */
  static async calculateBurnoutRisk(userId) {
    const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTasks = await DailyTask.find({
      userId: objectUserId,
      date: { $gte: sevenDaysAgo, $lte: now },
    }).sort({ date: 1 }).exec();

    const windowDeque = new Deque(7);
    for (const t of dailyTasks) {
      windowDeque.pushBack(t.status === 'completed' ? 1 : 0);
    }

    const completionRate = windowDeque.averageBy() * 100;
    const isBurnoutRisk = windowDeque.size >= 5 && completionRate < 40;

    return {
      rolling7DayCompletion: Math.round(completionRate),
      isBurnoutRisk,
      activeWindowDays: windowDeque.size,
    };
  }

  /**
   * 5. O(1) PrefixSum Velocity Query
   */
  static async getVelocityStats(userId) {
    const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Aggregate completed task minutes per day over last 30 days
    const dailyMinutesAgg = await DailyTask.aggregate([
      { $match: { userId: objectUserId, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalMinutes: { $sum: '$durationMinutes' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const minutesVector = dailyMinutesAgg.map((d) => d.totalMinutes / 60);
    const prefixSum = new PrefixSum(minutesVector);

    return {
      totalHours: Math.round(prefixSum.total * 10) / 10,
      recent7DaysHours: Math.round(prefixSum.queryRange(Math.max(0, minutesVector.length - 7), minutesVector.length - 1) * 10) / 10,
      dailyVectorLength: minutesVector.length,
    };
  }

  /**
   * Generate Full Simple Analytics Payload
   */
  static async getFullAnalytics(userId) {
    const [accuracy, progress, weakChapters, burnout, velocity] = await Promise.all([
      this.calculateAccuracy(userId),
      this.getProgress(userId),
      this.getWeakChapters(userId),
      this.calculateBurnoutRisk(userId),
      this.getVelocityStats(userId),
    ]);

    return {
      accuracy,
      progress,
      weak_chapters: weakChapters,
      weakChapters,
      burnout,
      velocity,
    };
  }

  static async getAnalytics(userId) {
    return this.getFullAnalytics(userId);
  }
}

module.exports = SimpleAnalyticsService;
