/**
 * StudyOS - StudentStats Model (Mongoose Schema)
 *
 * Persistent gamification profile for each user.
 * Tracks XP, level, milestones reached, and achievements.
 *
 * XP Sources:
 *   - Task completed       : +10 XP
 *   - Chapter completed    : +50 XP
 *   - Chapter mastered     : +100 XP
 *   - Focus session done   : +15 XP
 *   - Revision reviewed    : +5 XP
 *   - Study streak day     : +20 XP
 *
 * Levels:
 *   Level = floor(sqrt(totalXP / 100))
 *   e.g. 100 XP = Lv1, 400 XP = Lv2, 900 XP = Lv3, etc.
 */

const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'syllabus_25', 'syllabus_50', 'syllabus_75', 'syllabus_100',
        'first_chapter', 'first_subject', 'first_plan',
        'streak_7', 'streak_30', 'streak_100',
        'hours_10', 'hours_50', 'hours_100', 'hours_500',
        'focus_master', 'revision_master',
      ],
    },
    label: { type: String, default: '' },
    emoji: { type: String, default: '🏆' },
    reachedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const studentStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ── XP & Level ──────────────────────────────────────────────────────────
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Overall progress ────────────────────────────────────────────────────
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    totalChapters: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedChapters: {
      type: Number,
      default: 0,
      min: 0,
    },

    masteredChapters: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Lifetime counters ───────────────────────────────────────────────────
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },

    totalStudyHours: {
      type: Number,
      default: 0,
    },

    totalFocusSessions: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    // ── Milestones ──────────────────────────────────────────────────────────
    milestones: {
      type: [milestoneSchema],
      default: [],
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

const StudentStats = mongoose.model('StudentStats', studentStatsSchema);

module.exports = StudentStats;
