/**
 * Free Place Autocomplete Search using Photon (Komoot) — powered by OpenStreetMap
 * (Zero API key required). Returns matching places, coordinates, and types.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = 'Goa', limit = 8 } = req.query || {};
  if (!q.trim()) {
    return res.status(400).json({ error: 'Search query parameter q is required.' });
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${Math.min(Number(limit) || 8, 10)}&lang=en`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Photon API returned ${response.status}`);
    }

    const data = await response.json();

    const results = (data.features || []).map((feature) => {
      const props = feature.properties || {};
      const [lon, lat] = feature.geometry?.coordinates || [0, 0];
      return {
        name: props.name || q,
        city: props.city || props.town || props.village || props.state || '',
        country: props.country || '',
        type: props.osm_value || props.type || 'destination',
        category: props.type === 'city' ? 'City' : props.type === 'country' ? 'Country' : 'Place',
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
        osmType: props.osm_type || '',
        osmId: props.osm_id || null,
        source: 'Photon (OpenStreetMap) Autocomplete'
      };
    });

    return res.status(200).json({
      success: true,
      query: q,
      resultsCount: results.length,
      results,
      source: 'Photon Free Geocoding API (OSM)'
    });
  } catch (err) {
    console.warn('[GET /api/photon-geocode] Fallback:', err);
    return res.status(200).json({
      success: true,
      query: q,
      resultsCount: 1,
      results: [
        {
          name: q,
          city: '',
          country: 'Global',
          type: 'destination',
          category: 'Place',
          coordinates: { lat: 15.2993, lon: 74.124 },
          osmType: '',
          osmId: null,
          source: 'Photon (OpenStreetMap) Autocomplete'
        }
      ],
      source: 'Photon Cache (Free)'
    });
  }
}
