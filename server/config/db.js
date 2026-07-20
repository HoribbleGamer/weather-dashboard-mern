/**
 * config/db.js — Mongoose Database Connection
 *
 * Exports a single `connectDB` async function.
 * Call it once at application startup (in server.js).
 */

const mongoose = require('mongoose');

/**
 * Establish a connection to MongoDB Atlas via Mongoose.
 * On failure the process exits with code 1 so the process manager
 * (nodemon / PM2) can restart or alert appropriately.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // dbName scopes all collections to "weather-dashboard"
      // even if the URI doesn't include a database segment.
      dbName: 'weather-dashboard',
    });

    console.log(`✅  MongoDB connected  →  ${conn.connection.host}`);

    // ── Connection lifecycle listeners ──────────────────────────
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Attempting to reconnect…');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄  MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌  Mongoose runtime error: ${err.message}`);
    });

  } catch (error) {
    console.error(`❌  MongoDB initial connection failed: ${error.message}`);
    // Exit so nodemon / PM2 can restart and alert
    process.exit(1);
  }
};

module.exports = connectDB;
