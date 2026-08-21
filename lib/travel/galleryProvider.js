const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const CACHE_TTL_MS = 15 * 60 * 1000;
let cachedGallery = null;

export async function getWikimediaTravelGallery() {
  if (cachedGallery && Date.now() - cachedGallery.createdAt < CACHE_TTL_MS) {
    return cachedGallery.value;
  }

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: 'Goa|Kyoto|Bali|Paris|Reykjavik|Ladakh|Mumbai|Amalfi Coast|Udaipur|Jaipur',
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pithumbsize: '1200'
  });
  const response = await fetch(`${WIKIPEDIA_API}?${params}`, {
    headers: {
      'User-Agent': 'HorizonTravels/1.0 (https://usehorizontravels.vercel.app/contact)',
      'Api-User-Agent': 'HorizonTravels/1.0 (https://usehorizontravels.vercel.app/contact)'
    }
  });
  if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`);

  const payload = await response.json();
  const images = Object.values(payload.query?.pages || {})
    .map((page) => {
      const url = page.thumbnail?.source || page.original?.source;
      if (!url) return null;
      const title = String(page.title || '').trim();
      return {
        id: `wikimedia-${page.pageid}`,
        src: url,
        alt: `${title} travel photograph`,
        caption: title,
        category: 'Destination photography',
        source: 'Wikipedia / Wikimedia Commons',
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        author: null,
        license: 'See source for licence'
      };
    })
    .filter(Boolean);

  const value = { images, lastUpdated: new Date().toISOString() };
  cachedGallery = { createdAt: Date.now(), value };
  return value;
}
