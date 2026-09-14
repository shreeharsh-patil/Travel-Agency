import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SESSION_TTL = process.env.JWT_EXPIRES_IN || '7d';
const MIN_SECRET_LENGTH = 48;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be configured with at least ${MIN_SECRET_LENGTH} characters.`);
  }
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  const userId = user._id ? user._id.toString() : user.id ? String(user.id) : null;
  if (!userId) throw new Error('Cannot create a session without a user id.');

  return jwt.sign(
    {
      sub: userId,
      email: user.email,
      role: user.role || 'user',
      name: user.name || ''
    },
    getJwtSecret(),
    { expiresIn: SESSION_TTL }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function getTokenFromReq(req) {
  const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();

  const cookie = (req.headers && req.headers.cookie) || '';
  const match = cookie.match(/(?:^|;\s*)horizon_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookie(token, { persistent = true } = {}) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = persistent ? '; Max-Age=604800' : '';
  return `horizon_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${maxAge}${secure}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `horizon_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
