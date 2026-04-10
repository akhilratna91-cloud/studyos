/**
 * StudyOS - Standardized API Response Helpers
 * Ensures consistent response shape across all endpoints.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number}  [options.statusCode=200]
 * @param {string}  options.message
 * @param {*}       [options.data]
 */
const sendSuccess = (res, { statusCode = 200, message, data } = {}) => {
  const body = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} options.statusCode
 * @param {string} options.message
 * @param {string} [options.code]
 * @param {Array}  [options.errors] - Validation errors array
 */
const sendError = (res, { statusCode = 500, message, code, errors } = {}) => {
  const body = {
    success: false,
    message,
  };

  if (code) body.code = code;
  if (errors && errors.length) body.errors = errors;

  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
