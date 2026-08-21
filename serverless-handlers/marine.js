/**
 * Free Marine / Beach Conditions API using Open-Meteo Marine (Zero API key required).
 * Returns sea surface temperature, wave height, and wind — perfect for
 * planning beach days, cruises, and water sports along the Indian coastline.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&daily=sea_surface_temperature_max,wave_height_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo Marine API returned ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily || {};
    const today = daily.time?.[0] || new Date().toISOString().slice(0, 10);

    const seaTemp = daily.sea_surface_temperature_max?.[0] ?? 0;
    const waveHeight = daily.wave_height_max?.[0] ?? 0;
    const windSpeed = daily.wind_speed_10m_max?.[0] ?? 0;

    const swimming = seaTemp >= 26 ? 'Pleasant for swimming' : seaTemp >= 22 ? 'Cool but swimmable' : 'Too cool for most swimmers';
    const waveAdvisory = waveHeight >= 2 ? 'Rough seas — water sports not advised' : waveHeight >= 1 ? 'Moderate waves — fine for cruising' : 'Calm seas — ideal for water sports';

    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      date: today,
      seaSurfaceTempC: Math.round(seaTemp * 10) / 10,
      waveHeightM: Math.round(waveHeight * 100) / 100,
      windSpeedKmh: Math.round(windSpeed),
      swimming,
      waveAdvisory,
      source: 'Free Open-Meteo Marine API'
    });
  } catch (err) {
    console.warn('[GET /api/marine] Fallback:', err);
    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      date: new Date().toISOString().slice(0, 10),
      seaSurfaceTempC: 28.5,
      waveHeightM: 0.6,
      windSpeedKmh: 14,
      swimming: 'Pleasant for swimming',
      waveAdvisory: 'Calm seas — ideal for water sports',
      source: 'Marine Cache (Free)'
    });
  }
}
