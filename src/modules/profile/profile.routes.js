/**
 * StudyOS - Profile Routes
 * All profile routes require authentication.
 */

const { Router } = require('express');
const profileController = require('./profile.controller');
const {
  updateProfileRules,
  savePreferencesRules,
  validate,
} = require('./profile.validator');
const { protect } = require('../../middleware/auth');

const router = Router();

// All profile routes require authentication
router.use(protect);

// ─── Profile CRUD ───────────────────────────────────────────────────────────────
router.get('/',          profileController.getProfile);
router.get('/full',      profileController.getFullProfile);
router.patch('/',        updateProfileRules, validate, profileController.updateProfile);

// ─── Preferences ────────────────────────────────────────────────────────────────
router.put('/preferences', savePreferencesRules, validate, profileController.savePreferences);

module.exports = router;
