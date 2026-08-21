import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

export default async function handler(req, res) {
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required for favorites.' });
  }

  let authUser;
  try {
    authUser = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid authentication session.' });
  }



  const { db } = await connectToDatabase();
  const favoritesColl = db.collection(COLLECTIONS.favorites);


  // GET: Fetch saved favorite places
  if (req.method === 'GET') {
    try {
      const cursor = await favoritesColl.find({ user_id: authUser.sub });
      const favs = await cursor.toArray();
      
      const placeIds = favs.map(f => f.place_id);
      
      return res.status(200).json({
        favorites: favs,
        placeIds
      });
    } catch (err) {
      console.error('[GET /api/favorites]', err);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  }

  // POST: Toggle / Add Favorite
  if (req.method === 'POST') {
    const { place_id, item_type = 'destination', provider, provider_id } = req.body || {};
    if (!place_id) return res.status(400).json({ error: 'Place ID is required.' });
    if (!['destination', 'hotel', 'attraction', 'experience'].includes(item_type)) return res.status(400).json({ error: 'Unsupported favorite type.' });

    try {
      const existing = await favoritesColl.findOne({
        user_id: authUser.sub,
        place_id
      });

      if (existing) {
        // Toggle OFF if already saved
        await favoritesColl.deleteOne({ _id: existing._id });
        return res.status(200).json({ saved: false, message: 'Removed from favorites' });
      }

      // Add to favorites
      const newFav = {
        user_id: authUser.sub,
        place_id,
        item_type,
        provider: provider || null,
        provider_id: provider_id || null,
        created_at: new Date().toISOString()
      };

      await favoritesColl.insertOne(newFav);
      return res.status(201).json({ saved: true, message: 'Saved to favorites' });
    } catch (err) {
      console.error('[POST /api/favorites]', err);
      return res.status(500).json({ error: 'Failed to update favorites' });
    }
  }

  // DELETE: Remove favorite
  if (req.method === 'DELETE') {
    const { place_id } = req.query || {};
    if (!place_id) return res.status(400).json({ error: 'Place ID required' });

    try {
      await favoritesColl.deleteOne({ user_id: authUser.sub, place_id });
      return res.status(200).json({ saved: false, message: 'Removed from favorites' });
    } catch (err) {
      console.error('[DELETE /api/favorites]', err);
      return res.status(500).json({ error: 'Failed to remove favorite' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
