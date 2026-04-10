/**
 * StudyOS - ChapterProgress Module Barrel Export
 */

const chapterProgressRoutes = require('./chapterprogress.routes');
const ChapterProgressService = require('./chapterprogress.service');
const ChapterProgressRepository = require('./chapterprogress.repository');
const ChapterProgress = require('./chapterprogress.model');

module.exports = {
  chapterProgressRoutes,
  ChapterProgressService,
  ChapterProgressRepository,
  ChapterProgress,
};
