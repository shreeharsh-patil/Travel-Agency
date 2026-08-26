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

  // If all query tokens matched somewhere in the place, award bonus
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
    // Curated destinations remain searchable when MongoDB is temporarily
    // unavailable. Community places are included again after it reconnects.
    let dbPlaces = [];
    try {
      const { db } = await connectToDatabase();
      dbPlaces = await db.collection(COLLECTIONS.places).find({ status: 'APPROVED' }).toArray();
    } catch (error) {
      console.warn('[search] MongoDB unavailable; searching curated destinations only:', error.message);
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
      .sort((a, b) => b.score - a.score)
      .map((item) => item.place);

    let matchedPlaces = scoredPlaces;

    if (process.env.LEGACY_DEMO_MODE === '1' && matchedPlaces.length === 0 && query.length >= 2) {
      const formattedName = query.replace(/\b\w/g, (l) => l.toUpperCase());
      const originalImage = await fetchOriginalPlaceImage(formattedName);
      const slug = query.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      matchedPlaces = [
        {
          id: slug,
          slug,
          name: formattedName,
          title: `${formattedName} Sanctuary`,
          country: 'Global Sanctuary',
          state_region: '',
          city: formattedName,
          description: `Bespoke luxury escapes and exploration in ${formattedName}.`,
          category: 'Cultural',
          price: '₹35,000',
          priceFrom: 35000,
          rating: 4.9,
          reviewCount: 38,
          image: originalImage,
          type: 'Global Destination'
        }
      ];
    }

    const qLower = query.toLowerCase();
    const qTokens = qLower.split(/\s+/).filter(Boolean);

    // Filter curated experiences & guides by token
    const experiences = [
      { id: 'exp-1', title: 'Private Sunset Yacht Sailing in Goa', location: 'Goa, India', category: 'Boating', price: '₹12,500' },
      { id: 'exp-2', title: 'Traditional Matcha Tea Ceremony in Kyoto', location: 'Kyoto, Japan', category: 'Cultural', price: '₹8,500' },
      { id: 'exp-3', title: 'Heli-Skiing Adventure in Swiss Alps & Aspen', location: 'Swiss Alps, Switzerland', category: 'Adventure', price: '₹45,000' },
      { id: 'exp-4', title: 'Private Catamaran Charter along Amalfi Coast', location: 'Amalfi Coast, Italy', category: 'Boating', price: '₹32,000' },
      { id: 'exp-5', title: 'Sunrise VIP Entry to Taj Mahal Agra', location: 'Agra, India', category: 'Heritage', price: '₹18,000' }
    ].filter((e) => {
      const blob = `${e.title} ${e.location} ${e.category}`.toLowerCase();
      return blob.includes(qLower) || qTokens.some((tok) => blob.includes(tok));
    });

    const guides = [
      { id: 'g-1', title: 'The Ultimate Guide to Secret Beaches & Luxury in North Goa', readTime: '5 min read', category: 'Travel Guide' },
      { id: 'g-2', title: 'Kyoto Temple Pass & Zen Etiquette Manual', readTime: '7 min read', category: 'Culture Guide' },
      { id: 'g-3', title: 'Insider Guide to Swiss Alps Chalets & Skiing', readTime: '6 min read', category: 'Alpine Guide' },
      { id: 'g-4', title: 'Amalfi Coast Clifftop Escapes & Dining Directory', readTime: '8 min read', category: 'Luxury Guide' }
    ].filter((g) => {
      const blob = `${g.title} ${g.category}`.toLowerCase();
      return blob.includes(qLower) || qTokens.some((tok) => blob.includes(tok));
    });

    return res.status(200).json({
      query,
      results: {
        places: matchedPlaces,
        packages: matchedPlaces.map((p) => ({
          id: `pkg-${p.id}`,
          title: `${p.name} Exclusive Luxury Package`,
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
