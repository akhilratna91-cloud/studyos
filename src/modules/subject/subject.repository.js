/**
 * StudyOS - Subject Repository (Data Access Layer)
 *
 * All direct database interactions for subjects are encapsulated here.
 */

const Subject = require('./subject.model');

class SubjectRepository {
  /**
   * Create a single subject.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create(data) {
    const subject = await Subject.create(data);
    return subject.toJSON();
  }

  /**
   * Bulk insert subjects (used by seeder).
   * @param {Array<object>} subjects
   * @returns {Promise<Array<object>>}
   */
  static async bulkCreate(subjects) {
    const result = await Subject.insertMany(subjects, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find all subjects for a given exam.
   * @param {string} examId
   * @param {boolean} [activeOnly=true]
   * @returns {Promise<Array<object>>}
   */
  static async findByExamId(examId, activeOnly = true) {
    const filter = { examId };
    if (activeOnly) filter.isActive = true;
    return Subject.find(filter).sort({ sortOrder: 1 }).exec();
  }

  /**
   * Find subject by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return Subject.findById(id).exec();
  }

  /**
   * Find subject by ID and populate the parent exam.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findByIdWithExam(id) {
    return Subject.findById(id).populate('examId', 'name slug category').exec();
  }

  /**
   * Find subject by slug within a specific exam.
   * @param {string} examId
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  static async findByExamAndSlug(examId, slug) {
    return Subject.findOne({ examId, slug: slug.toLowerCase() }).exec();
  }

  /**
   * Update subject by ID.
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async updateById(id, updateData) {
    return Subject.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete subject by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async deleteById(id) {
    return Subject.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all subjects for an exam (cascade).
   * @param {string} examId
   * @returns {Promise<{ deletedCount: number }>}
   */
  static async deleteByExamId(examId) {
    return Subject.deleteMany({ examId });
  }

  /**
   * Count subjects for an exam.
   * @param {string} examId
   * @returns {Promise<number>}
   */
  static async countByExamId(examId) {
    return Subject.countDocuments({ examId });
  }

  /**
   * Check if any subjects exist in the database.
   * @returns {Promise<boolean>}
   */
  static async hasAny() {
    const count = await Subject.countDocuments();
    return count > 0;
  }
}

module.exports = SubjectRepository;
