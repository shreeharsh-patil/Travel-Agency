import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

/**
 * GET /api/geocode?q=Goa&limit=5
 * Address / free-text geocoding proxied to OUR OWN self-hosted Nominatim
 * instance. The public Nominatim service is never called.
 */
router.get('/', async (req, res, _next) => {

    try {
        const q = String(req.query.q || '').trim();
        if (!q) return res.status(400).json({ error: 'A query is required.' });

        const params = new URLSearchParams({
            q,
            format: 'json',
            addressdetails: '1',
            limit: String(Math.min(Number(req.query.limit) || 5, 10)),
            'accept-language': 'en'
        });
        if (config.nominatim.email) params.set('email', config.nominatim.email);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const r = await fetch(`${config.nominatim.url}${config.nominatim.searchPath}?${params}`, {
            headers: {
                'User-Agent': config.nominatim.referer,
                'Referer': config.nominatim.referer
            },
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!r.ok) {
            console.error('[geocode] upstream error', r.status, r.statusText);
            return res.status(502).json({ error: 'Geocoder unavailable.' });
        }

        const data = await r.json();
        const results = (Array.isArray(data) ? data : []).map((d) => ({
            displayName: d.display_name,
            lat: Number(d.lat),
            lon: Number(d.lon),
            osmId: d.osm_id,
            osmType: d.osm_type,
            type: d.type,
            class: d.class,
            address: d.address || null,
            boundingbox: d.boundingbox || null
        }));
        res.json({ results });
    } catch (err) {
        console.error('[geocode]', err.message);
        res.status(502).json({ error: 'Geocoder unavailable. Is your self-hosted Nominatim running?' });
    }
});

export default router;
