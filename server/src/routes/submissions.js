import { Router } from 'express';
import slugify from 'slugify';
import { Submission } from '../models/Submission.js';
import { Place } from '../models/Place.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { cacheDeletePrefix } from '../services/cache.js';

const router = Router();

/**
 * User-submitted places.
 * Workflow: PENDING -> ADMIN REVIEW -> APPROVED | REJECTED
 * On approval the place is inserted into `places` (source='user') and becomes searchable.
 */

/** POST /api/submissions  (auth)  — suggest a place */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { name, description, category, lat, lon, images } = req.body || {};
        if (!name || !name.trim()) return res.status(400).json({ error: 'Place name is required.' });
        if (!lat || !lon || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
            return res.status(400).json({ error: 'Valid coordinates are required.' });
        }
        const latN = Number(lat);
        const lonN = Number(lon);
        const sub = await Submission.create({
            name: String(name).trim(),
            description: description || '',
            category: category || null,
            lat: latN,
            lon: lonN,
            location: { type: 'Point', coordinates: [lonN, latN] },
            images: images || [],
            submittedBy: req.user.id
        });
        res.status(201).json({ id: sub._id, status: sub.status, message: 'Submitted for review.' });
    } catch (err) { next(err); }
});

/** GET /api/submissions/mine  (auth) */
router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        const rows = await Submission.find({ submittedBy: req.user.id })
            .select('name category status createdAt')
            .sort({ createdAt: -1 })
            .lean();
        res.json(rows);
    } catch (err) { next(err); }
});

/** GET /api/submissions?status=pending  (admin) */
router.get('/', requireAdmin, async (req, res, next) => {
    try {
        const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
        const rows = await Submission.find({ status })
            .populate('submittedBy', 'email')
            .sort({ createdAt: 1 })
            .lean();
        res.json(rows.map((s) => ({
            id: s._id,
            name: s.name,
            description: s.description,
            category: s.category,
            lat: s.lat,
            lon: s.lon,
            images: s.images,
            status: s.status,
            createdAt: s.createdAt,
            submittedByEmail: s.submittedBy?.email || null
        })));
    } catch (err) { next(err); }
});

/** POST /api/submissions/:id/approve  (admin) */
router.post('/:id/approve', requireAdmin, async (req, res, next) => {
    try {
        const sub = await Submission.findById(req.params.id);
        if (!sub) return res.status(404).json({ error: 'Submission not found' });
        if (sub.status === 'approved') return res.status(400).json({ error: 'Already approved' });

        const slug = `${slugify(sub.name, { lower: true, strict: true })}-${sub.id}`;
        const existing = await Place.findOne({ slug });
        if (existing) return res.status(409).json({ error: 'A place with this slug already exists' });

        const place = await Place.create({
            source: 'user',
            name: sub.name,
            slug,
            category: sub.category,
            lat: sub.lat,
            lon: sub.lon,
            location: { type: 'Point', coordinates: [sub.lon, sub.lat] },
            categories: sub.category ? [sub.category] : [],
            description: sub.description || null,
            images: (sub.images || []).slice(0, 6).map((url) => ({
                url,
                source: 'user-submitted',
                credit: 'User submitted'
            }))
        });

        sub.status = 'approved';
        await sub.save();
        await cacheDeletePrefix('places:search:');
        res.json({ message: 'Place approved and published.', placeId: place._id });
    } catch (err) { next(err); }
});

/** POST /api/submissions/:id/reject  (admin) */
router.post('/:id/reject', requireAdmin, async (req, res, next) => {
    try {
        const sub = await Submission.findById(req.params.id);
        if (!sub) return res.status(404).json({ error: 'Submission not found' });
        sub.status = 'rejected';
        sub.reviewNote = req.body?.note || '';
        await sub.save();
        res.json({ message: 'Submission rejected.' });
    } catch (err) { next(err); }
});

export default router;
