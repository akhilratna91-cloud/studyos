/**
 * StudyOS - SubjectProgress Service
 *
 * Computes per-subject progress with strength/weakness classification.
 *
 * Strength Score (0–100) = weighted combination of:
 *   - Completion rate (40%) — chapters done / total
 *   - Mastery rate (25%)   — mastered / completed
 *   - Avg rating (20%)     — self-rated understanding
 *   - Revision health (15%)— non-weak / total revision cards
 *
 * Classification:
 *   ≥ 80 → strong
 *   50–79 → moderate
 *   < 50 → weak
 */

const mongoose = require('mongoose');
const ChapterProgress = require('../chapterprogress/chapterprogress.model');
const DailyTask = require('../dailytask/dailytask.model');
const StudySession = require('../progress/progress.model');
const RevisionCard = require('../revision/revision.model');
const Subject = require('../subject/subject.model');

class SubjectProgressService {
  // ───────────────────────────────────────────────────────────────────────────────
  // FULL SUBJECT PROGRESS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get progress for all subjects (optionally filtered by exam).
   * Returns completion, strength score, and strong/weak classification.
   */
  static async getSubjectProgress(userId, examId = null) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const match = { userId: objectUserId };
    if (examId) match.examId = new mongoose.Types.ObjectId(examId);

