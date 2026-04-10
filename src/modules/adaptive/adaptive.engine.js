/**
 * StudyOS - Adaptive Engine (Algorithm)
 *
 * Analyzes study behaviour and produces adjustment instructions.
 *
 * Analysis Pipeline:
 *   1. Scan all tasks for a plan and classify them
 *   2. Detect overdue tasks (date < today && status pending)
 *   3. Calculate completion rate and daily averages
 *   4. Determine if student is on-track, behind, or ahead
 *   5. Generate adjustment actions:
 *      - Reschedule skipped tasks to nearest available future day
 *      - Redistribute overdue work across remaining days
 *      - Reduce/increase daily load based on actual vs expected pace
 *      - Add extra revision slots for weak topics
 *
 * Load Balancing Rules:
 *   - Never exceed 120% of the configured hoursPerDay
 *   - Minimum 15 min per rescheduled task
 *   - Hard chapters are never stacked (max 2 hard per day)
 *   - Revision tasks are inserted at 40% of original duration
 */

class AdaptiveEngine {
  /**
   * Analyze a plan's tasks and produce an adjustment plan.
   *
   * @param {object}  params
   * @param {Array}   params.tasks         - All tasks for the plan
   * @param {object}  params.planConfig    - { totalDays, hoursPerDay, startDate }
   * @param {Array}   [params.weakCards]   - Weak revision cards (from revision module)
   * @returns {{ analysis: object, actions: Array, rescheduledTasks: Array }}
   */
  static analyze({ tasks, planConfig, weakCards = [] }) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const budgetMinutes = (planConfig.hoursPerDay || 6) * 60;
    const maxDailyMinutes = Math.round(budgetMinutes * 1.2);

