/**
 * StudyOS - Simple AI Service
 * 
 * Logic-based "AI" to provide recommendations, advice, and motivation,
 * without relying on external APIs for speed and simplicity.
 */

const SimpleAnalyticsService = require('../simpleanalytics/simpleanalytics.service');
const SubjectProgressService = require('../subjectprogress/subjectprogress.service');
const DailyTask = require('../dailytask/dailytask.model');
const mongoose = require('mongoose');
const { PriorityQueue } = require('../../shared/utils/dsa.utils');

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
   * Analyzes progress & analytics to suggest next steps using Max-Heap Priority Queue.
   */
  static async getStudyRecommendation(userId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const recs = await SubjectProgressService.getRecommendations(userId, null);
    const analytics = await SimpleAnalyticsService.getFullAnalytics(userId);

    // Fetch pending daily tasks
    const pendingTasks = await DailyTask.find({
      userId: objectUserId,
      status: { $in: ['pending', 'in-progress'] },
    }).limit(10).exec();

    // Push candidate recommendations into Max-Heap Priority Queue
    const priorityQueue = new PriorityQueue((a, b) => b.priorityScore - a.priorityScore);

    if (recs && recs.length > 0) {
      for (const r of recs) {
        priorityQueue.push({
          type: 'subject_weakness',
          title: `Focus on ${r.subjectName}`,
          priorityScore: 90,
          reason: r.reason,
          action: r.action,
        });
      }
    }

    if (analytics.weakChapters && analytics.weakChapters.length > 0) {
      for (const ch of analytics.weakChapters) {
        priorityQueue.push({
          type: 'chapter_weakness',
          title: `Re-evaluate ${ch}`,
          priorityScore: 85,
          reason: `Accuracy in ${ch} is below baseline.`,
          action: `Review notes and take 5 practice PYQs for ${ch}.`,
        });
      }
    }

    for (const task of pendingTasks) {
      priorityQueue.push({
        type: 'pending_task',
        title: task.chapterName || 'Daily Module',
        priorityScore: 70,
        reason: 'Unfinished study task scheduled for today.',
        action: `Complete task "${task.chapterName || 'Study Module'}" (+50 XP).`,
      });
    }

    const topK = priorityQueue.popK(3);
    const topRec = topK[0];

    if (topRec) {
      return {
        suggestion: topRec.title,
        reason: topRec.reason,
        action: topRec.action,
        topKCandidates: topK,
        context: `Your overall progress is at ${analytics.progress}%. Accuracy: ${analytics.accuracy}%.`,
      };
    }

    return {
      suggestion: "Keep up the good work!",
      reason: "No major weaknesses detected right now.",
      action: "Review your recent notes and take a mock test.",
      context: `Your overall progress is at ${analytics.progress}%.`,
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

  /**
   * 4. chatWithAI
   * Intelligent study copilot chat responses grounded in performance analytics and RAG principles.
   */
  static async chatWithAI(userId, message, context = {}) {
    const analytics = await SimpleAnalyticsService.getFullAnalytics(userId);
    const msgLow = message.toLowerCase();

    let reply = "";
    let suggestedActions = [];

    if (msgLow.includes("plan") || msgLow.includes("schedule") || msgLow.includes("routine")) {
      reply = `Based on your overall progress (${analytics.progress}%), I recommend following a 4-hour daily commitment. Break it into two 90-minute core study blocks and one 60-minute PYQ revision session.`;
      suggestedActions = ["View Daily Planner", "Generate 90-Day Plan"];
    } else if (msgLow.includes("weak") || msgLow.includes("doubt") || msgLow.includes("difficult")) {
      const weakList = analytics.weakChapters.length > 0 ? analytics.weakChapters.join(", ") : "no critical areas";
      reply = `Targeting weak spots is key! Currently, your target focus areas are: ${weakList}. Dedicate 25 minutes of deep focus to your weakest topic today.`;
      suggestedActions = ["Take Topic Quiz", "View Analytics Matrix"];
    } else if (msgLow.includes("quiz") || msgLow.includes("pyq") || msgLow.includes("test")) {
      reply = `Your current accuracy across quiz attempts is ${analytics.accuracy}%. Taking a 10-question practice quiz today will boost your discipline score and reinforce active recall!`;
      suggestedActions = ["Start 10-Q Practice Quiz", "Browse PYQ Vault"];
    } else {
      reply = `Great question! Consistency compounds faster than intensity. Keep pushing forward—every completed task unlocks XP and builds exam readiness. How can I help optimize your study flow right now?`;
      suggestedActions = ["Ask about Study Plan", "Check Weak Chapters", "Get Motivation"];
    }

    return {
      message,
      reply,
      suggestedActions,
      analyticsSummary: {
        accuracy: analytics.accuracy,
        progress: analytics.progress,
        isBurnoutRisk: analytics.burnout?.isBurnoutRisk || false,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = SimpleAIService;
