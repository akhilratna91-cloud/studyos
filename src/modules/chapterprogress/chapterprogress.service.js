/**
 * StudyOS - ChapterProgress Service (Business Logic Layer)
 *
 * Two modes of operation:
 *   1. SYNC — Scan all tasks for a chapter and compute current state
 *   2. INIT — Create progress records for all chapters in an exam
 *
 * Auto-completion: When all tasks for a chapter are completed,
 * the chapter status transitions to "completed".
 *
 * Mastery levels: Based on avg self-rated understanding (1-5).
 *   none(0) → basic(1-2) → intermediate(2.5-3.4) → advanced(3.5-4.4) → expert(4.5-5)
 */

const AppError = require('../../shared/errors/AppError');
const ChapterProgressRepository = require('./chapterprogress.repository');
const DailyTask = require('../dailytask/dailytask.model');
const Chapter = require('../chapter/chapter.model');
const Subject = require('../subject/subject.model');
const StudySession = require('../progress/progress.model');
const mongoose = require('mongoose');

class ChapterProgressService {
  // ───────────────────────────────────────────────────────────────────────────────
  // INITIALIZE — create progress records for all chapters in an exam
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Initialize chapter progress for all chapters in an exam.
   * Creates one ChapterProgress per chapter (idempotent via upsert).
   */
  static async initializeForExam(userId, examId) {
    const objectExamId = new mongoose.Types.ObjectId(examId);

    // Get all subjects for the exam
    const subjects = await Subject.find({ examId: objectExamId }).exec();
    if (subjects.length === 0) {
      throw AppError.notFound('No subjects found for this exam', 'NO_SUBJECTS');
    }

    const subjectIds = subjects.map((s) => s._id);
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

    // Get all chapters for those subjects
    const chapters = await Chapter.find({ subjectId: { $in: subjectIds } }).exec();
    if (chapters.length === 0) {
      throw AppError.notFound('No chapters found', 'NO_CHAPTERS');
    }

    // Upsert each chapter
    let created = 0;
    for (const chapter of chapters) {
      const subject = subjectMap.get(chapter.subjectId.toString());
      await ChapterProgressRepository.upsert(userId, chapter._id, {
        userId,
        examId: objectExamId,
        subjectId: chapter.subjectId,
        chapterId: chapter._id,
        subjectName: subject ? subject.name : '',
        subjectIcon: subject ? subject.icon : '📘',
        subjectColor: subject ? subject.color : '#4F46E5',
        chapterName: chapter.name,
        chapterSlug: chapter.slug,
        difficulty: chapter.difficulty || 'medium',
      });
      created++;
    }

    return { initialized: created, examId };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SYNC — scan tasks for a chapter and update progress
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Sync a single chapter's progress from its tasks.
   */
  static async syncChapter(userId, chapterId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectChapterId = new mongoose.Types.ObjectId(chapterId);

    // Aggregate tasks for this chapter
    const taskStats = await DailyTask.aggregate([
      { $match: { userId: objectUserId, chapterId: objectChapterId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          totalMinutes: { $sum: '$durationMinutes' },
          completedMinutes: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$durationMinutes', 0] },
          },
          latestCompleted: { $max: '$completedAt' },
        },
      },
    ]);

    const t = taskStats[0] || { total: 0, completed: 0, skipped: 0, totalMinutes: 0, completedMinutes: 0 };

    // Get avg rating from study sessions
    const sessionStats = await StudySession.aggregate([
      { $match: { userId: objectUserId, chapterId: objectChapterId, status: 'completed', rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgRating = sessionStats[0] ? Math.round(sessionStats[0].avgRating * 10) / 10 : 0;

    // Compute status
    const completionRate = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
    let status = 'not_started';
    if (t.completed >= t.total && t.total > 0) {
      status = avgRating >= 4.5 ? 'mastered' : 'completed';
    } else if (t.completed > 0) {
      status = 'in_progress';
    }

    // Compute mastery level
    const mastery = this._computeMastery(avgRating);

    const now = new Date();
    const updateData = {
      totalTasks: t.total,
      completedTasks: t.completed,
      skippedTasks: t.skipped,
      totalMinutes: t.totalMinutes,
      completedMinutes: t.completedMinutes,
      completionRate,
      status,
      mastery,
      avgRating,
      lastStudiedAt: t.latestCompleted || now,
    };

    // Set lifecycle timestamps
    if (status === 'in_progress' || status === 'completed' || status === 'mastered') {
      updateData.startedAt = updateData.startedAt || now;
    }
    if (status === 'completed' || status === 'mastered') {
      updateData.completedAt = t.latestCompleted || now;
    }

    const progress = await ChapterProgressRepository.upsert(userId, chapterId, updateData);
    return progress.toJSON();
  }

  /**
   * Sync ALL chapters for a user+exam.
   */
  static async syncAllForExam(userId, examId) {
    const records = await ChapterProgressRepository.findByExam(userId, examId);
    if (records.length === 0) {
      throw AppError.notFound('No chapter progress found. Initialize first.', 'NOT_INITIALIZED');
    }

    const results = [];
    for (const record of records) {
      const synced = await this.syncChapter(userId, record.chapterId);
      results.push(synced);
    }

    return results;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // MANUAL MARK
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Manually mark a chapter as completed (override).
   */
  static async markCompleted(userId, chapterId) {
    const record = await ChapterProgressRepository.findByUserAndChapter(userId, chapterId);
    if (!record) {
      throw AppError.notFound('Chapter progress not found. Initialize first.', 'NOT_FOUND');
    }

    const updated = await ChapterProgressRepository.upsert(userId, chapterId, {
      status: 'completed',
      completionRate: 100,
      completedAt: new Date(),
    });
    return updated.toJSON();
  }

  /**
   * Manually mark a chapter as mastered (override).
   */
  static async markMastered(userId, chapterId) {
    const record = await ChapterProgressRepository.findByUserAndChapter(userId, chapterId);
    if (!record) {
      throw AppError.notFound('Chapter progress not found', 'NOT_FOUND');
    }

    const updated = await ChapterProgressRepository.upsert(userId, chapterId, {
      status: 'mastered',
      completionRate: 100,
      mastery: 'expert',
      completedAt: record.completedAt || new Date(),
    });
    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get all chapters for an exam with progress.
   */
  static async getByExam(userId, examId) {
    const records = await ChapterProgressRepository.findByExam(userId, examId);
    return records.map((r) => r.toJSON());
  }

  /**
   * Get all chapters for a subject with progress.
   */
  static async getBySubject(userId, subjectId) {
    const records = await ChapterProgressRepository.findBySubject(userId, subjectId);
    return records.map((r) => r.toJSON());
  }

  /**
   * Get a single chapter progress.
   */
  static async getByChapter(userId, chapterId) {
    const record = await ChapterProgressRepository.findByUserAndChapter(userId, chapterId);
    if (!record) return null;
    return record.toJSON();
  }

  /**
   * Get chapters by status.
   */
  static async getByStatus(userId, status, examId = null) {
    const records = await ChapterProgressRepository.findByStatus(userId, status, examId);
    return records.map((r) => r.toJSON());
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // ROLLUPS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get subject-level progress rollup.
   */
  static async getSubjectRollup(userId, examId = null) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectExamId = examId ? new mongoose.Types.ObjectId(examId) : null;
    const rollup = await ChapterProgressRepository.getSubjectRollup(objectUserId, objectExamId);

    return rollup.map((s) => ({
      subjectId: s._id,
      subjectName: s.subjectName,
      subjectIcon: s.subjectIcon,
      subjectColor: s.subjectColor,
      totalChapters: s.totalChapters,
      completedChapters: s.completedChapters,
      masteredChapters: s.masteredChapters,
      inProgressChapters: s.inProgressChapters,
      completionRate: s.totalChapters > 0
        ? Math.round((s.completedChapters / s.totalChapters) * 100)
        : 0,
      avgChapterCompletion: Math.round(s.avgCompletionRate || 0),
      totalHours: Math.round((s.totalMinutes / 60) * 10) / 10,
    }));
  }

  /**
   * Get exam-level syllabus coverage.
   */
  static async getExamSummary(userId, examId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectExamId = new mongoose.Types.ObjectId(examId);
    const summary = await ChapterProgressRepository.getExamSummary(objectUserId, objectExamId);

    const s = summary[0] || { totalChapters: 0, completed: 0, mastered: 0, inProgress: 0, notStarted: 0, avgCompletionRate: 0, totalMinutes: 0, avgRating: 0 };

    return {
      totalChapters: s.totalChapters,
      completed: s.completed,
      mastered: s.mastered,
      inProgress: s.inProgress,
      notStarted: s.notStarted,
      syllabusCoverage: s.totalChapters > 0
        ? Math.round((s.completed / s.totalChapters) * 100)
        : 0,
      avgChapterCompletion: Math.round(s.avgCompletionRate || 0),
      totalHours: Math.round((s.totalMinutes / 60) * 10) / 10,
      avgRating: Math.round((s.avgRating || 0) * 10) / 10,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Compute mastery level from avg rating.
   * @private
   */
  static _computeMastery(avgRating) {
    if (!avgRating || avgRating === 0) return 'none';
    if (avgRating < 2.5) return 'basic';
    if (avgRating < 3.5) return 'intermediate';
    if (avgRating < 4.5) return 'advanced';
    return 'expert';
  }
}

module.exports = ChapterProgressService;
