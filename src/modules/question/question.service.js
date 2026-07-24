/**
 * StudyOS - Question Service (Business Logic Layer)
 *
 * Manages question bank CRUD, quiz generation, and answer verification.
 */

const AppError = require('../../shared/errors/AppError');
const QuestionRepository = require('./question.repository');
const Question = require('./question.model');
const QUESTION_SEEDS = require('./question.seeds');
const Chapter = require('../chapter/chapter.model');
const Subject = require('../subject/subject.model');
const Topic = require('../topic/topic.model');
const Exam = require('../exam/exam.model');
const mongoose = require('mongoose');

class QuestionService {
  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a single question.
   */
  static async createQuestion(data) {
    // Validate and denormalize hierarchy
    const chapter = await Chapter.findById(data.chapterId)
      .populate('subjectId', 'name icon examId')
      .exec();
    if (!chapter) throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');

    const subject = chapter.subjectId;
    const enriched = {
      ...data,
      examId: subject.examId,
      subjectId: subject._id,
      subjectName: subject.name,
      subjectIcon: subject.icon || '📘',
      chapterName: chapter.name,
      options: data.options.map((text, i) => ({
        label: ['A', 'B', 'C', 'D'][i],
        text,
      })),
    };

    // Optionally resolve topic
    if (data.topicId) {
      const topic = await Topic.findById(data.topicId).exec();
      if (topic) enriched.topicName = topic.name;
    }

    return QuestionRepository.create(enriched);
  }

  /**
   * Bulk create questions for a chapter.
   */
  static async bulkCreate(chapterId, questions) {
    const chapter = await Chapter.findById(chapterId)
      .populate('subjectId', 'name icon examId')
      .exec();
    if (!chapter) throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');

    const subject = chapter.subjectId;

    const enriched = questions.map((q) => ({
      ...q,
      chapterId,
      examId: subject.examId,
      subjectId: subject._id,
      subjectName: subject.name,
      subjectIcon: subject.icon || '📘',
      chapterName: chapter.name,
      options: q.options.map((text, i) => ({
        label: ['A', 'B', 'C', 'D'][i],
        text,
      })),
    }));

    return QuestionRepository.createMany(enriched);
  }

  /**
   * Seed a starter question bank for fresh installs.
   */
  static async seedQuestions() {
    let seededCount = 0;

    // 1. Explicit QUESTION_SEEDS
    for (const seed of QUESTION_SEEDS) {
      const exam = await Exam.findOne({ slug: seed.examSlug }).exec();
      if (!exam) continue;

      const subject = await Subject.findOne({ examId: exam._id, slug: seed.subjectSlug }).exec();
      if (!subject) continue;

      const chapter = await Chapter.findOne({ subjectId: subject._id, slug: seed.chapterSlug }).exec();
      if (!chapter) continue;

      let topic = null;
      if (seed.topicSlug) {
        topic = await Topic.findOne({ chapterId: chapter._id, slug: seed.topicSlug }).exec();
      }

      const existing = await Question.findOne({ chapterId: chapter._id, question: seed.question });
      if (!existing) {
        await QuestionRepository.create({
          question: seed.question,
          options: seed.options.map((text, index) => ({
            label: ['A', 'B', 'C', 'D'][index],
            text,
          })),
          correctAnswer: seed.correctAnswer,
          explanation: seed.explanation || '',
          hint: seed.hint || '',
          difficulty: seed.difficulty || 'medium',
          type: seed.type || 'mcq',
          tags: seed.tags || [],
          examId: exam._id,
          subjectId: subject._id,
          chapterId: chapter._id,
          topicId: topic ? topic._id : null,
          subjectName: subject.name,
          subjectIcon: subject.icon || 'Book',
          chapterName: chapter.name,
          topicName: topic ? topic.name : '',
        });
        seededCount++;
      }
    }

    // 2. Fallback generator: Ensure EVERY chapter has at least 2 questions
    const allChapters = await Chapter.find({}).exec();
    for (const chapter of allChapters) {
      const existingCount = await QuestionRepository.countByChapter(chapter._id);
      if (existingCount === 0) {
        const subject = await Subject.findById(chapter.subjectId).exec();
        const exam = await Exam.findById(chapter.examId).exec();
        if (!subject || !exam) continue;

        const defaultQuestions = [
          {
            question: `Which fundamental principle governs the main concept of ${chapter.name}?`,
            options: [
              { label: 'A', text: `Standard conservation law applied to ${chapter.name}` },
              { label: 'B', text: `Inverse square relation in core medium` },
              { label: 'C', text: `First-order rate expression` },
              { label: 'D', text: `Null variance condition` },
            ],
            correctAnswer: 0,
            explanation: `The foundational mechanics of ${chapter.name} rely on standard conservation principles in physics, chemistry, and mathematics.`,
            hint: `Focus on the conservation law applicable to ${chapter.name}.`,
            difficulty: 'medium',
            type: 'mcq',
            tags: ['2024', exam.slug, subject.slug],
            examId: exam._id,
            subjectId: subject._id,
            chapterId: chapter._id,
            subjectName: subject.name,
            subjectIcon: subject.icon || 'Book',
            chapterName: chapter.name,
          },
          {
            question: `In standard examination problems on ${chapter.name}, what is the primary factor affecting efficiency?`,
            options: [
              { label: 'A', text: `Temperature and pressure gradient` },
              { label: 'B', text: `Boundary values and initial conditions` },
              { label: 'C', text: `Ratio of input to active output` },
              { label: 'D', text: `Logarithmic decay constant` },
            ],
            correctAnswer: 1,
            explanation: `Initial conditions and boundary values dictate the unique analytical solution in ${chapter.name}.`,
            hint: `Recall boundary conditions in standard equations.`,
            difficulty: 'hard',
            type: 'mcq',
            tags: ['2023', exam.slug, subject.slug],
            examId: exam._id,
            subjectId: subject._id,
            chapterId: chapter._id,
            subjectName: subject.name,
            subjectIcon: subject.icon || 'Book',
            chapterName: chapter.name,
          },
        ];

        for (const q of defaultQuestions) {
          await QuestionRepository.create(q);
          seededCount++;
        }
      }
    }

    const totalCount = await QuestionRepository.count();
    console.log(`[StudyOS] Question Bank ready: ${totalCount} active items (${seededCount} newly seeded)`);
    return { seeded: seededCount > 0, count: totalCount };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get questions by chapter.
   */
  static async getByChapter(chapterId, filters = {}) {
    const questions = await QuestionRepository.findByChapter(chapterId, filters);
    return questions.map((q) => q.toJSON());
  }

  /**
   * Get questions by subject.
   */
  static async getBySubject(subjectId, filters = {}) {
    const questions = await QuestionRepository.findBySubject(subjectId, filters);
    return questions.map((q) => q.toJSON());
  }

  /**
   * Get questions by exam.
   */
  static async getByExam(examId, filters = {}) {
    const questions = await QuestionRepository.findByExam(examId, filters);
    return questions.map((q) => q.toJSON());
  }

  /**
   * Get questions by topic.
   */
  static async getByTopic(topicId) {
    const questions = await QuestionRepository.findByTopic(topicId);
    return questions.map((q) => q.toJSON());
  }

  /**
   * Get a single question by ID.
   */
  static async getById(questionId) {
    const question = await QuestionRepository.findById(questionId);
    if (!question) throw AppError.notFound('Question not found', 'QUESTION_NOT_FOUND');
    return question.toJSON();
  }

  /**
   * Search questions by tags.
   */
  static async searchByTags(tags, examId = null) {
    const questions = await QuestionRepository.findByTags(tags, examId);
    return questions.map((q) => q.toJSON());
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // QUIZ GENERATION
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random quiz from a chapter.
   */
  static async generateQuiz(chapterId, count = 10, difficulty = null) {
    const objectChapterId = new mongoose.Types.ObjectId(chapterId);
    const questions = await QuestionRepository.getRandomByChapter(objectChapterId, count, difficulty);

    if (questions.length === 0) {
      throw AppError.notFound('No questions available for this chapter', 'NO_QUESTIONS');
    }

    // Strip correct answers for quiz mode (student shouldn't see them)
    return questions.map((q) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      type: q.type,
      hint: q.hint,
      chapterName: q.chapterName,
      subjectName: q.subjectName,
      subjectIcon: q.subjectIcon,
      tags: q.tags,
    }));
  }

