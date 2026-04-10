/**
 * StudyOS - Auth Module Barrel Export
 * Single entry point for the Auth module.
 */

const authRoutes = require('./auth.routes');
const AuthService = require('./auth.service');

module.exports = {
  authRoutes,
  AuthService,
};
