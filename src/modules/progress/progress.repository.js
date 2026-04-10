/**
 * StudyOS - Progress Repository (Data Access Layer)
 */

const StudySession = require('./progress.model');

class ProgressRepository {
  /**
   * Create a session.
   */
  static async create(data) {
    const session = await StudySession.create(data);
    return session.toJSON();
  }

  /**
   * Find session by ID.
   */
  static async findById(id) {
    return StudySession.findById(id).exec();
  }

  /**
   * Find session by ID with ownership check.
   */
  static async findByIdAndUser(id, userId) {
    return StudySession.findOne({ _id: id, userId }).exec();
  }

  /**
   * Find active session for a user (only one at a time).
   */
  static async findActiveSession(userId) {
    return StudySession.findOne({ userId, status: 'active' })
      .sort({ startedAt: -1 })
      .exec();
  }

  /**
   * Update session by ID.
   */
  static async updateById(id, updateData) {
    return StudySession.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Find recent sessions for a user.
   */
  static async findRecentSessions(userId, limit = 20) {
    return StudySession.find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get study time by date range.
   */
  static async getStudyTimeByRange(userId, startDate, endDate) {
    return StudySession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          startedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startedAt' },
          },
          totalMinutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get study time by subject.
   */
  static async getStudyTimeBySubject(userId, examId = null) {
    const match = { userId, status: 'completed' };
    if (examId) match.examId = examId;

    return StudySession.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          subjectColor: { $first: '$subjectColor' },
          totalMinutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { totalMinutes: -1 } },
    ]);
  }

  /**
   * Get streak data — distinct dates with completed sessions.
   */
  static async getStudyDates(userId, days = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return StudySession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          startedAt: { $gte: cutoff },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startedAt' },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);
  }

  /**
   * Get total summary stats.
   */
  static async getTotalStats(userId) {
    return StudySession.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: '$actualMinutes' },
          avgMinutesPerSession: { $avg: '$actualMinutes' },
          avgRating: { $avg: '$rating' },
          bestDay: { $max: '$actualMinutes' },
        },
      },
    ]);
  }
}

module.exports = ProgressRepository;
