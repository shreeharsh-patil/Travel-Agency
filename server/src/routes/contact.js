import { Router } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';

const router = Router();

/** POST /api/contact { name, email, subject, message } */
router.post('/', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body || {};
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required.' });
        }
        const doc = await ContactMessage.create({
            name: String(name).trim(),
            email: String(email).toLowerCase(),
            subject: subject || '',
            message: String(message).trim()
        });
        res.status(201).json({ ok: true, id: doc._id, message: 'Message received. We will be in touch shortly.' });
    } catch (err) { next(err); }
});

export default router;
