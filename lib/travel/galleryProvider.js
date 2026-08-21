const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const CACHE_TTL_MS = 15 * 60 * 1000;
let cachedGallery = null;

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function getWikimediaTravelGallery() {
  if (cachedGallery && Date.now() - cachedGallery.createdAt < CACHE_TTL_MS) {
    return cachedGallery.value;
  }

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: 'travel landscape',
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    iiextmetadatafilter: 'Artist|LicenseShortName|Credit'
  });
  const response = await fetch(`${COMMONS_API}?${params}`, {
    headers: {
      'User-Agent': 'HorizonTravels/1.0 (https://usehorizontravels.vercel.app/contact)',
      'Api-User-Agent': 'HorizonTravels/1.0 (https://usehorizontravels.vercel.app/contact)'
    }
  });
  if (!response.ok) throw new Error(`Wikimedia Commons returned ${response.status}`);

  const payload = await response.json();
  const images = Object.values(payload.query?.pages || {})
    .map((page) => {
      const image = page.imageinfo?.[0];
      const url = image?.thumburl || image?.url;
      if (!url) return null;
      const title = String(page.title || '').replace(/^File:/, '').replace(/[_-]+/g, ' ').replace(/\.[a-z0-9]+$/i, '');
      return {
        id: `wikimedia-${page.pageid}`,
        src: url,
        alt: title || 'Travel photograph from Wikimedia Commons',
        caption: title,
        category: 'Wikimedia Commons',
        source: 'Wikimedia Commons',
        sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`,
        author: stripHtml(image.extmetadata?.Artist?.value) || null,
        license: stripHtml(image.extmetadata?.LicenseShortName?.value) || 'See source for licence'
      };
    })
    .filter(Boolean);

  const value = { images, lastUpdated: new Date().toISOString() };
  cachedGallery = { createdAt: Date.now(), value };
  return value;
}
