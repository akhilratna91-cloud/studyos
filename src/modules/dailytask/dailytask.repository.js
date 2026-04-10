/**
 * StudyOS - DailyTask Repository (Data Access Layer)
 */

const DailyTask = require('./dailytask.model');

class DailyTaskRepository {
  /**
   * Bulk insert tasks.
   */
  static async bulkCreate(tasks) {
    const result = await DailyTask.insertMany(tasks, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find tasks for a user on a specific date.
   */
  static async findByUserAndDate(userId, date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return DailyTask.find({
      userId,
      date: { $gte: start, $lte: end },
    })
      .sort({ sortOrder: 1 })
      .exec();
  }

  /**
   * Find tasks for a user, plan, and day number.
   */
  static async findByPlanAndDay(userId, planId, dayNumber) {
    return DailyTask.find({ userId, planId, dayNumber })
      .sort({ sortOrder: 1 })
      .exec();
  }

  /**
   * Find all tasks for a plan.
   */
  static async findByPlanId(userId, planId) {
    return DailyTask.find({ userId, planId })
      .sort({ dayNumber: 1, sortOrder: 1 })
      .exec();
  }

  /**
   * Find task by ID.
   */
  static async findById(id) {
    return DailyTask.findById(id).exec();
  }

  /**
   * Find task by ID with ownership check.
   */
  static async findByIdAndUser(id, userId) {
    return DailyTask.findOne({ _id: id, userId }).exec();
  }

  /**
   * Update task by ID.
   */
  static async updateById(id, updateData) {
    return DailyTask.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete all tasks for a plan.
   */
  static async deleteByPlanId(planId) {
    return DailyTask.deleteMany({ planId });
  }

  /**
   * Delete task by ID.
   */
  static async deleteById(id) {
    return DailyTask.findByIdAndDelete(id).exec();
  }

  /**
   * Count tasks by status for a plan.
   */
  static async countByPlanAndStatus(userId, planId) {
    return DailyTask.aggregate([
      { $match: { userId, planId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /**
   * Get today's tasks for a user.
   */
  static async findTodayTasks(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return DailyTask.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ sortOrder: 1 })
      .exec();
  }

  /**
   * Get summary stats for a user's tasks across all plans.
   */
  static async getUserStats(userId) {
    return DailyTask.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          skippedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] },
          },
          totalMinutes: { $sum: '$durationMinutes' },
          completedMinutes: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0],
            },
          },
        },
      },
    ]);
  }
}

module.exports = DailyTaskRepository;
