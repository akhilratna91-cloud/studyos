/**
 * StudyOS - AdaptiveLog Model (Mongoose Schema)
 *
 * Records every adaptive adjustment made to a study plan.
 * Provides an audit trail so the student can see what changed and why.
 *
 * Fields:
 *   - userId, planId   : who and which plan
 *   - trigger          : what caused the adjustment (manual / auto / scheduled)
 *   - analysis         : snapshot of the analysis that drove the adjustment
 *   - adjustments      : array of specific changes made
 *   - summary          : human-readable summary
 */

const mongoose = require('mongoose');

// ─── Analysis Sub-Schema ────────────────────────────────────────────────────────
const analysisSchema = new mongoose.Schema(
  {
    totalTasks:       { type: Number, default: 0 },
    completedTasks:   { type: Number, default: 0 },
    skippedTasks:     { type: Number, default: 0 },
    pendingTasks:     { type: Number, default: 0 },
    overdueTasks:     { type: Number, default: 0 },
    completionRate:   { type: Number, default: 0 },  // percent
    onTrack:          { type: Boolean, default: true },
    remainingDays:    { type: Number, default: 0 },
    avgDailyLoad:     { type: Number, default: 0 },  // minutes
    recommendedLoad:  { type: Number, default: 0 },  // minutes
    weakChapters:     { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Adjustment Sub-Schema ──────────────────────────────────────────────────────
const adjustmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'reschedule_skipped',     // skipped task moved to future day
        'redistribute_overdue',   // overdue work spread across remaining days
        'reduce_load',            // daily load reduced (student struggling)
        'increase_load',          // daily load increased (student ahead)
        'add_revision',           // extra revision added for weak topics
        'extend_plan',            // plan extended by extra days
        'swap_difficulty',        // hard/easy chapters swapped for balance
      ],
    },
    description:  { type: String, default: '' },
    affectedDays: { type: Number, default: 0 },
    affectedTasks:{ type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main AdaptiveLog Schema ────────────────────────────────────────────────────
const adaptiveLogSchema = new mongoose.Schema(
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

    trigger: {
      type: String,
      enum: ['manual', 'auto', 'scheduled'],
      default: 'manual',
    },

    analysis: {
      type: analysisSchema,
      default: () => ({}),
    },

    adjustments: {
      type: [adjustmentSchema],
      default: [],
    },

    summary: {
      type: String,
      default: '',
      maxlength: 500,
    },

    tasksRescheduled: {
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

adaptiveLogSchema.index({ userId: 1, planId: 1, createdAt: -1 });

const AdaptiveLog = mongoose.model('AdaptiveLog', adaptiveLogSchema);

module.exports = AdaptiveLog;
