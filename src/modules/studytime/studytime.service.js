/**
 * StudyOS - StudyTime Service
 *
 * Time intelligence layer — aggregates from StudySession + FocusSession.
 *
 * Features:
 *   1. Total study time (daily/weekly/monthly/all-time)
 *   2. Time goals (set target, track against real data)
 *   3. Peak hours analysis (what hours you study most)
 *   4. Day-of-week patterns (which days are strongest)
 *   5. Subject time allocation (actual vs balanced ideal)
 *   6. Calendar view (per-day summary for date picker UI)
 *   7. Time comparison (this period vs last period)
 */

const mongoose = require('mongoose');
const StudyGoal = require('./studytime.model');
const StudySession = require('../progress/progress.model');
const FocusSession = require('../focus/focus.model');

class StudyTimeService {
  // ───────────────────────────────────────────────────────────────────────────────
  // TOTAL STUDY TIME
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get total study time stats — today, this week, this month, all-time.
   */
  static async getTotals(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayData, weekData, monthData, allTimeData] = await Promise.all([
      this._getTimeRange(objectUserId, todayStart, now),
      this._getTimeRange(objectUserId, weekStart, now),
      this._getTimeRange(objectUserId, monthStart, now),
      this._getTimeRange(objectUserId, new Date(0), now),
    ]);

