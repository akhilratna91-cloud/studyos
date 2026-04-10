/**
 * StudyOS - Chapter Repository (Data Access Layer)
 *
 * All direct database interactions for chapters are encapsulated here.
 */

const Chapter = require('./chapter.model');

class ChapterRepository {
  /**
   * Create a single chapter.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create(data) {
    const chapter = await Chapter.create(data);
    return chapter.toJSON();
  }

  /**
   * Bulk insert chapters (used by seeder).
   * @param {Array<object>} chapters
   * @returns {Promise<Array<object>>}
   */
  static async bulkCreate(chapters) {
    const result = await Chapter.insertMany(chapters, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find all chapters for a given subject.
   * @param {string} subjectId
   * @param {boolean} [activeOnly=true]
   * @returns {Promise<Array<object>>}
   */
  static async findBySubjectId(subjectId, activeOnly = true) {
    const filter = { subjectId };
    if (activeOnly) filter.isActive = true;
    return Chapter.find(filter).sort({ sortOrder: 1 }).exec();
  }

  /**
   * Find all chapters for an exam (denormalized query).
   * @param {string} examId
   * @param {object} [filters={}] - { difficulty, isActive }
   * @returns {Promise<Array<object>>}
   */
  static async findByExamId(examId, filters = {}) {
    const query = { examId };
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    return Chapter.find(query).sort({ subjectId: 1, sortOrder: 1 }).exec();
  }

  /**
   * Find chapter by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return Chapter.findById(id).exec();
  }

  /**
   * Find chapter by ID with populated parent subject and exam.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findByIdPopulated(id) {
    return Chapter.findById(id)
      .populate('subjectId', 'name slug icon color')
      .populate('examId', 'name slug category')
      .exec();
  }

  /**
   * Find chapter by slug within a specific subject.
   * @param {string} subjectId
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  static async findBySubjectAndSlug(subjectId, slug) {
    return Chapter.findOne({ subjectId, slug: slug.toLowerCase() }).exec();
  }

  /**
   * Update chapter by ID.
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async updateById(id, updateData) {
    return Chapter.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete chapter by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async deleteById(id) {
    return Chapter.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all chapters for a subject (cascade).
   * @param {string} subjectId
   * @returns {Promise<{ deletedCount: number }>}
   */
  static async deleteBySubjectId(subjectId) {
    return Chapter.deleteMany({ subjectId });
  }

  /**
   * Count chapters for a subject.
   * @param {string} subjectId
   * @returns {Promise<number>}
   */
  static async countBySubjectId(subjectId) {
    return Chapter.countDocuments({ subjectId });
  }

  /**
   * Check if any chapters exist.
   * @returns {Promise<boolean>}
   */
  static async hasAny() {
    const count = await Chapter.countDocuments();
    return count > 0;
  }
}

module.exports = ChapterRepository;
