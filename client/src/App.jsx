/**
 * App.jsx — Real-Time Weather Dashboard
 *
 * Layout:
 *   Left panel  → search bar + live weather display
 *   Right panel → saved favourite cities sidebar
 *
 * API calls are proxied via Vite dev server to http://localhost:5000
 */

import { useState, useEffect, useCallback, memo } from 'react'
import axios from 'axios'
import './App.css'

const API = '/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Maps an OWM weather condition to a CSS background-theme class */
const getWeatherClass = (condition) => {
  if (!condition) return 'bg-default'
  const c = condition.toLowerCase()
  if (c.includes('thunderstorm'))                        return 'bg-thunderstorm'
  if (c.includes('drizzle'))                             return 'bg-drizzle'
  if (c.includes('rain'))                                return 'bg-rain'
  if (c.includes('snow'))                                return 'bg-snow'
  if (c.includes('mist') || c.includes('fog')
    || c.includes('haze') || c.includes('smoke'))        return 'bg-mist'
  if (c.includes('cloud'))                               return 'bg-clouds'
  if (c.includes('clear'))                               return 'bg-clear'
  return 'bg-default'
}

/** Returns a display emoji for the weather main condition */
const conditionEmoji = (main) => {
  const map = {
    Thunderstorm: '⛈️', Drizzle: '🌦️', Rain: '🌧️',
    Snow: '❄️',  Clear: '☀️',  Clouds: '☁️',
    Mist: '🌫️', Fog: '🌫️',   Haze: '🌫️', Smoke: '🌫️',
  }
  return map[main] ?? '🌡️'
}

/** Format a UTC ISO timestamp to a local HH:MM string */
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/** Clamp a percentage value for the temp-range bar */
const tempRangeWidth = (current, min, max) => {
  if (max === min) return 50
  return Math.round(((current - min) / (max - min)) * 100)
}

// ═════════════════════════════════════════════════════════════════════════════
//  FavoritesSidebar — memoized so it only re-renders when favorites data or
//  the active weather city changes, NOT when the search input is typed into.
// ═════════════════════════════════════════════════════════════════════════════

