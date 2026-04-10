/**
 * StudyOS - Profile Repository (Data Access Layer)
 *
 * All direct database interactions for profiles are encapsulated here.
 * Keeps the service layer database-agnostic and testable.
 */

const Profile = require('./profile.model');

class ProfileRepository {
  /**
   * Create a new profile for a user.
   * @param {object} profileData - { userId, class, exam, ... }
   * @returns {Promise<object>} Created profile
   */
  static async create(profileData) {
    const profile = await Profile.create(profileData);
    return profile.toJSON();
  }

  /**
   * Find profile by user ID.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findByUserId(userId) {
    return Profile.findOne({ userId }).exec();
  }

  /**
   * Find profile by its own ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return Profile.findById(id).exec();
  }

  /**
   * Update profile by user ID.
   * @param {string} userId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object|null>} Updated profile
   */
  static async updateByUserId(userId, updateData) {
    return Profile.findOneAndUpdate(
      { userId },
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).exec();
  }

  /**
   * Upsert profile — create if not exists, update if exists.
   * Useful during registration or first-time preference saving.
   * @param {string} userId
   * @param {object} profileData
   * @returns {Promise<object>} Upserted profile
   */
  static async upsert(userId, profileData) {
    return Profile.findOneAndUpdate(
      { userId },
      { userId, ...profileData },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).exec();
  }

  /**
   * Delete profile by user ID.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async deleteByUserId(userId) {
    return Profile.findOneAndDelete({ userId }).exec();
  }

  /**
   * Check if a profile exists for a user.
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async existsForUser(userId) {
    const count = await Profile.countDocuments({ userId });
    return count > 0;
  }
}

module.exports = ProfileRepository;
