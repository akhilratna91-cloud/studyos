/**
 * StudyOS - Auth Routes
 * Maps HTTP endpoints to auth controller actions with validation + auth middleware.
 */

const { Router } = require('express');
const authController = require('./auth.controller');
const {
  registerRules,
  loginRules,
  googleLoginRules,
  refreshRules,
  changePasswordRules,
  validate,
} = require('./auth.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.post('/register',        registerRules,       validate, authController.register);
router.post('/login',           loginRules,          validate, authController.login);
router.post('/google',          googleLoginRules,    validate, authController.googleLogin);
router.post('/refresh',         refreshRules,        validate, authController.refresh);

// ─── Protected Routes ───────────────────────────────────────────────────────────
router.post('/change-password', protect, changePasswordRules, validate, authController.changePassword);
router.get('/me',               protect, authController.getMe);

module.exports = router;
