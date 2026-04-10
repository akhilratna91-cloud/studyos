/**
 * StudyOS - Exam Model (Mongoose Schema)
 *
 * Stores exam definitions — the master list of all competitive & board exams
 * the platform supports. Each exam has metadata used by other modules
 * (Profile, Study Plan, Question Bank, etc.).
 *
 * Fields:
 *   - name           : display name (e.g. "JEE Main")
 *   - slug           : URL-safe unique key (e.g. "jee-main")
 *   - category       : grouping (engineering, medical, government, boards)
 *   - description    : short about text
 *   - subjects       : list of subjects covered
 *   - duration       : exam duration in minutes
 *   - totalMarks     : maximum marks
 *   - eligibility    : eligibility criteria text
 *   - officialUrl    : link to official website
 *   - icon           : icon identifier / URL for the frontend
 *   - isActive       : soft-enable/disable (for seasonal exams, deprecated ones)
 *   - sortOrder      : controls display ordering in the UI
 */

const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
      maxlength: [100, 'Exam name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be URL-safe (lowercase letters, numbers, hyphens only)',
      ],
      index: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['engineering', 'medical', 'government', 'banking', 'boards', 'defence', 'law', 'other'],
        message: '{VALUE} is not a valid exam category',
      },
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    subjects: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 30,
        message: 'Cannot have more than 30 subjects',
      },
    },

    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: 0, // minutes
    },

    totalMarks: {
      type: Number,
      min: [0, 'Total marks cannot be negative'],
      default: 0,
    },

    eligibility: {
      type: String,
      trim: true,
      maxlength: [500, 'Eligibility text cannot exceed 500 characters'],
      default: '',
    },

    officialUrl: {
      type: String,
      trim: true,
      default: '',
    },

    icon: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Compound index for common queries (active exams by category, sorted)
examSchema.index({ isActive: 1, category: 1, sortOrder: 1 });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
