import { Router } from 'express';
import { GalleryImage } from '../models/GalleryImage.js';

const router = Router();

/** GET /api/images — list gallery images */
router.get('/', async (req, res, next) => {
    try {
        const images = await GalleryImage.find().sort({ sort: 1, createdAt: 1 }).lean();
        res.json({
            images: images.map((i) => ({
                id: i._id,
                src: i.src,
                alt: i.alt,
                category: i.category,
                caption: i.caption
            }))
        });
    } catch (err) { next(err); }
});

/** POST /api/images { src, alt, category, caption } — add image metadata */
router.post('/', async (req, res, next) => {
    try {
        const { src, alt, category, caption } = req.body || {};
        if (!src || !alt) return res.status(400).json({ error: 'src and alt are required.' });
        const doc = await GalleryImage.create({
            src: String(src),
            alt: String(alt),
            category: category || null,
            caption: caption || ''
        });
        res.status(201).json({ ok: true, id: doc._id });
    } catch (err) { next(err); }
});

export default router;
