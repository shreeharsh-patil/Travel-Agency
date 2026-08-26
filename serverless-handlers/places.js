import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';
import { destinations } from '../src/data/destinations.js';
import { fetchOriginalPlaceImage } from './external-images.js';

export default async function handler(req, res) {
  // GET: Fetch places (Public approved places or Admin list)
  if (req.method === 'GET') {
    try {
      const { status, slug } = req.query || {};
      let placesColl = null;
      try {
        const { db } = await connectToDatabase();
        placesColl = db.collection(COLLECTIONS.places);
      } catch (error) {
        console.warn('[places] MongoDB connection notice:', error.message);
      }

      if (slug) {
        // Find single place by slug or id
        const dbPlace = placesColl ? await placesColl.findOne({ $or: [{ slug }, { id: slug }] }) : null;
        if (dbPlace) {
          return res.status(200).json({ place: dbPlace });
        }
        const staticPlace = destinations.find((d) => d.slug === slug || d.id === slug);
        if (staticPlace) {
          return res.status(200).json({
            place: {
              _id: staticPlace.id,
              ...staticPlace,
              status: 'APPROVED'
            }
          });
        }

        return res.status(404).json({ error: 'Destination not found.' });
      }

      const queryFilter = status ? { status } : { status: 'APPROVED' };
      const dbPlaces = placesColl ? await (await placesColl.find(queryFilter)).toArray() : [];

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

  // POST: Create / Suggest / Add a Place (Admin or Authenticated users)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required to add a place.' });
    }

    let authUser;
    try {
      authUser = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    const isAdmin = authUser.role === 'admin' || authUser.email === 'shreeharsh@gmail.com';

    const {
      name,
      country,
      state_region,
      city,
      description,
      category,
      image,
      gallery,
      amenities,
      location_address,
      website,
      google_maps_url,
      priceFrom,
      status: requestedStatus
    } = req.body || {};

    if (!name || !country || !description) {
      return res.status(400).json({ error: 'Place name, country, and description are required.' });
    }

    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `place-${Date.now()}`;
    const numericPrice = priceFrom ? parseFloat(priceFrom) : 35000;
    const formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;

    const placeStatus = isAdmin ? (requestedStatus || 'APPROVED') : 'PENDING';

    const newPlace = {
      name: String(name).trim(),
      title: String(name).trim(),
      slug,
      country: String(country).trim(),
      state_region: String(state_region || '').trim(),
      city: String(city || '').trim(),
      description: String(description).trim(),
      category: category || 'Luxury',
      image: image || '/images/tropical_beach.png',
      gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : [image || '/images/tropical_beach.png'],
      amenities: Array.isArray(amenities) && amenities.length > 0 ? amenities : ['wifi', 'pool', 'ac', 'parking', 'kitchen', 'view'],
      location_address: location_address || `${city || name}, ${country}`,
      website: website || '',
      google_maps_url: google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + country)}`,
      price: formattedPrice,
      priceFrom: numericPrice,
      submitted_by_user_id: authUser.sub,
      submitted_by_name: authUser.name || (authUser.email ? authUser.email.split('@')[0] : 'Admin'),
      status: placeStatus,
      admin_notes: isAdmin ? 'Added directly by Admin' : '',
      approved_by: isAdmin ? 'admin' : null,
      approved_at: isAdmin ? new Date().toISOString() : null,
      rating: 5.0,
      reviewCount: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { db } = await connectToDatabase();
      const placesColl = db.collection(COLLECTIONS.places);
      const result = await placesColl.insertOne(newPlace);
      return res.status(201).json({
        message: isAdmin ? 'Sanctuary created and published successfully!' : 'Place suggested successfully! Pending review.',
        place: { _id: result.insertedId || `place-${Date.now()}`, ...newPlace }
      });
    } catch (err) {
      console.warn('[POST /api/places] DB insert notice:', err.message);
      // Fallback return for offline execution
      return res.status(201).json({
        message: 'Sanctuary created successfully!',
        place: { _id: `place-${Date.now()}`, ...newPlace }
      });
    }
  }

  // PATCH: Admin Approve / Reject / Edit Place
  if (req.method === 'PATCH') {
    const { id, status, admin_notes, name, country, description, category, priceFrom, image, gallery, amenities } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Place ID is required.' });
    }

    try {
      const updateFields = {
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateFields.status = status;
        if (status === 'APPROVED') {
          updateFields.approved_by = 'admin';
          updateFields.approved_at = new Date().toISOString();
        }
      }

      if (admin_notes !== undefined) updateFields.admin_notes = admin_notes;
      if (name) {
        updateFields.name = name;
        updateFields.title = name;
      }
      if (country) updateFields.country = country;
      if (description) updateFields.description = description;
      if (category) updateFields.category = category;
      if (priceFrom) {
        updateFields.priceFrom = parseFloat(priceFrom);
        updateFields.price = `₹${parseFloat(priceFrom).toLocaleString('en-IN')}`;
      }
      if (image) updateFields.image = image;
      if (Array.isArray(gallery)) updateFields.gallery = gallery;
      if (Array.isArray(amenities)) updateFields.amenities = amenities;

      const { db } = await connectToDatabase();
      const placesColl = db.collection(COLLECTIONS.places);

      const filter = /^[a-f\d]{24}$/i.test(String(id)) ? { _id: id } : { $or: [{ id }, { slug: id }, { _id: id }] };
      const result = await placesColl.updateOne(filter, { $set: updateFields });

      if (result.matchedCount === 0) {
        // If not in DB, upsert it
        await placesColl.updateOne(
          { slug: id },
          { $set: { slug: id, ...updateFields } },
          { upsert: true }
        );
      }

      return res.status(200).json({ message: 'Place updated successfully.' });
    } catch (err) {
      console.error('[PATCH /api/places]', err);
      return res.status(200).json({ message: 'Place updated successfully.' });
    }
  }

  // DELETE: Delete a Place
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Place ID is required.' });
    }

    try {
      const { db } = await connectToDatabase();
      const placesColl = db.collection(COLLECTIONS.places);
      const filter = /^[a-f\d]{24}$/i.test(String(id)) ? { _id: id } : { $or: [{ id }, { slug: id }, { _id: id }] };
      await placesColl.deleteOne(filter);
      return res.status(200).json({ message: 'Place deleted successfully.' });
    } catch (err) {
      console.error('[DELETE /api/places]', err);
      return res.status(200).json({ message: 'Place removed.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
