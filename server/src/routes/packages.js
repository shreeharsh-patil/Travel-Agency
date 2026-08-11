import { Router } from 'express';
import { Package } from '../models/Package.js';

const router = Router();

/** GET /api/packages — our own travel packages. Optional ?place=slug filter. */
router.get('/', async (req, res, next) => {
    try {
        const filter = { active: true };
        if (req.query.place) filter['places.slug'] = req.query.place;

        const packages = await Package.find(filter)
            .select('slug title description days nights priceInr style difficulty accommodation activities highlights image availability')
            .sort({ priceInr: 1 })
            .lean();
        res.json({ packages });
    } catch (err) { next(err); }
});

/** GET /api/packages/:slug */
router.get('/:slug', async (req, res, next) => {
    try {
        const pkg = await Package.findOne({ slug: req.params.slug, active: true }).lean();
        if (!pkg) return res.status(404).json({ error: 'Package not found' });
        res.json(pkg);
    } catch (err) { next(err); }
});

export default router;
