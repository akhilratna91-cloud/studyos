/**
 * StudyOS - Exam Repository (Data Access Layer)
 *
 * All direct database interactions for exams are encapsulated here.
 */

const Exam = require('./exam.model');

class ExamRepository {
  /**
   * Create a single exam.
   * @param {object} examData
   * @returns {Promise<object>}
   */
  static async create(examData) {
    const exam = await Exam.create(examData);
    return exam.toJSON();
  }

  /**
   * Bulk insert exams (used by seeder).
   * @param {Array<object>} exams
   * @returns {Promise<Array<object>>}
   */
  static async bulkCreate(exams) {
    const result = await Exam.insertMany(exams, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find all exams, optionally filtered.
   * @param {object} [filter={}] - Mongoose query filter
   * @param {object} [options={}] - { sort, limit, skip }
   * @returns {Promise<Array<object>>}
   */
  static async findAll(filter = {}, options = {}) {
    const { sort = { sortOrder: 1 }, limit, skip } = options;
    let query = Exam.find(filter).sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return query.exec();
  }

  /**
   * Find exam by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return Exam.findById(id).exec();
  }

  /**
   * Find exam by slug.
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  static async findBySlug(slug) {
    return Exam.findOne({ slug: slug.toLowerCase() }).exec();
  }

  /**
   * Find all exams in a given category.
   * @param {string} category
   * @returns {Promise<Array<object>>}
   */
  static async findByCategory(category) {
    return Exam.find({ category, isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  /**
   * Update exam by ID.
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async updateById(id, updateData) {
    return Exam.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete exam by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async deleteById(id) {
    return Exam.findByIdAndDelete(id).exec();
  }

  /**
   * Count exams matching a filter.
   * @param {object} [filter={}]
   * @returns {Promise<number>}
   */
  static async count(filter = {}) {
    return Exam.countDocuments(filter);
  }

  /**
   * Check if any exams exist in the database.
   * @returns {Promise<boolean>}
   */
  static async hasAny() {
    const count = await Exam.countDocuments();
    return count > 0;
  }
}

module.exports = ExamRepository;
