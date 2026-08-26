import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { hashPassword, signToken, sessionCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(String(email)) || String(email).length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Use a password of at least 12 characters with letters and numbers.' });
  }
  if (!process.env.MONGODB_URI) {
    return res.status(503).json({ error: 'Database connection is not configured. Please set MONGODB_URI in Vercel Environment Variables.' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ error: 'Authentication secret is not configured. Please set JWT_SECRET in Vercel Environment Variables.' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection(COLLECTIONS.users);
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashed = await hashPassword(password);
    const result = await users.insertOne({
      email: normalizedEmail,
      passwordHash: hashed,
      name: String(name || '').trim().slice(0, 80),
      phone: '',
      avatar: '',
      preferences: {},
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
    });


    const token = signToken({ _id: result.insertedId, email: normalizedEmail });

    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        email: normalizedEmail,
        name: String(name || '').trim().slice(0, 80),
        role: 'user',
      },
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(503).json({ error: 'Account creation is temporarily unavailable. Please try again shortly.' });
  }
}
