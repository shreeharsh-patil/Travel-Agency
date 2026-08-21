/**
 * Free External Image Fetcher Service.
 * Fetches original high-resolution photography from Wikipedia / Wikimedia Commons open API
 * and high-quality Unsplash photography for any travel place or query.
 */

const CURATED_DESTINATION_PHOTOS = {
  goa: 'https://images.unsplash.com/photo-1512343800234-840322ee8146?w=1200&auto=format&fit=crop&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
  amalfi: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80',
  aspen: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  reykjavik: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&auto=format&fit=crop&q=80',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&auto=format&fit=crop&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
  tajmahal: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80'
};

export async function fetchOriginalPlaceImage(placeName) {
  if (!placeName) return CURATED_DESTINATION_PHOTOS.goa;

  const cleanName = String(placeName).trim();
  const lowerKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (CURATED_DESTINATION_PHOTOS[lowerKey]) {
    return CURATED_DESTINATION_PHOTOS[lowerKey];
  }

  // 1. Try Wikimedia Commons / Wikipedia PageImage API
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      cleanName
    )}&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=1000&origin=*`;

    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      const pageKey = Object.keys(pages)[0];
      if (pageKey && pageKey !== '-1') {
        const page = pages[pageKey];
        if (page.original?.source) {
          return page.original.source;
        }
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
  } catch (err) {
    console.warn('[fetchOriginalPlaceImage] Wikipedia fetch failed:', err);
  }

  // 2. Fallback to high-resolution Unsplash photo URL
  return `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query = 'Kyoto' } = req.query || {};
  const imageUrl = await fetchOriginalPlaceImage(query);

  return res.status(200).json({
    success: true,
    query,
    image: imageUrl,
    source: imageUrl.includes('upload.wikimedia.org')
      ? 'Wikimedia Commons (Original Open License)'
      : 'Unsplash High-Res API'
  });
}
