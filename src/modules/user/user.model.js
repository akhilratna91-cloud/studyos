/**
 * StudyOS - User Model (Mongoose Schema)
 *
 * Fields:
 *   - email      : unique, lowercase, trimmed
 *   - password   : optional for Google-auth users, hashed via bcrypt pre-save hook
 *   - class      : student's class/grade level
 *   - exam       : target exam (e.g. JEE, NEET, SAT)
 *   - googleId   : stable Google subject identifier
 *   - authProvider : current primary sign-in method
 *
 * Security:
 *   - password is NEVER returned in queries by default
 *   - comparePassword instance method for login verification
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../config');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },

    emailVerified: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
