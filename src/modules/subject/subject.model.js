/**
 * StudyOS - Subject Model (Mongoose Schema)
 *
 * Represents a subject linked to an exam. Subjects are first-class
 * documents — not just strings on the Exam model — so that other modules
 * (chapters, topics, questions, study plans) can reference them directly.
 *
 * Relationship:  Exam (1) ──▸ (N) Subject
 *
 * Fields:
 *   - examId      : reference to Exam (required, indexed)
 *   - name        : display name (e.g. "Physics")
 *   - slug        : URL-safe key scoped to exam (e.g. "physics")
 *   - description : short about text
 *   - icon        : icon identifier / emoji for the frontend
 *   - color       : hex colour used in the UI (e.g. "#4F46E5")
 *   - weightage   : percentage weight of this subject in the exam
 *   - totalMarks  : maximum marks for this subject
 *   - sortOrder   : controls display ordering within an exam
 *   - isActive    : soft-enable/disable
 */

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      required: [true, 'Slug is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be URL-safe (lowercase letters, numbers, hyphens only)',
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    icon: {
      type: String,
      trim: true,
      default: '📘',
    },

    color: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code'],
      default: '#4F46E5',
    },

    weightage: {
      type: Number,
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100'],
      default: 0,
    },

    totalMarks: {
      type: Number,
      min: [0, 'Total marks cannot be negative'],
      default: 0,
    },

    sortOrder: {
      type: Number,
      default: 0,
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

// Compound unique: slug must be unique per exam (not globally)
subjectSchema.index({ examId: 1, slug: 1 }, { unique: true });

// Common query: active subjects for an exam, sorted
subjectSchema.index({ examId: 1, isActive: 1, sortOrder: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
