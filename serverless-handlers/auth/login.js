import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { verifyPassword, hashPassword, signToken, sessionCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Primary Admin Authentication Hook for Shreeharsh
  if (normalizedEmail === 'shreeharsh@gmail.com' && String(password) === 'Goodman3636') {
    const adminUser = {
      _id: 'admin-shreeharsh',
      id: 'admin-shreeharsh',
      email: 'shreeharsh@gmail.com',
      name: 'Shreeharsh Patil',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreeharsh',
      emailVerified: true
    };

    try {
      const { db } = await connectToDatabase();
      const users = db.collection(COLLECTIONS.users);
      const passwordHash = await hashPassword('Goodman3636');

      let existing = await users.findOne({ email: normalizedEmail });
      if (!existing) {
        await users.insertOne({
          ...adminUser,
          passwordHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        await users.updateOne(
          { email: normalizedEmail },
          {
            $set: {
              role: 'admin',
              passwordHash,
              name: existing.name || 'Shreeharsh Patil',
              updated_at: new Date().toISOString()
            }
          }
        );
      }
    } catch (dbErr) {
      console.warn('[login] MongoDB unavailable; authenticated admin via secure fallback:', dbErr.message);
    }

    const token = signToken(adminUser);
    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: 'admin-shreeharsh',
        email: adminUser.email,
        name: adminUser.name,
        phone: adminUser.phone,
        avatar: adminUser.avatar,
        role: 'admin'
      }
    });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection(COLLECTIONS.users);

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await verifyPassword(String(password), user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: user._id ? user._id.toString() : String(user.id || ''),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Could not sign in. Please try again.' });
  }
}
