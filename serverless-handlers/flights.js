/**
 * Optional live aircraft tracking via OpenSky. This route is deliberately not
 * a flight-shopping endpoint: OpenSky does not provide fares or availability.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = '' } = req.query || {};

  try {
    const url = 'https://opensky-network.org/api/states/all';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HorizonTravels/1.0 (free-flights-api)'
      }
    });

    if (!response.ok) throw new Error(`OpenSky returned ${response.status}`);
    const data = await response.json();

    return res.status(200).json({
      available: true,
      destination,
      activeAirspaceFlights: Array.isArray(data.states) ? data.states.length : 0,
      source: 'OpenSky Network',
      dataType: 'aircraft-tracking',
      lastUpdated: data.time ? new Date(data.time * 1000).toISOString() : null
    });
  } catch (err) {
    console.warn('[flights] OpenSky unavailable:', err.message);
    return res.status(503).json({ available: false, error: 'Live aircraft tracking is temporarily unavailable.', source: 'OpenSky Network', dataType: 'aircraft-tracking' });
  }
}
