import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';
import { getWikimediaTravelGallery } from '../lib/travel/galleryProvider.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let images = [];
    try {
      const { db } = await connectToDatabase();
      const cursor = await db.collection(COLLECTIONS.gallery).find({
        status: 'APPROVED',
        sourceType: { $in: ['curated', 'traveler'] }
      });
      images =
        typeof cursor.sort === 'function'
          ? await cursor.sort({ sortOrder: 1, _id: 1 }).toArray()
          : await cursor.toArray();
    } catch (err) {
      console.warn('[images] Gallery database unavailable:', err.message);
    }

    if (images.length > 0) return res.status(200).json({ available: true, source: 'Horizon Travels', images });

    try {
      const gallery = await getWikimediaTravelGallery();
      return res.status(200).json({ available: true, source: 'Wikimedia Commons', ...gallery });
    } catch (err) {
      console.error('[images] Wikimedia Commons unavailable:', err.message);
      return res.status(200).json({ available: false, images: [], error: 'Travel photos are temporarily unavailable.' });
    }
  }

  if (req.method === 'POST') {
    const { src, alt, category, caption } = req.body || {};
    const token = getTokenFromReq(req);
    let user;
    try {
      user = token ? verifyToken(token) : null;
    } catch {
      user = null;
    }
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access is required.' });
    }
    if (!src || !alt || !/^https:\/\/\S+$/i.test(String(src))) {
      return res.status(400).json({ error: 'An HTTPS image URL and descriptive alt text are required.' });
    }

    try {
      const { db } = await connectToDatabase();
      const result = await db.collection(COLLECTIONS.gallery).insertOne({
        id: Date.now(),
        src,
        alt,
        category: category || 'Scenery',
        caption: caption || '',
        sourceType: 'curated',
        status: 'APPROVED',
        approvedAt: new Date(),
        sortOrder: 0,
        createdAt: new Date(),
      });

      return res.status(201).json({ ok: true, id: result.insertedId.toString() });
    } catch (err) {
      console.error('[images]', err);
      return res.status(500).json({ error: 'Could not save image.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
