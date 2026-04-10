/**
 * StudyOS - User Module Barrel Export
 * Single entry point for the User module.
 */

const userRoutes = require('./user.routes');
const UserService = require('./user.service');
const UserRepository = require('./user.repository');
const User = require('./user.model');

module.exports = {
  userRoutes,
  UserService,
  UserRepository,
  User,
};
