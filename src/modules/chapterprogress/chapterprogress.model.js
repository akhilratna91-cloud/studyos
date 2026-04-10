/**
 * StudyOS - ChapterProgress Model (Mongoose Schema)
 *
 * Persistent per-user, per-chapter completion record.
 * Unlike on-the-fly analytics, this is the source of truth for
 * "has this student completed this chapter?"
 *
 * Fields:
 *   - userId, examId, subjectId, chapterId : full hierarchy
 *   - status       : not_started / in_progress / completed / mastered
 *   - completionRate: 0-100 (%) based on tasks done
 *   - totalTasks, completedTasks : task counters
 *   - totalMinutes, completedMinutes : time counters
 *   - mastery      : none / basic / intermediate / advanced / expert
 *   - startedAt, completedAt : lifecycle timestamps
 *   - lastStudiedAt : most recent study activity
 */

const mongoose = require('mongoose');

const chapterProgressSchema = new mongoose.Schema(
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
      index: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
    },

    // ── Denormalized ────────────────────────────────────────────────────────
    subjectName:  { type: String, default: '' },
    subjectIcon:  { type: String, default: '📘' },
    subjectColor: { type: String, default: '#4F46E5' },
    chapterName:  { type: String, default: '' },
    chapterSlug:  { type: String, default: '' },
    difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

    // ── Completion state ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'mastered'],
      default: 'not_started',
      index: true,
    },

    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Task counters ───────────────────────────────────────────────────────
    totalTasks: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedTasks: {
      type: Number,
      min: 0,
      default: 0,
    },

    skippedTasks: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ── Time tracking ───────────────────────────────────────────────────────
    totalMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ── Mastery level ───────────────────────────────────────────────────────
    mastery: {
      type: String,
      enum: ['none', 'basic', 'intermediate', 'advanced', 'expert'],
      default: 'none',
    },

    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // ── Timestamps ──────────────────────────────────────────────────────────
    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastStudiedAt: {
      type: Date,
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

// One progress record per user per chapter
chapterProgressSchema.index({ userId: 1, chapterId: 1 }, { unique: true });
chapterProgressSchema.index({ userId: 1, examId: 1, subjectId: 1 });
chapterProgressSchema.index({ userId: 1, status: 1 });

const ChapterProgress = mongoose.model('ChapterProgress', chapterProgressSchema);

module.exports = ChapterProgress;
