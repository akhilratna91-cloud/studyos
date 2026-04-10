/**
 * StudyOS - DailyTask Module Barrel Export
 */

const dailyTaskRoutes = require('./dailytask.routes');
const DailyTaskService = require('./dailytask.service');
const DailyTaskRepository = require('./dailytask.repository');
const DailyTask = require('./dailytask.model');
const TaskDistributor = require('./task.distributor');

module.exports = {
  dailyTaskRoutes,
  DailyTaskService,
  DailyTaskRepository,
  DailyTask,
  TaskDistributor,
};
