/**
 * StudyOS - StudySession Model (Mongoose Schema)
 *
 * Records individual study sessions — when a student actually studies.
 * Captures actual time spent (vs. allocated), enabling accuracy analytics.
 *
 * Fields:
 *   - userId, taskId          : who and which task
 *   - examId, subjectId, chapterId : denormalized for analytics
 *   - startedAt, completedAt : actual session timestamps
 *   - allocatedMinutes       : what was planned
 *   - actualMinutes          : what was actually spent
 *   - status                 : completed / abandoned
 *   - rating                 : self-rated understanding (1–5)
 *   - notes                  : session notes
 */

const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyTask',
      default: null,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
    },

    // ── Denormalized ────────────────────────────────────────────────────────
    subjectName:  { type: String, default: '' },
    subjectIcon:  { type: String, default: '📘' },
    subjectColor: { type: String, default: '#4F46E5' },
    chapterName:  { type: String, default: '' },

    // ── Time tracking ───────────────────────────────────────────────────────
    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    allocatedMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    actualMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ── Student feedback ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
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

studySessionSchema.index({ userId: 1, startedAt: -1 });
studySessionSchema.index({ userId: 1, examId: 1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession;
