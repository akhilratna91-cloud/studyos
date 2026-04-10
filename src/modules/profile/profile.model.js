/**
 * StudyOS - Profile Model (Mongoose Schema)
 *
 * Stores user preferences and profile data separately from user identity.
 * One-to-one relationship with User via userId reference.
 *
 * Fields:
 *   - userId           : reference to User (unique, indexed)
 *   - class            : student's class/grade level
 *   - exam             : target exam (e.g. JEE, NEET, SAT)
 *   - displayName      : optional display name
 *   - bio              : short bio / about text
 *   - subjects         : list of subjects the student is studying
 *   - studyGoal        : daily study target in minutes
 *   - preferences      : nested notification & theme preferences
 */

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },

    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },

    exam: {
      type: String,
      required: [true, 'Exam is required'],
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },

    subjects: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 subjects',
      },
    },

    studyGoal: {
      type: Number,
      min: [0, 'Study goal cannot be negative'],
      max: [1440, 'Study goal cannot exceed 24 hours'],
      default: 120, // 2 hours in minutes
    },

    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        studyReminders: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
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

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
