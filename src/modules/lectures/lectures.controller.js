/**
 * StudyOS - Lectures Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const LecturesService = require('./lectures.service');

const getLectures = asyncHandler(async (req, res) => {
  const lectures = LecturesService.getLectures(req.query);

  sendSuccess(res, {
    statusCode: 200,
    message: `Retrieved ${lectures.length} video lectures`,
    data: {
      lectures,
      total: lectures.length,
    },
  });
});

module.exports = { getLectures };
