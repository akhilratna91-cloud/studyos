/**
 * StudyOS - Extra Controller
 */

const asyncHandler = require('../../middleware/asyncHandler');
const ExtraService = require('./extra.service');

// ─── 1. Calendar ─────────────────────────────────────────────────────────────

const markCalendar = asyncHandler(async (req, res) => {
  // Uses userId from body or auth context, and a date string
  const userId = req.body.user_id || req.user._id;
  const date = req.body.date || new Date();

  await ExtraService.markDayComplete(userId, date);
  res.status(200).json({ success: true, message: 'Day marked complete' });
});

const getCalendar = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await ExtraService.getCalendar(idToUse);
  
  res.status(200).json({ success: true, calendar: data });
});

// ─── 2. Notifications ────────────────────────────────────────────────────────

const getNotifications = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await ExtraService.getNotifications(idToUse);
  
  res.status(200).json({ success: true, notifications: data });
});

// Since the prompt explicitly said creating notifications is a function, 
// let's expose it here just in case internal scripts hit it
const createNotification = asyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user._id;
  await ExtraService.createNotification(userId, req.body.message);
  res.status(201).json({ success: true, message: 'Notification created' });
});

// ─── 3. Sessions ─────────────────────────────────────────────────────────────

const getSessions = asyncHandler(async (req, res) => {
  const idToUse = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const data = await ExtraService.getSessions(idToUse);
  
  res.status(200).json({ success: true, sessions: data });
});

const saveSession = asyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user._id;
  const duration = parseInt(req.body.duration || 0, 10);
  
  await ExtraService.saveSession(userId, duration);
  res.status(201).json({ success: true, message: 'Session saved' });
});

module.exports = {
  markCalendar, getCalendar,
  getNotifications, createNotification,
  getSessions, saveSession
};
