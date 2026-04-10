/**
 * StudyOS - FocusSession Model (Mongoose Schema)
 *
 * Tracks Pomodoro-style focus sessions with cycle management.
 *
 * Pomodoro Technique:
 *   - Work block  : 25 min (configurable)
 *   - Short break : 5 min
 *   - Long break  : 15 min (after 4 work blocks)
 *   - Cycle = 4 work blocks + breaks
 *
 * Presets:
 *   - pomodoro   : 25/5/15  (classic)
 *   - deepwork   : 50/10/20 (Cal Newport)
 *   - sprint     : 15/3/10  (quick bursts)
 *   - marathon   : 90/15/30 (extended)
 *   - custom     : user-defined
 */

const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // ── Task linkage (optional) ──────────────────────────────────────────────
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyTask',
      default: null,
    },

    chapterName: { type: String, default: 'Free Study' },
    subjectName: { type: String, default: '' },
    subjectIcon: { type: String, default: '🎯' },
    subjectColor:{ type: String, default: '#6366F1' },

    // ── Preset config ────────────────────────────────────────────────────────
    preset: {
      type: String,
      enum: ['pomodoro', 'deepwork', 'sprint', 'marathon', 'custom'],
      default: 'pomodoro',
    },

    workMinutes: {
      type: Number,
      default: 25,
      min: 5,
      max: 120,
    },

    shortBreakMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 30,
    },

    longBreakMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 60,
    },

    cyclesBeforeLongBreak: {
      type: Number,
      default: 4,
      min: 2,
      max: 8,
    },

    // ── Session state ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'paused', 'break', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },

    phase: {
      type: String,
      enum: ['work', 'short_break', 'long_break'],
      default: 'work',
    },

    currentCycle: {
      type: Number,
      default: 1,
      min: 1,
    },

    completedCycles: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetCycles: {
      type: Number,
      default: 4,
      min: 1,
      max: 20,
    },

    // ── Time tracking ────────────────────────────────────────────────────────
    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    totalWorkMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalBreakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Pause tracking ───────────────────────────────────────────────────────
    pausedAt: {
      type: Date,
      default: null,
    },

    totalPauseMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Distraction tracking ─────────────────────────────────────────────────
    distractions: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Student feedback ─────────────────────────────────────────────────────
    focusRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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

focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

module.exports = FocusSession;
