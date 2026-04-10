/**
 * StudyOS - Topic Repository (Data Access Layer)
 *
 * All direct database interactions for topics are encapsulated here.
 */

const Topic = require('./topic.model');

class TopicRepository {
  /**
   * Create a single topic.
   */
  static async create(data) {
    const topic = await Topic.create(data);
    return topic.toJSON();
  }

  /**
   * Bulk insert topics (used by seeder).
   */
  static async bulkCreate(topics) {
    const result = await Topic.insertMany(topics, { ordered: false });
    return result.map((doc) => doc.toJSON());
  }

  /**
   * Find all topics for a chapter.
   */
  static async findByChapterId(chapterId, activeOnly = true) {
    const filter = { chapterId };
    if (activeOnly) filter.isActive = true;
    return Topic.find(filter).sort({ sortOrder: 1 }).exec();
  }

  /**
   * Find all topics for a subject (cross-chapter).
   */
  static async findBySubjectId(subjectId, filters = {}) {
    const query = { subjectId };
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    return Topic.find(query).sort({ chapterId: 1, sortOrder: 1 }).exec();
  }

  /**
   * Find all topics for an exam.
   */
  static async findByExamId(examId) {
    return Topic.find({ examId, isActive: true })
      .sort({ subjectId: 1, chapterId: 1, sortOrder: 1 })
      .exec();
  }

  /**
   * Find topic by ID.
   */
  static async findById(id) {
    return Topic.findById(id).exec();
  }

  /**
   * Find topic by ID with populated parents.
   */
  static async findByIdPopulated(id) {
    return Topic.findById(id)
      .populate('chapterId', 'name slug difficulty')
      .populate('subjectId', 'name slug icon color')
      .populate('examId', 'name slug category')
      .exec();
  }

  /**
   * Find topic by slug within a chapter.
   */
  static async findByChapterAndSlug(chapterId, slug) {
    return Topic.findOne({ chapterId, slug: slug.toLowerCase() }).exec();
  }

  /**
   * Update topic by ID.
   */
  static async updateById(id, updateData) {
    return Topic.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete topic by ID.
   */
  static async deleteById(id) {
    return Topic.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all topics for a chapter (cascade).
   */
  static async deleteByChapterId(chapterId) {
    return Topic.deleteMany({ chapterId });
  }

  /**
   * Count topics for a chapter.
   */
  static async countByChapterId(chapterId) {
    return Topic.countDocuments({ chapterId });
  }

  /**
   * Check if any topics exist.
   */
  static async hasAny() {
    const count = await Topic.countDocuments();
    return count > 0;
  }
}

module.exports = TopicRepository;
