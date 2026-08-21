/**
 * Free Live Weather API using Open-Meteo (Zero API key required).
 * Returns current temperature (°C), weather condition, wind speed, and 3-day forecast.
 */

const CITY_COORDINATES = {
  goa: { lat: 15.2993, lon: 74.1240, city: 'Goa', country: 'India' },
  kyoto: { lat: 35.0116, lon: 135.7681, city: 'Kyoto', country: 'Japan' },
  amalfi: { lat: 40.6340, lon: 14.6027, city: 'Amalfi Coast', country: 'Italy' },
  aspen: { lat: 39.1911, lon: -106.8175, city: 'Aspen', country: 'USA' },
  bali: { lat: -8.4095, lon: 115.1889, city: 'Bali', country: 'Indonesia' },
  reykjavik: { lat: 64.1466, lon: -21.9426, city: 'Reykjavik', country: 'Iceland' },
  maldives: { lat: 3.2028, lon: 73.2207, city: 'Maldives', country: 'Maldives' },
  tokyo: { lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan' },
  paris: { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France' },
  mumbai: { lat: 19.0760, lon: 72.8777, city: 'Mumbai', country: 'India' },
  ladakh: { lat: 34.1526, lon: 77.5771, city: 'Ladakh', country: 'India' }
};

function getWeatherDescription(code) {
  if (code === 0) return 'Clear Sky ☀️';
  if (code <= 3) return 'Partly Cloudy ⛅';
  if (code <= 48) return 'Foggy 🌫️';
  if (code <= 67) return 'Light Rain 🌧️';
  if (code <= 77) return 'Snow ❄️';
  if (code <= 82) return 'Heavy Showers 🌩️';
  return 'Pleasant Weather 🌈';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city = 'goa', lat: queryLat, lon: queryLon } = req.query || {};
  const cityKey = String(city).toLowerCase().trim();
  const matched = CITY_COORDINATES[cityKey];

  if ((!queryLat || !queryLon) && !matched) {
    return res.status(200).json({
      available: false,
      city: String(city),
      error: 'Weather is currently unavailable for this destination.',
      source: 'Open-Meteo'
    });
  }

  const lat = queryLat ? parseFloat(queryLat) : matched.lat;
  const lon = queryLon ? parseFloat(queryLon) : matched.lon;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo weather API returned status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current_weather || {};
    const daily = data.daily || {};

    return res.status(200).json({
      success: true,
      city: matched?.city || String(city),
      country: matched?.country || null,
      coordinates: { lat, lon },
      available: Boolean(data.current_weather),
      temperature: Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°C` : null,
      condition: Number.isFinite(current.weathercode) ? getWeatherDescription(current.weathercode) : null,
      windSpeed: Number.isFinite(current.windspeed) ? `${current.windspeed} km/h` : null,
      forecast: (daily.time || []).slice(0, 3).map((time, idx) => ({
        date: time,
        maxTemp: `${Math.round(daily.temperature_2m_max[idx])}°C`,
        minTemp: `${Math.round(daily.temperature_2m_min[idx])}°C`
      })),
      source: 'Open-Meteo',
      lastUpdated: data.current_weather?.time || null
    });
  } catch (err) {
    console.error('[weather] Open-Meteo unavailable:', err.message);
    return res.status(503).json({ available: false, error: 'Weather currently unavailable', source: 'Open-Meteo' });
  }
}
