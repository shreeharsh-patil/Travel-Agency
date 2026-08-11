import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

/**
 * PATCH /api/auth/me — update the signed-in user's profile
 * (name, phone, avatar, travel preferences). Requires a valid JWT.
 */
export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }

  const { name, phone, avatar, preferences } = req.body || {};
  const update = { updatedAt: new Date() };

  if (name !== undefined) update.name = String(name).trim().slice(0, 80);
  if (phone !== undefined) update.phone = String(phone).trim().slice(0, 30);
  if (avatar !== undefined) update.avatar = String(avatar).trim().slice(0, 500);
  if (preferences !== undefined && preferences && typeof preferences === 'object') {
    update.preferences = preferences;
  }

  const changed = Object.keys(update).filter((k) => k !== 'updatedAt');
  if (changed.length === 0) {
    return res.status(400).json({ error: 'Nothing to update.' });
  }

  try {
    const { db } = await connectToDatabase();
    // Match either a real Mongo ObjectId or the string _id used by the
    // local JSON fallback database.
    let idFilter = { _id: payload.sub };
    if (typeof payload.sub === 'string' && /^[a-fA-F0-9]{24}$/.test(payload.sub)) {
      idFilter = { _id: { $in: [new ObjectId(payload.sub), payload.sub] } };
    }

    const result = await db
      .collection(COLLECTIONS.users)
      .updateOne(idFilter, { $set: update });

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'Account no longer exists.' });
    }

    const user = await db
      .collection(COLLECTIONS.users)
      .findOne(idFilter, { projection: { password: 0 } });

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        preferences: user.preferences || {},
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[profile]', err);
    return res.status(500).json({ error: 'Could not update your profile.' });
  }
}
