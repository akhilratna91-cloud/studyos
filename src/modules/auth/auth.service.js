/**
 * StudyOS - Auth Service (Business Logic Layer)
 *
 * Owns all authentication concerns:
 *   - Register  : create user + issue tokens
 *   - Login     : verify credentials + issue tokens
 *   - Refresh   : rotate tokens via refresh token
 *   - Password change : verify old password + hash new one
 *
 * Depends on:
 *   - UserRepository (from user module) for DB access
 *   - TokenService (shared) for JWT operations
 *
 * This layer knows NOTHING about HTTP.
 */

const AppError = require('../../shared/errors/AppError');
const TokenService = require('../../shared/services/token.service');
const UserRepository = require('../user/user.repository');
const ProfileService = require('../profile/profile.service');
const GoogleAuthService = require('./google-auth.service');

class AuthService {
  // ───────────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Register a new user and return token pair.
   * @param {object} payload - { email, password, class, exam }
   * @returns {Promise<{ user: object, profile: object, accessToken: string, refreshToken: string }>}
   * @throws {AppError} 409 if email already taken
   */
  static async register({ email, password, class: userClass, exam }) {
    // 1. Guard — unique email
    const exists = await UserRepository.emailExists(email);
    if (exists) {
      throw AppError.conflict(
        'A user with this email already exists',
        'EMAIL_DUPLICATE'
      );
    }

    // 2. Create user (identity — email + hashed password)
    const user = await UserRepository.create({
      email,
      password,
      class: userClass,
      exam,
      authProvider: 'local',
      emailVerified: false,
    });

    // 3. Create profile (preferences — class, exam)
    const profile = await ProfileService.createProfile(user.id, {
      class: userClass,
      exam,
    });

    // 4. Issue token pair
    const { accessToken, refreshToken } = TokenService.generateTokenPair({
      _id: user.id,
      email: user.email,
    });

    return { user, profile, accessToken, refreshToken };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Authenticate a user by email + password.
   * @param {object} payload - { email, password }
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   * @throws {AppError} 401 on invalid credentials
   */
  static async login({ email, password }) {
    // 1. Find user (need the password hash for comparison)
    const user = await UserRepository.findByEmail(email, true);
    if (!user) {
      throw AppError.unauthorized(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    if (!user.password) {
      throw AppError.unauthorized(
        'This account uses Google sign-in. Continue with Google instead.',
        'GOOGLE_ACCOUNT_USE_GOOGLE_SIGNIN'
      );
    }

    // 2. Compare hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    // 3. Issue token pair
    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);

    // 4. Strip password before returning user data
    const userObj = user.toJSON();

    return { user: userObj, accessToken, refreshToken };
  }

  /**
   * Authenticate or create a user through Google ID token verification.
   * @param {object} payload - { credential, class, exam }
   * @returns {Promise<{ user: object, profile: object, accessToken: string, refreshToken: string }>}
   */
  static async loginWithGoogle({ credential, class: userClass, exam }) {
    const googleAccount = await GoogleAuthService.verifyCredential(credential);

    let user = await UserRepository.findByGoogleId(googleAccount.googleId);

    if (!user) {
      user = await UserRepository.findByEmail(googleAccount.email);
    }

    let profile;

    if (!user) {
      const nextClass = userClass?.trim() || '12';
      const nextExam = exam?.trim() || 'JEE Main';

      const createdUser = await UserRepository.create({
        email: googleAccount.email,
        class: nextClass,
        exam: nextExam,
        googleId: googleAccount.googleId,
        authProvider: 'google',
        avatarUrl: googleAccount.avatarUrl,
        emailVerified: true,
      });

      profile = await ProfileService.createProfile(createdUser.id, {
        class: nextClass,
        exam: nextExam,
        displayName: googleAccount.displayName,
      });

      user = await UserRepository.findById(createdUser.id);
    } else {
      const updates = {};

      if (!user.googleId) {
        updates.googleId = googleAccount.googleId;
      }

      if (user.authProvider !== 'google') {
        updates.authProvider = 'google';
      }

      if (!user.avatarUrl && googleAccount.avatarUrl) {
        updates.avatarUrl = googleAccount.avatarUrl;
      }

      if (!user.emailVerified) {
        updates.emailVerified = true;
      }

      if (Object.keys(updates).length > 0) {
        user = await UserRepository.updateById(user.id || user._id, updates);
      }

      const existingProfile = await ProfileService.getProfile(user.id || user._id);

      if (!existingProfile.displayName && googleAccount.displayName) {
        profile = await ProfileService.updateProfile(user.id || user._id, {
          displayName: googleAccount.displayName,
        });
      } else {
        profile = existingProfile;
      }
    }

    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);

    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;

    return { user: userObj, profile, accessToken, refreshToken };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // REFRESH TOKENS
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Issue a new token pair using a valid refresh token.
   * @param {string} refreshToken - The existing refresh token
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   * @throws {AppError} 401 if token invalid/expired or user deleted
   */
  static async refreshTokens(refreshToken) {
    // 1. Verify refresh token
    const decoded = TokenService.verifyRefreshToken(refreshToken);

    // 2. Ensure user still exists
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw AppError.unauthorized(
        'User belonging to this token no longer exists',
        'USER_NOT_FOUND'
      );
    }

    // 3. Issue fresh token pair (rotation)
    const tokens = TokenService.generateTokenPair(user);

    return { user: user.toJSON(), ...tokens };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Change the authenticated user's password.
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   * @throws {AppError} 401 if current password wrong, 404 if user not found
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // 1. Find user with password
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    // 2. Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw AppError.unauthorized(
        'Current password is incorrect',
        'INVALID_PASSWORD'
      );
    }

    // 3. Set new password and save (triggers pre-save hash)
    user.password = newPassword;
    await user.save();

    // 4. Issue fresh tokens (invalidates old sessions conceptually)
    const tokens = TokenService.generateTokenPair(user);

    return { user: user.toJSON(), ...tokens };
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // GET CURRENT USER (from token)
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Retrieve user data for a valid access token.
   * Used by the /me endpoint to return the authenticated user.
   * @param {string} userId - Extracted from JWT in middleware
   * @returns {Promise<object>} User object
   * @throws {AppError} 404 if user not found
   */
  static async getCurrentUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return user.toJSON();
  }
}

module.exports = AuthService;
