/**
 * StudyOS - Token Service (Shared)
 *
 * Centralized JWT generation & verification used by:
 *   - Auth module  (login, register, refresh)
 *   - Auth middleware (protect)
 *
 * Supports two token types:
 *   - Access Token  : short-lived (default 15m), used for API access
 *   - Refresh Token : long-lived (default 7d), used to obtain new access tokens
 */

const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../errors/AppError');

class TokenService {
  /**
   * Generate an access token.
   * @param {object} payload - Data to embed (e.g. { id, email })
   * @returns {string} Signed JWT
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
  }

  /**
   * Generate a refresh token.
   * @param {object} payload - Data to embed (e.g. { id })
   * @returns {string} Signed JWT
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Generate both access and refresh tokens for a user.
   * @param {object} user - User document (must have _id or id)
   * @returns {{ accessToken: string, refreshToken: string }}
   */
  static generateTokenPair(user) {
    const userId = user._id || user.id;
    const accessToken = TokenService.generateAccessToken({ id: userId, email: user.email });
    const refreshToken = TokenService.generateRefreshToken({ id: userId });
    return { accessToken, refreshToken };
  }

  /**
   * Verify an access token.
   * @param {string} token
   * @returns {object} Decoded payload
   * @throws {AppError} On invalid/expired token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid access token', 'INVALID_TOKEN');
    }
  }

  /**
   * Verify a refresh token.
   * @param {string} token
   * @returns {object} Decoded payload
   * @throws {AppError} On invalid/expired token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Refresh token expired. Please login again.', 'REFRESH_TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }
}

module.exports = TokenService;
