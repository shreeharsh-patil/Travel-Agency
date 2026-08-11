import { Router } from 'express';
import { Review } from '../models/Review.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlaceBySlug } from '../services/search.js';
import { cacheDeletePrefix } from '../services/cache.js';

const router = Router();

/**
 * Reviews are OUR OWN data — never pushed to OpenStreetMap.
 * POST /api/places/:slug/reviews  (auth)  { rating, title, body, images[] }
 */
router.post('/:slug/reviews', requireAuth, async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });

        const { rating, title, body, images } = req.body || {};
        const r = Number(rating);
        if (!Number.isInteger(r) || r < 1 || r > 5) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
        }
        if (!body || !body.trim()) return res.status(400).json({ error: 'Please write a short review.' });

        const review = await Review.create({
            place: place._id,
            user: req.user.id,
            rating: r,
            title: title || '',
            body: String(body).trim(),
            images: images || []
        });
        await cacheDeletePrefix('places:search:');
        res.status(201).json({ id: review._id, message: 'Review submitted. Thank you.' });
    } catch (err) { next(err); }
});

/** GET /api/places/:slug/reviews */
router.get('/:slug/reviews', async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        const rows = await Review.find({ place: place._id })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json(rows.map((r) => ({
            id: r._id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            images: r.images,
            createdAt: r.createdAt,
            user_name: r.user?.name || 'Guest'
        })));
    } catch (err) { next(err); }
});

/** PUT /api/reviews/:id — edit own review */
router.put('/:reviewId', requireAuth, async (req, res, next) => {
    try {
        const { rating, title, body, images } = req.body || {};
        const r = Number(rating);
        if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

        const review = await Review.findOneAndUpdate(
            { _id: req.params.reviewId, user: req.user.id },
            { rating: r, title: title || '', body: body || '', images: images || [] },
            { new: true }
        ).lean();
        if (!review) return res.status(404).json({ error: 'Review not found or not yours.' });
        res.json({ message: 'Review updated.' });
    } catch (err) { next(err); }
});

/** DELETE /api/reviews/:id — delete own review */
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    try {
        const result = await Review.deleteOne({ _id: req.params.reviewId, user: req.user.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Review not found or not yours.' });
        res.json({ message: 'Review deleted.' });
    } catch (err) { next(err); }
});

export default router;
