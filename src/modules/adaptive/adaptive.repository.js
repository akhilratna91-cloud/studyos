/**
 * StudyOS - Adaptive Repository (Data Access Layer)
 */

const AdaptiveLog = require('./adaptive.model');

class AdaptiveRepository {
  /**
   * Create an adjustment log entry.
   */
  static async create(data) {
    const log = await AdaptiveLog.create(data);
    return log.toJSON();
  }

  /**
   * Find all adjustment logs for a plan.
   */
  static async findByPlanId(userId, planId) {
    return AdaptiveLog.find({ userId, planId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find the latest adjustment for a plan.
   */
  static async findLatest(userId, planId) {
    return AdaptiveLog.findOne({ userId, planId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find all adjustment logs for a user.
   */
  static async findByUserId(userId) {
    return AdaptiveLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Find log by ID with ownership check.
   */
  static async findByIdAndUser(id, userId) {
    return AdaptiveLog.findOne({ _id: id, userId }).exec();
  }

  /**
   * Count adjustments for a plan.
   */
  static async countByPlan(userId, planId) {
    return AdaptiveLog.countDocuments({ userId, planId });
  }

  /**
   * Delete all logs for a plan.
   */
  static async deleteByPlanId(planId) {
    return AdaptiveLog.deleteMany({ planId });
  }
}

module.exports = AdaptiveRepository;
