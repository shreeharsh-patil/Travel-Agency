/**
 * Free Official Foreign Travel Advisories & Safety API (Zero API Key Required).
 * Connects to official GOV.UK Foreign, Commonwealth & Development Office (FCDO) Open Data.
 */

const COUNTRY_SLUG_MAP = {
  india: 'india',
  japan: 'japan',
  italy: 'italy',
  france: 'france',
  indonesia: 'indonesia',
  iceland: 'iceland',
  switzerland: 'switzerland',
  usa: 'usa',
  'united states': 'usa',
  uae: 'united-arab-emirates',
  thailand: 'thailand',
  spain: 'spain',
  greece: 'greece',
  australia: 'australia',
  maldives: 'maldives'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country = 'India' } = req.query || {};
  const clean = String(country).toLowerCase().trim();
  const slug = COUNTRY_SLUG_MAP[clean] || clean.replace(/\s+/g, '-');

  try {
    const response = await fetch(`https://www.gov.uk/api/content/foreign-travel-advice/${slug}`, {
      headers: {
        'User-Agent': 'HorizonTravels/1.0 (https://usehorizontravels.vercel.app)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const parts = data.details?.parts || [];
      const warningsPart = parts.find(p => /warning|safety|entry/i.test(p.title || '')) || parts[0];

      return res.status(200).json({
        success: true,
        country: country,
        title: data.title || `${country} Travel Advisory`,
        summary: data.description || `Official travel safety and entry guidelines for ${country}.`,
        topics: parts.map(p => ({
          title: p.title,
          slug: p.slug
        })),
        advisorySnippet: warningsPart ? warningsPart.body?.replace(/<[^>]*>?/gm, '').slice(0, 320) + '...' : null,
        updatedAt: data.public_updated_at || new Date().toISOString()
      });
    }
    throw new Error(`GOV.UK returned ${response.status}`);
  } catch (err) {
    console.warn('[travel-advisory] Fallback for', country, err.message);
    return res.status(200).json({
      success: true,
      country: country,
      title: `${country} Travel Safety & Advisory`,
      summary: `Standard international travel safety advisory. Check passport validity (min 6 months) and local entry regulations before departure.`,
      topics: [
        { title: 'Entry requirements', slug: 'entry-requirements' },
        { title: 'Safety and security', slug: 'safety-and-security' },
        { title: 'Health advice', slug: 'health' }
      ],
      advisorySnippet: `Always carry copies of your passport and travel insurance. Register with your national embassy when traveling internationally.`,
      updatedAt: new Date().toISOString()
    });
  }
}
