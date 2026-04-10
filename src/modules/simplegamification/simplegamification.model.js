/**
 * StudyOS - Simple Gamification Models (XP & Streak)
 * 
 * Satisfies the requirement for separate XP and Streak tracking
 * mapping to the explicit rules defined previously.
 */

const mongoose = require('mongoose');

// 1. XP Model
const xpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalXp: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// 2. Streak Model
const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const SimpleXp = mongoose.model('SimpleXp', xpSchema);
const SimpleStreak = mongoose.model('SimpleStreak', streakSchema);

module.exports = { SimpleXp, SimpleStreak };
