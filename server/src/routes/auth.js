import { Router } from 'express';
import { User } from '../models/User.js';
import { signToken, hashPassword, comparePassword, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({ error: 'Name, a valid email, and a password of at least 8 characters are required.' });
        }
        const emailNorm = String(email).toLowerCase();
        const existing = await User.findOne({ email: emailNorm }).lean();
        if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

        const hash = await hashPassword(password);
        const user = await User.create({ email: emailNorm, passwordHash: hash, name: String(name).trim() });
        res.status(201).json({
            token: signToken(user),
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const user = await User.findOne({ email: String(email || '').toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        const ok = await comparePassword(String(password || ''), user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

        res.json({
            token: signToken(user),
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

export default router;
