/**
 * StudyOS - Simple Gamification Service
 * 
 * Provides simple math and logic for basic gamification.
 * Level formula: level = xp // 100
 */

const { SimpleXp, SimpleStreak } = require('./simplegamification.model');
const mongoose = require('mongoose');

class SimpleGamificationService {
  
  /**
   * 1. add_xp(user_id, points)
   * increase XP when task is completed
   */
  static async addXp(userId, points) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    // Find or Create
    let xpRecord = await SimpleXp.findOne({ userId: objectUserId });
    if (!xpRecord) {
      xpRecord = new SimpleXp({ userId: objectUserId, totalXp: 0 });
    }
    
    xpRecord.totalXp += (points || 0);
    await xpRecord.save();
    
    return xpRecord.totalXp;
  }

  /**
   * 2. get_level(xp)
   * simple formula: level = xp // 100
   */
  static async getLevel(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const xpRecord = await SimpleXp.findOne({ userId: objectUserId });
    const xpContext = xpRecord ? xpRecord.totalXp : 0;
    
    // Formula: level = Math.floor(xp / 100)
    const level = Math.floor(xpContext / 100);
    
    return { level, totalXp: xpContext };
  }

  /**
   * 3. update_streak(user_id)
   * if user studies today → +1
   * if skipped → reset streak
   */
  static async updateStreak(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    let streakRecord = await SimpleStreak.findOne({ userId: objectUserId });
    if (!streakRecord) {
      streakRecord = new SimpleStreak({ userId: objectUserId, currentStreak: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day local time

    // If never studied
    if (!streakRecord.lastStudyDate) {
      streakRecord.currentStreak = 1;
      streakRecord.lastStudyDate = new Date();
      await streakRecord.save();
      return streakRecord.currentStreak;
    }

    const lastStudy = new Date(streakRecord.lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastStudy);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already studied today
      return streakRecord.currentStreak;
    } else if (diffDays === 1) {
      // Consecutive day studied
      streakRecord.currentStreak += 1;
      streakRecord.lastStudyDate = new Date();
    } else {
      // Skipped a day -> reset to 1
      streakRecord.currentStreak = 1;
      streakRecord.lastStudyDate = new Date();
    }

    await streakRecord.save();
    return streakRecord.currentStreak;
  }

  /**
   * get_streak
   */
  static async getStreak(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const streakRecord = await SimpleStreak.findOne({ userId: objectUserId });
    return streakRecord ? streakRecord.currentStreak : 0;
  }
}

module.exports = SimpleGamificationService;
