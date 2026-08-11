import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { Package } from '../models/Package.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Bookings are created as "pending" — no payment is processed.
 * A human (concierge) confirms availability and contacts the traveller.
 */
router.post('/', async (req, res, next) => {
    try {
        const { packageId, name, email, phone, notes, dates, travelers, addons, totalInr } = req.body || {};
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
        if (!/\S+@\S+\.\S+/.test(String(email))) return res.status(400).json({ error: 'Please enter a valid email address.' });

        let pkg = null;
        if (packageId) {
            pkg = await Package.findOne({ _id: packageId, active: true }).lean();
            if (!pkg) return res.status(404).json({ error: 'Package not found' });
        }

        const reference = 'HT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        const total = Number(totalInr) || (pkg ? pkg.priceInr * (Number(travelers) || 1) : 0);

        const booking = await Booking.create({
            reference,
            user: req.user?.id || null,
            package: pkg ? pkg._id : null,
            name: String(name).trim(),
            email: String(email).toLowerCase(),
            phone: phone || '',
            notes: notes || '',
            dates: dates || null,
            travelers: Number(travelers) || 1,
            addons: Array.isArray(addons) ? addons : [],
            totalInr: total
        });
        res.status(201).json({
            booking: { reference: booking.reference, status: booking.status, createdAt: booking.createdAt }
        });
    } catch (err) { next(err); }
});

/** GET /api/bookings/mine  (auth) */
router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        const rows = await Booking.find({ user: req.user.id })
            .populate('package', 'title slug')
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            bookings: rows.map((b) => ({
                reference: b.reference,
                status: b.status,
                dates: b.dates,
                travelers: b.travelers,
                totalInr: b.totalInr,
                createdAt: b.createdAt,
                packageTitle: b.package?.title || null,
                packageSlug: b.package?.slug || null
            }))
        });
    } catch (err) { next(err); }
});

export default router;
