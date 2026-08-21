import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from './db.js';
import { getTokenFromReq, verifyToken } from './auth.js';

export async function authenticateRequest(req, res, { admin = false } = {}) {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  try {
    const payload = verifyToken(token);
    const id = /^[a-f\d]{24}$/i.test(String(payload.sub)) ? new ObjectId(payload.sub) : payload.sub;
    const { db } = await connectToDatabase();
    const user = await db.collection(COLLECTIONS.users).findOne({ _id: id }, { projection: { passwordHash: 0, passwordResetTokenHash: 0 } });
    if (!user || user.disabledAt) {
      res.status(401).json({ error: 'Session is invalid.' });
      return null;
    }
    if (admin && user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return null;
    }
    return { id: String(user._id), user };
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
}
