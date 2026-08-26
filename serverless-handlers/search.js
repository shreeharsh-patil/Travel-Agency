import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { destinations } from '../src/data/destinations.js';
import { fetchOriginalPlaceImage } from './external-images.js';

function scorePlace(p, rawQuery) {
  const query = rawQuery.toLowerCase().trim();
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  // Stems (strip common trailing s, es, ing, ed)
  const stems = tokens.map(t => t.replace(/s$|es$|ing$|ed$/i, ''));

  const name = String(p.name || '').toLowerCase();
  const title = String(p.title || '').toLowerCase();
  const tagline = String(p.tagline || '').toLowerCase();
  const country = String(p.country || '').toLowerCase();
  const city = String(p.city || '').toLowerCase();
  const state = String(p.state_region || p.state || '').toLowerCase();
  const category = String(p.category || '').toLowerCase();
  const desc = String(p.description || '').toLowerCase();
  const fullBlob = `${name} ${title} ${tagline} ${country} ${city} ${state} ${category} ${desc}`;

  let score = 0;

  // 1. Full phrase exact match
  if (name === query) score += 150;
  else if (name.includes(query)) score += 120;
  else if (title.includes(query)) score += 100;
  else if (city.includes(query) || country.includes(query)) score += 80;
  else if (fullBlob.includes(query)) score += 50;

  // 2. Token / word-level match
  let tokensMatched = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const stem = stems[i];
    let tokFound = false;

    if (name.includes(tok)) {
      score += 45;
      tokFound = true;
    } else if (stem.length >= 3 && name.includes(stem)) {
      score += 35;
      tokFound = true;
    }

    if (title.includes(tok) || tagline.includes(tok)) {
      score += 30;
      tokFound = true;
    } else if (stem.length >= 3 && (title.includes(stem) || tagline.includes(stem))) {
      score += 25;
      tokFound = true;
    }

    if (city.includes(tok) || country.includes(tok) || state.includes(tok)) {
      score += 25;
      tokFound = true;
    } else if (stem.length >= 3 && (city.includes(stem) || country.includes(stem))) {
      score += 20;
      tokFound = true;
    }

    if (category.includes(tok) || (stem.length >= 3 && category.includes(stem))) {
      score += 25;
      tokFound = true;
    }

    if (desc.includes(tok) || (stem.length >= 3 && desc.includes(stem))) {
      score += 15;
      tokFound = true;
    }

    if (tokFound) tokensMatched++;
  }

  if (tokensMatched === tokens.length) {
    score += 60;
  }

  return score;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = String(req.query.q || req.query.query || '').trim();

  if (!query) {
    return res.status(200).json({
      query: '',
      results: { places: [], packages: [], experiences: [], guides: [] }
    });
  }

  try {
    let dbPlaces = [];
    try {
      const { db } = await connectToDatabase();
      dbPlaces = await db.collection(COLLECTIONS.places).find({ status: 'APPROVED' }).toArray();
    } catch {
      // MongoDB offline fallback
    }

    // Merge static destinations and approved DB places
    const allPlacesMap = new Map();

    for (const d of destinations) {
      allPlacesMap.set(d.slug || d.id, {
        id: d.id || d.slug,
        slug: d.slug || d.id,
        name: d.name || d.title,
        title: d.title || d.name,
        country: d.country,
        state_region: d.state || d.region || '',
        city: d.city || d.location,
        tagline: d.tagline || '',
        description: d.description,
        category: d.category || 'Destination',
        price: d.price,
        priceFrom: d.priceFrom,
        rating: d.rating || 4.8,
        reviewCount: d.reviewCount || 10,
        image: d.image,
        type: 'Verified Destination'
      });
    }

    for (const p of dbPlaces) {
      allPlacesMap.set(p.slug || p._id, {
        id: p._id || p.id,
        slug: p.slug || p.id || p._id,
        name: p.name || p.title,
        title: p.title || p.name,
        country: p.country,
        state_region: p.state_region || p.state || '',
        city: p.city || p.location_address || '',
        tagline: p.tagline || '',
        description: p.description,
        category: p.category || 'User Suggested Place',
        price: p.price || `₹${(p.priceFrom || 25000).toLocaleString('en-IN')}`,
        priceFrom: p.priceFrom || 25000,
        rating: p.rating || 5.0,
        reviewCount: p.reviewCount || 1,
        image: p.image || '/images/tropical_beach.png',
        type: p.submitted_by_user_id ? 'Community Place' : 'Verified Destination'
      });
    }

    const allPlaces = Array.from(allPlacesMap.values());

    // Score all places using fuzzy token scoring
    const scoredPlaces = allPlaces
      .map((p) => ({ place: p, score: scorePlace(p, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const hasStrongNameMatch = scoredPlaces.some((item) => {
      const p = item.place;
      const q = query.toLowerCase();
      return String(p.name || '').toLowerCase().includes(q) || String(p.title || '').toLowerCase().includes(q) || String(p.city || '').toLowerCase().includes(q) || String(p.country || '').toLowerCase().includes(q);
    });

    let matchedPlaces = scoredPlaces.filter((item) => item.score >= 40).map((item) => item.place);

    // If query did not have a direct name/country match, prepend the Global Destination card
    if (!hasStrongNameMatch && query.length >= 2) {
      const formattedName = query.replace(/\b\w/g, (l) => l.toUpperCase());
      const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let originalImage = null;

      try {
        originalImage = await fetchOriginalPlaceImage(formattedName);
      } catch {
        // fallback
      }

      if (!originalImage) {
        originalImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';
      }

      matchedPlaces = [
        {
          id: `global-${slug}`,
          slug,
          name: formattedName,
          title: `${formattedName} Bespoke Luxury Escape`,
          country: 'Global Destination',
          state_region: '',
          city: formattedName,
          description: `Experience customized luxury travel, private villas, and bespoke expeditions in ${formattedName}.`,
          category: 'Global Sanctuary',
          price: '₹45,000',
          priceFrom: 45000,
          rating: 4.9,
          reviewCount: 38,
          image: originalImage,
          type: 'Global Destination'
        },
        ...matchedPlaces
      ];
    }

    const qLower = query.toLowerCase();
    const qTokens = qLower.split(/\s+/).filter(Boolean);

    // Filter curated experiences & guides
    const experiences = [
      { id: 'exp-1', title: `Private Sunset Catamaran Cruise in ${matchedPlaces[0]?.name || query}`, location: matchedPlaces[0]?.country || 'Coastal Escapes', category: 'Boating', price: '₹18,500' },
      { id: 'exp-2', title: `VIP Guided Cultural Heritage & Architecture Walk in ${matchedPlaces[0]?.name || query}`, location: matchedPlaces[0]?.city || query, category: 'Cultural', price: '₹12,000' },
      { id: 'exp-3', title: `Michelin-Caliber Chef Private Dining Experience in ${matchedPlaces[0]?.name || query}`, location: matchedPlaces[0]?.name || query, category: 'Gastronomy', price: '₹24,000' }
    ];

    const guides = [
      { id: 'g-1', title: `The Insider Luxury Guide to ${matchedPlaces[0]?.name || query}: Best Villas, Stays & Sights`, readTime: '6 min read', category: 'Travel Guide' },
      { id: 'g-2', title: `Fine Dining, Wine & Cultural Etiquette in ${matchedPlaces[0]?.country || query}`, readTime: '5 min read', category: 'Culture Guide' }
    ];

    return res.status(200).json({
      query,
      results: {
        places: matchedPlaces,
        packages: matchedPlaces.map((p) => ({
          id: `pkg-${p.slug || p.id}`,
          title: `${p.name} 6-Day Bespoke Luxury Blueprint`,
          placeSlug: p.slug,
          price: p.price,
          duration: '5 Nights / 6 Days'
        })),
        experiences,
        guides
      }
    });
  } catch (err) {
    console.error('[search]', err);
    return res.status(500).json({ error: 'Search failed' });
  }
}
