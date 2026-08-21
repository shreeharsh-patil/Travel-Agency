import crypto from 'crypto';
import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { hashPassword } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || typeof password !== 'string' || password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Use a valid reset token and a password of at least 12 characters with letters and numbers.' });
  }
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const { db } = await connectToDatabase();
  const user = await db.collection(COLLECTIONS.users).findOne({ passwordResetTokenHash: hash, passwordResetExpiresAt: { $gt: new Date() } });
  if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  await db.collection(COLLECTIONS.users).updateOne({ _id: user._id }, { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() }, $unset: { passwordResetTokenHash: '', passwordResetExpiresAt: '' } });
  return res.status(200).json({ message: 'Password reset. Please sign in.' });
}
