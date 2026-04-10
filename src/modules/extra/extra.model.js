/**
 * StudyOS - Extra Models (Calendar, Notification, Session)
 * 
 * Simple utility features to track daily study, store sessions, 
 * and show basic notifications.
 */

const mongoose = require('mongoose');

// ─── 1. Calendar Model ──────────────────────────────────────────────────────────
const calendarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  dateString: {
    type: String, // e.g. "2026-04-02" for fast lookup
    required: true,
    index: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});
// Ensure one entry per day per user
calendarSchema.index({ userId: 1, dateString: 1 }, { unique: true });

// ─── 2. Notification Model ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ─── 3. Session Model ────────────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SimpleCalendar = mongoose.model('SimpleCalendar', calendarSchema);
const SimpleNotification = mongoose.model('SimpleNotification', notificationSchema);
const SimpleSession = mongoose.model('SimpleSession', sessionSchema);

module.exports = { SimpleCalendar, SimpleNotification, SimpleSession };
