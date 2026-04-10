/**
 * StudyOS - Question Model (Mongoose Schema)
 *
 * Stores MCQ questions linked to the content hierarchy.
 *
 * Structure:
 *   - question     : The question text
 *   - options      : Array of 4 answer choices (A/B/C/D)
 *   - correctAnswer: Index (0-3) of the correct option
 *   - difficulty   : easy / medium / hard
 *   - explanation  : Why the answer is correct
 *   - hint         : Optional hint before revealing answer
 *   - tags         : Searchable tags (e.g., "coulombs-law", "thermodynamics")
 *
 * Linked to: exam → subject → chapter → topic (optional)
 */

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [1000, 'Option text cannot exceed 1000 characters'],
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    // ── Content ─────────────────────────────────────────────────────────────
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [2000, 'Question cannot exceed 2000 characters'],
    },

    options: {
      type: [optionSchema],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Exactly 4 options (A/B/C/D) are required',
      },
    },

    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: 0,
      max: 3,
    },

    explanation: {
      type: String,
      trim: true,
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
      default: '',
    },

    hint: {
      type: String,
      trim: true,
      maxlength: [500, 'Hint cannot exceed 500 characters'],
      default: '',
    },

    // ── Metadata ────────────────────────────────────────────────────────────
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },

    type: {
      type: String,
      enum: ['mcq', 'true_false', 'assertion_reason'],
      default: 'mcq',
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // ── Hierarchy linkage ───────────────────────────────────────────────────
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
      index: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },

    // ── Denormalized names (for fast reads) ──────────────────────────────────
    subjectName: { type: String, default: '' },
    subjectIcon: { type: String, default: '📘' },
    chapterName: { type: String, default: '' },
    topicName:   { type: String, default: '' },

    // ── Stats (updated on quiz submissions) ─────────────────────────────────
    timesAttempted: {
      type: Number,
      default: 0,
      min: 0,
    },

    timesCorrect: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Admin ───────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

questionSchema.index({ chapterId: 1, difficulty: 1 });
questionSchema.index({ subjectId: 1, isActive: 1 });
questionSchema.index({ examId: 1, chapterId: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
