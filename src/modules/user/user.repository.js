/**
 * StudyOS - User Repository (Data Access Layer)
 *
 * All direct database interactions for users are encapsulated here.
 * This keeps the service layer database-agnostic and testable.
 */

const User = require('./user.model');

class UserRepository {
  /**
   * Create a new user document.
   * @param {object} userData - { email, password, class, exam }
   * @returns {Promise<object>} Created user (password excluded)
   */
  static async create(userData) {
    const user = await User.create(userData);
    return user.toJSON();
  }

  /**
   * Find user by email.
   * @param {string} email
   * @param {boolean} [includePassword=false] - Whether to include the password field
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+password');
    return query.exec();
  }

  /**
   * Find user by Google subject ID.
   * @param {string} googleId
   * @returns {Promise<object|null>}
   */
  static async findByGoogleId(googleId) {
    return User.findOne({ googleId }).exec();
  }

  /**
   * Find user by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return User.findById(id).exec();
  }

  /**
   * Find user by ID with password field included.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findByIdWithPassword(id) {
    return User.findById(id).select('+password').exec();
  }

  /**
   * Update user fields by ID.
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<object|null>} Updated user
   */
  static async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }

  /**
   * Delete user by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }

  /**
   * Check if an email already exists.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async emailExists(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}

module.exports = UserRepository;
