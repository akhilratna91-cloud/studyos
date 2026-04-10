/**
 * StudyOS - Async Handler Wrapper
 * Eliminates try/catch boilerplate in async route handlers.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
