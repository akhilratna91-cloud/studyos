/**
 * StudyOS - StudyGoal Model (Mongoose Schema)
 *
 * Tracks weekly/monthly study time goals.
 * One active goal per user per period type.
 */

const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Goal config ─────────────────────────────────────────────────────────
    periodType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },

    targetMinutes: {
      type: Number,
      required: [true, 'Target minutes required'],
      min: 5,
      max: 6000, // 100 hours max
    },

    // ── Current progress ────────────────────────────────────────────────────
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Period boundaries ───────────────────────────────────────────────────
    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    // ── Status ──────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    achieved: {
      type: Boolean,
      default: false,
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

studyGoalSchema.index({ userId: 1, periodType: 1, isActive: 1 });

const StudyGoal = mongoose.model('StudyGoal', studyGoalSchema);

module.exports = StudyGoal;