    return {
      today: todayData,
      thisWeek: weekData,
      thisMonth: monthData,
      allTime: allTimeData,
    };
  }

  /**
   * @private Aggregate study time from both session types.
   */
  static async _getTimeRange(userId, startDate, endDate) {
    const match = { userId, status: 'completed', startedAt: { $gte: startDate, $lte: endDate } };

    const [studySessions, focusSessions] = await Promise.all([
      StudySession.aggregate([
        { $match: match },
        { $group: { _id: null, minutes: { $sum: '$actualMinutes' }, count: { $sum: 1 } } },
      ]),
      FocusSession.aggregate([
        { $match: match },
        { $group: { _id: null, minutes: { $sum: '$totalWorkMinutes' }, count: { $sum: 1 } } },
      ]),
    ]);

    const ss = studySessions[0] || { minutes: 0, count: 0 };
    const fs = focusSessions[0] || { minutes: 0, count: 0 };

    const totalMinutes = ss.minutes + fs.minutes;
    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      sessions: ss.count + fs.count,
      studySessions: ss.count,
      focusSessions: fs.count,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // GOALS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Set a study time goal.
   */
  static async setGoal(userId, periodType, targetMinutes) {
    const now = new Date();
    const { start, end } = this._getPeriodBounds(now, periodType);

    // Deactivate previous goals of same type
    await StudyGoal.updateMany(
      { userId, periodType, isActive: true },
      { $set: { isActive: false } }
    );

    // Get actual time for current period
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const timeData = await this._getTimeRange(objectUserId, start, now);

    const goal = await StudyGoal.create({
      userId,
      periodType,
      targetMinutes,
      actualMinutes: timeData.totalMinutes,
      periodStart: start,
      periodEnd: end,
      achieved: timeData.totalMinutes >= targetMinutes,
    });

    return goal.toJSON();
  }

  /**
   * Get active goals with current progress.
   */
  static async getGoals(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const goals = await StudyGoal.find({ userId, isActive: true }).exec();
    const now = new Date();

    const result = [];
    for (const goal of goals) {
      const timeData = await this._getTimeRange(objectUserId, goal.periodStart, now);
      const achieved = timeData.totalMinutes >= goal.targetMinutes;
      const progressPercent = goal.targetMinutes > 0
        ? Math.min(100, Math.round((timeData.totalMinutes / goal.targetMinutes) * 100))
        : 0;

      // Update stored actual
      goal.actualMinutes = timeData.totalMinutes;
      goal.achieved = achieved;
      await goal.save();

      result.push({
        id: goal._id,
        periodType: goal.periodType,
        targetMinutes: goal.targetMinutes,
        targetHours: Math.round((goal.targetMinutes / 60) * 10) / 10,
        actualMinutes: timeData.totalMinutes,
        actualHours: timeData.totalHours,
        progressPercent,
        achieved,
        remainingMinutes: Math.max(0, goal.targetMinutes - timeData.totalMinutes),
        periodStart: goal.periodStart,
        periodEnd: goal.periodEnd,
      });
    }

    return result;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // PEAK HOURS ANALYSIS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Analyze which hours of the day the student studies most.
   */
  static async getPeakHours(userId, days = 30) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

    const hourData = await StudySession.aggregate([
      {
        $match: { userId: objectUserId, status: 'completed', startedAt: { $gte: cutoff } },
      },
      {
        $group: {
          _id: { $hour: '$startedAt' },
          minutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Also aggregate focus sessions
    const focusHourData = await FocusSession.aggregate([
      {
        $match: { userId: objectUserId, status: 'completed', startedAt: { $gte: cutoff } },
      },
      {
        $group: {
          _id: { $hour: '$startedAt' },
          minutes: { $sum: '$totalWorkMinutes' },
          sessions: { $sum: 1 },
        },
      },
    ]);

    // Merge both datasets
    const hourMap = new Map();
    for (let h = 0; h < 24; h++) {
      hourMap.set(h, { hour: h, minutes: 0, sessions: 0 });
    }

    for (const d of hourData) {
      const entry = hourMap.get(d._id);
      entry.minutes += d.minutes;
      entry.sessions += d.sessions;
    }
    for (const d of focusHourData) {
      const entry = hourMap.get(d._id);
      entry.minutes += d.minutes;
      entry.sessions += d.sessions;
    }

    const hours = Array.from(hourMap.values()).map((h) => ({
      hour: h.hour,
      label: `${h.hour.toString().padStart(2, '0')}:00`,
      totalMinutes: h.minutes,
      sessions: h.sessions,
      intensity: this._intensityLevel(h.minutes),
    }));

    // Find peak hour
    const peak = hours.reduce((max, h) => h.totalMinutes > max.totalMinutes ? h : max, hours[0]);

    // Classify time blocks
    const blocks = {
      earlyMorning: hours.filter((h) => h.hour >= 5 && h.hour < 9).reduce((s, h) => s + h.totalMinutes, 0),
      morning: hours.filter((h) => h.hour >= 9 && h.hour < 12).reduce((s, h) => s + h.totalMinutes, 0),
      afternoon: hours.filter((h) => h.hour >= 12 && h.hour < 17).reduce((s, h) => s + h.totalMinutes, 0),
      evening: hours.filter((h) => h.hour >= 17 && h.hour < 21).reduce((s, h) => s + h.totalMinutes, 0),
      night: hours.filter((h) => h.hour >= 21 || h.hour < 5).reduce((s, h) => s + h.totalMinutes, 0),
    };

    const bestBlock = Object.entries(blocks).reduce((best, [name, min]) =>
      min > best[1] ? [name, min] : best, ['', 0]
    );

    return {
      hours,
      peakHour: peak,
      timeBlocks: blocks,
      bestTimeBlock: bestBlock[0],
      recommendation: this._getTimeRecommendation(bestBlock[0]),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DAY-OF-WEEK PATTERNS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Which days of the week you study most.
   */
  static async getDayPatterns(userId, days = 30) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

    const dayData = await StudySession.aggregate([
      { $match: { userId: objectUserId, status: 'completed', startedAt: { $gte: cutoff } } },
      {
        $group: {
          _id: { $dayOfWeek: '$startedAt' }, // 1=Sun, 7=Sat
          minutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = dayNames.map((name, i) => {
      const found = dayData.find((d) => d._id === i + 1);
      return {
        dayOfWeek: i,
        name,
        shortName: name.substring(0, 3),
        totalMinutes: found ? found.minutes : 0,
        totalHours: found ? Math.round((found.minutes / 60) * 10) / 10 : 0,
        sessions: found ? found.sessions : 0,
      };
    });

    const strongest = result.reduce((max, d) => d.totalMinutes > max.totalMinutes ? d : max, result[0]);
    const weakest = result.reduce((min, d) => d.totalMinutes < min.totalMinutes ? d : min, result[0]);

    return {
      days: result,
      strongestDay: strongest.name,
      weakestDay: weakest.name,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CALENDAR VIEW
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get calendar data (per-day summary) for a month.
   */
  static async getCalendar(userId, year, month) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const dailyData = await StudySession.aggregate([
      {
        $match: { userId: objectUserId, status: 'completed', startedAt: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          minutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill all days of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const found = dailyData.find((dd) => dd._id === dateStr);
      calendar.push({
        date: dateStr,
        day: d,
        minutes: found ? found.minutes : 0,
        hours: found ? Math.round((found.minutes / 60) * 10) / 10 : 0,
        sessions: found ? found.sessions : 0,
        avgRating: found ? Math.round((found.avgRating || 0) * 10) / 10 : 0,
        hasStudy: found ? found.minutes > 0 : false,
      });
    }

    const totalMinutes = calendar.reduce((s, d) => s + d.minutes, 0);
    const daysStudied = calendar.filter((d) => d.hasStudy).length;

    return {
      year,
      month,
      calendar,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      daysStudied,
      daysInMonth,
      studyRate: Math.round((daysStudied / daysInMonth) * 100),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SUBJECT TIME ALLOCATION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * How time is distributed across subjects.
   */
  static async getSubjectAllocation(userId, days = 30) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

    const subjectData = await StudySession.aggregate([
      { $match: { userId: objectUserId, status: 'completed', startedAt: { $gte: cutoff } } },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          minutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { minutes: -1 } },
    ]);

    const totalMinutes = subjectData.reduce((s, d) => s + d.minutes, 0);

    return subjectData.map((s) => ({
      subjectId: s._id,
      subjectName: s.subjectName || 'Other',
      subjectIcon: s.subjectIcon || '📘',
      totalMinutes: s.minutes,
      totalHours: Math.round((s.minutes / 60) * 10) / 10,
      sessions: s.sessions,
      percentageOfTotal: totalMinutes > 0 ? Math.round((s.minutes / totalMinutes) * 100) : 0,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────────────────────

  /** @private */
  static _getPeriodBounds(date, type) {
    const start = new Date(date);
    const end = new Date(date);

    switch (type) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        start.setDate(date.getDate() - date.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    return { start, end };
  }

  /** @private */
  static _intensityLevel(minutes) {
    if (minutes === 0) return 0;
    if (minutes < 15) return 1;
    if (minutes < 45) return 2;
    if (minutes < 90) return 3;
    return 4;
  }

  /** @private */
  static _getTimeRecommendation(block) {
    const recs = {
      earlyMorning: 'You\'re a morning person! Schedule tough subjects (Math, Physics) first thing.',
      morning: 'Late morning is your peak. Use 9–12 for deep study sessions.',
      afternoon: 'Afternoon focus is strong. Avoid heavy meals to maintain it.',
      evening: 'Evening studier! Use Focus mode to minimize distractions.',
      night: 'Night owl! Be careful about sleep — try shifting some sessions earlier.',
    };
    return recs[block] || 'Study consistently across different time blocks.';
  }
}

module.exports = StudyTimeService;
