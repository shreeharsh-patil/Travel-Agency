import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { hashPassword, signToken, sessionCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name, remember = true } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedName = String(name || '').trim();

  if (!normalizedEmail || !password || !normalizedName) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (
    typeof password !== 'string' ||
    password.length < 12 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res.status(400).json({
      error: 'Use a password of at least 12 characters with letters and numbers.'
    });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection(COLLECTIONS.users);

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const safeName = normalizedName.slice(0, 80);
    const result = await users.insertOne({
      email: normalizedEmail,
      passwordHash,
      name: safeName,
      phone: '',
      avatar: '',
      preferences: {},
      role: 'user',
      emailVerified: false,
      createdAt: new Date()
    });

    const token = signToken({
      _id: result.insertedId,
      email: normalizedEmail,
      role: 'user',
      name: safeName
    });

    res.setHeader('Set-Cookie', sessionCookie(token, { persistent: Boolean(remember) }));
    return res.status(201).json({
      ok: true,
      user: {
        id: result.insertedId.toString(),
        email: normalizedEmail,
        name: safeName,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({
      error: 'Account creation is temporarily unavailable. Please try again shortly.'
    });
  }
}
