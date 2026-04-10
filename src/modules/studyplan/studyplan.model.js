/**
 * StudyOS - StudyPlan Model (Mongoose Schema)
 *
 * Stores generated study plans linked to a user.
 * Each plan contains a day-wise schedule with subjects, chapters, and topics.
 *
 * Fields:
 *   - userId        : who the plan belongs to
 *   - examId        : which exam this plan is for
 *   - title         : auto-generated or custom title
 *   - config        : generation parameters (totalDays, hoursPerDay, etc.)
 *   - schedule      : array of day objects, each containing study sessions
 *   - stats         : aggregated statistics for the plan
 *   - status        : draft / active / completed / archived
 */

const mongoose = require('mongoose');

// ─── Session Sub-Schema ─────────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    subjectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: { type: String },
    subjectIcon: { type: String },
    subjectColor:{ type: String },
    chapterId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    chapterName: { type: String },
    chapterSlug: { type: String },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'] },
    durationMinutes: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['study', 'revision', 'practice', 'rest'],
      default: 'study',
    },
  },
  { _id: false }
);

// ─── Day Sub-Schema ─────────────────────────────────────────────────────────────
const daySchema = new mongoose.Schema(
  {
    dayNumber:      { type: Number, required: true },
    date:           { type: Date },
    totalMinutes:   { type: Number, default: 0 },
    sessions:       { type: [sessionSchema], default: [] },
    isRevisionDay:  { type: Boolean, default: false },
    isRestDay:      { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Config Sub-Schema ──────────────────────────────────────────────────────────
const configSchema = new mongoose.Schema(
  {
    totalDays:       { type: Number, required: true },
    hoursPerDay:     { type: Number, required: true },
    startDate:       { type: Date },
    revisionInterval:{ type: Number, default: 7 },   // revision every N days
    restDayInterval: { type: Number, default: 0 },   // 0 = no rest days
    className:       { type: String, default: '' },
  },
  { _id: false }
);

// ─── Stats Sub-Schema ───────────────────────────────────────────────────────────
const statsSchema = new mongoose.Schema(
  {
    totalStudyDays:    { type: Number, default: 0 },
    totalRevisionDays: { type: Number, default: 0 },
    totalRestDays:     { type: Number, default: 0 },
    totalStudyHours:   { type: Number, default: 0 },
    subjectsCount:     { type: Number, default: 0 },
    chaptersCount:     { type: Number, default: 0 },
    easyChapters:      { type: Number, default: 0 },
    mediumChapters:    { type: Number, default: 0 },
    hardChapters:      { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main StudyPlan Schema ──────────────────────────────────────────────────────
const studyPlanSchema = new mongoose.Schema(
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
    },

    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },

    config: {
      type: configSchema,
      required: true,
    },

    schedule: {
      type: [daySchema],
      default: [],
    },

    stats: {
      type: statsSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'active',
      index: true,
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

// Compound: user's plans for an exam
studyPlanSchema.index({ userId: 1, examId: 1 });
studyPlanSchema.index({ userId: 1, status: 1 });

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);

module.exports = StudyPlan;
