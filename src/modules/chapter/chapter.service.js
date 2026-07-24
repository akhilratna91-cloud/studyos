/**
 * StudyOS - Chapter Service (Business Logic Layer)
 *
 * Owns all chapter management operations:
 *   - Seed chapters (linked via examSlug/subjectSlug)
 *   - Create chapter under a subject
 *   - Fetch chapters by subject
 *   - Fetch single chapter
 *   - Update / delete chapter
 *
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const ChapterRepository = require('./chapter.repository');
const SubjectRepository = require('../subject/subject.repository');
const ExamRepository = require('../exam/exam.repository');
const Subject = require('../subject/subject.model');
const Chapter = require('./chapter.model');
const CHAPTER_SEEDS = require('./chapter.seeds');

class ChapterService {
  // ───────────────────────────────────────────────────────────────────────────────
  // SEED
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Seed chapters for all subjects. Resolves examSlug/subjectSlug → ObjectIds.
   * Idempotent — skips if chapters already exist.
   * @returns {Promise<{ seeded: boolean, count: number }>}
   */
  static async seedChapters() {
    let seededCount = 0;

    // 1. Seed explicit chapters from CHAPTER_SEEDS
    for (const [key, chapters] of Object.entries(CHAPTER_SEEDS)) {
      const [examSlug, subjectSlug] = key.split('/');

      const exam = await ExamRepository.findBySlug(examSlug);
      if (!exam) continue;

      const subject = await SubjectRepository.findByExamAndSlug(exam._id, subjectSlug);
      if (!subject) continue;

      for (const ch of chapters) {
        const existing = await ChapterRepository.findBySubjectAndSlug(subject._id, ch.slug);
        if (!existing) {
          await ChapterRepository.create({
            ...ch,
            subjectId: subject._id,
            examId: exam._id,
          });
          seededCount++;
        }
      }
    }

    // 2. Fallback generator: Ensure EVERY subject has at least 4 chapters
    const allSubjects = await Subject.find({}).exec();
    for (const sub of allSubjects) {
      const existingCount = await ChapterRepository.countBySubjectId(sub._id);
      if (existingCount === 0) {
        const defaultChapters = [
          { name: `Fundamentals of ${sub.name}`, slug: `fundamentals-${sub.slug}`, difficulty: 'easy', weightage: 25, estimatedHours: 8, sortOrder: 1 },
          { name: `Core Concepts & Principles`, slug: `core-concepts-${sub.slug}`, difficulty: 'medium', weightage: 25, estimatedHours: 10, sortOrder: 2 },
          { name: `Advanced Problem Solving`, slug: `advanced-problems-${sub.slug}`, difficulty: 'hard', weightage: 25, estimatedHours: 12, sortOrder: 3 },
          { name: `PYQ & Full Revision`, slug: `pyq-revision-${sub.slug}`, difficulty: 'medium', weightage: 25, estimatedHours: 10, sortOrder: 4 },
        ];
        for (const ch of defaultChapters) {
          await ChapterRepository.create({
            ...ch,
            subjectId: sub._id,
            examId: sub.examId,
          });
          seededCount++;
        }
      }
    }

    const totalCount = await Chapter.countDocuments();
    console.log(`[StudyOS] Chapter Matrix ready: ${totalCount} active chapters (${seededCount} newly seeded)`);
    return { seeded: seededCount > 0, count: totalCount };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new chapter under a subject.
   * @param {object} data - { subjectId, name, slug, difficulty, weightage, ... }
   * @returns {Promise<object>} Created chapter
   * @throws {AppError} 404 if subject not found, 409 if slug duplicate
   */
  static async createChapter(data) {
    // 1. Verify subject exists and get its examId
    const subject = await SubjectRepository.findById(data.subjectId);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }

    // 2. Guard — slug unique within subject
    const existing = await ChapterRepository.findBySubjectAndSlug(data.subjectId, data.slug);
    if (existing) {
      throw AppError.conflict(
        `Chapter with slug "${data.slug}" already exists for this subject`,
        'CHAPTER_SLUG_DUPLICATE'
      );
    }

    // 3. Denormalize examId from subject
    return ChapterRepository.create({
      ...data,
      examId: subject.examId,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get all chapters for a subject.
   * @param {string} subjectId
   * @param {boolean} [activeOnly=true]
   * @returns {Promise<Array<object>>}
   * @throws {AppError} 404 if subject not found
   */
  static async getChaptersBySubject(subjectId, activeOnly = true) {
    const subject = await SubjectRepository.findById(subjectId);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }

    const chapters = await ChapterRepository.findBySubjectId(subjectId, activeOnly);
    return chapters.map((c) => c.toJSON());
  }

  /**
   * Get all chapters for an exam (cross-subject).
   * @param {string} examId
   * @param {object} [filters={}] - { difficulty }
   * @returns {Promise<Array<object>>}
   * @throws {AppError} 404 if exam not found
   */
  static async getChaptersByExam(examId, filters = {}) {
    const exam = await ExamRepository.findById(examId);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    const chapters = await ChapterRepository.findByExamId(examId, filters);
    return chapters.map((c) => c.toJSON());
  }

  /**
   * Get a single chapter by ID (with populated parents).
   * @param {string} chapterId
   * @returns {Promise<object>}
   * @throws {AppError} 404 if not found
   */
  static async getChapterById(chapterId) {
    const chapter = await ChapterRepository.findByIdPopulated(chapterId);
    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }
    return chapter.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update a chapter.
   * @param {string} chapterId
   * @param {object} updateData
   * @returns {Promise<object>} Updated chapter
   * @throws {AppError} 404 if not found, 409 if slug conflict
   */
  static async updateChapter(chapterId, updateData) {
    if (updateData.slug) {
      const current = await ChapterRepository.findById(chapterId);
      if (!current) {
        throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
      }

      const existing = await ChapterRepository.findBySubjectAndSlug(current.subjectId, updateData.slug);
      if (existing && existing._id.toString() !== chapterId) {
        throw AppError.conflict(
          `Chapter with slug "${updateData.slug}" already exists for this subject`,
          'CHAPTER_SLUG_DUPLICATE'
        );
      }
    }

    const chapter = await ChapterRepository.updateById(chapterId, updateData);
    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }
    return chapter.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete a chapter.
   * @param {string} chapterId
   * @returns {Promise<void>}
   * @throws {AppError} 404 if not found
   */
  static async deleteChapter(chapterId) {
    const chapter = await ChapterRepository.deleteById(chapterId);
    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }
  }

  /**
   * Delete all chapters for a subject (cascade).
   * @param {string} subjectId
   * @returns {Promise<number>} Number deleted
   */
  static async deleteChaptersBySubject(subjectId) {
    const result = await ChapterRepository.deleteBySubjectId(subjectId);
    return result.deletedCount || 0;
  }
}

module.exports = ChapterService;
