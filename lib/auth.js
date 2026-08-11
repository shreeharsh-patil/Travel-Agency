import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SESSION_TTL = '30d';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not configured. Set it in your Vercel/Netlify environment settings.'
    );
  }
  return 'horizon-travels-dev-secret';
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, getJwtSecret(), {
    expiresIn: SESSION_TTL,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function getTokenFromReq(req) {
  const header = (req.headers && req.headers.authorization) || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}
