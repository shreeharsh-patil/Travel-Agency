import { connectToDatabase, COLLECTIONS } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      // await works for both real Mongo cursors (sync) and the local JSON
      // fallback wrapper (async find).
      const cursor = await db.collection(COLLECTIONS.gallery).find({});
      // Both the real Mongo cursor and the local JSON fallback support .sort().
      const images =
        typeof cursor.sort === 'function'
          ? await cursor.sort({ sortOrder: 1, _id: 1 }).toArray()
          : await cursor.toArray();

      return res.status(200).json({ images });
    } catch (err) {
      console.error('[images]', err);
      return res.status(500).json({ error: 'Could not load images.' });
    }
  }

  if (req.method === 'POST') {
    const { src, alt, category, caption } = req.body || {};
    if (!src || !alt) {
      return res.status(400).json({ error: 'src and alt are required.' });
    }

    try {
      const { db } = await connectToDatabase();
      const result = await db.collection(COLLECTIONS.gallery).insertOne({
        id: Date.now(),
        src,
        alt,
        category: category || 'Scenery',
        caption: caption || '',
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
