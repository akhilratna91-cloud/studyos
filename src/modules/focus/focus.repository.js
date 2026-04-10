/**
 * StudyOS - Focus Repository (Data Access Layer)
 */

const FocusSession = require('./focus.model');

class FocusRepository {
  static async create(data) {
    const session = await FocusSession.create(data);
    return session.toJSON();
  }

  static async findById(id) {
    return FocusSession.findById(id).exec();
  }

  static async findByIdAndUser(id, userId) {
    return FocusSession.findOne({ _id: id, userId }).exec();
  }

  static async findActiveSession(userId) {
    return FocusSession.findOne({
      userId,
      status: { $in: ['active', 'paused', 'break'] },
    }).sort({ startedAt: -1 }).exec();
  }

  static async updateById(id, data) {
    return FocusSession.findByIdAndUpdate(id, data, {
      new: true, runValidators: true,
    }).exec();
  }

  static async findRecent(userId, limit = 20) {
    return FocusSession.find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();
  }

  static async getTodayStats(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return FocusSession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          startedAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          totalWorkMinutes: { $sum: '$totalWorkMinutes' },
          totalBreakMinutes: { $sum: '$totalBreakMinutes' },
          completedCycles: { $sum: '$completedCycles' },
          totalDistractions: { $sum: '$distractions' },
          avgFocusRating: { $avg: '$focusRating' },
        },
      },
    ]);
  }

  static async getStats(userId, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return FocusSession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          startedAt: { $gte: cutoff },
        },
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          totalWorkMinutes: { $sum: '$totalWorkMinutes' },
          totalBreakMinutes: { $sum: '$totalBreakMinutes' },
          completedCycles: { $sum: '$completedCycles' },
          totalDistractions: { $sum: '$distractions' },
          avgFocusRating: { $avg: '$focusRating' },
          avgWorkPerSession: { $avg: '$totalWorkMinutes' },
          longestSession: { $max: '$totalWorkMinutes' },
        },
      },
    ]);
  }

  static async getDailyFocusTime(userId, days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return FocusSession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          startedAt: { $gte: cutoff },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          workMinutes: { $sum: '$totalWorkMinutes' },
          cycles: { $sum: '$completedCycles' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

module.exports = FocusRepository;
