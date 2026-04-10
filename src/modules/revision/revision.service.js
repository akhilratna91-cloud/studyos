/**
 * StudyOS - Revision Service (Business Logic Layer)
 *
 * Manages the spaced repetition lifecycle:
 *   1. Initialize cards from a study plan or exam
 *   2. Process reviews (SM-2 algorithm)
 *   3. Get due/weak cards
 *   4. Generate multi-day revision schedule
 *   5. Provide stats & progress
 */

const AppError = require('../../shared/errors/AppError');
const RevisionRepository = require('./revision.repository');
const SpacedRepetitionEngine = require('./spaced.engine');
const ExamRepository = require('../exam/exam.repository');
const SubjectRepository = require('../subject/subject.repository');
const ChapterRepository = require('../chapter/chapter.repository');
const mongoose = require('mongoose');

class RevisionService {
  // ───────────────────────────────────────────────────────────────────────────────
  // INITIALIZE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Initialize revision cards for all chapters in an exam.
   * Creates one card per chapter. Skips already-existing cards.
   *
   * @param {string} userId
   * @param {string} examId - Exam ID or slug
   * @returns {Promise<{ created: number, skipped: number }>}
   */
  static async initializeForExam(userId, examId) {
    // Resolve exam
    let exam;
    if (examId.match(/^[a-f\d]{24}$/i)) {
      exam = await ExamRepository.findById(examId);
    } else {
      exam = await ExamRepository.findBySlug(examId);
    }
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    const subjects = await SubjectRepository.findByExamId(exam._id, true);
    const chapters = await ChapterRepository.findByExamId(exam._id, { isActive: true });

    if (chapters.length === 0) {
      throw AppError.badRequest('No chapters found for this exam', 'NO_CHAPTERS');
    }

    // Build subject map
    const subjectMap = new Map();
    for (const s of subjects) {
      subjectMap.set(s._id.toString(), {
        name: s.name,
        icon: s.icon || '📘',
        color: s.color || '#4F46E5',
      });
    }

    // Create cards (skip existing)
    let created = 0;
    let skipped = 0;

    for (const ch of chapters) {
      const existing = await RevisionRepository.findByUserAndChapter(userId, ch._id);
      if (existing) {
        skipped++;
        continue;
      }

      const subj = subjectMap.get(ch.subjectId.toString()) || {};
      await RevisionRepository.create({
        userId,
        examId: exam._id,
        subjectId: ch.subjectId,
        chapterId: ch._id,
        subjectName: subj.name || '',
        subjectIcon: subj.icon || '📘',
        subjectColor: subj.color || '#4F46E5',
        chapterName: ch.name,
        chapterSlug: ch.slug,
        difficulty: ch.difficulty,
        nextReviewAt: new Date(),
      });
      created++;
    }

    return { created, skipped, total: created + skipped };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // REVIEW
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Process a review for a card.
   *
   * @param {string} userId
   * @param {string} cardId
   * @param {number} quality - 0–5 scale
   * @returns {Promise<object>} Updated card
   */
  static async processReview(userId, cardId, quality) {
    const card = await RevisionRepository.findByIdAndUser(cardId, userId);
    if (!card) {
      throw AppError.notFound('Revision card not found', 'CARD_NOT_FOUND');
    }

    // Run SM-2 algorithm
    const result = SpacedRepetitionEngine.processReview(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetition: card.repetition,
        reviewCount: card.reviewCount,
        streakCount: card.streakCount,
      },
      quality
    );

    // Update card
    const { historyEntry, ...updateFields } = result;

    const updated = await RevisionRepository.updateById(cardId, updateFields);

    // Push history entry
    await RevisionRepository.pushHistory(cardId, historyEntry);

    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get cards due for review right now.
   */
  static async getDueCards(userId, examId = null) {
    let resolvedExamId = examId;
    if (examId && !examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(examId);
      resolvedExamId = exam ? exam._id : null;
    }

    const cards = await RevisionRepository.findDueCards(userId, resolvedExamId);
    return cards.map((c) => c.toJSON());
  }

  /**
   * Get weak topics.
   */
  static async getWeakTopics(userId, examId = null) {
    let resolvedExamId = examId;
    if (examId && !examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(examId);
      resolvedExamId = exam ? exam._id : null;
    }

    const cards = await RevisionRepository.findWeakCards(userId, resolvedExamId);
    return cards.map((c) => c.toJSON());
  }

  /**
   * Get all revision cards for a user (with optional filters).
   */
  static async getUserCards(userId, filters = {}) {
    if (filters.examId && !filters.examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(filters.examId);
      filters.examId = exam ? exam._id : null;
    }

    const cards = await RevisionRepository.findByUserId(userId, filters);
    return cards.map((c) => c.toJSON());
  }

  /**
   * Get a single card with full history.
   */
  static async getCardById(userId, cardId) {
    const card = await RevisionRepository.findByIdAndUser(cardId, userId);
    if (!card) {
      throw AppError.notFound('Revision card not found', 'CARD_NOT_FOUND');
    }
    return card.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SCHEDULE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a multi-day revision schedule (lookahead).
   *
   * @param {string} userId
   * @param {object} options
   * @param {string} [options.examId]
   * @param {number} [options.days=7]
   * @param {number} [options.maxPerDay=10]
   * @returns {Promise<{ schedule: Array, stats: object }>}
   */
  static async getRevisionSchedule(userId, options = {}) {
    const { examId, days = 7, maxPerDay = 10 } = options;

    let resolvedExamId = examId;
    if (examId && !examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(examId);
      resolvedExamId = exam ? exam._id : null;
    }

    const cards = await RevisionRepository.findByUserId(userId, {
      examId: resolvedExamId,
    });

    const cardObjects = cards.map((c) => c.toJSON());
    const schedule = SpacedRepetitionEngine.generateSchedule(cardObjects, days, maxPerDay);
    const stats = SpacedRepetitionEngine.getStats(cardObjects);

    return { schedule, stats };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STATS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get revision stats for a user.
   */
  static async getStats(userId, examId = null) {
    let resolvedExamId = examId;
    if (examId && !examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(examId);
      resolvedExamId = exam ? exam._id : null;
    }

    const cards = await RevisionRepository.findByUserId(userId, {
      examId: resolvedExamId,
    });

    const cardObjects = cards.map((c) => c.toJSON());
    const stats = SpacedRepetitionEngine.getStats(cardObjects);

    // Add due count
    const dueCards = await RevisionRepository.findDueCards(userId, resolvedExamId);
    stats.dueNow = dueCards.length;

    return stats;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Reset all revision cards for an exam (start fresh).
   */
  static async resetForExam(userId, examId) {
    let resolvedExamId = examId;
    if (!examId.match(/^[a-f\d]{24}$/i)) {
      const exam = await ExamRepository.findBySlug(examId);
      if (!exam) throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
      resolvedExamId = exam._id;
    }

    const result = await RevisionRepository.deleteByUserAndExam(userId, resolvedExamId);
    return result.deletedCount || 0;
  }
}

module.exports = RevisionService;
