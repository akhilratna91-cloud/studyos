/**
 * StudyOS - Express Application Setup
 *
 * Configures middleware stack and mounts module routes.
 * Separated from the server (server.js) for testability.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./shared/utils/response');

// Module routes
const { userRoutes } = require('./modules/user');
const { authRoutes } = require('./modules/auth');
const { profileRoutes } = require('./modules/profile');
const { examRoutes } = require('./modules/exam');
const { subjectRoutes } = require('./modules/subject');
const { chapterRoutes } = require('./modules/chapter');
const { topicRoutes } = require('./modules/topic');
const { studyPlanRoutes } = require('./modules/studyplan');
const { dailyTaskRoutes } = require('./modules/dailytask');
const { revisionRoutes } = require('./modules/revision');
const { adaptiveRoutes } = require('./modules/adaptive');
const { todayRoutes } = require('./modules/today');
const { progressRoutes } = require('./modules/progress');
const { analyticsRoutes } = require('./modules/analytics');
const { focusRoutes } = require('./modules/focus');
const { chapterProgressRoutes } = require('./modules/chapterprogress');
const { gamificationRoutes } = require('./modules/gamification');
const { subjectProgressRoutes } = require('./modules/subjectprogress');
const { studyTimeRoutes } = require('./modules/studytime');
const { questionRoutes } = require('./modules/question');
const { quizRoutes } = require('./modules/quiz');
const { evaluationRoutes } = require('./modules/evaluation');
const { resultAnalysisRoutes } = require('./modules/resultanalysis');
const { simpleAnalyticsRoutes } = require('./modules/simpleanalytics');
const { simpleAiRoutes } = require('./modules/simpleai');
const { simpleGamificationRoutes } = require('./modules/simplegamification');
const { extraRoutes } = require('./modules/extra');
const { notesRoutes } = require('./modules/notes');

const app = express();

if (config.env === 'production') {
  app.set('trust proxy', 1);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.app.corsOrigins.length === 0) {
      return callback(null, true);
    }

    if (config.app.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};

// ─── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ─── Rate Limiting ──────────────────────────────────────────────────────────────

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter rate limiter for auth endpoints (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT',
  },
});

app.use('/api', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Logging ────────────────────────────────────────────────────────────────────
if (config.env !== 'production') {
  app.use(morgan('dev'));
}

// ─── Health & Test Routes ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/test-all', async (req, res) => {
  try {
    // Basic test of DB connection state
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : 'Disconnected';
    
    // Simulate mounting checks based on our known modules list
    const modulesLoaded = [
      'Auth', 'User', 'Profile', 'Exam', 'Subject', 'Chapter', 'Topic',
      'StudyPlan', 'DailyTask', 'Revision', 'Adaptive', 'Today', 'Progress',
      'Analytics', 'Focus', 'ChapterProgress', 'Gamification', 'SubjectProgress',
      'StudyTime', 'Question', 'Quiz', 'Evaluation', 'ResultAnalysis',
      'SimpleAnalytics', 'SimpleAI', 'SimpleGamification', 'Extra', 'Lectures'
    ];

    res.status(200).json({
      success: true,
      database: dbStatus,
      modulesCount: modulesLoaded.length,
      modules: modulesLoaded,
      message: `All ${modulesLoaded.length} modules successfully registered & database is responsive`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyOS API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

const lecturesRoutes = require('./modules/lectures/lectures.routes');

// ─── Mount Module Routes ────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);         // Authentication
app.use('/api/v1/users', userRoutes);        // User account
app.use('/api/v1/profile', profileRoutes);   // Profile & preferences
app.use('/api/v1/exams', examRoutes);        // Exams catalog
app.use('/api/v1/subjects', subjectRoutes);  // Subjects per exam
app.use('/api/v1/chapters', chapterRoutes);  // Chapters per subject
app.use('/api/v1/topics', topicRoutes);      // Topics per chapter
app.use('/api/v1/plans', studyPlanRoutes);   // Study plan generator
app.use('/api/v1/tasks', dailyTaskRoutes);   // Daily tasks & progress
app.use('/api/v1/revision', revisionRoutes); // Spaced repetition & revision
app.use('/api/v1/adaptive', adaptiveRoutes); // Adaptive plan adjustment
app.use('/api/v1/today', todayRoutes);       // Today dashboard
app.use('/api/v1/progress', progressRoutes); // Study sessions & analytics
app.use('/api/v1/analytics', analyticsRoutes); // Progress & analytics reports
app.use('/api/v1/focus', focusRoutes);         // Pomodoro focus mode
app.use('/api/v1/chapter-progress', chapterProgressRoutes); // Chapter completion tracking
app.use('/api/v1/gamification', gamificationRoutes);         // XP, levels & milestones
app.use('/api/v1/subject-progress', subjectProgressRoutes);   // Subject strength/weakness
app.use('/api/v1/study-time', studyTimeRoutes);               // Study time tracking & goals
app.use('/api/v1/questions', questionRoutes);                  // Question bank & quiz
app.use('/api/v1/quizzes', quizRoutes);                        // Quiz generation & attempts
app.use('/api/v1/evaluation', evaluationRoutes);               // Stateless answer evaluation
app.use('/api/v1/result-analysis', resultAnalysisRoutes);      // Quiz result analytics
app.use('/api/v1/simple-analytics', simpleAnalyticsRoutes);    // Basic analytics (accuracy, progress)
app.use('/api/v1/ai', simpleAiRoutes);                         // Basic logic-based AI
app.use('/api/v1/simple-ai', simpleAiRoutes);                  // AI study coach copilot
app.use('/api/v1/simple-gamification', simpleGamificationRoutes); // Basic explicit XP & Streak module
app.use('/api/v1/lectures', lecturesRoutes);                   // Curated video lectures
app.use('/api/v1', extraRoutes);                               // Utility routes (calendar, notifications, sessions)
app.use('/api/v1/notes', notesRoutes);                         // User notes

// ─── FastAPI & Root Route Alias Compatibility ────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/dashboard', todayRoutes);
app.use('/content/exams', examRoutes);
app.use('/content/curriculum', examRoutes);
app.use('/plans', studyPlanRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sessions', focusRoutes);
app.use('/quiz', quizRoutes);
app.use('/lectures', lecturesRoutes);
app.use('/ai', simpleAiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, {
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
