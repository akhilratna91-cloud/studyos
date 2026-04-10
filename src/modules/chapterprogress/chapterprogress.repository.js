/**
 * StudyOS - ChapterProgress Repository (Data Access Layer)
 */

const ChapterProgress = require('./chapterprogress.model');

class ChapterProgressRepository {
  /**
   * Upsert — create or update a progress record.
   */
  static async upsert(userId, chapterId, data) {
    return ChapterProgress.findOneAndUpdate(
      { userId, chapterId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  /**
   * Find by user and chapter.
   */
  static async findByUserAndChapter(userId, chapterId) {
    return ChapterProgress.findOne({ userId, chapterId }).exec();
  }

  /**
   * Find all chapters for a subject.
   */
  static async findBySubject(userId, subjectId) {
    return ChapterProgress.find({ userId, subjectId })
      .sort({ chapterName: 1 })
      .exec();
  }

  /**
   * Find all chapters for an exam.
   */
  static async findByExam(userId, examId) {
    return ChapterProgress.find({ userId, examId })
      .sort({ subjectName: 1, chapterName: 1 })
      .exec();
  }

  /**
   * Find chapters by status.
   */
  static async findByStatus(userId, status, examId = null) {
    const query = { userId, status };
    if (examId) query.examId = examId;
    return ChapterProgress.find(query)
      .sort({ lastStudiedAt: -1 })
      .exec();
  }

  /**
   * Get subject-level rollup.
   */
  static async getSubjectRollup(userId, examId = null) {
    const match = { userId };
    if (examId) match.examId = examId;

    return ChapterProgress.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          subjectColor: { $first: '$subjectColor' },
          totalChapters: { $sum: 1 },
          completedChapters: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
          },
          masteredChapters: {
            $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
          },
          inProgressChapters: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          avgCompletionRate: { $avg: '$completionRate' },
          totalMinutes: { $sum: '$completedMinutes' },
        },
      },
      { $sort: { avgCompletionRate: -1 } },
    ]);
  }

  /**
   * Get exam-level summary.
   */
  static async getExamSummary(userId, examId) {
    return ChapterProgress.aggregate([
      { $match: { userId, examId } },
      {
        $group: {
          _id: null,
          totalChapters: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] },
          },
          mastered: {
            $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] },
          },
          avgCompletionRate: { $avg: '$completionRate' },
          totalMinutes: { $sum: '$completedMinutes' },
          avgRating: { $avg: '$avgRating' },
        },
      },
    ]);
  }

  /**
   * Delete all progress for a user+exam.
   */
  static async deleteByExam(userId, examId) {
    return ChapterProgress.deleteMany({ userId, examId });
  }
}

module.exports = ChapterProgressRepository;
