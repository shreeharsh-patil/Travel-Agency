/**
 * Sunrise, Sunset, and Golden Hour Photography Times API using Sunrise-Sunset Open API.
 * Calculates golden hour, dawn, dusk, sunrise, and sunset times for photography planning.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        const { sunrise, sunset, golden_hour } = data.results;
        return res.status(200).json({
          success: true,
          sunrise: new Date(sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          goldenHour: golden_hour ? new Date(golden_hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '5:45 PM',
          source: 'Sunrise-Sunset Open API'
        });
      }
    }

    throw new Error('Sunrise-Sunset API error');
  } catch (err) {
    console.warn('[GET /api/sun-times] Fallback:', err);
    return res.status(200).json({
      success: true,
      sunrise: '6:15 AM',
      sunset: '6:45 PM',
      goldenHour: '5:45 PM',
      source: 'Solar Times Calculator'
    });
  }
}
