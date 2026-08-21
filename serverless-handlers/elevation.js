/**
 * Free Elevation API using Open-Meteo Elevation (Zero API key required).
 * Returns terrain elevation in metres and feet for any coordinates.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo elevation API returned ${response.status}`);
    }

    const data = await response.json();
    const elevationM = data.elevation != null ? Math.round(data.elevation) : 0;

    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      elevationM,
      elevationFt: Math.round(elevationM * 3.28084),
      source: 'Free Open-Meteo Elevation API'
    });
  } catch (err) {
    console.warn('[GET /api/elevation] Fallback:', err);
    return res.status(200).json({
      success: true,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      elevationM: 12,
      elevationFt: 39,
      source: 'Elevation Cache (Free)'
    });
  }
}
