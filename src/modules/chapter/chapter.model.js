/**
 * StudyOS - Chapter Model (Mongoose Schema)
 *
 * Represents a chapter linked to a subject. Chapters are the fundamental
 * study units — topics, questions, and progress tracking reference them.
 *
 * Relationship:  Exam (1) ──▸ (N) Subject (1) ──▸ (N) Chapter
 *
 * Fields:
 *   - subjectId      : reference to Subject (required, indexed)
 *   - examId         : denormalized reference to Exam (for fast cross-exam queries)
 *   - name           : display name (e.g. "Kinematics")
 *   - slug           : URL-safe key scoped to subject (e.g. "kinematics")
 *   - description    : short about text
 *   - difficulty     : easy / medium / hard
 *   - weightage      : percentage weight of this chapter in the subject
 *   - estimatedHours : estimated study time in hours
 *   - totalTopics    : number of topics in this chapter (cached count)
 *   - sortOrder      : controls display ordering within a subject
 *   - isActive       : soft-enable/disable
 */

const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Chapter name is required'],
      trim: true,
      maxlength: [150, 'Chapter name cannot exceed 150 characters'],
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

    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty. Must be easy, medium, or hard.',
      },
      default: 'medium',
    },

    weightage: {
      type: Number,
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100'],
      default: 0,
    },

    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      default: 0,
    },

    totalTopics: {
      type: Number,
      min: [0, 'Total topics cannot be negative'],
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

// Compound unique: slug must be unique per subject
chapterSchema.index({ subjectId: 1, slug: 1 }, { unique: true });

// Common query: active chapters for a subject, sorted
chapterSchema.index({ subjectId: 1, isActive: 1, sortOrder: 1 });

// Cross-exam query: all chapters for an exam
chapterSchema.index({ examId: 1, difficulty: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
