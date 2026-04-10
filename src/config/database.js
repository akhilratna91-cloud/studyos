/**
 * StudyOS - Database Connection
 * Manages MongoDB connection lifecycle with retry logic.
 */

const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      // Mongoose 7+ no longer needs these options, but being explicit:
      autoIndex: config.env !== 'production',
    });

    console.log(`[StudyOS] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[StudyOS] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[StudyOS] MongoDB disconnected gracefully');
  } catch (error) {
    console.error(`[StudyOS] Error during DB disconnect: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