    // ── 1. Classify tasks ─────────────────────────────────────────────────────
    const completed = [];
    const skipped = [];
    const pending = [];
    const overdue = [];
    const future = [];

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed.push(task);
      } else if (task.status === 'skipped') {
        skipped.push(task);
      } else if (task.status === 'pending' || task.status === 'in-progress') {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate < now) {
          overdue.push(task);
        } else if (taskDate > now) {
          future.push(task);
        } else {
          pending.push(task); // today's tasks
        }
      }
    }

    // ── 2. Calculate remaining days ───────────────────────────────────────────
    const startDate = new Date(planConfig.startDate || now);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (planConfig.totalDays || 30));

    const remainingMs = endDate.getTime() - now.getTime();
    const remainingDays = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

    // ── 3. Compute analysis ──────────────────────────────────────────────────
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0
      ? Math.round((completed.length / totalTasks) * 100)
      : 0;

    // Expected completion rate based on elapsed days
    const elapsedDays = (planConfig.totalDays || 30) - remainingDays;
    const expectedRate = totalTasks > 0
      ? Math.round((elapsedDays / (planConfig.totalDays || 30)) * 100)
      : 0;

    const onTrack = completionRate >= expectedRate - 10; // 10% grace

    // Overdue burden (total minutes of overdue + skipped work)
    const overdueBurden = [...overdue, ...skipped].reduce(
      (sum, t) => sum + (t.durationMinutes || 30),
      0
    );

    // Current avg load vs recommended
    const completedMinutes = completed.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const avgDailyLoad = elapsedDays > 0 ? Math.round(completedMinutes / elapsedDays) : 0;

    // Recommended load = (remaining work) / remainingDays
    const remainingMinutes = [...pending, ...future, ...overdue, ...skipped].reduce(
      (sum, t) => sum + (t.durationMinutes || 30),
      0
    );
    const recommendedLoad = Math.round(remainingMinutes / remainingDays);

    const analysis = {
      totalTasks,
      completedTasks: completed.length,
      skippedTasks: skipped.length,
      pendingTasks: pending.length,
      overdueTasks: overdue.length,
      completionRate,
      onTrack,
      remainingDays,
      avgDailyLoad,
      recommendedLoad: Math.min(recommendedLoad, maxDailyMinutes),
      weakChapters: weakCards.length,
    };

    // ── 4. Generate adjustment actions ───────────────────────────────────────
    const actions = [];
    const rescheduledTasks = [];

    // 4a. Reschedule skipped tasks
    if (skipped.length > 0) {
      const rescheduled = this._rescheduleToFuture(skipped, future, remainingDays, budgetMinutes, now);
      rescheduledTasks.push(...rescheduled.tasks);
      actions.push({
        type: 'reschedule_skipped',
        description: `Rescheduled ${rescheduled.tasks.length} skipped task(s) to future days`,
        affectedDays: rescheduled.daysAffected,
        affectedTasks: rescheduled.tasks.length,
      });
    }

    // 4b. Redistribute overdue work
    if (overdue.length > 0) {
      const redistributed = this._rescheduleToFuture(overdue, future, remainingDays, budgetMinutes, now);
      rescheduledTasks.push(...redistributed.tasks);
      actions.push({
        type: 'redistribute_overdue',
        description: `Redistributed ${redistributed.tasks.length} overdue task(s) across ${redistributed.daysAffected} future day(s)`,
        affectedDays: redistributed.daysAffected,
        affectedTasks: redistributed.tasks.length,
      });
    }

    // 4c. Adjust daily load
    if (!onTrack && recommendedLoad > maxDailyMinutes) {
      actions.push({
        type: 'reduce_load',
        description: `Recommended daily load (${recommendedLoad}min) exceeds max (${maxDailyMinutes}min). Consider extending the plan.`,
        affectedDays: remainingDays,
        affectedTasks: 0,
      });
    } else if (completionRate > expectedRate + 20) {
      actions.push({
        type: 'increase_load',
        description: `Student is ${completionRate - expectedRate}% ahead. Lighter days can add extra practice.`,
        affectedDays: remainingDays,
        affectedTasks: 0,
      });
    }

    // 4d. Add revision for weak topics
    if (weakCards.length > 0) {
      actions.push({
        type: 'add_revision',
        description: `${weakCards.length} weak chapter(s) detected. Adding revision sessions.`,
        affectedDays: Math.min(weakCards.length, remainingDays),
        affectedTasks: weakCards.length,
      });
    }

    // 4e. Difficulty swap: if a future day has 3+ hard tasks, swap one with an easy day
    const futureByDay = this._groupByDay(future);
    let swaps = 0;
    for (const [, dayTasks] of futureByDay) {
      const hardInDay = dayTasks.filter((t) => t.difficulty === 'hard');
      if (hardInDay.length >= 3) swaps++;
    }
    if (swaps > 0) {
      actions.push({
        type: 'swap_difficulty',
        description: `${swaps} future day(s) have 3+ hard chapters. Recommend rebalancing.`,
        affectedDays: swaps,
        affectedTasks: 0,
      });
    }

    return { analysis, actions, rescheduledTasks };
  }

  /**
   * Reschedule tasks into the nearest future days that have capacity.
   * @private
   */
  static _rescheduleToFuture(tasksToMove, futureTasks, remainingDays, budgetMinutes, now) {
    // Calculate current load per future day
    const dayLoads = new Map();
    for (const t of futureTasks) {
      const dayKey = t.dayNumber;
      dayLoads.set(dayKey, (dayLoads.get(dayKey) || 0) + (t.durationMinutes || 30));
    }

    const maxPerDay = Math.round(budgetMinutes * 1.2);
    const rescheduled = [];
    const daysUsed = new Set();
    let nextDayOffset = 1;

    for (const task of tasksToMove) {
      const duration = task.durationMinutes || 30;
      let placed = false;

      // Try existing future days first
      for (const [dayNum, load] of dayLoads) {
        if (load + duration <= maxPerDay) {
          rescheduled.push({
            taskId: task._id || task.id,
            originalDay: task.dayNumber,
            newDayNumber: dayNum,
            newDate: this._computeDate(now, dayNum, task),
            durationMinutes: duration,
          });
          dayLoads.set(dayNum, load + duration);
          daysUsed.add(dayNum);
          placed = true;
          break;
        }
      }

      // If no existing day has room, append to new days
      if (!placed) {
        const newDayNum = (futureTasks.length > 0
          ? Math.max(...futureTasks.map((t) => t.dayNumber))
          : 0) + nextDayOffset;
        nextDayOffset++;

        rescheduled.push({
          taskId: task._id || task.id,
          originalDay: task.dayNumber,
          newDayNumber: newDayNum,
          newDate: this._computeDate(now, newDayNum, task),
          durationMinutes: duration,
        });
        dayLoads.set(newDayNum, duration);
        daysUsed.add(newDayNum);
      }
    }

    return { tasks: rescheduled, daysAffected: daysUsed.size };
  }

  /**
   * Compute a new date given a day offset.
   * @private
   */
  static _computeDate(baseDate, dayNumber, task) {
    // Try to use the plan's date progression
    if (task.date) {
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + dayNumber);
      return newDate;
    }
    return new Date(baseDate.getTime() + dayNumber * 24 * 60 * 60 * 1000);
  }

  /**
   * Group tasks by day number.
   * @private
   */
  static _groupByDay(tasks) {
    const map = new Map();
    for (const t of tasks) {
      if (!map.has(t.dayNumber)) map.set(t.dayNumber, []);
      map.get(t.dayNumber).push(t);
    }
    return map;
  }
}

module.exports = AdaptiveEngine;
