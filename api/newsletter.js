import { connectToDatabase, COLLECTIONS } from '../lib/db.js';

/**
 * Newsletter API
 *  - POST /api/newsletter  (public) subscribe an email address
 *  - GET  /api/newsletter  (client-gated admin) list subscribers
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const subsColl = db.collection(COLLECTIONS.newsletter);

  // POST: subscribe
  if (req.method === 'POST') {
    const { email } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();

    if (!normalized || !EMAIL_RE.test(normalized)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
      const existing = await subsColl.findOne({ email: normalized });
      if (existing) {
        return res.status(200).json({
          message: 'You are already subscribed. Thank you!',
          already: true,
        });
      }

      await subsColl.insertOne({
        email: normalized,
        createdAt: new Date(),
        source: 'footer',
      });

      return res.status(201).json({
        message: 'Welcome aboard! You are now subscribed to Horizon Travels.',
      });
    } catch (err) {
      console.error('[POST /api/newsletter]', err);
      return res.status(500).json({ error: 'Could not subscribe. Please try again.' });
    }
  }

  // GET: list subscribers (used by the admin dashboard)
  if (req.method === 'GET') {
    try {
      const cursor = await subsColl.find({});
      const subscribers = await cursor.sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ count: subscribers.length, subscribers });
    } catch (err) {
      console.error('[GET /api/newsletter]', err);
      return res.status(500).json({ error: 'Could not load subscribers.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
