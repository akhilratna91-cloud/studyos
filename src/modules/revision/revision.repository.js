/**
 * StudyOS - Revision Repository (Data Access Layer)
 */

const RevisionCard = require('./revision.model');

class RevisionRepository {
  /**
   * Create a revision card.
   */
  static async create(data) {
    const card = await RevisionCard.create(data);
    return card.toJSON();
  }

  /**
   * Bulk create cards.
   */
  static async bulkCreate(cards) {
    const result = await RevisionCard.insertMany(cards, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find card by user + chapter (unique pair).
   */
  static async findByUserAndChapter(userId, chapterId) {
    return RevisionCard.findOne({ userId, chapterId }).exec();
  }

  /**
   * Find all cards for a user.
   */
  static async findByUserId(userId, filters = {}) {
    const query = { userId };
    if (filters.examId) query.examId = filters.examId;
    if (filters.status) query.status = filters.status;
    if (filters.isWeak !== undefined) query.isWeak = filters.isWeak;
    return RevisionCard.find(query).sort({ nextReviewAt: 1 }).exec();
  }

  /**
   * Find cards due for review (nextReviewAt <= now).
   */
  static async findDueCards(userId, examId = null) {
    const query = {
      userId,
      nextReviewAt: { $lte: new Date() },
      status: { $ne: 'mastered' },
    };
    if (examId) query.examId = examId;
    return RevisionCard.find(query)
      .sort({ isWeak: -1, interval: 1, nextReviewAt: 1 })
      .exec();
  }

  /**
   * Find weak cards for a user.
   */
  static async findWeakCards(userId, examId = null) {
    const query = { userId, isWeak: true };
    if (examId) query.examId = examId;
    return RevisionCard.find(query).sort({ interval: 1 }).exec();
  }

  /**
   * Find card by ID.
   */
  static async findById(id) {
    return RevisionCard.findById(id).exec();
  }

  /**
   * Find card by ID with owner check.
   */
  static async findByIdAndUser(id, userId) {
    return RevisionCard.findOne({ _id: id, userId }).exec();
  }

  /**
   * Update card by ID.
   */
  static async updateById(id, updateData) {
    return RevisionCard.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Push a history entry to a card.
   */
  static async pushHistory(id, historyEntry) {
    return RevisionCard.findByIdAndUpdate(
      id,
      { $push: { reviewHistory: { $each: [historyEntry], $slice: -100 } } },
      { new: true }
    ).exec();
  }

  /**
   * Delete card by ID.
   */
  static async deleteById(id) {
    return RevisionCard.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all cards for a user's exam.
   */
  static async deleteByUserAndExam(userId, examId) {
    return RevisionCard.deleteMany({ userId, examId });
  }

  /**
   * Count cards by status for a user.
   */
  static async countByStatus(userId, examId = null) {
    const match = { userId };
    if (examId) match.examId = examId;
    return RevisionCard.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = RevisionRepository;
