/**
 * StudyOS - Topic Service (Business Logic Layer)
 *
 * Owns all topic management operations.
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const TopicRepository = require('./topic.repository');
const ChapterRepository = require('../chapter/chapter.repository');
const SubjectRepository = require('../subject/subject.repository');
const ExamRepository = require('../exam/exam.repository');
const Chapter = require('../chapter/chapter.model');
const Topic = require('./topic.model');
const TOPIC_SEEDS = require('./topic.seeds');

class TopicService {
  // ───────────────────────────────────────────────────────────────────────────────
  // SEED
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Seed topics for all chapters. Resolves examSlug/subjectSlug/chapterSlug → ObjectIds.
   * Idempotent — skips if topics already exist.
   */
  static async seedTopics() {
    let seededCount = 0;

    // 1. Explicit seed items
    for (const [key, topics] of Object.entries(TOPIC_SEEDS)) {
      const [examSlug, subjectSlug, chapterSlug] = key.split('/');

      const exam = await ExamRepository.findBySlug(examSlug);
      if (!exam) continue;

      const subject = await SubjectRepository.findByExamAndSlug(exam._id, subjectSlug);
      if (!subject) continue;

      const chapter = await ChapterRepository.findBySubjectAndSlug(subject._id, chapterSlug);
      if (!chapter) continue;

      for (const t of topics) {
        const existing = await TopicRepository.findByChapterAndSlug(chapter._id, t.slug);
        if (!existing) {
          await TopicRepository.create({
            ...t,
            chapterId: chapter._id,
            subjectId: subject._id,
            examId: exam._id,
          });
          seededCount++;
        }
      }
    }

    // 2. Fallback generator: Ensure EVERY chapter has at least 3 topics
    const allChapters = await Chapter.find({}).exec();
    for (const chap of allChapters) {
      const existingCount = await TopicRepository.countByChapterId(chap._id);
      if (existingCount === 0) {
        const defaultTopics = [
          { name: `Theoretical Foundations of ${chap.name}`, slug: `theory-${chap.slug}`, difficulty: 'easy', weightage: 30, estimatedMinutes: 40, sortOrder: 1 },
          { name: `Core Mechanics & Problem Patterns`, slug: `mechanics-${chap.slug}`, difficulty: 'medium', weightage: 40, estimatedMinutes: 50, sortOrder: 2 },
          { name: `Advanced Exam Application`, slug: `application-${chap.slug}`, difficulty: 'hard', weightage: 30, estimatedMinutes: 60, sortOrder: 3 },
        ];
        for (const t of defaultTopics) {
          await TopicRepository.create({
            ...t,
            chapterId: chap._id,
            subjectId: chap.subjectId,
            examId: chap.examId,
          });
          seededCount++;
        }
      }
    }

    const totalCount = await Topic.countDocuments();
    console.log(`[StudyOS] Topic Matrix ready: ${totalCount} active topics (${seededCount} newly seeded)`);
    return { seeded: seededCount > 0, count: totalCount };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new topic under a chapter.
   * @param {object} data - { chapterId, name, slug, ... }
   * @returns {Promise<object>}
   */
  static async createTopic(data) {
    const chapter = await ChapterRepository.findById(data.chapterId);
    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }

    const existing = await TopicRepository.findByChapterAndSlug(data.chapterId, data.slug);
    if (existing) {
      throw AppError.conflict(
        `Topic with slug "${data.slug}" already exists for this chapter`,
        'TOPIC_SLUG_DUPLICATE'
      );
    }

    // Denormalize parent IDs from chapter
    return TopicRepository.create({
      ...data,
      subjectId: chapter.subjectId,
      examId: chapter.examId,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get all topics for a chapter.
   */
  static async getTopicsByChapter(chapterId, activeOnly = true) {
    const chapter = await ChapterRepository.findById(chapterId);
    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }

    const topics = await TopicRepository.findByChapterId(chapterId, activeOnly);
    return topics.map((t) => t.toJSON());
  }

  /**
   * Get all topics for a subject (cross-chapter).
   */
  static async getTopicsBySubject(subjectId, filters = {}) {
    const subject = await SubjectRepository.findById(subjectId);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }

    const topics = await TopicRepository.findBySubjectId(subjectId, filters);
    return topics.map((t) => t.toJSON());
  }

  /**
   * Get a single topic by ID (with populated parents).
   */
  static async getTopicById(topicId) {
    const topic = await TopicRepository.findByIdPopulated(topicId);
    if (!topic) {
      throw AppError.notFound('Topic not found', 'TOPIC_NOT_FOUND');
    }
    return topic.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update a topic.
   */
  static async updateTopic(topicId, updateData) {
    if (updateData.slug) {
      const current = await TopicRepository.findById(topicId);
      if (!current) {
        throw AppError.notFound('Topic not found', 'TOPIC_NOT_FOUND');
      }

      const existing = await TopicRepository.findByChapterAndSlug(current.chapterId, updateData.slug);
      if (existing && existing._id.toString() !== topicId) {
        throw AppError.conflict(
          `Topic with slug "${updateData.slug}" already exists for this chapter`,
          'TOPIC_SLUG_DUPLICATE'
        );
      }
    }

    const topic = await TopicRepository.updateById(topicId, updateData);
    if (!topic) {
      throw AppError.notFound('Topic not found', 'TOPIC_NOT_FOUND');
    }
    return topic.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete a topic.
   */
  static async deleteTopic(topicId) {
    const topic = await TopicRepository.deleteById(topicId);
    if (!topic) {
      throw AppError.notFound('Topic not found', 'TOPIC_NOT_FOUND');
    }
  }

  /**
   * Delete all topics for a chapter (cascade).
   */
  static async deleteTopicsByChapter(chapterId) {
    const result = await TopicRepository.deleteByChapterId(chapterId);
    return result.deletedCount || 0;
  }
}

module.exports = TopicService;
