/**
 * StudyOS - StudyPlan Repository (Data Access Layer)
 */

const StudyPlan = require('./studyplan.model');

class StudyPlanRepository {
  /**
   * Create a new study plan.
   */
  static async create(data) {
    const plan = await StudyPlan.create(data);
    return plan.toJSON();
  }

  /**
   * Find all plans for a user.
   */
  static async findByUserId(userId, filters = {}) {
    const query = { userId };
    if (filters.status) query.status = filters.status;
    if (filters.examId) query.examId = filters.examId;
    return StudyPlan.find(query)
      .populate('examId', 'name slug category')
      .sort({ createdAt: -1 })
      .select('-schedule')  // exclude heavy schedule array for listing
      .exec();
  }

  /**
   * Find plan by ID.
   */
  static async findById(id) {
    return StudyPlan.findById(id)
      .populate('examId', 'name slug category')
      .exec();
  }

  /**
   * Find plan by ID (owner check).
   */
  static async findByIdAndUser(id, userId) {
    return StudyPlan.findOne({ _id: id, userId })
      .populate('examId', 'name slug category')
      .exec();
  }

  /**
   * Update plan by ID.
   */
  static async updateById(id, updateData) {
    return StudyPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete plan by ID.
   */
  static async deleteById(id) {
    return StudyPlan.findByIdAndDelete(id).exec();
  }

  /**
   * Count plans for a user.
   */
  static async countByUserId(userId) {
    return StudyPlan.countDocuments({ userId });
  }

  /**
   * Get a single day from a plan's schedule.
   */
  static async getDayFromPlan(planId, dayNumber) {
    const plan = await StudyPlan.findById(planId)
      .select('schedule userId')
      .exec();
    if (!plan) return null;
    const day = plan.schedule.find((d) => d.dayNumber === dayNumber);
    return { day: day || null, userId: plan.userId };
  }
}

module.exports = StudyPlanRepository;
