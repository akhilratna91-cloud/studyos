/**
 * StudyOS - User Service (Business Logic Layer)
 *
 * Owns user account-level operations ONLY:
 *   - Delete account (with cascade to profile)
 *
 * Profile operations (get/update profile, preferences) now live
 * in the Profile module (src/modules/profile/).
 *
 * Authentication concerns (login, register, tokens) live
 * in the Auth module (src/modules/auth/).
 */

const AppError = require('../../shared/errors/AppError');
const UserRepository = require('./user.repository');
const ProfileService = require('../profile/profile.service');

class UserService {
  /**
   * Delete user account and cascade-delete their profile.
   * @param {string} userId
   * @returns {Promise<void>}
   * @throws {AppError} 404 if not found
   */
  static async deleteAccount(userId) {
    const user = await UserRepository.deleteById(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    // Cascade — remove associated profile
    await ProfileService.deleteProfile(userId);
  }
}

module.exports = UserService;
