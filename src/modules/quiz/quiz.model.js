/**
 * StudyOS - Quiz Model (Mongoose Schema)
 *
 * A Quiz is a first-class entity: a timed, scored set of questions.
 *
 * Types:
 *   - chapter_quiz  : Questions from a single chapter
 *   - subject_quiz  : Mixed from a subject
 *   - mock_test     : Full exam-style test
 *   - custom        : User-picked questions
 *
 * QuizAttempt tracks a user's answers, score, and timing.
 */

const mongoose = require('mongoose');

// ─── Quiz Template ──────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title max 200 characters'],
    },

    type: {
      type: String,
      enum: ['chapter_quiz', 'subject_quiz', 'mock_test', 'custom'],
      default: 'chapter_quiz',
      index: true,
    },

    // ── Hierarchy ───────────────────────────────────────────────────────────
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },

    // Denormalized
    subjectName: { type: String, default: '' },
    subjectIcon: { type: String, default: '📘' },
    chapterName: { type: String, default: '' },

    // ── Questions ───────────────────────────────────────────────────────────
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }],

    totalQuestions: {
      type: Number,
      min: 1,
      max: 200,
    },

    // ── Configuration ───────────────────────────────────────────────────────
    timeLimitMinutes: {
      type: Number,
      default: 30,
      min: 1,
      max: 300,
    },

    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },

    shuffleQuestions: {
      type: Boolean,
      default: true,
    },

    showExplanation: {
      type: Boolean,
      default: true,
    },

    // ── Creator ─────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id; delete ret._id; delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        ret.id = ret._id; delete ret._id; delete ret.__v;
        return ret;
      },
    },
  }
);

quizSchema.index({ createdBy: 1, type: 1 });

// ─── Quiz Attempt ───────────────────────────────────────────────────────────────
const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: Number, min: 0, max: 3, default: null },
    isCorrect: { type: Boolean, default: false },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Status ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'timed_out', 'abandoned'],
      default: 'in_progress',
      index: true,
    },

    // ── Answers ─────────────────────────────────────────────────────────────
    answers: {
      type: [answerSchema],
      default: [],
    },

    // ── Score ───────────────────────────────────────────────────────────────
    totalQuestions: { type: Number, default: 0 },
    answered: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    // ── Timing ──────────────────────────────────────────────────────────────
    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    timeTakenMinutes: {
      type: Number,
      default: 0,
    },

    timeLimitMinutes: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id; delete ret._id; delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        ret.id = ret._id; delete ret._id; delete ret.__v;
        return ret;
      },
    },
  }
);

quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, status: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };
