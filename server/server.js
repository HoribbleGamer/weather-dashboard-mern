/**
 * server.js — Real-Time Weather Dashboard API Server
 *
 * Entry point for the Express/Node.js backend.
 * Connects to MongoDB via Mongoose, registers middleware,
 * and mounts API routes.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ─── Route Imports ────────────────────────────────────────────────────────────
const weatherRoutes   = require('./routes/weatherRoutes');
const favoriteRoutes  = require('./routes/favoriteRoutes');

// ─── Load Environment Variables ───────────────────────────────────────────────
// Must be called before connectDB so process.env.MONGO_URI is available.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Open to all origins for now — tighten to a specific CLIENT_ORIGIN env var
// once you have a stable production frontend URL.
app.use(
  cors({
    origin: true,   // reflect the request origin (allows any origin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Database Connection ──────────────────────────────────────────────────────
// connectDB is imported from ./config/db — see that file for full details.

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health-check / root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌤️  Weather Dashboard API is running',
    version: '1.0.0',
    endpoints: {
      weather:   '/api/weather/:city',
      favorites: '/api/favorites',
    },
    timestamp: new Date().toISOString(),
  });
});

// Feature routers
app.use('/api/weather',    weatherRoutes);
app.use('/api/favorites',  favoriteRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
});

module.exports = app; // Export for testing
