/**
 * StudyOS - Centralized Configuration
 * Loads and validates all environment variables.
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseOrigins(rawOrigins) {
  return (rawOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseList(rawValue) {
  return (rawValue || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/studyos',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  },

  google: {
    clientIds: parseList(
      process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID
    ),
  },
};

if (config.app.corsOrigins.length === 0) {
  config.app.corsOrigins = [config.app.frontendUrl, 'http://127.0.0.1:3000'];
}

if (config.env === 'production') {
  const invalidSecrets = [
    config.jwt.secret === 'fallback-dev-secret',
    config.jwt.refreshSecret === 'fallback-refresh-secret',
    config.jwt.secret.includes('change_this'),
    config.jwt.refreshSecret.includes('change_this'),
  ];

  if (invalidSecrets.some(Boolean)) {
    throw new Error(
      '[StudyOS] Refusing to boot in production with default JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET.',
    );
  }
}

module.exports = config;
