/**
 * routes/weatherRoutes.js — Live Weather Data
 *
 * GET /api/weather/:city
 *   Proxies a request to OpenWeatherMap and returns a clean,
 *   normalised payload to the client so the frontend never touches
 *   the raw API key or the raw OWM response shape.
 */

const express = require('express');
const axios = require('axios');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Build a normalised weather object from the raw OWM response.
 * Keeps the surface area the frontend depends on small and stable.
 *
 * @param {object} data  Raw OWM /weather response
 * @returns {object}
 */
const normaliseWeather = (data) => ({
  city:        data.name,
  country:     data.sys.country,
  coordinates: { lat: data.coord.lat, lon: data.coord.lon },
  weather: {
    main:        data.weather[0].main,
    description: data.weather[0].description,
    icon:        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  },
  temperature: {
    current:   data.main.temp,
    feelsLike: data.main.feels_like,
    min:       data.main.temp_min,
    max:       data.main.temp_max,
    humidity:  data.main.humidity,
  },
  wind: {
    speed:   data.wind.speed,          // m/s
    degrees: data.wind.deg ?? null,
  },
  visibility:  data.visibility ?? null, // metres
  cloudiness:  data.clouds?.all ?? null, // %
  sunrise:     new Date(data.sys.sunrise * 1000).toISOString(),
  sunset:      new Date(data.sys.sunset  * 1000).toISOString(),
  timezone:    data.timezone,            // UTC offset in seconds
  fetchedAt:   new Date().toISOString(),
});

// ─── GET /api/weather/:city ───────────────────────────────────────────────────

/**
 * @route   GET /api/weather/:city
 * @desc    Fetch current weather for a city from OpenWeatherMap
 * @access  Public
 * @param   {string} city  City name, e.g. "London", "New York"
 */
router.get('/:city', async (req, res) => {
  const { city } = req.params;

  // Sanity-check — reject obviously bad input early
  if (!city || city.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'City name must not be empty.',
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'Weather API key is not configured on the server.',
    });
  }

  try {
    const { data } = await axios.get(`${OWM_BASE}/weather`, {
      params: {
        q:     city.trim(),
        appid: apiKey,
        units: 'metric',   // °C; use 'imperial' for °F
      },
      timeout: 8000, // 8 s timeout to avoid hanging requests
    });

    return res.status(200).json({
      success: true,
      data: normaliseWeather(data),
    });

  } catch (error) {
    // ── OpenWeatherMap returned an error status ─────────────────
    if (error.response) {
      const { status, data: owmError } = error.response;

      if (status === 404) {
        return res.status(404).json({
          success: false,
          message: `City "${city}" not found. Please check the spelling.`,
        });
      }

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenWeatherMap API key.',
        });
      }

      return res.status(status).json({
        success: false,
        message: owmError?.message || 'Error from weather service.',
      });
    }

    // ── Network / timeout error ─────────────────────────────────
    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Weather service is unreachable. Please try again later.',
      });
    }

    // ── Unexpected error ────────────────────────────────────────
    console.error('[weatherRoutes] Unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching weather data.',
    });
  }
});

module.exports = router;
