/**
 * StudyOS - Global Error Handler Middleware
 * Catches all errors and sends a standardized response.
 */

const AppError = require('../shared/errors/AppError');
const { sendError } = require('../shared/utils/response');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log for debugging in non-production
  if (config.env !== 'production') {
    console.error('[StudyOS Error]', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, {
      statusCode: 409,
      message: `${field} already exists`,
      code: 'DUPLICATE_FIELD',
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      code: 'INVALID_ID',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Our custom AppError
  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
    });
  }

  // Unknown / Programming error — don't leak details in production
  return sendError(res, {
    statusCode: 500,
    message: config.env === 'production' ? 'Something went wrong' : err.message,
    code: 'INTERNAL_ERROR',
  });
};

module.exports = errorHandler;
