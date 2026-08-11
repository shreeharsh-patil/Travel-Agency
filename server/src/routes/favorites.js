import { Router } from 'express';
import { Favorite } from '../models/Favorite.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlaceBySlug } from '../services/search.js';

const router = Router();

/** GET /api/favorites — current user's saved places */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const rows = await Favorite.find({ user: req.user.id })
            .populate('place', 'name slug category country city lat lon')
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            favorites: rows.map((f) => f.place).filter(Boolean)
        });
    } catch (err) { next(err); }
});

/** POST /api/favorites/:slug  (auth) */
router.post('/:slug', requireAuth, async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        await Favorite.findOneAndUpdate(
            { user: req.user.id, place: place._id },
            { $setOnInsert: { user: req.user.id, place: place._id } },
            { upsert: true }
        );
        res.status(201).json({ favorited: true });
    } catch (err) { next(err); }
});

/** DELETE /api/favorites/:slug  (auth) */
router.delete('/:slug', requireAuth, async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        await Favorite.deleteOne({ user: req.user.id, place: place._id });
        res.json({ favorited: false });
    } catch (err) { next(err); }
});

export default router;
