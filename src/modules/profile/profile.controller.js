/**
 * StudyOS - Profile Controller (HTTP Layer)
 *
 * Thin layer — parses HTTP input, delegates to ProfileService,
 * and sends standardized responses.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const ProfileService = require('./profile.service');

/**
 * @route   GET /api/v1/profile
 * @desc    Get current user's profile (preferences)
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.getProfile(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Profile retrieved successfully',
    data: { profile },
  });
});

/**
 * @route   GET /api/v1/profile/full
 * @desc    Get combined user identity + profile data
 * @access  Private
 */
const getFullProfile = asyncHandler(async (req, res) => {
  const result = await ProfileService.getFullProfile(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Full profile retrieved successfully',
    data: result,
  });
});

/**
 * @route   PATCH /api/v1/profile
 * @desc    Update profile fields (class, exam, displayName, bio, subjects, studyGoal)
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.updateProfile(req.user._id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Profile updated successfully',
    data: { profile },
  });
});

/**
 * @route   PUT /api/v1/profile/preferences
 * @desc    Save user preferences (class, exam + notification/theme settings)
 * @access  Private
 */
const savePreferences = asyncHandler(async (req, res) => {
  const profile = await ProfileService.savePreferences(req.user._id, req.body);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Preferences saved successfully',
    data: { profile },
  });
});

module.exports = {
  getProfile,
  getFullProfile,
  updateProfile,
  savePreferences,
};
