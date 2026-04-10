/**
 * StudyOS - User Routes
 * Account-level endpoints (all protected).
 * Profile routes live at /api/v1/profile/.
 * Auth routes live at /api/v1/auth/.
 */

const { Router } = require('express');
const userController = require('./user.controller');
const { protect } = require('../../middleware/auth');

const router = Router();

// All user routes require authentication
router.use(protect);

// ─── Account ────────────────────────────────────────────────────────────────────
router.delete('/account', userController.deleteAccount);

module.exports = router;
