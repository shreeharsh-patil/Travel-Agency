import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { Place } from '../models/Place.js';
import { Package } from '../models/Package.js';

/**
 * Optional seed for OUR OWN travel packages.
 *
 * IMPORTANT: these are example products — review and replace prices/details with
 * your real Horizon Travels offerings before going live. No prices are ever
 * auto-generated from external places; they are entered here by the operator.
 *
 * Each package links to places by slug (must already exist in `places`,
 * e.g. after an OSM import). Run: npm run seed:packages
 */

const packages = [
    {
        slug: 'goa-beach-escape',
        title: 'Goa Beach Escape',
        description: 'A 6-night private-villa retreat on the Goan coast with sunset sailing and curated dining.',
        days: 7,
        nights: 6,
        priceInr: 12999,
        style: 'Beach',
        difficulty: 'Easy',
        accommodation: 'Private beachfront villa',
        activities: ['Sunset catamaran', 'Spice farm tour', 'Private chef dinner'],
        highlights: ['Private villa', 'Boat charter', 'Wellness spa'],
        image: '/images/tropical_beach.png',
        availability: 'Year-round',
        placeSlugs: ['goa']
    },
    {
        slug: 'goa-adventure',
        title: 'Goa Adventure',
        description: 'Water sports, waterfall treks and heritage forts for the active traveller.',
        days: 5,
        nights: 4,
        priceInr: 24999,
        style: 'Adventure',
        difficulty: 'Moderate',
        accommodation: 'Boutique eco-lodge',
        activities: ['Kayaking', 'Dudhsagar trek', 'Dolphin cruise'],
        highlights: ['Waterfalls', 'Fort trails', 'Local cuisine'],
        image: '/images/beach_dinner.png',
        availability: 'Nov – Mar',
        placeSlugs: ['goa']
    },
    {
        slug: 'goa-heritage-tour',
        title: 'Goa Heritage Tour',
        description: 'Churches, Latin quarters and spice estates — a cultural deep-dive with a local historian.',
        days: 4,
        nights: 3,
        priceInr: 125000,
        style: 'Cultural',
        difficulty: 'Easy',
        accommodation: 'Heritage guesthouse',
        activities: ['Old Goa churches', 'Fontainhas walk', 'Museum visits'],
        highlights: ['UNESCO churches', 'Local guides', 'Workshops'],
        image: '/images/bali_culture.png',
        availability: 'Oct – Apr',
        placeSlugs: ['goa']
    }
];

async function main() {
    await connectDb();
    for (const p of packages) {
        // Resolve linked places to embedded {slug, name, category, sort}
        const embeds = [];
        for (let i = 0; i < p.placeSlugs.length; i++) {
            const place = await Place.findOne({ slug: p.placeSlugs[i] }).select('slug name category').lean();
            if (place) embeds.push({ slug: place.slug, name: place.name, category: place.category, sort: i });
        }

        const pkg = await Package.findOneAndUpdate(
            { slug: p.slug },
            {
                $set: {
                    title: p.title,
                    description: p.description,
                    days: p.days,
                    nights: p.nights,
                    priceInr: p.priceInr,
                    style: p.style,
                    difficulty: p.difficulty,
                    accommodation: p.accommodation,
                    activities: p.activities,
                    highlights: p.highlights,
                    image: p.image,
                    availability: p.availability,
                    places: embeds,
                    active: true
                }
            },
            { upsert: true, new: true }
        );
        console.log(`✔ ${pkg.slug} (${embeds.length} linked place${embeds.length === 1 ? '' : 's'})`);
    }
    console.log('\nPackages seeded. Review prices before production.');
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
