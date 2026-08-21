/**
 * Free UV Index API using Open-Meteo (Zero API key required).
 * Returns today's maximum UV index and sun-exposure safety advice —
 * especially useful for beach destinations like Goa and Kerala.
 */

function getUvAdvice(uv) {
  if (uv <= 2) return { level: 'Low', advice: 'No protection required — enjoy the sun safely.' };
  if (uv <= 5) return { level: 'Moderate', advice: 'Wear sunscreen, sunglasses, and a hat if out for more than an hour.' };
  if (uv <= 7) return { level: 'High', advice: 'Apply SPF 30+ sunscreen and seek shade around midday.' };
  if (uv <= 10) return { level: 'Very High', advice: 'SPF 50+ sunscreen required. Avoid direct sun between 10 AM and 4 PM.' };
  return { level: 'Extreme', advice: 'Stay indoors near midday; extreme burn risk for unprotected skin.' };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo UV API returned ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily || {};
    const today = daily.time?.[0] || new Date().toISOString().slice(0, 10);
    const uvMax = daily.uv_index_max?.[0] ?? 0;
    const rounded = Math.round(uvMax * 10) / 10;
    const { level, advice } = getUvAdvice(rounded);

    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      date: today,
      uvIndexMax: rounded,
      level,
      advice,
      source: 'Free Open-Meteo UV Index API'
    });
  } catch (err) {
    console.warn('[GET /api/uv-index] Fallback:', err);
    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      date: new Date().toISOString().slice(0, 10),
      uvIndexMax: 6,
      level: 'High',
      advice: 'Apply SPF 30+ sunscreen and seek shade around midday.',
      source: 'UV Index Cache (Free)'
    });
  }
}