    // ── 1. Chapter completion per subject ────────────────────────────────────
    const chapterData = await ChapterProgress.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          subjectColor: { $first: '$subjectColor' },
          examId: { $first: '$examId' },
          totalChapters: { $sum: 1 },
          completedChapters: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
          },
          masteredChapters: {
            $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
          },
          inProgressChapters: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          avgCompletionRate: { $avg: '$completionRate' },
          totalMinutes: { $sum: '$completedMinutes' },
          avgRating: { $avg: '$avgRating' },
        },
      },
      { $sort: { subjectName: 1 } },
    ]);

    // ── 2. Revision health per subject ──────────────────────────────────────
    const revisionMatch = { userId: objectUserId };
    if (examId) revisionMatch.examId = new mongoose.Types.ObjectId(examId);

    const revisionData = await RevisionCard.aggregate([
      { $match: revisionMatch },
      {
        $group: {
          _id: '$subjectId',
          totalCards: { $sum: 1 },
          weakCards: { $sum: { $cond: [{ $eq: ['$isWeak', true] }, 1, 0] } },
          masteredCards: { $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] } },
        },
      },
    ]);

    const revisionMap = new Map(revisionData.map((r) => [r._id?.toString(), r]));

    // ── 3. Study time per subject from sessions ─────────────────────────────
    const sessionData = await StudySession.aggregate([
      { $match: { userId: objectUserId, status: 'completed' } },
      {
        $group: {
          _id: '$subjectId',
          actualMinutes: { $sum: '$actualMinutes' },
          sessions: { $sum: 1 },
          avgSessionRating: { $avg: '$rating' },
        },
      },
    ]);

    const sessionMap = new Map(sessionData.map((s) => [s._id?.toString(), s]));

    // ── 4. Compute strength score for each subject ──────────────────────────
    const subjects = chapterData.map((ch) => {
      const subId = ch._id?.toString();
      const rev = revisionMap.get(subId) || { totalCards: 0, weakCards: 0, masteredCards: 0 };
      const sess = sessionMap.get(subId) || { actualMinutes: 0, sessions: 0, avgSessionRating: 0 };

      // Completion rate (0–100)
      const completionRate = ch.totalChapters > 0
        ? Math.round((ch.completedChapters / ch.totalChapters) * 100)
        : 0;

      // Mastery rate (0–100)
      const masteryRate = ch.completedChapters > 0
        ? Math.round((ch.masteredChapters / ch.completedChapters) * 100)
        : 0;

      // Avg rating normalized to 0–100
      const ratingScore = ((ch.avgRating || 0) / 5) * 100;

      // Revision health (0–100): what % of cards are NOT weak
      const revisionHealth = rev.totalCards > 0
        ? Math.round(((rev.totalCards - rev.weakCards) / rev.totalCards) * 100)
        : 100; // no cards = healthy by default

      // Weighted strength score
      const strengthScore = Math.round(
        (completionRate * 0.40) +
        (masteryRate * 0.25) +
        (ratingScore * 0.20) +
        (revisionHealth * 0.15)
      );

      // Classification
      let classification;
      if (strengthScore >= 80) classification = 'strong';
      else if (strengthScore >= 50) classification = 'moderate';
      else classification = 'weak';

      return {
        subjectId: ch._id,
        subjectName: ch.subjectName,
        subjectIcon: ch.subjectIcon,
        subjectColor: ch.subjectColor,
        examId: ch.examId,

        // Chapter data
        totalChapters: ch.totalChapters,
        completedChapters: ch.completedChapters,
        masteredChapters: ch.masteredChapters,
        inProgressChapters: ch.inProgressChapters,
        completionRate,

        // Strength analysis
        strengthScore,
        classification,
        masteryRate,
        revisionHealth,
        avgRating: Math.round((ch.avgRating || 0) * 10) / 10,

        // Time data
        allocatedHours: Math.round((ch.totalMinutes / 60) * 10) / 10,
        actualStudyHours: Math.round((sess.actualMinutes / 60) * 10) / 10,
        studySessions: sess.sessions,

        // Revision data
        totalRevisionCards: rev.totalCards,
        weakRevisionCards: rev.weakCards,
        masteredRevisionCards: rev.masteredCards,
      };
    });

    return subjects;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STRONG / WEAK SUBJECTS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get only strong subjects (score ≥ 80).
   */
  static async getStrongSubjects(userId, examId = null) {
    const all = await this.getSubjectProgress(userId, examId);
    return all.filter((s) => s.classification === 'strong');
  }

  /**
   * Get only weak subjects (score < 50).
   */
  static async getWeakSubjects(userId, examId = null) {
    const all = await this.getSubjectProgress(userId, examId);
    return all.filter((s) => s.classification === 'weak');
  }

  /**
   * Get a ranked recommendation — what to focus on next.
   */
  static async getRecommendations(userId, examId = null) {
    const all = await this.getSubjectProgress(userId, examId);

    // Sort by strength score (weakest first)
    const sorted = [...all].sort((a, b) => a.strengthScore - b.strengthScore);

    const recommendations = sorted.map((s, i) => ({
      priority: i + 1,
      subjectName: s.subjectName,
      subjectIcon: s.subjectIcon,
      subjectColor: s.subjectColor,
      classification: s.classification,
      strengthScore: s.strengthScore,
      reason: this._getRecommendationReason(s),
      action: this._getRecommendedAction(s),
    }));

    return recommendations;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SINGLE SUBJECT DETAIL
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get detailed progress for a single subject.
   */
  static async getSubjectDetail(userId, subjectId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectSubjectId = new mongoose.Types.ObjectId(subjectId);

    // Get all chapter progress for this subject
    const chapters = await ChapterProgress.find({
      userId: objectUserId,
      subjectId: objectSubjectId,
    }).sort({ chapterName: 1 }).exec();

    if (chapters.length === 0) return null;

    // Summarize
    const total = chapters.length;
    const completed = chapters.filter((c) => c.status === 'completed' || c.status === 'mastered').length;
    const mastered = chapters.filter((c) => c.status === 'mastered').length;
    const inProgress = chapters.filter((c) => c.status === 'in_progress').length;
    const notStarted = chapters.filter((c) => c.status === 'not_started').length;
    const avgRating = chapters.reduce((sum, c) => sum + (c.avgRating || 0), 0) / total;

    return {
      subjectId: objectSubjectId,
      subjectName: chapters[0].subjectName,
      subjectIcon: chapters[0].subjectIcon,
      subjectColor: chapters[0].subjectColor,
      completionRate: Math.round((completed / total) * 100),
      totalChapters: total,
      completed,
      mastered,
      inProgress,
      notStarted,
      avgRating: Math.round(avgRating * 10) / 10,
      chapters: chapters.map((c) => ({
        chapterId: c.chapterId,
        chapterName: c.chapterName,
        difficulty: c.difficulty,
        status: c.status,
        completionRate: c.completionRate,
        mastery: c.mastery,
        avgRating: c.avgRating,
        lastStudiedAt: c.lastStudiedAt,
      })),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────────────────────

  /** @private */
  static _getRecommendationReason(subject) {
    if (subject.completionRate < 25) return 'Very low completion — most chapters not started';
    if (subject.weakRevisionCards > 3) return `${subject.weakRevisionCards} weak revision cards need attention`;
    if (subject.avgRating < 2.5) return 'Low understanding rating — needs more study time';
    if (subject.completionRate < 50) return 'Under 50% complete — falling behind';
    if (subject.masteryRate < 20) return 'Low mastery rate — review completed chapters';
    return 'On track — maintain current pace';
  }

  /** @private */
  static _getRecommendedAction(subject) {
    if (subject.completionRate < 25) return 'Start studying this subject — complete at least 2 chapters this week';
    if (subject.weakRevisionCards > 3) return 'Review weak chapters before starting new ones';
    if (subject.avgRating < 2.5) return 'Re-read notes and do practice problems for completed chapters';
    if (subject.completionRate < 50) return 'Increase daily study time for this subject';
    if (subject.classification === 'strong') return 'Focus on maintaining — do revision and practice tests';
    return 'Continue at current pace';
  }
}

module.exports = SubjectProgressService;
