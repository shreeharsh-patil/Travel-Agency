import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from './db.js';
import { getTokenFromReq, verifyToken } from './auth.js';

function userIdFilter(subject) {
  const id = String(subject || '').trim();
  if (!id) return null;
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

export async function authenticateRequest(req, res, { admin = false } = {}) {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }

  try {
    const payload = verifyToken(token);
    const filter = userIdFilter(payload.sub);
    if (!filter) {
      res.status(401).json({ error: 'Session is invalid.' });
      return null;
    }

    const { db } = await connectToDatabase();
    const user = await db.collection(COLLECTIONS.users).findOne(filter, {
      projection: { password: 0, passwordHash: 0, passwordResetTokenHash: 0 }
    });

    if (!user || user.disabledAt) {
      res.status(401).json({ error: 'Session is invalid.' });
      return null;
    }

    if (admin && user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return null;
    }

    return { id: String(user._id), user };
  } catch (err) {
    if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Invalid or expired session.' });
      return null;
    }

    console.error('[auth] Request authentication failed:', err?.message || err);
    res.status(503).json({ error: 'Authentication service is temporarily unavailable.' });
    return null;
  }
}
