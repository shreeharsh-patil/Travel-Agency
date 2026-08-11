import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import slugify from 'slugify';
import osmPbf from 'osm-pbf-parser';
import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { Place } from '../models/Place.js';

/**
 * Import named OSM places from a regional extract (.osm.pbf) or a GeoJSON
 * FeatureCollection of points. Self-contained Node importer (no osm2pgsql).
 *
 * Usage:
 *   npm run import:osm -- path/to/india.osm.pbf
 *   npm run import:osm -- path/to/places.geojson
 *
 * Only nodes (points) are imported from PBF in this version; way/relation
 * geometry is a future step. Re-running upserts by (osmType, osmId).
 */

// Tag mapping: [key, { value -> category, _all -> fallback }]
const POI_TAGS = [
    ['place', { city: 'city', town: 'town', village: 'village', hamlet: 'village', suburb: 'neighbourhood', neighbourhood: 'neighbourhood', island: 'island', square: 'square' }],
    ['tourism', { hotel: 'hotel', hostel: 'hotel', resort: 'hotel', motel: 'hotel', guest_house: 'hotel', apartment: 'hotel', attraction: 'attraction', museum: 'museum', gallery: 'museum', viewpoint: 'viewpoint', theme_park: 'attraction', zoo: 'attraction', aquarium: 'attraction', campsite: 'activity', picnic_site: 'activity' }],
    ['amenity', { restaurant: 'restaurant', cafe: 'cafe', bar: 'restaurant', fast_food: 'restaurant', pub: 'restaurant', ice_cream: 'cafe', hospital: 'hospital', pharmacy: 'pharmacy', bank: 'bank', atm: 'bank', school: 'activity', university: 'activity', library: 'activity', cinema: 'activity', theatre: 'activity', marketplace: 'shopping', fuel: 'activity', parking: 'activity', place_of_worship: 'temple', swimming_pool: 'activity', public_bath: 'activity', spa: 'wellness', gym: 'wellness' }],
    ['shop', { _all: 'shopping' }],
    ['leisure', { park: 'park', garden: 'park', beach_resort: 'beach', marina: 'activity', sports_centre: 'activity', stadium: 'activity', golf_course: 'activity', water_park: 'activity' }],
    ['natural', { beach: 'beach', peak: 'peak', bay: 'beach', waterfall: 'waterfall', hot_spring: 'hot_spring', spring: 'hot_spring', cave_entrance: 'attraction', sand: 'beach' }],
    ['historic', { castle: 'castle', monument: 'monument', memorial: 'monument', ruin: 'monument', archaeological_site: 'monument', fort: 'castle', tower: 'monument' }],
    ['aeroway', { aerodrome: 'airport', terminal: 'airport' }],
    ['railway', { station: 'station' }],
    ['waterway', { waterfall: 'waterfall' }]
];

const IMPORTANCE = {
    city: 0.95, town: 0.85, village: 0.7, neighbourhood: 0.55, island: 0.6, square: 0.4,
    airport: 0.7, station: 0.55, castle: 0.7, monument: 0.6, waterfall: 0.65,
    beach: 0.6, peak: 0.6, hot_spring: 0.6, museum: 0.55, attraction: 0.5,
    hotel: 0.4, temple: 0.55, park: 0.45, restaurant: 0.35, cafe: 0.3, shopping: 0.3
};

function categoryFor(tags) {
    const matched = new Set();
    let primary = null;
    for (const [key, vals] of POI_TAGS) {
        const v = tags[key];
        if (v) {
            if (vals[v]) {
                if (!primary) primary = vals[v];
                matched.add(vals[v]);
            } else if (vals._all) {
                if (!primary) primary = vals._all;
                matched.add(vals._all);
            }
        }
    }
    if (tags.amenity === 'place_of_worship') {
        primary =
            tags.religion === 'muslim' ? 'mosque' :
            tags.religion === 'christian' ? 'church' : 'temple';
        matched.add(primary);
    }
    return primary ? { primary, categories: [...matched] } : null;
}

