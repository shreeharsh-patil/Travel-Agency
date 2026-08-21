import crypto from 'crypto';
import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { sendTransactionalEmail } from '../../lib/email.js';

const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const response = { message: 'If an account exists, password reset instructions have been sent.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(200).json(response);
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection(COLLECTIONS.users).findOne({ email });
    if (!user) return res.status(200).json(response);
    const rawToken = crypto.randomBytes(32).toString('hex');
    await db.collection(COLLECTIONS.users).updateOne({ _id: user._id }, { $set: {
      passwordResetTokenHash: tokenHash(rawToken), passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    } });
    const url = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    await sendTransactionalEmail({ to: email, subject: 'Reset your Horizon Travels password', text: `Use this one-time link within one hour: ${url}` });
  } catch (err) {
    console.error('[auth] password reset request failed:', err.message);
  }
  return res.status(200).json(response);
}
