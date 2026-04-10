/**
 * StudyOS - RevisionCard Model (Mongoose Schema)
 *
 * Tracks the spaced repetition state for each chapter/topic a user studies.
 * Based on the SM-2 algorithm (SuperMemo) with modifications for study planning.
 *
 * Each card represents a "memory" of a chapter the student has studied.
 * The engine schedules the next review based on performance history.
 *
 * SM-2 Fields:
 *   - easeFactor   : multiplier for interval growth (starts at 2.5, min 1.3)
 *   - interval     : days until next review
 *   - repetition   : number of successful consecutive reviews
 *   - quality      : last review quality (0–5 scale)
 *
 * Platform Fields:
 *   - userId, examId, subjectId, chapterId  : hierarchy references
 *   - status       : new / learning / review / mastered
 *   - nextReviewAt : when to show this card next
 *   - lastReviewAt : when it was last reviewed
 *   - isWeak       : flagged as a weak area (quality < 3)
 *   - reviewCount  : total number of reviews
 *   - streakCount  : consecutive successful reviews
 */

const mongoose = require('mongoose');

const revisionCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

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
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
    },

    // ── Denormalized display fields ──────────────────────────────────────────
    subjectName:  { type: String, default: '' },
    subjectIcon:  { type: String, default: '📘' },
    subjectColor: { type: String, default: '#4F46E5' },
    chapterName:  { type: String, default: '' },
    chapterSlug:  { type: String, default: '' },
    difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

    // ── SM-2 Algorithm State ─────────────────────────────────────────────────
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },

    interval: {
      type: Number,
      default: 0,    // days until next review
      min: 0,
    },

    repetition: {
      type: Number,
      default: 0,    // successful consecutive reviews
      min: 0,
    },

    quality: {
      type: Number,
      default: 0,    // last review quality (0–5)
      min: 0,
      max: 5,
    },

    // ── Scheduling ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['new', 'learning', 'review', 'mastered'],
      default: 'new',
      index: true,
    },

    nextReviewAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastReviewAt: {
      type: Date,
      default: null,
    },

    // ── Analytics ────────────────────────────────────────────────────────────
    isWeak: {
      type: Boolean,
      default: false,
      index: true,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviewHistory: {
      type: [{
        date:     { type: Date },
        quality:  { type: Number, min: 0, max: 5 },
        interval: { type: Number },
        _id: false,
      }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 100,
        message: 'Review history cannot exceed 100 entries',
      },
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

// Each user has one card per chapter
revisionCardSchema.index({ userId: 1, chapterId: 1 }, { unique: true });
// Due reviews query
revisionCardSchema.index({ userId: 1, nextReviewAt: 1, status: 1 });
// Weak topics
revisionCardSchema.index({ userId: 1, isWeak: 1 });
// By exam
revisionCardSchema.index({ userId: 1, examId: 1, status: 1 });

const RevisionCard = mongoose.model('RevisionCard', revisionCardSchema);

module.exports = RevisionCard;
