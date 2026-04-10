/**
 * StudyOS - StudyPlan Service (Business Logic Layer)
 *
 * Orchestrates plan generation by:
 *   1. Validating input (exam exists, etc.)
 *   2. Fetching subjects + chapters for the exam
 *   3. Calling the PlanEngine algorithm
 *   4. Persisting the result as a StudyPlan document
 *
 * Also provides CRUD for saved plans.
 */

const AppError = require('../../shared/errors/AppError');
const PlanEngine = require('./plan.engine');
const StudyPlanRepository = require('./studyplan.repository');
const ExamRepository = require('../exam/exam.repository');
const SubjectRepository = require('../subject/subject.repository');
const ChapterRepository = require('../chapter/chapter.repository');

class StudyPlanService {
  // ───────────────────────────────────────────────────────────────────────────────
  // GENERATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a complete day-wise study plan.
   *
   * @param {string} userId
   * @param {object} input
   * @param {string} input.examId          - Exam ObjectId or slug
   * @param {string} [input.className]     - User's class (for title)
   * @param {number} input.totalDays       - Total number of days
   * @param {number} input.hoursPerDay     - Study hours per day
   * @param {number} [input.revisionInterval=7]
   * @param {number} [input.restDayInterval=0]
   * @param {string} [input.startDate]     - ISO date string
   * @returns {Promise<object>} The saved study plan
   */
  static async generatePlan(userId, input) {
    const {
      examId,
      className = '',
      totalDays,
      hoursPerDay,
      revisionInterval = 7,
      restDayInterval = 0,
      startDate,
    } = input;

    // 1. Resolve exam (support both ID and slug)
    let exam;
    if (examId.match(/^[a-f\d]{24}$/i)) {
      exam = await ExamRepository.findById(examId);
    } else {
      exam = await ExamRepository.findBySlug(examId);
    }
    if (!exam) {
      throw AppError.notFound('Exam not found', 'EXAM_NOT_FOUND');
    }

    // 2. Fetch subjects and chapters for this exam
    const subjects = await SubjectRepository.findByExamId(exam._id, true);
    if (subjects.length === 0) {
      throw AppError.badRequest('No subjects found for this exam', 'NO_SUBJECTS');
    }

    const chapters = await ChapterRepository.findByExamId(exam._id, { isActive: true });
    if (chapters.length === 0) {
      throw AppError.badRequest('No chapters found for this exam', 'NO_CHAPTERS');
    }

    // 3. Validate budget makes sense
    if (totalDays < 1) {
      throw AppError.badRequest('Total days must be at least 1', 'INVALID_DAYS');
    }
    if (hoursPerDay < 0.5) {
      throw AppError.badRequest('Study hours per day must be at least 0.5', 'INVALID_HOURS');
    }

    // 4. Run the plan engine
    const { schedule, stats } = PlanEngine.generate({
      subjects,
      chapters,
      totalDays,
      hoursPerDay,
      revisionInterval,
      restDayInterval,
      startDate: startDate ? new Date(startDate) : new Date(),
    });

    // 5. Build title
    const title = `${exam.name}${className ? ` — Class ${className}` : ''} · ${totalDays}-Day Plan`;

    // 6. Persist
    const plan = await StudyPlanRepository.create({
      userId,
      examId: exam._id,
      title,
      config: {
        totalDays,
        hoursPerDay,
        startDate: startDate ? new Date(startDate) : new Date(),
        revisionInterval,
        restDayInterval,
        className,
      },
      schedule,
      stats,
      status: 'active',
    });

    return plan;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * List all plans for a user (without the heavy schedule array).
   */
  static async getUserPlans(userId, filters = {}) {
    const plans = await StudyPlanRepository.findByUserId(userId, filters);
    return plans.map((p) => p.toJSON());
  }

  /**
   * Get a full plan by ID (with schedule). Checks ownership.
   */
  static async getPlanById(userId, planId) {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }
    return plan.toJSON();
  }

  /**
   * Get a specific day from a plan.
   */
  static async getPlanDay(userId, planId, dayNumber) {
    const result = await StudyPlanRepository.getDayFromPlan(planId, dayNumber);
    if (!result || result.userId.toString() !== userId.toString()) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }
    if (!result.day) {
      throw AppError.notFound(`Day ${dayNumber} not found in this plan`, 'DAY_NOT_FOUND');
    }
    return result.day;
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Update plan metadata (title, status).
   */
  static async updatePlan(userId, planId, updateData) {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }

    const allowed = {};
    if (updateData.title !== undefined) allowed.title = updateData.title;
    if (updateData.status !== undefined) allowed.status = updateData.status;

    if (Object.keys(allowed).length === 0) {
      throw AppError.badRequest('No valid fields to update', 'NO_FIELDS');
    }

    const updated = await StudyPlanRepository.updateById(planId, allowed);
    return updated.toJSON();
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * Delete a plan. Checks ownership.
   */
  static async deletePlan(userId, planId) {
    const plan = await StudyPlanRepository.findByIdAndUser(planId, userId);
    if (!plan) {
      throw AppError.notFound('Study plan not found', 'PLAN_NOT_FOUND');
    }
    await StudyPlanRepository.deleteById(planId);
  }
}

module.exports = StudyPlanService;
