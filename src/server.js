/**
 * StudyOS - Server Entry Point
 *
 * Starts the Express server after establishing a database connection.
 * Handles graceful shutdown on SIGINT/SIGTERM.
 */

const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');
const { ExamService } = require('./modules/exam');
const { SubjectService } = require('./modules/subject');
const { ChapterService } = require('./modules/chapter');
const { TopicService } = require('./modules/topic');
const { QuestionService } = require('./modules/question');

const start = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Seed default data
  await ExamService.seedExams();
  await SubjectService.seedSubjects();
  await ChapterService.seedChapters();
  await TopicService.seedTopics();
  await QuestionService.seedQuestions();

  // 3. Start HTTP server
  const server = app.listen(config.port, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🎓  StudyOS API Server                     ║
  ║                                              ║
  ║   Environment : ${config.env.padEnd(27)}║
  ║   Port        : ${String(config.port).padEnd(27)}║
  ║   URL         : http://localhost:${String(config.port).padEnd(12)}║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
    `);
  });

  // 3. Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[StudyOS] ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('[StudyOS] Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // 4. Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('[StudyOS] Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
};

start();
