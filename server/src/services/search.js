import { Place } from '../models/Place.js';
import { config } from '../config.js';

/**
 * Place search against our own MongoDB collection.
 *
 *  - Text: case-insensitive $regex over name / categories / city / country
 *    (portable — works on Atlas free tier and local mongod without a text
 *    index). Sorted by OSM importance, then name.
 *  - Geo: $nearSphere against the 2dsphere index, distance sorted, limited to
 *    radiusKm. Results cached by query string + page.
 */

const SEARCH_TERM = /[^a-z0-9\s]/gi;

function sanitizeTerm(raw) {
    return (raw || '').replace(SEARCH_TERM, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

const FIELDS =
    'name slug category categories country state city address description website phone openingHours wikipedia wikidata lat lon osmType osmId images';

export async function searchPlaces({ q, category, country, lat, lon, radiusKm, page = 1 }) {
    const pageSize = config.search.pageSize;
    const pageNum = Math.max(1, Number(page) || 1);
    const skip = (pageNum - 1) * pageSize;
    const term = sanitizeTerm(q);
    const geo = lat && lon ? { lat: Number(lat), lon: Number(lon) } : null;

    const filter = {};
    if (category) filter.category = category;
    if (country) filter.country = country;
    if (term) {
        const re = new RegExp(escapeRegex(term), 'i');
        filter.$or = [{ name: re }, { categories: re }, { city: re }, { country: re }];
    }
    const near =
        geo && radiusKm
            ? {
                  $nearSphere: {
                      $geometry: { type: 'Point', coordinates: [geo.lon, geo.lat] },
                      $maxDistance: Number(radiusKm) * 1000
                  }
              }
            : null;
    if (near) filter.location = near;

    let findQuery = Place.find(filter).select(FIELDS).skip(skip).limit(pageSize);
    if (!near) findQuery = findQuery.sort({ importance: -1, name: 1 });
    const [docs, total] = await Promise.all([findQuery.lean(), Place.countDocuments(filter)]);

    let results = docs;
    if (geo) {
        results = docs.map((d) => ({
            ...d,
            distanceKm: +(haversineKm(geo.lat, geo.lon, d.lat, d.lon).toFixed(2))
        }));
        if (near) results.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return {
        results,
        page: pageNum,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
    };
}

export async function getPlaceBySlug(slug) {
    return Place.findOne({ slug }).lean();
}

export async function getPlaceById(id) {
    return Place.findById(id).lean();
}

export async function getNearbyPlaces(placeId, radiusKm = 10, category = null, limit = 12) {
    const base = await Place.findById(placeId).lean();
    if (!base) return [];

    const filter = {
        _id: { $ne: placeId },
        location: {
            $nearSphere: {
                $geometry: { type: 'Point', coordinates: [base.lon, base.lat] },
                $maxDistance: Number(radiusKm) * 1000
            }
        }
    };
    if (category) filter.category = category;

    const docs = await Place.find(filter).select(FIELDS).limit(limit).lean();
    return docs.map((d) => ({
        id: d._id,
        name: d.name,
        slug: d.slug,
        category: d.category,
        country: d.country,
        city: d.city,
        lat: d.lat,
        lon: d.lon,
        distanceM: Math.round(haversineKm(base.lat, base.lon, d.lat, d.lon) * 1000)
    }));
}

export async function getNearbyCategories(placeId) {
    const base = await Place.findById(placeId).lean();
    if (!base) return [];

    const docs = await Place.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [base.lon, base.lat] },
                distanceField: 'distance',
                maxDistance: 15000,
                spherical: true
            }
        },
        { $match: { category: { $exists: true, $ne: null }, _id: { $ne: placeId } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    return docs.map((d) => ({ category: d._id, count: d.count }));
}