function toDoc({ osmType, osmId, tags, lat, lon }) {
    const name = tags.name || tags['name:en'];
    if (!name) return null;
    const cat = categoryFor(tags);
    if (!cat) return null;

    const addr = [tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'], tags['addr:district'], tags['addr:postcode']]
        .filter(Boolean).join(', ') || null;

    return {
        osmType,
        osmId,
        source: 'osm',
        name,
        slug: `${slugify(name, { lower: true, strict: true })}-${osmType}-${osmId}`,
        category: cat.primary,
        categories: cat.categories,
        country: tags['addr:country'] || tags['is_in:country'] || (tags['addr:country_code'] || '').toUpperCase() || null,
        state: tags['addr:state'] || tags['is_in:state'] || null,
        city: tags['addr:city'] || tags['is_in:city'] || null,
        address: addr,
        lat,
        lon,
        location: { type: 'Point', coordinates: [lon, lat] },
        website: tags.website || tags['contact:website'] || tags.url || null,
        phone: tags.phone || tags['contact:phone'] || null,
        openingHours: tags.opening_hours || null,
        wikipedia: tags.wikipedia || null,
        wikidata: tags.wikidata || null,
        importance: IMPORTANCE[cat.primary] || 0.2
    };
}

async function importPbf(file) {
    const input = createReadStream(file);
    const parser = osmPbf();
    input.pipe(parser);

    let batch = [];
    let inserted = 0;
    let updated = 0;
    let queue = Promise.resolve();

    const flushBatch = async (items) => {
        if (!items.length) return;
        const ops = items.map((doc) => ({
            updateOne: {
                filter: { osmType: doc.osmType, osmId: doc.osmId },
                update: {
                    $set: { ...doc, updatedAt: new Date() },
                    $setOnInsert: { createdAt: new Date() }
                },
                upsert: true
            }
        }));
        const res = await Place.bulkWrite(ops, { ordered: false });
        inserted += res.upsertedCount || 0;
        updated += res.modifiedCount || 0;
    };

    const enqueue = () => {
        const items = batch;
        batch = [];
        queue = queue.then(() => flushBatch(items));
    };

    parser.on('data', (items) => {
        for (const item of items) {
            if (item.type !== 'node' || typeof item.lat !== 'number') continue;
            const doc = toDoc({ osmType: 'node', osmId: item.id, tags: item.tags || {}, lat: item.lat, lon: item.lon });
            if (doc) {
                batch.push(doc);
                if (batch.length >= 500) enqueue();
            }
        }
    });

    await new Promise((resolve, reject) => {
        parser.on('end', resolve);
        parser.on('error', reject);
        input.on('error', reject);
    });
    await queue;
    await flushBatch(batch);
    return { inserted, updated };
}

async function importGeoJson(file) {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const features = data.type === 'FeatureCollection' ? data.features : data.features || [];
    const docs = [];
    for (const f of features) {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) continue;
        const [lon, lat] = coords;
        const doc = toDoc({ osmType: props.osm_type || 'node', osmId: props.osm_id ?? props.id ?? 0, tags: props, lat, lon });
        if (doc) docs.push(doc);
    }
    const ops = docs.map((doc) => ({
        updateOne: {
            filter: { osmType: doc.osmType, osmId: doc.osmId },
            update: { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
            upsert: true
        }
    }));
    const res = await Place.bulkWrite(ops, { ordered: false });
    return { inserted: res.upsertedCount || 0, updated: res.modifiedCount || 0 };
}

async function main() {
    const file = process.argv[2];
    if (!file || !existsSync(file)) {
        console.error('Usage: npm run import:osm -- <extract.osm.pbf|places.geojson>');
        process.exit(1);
    }
    await connectDb();
    console.log(`Importing ${file}…`);
    const stats = extname(file).toLowerCase() === '.pbf' ? await importPbf(file) : await importGeoJson(file);
    console.log(`Done. inserted=${stats.inserted} updated=${stats.updated}`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Import failed:', err.message);
    process.exit(1);
});
