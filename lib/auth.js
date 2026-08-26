import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SESSION_TTL = process.env.JWT_EXPIRES_IN || '7d';

export function getJwtSecret() {
  return process.env.JWT_SECRET || 'horizon-travels-production-jwt-secret-key-2026-auth';
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  const userId = user._id ? user._id.toString() : user.id ? String(user.id) : 'usr-temp';
  return jwt.sign(
    {
      sub: userId,
      email: user.email,
      role: user.role || 'user',
      name: user.name || ''
    },
    getJwtSecret(),
    {
      expiresIn: SESSION_TTL,
    }
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

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `horizon_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `horizon_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
