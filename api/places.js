import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';
import { destinations } from '../src/data/destinations.js';
import { fetchOriginalPlaceImage } from './external-images.js';


export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const placesColl = db.collection(COLLECTIONS.places);

  // GET: Fetch places (Public approved places or Admin list)
  if (req.method === 'GET') {
    try {
      const { status, slug } = req.query || {};

      if (slug) {
        // Find single place by slug or id
        const dbPlace = await placesColl.findOne({ $or: [{ slug }, { id: slug }] });
        if (dbPlace) {
          return res.status(200).json({ place: dbPlace });
        }
        const staticPlace = destinations.find(d => d.slug === slug || d.id === slug);
        if (staticPlace) {
          return res.status(200).json({
            place: {
              _id: staticPlace.id,
              ...staticPlace,
              status: 'APPROVED'
            }
          });
        }

        // Universal fallback for any place on Earth
        const formattedName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const originalImage = await fetchOriginalPlaceImage(formattedName);

        const dynamicPlace = {
          _id: slug,
          id: slug,
          slug,
          name: formattedName,
          title: `${formattedName} Luxury Sanctuary`,
          location: `${formattedName}, Global Destination`,
          country: 'Global Sanctuary',
          category: 'Cultural',
          price: '₹45,000',
          priceFrom: 45000,
          rating: 4.9,
          reviewCount: 45,
          tagline: `Unforgettable escapes in ${formattedName}`,
          description: `Discover the breathtaking sights, historic culture, and luxury retreats in ${formattedName}.`,
          image: originalImage,
          gallery: [originalImage],
          status: 'APPROVED'
        };

        return res.status(200).json({ place: dynamicPlace });
      }


      const queryFilter = status ? { status } : { status: 'APPROVED' };
      const cursor = await placesColl.find(queryFilter);
      const dbPlaces = await cursor.toArray();

      // Merge with static destinations for public listing if status is APPROVED or empty
      if (!status || status === 'APPROVED') {
        const mergedMap = new Map();
        for (const d of destinations) {
          mergedMap.set(d.slug || d.id, { _id: d.id, ...d, status: 'APPROVED' });
        }
        for (const p of dbPlaces) {
          mergedMap.set(p.slug || p._id, p);
        }
        return res.status(200).json({ places: Array.from(mergedMap.values()) });
      }

      return res.status(200).json({ places: dbPlaces });
    } catch (err) {
      console.error('[GET /api/places]', err);
      return res.status(500).json({ error: 'Failed to fetch places' });
    }
  }

  // POST: Suggest / Add a Place (Authenticated users)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required to suggest a place.' });
    }

    let authUser;
    try {
      authUser = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }



    const {
      name,
      country,
      state_region,
      city,
      description,
      category,
      image,
      gallery,
      location_address,
      website,
      google_maps_url,
      priceFrom
    } = req.body || {};

    if (!name || !country || !description) {
      return res.status(400).json({ error: 'Place name, country, and description are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const numericPrice = priceFrom ? parseFloat(priceFrom) : 25000;
    const formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;

    const newPlace = {
      name: String(name).trim(),
      title: String(name).trim(),
      slug,
      country: String(country).trim(),
      state_region: String(state_region || '').trim(),
      city: String(city || '').trim(),
      description: String(description).trim(),
      category: category || 'Cultural',
      image: image || '/images/tropical_beach.png',
      gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : [image || '/images/tropical_beach.png'],
      location_address: location_address || '',
      website: website || '',
      google_maps_url: google_maps_url || '',
      price: formattedPrice,
      priceFrom: numericPrice,
      submitted_by_user_id: authUser.sub,
      submitted_by_name: authUser.email ? authUser.email.split('@')[0] : 'User',
      status: 'PENDING', // Moderation workflow
      admin_notes: '',
      approved_by: null,
      approved_at: null,
      rating: 5.0,
      reviewCount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await placesColl.insertOne(newPlace);
      return res.status(201).json({
        message: 'Place suggested successfully! It is currently pending admin review.',
        place: { _id: result.insertedId, ...newPlace }
      });
    } catch (err) {
      console.error('[POST /api/places]', err);
      return res.status(500).json({ error: 'Could not submit place.' });
    }
  }

  // PATCH: Admin Approve / Reject / Edit Place
  if (req.method === 'PATCH') {
    const { id, status, admin_notes, name, country, description, category, priceFrom } = req.body || {};

    if (!id || !status) {
      return res.status(400).json({ error: 'Place ID and status are required.' });
    }

    try {
      const updateFields = {
        status,
        admin_notes: admin_notes || '',
        updated_at: new Date().toISOString()
      };

      if (status === 'APPROVED') {
        updateFields.approved_at = new Date().toISOString();
        updateFields.approved_by = 'admin';
      }

      if (name) updateFields.name = name;
      if (country) updateFields.country = country;
      if (description) updateFields.description = description;
      if (category) updateFields.category = category;
      if (priceFrom) {
        updateFields.priceFrom = parseFloat(priceFrom);
        updateFields.price = `₹${parseFloat(priceFrom).toLocaleString('en-IN')}`;
      }

      await placesColl.updateOne({ $or: [{ _id: id }, { id: id }, { slug: id }] }, { $set: updateFields });

      return res.status(200).json({ message: `Place updated status to ${status}.` });
    } catch (err) {
      console.error('[PATCH /api/places]', err);
      return res.status(500).json({ error: 'Failed to update place.' });
    }
  }

  // DELETE: Admin delete place
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Place ID is required.' });

    try {
      await placesColl.deleteOne({ $or: [{ _id: id }, { id: id }, { slug: id }] });
      return res.status(200).json({ message: 'Place deleted successfully.' });
    } catch (err) {
      console.error('[DELETE /api/places]', err);
      return res.status(500).json({ error: 'Failed to delete place.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
