import { Router } from 'express';
import { Place } from '../models/Place.js';
import { Review } from '../models/Review.js';
import { Package } from '../models/Package.js';
import { searchPlaces, getPlaceBySlug, getNearbyPlaces, getNearbyCategories } from '../services/search.js';
import { cacheGet, cacheSet } from '../services/cache.js';
import { enrichPlace } from '../services/enrich.js';
import { config } from '../config.js';

const router = Router();

/**
 * GET /api/places/search?q=&category=&country=&lat=&lon=&radiusKm=&page=
 * Search is served from our own MongoDB collection — never a public service.
 */
router.get('/search', async (req, res, next) => {
    try {
        const { q, category, country, lat, lon, radiusKm, page } = req.query;
        const cacheKey = `places:search:${JSON.stringify({ q, category, country, lat, lon, radiusKm, page })}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const data = await searchPlaces({ q, category, country, lat, lon, radiusKm, page });
        await cacheSet(cacheKey, data);
        res.json(data);
    } catch (err) { next(err); }
});

/** GET /api/places/categories — distinct categories with counts. */
router.get('/categories', async (_req, res, next) => {
    try {
        const rows = await Place.aggregate([
            { $match: { category: { $exists: true, $ne: null } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(rows.map((r) => ({ category: r._id, count: r.count })));
    } catch (err) { next(err); }
});

/** GET /api/places/countries */
router.get('/countries', async (_req, res, next) => {
    try {
        const rows = await Place.aggregate([
            { $match: { country: { $exists: true, $ne: null } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(rows.map((r) => ({ country: r._id, count: r.count })));
    } catch (err) { next(err); }
});

/** GET /api/places/:slug — full place detail with images, reviews summary, packages. */
router.get('/:slug', async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });

        const [reviews, packages] = await Promise.all([
            Review.find({ place: place._id }).populate('user', 'name').sort({ createdAt: -1 }).lean(),
            Package.find({ active: true, 'places.slug': place.slug })
                .select('slug title days nights priceInr image activities')
                .lean()
        ]);

        const reviewRows = reviews.map((r) => ({
            id: r._id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            images: r.images,
            createdAt: r.createdAt,
            user_name: r.user?.name || 'Guest'
        }));
        const reviewStats = reviewRows.length
            ? {
                  count: reviewRows.length,
                  average: +(reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewRows.length).toFixed(1)
              }
            : { count: 0, average: null };

        const nearby = await getNearbyPlaces(place._id, 15);
        const nearbyCategories = await getNearbyCategories(place._id);

        // Best-effort enrichment from open sources (Wikipedia/Wikimedia).
        // Only fills still-empty description / images — never invents data.
        let enriched = { description: null, images: [] };
        try {
            enriched = await enrichPlace(place);
        } catch (err) {
            console.error('[enrich]', err.message);
        }

        res.json({
            id: place._id,
            name: place.name,
            slug: place.slug,
            category: place.category,
            categories: place.categories,
            country: place.country,
            state: place.state,
            city: place.city,
            address: place.address,
            lat: place.lat,
            lon: place.lon,
            description: place.description || enriched.description,
            website: place.website,
            phone: place.phone,
            openingHours: place.openingHours,
            osmType: place.osmType,
            osmId: place.osmId,
            images: [...(place.images || []), ...enriched.images],
            reviews: reviewRows,
            reviewStats,
            packages,
            nearby: nearby.slice(0, 8),
            nearbyCategories,
            attribution: { osm: '© OpenStreetMap contributors', tile: config.tiles.attribution }
        });
    } catch (err) { next(err); }
});

/** GET /api/places/:slug/nearby?radiusKm=&category= */
router.get('/:slug/nearby', async (req, res, next) => {
    try {
        const place = await getPlaceBySlug(req.params.slug);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        const radiusKm = Math.min(50, Number(req.query.radiusKm) || 10);
        const nearby = await getNearbyPlaces(place._id, radiusKm, req.query.category, 24);
        res.json({ place: { name: place.name, slug: place.slug }, results: nearby, radiusKm });
    } catch (err) { next(err); }
});

export default router;
