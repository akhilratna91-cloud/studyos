/**
 * StudyOS - Simple AI Service
 * 
 * Logic-based "AI" to provide recommendations, advice, and motivation,
 * without relying on external APIs for speed and simplicity.
 */

const SimpleAnalyticsService = require('../simpleanalytics/simpleanalytics.service');
const SubjectProgressService = require('../subjectprogress/subjectprogress.service');

const MOTIVATIONAL_QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "You don't have to be great to start, but you have to start to be great.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today."
];

class SimpleAIService {

  /**
   * 1. get_study_recommendation
   * Analyzes progress & analytics to suggest next steps.
   */
  static async getStudyRecommendation(userId) {
    // We already have a strong recommendations engine in SubjectProgress
    const recs = await SubjectProgressService.getRecommendations(userId, null);
    
    // Also pull simple analytics for context
    const simple = await SimpleAnalyticsService.getAnalytics(userId);

    if (recs && recs.length > 0) {
      const topRec = recs[0];
      return {
        suggestion: `Your top priority should be '${topRec.subjectName}'.`,
        reason: topRec.reason,
        action: topRec.action,
        context: `Your overall progress is at ${simple.progress}%.`
      };
    }

    return {
      suggestion: "Keep up the good work!",
      reason: "No major weaknesses detected right now.",
      action: "Review your recent notes and take a mock test.",
      context: `Your overall progress is at ${simple.progress}%.`
    };
  }

  /**
   * 2. get_weak_advice
   * Uses weak chapters to formulate straightforward advice.
   */
  static async getWeakAdvice(userId) {
    const weakChapters = await SimpleAnalyticsService.getWeakChapters(userId);

    if (weakChapters && weakChapters.length > 0) {
      return {
        message: "We've detected some areas that need extra attention.",
        weak_chapters: weakChapters,
        advice: [
          `Go back and re-read the core concepts for: ${weakChapters[0]}.`,
          "Try taking a custom quiz specifically testing these chapters.",
          "Use the Pomodoro Focus timer and dedicate 25 uninterrupted minutes to your weakest topic."
        ]
      };
    }

    return {
      message: "Looking good! No critically weak chapters detected.",
      weak_chapters: [],
      advice: [
        "Focus on maintaining your current accuracy.",
        "Take a mixed subject quiz to keep information fresh."
      ]
    };
  }

  /**
   * 3. get_motivation
   * Returns a random, short motivational message.
   */
  static getMotivation() {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return {
      quote: MOTIVATIONAL_QUOTES[randomIndex]
    };
  }

}

module.exports = SimpleAIService;
