import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { hashPassword, signToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
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
      password: hashed,
      createdAt: new Date(),
    });

    const token = signToken({ _id: result.insertedId, email: normalizedEmail });

    return res.status(201).json({
      token,
      user: { id: result.insertedId.toString(), email: normalizedEmail },
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
}
