import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { config } from '../config.js';

export function signToken(user) {
    return jwt.sign({ sub: String(user._id || user.id), role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
}

export function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

export function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export async function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
        const payload = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(payload.sub).lean();
        if (!user) return res.status(401).json({ error: 'Invalid session' });
        req.user = { id: user._id, email: user.email, name: user.name, role: user.role };
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    return next();
}
