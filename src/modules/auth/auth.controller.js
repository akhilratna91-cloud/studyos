/**
 * StudyOS - Auth Controller (HTTP Layer)
 *
 * Thin layer — parses HTTP input, delegates to AuthService,
 * and sends standardized responses.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const AuthService = require('./auth.service');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Create a new user account & receive tokens
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, class: userClass, exam } = req.body;

  const { user, profile, accessToken, refreshToken } = await AuthService.register({
    email,
    password,
    class: userClass,
    exam,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: { user, profile, accessToken, refreshToken },
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & receive tokens
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await AuthService.login({
    email,
    password,
  });

  sendSuccess(res, {
    statusCode: 200,
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * @route   POST /api/v1/auth/google
 * @desc    Authenticate or register user through Google sign-in
 * @access  Public
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { credential, class: userClass, exam } = req.body;

  const { user, profile, accessToken, refreshToken } =
    await AuthService.loginWithGoogle({
      credential,
      class: userClass,
      exam,
    });

  sendSuccess(res, {
    statusCode: 200,
    message: 'Google sign-in successful',
    data: { user, profile, accessToken, refreshToken },
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Get new access + refresh tokens
 * @access  Public (but requires a valid refresh token in body)
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await AuthService.refreshTokens(refreshToken);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Tokens refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private (requires Bearer token)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { user, accessToken, refreshToken } = await AuthService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  sendSuccess(res, {
    statusCode: 200,
    message: 'Password changed successfully',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the currently authenticated user
 * @access  Private (requires Bearer token)
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Authenticated user retrieved successfully',
    data: { user },
  });
});

module.exports = {
  register,
  login,
  googleLogin,
  refresh,
  changePassword,
  getMe,
};
