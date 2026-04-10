/**
 * StudyOS - Profile Service (Business Logic Layer)
 *
 * Owns all profile / preference operations:
 *   - Create profile  (called during registration)
 *   - Get profile     (fetch user preferences)
 *   - Update profile  (partial updates)
 *   - Save preferences(class, exam + extended prefs)
 *   - Get full profile(user identity + profile combined)
 *   - Delete profile  (cascade from user deletion)
 *
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const ProfileRepository = require('./profile.repository');
const UserRepository = require('../user/user.repository');

class ProfileService {
  // ───────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a profile for a newly registered user.
   * Called by Auth module during registration.
   * @param {string} userId
   * @param {object} data - { class, exam }
   * @returns {Promise<object>} Created profile
   */
  static async createProfile(userId, { class: userClass, exam, displayName = '' }) {
    // Guard — prevent duplicate profiles
    const exists = await ProfileRepository.existsForUser(userId);
    if (exists) {
      throw AppError.conflict('Profile already exists for this user', 'PROFILE_EXISTS');
    }

    const profile = await ProfileRepository.create({
      userId,
      class: userClass,
      exam,
      displayName,
    });

    return profile;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // GET
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Get profile by user ID.
   * @param {string} userId
   * @returns {Promise<object>} Profile data
   * @throws {AppError} 404 if not found
   */
  static async getProfile(userId) {
    const profile = await ProfileRepository.findByUserId(userId);
    if (!profile) {
      throw AppError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }
    return profile.toJSON();
  }

  /**
   * Get full profile — combines user identity with profile preferences.
   * Useful for dashboard / settings pages.
   * @param {string} userId
   * @returns {Promise<object>} { user, profile }
   * @throws {AppError} 404 if user or profile not found
   */
  static async getFullProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const profile = await ProfileRepository.findByUserId(userId);
    if (!profile) {
      throw AppError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }

    return {
      user: user.toJSON(),
      profile: profile.toJSON(),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update profile fields (partial update).
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>} Updated profile
   * @throws {AppError} 404 if not found
   */
  static async updateProfile(userId, updateData) {
    // Whitelist allowed fields for update
    const allowedFields = [
      'class', 'exam', 'displayName', 'bio',
      'subjects', 'studyGoal',
    ];
    const sanitized = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitized[field] = updateData[field];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw AppError.badRequest('No valid fields to update', 'NO_FIELDS');
    }

    const profile = await ProfileRepository.updateByUserId(userId, sanitized);
    if (!profile) {
      throw AppError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }
    return profile.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // SAVE PREFERENCES
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Save user preferences (class, exam + notification/theme).
   * Uses upsert — creates profile if it doesn't exist yet.
   * @param {string} userId
   * @param {object} prefs - { class, exam, preferences }
   * @returns {Promise<object>} Updated/created profile
   */
  static async savePreferences(userId, prefs) {
    const updateData = {};

    if (prefs.class !== undefined) updateData.class = prefs.class;
    if (prefs.exam !== undefined) updateData.exam = prefs.exam;

    // Handle nested preferences safely
    if (prefs.preferences) {
      if (prefs.preferences.notifications) {
        const notifs = prefs.preferences.notifications;
        if (notifs.email !== undefined) updateData['preferences.notifications.email'] = notifs.email;
        if (notifs.push !== undefined) updateData['preferences.notifications.push'] = notifs.push;
        if (notifs.studyReminders !== undefined) updateData['preferences.notifications.studyReminders'] = notifs.studyReminders;
      }
      if (prefs.preferences.theme !== undefined) {
        updateData['preferences.theme'] = prefs.preferences.theme;
      }
    }

    const profile = await ProfileRepository.upsert(userId, updateData);
    return profile.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE (cascade)
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete a user's profile (called during account deletion).
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async deleteProfile(userId) {
    await ProfileRepository.deleteByUserId(userId);
  }
}

module.exports = ProfileService;
