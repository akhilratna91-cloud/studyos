const mongoose = require('mongoose');
const ExtraService = require('./extra.service');
const { SimpleCalendar, SimpleNotification, SimpleSession } = require('./extra.model');

describe('Extra Service', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

  describe('Calendar', () => {
    it('should mark a day complete', async () => {
      const date = new Date('2026-04-03');
      const result = await ExtraService.markDayComplete(mockUserId, date);

      expect(result.completed).toBe(true);
      expect(result.dateString).toBe('2026-04-03');
      expect(result.userId.toString()).toBe(mockUserId);
    });

    it('should retrieve calendar records', async () => {
      await ExtraService.markDayComplete(mockUserId, new Date('2026-04-03'));
      await ExtraService.markDayComplete(mockUserId, new Date('2026-04-04'));

      const records = await ExtraService.getCalendar(mockUserId);
      expect(records.length).toBe(2);
      // Sorted by date descending
      expect(records[0].dateString).toBe('2026-04-04');
    });
  });

  describe('Notifications', () => {
    it('should create and retrieve notifications', async () => {
      await ExtraService.createNotification(mockUserId, 'Test Message');
      
      const notifications = await ExtraService.getNotifications(mockUserId);
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test Message');
    });
  });

  describe('Sessions', () => {
    it('should save session and create notification', async () => {
      const session = await ExtraService.saveSession(mockUserId, 45);
      
      expect(session.durationMinutes).toBe(45);

      // Verify session exists
      const sessions = await ExtraService.getSessions(mockUserId);
      expect(sessions.length).toBe(1);

      // Should have automatically created a notification
      const notifications = await ExtraService.getNotifications(mockUserId);
      expect(notifications.some(n => n.message.includes('45 minute'))).toBe(true);
    });
  });
});
