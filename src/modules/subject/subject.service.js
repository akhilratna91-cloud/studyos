/**
 * StudyOS - Subject Service (Business Logic Layer)
 *
 * Owns all subject management operations:
 *   - Seed subjects (linked to exams by slug)
 *   - Create subject under an exam
 *   - Fetch subjects by exam
 *   - Fetch single subject
 *   - Update / delete subject
 *
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const SubjectRepository = require('./subject.repository');
const ExamRepository = require('../exam/exam.repository');
const SUBJECT_SEEDS = require('./subject.seeds');

class SubjectService {
  // ───────────────────────────────────────────────────────────────────────────────
  // SEED
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Seed subjects for all exams. Resolves exam slugs → ObjectIds.
   * Idempotent — skips if subjects already exist.
   * @returns {Promise<{ seeded: boolean, count: number }>}
   */
  static async seedSubjects() {
    const hasSubjects = await SubjectRepository.hasAny();
    if (hasSubjects) {
      return { seeded: false, count: 0 };
    }

    const allSubjects = [];

    for (const [examSlug, subjects] of Object.entries(SUBJECT_SEEDS)) {
      const exam = await ExamRepository.findBySlug(examSlug);
      if (!exam) {
        console.warn(`[StudyOS] Seed warning: exam "${examSlug}" not found, skipping its subjects`);
        continue;
      }

      for (const subj of subjects) {
        allSubjects.push({ ...subj, examId: exam._id });
      }
    }

    if (allSubjects.length === 0) {
      return { seeded: false, count: 0 };
    }

    const created = await SubjectRepository.bulkCreate(allSubjects);
    console.log(`[StudyOS] Seeded ${created.length} subjects across ${Object.keys(SUBJECT_SEEDS).length} exams`);
    return { seeded: true, count: created.length };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new subject under an exam.
   * @param {object} data - { examId, name, slug, ... }
   * @returns {Promise<object>} Created subject
   * @throws {AppError} 404 if exam not found, 409 if slug duplicate within exam
   */
  static async createSubject(data) {
    // 1. Verify exam exists
    const exam = await ExamRepository.findById(data.examId);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    // 2. Guard — slug must be unique within this exam
    const existing = await SubjectRepository.findByExamAndSlug(data.examId, data.slug);
    if (existing) {
      throw AppError.conflict(
        `Subject with slug "${data.slug}" already exists for this exam`,
        'SUBJECT_SLUG_DUPLICATE'
      );
    }

    return SubjectRepository.create(data);
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get all subjects for a given exam.
   * @param {string} examId
   * @param {boolean} [activeOnly=true]
   * @returns {Promise<Array<object>>}
   * @throws {AppError} 404 if exam not found
   */
  static async getSubjectsByExam(examId, activeOnly = true) {
    // Verify exam exists
    const exam = await ExamRepository.findById(examId);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    const subjects = await SubjectRepository.findByExamId(examId, activeOnly);
    return subjects.map((s) => s.toJSON());
  }

  /**
   * Get all subjects for an exam identified by slug.
   * @param {string} examSlug
   * @returns {Promise<{ exam: object, subjects: Array<object> }>}
   * @throws {AppError} 404 if exam not found
   */
  static async getSubjectsByExamSlug(examSlug) {
    const exam = await ExamRepository.findBySlug(examSlug);
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    const subjects = await SubjectRepository.findByExamId(exam._id, true);

    return {
      exam: exam.toJSON(),
      subjects: subjects.map((s) => s.toJSON()),
    };
  }

  /**
   * Get a single subject by ID (with parent exam populated).
   * @param {string} subjectId
   * @returns {Promise<object>}
   * @throws {AppError} 404 if not found
   */
  static async getSubjectById(subjectId) {
    const subject = await SubjectRepository.findByIdWithExam(subjectId);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }
    return subject.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update a subject.
   * @param {string} subjectId
   * @param {object} updateData
   * @returns {Promise<object>} Updated subject
   * @throws {AppError} 404 if not found, 409 if slug conflict
   */
  static async updateSubject(subjectId, updateData) {
    // If slug is being changed, check for conflicts within the same exam
    if (updateData.slug) {
      const current = await SubjectRepository.findById(subjectId);
      if (!current) {
        throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
      }

      const existing = await SubjectRepository.findByExamAndSlug(current.examId, updateData.slug);
      if (existing && existing._id.toString() !== subjectId) {
        throw AppError.conflict(
          `Subject with slug "${updateData.slug}" already exists for this exam`,
          'SUBJECT_SLUG_DUPLICATE'
        );
      }
    }

    const subject = await SubjectRepository.updateById(subjectId, updateData);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }
    return subject.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete a subject.
   * @param {string} subjectId
   * @returns {Promise<void>}
   * @throws {AppError} 404 if not found
   */
  static async deleteSubject(subjectId) {
    const subject = await SubjectRepository.deleteById(subjectId);
    if (!subject) {
      throw AppError.notFound('Subject not found', 'SUBJECT_NOT_FOUND');
    }
  }

  /**
   * Delete all subjects for an exam (cascade).
   * @param {string} examId
   * @returns {Promise<number>} Number deleted
   */
  static async deleteSubjectsByExam(examId) {
    const result = await SubjectRepository.deleteByExamId(examId);
    return result.deletedCount || 0;
  }
}

module.exports = SubjectService;
