/**
 * StudyOS - Extra Service
 * 
 * Logic simple implementations matching utility requirements mapping:
 * mark_day_complete, get_calendar, create_notification, get_notifications, 
 * save_session, get_sessions.
 */

const { SimpleCalendar, SimpleNotification, SimpleSession } = require('./extra.model');
const mongoose = require('mongoose');

class ExtraService {

  // ────────────────────────────────────────────────────────────────────────────────
  // CALENDAR FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────

  static async markDayComplete(userId, dateObj) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    // Format to simple YYYY-MM-DD
    const d = new Date(dateObj);
    const dateString = d.toISOString().split('T')[0];

    // Find or create the entry, marking it completed
    const record = await SimpleCalendar.findOneAndUpdate(
      { userId: objectUserId, dateString },
      { $set: { completed: true, date: d } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return record;
  }

  static async getCalendar(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const records = await SimpleCalendar.find({ userId: objectUserId }).sort({ date: -1 }).lean();
    return records;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // NOTIFICATION FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────

  static async createNotification(userId, message) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    const notification = await SimpleNotification.create({
      userId: objectUserId,
      message
    });

    return notification;
  }

  static async getNotifications(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    // Fetch latest 20 notifications 
    const notifications = await SimpleNotification.find({ userId: objectUserId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return notifications;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // SESSION FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────

  static async saveSession(userId, durationMinutes) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    
    const session = await SimpleSession.create({
      userId: objectUserId,
      durationMinutes
    });

    // Optionally trigger a study completion notification natively
    await this.createNotification(userId, `Completed a ${durationMinutes} minute study session!`);

    return session;
  }

  static async getSessions(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const sessions = await SimpleSession.find({ userId: objectUserId })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();
    return sessions;
  }

}

module.exports = ExtraService;
