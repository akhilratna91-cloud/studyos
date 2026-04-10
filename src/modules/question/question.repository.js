/**
 * StudyOS - Question Repository (Data Access Layer)
 */

const Question = require('./question.model');

class QuestionRepository {
  static async create(data) {
    const question = await Question.create(data);
    return question.toJSON();
  }

  static async createMany(dataArray) {
    const questions = await Question.insertMany(dataArray);
    return questions.map((q) => q.toJSON());
  }

  static async findById(id) {
    return Question.findById(id).exec();
  }

  static async findByChapter(chapterId, filters = {}) {
    const query = { chapterId, isActive: true };
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.type) query.type = filters.type;

    return Question.find(query)
      .sort({ difficulty: 1, createdAt: -1 })
      .exec();
  }

  static async findBySubject(subjectId, filters = {}) {
    const query = { subjectId, isActive: true };
    if (filters.difficulty) query.difficulty = filters.difficulty;

    return Question.find(query)
      .sort({ chapterName: 1, difficulty: 1 })
      .exec();
  }

  static async findByExam(examId, filters = {}) {
    const query = { examId, isActive: true };
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.subjectId) query.subjectId = filters.subjectId;

    return Question.find(query)
      .sort({ subjectName: 1, chapterName: 1 })
      .exec();
  }

  static async findByTopic(topicId) {
    return Question.find({ topicId, isActive: true })
      .sort({ difficulty: 1 })
      .exec();
  }

  static async findByTags(tags, examId = null) {
    const query = { tags: { $in: tags }, isActive: true };
    if (examId) query.examId = examId;
    return Question.find(query).sort({ createdAt: -1 }).exec();
  }

  static async getRandomByChapter(chapterId, count = 10, difficulty = null) {
    const match = { chapterId, isActive: true };
    if (difficulty) match.difficulty = difficulty;

    return Question.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);
  }

  static async getRandomBySubject(subjectId, count = 10, difficulty = null) {
    const match = { subjectId, isActive: true };
    if (difficulty) match.difficulty = difficulty;

    return Question.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);
  }

  static async updateById(id, data) {
    return Question.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  static async deleteById(id) {
    return Question.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  static async getStats(examId) {
    return Question.aggregate([
      { $match: { examId, isActive: true } },
      {
        $group: {
          _id: { subjectId: '$subjectId', difficulty: '$difficulty' },
          subjectName: { $first: '$subjectName' },
          subjectIcon: { $first: '$subjectIcon' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.subjectId': 1, '_id.difficulty': 1 } },
    ]);
  }

  static async countByChapter(chapterId) {
    return Question.countDocuments({ chapterId, isActive: true });
  }

  static async incrementAttempt(questionId, isCorrect) {
    const update = { $inc: { timesAttempted: 1 } };
    if (isCorrect) update.$inc.timesCorrect = 1;
    return Question.findByIdAndUpdate(questionId, update, { new: true }).exec();
  }

  static async hasAny() {
    const count = await Question.countDocuments();
    return count > 0;
  }

  static async count() {
    return Question.countDocuments();
  }
}

module.exports = QuestionRepository;
