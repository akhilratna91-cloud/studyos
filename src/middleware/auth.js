/**
 * StudyOS - JWT Authentication Middleware
 * Protects routes by verifying Bearer access tokens.
 *
 * Uses the shared TokenService for token verification,
 * keeping JWT implementation details in one place.
 */

const TokenService = require('../shared/services/token.service');
const AppError = require('../shared/errors/AppError');
const UserRepository = require('../modules/user/user.repository');

const protect = async (req, _res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw AppError.unauthorized('Access denied. No token provided.');
    }

    // 2. Verify access token (throws on invalid/expired)
    const decoded = TokenService.verifyAccessToken(token);

    // 3. Check user still exists in database
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw AppError.unauthorized('User belonging to this token no longer exists.');
    }

    // 4. Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
