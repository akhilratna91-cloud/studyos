/**
 * StudyOS - Today Dashboard Service
 *
 * Aggregates data from multiple modules to build a complete
 * "What to do today" view for the student dashboard.
 *
 * Pulls from:
 *   - DailyTask   → today's study tasks
 *   - Revision    → due revision cards
 *   - StudyPlan   → active plan context
 *   - Adaptive    → latest adjustment summary
 *
 * Returns a single unified response for the frontend dashboard.
 */

const DailyTask = require('../dailytask/dailytask.model');
const RevisionCard = require('../revision/revision.model');
const StudyPlan = require('../studyplan/studyplan.model');
const AdaptiveLog = require('../adaptive/adaptive.model');

class TodayService {
  /**
   * Get the complete today dashboard for a user.
   *
   * @param {string} userId
   * @param {string} [timezone] - IANA timezone (e.g. 'Asia/Kolkata') for date calc
   * @returns {Promise<object>} Full dashboard data
   */
  static async getDashboard(userId) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // ── Parallel fetch everything ───────────────────────────────────────────
    const [
      todayTasks,
      dueRevisions,
      activePlans,
      allUserTasks,
    ] = await Promise.all([
      // 1. Today's study tasks
      DailyTask.find({
        userId,
        date: { $gte: todayStart, $lte: todayEnd },
      }).sort({ sortOrder: 1 }).exec(),

      // 2. Due revision cards
      RevisionCard.find({
        userId,
        nextReviewAt: { $lte: todayEnd },
        status: { $ne: 'mastered' },
      }).sort({ isWeak: -1, interval: 1 }).limit(15).exec(),

      // 3. Active study plans
      StudyPlan.find({
        userId,
        status: 'active',
      }).select('title examId config stats').populate('examId', 'name slug').exec(),

      // 4. All tasks for progress (lightweight aggregate)
      DailyTask.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            minutes: { $sum: '$durationMinutes' },
          },
        },
      ]),
    ]);

    // ── Build task summary ──────────────────────────────────────────────────
    const tasksByStatus = { pending: [], inProgress: [], completed: [], skipped: [] };
    let todayTotalMinutes = 0;
    let todayCompletedMinutes = 0;

    for (const task of todayTasks) {
      const t = task.toJSON();
      const key = t.status === 'in-progress' ? 'inProgress' : t.status;
      if (tasksByStatus[key]) tasksByStatus[key].push(t);
      todayTotalMinutes += t.durationMinutes || 0;
      if (t.status === 'completed') todayCompletedMinutes += t.durationMinutes || 0;
    }

    const todayProgress = {
      totalTasks: todayTasks.length,
      completed: tasksByStatus.completed.length,
      inProgress: tasksByStatus.inProgress.length,
      pending: tasksByStatus.pending.length,
      skipped: tasksByStatus.skipped.length,
      totalMinutes: todayTotalMinutes,
      completedMinutes: todayCompletedMinutes,
      completionRate: todayTasks.length > 0
        ? Math.round((tasksByStatus.completed.length / todayTasks.length) * 100)
        : 0,
    };

    // ── Build revision summary ──────────────────────────────────────────────
    const revisionCards = dueRevisions.map((c) => ({
      id: c._id,
      chapterName: c.chapterName,
      chapterSlug: c.chapterSlug,
      subjectName: c.subjectName,
      subjectIcon: c.subjectIcon,
      subjectColor: c.subjectColor,
      difficulty: c.difficulty,
      isWeak: c.isWeak,
      status: c.status,
      interval: c.interval,
      streakCount: c.streakCount,
      reviewCount: c.reviewCount,
    }));

    const revisionSummary = {
      dueCount: revisionCards.length,
      weakCount: revisionCards.filter((c) => c.isWeak).length,
      cards: revisionCards,
    };

    // ── Build overall progress ──────────────────────────────────────────────
    const overallProgress = {
      totalTasks: 0,
      completedTasks: 0,
      skippedTasks: 0,
      totalHours: 0,
      completedHours: 0,
      completionRate: 0,
    };

    for (const row of allUserTasks) {
      overallProgress.totalTasks += row.count;
      if (row._id === 'completed') {
        overallProgress.completedTasks = row.count;
        overallProgress.completedHours = Math.round((row.minutes / 60) * 10) / 10;
      }
      if (row._id === 'skipped') overallProgress.skippedTasks = row.count;
      overallProgress.totalHours += Math.round((row.minutes / 60) * 10) / 10;
    }

    overallProgress.completionRate = overallProgress.totalTasks > 0
      ? Math.round((overallProgress.completedTasks / overallProgress.totalTasks) * 100)
      : 0;

    // ── Build plan context ──────────────────────────────────────────────────
    const plans = activePlans.map((p) => {
      const plan = p.toJSON();
      const startDate = new Date(plan.config.startDate || plan.createdAt);
      const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const currentDay = Math.min(daysSinceStart, plan.config.totalDays);
      const daysRemaining = Math.max(0, plan.config.totalDays - daysSinceStart);
      const progressPercent = Math.round((currentDay / plan.config.totalDays) * 100);

      return {
        id: plan.id,
        title: plan.title,
        exam: plan.examId,
        currentDay,
        totalDays: plan.config.totalDays,
        daysRemaining,
        progressPercent,
        hoursPerDay: plan.config.hoursPerDay,
        stats: plan.stats,
      };
    });

    // ── Greeting & motivation ───────────────────────────────────────────────
    const hour = now.getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const motivationalMessages = [
      'Every expert was once a beginner. Keep going! 💪',
      'Small progress is still progress. You\'ve got this! 🚀',
      'Consistency beats intensity. Stay steady! 📚',
      'The best time to study was yesterday. The second best is now! ⏰',
      'Your future self will thank you for today\'s effort! 🌟',
      'Focus on progress, not perfection. 🎯',
      'One chapter at a time. You\'re building something great! 🏗️',
    ];
    const motivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return {
      greeting,
      motivation,
      date: now.toISOString(),
      today: {
        tasks: todayTasks.map((t) => t.toJSON()),
        progress: todayProgress,
      },
      revision: revisionSummary,
      plans,
      overall: overallProgress,
    };
  }

  /**
   * Get a lightweight summary (for widgets / quick-glance).
   */
  static async getQuickSummary(userId) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [taskCounts, revisionDue] = await Promise.all([
      DailyTask.aggregate([
        {
          $match: {
            userId,
            date: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            minutes: { $sum: '$durationMinutes' },
          },
        },
      ]),

      RevisionCard.countDocuments({
        userId,
        nextReviewAt: { $lte: todayEnd },
        status: { $ne: 'mastered' },
      }),
    ]);

    let totalTasks = 0;
    let completedTasks = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;

    for (const row of taskCounts) {
      totalTasks += row.count;
      totalMinutes += row.minutes;
      if (row._id === 'completed') {
        completedTasks = row.count;
        completedMinutes = row.minutes;
      }
    }

    return {
      date: now.toISOString(),
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        remaining: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      studyTime: {
        totalMinutes,
        completedMinutes,
        remainingMinutes: totalMinutes - completedMinutes,
      },
      revisionDue,
    };
  }

  /**
   * Get upcoming tasks for the next N days.
   */
  static async getUpcoming(userId, days = 7) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    const tasks = await DailyTask.find({
      userId,
      date: { $gte: now, $lt: endDate },
      status: { $in: ['pending', 'in-progress'] },
    })
      .sort({ date: 1, sortOrder: 1 })
      .exec();

    // Group by date
    const grouped = {};
    for (const task of tasks) {
      const dateKey = task.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          tasks: [],
          totalMinutes: 0,
        };
      }
      grouped[dateKey].tasks.push(task.toJSON());
      grouped[dateKey].totalMinutes += task.durationMinutes || 0;
    }

    const upcoming = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      days: upcoming,
      totalDays: upcoming.length,
      totalTasks: tasks.length,
    };
  }

  /**
   * Get overdue tasks (past-date, still pending).
   */
  static async getOverdue(userId) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tasks = await DailyTask.find({
      userId,
      date: { $lt: now },
      status: { $in: ['pending', 'in-progress'] },
    })
      .sort({ date: -1, sortOrder: 1 })
      .exec();

    const totalOverdueMinutes = tasks.reduce(
      (sum, t) => sum + (t.durationMinutes || 0),
      0
    );

    return {
      tasks: tasks.map((t) => t.toJSON()),
      total: tasks.length,
      totalOverdueMinutes,
      totalOverdueHours: Math.round((totalOverdueMinutes / 60) * 10) / 10,
    };
  }
}

module.exports = TodayService;