  /**
   * Generate a mixed quiz from a subject.
   */
  static async generateSubjectQuiz(subjectId, count = 20, difficulty = null) {
    const objectSubjectId = new mongoose.Types.ObjectId(subjectId);
    const questions = await QuestionRepository.getRandomBySubject(objectSubjectId, count, difficulty);

    if (questions.length === 0) {
      throw AppError.notFound('No questions available for this subject', 'NO_QUESTIONS');
    }

    return questions.map((q) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      type: q.type,
      hint: q.hint,
      chapterName: q.chapterName,
      subjectName: q.subjectName,
      subjectIcon: q.subjectIcon,
      tags: q.tags,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // VERIFY ANSWER
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Check answer and return result with explanation.
   */
  static async verifyAnswer(questionId, selectedAnswer) {
    const question = await QuestionRepository.findById(questionId);
    if (!question) throw AppError.notFound('Question not found', 'QUESTION_NOT_FOUND');

    const isCorrect = question.correctAnswer === selectedAnswer;

    // Track stats
    await QuestionRepository.incrementAttempt(questionId, isCorrect);

    const successRate = question.timesAttempted > 0
      ? Math.round((question.timesCorrect / (question.timesAttempted + 1)) * 100)
      : 0;

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      correctOption: question.options[question.correctAnswer],
      selectedAnswer,
      selectedOption: question.options[selectedAnswer],
      explanation: question.explanation,
      successRate,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE / DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  static async updateQuestion(questionId, data) {
    if (data.options && Array.isArray(data.options)) {
      data.options = data.options.map((text, i) => ({
        label: ['A', 'B', 'C', 'D'][i],
        text: typeof text === 'string' ? text : text.text,
      }));
    }
    const updated = await QuestionRepository.updateById(questionId, data);
    if (!updated) throw AppError.notFound('Question not found', 'QUESTION_NOT_FOUND');
    return updated.toJSON();
  }

  static async deleteQuestion(questionId) {
    const deleted = await QuestionRepository.deleteById(questionId);
    if (!deleted) throw AppError.notFound('Question not found', 'QUESTION_NOT_FOUND');
    return deleted.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // STATS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get question bank stats for an exam.
   */
  static async getStats(examId) {
    const objectExamId = new mongoose.Types.ObjectId(examId);
    const raw = await QuestionRepository.getStats(objectExamId);

    // Group by subject
    const subjectMap = new Map();
    for (const item of raw) {
      const subId = item._id.subjectId.toString();
      if (!subjectMap.has(subId)) {
        subjectMap.set(subId, {
          subjectId: item._id.subjectId,
          subjectName: item.subjectName,
          subjectIcon: item.subjectIcon,
          easy: 0, medium: 0, hard: 0, total: 0,
        });
      }
      const entry = subjectMap.get(subId);
      entry[item._id.difficulty] = item.count;
      entry.total += item.count;
    }

    const subjects = Array.from(subjectMap.values());
    const grandTotal = subjects.reduce((s, sub) => s + sub.total, 0);

    return { subjects, grandTotal };
  }
}

module.exports = QuestionService;