const FavoritesSidebar = memo(function FavoritesSidebar({
  favorites,
  deletingId,
  weather,
  onCityClick,
  onDelete,
}) {
  return (
    <aside className="glass-panel favorites-sidebar">

      <div className="sidebar-header">
        <span className="sidebar-title">
          ♥ Saved Cities
          <span className="sidebar-count">{favorites.length}</span>
        </span>
      </div>

      <div className="favorites-list-scroll">
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">📍</div>
            <p className="favorites-empty-text">
              No saved cities yet.<br />
              Search for a city and tap<br />
              <em>Save to Favorites</em>.
            </p>
          </div>
        ) : (
          <ul id="favorites-list">
            {favorites.map((fav) => (
              <li
                key={fav._id}
                className={`favorite-item${deletingId === fav._id ? ' deleting' : ''}`}
              >
                <span className="fav-pin-icon">📍</span>
                <button
                  className="fav-city-btn"
                  onClick={() => onCityClick(fav.cityName)}
                  title={`Load weather for ${fav.cityName}`}
                >
                  {fav.cityName}
                </button>
                <button
                  className="fav-delete-btn"
                  onClick={() => onDelete(fav._id)}
                  disabled={!!deletingId}
                  aria-label={`Remove ${fav.cityName} from favorites`}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {weather && (
        <div className="sidebar-footer">
          Last updated {new Date(weather.fetchedAt).toLocaleTimeString()}
        </div>
      )}
    </aside>
  )
})

// ═════════════════════════════════════════════════════════════════════════════
//  App — root component
// ═════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [searchInput,  setSearchInput]  = useState('')
  const [weather,      setWeather]      = useState(null)
  const [favorites,    setFavorites]    = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [savingCity,   setSavingCity]   = useState(false)
  const [saveSuccess,  setSaveSuccess]  = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)

  // ── Fetch favorites on mount ──────────────────────────────────────────────
  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/favorites`)
      setFavorites(data.data ?? [])
    } catch (err) {
      console.error('Failed to load favorites:', err.message)
    }
  }, [])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  // ── Weather search ────────────────────────────────────────────────────────
  // NOTE: searchWeather is only called on explicit form submit or a favorites
  // click — never on every keystroke — so no debounce is required here.
  const searchWeather = useCallback(async (cityName) => {
    const city = (cityName ?? searchInput).trim()
    if (!city) return

    setLoading(true)
    setError(null)
    setWeather(null)
    setSaveSuccess(false)

    try {
      const { data } = await axios.get(`${API}/weather/${encodeURIComponent(city)}`)
      setWeather(data.data)
      setSearchInput(city)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not fetch weather. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchInput])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    searchWeather()
  }

  // ── Save to favorites ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!weather || savingCity) return
    setSavingCity(true)
    setError(null)

    try {
      await axios.post(`${API}/favorites`, { cityName: weather.city })
      setSaveSuccess(true)
      fetchFavorites()
      setTimeout(() => setSaveSuccess(false), 3500)
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Could not save city.'
      // 409 = duplicate — treat as soft info, not a hard error
      if (err.response?.status === 409) {
        setSaveSuccess(true)  // show "already saved" green tick
        fetchFavorites()
      } else {
        setError(msg)
      }
    } finally {
      setSavingCity(false)
    }
  }

  // ── Delete from favorites ─────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    if (deletingId) return
    setDeletingId(id)

    try {
      await axios.delete(`${API}/favorites/${id}`)
      setFavorites((prev) => prev.filter((f) => f._id !== id))
    } catch (err) {
      console.error('Failed to delete favorite:', err.message)
    } finally {
      setDeletingId(null)
    }
  }, [deletingId])

  // ── Derived state ─────────────────────────────────────────────────────────
  const bgClass = getWeatherClass(weather?.weather?.main)
  const isAlreadySaved = favorites.some(
    (f) => f.cityName.toLowerCase() === weather?.city?.toLowerCase()
  )

  // ══════════════════════════════════════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className={`app ${bgClass}`}>

      {/* ── Brand bar ─────────────────────────────────────────── */}
      <header className="page-header">
        <span className="brand">⛅ Atmospherix</span>
        <div className="brand-dot" />
        <span className="brand" style={{ fontWeight: 400, fontSize: '0.8rem', opacity: 0.4 }}>
          Real-Time Weather Dashboard
        </span>
      </header>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <main className="dashboard">

        {/* ════════════════════════════════════════════════════════
            LEFT — Weather panel
            ════════════════════════════════════════════════════════ */}
        <section className="glass-panel weather-panel">

          {/* Search ------------------------------------------------ */}
          <div className="search-wrapper">
            <span className="search-label">🔍 Search City</span>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input
                id="city-search-input"
                className="search-input"
                type="text"
                placeholder="e.g. London, New York, Tokyo…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
              <button
                id="city-search-btn"
                className="search-btn"
                type="submit"
                disabled={loading || !searchInput.trim()}
              >
                {loading ? '…' : '→ Search'}
              </button>
            </form>
          </div>

          {/* Error banner ------------------------------------------ */}
          {error && (
            <div className="error-banner" role="alert">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <span className="error-title">Error</span>
                <span className="error-message">{error}</span>
              </div>
              <button
                className="error-dismiss"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Loading spinner --------------------------------------- */}
          {loading && (
            <div className="loading-card glass-panel" style={{ marginTop: 8 }}>
              <div className="spinner" />
              <span className="loading-text">Fetching weather data…</span>
            </div>
          )}

          {/* Empty / prompt state ---------------------------------- */}
          {!loading && !weather && !error && (
            <div className="empty-state">
              <div className="empty-state-icon">🌍</div>
              <h2 className="empty-state-title">Where in the world?</h2>
              <p className="empty-state-sub">
                Type any city name above and press <strong>Search</strong> to get live
                weather data right now.
              </p>
            </div>
          )}

          {/* Weather card ------------------------------------------ */}
          {!loading && weather && (
            <div className="weather-card">

              {/* City + icon */}
              <div className="weather-header">
                <div className="city-meta">
                  <h1 className="city-name">{weather.city}</h1>
                  <span className="city-country">
                    <span>{weather.country}</span>
                    <span className="country-dot" />
                    <span style={{ textTransform: 'capitalize', fontWeight: 400 }}>
                      {weather.weather.description}
                    </span>
                  </span>
                </div>
                <div className="weather-icon-wrapper">
                  <img
                    src={weather.weather.icon}
                    alt={weather.weather.description}
                    className="weather-icon"
                    width={100}
                    height={100}
                  />
                </div>
              </div>

              {/* Temperature hero */}
              <div>
                <div className="temperature-hero">
                  <span className="temp-main">
                    {Math.round(weather.temperature.current)}
                  </span>
                  <span className="temp-unit">°C</span>
                  <span className="temp-feels">
                    Feels like {Math.round(weather.temperature.feelsLike)}°C
                  </span>
                </div>

                {/* Temp range bar */}
                <div className="temp-range" style={{ marginTop: 10 }}>
                  <span className="temp-range-label">
                    {Math.round(weather.temperature.min)}°
                  </span>
                  <div className="temp-range-bar">
                    <div
                      className="temp-range-fill"
                      style={{
                        width: `${tempRangeWidth(
                          weather.temperature.current,
                          weather.temperature.min,
                          weather.temperature.max
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="temp-range-label">
                    {Math.round(weather.temperature.max)}°
                  </span>
                </div>
              </div>

              {/* Condition badge */}
              <div>
                <div className="condition-badge">
                  {conditionEmoji(weather.weather.main)}
                  &nbsp;{weather.weather.main}
                </div>
              </div>

              {/* Stats grid */}
              <div className="weather-stats">
                <div className="stat-card">
                  <span className="stat-icon">💧</span>
                  <span className="stat-value">{weather.temperature.humidity}%</span>
                  <span className="stat-label">Humidity</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">💨</span>
                  <span className="stat-value">{weather.wind.speed} m/s</span>
                  <span className="stat-label">Wind Speed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-value">
                    {weather.visibility != null
                      ? `${(weather.visibility / 1000).toFixed(1)} km`
                      : 'N/A'}
                  </span>
                  <span className="stat-label">Visibility</span>
                </div>
              </div>

              {/* Sunrise / Sunset */}
              <div className="sun-row">
                <div className="sun-item">
                  <span className="sun-icon">🌅</span>
                  <div className="sun-info">
                    <span className="sun-value">{fmtTime(weather.sunrise)}</span>
                    <span className="sun-label">Sunrise</span>
                  </div>
                </div>
                <div className="sun-item">
                  <span className="sun-icon">🌇</span>
                  <div className="sun-info">
                    <span className="sun-value">{fmtTime(weather.sunset)}</span>
                    <span className="sun-label">Sunset</span>
                  </div>
                </div>
                <div className="sun-item">
                  <span className="sun-icon">☁️</span>
                  <div className="sun-info">
                    <span className="sun-value">
                      {weather.cloudiness != null ? `${weather.cloudiness}%` : 'N/A'}
                    </span>
                    <span className="sun-label">Cloud Cover</span>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="save-row">
                {saveSuccess ? (
                  <button className="save-btn saved" disabled>
                    ✓ Saved to Favorites
                  </button>
                ) : isAlreadySaved ? (
                  <button className="save-btn already-saved" disabled>
                    ♥ Already in Favorites
                  </button>
                ) : (
                  <button
                    id="save-favorite-btn"
                    className="save-btn primary"
                    onClick={handleSave}
                    disabled={savingCity}
                  >
                    {savingCity ? '⏳ Saving…' : '♡ Save to Favorites'}
                  </button>
                )}
              </div>

            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════
            RIGHT — Favorites sidebar (memoized component)
            ════════════════════════════════════════════════════════ */}
        <FavoritesSidebar
          favorites={favorites}
          deletingId={deletingId}
          weather={weather}
          onCityClick={searchWeather}
          onDelete={handleDelete}
        />

      </main>
    </div>
  )
}
