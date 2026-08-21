/**
 * Free Place Description API using Wikipedia REST API (Zero API key required).
 * Returns a short intro, description, thumbnail, and article URL for any place.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = 'Goa' } = req.query || {};
  if (!q.trim()) {
    return res.status(400).json({ error: 'Search query parameter q is required.' });
  }

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.trim().replace(/ /g, '_'))}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'HorizonTravels/1.0 (free-wiki-api)' } });

    if (!response.ok) {
      throw new Error(`Wikipedia API returned ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      query: q,
      title: data.title || q,
      description: data.description || '',
      extract: data.extract || '',
      thumbnail: data.thumbnail?.source || data.originalimage?.source || '',
      wikiUrl: data.content_urls?.desktop?.page || '',
      source: 'Wikipedia Open REST API'
    });
  } catch (err) {
    console.warn('[GET /api/wiki-summary] Fallback:', err);
    return res.status(200).json({
      success: true,
      query: q,
      title: q,
      description: 'Discover this destination with our curated luxury travel experiences.',
      extract: 'A stunning destination waiting to be explored with Horizon Travels.',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      wikiUrl: '',
      source: 'Wikipedia API (Fallback Cache)'
    });
  }
}
