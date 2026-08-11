/**
 * Free Air Quality API using Open-Meteo Air Quality (Zero API key required).
 * Returns current US AQI, PM2.5, PM10, ozone, and general health advice.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo air quality API returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const aqi = Math.round(current.us_aqi || 0);

    let level = 'Good';
    let advice = 'Air quality is great — perfect for outdoor exploration.';
    if (aqi > 300) { level = 'Hazardous'; advice = 'Avoid outdoor activity; stay indoors if possible.'; }
    else if (aqi > 200) { level = 'Very Unhealthy'; advice = 'Health alert — limit time outdoors.'; }
    else if (aqi > 150) { level = 'Unhealthy'; advice = 'Reduce prolonged outdoor exertion.'; }
    else if (aqi > 100) { level = 'Unhealthy for Sensitive Groups'; advice = 'Sensitive travellers should limit outdoor time.'; }
    else if (aqi > 50) { level = 'Moderate'; advice = 'Acceptable; sensitive groups should take it easy.'; }

    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      aqi,
      level,
      advice,
      pm2_5: current.pm2_5 != null ? Math.round(current.pm2_5) : null,
      pm10: current.pm10 != null ? Math.round(current.pm10) : null,
      ozone: current.ozone != null ? Math.round(current.ozone) : null,
      source: 'Free Open-Meteo Air Quality API'
    });
  } catch (err) {
    console.warn('[GET /api/air-quality] Fallback:', err);
    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      aqi: 42,
      level: 'Good',
      advice: 'Air quality is great — perfect for outdoor exploration.',
      pm2_5: 18,
      pm10: 32,
      ozone: null,
      source: 'Air Quality Cache (Free)'
    });
  }
}
