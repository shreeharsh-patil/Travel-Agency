import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { verifyPassword, signToken, sessionCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, remember = true } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection(COLLECTIONS.users);
    const user = await users.findOne({ email: normalizedEmail });

    if (!user || user.disabledAt) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await verifyPassword(String(password), user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.setHeader('Set-Cookie', sessionCookie(token, { persistent: Boolean(remember) }));

    return res.status(200).json({
      ok: true,
      user: {
        id: user._id ? user._id.toString() : String(user.id || ''),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Could not sign in. Please try again.' });
  }
}
