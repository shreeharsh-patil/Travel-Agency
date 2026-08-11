import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { verifyPassword, signToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection(COLLECTIONS.users);
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Could not sign in. Please try again.' });
  }
}
