import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { destinations } from '../src/data/destinations.js';
import { fetchOriginalPlaceImage } from './external-images.js';



export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = String(req.query.q || req.query.query || '').trim().toLowerCase();

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

    // Perform fuzzy search filtering
    let matchedPlaces = allPlaces.filter((p) => {
      const nameMatch = String(p.name || '').toLowerCase().includes(query);
      const titleMatch = String(p.title || '').toLowerCase().includes(query);
      const countryMatch = String(p.country || '').toLowerCase().includes(query);
      const cityMatch = String(p.city || '').toLowerCase().includes(query);
      const categoryMatch = String(p.category || '').toLowerCase().includes(query);
      const descMatch = String(p.description || '').toLowerCase().includes(query);

      return nameMatch || titleMatch || countryMatch || cityMatch || categoryMatch || descMatch;
    });

    if (process.env.LEGACY_DEMO_MODE === '1' && matchedPlaces.length === 0 && query.length >= 2) {
      const formattedName = query.replace(/\b\w/g, l => l.toUpperCase());
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


    // Sample experiences & guides
    const experiences = [
      { id: 'exp-1', title: 'Private Sunset Yacht Sailing in Goa', location: 'Goa, India', category: 'Boating', price: '₹12,500' },
      { id: 'exp-2', title: 'Traditional Matcha Tea Ceremony', location: 'Kyoto, Japan', category: 'Cultural', price: '₹8,500' },
      { id: 'exp-3', title: 'Heli-Skiing Adventure in Aspen', location: 'Aspen, USA', category: 'Adventure', price: '₹45,000' }
    ].filter(e => e.title.toLowerCase().includes(query) || e.location.toLowerCase().includes(query) || e.category.toLowerCase().includes(query));

    const guides = [
      { id: 'g-1', title: 'The Ultimate Guide to Secret Beaches in North Goa', readTime: '5 min read', category: 'Travel Guide' },
      { id: 'g-2', title: 'Kyoto Temple Pass & Zen Etiquette Manual', readTime: '7 min read', category: 'Culture Guide' }
    ].filter(g => g.title.toLowerCase().includes(query) || g.category.toLowerCase().includes(query));

    return res.status(200).json({
      query,
      results: {
        places: matchedPlaces,
        packages: matchedPlaces.map(p => ({
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
