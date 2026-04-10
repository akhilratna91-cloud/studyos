/**
 * StudyOS - Exam Service (Business Logic Layer)
 *
 * Owns all exam management operations:
 *   - Seed default exams
 *   - Create custom exams
 *   - Fetch all exams (with filtering & pagination)
 *   - Fetch single exam (by ID or slug)
 *   - Fetch exams by category
 *   - Update exam
 *   - Delete exam
 *
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const ExamRepository = require('./exam.repository');
const EXAM_SEEDS = require('./exam.seeds');

class ExamService {
  // ───────────────────────────────────────────────────────────────────────────────
  // SEED
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Seed the database with default exams if none exist.
   * Called during server startup.
   * @returns {Promise<{ seeded: boolean, count: number }>}
   */
  static async seedExams() {
    const hasExams = await ExamRepository.hasAny();
    if (hasExams) {
      const count = await ExamRepository.count();
      return { seeded: false, count };
    }

    const created = await ExamRepository.bulkCreate(EXAM_SEEDS);
    console.log(`[StudyOS] Seeded ${created.length} exams`);
    return { seeded: true, count: created.length };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new exam.
   * @param {object} examData
   * @returns {Promise<object>} Created exam
   * @throws {AppError} 409 if slug already exists
   */
  static async createExam(examData) {
    // Guard — unique slug
    const existing = await ExamRepository.findBySlug(examData.slug);
    if (existing) {
      throw AppError.conflict(
        `An exam with slug "${examData.slug}" already exists`,
        'EXAM_SLUG_DUPLICATE'
      );
    }

    return ExamRepository.create(examData);
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get all exams with optional filtering and pagination.
   * @param {object} [query={}] - { category, isActive, search, page, limit }
   * @returns {Promise<{ exams: Array, total: number, page: number, totalPages: number }>}
   */
  static async getAllExams(query = {}) {
    const {
      category,
      isActive,
      search,
      page = 1,
      limit = 50,
    } = query;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Execute
    const [exams, total] = await Promise.all([
      ExamRepository.findAll(filter, { sort: { sortOrder: 1 }, limit: limitNum, skip }),
      ExamRepository.count(filter),
    ]);

    return {
      exams: exams.map((e) => e.toJSON()),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get a single exam by ID.
   * @param {string} examId
   * @returns {Promise<object>}
   * @throws {AppError} 404 if not found
   */
  static async getExamById(examId) {
    const exam = await ExamRepository.findById(examId);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }
    return exam.toJSON();
  }

  /**
   * Get a single exam by slug.
   * @param {string} slug
   * @returns {Promise<object>}
   * @throws {AppError} 404 if not found
   */
  static async getExamBySlug(slug) {
    const exam = await ExamRepository.findBySlug(slug);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }
    return exam.toJSON();
  }

  /**
   * Get all exams in a specific category.
   * @param {string} category
   * @returns {Promise<Array<object>>}
   */
  static async getExamsByCategory(category) {
    const exams = await ExamRepository.findByCategory(category);
    return exams.map((e) => e.toJSON());
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update an exam by ID.
   * @param {string} examId
   * @param {object} updateData
   * @returns {Promise<object>} Updated exam
   * @throws {AppError} 404 if not found, 409 if new slug conflicts
   */
  static async updateExam(examId, updateData) {
    // If slug is being changed, check for conflicts
    if (updateData.slug) {
      const existing = await ExamRepository.findBySlug(updateData.slug);
      if (existing && existing._id.toString() !== examId) {
        throw AppError.conflict(
          `An exam with slug "${updateData.slug}" already exists`,
          'EXAM_SLUG_DUPLICATE'
        );
      }
    }

    const exam = await ExamRepository.updateById(examId, updateData);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }
    return exam.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete an exam by ID.
   * @param {string} examId
   * @returns {Promise<void>}
   * @throws {AppError} 404 if not found
   */
  static async deleteExam(examId) {
    const exam = await ExamRepository.deleteById(examId);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }
  }
}

module.exports = ExamService;
