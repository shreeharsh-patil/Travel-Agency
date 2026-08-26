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
      return res.status(200).json({ authenticated: false, user: null });
    }

    const payload = verifyToken(token);

    // If verified token belongs to the primary admin
    if (payload.email === 'shreeharsh@gmail.com' || payload.role === 'admin') {
      try {
        const { db } = await connectToDatabase();
        let idFilter = { _id: payload.sub };
        if (typeof payload.sub === 'string' && /^[a-fA-F0-9]{24}$/.test(payload.sub)) {
          idFilter = { _id: { $in: [new ObjectId(payload.sub), payload.sub] } };
        }
        const dbUser = await db
          .collection(COLLECTIONS.users)
          .findOne({ $or: [idFilter, { email: 'shreeharsh@gmail.com' }] }, { projection: { password: 0, passwordHash: 0 } });

        if (dbUser) {
          return res.status(200).json({
            user: {
              id: dbUser._id.toString(),
              email: dbUser.email,
              name: dbUser.name || 'Shreeharsh Patil',
              phone: dbUser.phone || '',
              avatar: dbUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreeharsh',
              role: 'admin',
              emailVerified: true,
              createdAt: dbUser.createdAt || dbUser.created_at,
            }
          });
        }
      } catch {
        // Fallback for offline DB
      }

      return res.status(200).json({
        user: {
          id: String(payload.sub || 'admin-shreeharsh'),
          email: 'shreeharsh@gmail.com',
          name: payload.name || 'Shreeharsh Patil',
          phone: '+91 98765 43210',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreeharsh',
          role: 'admin',
          emailVerified: true
        }
      });
    }

    const { db } = await connectToDatabase();
    let idFilter = { _id: payload.sub };
    if (typeof payload.sub === 'string' && /^[a-fA-F0-9]{24}$/.test(payload.sub)) {
      idFilter = { _id: { $in: [new ObjectId(payload.sub), payload.sub] } };
    }
    const user = await db
      .collection(COLLECTIONS.users)
      .findOne(idFilter, { projection: { password: 0 } });

    if (!user) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    return res.status(200).json({
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
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(200).json({ authenticated: false, user: null });
    }
    console.error('[me]', err);
    return res.status(500).json({ error: 'Could not load your account.' });
  }
}
