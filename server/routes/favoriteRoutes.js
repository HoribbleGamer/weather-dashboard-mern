/**
 * routes/favoriteRoutes.js — Favorite Cities CRUD
 *
 * GET    /api/favorites        → list all saved cities
 * POST   /api/favorites        → add a new city
 * DELETE /api/favorites/:id    → remove a city by its MongoDB _id
 */

const express = require('express');
const mongoose = require('mongoose');
const FavoriteCity = require('../models/Favorite');

const router = express.Router();

// ─── GET /api/favorites ───────────────────────────────────────────────────────

/**
 * @route   GET /api/favorites
 * @desc    Return all saved favourite cities, newest first
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const favorites = await FavoriteCity.find()
      .sort({ createdAt: -1 }) // newest first
      .lean();                  // plain JS objects — faster, no Mongoose overhead

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error('[favoriteRoutes] GET / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve favorite cities.',
    });
  }
});

// ─── POST /api/favorites ──────────────────────────────────────────────────────

/**
 * @route   POST /api/favorites
 * @desc    Save a new favourite city
 * @body    { cityName: string }
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  // ── Input validation ────────────────────────────────────────
  if (!cityName || typeof cityName !== 'string' || cityName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'cityName is required and must be a non-empty string.',
    });
  }

  try {
    // Check for case-insensitive duplicates using the static model method
    const existing = await FavoriteCity.findByCity(cityName.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `"${cityName.trim()}" is already in your favorites.`,
        data: existing,
      });
    }

    const favorite = await FavoriteCity.create({
      cityName: cityName.trim(),
    });

    return res.status(201).json({
      success: true,
      message: `"${favorite.cityName}" added to favorites.`,
      data: favorite,
    });

  } catch (error) {
    // Mongoose duplicate-key error (race condition / direct DB insert)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `"${cityName.trim()}" is already in your favorites.`,
      });
    }

    // Mongoose validation error (schema rules)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        message: messages.join(', '),
      });
    }

    console.error('[favoriteRoutes] POST / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save favorite city.',
    });
  }
});

// ─── DELETE /api/favorites/:id ────────────────────────────────────────────────

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove a favourite city by its MongoDB ObjectId
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate the id format before hitting the database
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `"${id}" is not a valid city ID.`,
    });
  }

  try {
    const deleted = await FavoriteCity.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Favorite city not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `"${deleted.cityName}" removed from favorites.`,
      data: deleted,
    });

  } catch (error) {
    console.error('[favoriteRoutes] DELETE /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete favorite city.',
    });
  }
});

module.exports = router;
