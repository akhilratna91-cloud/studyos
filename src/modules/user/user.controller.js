/**
 * StudyOS - User Controller (HTTP Layer)
 *
 * Handles user account-level operations.
 * Profile operations are in the Profile controller.
 * Authentication endpoints are in the Auth controller.
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const UserService = require('./user.service');

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete current user's account (cascades to profile)
 * @access  Private (requires Bearer token)
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await UserService.deleteAccount(req.user._id);

  sendSuccess(res, {
    statusCode: 200,
    message: 'Account deleted successfully',
  });
});

module.exports = {
  deleteAccount,
};
