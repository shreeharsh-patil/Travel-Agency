import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { verifyToken, getTokenFromReq } from '../../lib/auth.js';

function userIdFilter(subject) {
  const id = String(subject || '').trim();
  if (!id) return null;
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    const payload = verifyToken(token);
    const filter = userIdFilter(payload.sub);
    if (!filter) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection(COLLECTIONS.users).findOne(filter, {
      projection: { password: 0, passwordHash: 0, passwordResetTokenHash: 0 }
    });

    if (!user || user.disabledAt) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        preferences: user.preferences || {},
        emailVerified: Boolean(user.emailVerified),
        homeCountry: user.homeCountry || '',
        preferredCurrency: user.preferredCurrency || '',
        preferredLanguage: user.preferredLanguage || '',
        interests: user.interests || [],
        travelStyle: user.travelStyle || '',
        typicalBudget: user.typicalBudget ?? null,
        dietaryPreferences: user.dietaryPreferences || '',
        accessibilityPreferences: user.accessibilityPreferences || '',
        role: user.role || 'user',
        createdAt: user.createdAt || user.created_at
      }
    });
  } catch (err) {
    if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      return res.status(200).json({ authenticated: false, user: null });
    }

    console.error('[me]', err);
    return res.status(503).json({ error: 'Could not load your account.' });
  }
}
