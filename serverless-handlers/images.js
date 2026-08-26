import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';
import { getWikimediaTravelGallery } from '../lib/travel/galleryProvider.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let images = [];
    try {
      const { db } = await connectToDatabase();
      const cursor = await db.collection(COLLECTIONS.gallery).find({});
      images =
        typeof cursor.sort === 'function'
          ? await cursor.sort({ createdAt: -1, sortOrder: 1, _id: -1 }).toArray()
          : await cursor.toArray();
    } catch (err) {
      console.warn('[images] Gallery database unavailable:', err.message);
    }

    if (images.length > 0) return res.status(200).json({ available: true, source: 'Horizon Travels Curated Gallery', images });

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
    if (!src) {
      return res.status(400).json({ error: 'An image URL or Cloudinary photo is required.' });
    }

    try {
      const { db } = await connectToDatabase();
      const doc = {
        id: Date.now(),
        src,
        alt: alt || caption || 'Original Travel Moment',
        category: category || 'Scenery',
        caption: caption || alt || 'Original photography moment',
        sourceType: 'original_user',
        status: 'APPROVED',
        approvedAt: new Date(),
        sortOrder: 0,
        createdAt: new Date(),
      };
      const result = await db.collection(COLLECTIONS.gallery).insertOne(doc);

      return res.status(201).json({ ok: true, id: result.insertedId.toString(), image: doc });
    } catch (err) {
      console.error('[images POST]', err);
      return res.status(500).json({ error: 'Could not save gallery image.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (!id) return res.status(400).json({ error: 'Image ID is required.' });

    try {
      const { db } = await connectToDatabase();
      const { ObjectId } = await import('mongodb');
      let query = { $or: [{ id: id }, { id: Number(id) }] };
      try {
        query.$or.push({ _id: new ObjectId(id) });
      } catch {}

      await db.collection(COLLECTIONS.gallery).deleteOne(query);
      return res.status(200).json({ ok: true, message: 'Gallery image removed.' });
    } catch (err) {
      console.error('[images DELETE]', err);
      return res.status(500).json({ error: 'Could not delete gallery image.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
