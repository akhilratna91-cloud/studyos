/**
 * StudyOS - Profile Module Barrel Export
 * Single entry point for the Profile module.
 */

const profileRoutes = require('./profile.routes');
const ProfileService = require('./profile.service');
const ProfileRepository = require('./profile.repository');
const Profile = require('./profile.model');

module.exports = {
  profileRoutes,
  ProfileService,
  ProfileRepository,
  Profile,
};
