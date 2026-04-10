/**
 * StudyOS - DailyTask Model (Mongoose Schema)
 *
 * The actionable unit a student interacts with daily.
 * Tasks are generated from a study plan's schedule and track completion.
 *
 * Relationship:  StudyPlan ──▸ DailyTask (1:N, one task per session per day)
 *
 * Fields:
 *   - userId         : task owner
 *   - planId         : source study plan
 *   - examId         : denormalized for cross-plan queries
 *   - dayNumber      : which day in the plan (1-indexed)
 *   - date           : calendar date for this task
 *   - subjectId      : the subject this task belongs to
 *   - subjectName    : denormalized display fields
 *   - subjectIcon    : emoji icon
 *   - subjectColor   : hex colour
 *   - chapterId      : the chapter this task covers
 *   - chapterName    : denormalized
 *   - chapterSlug    : for URL linking
 *   - difficulty     : easy / medium / hard
 *   - type           : study / revision / practice / rest
 *   - durationMinutes: allocated study time
 *   - status         : pending / in-progress / completed / skipped
 *   - completedAt    : timestamp when marked complete
 *   - notes          : user's personal notes for the task
 *   - sortOrder      : within the day
 */

const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: [true, 'Plan ID is required'],
      index: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      index: true,
    },

    dayNumber: {
      type: Number,
      required: [true, 'Day number is required'],
      min: 1,
    },

    date: {
      type: Date,
      index: true,
    },

    // ── Subject ───────────────────────────────────────────────────────────────
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    subjectName:  { type: String, default: '' },
    subjectIcon:  { type: String, default: '📘' },
    subjectColor: { type: String, default: '#4F46E5' },

    // ── Chapter ───────────────────────────────────────────────────────────────
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
    },
    chapterName: { type: String, default: '' },
    chapterSlug: { type: String, default: '' },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    type: {
      type: String,
      enum: ['study', 'revision', 'practice', 'rest'],
      default: 'study',
    },

    durationMinutes: {
      type: Number,
      min: 0,
      default: 30,
    },

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped'],
      default: 'pending',
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },

    sortOrder: {
      type: Number,
      default: 0,
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

// User's tasks for a day
dailyTaskSchema.index({ userId: 1, date: 1 });
// User's tasks for a plan
dailyTaskSchema.index({ userId: 1, planId: 1, dayNumber: 1 });
// User's tasks by status
dailyTaskSchema.index({ userId: 1, status: 1 });

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);

module.exports = DailyTask;
