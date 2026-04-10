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
    const hasTopics = await TopicRepository.hasAny();
    if (hasTopics) {
      return { seeded: false, count: 0 };
    }

    const allTopics = [];

    for (const [key, topics] of Object.entries(TOPIC_SEEDS)) {
      const [examSlug, subjectSlug, chapterSlug] = key.split('/');

      const exam = await ExamRepository.findBySlug(examSlug);
      if (!exam) {
        console.warn(`[StudyOS] Seed warning: exam "${examSlug}" not found, skipping`);
        continue;
      }

      const subject = await SubjectRepository.findByExamAndSlug(exam._id, subjectSlug);
      if (!subject) {
        console.warn(`[StudyOS] Seed warning: subject "${subjectSlug}" not found under "${examSlug}", skipping`);
        continue;
      }

      const chapter = await ChapterRepository.findBySubjectAndSlug(subject._id, chapterSlug);
      if (!chapter) {
        console.warn(`[StudyOS] Seed warning: chapter "${chapterSlug}" not found under "${subjectSlug}", skipping`);
        continue;
      }

      for (const t of topics) {
        allTopics.push({
          ...t,
          chapterId: chapter._id,
          subjectId: subject._id,
          examId: exam._id,
        });
      }
    }

    if (allTopics.length === 0) {
      return { seeded: false, count: 0 };
    }

    const created = await TopicRepository.bulkCreate(allTopics);
    console.log(`[StudyOS] Seeded ${created.length} topics`);
    return { seeded: true, count: created.length };
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
