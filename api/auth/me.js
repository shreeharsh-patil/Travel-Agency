import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { verifyToken, getTokenFromReq } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const payload = verifyToken(token);

    const { db } = await connectToDatabase();
    // Match either a real Mongo ObjectId or the string _id used by the
    // local JSON fallback database.
    let idFilter = { _id: payload.sub };
    if (typeof payload.sub === 'string' && /^[a-fA-F0-9]{24}$/.test(payload.sub)) {
      idFilter = { _id: { $in: [new ObjectId(payload.sub), payload.sub] } };
    }
    const user = await db
      .collection(COLLECTIONS.users)
      .findOne(idFilter, { projection: { password: 0 } });

    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists.' });
    }

    return res.status(200).json({
      user: { id: user._id.toString(), email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    console.error('[me]', err);
    return res.status(500).json({ error: 'Could not load your account.' });
  }
}
