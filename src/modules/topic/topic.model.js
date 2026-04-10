/**
 * StudyOS - Topic Model (Mongoose Schema)
 *
 * The leaf node of the content hierarchy. Topics are the smallest
 * study units that users interact with — each maps to a specific
 * concept, formula, or learning objective within a chapter.
 *
 * Hierarchy:  Exam ──▸ Subject ──▸ Chapter ──▸ Topic
 *
 * Fields:
 *   - chapterId      : reference to Chapter (required, indexed)
 *   - subjectId      : denormalized reference to Subject
 *   - examId         : denormalized reference to Exam
 *   - name           : display name (e.g. "Projectile Motion")
 *   - slug           : URL-safe key scoped to chapter
 *   - description    : brief explanation of what the topic covers
 *   - difficulty     : easy / medium / hard
 *   - weightage      : percentage weight within the chapter
 *   - estimatedMinutes : estimated study time in minutes
 *   - keyFormulas    : list of key formulas / takeaways
 *   - prerequisites  : slugs of prerequisite topics (within same chapter)
 *   - sortOrder      : controls display ordering within a chapter
 *   - isActive       : soft-enable/disable
 */

const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
      index: true,
    },

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
      required: [true, 'Topic name is required'],
      trim: true,
      maxlength: [200, 'Topic name cannot exceed 200 characters'],
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
      maxlength: [600, 'Description cannot exceed 600 characters'],
      default: '',
    },

    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty.',
      },
      default: 'medium',
    },

    weightage: {
      type: Number,
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100'],
      default: 0,
    },

    estimatedMinutes: {
      type: Number,
      min: [0, 'Estimated minutes cannot be negative'],
      default: 30,
    },

    keyFormulas: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 key formulas',
      },
    },

    prerequisites: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Cannot have more than 10 prerequisites',
      },
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

// Compound unique: slug must be unique per chapter
topicSchema.index({ chapterId: 1, slug: 1 }, { unique: true });

// Common query: active topics for a chapter, sorted
topicSchema.index({ chapterId: 1, isActive: 1, sortOrder: 1 });

// Cross-level queries
topicSchema.index({ subjectId: 1, difficulty: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
