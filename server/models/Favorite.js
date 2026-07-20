/**
 * models/Favorite.js — FavoriteCity Mongoose Model
 *
 * Represents a city that the user has bookmarked.
 * Stored in the "favoritecities" collection inside MongoDB.
 */

const mongoose = require('mongoose');

// ─── Schema Definition ────────────────────────────────────────────────────────

const FavoriteCitySchema = new mongoose.Schema(
  {
    /**
     * The canonical city name as returned by OpenWeatherMap.
     * e.g. "London", "New York", "Mumbai"
     */
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      minlength: [1, 'City name cannot be empty'],
      maxlength: [100, 'City name must be 100 characters or fewer'],
    },
  },
  {
    // Automatically add `createdAt` and `updatedAt` timestamps
    timestamps: true,

    // Customise the collection name explicitly
    collection: 'favoritecities',
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Case-insensitive collation index to prevent duplicate city entries
// e.g. "london" and "London" are treated as the same city.
FavoriteCitySchema.index(
  { cityName: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Returns a plain, serialisable summary of the document.
 * Called automatically by JSON.stringify / res.json().
 */
FavoriteCitySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Find a favourite by city name (case-insensitive).
 * @param {string} name
 * @returns {Promise<Document|null>}
 */
FavoriteCitySchema.statics.findByCity = function (name) {
  return this.findOne(
    { cityName: { $regex: new RegExp(`^${name}$`, 'i') } }
  );
};

// ─── Model Export ─────────────────────────────────────────────────────────────

// Guard against OverwriteModelError when modules are hot-reloaded (e.g. testing)
const FavoriteCity =
  mongoose.models.FavoriteCity ||
  mongoose.model('FavoriteCity', FavoriteCitySchema);

module.exports = FavoriteCity;
