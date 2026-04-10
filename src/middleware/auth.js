/**
 * StudyOS - JWT Authentication Middleware
 * Protects routes by verifying Bearer access tokens.
 *
 * DEMO MODE: When no token is provided, automatically uses
 * (or creates) a built-in demo user so all features work
 * without sign-in.
 */

const TokenService = require('../shared/services/token.service');
const AppError = require('../shared/errors/AppError');
const UserRepository = require('../modules/user/user.repository');
const User = require('../modules/user/user.model');

const DEMO_EMAIL = 'demo@studyos.app';

let _demoUserCache = null;

/**
 * Get or create the demo user. Cached in memory after first call.
 */
async function getDemoUser() {
  if (_demoUserCache) {
    // Verify it still exists in DB (could have been dropped)
    const exists = await User.findById(_demoUserCache._id).lean();
    if (exists) return _demoUserCache;
    _demoUserCache = null;
  }

  let demoUser = await User.findOne({ email: DEMO_EMAIL }).lean();

  if (!demoUser) {
    demoUser = await User.create({
      email: DEMO_EMAIL,
      class: '12',
      exam: 'JEE Main',
      authProvider: 'local',
      emailVerified: true,
      password: 'DemoUser@2026!',
    });
    demoUser = demoUser.toObject();

    // Also create a profile for the demo user
    try {
      const Profile = require('../modules/profile/profile.model');
      const existingProfile = await Profile.findOne({ userId: demoUser._id || demoUser.id });
      if (!existingProfile) {
        await Profile.create({
          userId: demoUser._id || demoUser.id,
          displayName: 'Scholar',
          class: '12',
          exam: 'JEE Main',
        });
      }
    } catch (e) {
      // Profile creation is optional, don't block
      console.warn('[StudyOS] Could not create demo profile:', e.message);
    }
  }

  _demoUserCache = demoUser;
  return demoUser;
}

const protect = async (req, _res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token, use demo user (no sign-in required)
    if (!token) {
      const demoUser = await getDemoUser();
      req.user = demoUser;
      return next();
    }

    // 3. Verify access token (throws on invalid/expired)
    const decoded = TokenService.verifyAccessToken(token);

    // 4. Check user still exists in database
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw AppError.unauthorized('User belonging to this token no longer exists.');
    }

    // 5. Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    // If token was provided but invalid, still fall back to demo user
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      try {
        const demoUser = await getDemoUser();
        req.user = demoUser;
        return next();
      } catch (demoError) {
        return next(demoError);
      }
    }
    next(error);
  }
};

module.exports = { protect };
