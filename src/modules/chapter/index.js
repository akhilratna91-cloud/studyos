/**
 * StudyOS - Chapter Module Barrel Export
 * Single entry point for the Chapter module.
 */

const chapterRoutes = require('./chapter.routes');
const ChapterService = require('./chapter.service');
const ChapterRepository = require('./chapter.repository');
const Chapter = require('./chapter.model');
const CHAPTER_SEEDS = require('./chapter.seeds');

module.exports = {
  chapterRoutes,
  ChapterService,
  ChapterRepository,
  Chapter,
  CHAPTER_SEEDS,
};
