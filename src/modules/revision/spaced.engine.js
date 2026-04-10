/**
 * StudyOS - Spaced Repetition Engine
 *
 * Implements a modified SM-2 (SuperMemo 2) algorithm for scheduling reviews.
 *
 * Quality scale (0–5):
 *   0 = Complete blackout, no recall
 *   1 = Wrong answer, but remembered upon seeing correct answer
 *   2 = Wrong answer, but correct answer seemed easy to recall
 *   3 = Correct answer, but required significant effort
 *   4 = Correct answer, with some hesitation
 *   5 = Perfect recall, instant answer
 *
 * Algorithm:
 *   If quality >= 3 (successful recall):
 *     - rep 0 → interval = 1 day
 *     - rep 1 → interval = 3 days
 *     - rep 2+ → interval = prevInterval × easeFactor
 *     - easeFactor += (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
 *     - easeFactor = max(1.3, easeFactor)
 *     - repetition++
 *
 *   If quality < 3 (failed recall):
 *     - repetition = 0
 *     - interval = 1 day (restart)
 *     - easeFactor unchanged
 *
 *   Status transitions:
 *     - new → learning (first review)
 *     - learning → review (interval >= 7)
 *     - review → mastered (interval >= 21 && streak >= 3)
 *     - Any → learning (if failed, quality < 3)
 */

class SpacedRepetitionEngine {
  /**
   * Process a review and compute the next scheduling state.
   *
   * @param {object} card - Current card state { easeFactor, interval, repetition, quality, reviewCount, streakCount }
   * @param {number} quality - Review quality (0–5)
   * @returns {object} New card state { easeFactor, interval, repetition, quality, status, nextReviewAt, isWeak, reviewCount, streakCount, historyEntry }
   */
  static processReview(card, quality) {
    let {
      easeFactor = 2.5,
      interval = 0,
      repetition = 0,
      reviewCount = 0,
      streakCount = 0,
    } = card;

    quality = Math.max(0, Math.min(5, Math.round(quality)));
    reviewCount++;

    let newInterval;
    let newRepetition;
    let newEaseFactor = easeFactor;
    let newStatus;
    let isWeak;

    if (quality >= 3) {
      // ── Successful recall ─────────────────────────────────────────────────
      if (repetition === 0) {
        newInterval = 1;
      } else if (repetition === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }

      // Update ease factor (SM-2 formula)
      newEaseFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      newEaseFactor = Math.max(1.3, newEaseFactor);

      newRepetition = repetition + 1;
      streakCount++;
      isWeak = false;

      // Determine status
      if (newInterval >= 21 && streakCount >= 3) {
        newStatus = 'mastered';
      } else if (newInterval >= 7) {
        newStatus = 'review';
      } else {
        newStatus = 'learning';
      }
    } else {
      // ── Failed recall ─────────────────────────────────────────────────────
      newRepetition = 0;
      newInterval = 1;     // come back tomorrow
      streakCount = 0;
      isWeak = true;
      newStatus = 'learning';
      // Don't change easeFactor on failure (SM-2 spec)
    }

    // Cap interval at 180 days
    newInterval = Math.min(newInterval, 180);

    // Compute next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
    nextReviewAt.setHours(0, 0, 0, 0); // normalize to start of day

    // History entry
    const historyEntry = {
      date: new Date(),
      quality,
      interval: newInterval,
    };

    return {
      easeFactor: Math.round(newEaseFactor * 100) / 100,
      interval: newInterval,
      repetition: newRepetition,
      quality,
      status: newStatus,
      nextReviewAt,
      lastReviewAt: new Date(),
      isWeak,
      reviewCount,
      streakCount,
      historyEntry,
    };
  }

  /**
   * Get all cards due for review (nextReviewAt <= now).
   * Prioritized by:  weak first → shortest interval → oldest review
   *
   * @param {Array} cards - Array of card objects
   * @returns {Array} Sorted cards due for review
   */
  static getDueCards(cards) {
    const now = new Date();
    return cards
      .filter((c) => new Date(c.nextReviewAt) <= now)
      .sort((a, b) => {
        // Weak topics first
        if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
        // Shortest interval next (most urgent)
        if (a.interval !== b.interval) return a.interval - b.interval;
        // Oldest review last
        return new Date(a.lastReviewAt || 0) - new Date(b.lastReviewAt || 0);
      });
  }

  /**
   * Generate a revision schedule for the next N days.
   *
   * @param {Array}  cards     - All user's revision cards
   * @param {number} days      - Number of days to schedule
   * @param {number} maxPerDay - Maximum reviews per day
   * @returns {Array<{ date: Date, cards: Array }>}
   */
  static generateSchedule(cards, days = 7, maxPerDay = 10) {
    const schedule = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dueCards = cards
        .filter((c) => {
          const reviewDate = new Date(c.nextReviewAt);
          return reviewDate <= endOfDay;
        })
        .sort((a, b) => {
          if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
          return a.interval - b.interval;
        })
        .slice(0, maxPerDay);

      schedule.push({
        date,
        dayNumber: d + 1,
        totalCards: dueCards.length,
        weakCards: dueCards.filter((c) => c.isWeak).length,
        cards: dueCards.map((c) => ({
          cardId: c._id || c.id,
          chapterName: c.chapterName,
          chapterSlug: c.chapterSlug,
          subjectName: c.subjectName,
          subjectIcon: c.subjectIcon,
          subjectColor: c.subjectColor,
          difficulty: c.difficulty,
          status: c.status,
          isWeak: c.isWeak,
          interval: c.interval,
          streakCount: c.streakCount,
          reviewCount: c.reviewCount,
        })),
      });

      // Remove scheduled cards from pool to avoid double-counting
      const scheduledIds = new Set(dueCards.map((c) => (c._id || c.id).toString()));
      cards = cards.filter((c) => !scheduledIds.has((c._id || c.id).toString()));
    }

    return schedule;
  }

  /**
   * Calculate revision stats summary.
   */
  static getStats(cards) {
    const total = cards.length;
    if (total === 0) {
      return { total: 0, new: 0, learning: 0, review: 0, mastered: 0, weak: 0, avgEaseFactor: 0, avgInterval: 0 };
    }

    const byStatus = { new: 0, learning: 0, review: 0, mastered: 0 };
    let weak = 0;
    let totalEase = 0;
    let totalInterval = 0;

    for (const c of cards) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.isWeak) weak++;
      totalEase += c.easeFactor || 2.5;
      totalInterval += c.interval || 0;
    }

    return {
      total,
      ...byStatus,
      weak,
      avgEaseFactor: Math.round((totalEase / total) * 100) / 100,
      avgInterval: Math.round((totalInterval / total) * 10) / 10,
      masteryRate: Math.round((byStatus.mastered / total) * 100),
    };
  }
}

module.exports = SpacedRepetitionEngine;
