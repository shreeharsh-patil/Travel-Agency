/**
 * Luxury Villas & Private Estates Directory API.
 * Provides curated five-star private villas, beachfront compounds, and alpine chalets.
 */

const CURATED_VILLAS = [
  {
    id: 'villa-goa-01',
    slug: 'casa-marina-oceanfront-villa-goa',
    name: 'Casa Marina Oceanfront Estate',
    destination: 'goa',
    destinationName: 'Goa, India',
    location: 'North Anjuna Beach, Goa',
    bedrooms: 5,
    bathrooms: 6,
    maxGuests: 10,
    nightlyRateINR: 145000,
    rating: 4.96,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80'
    ],
    tagline: 'Private Arabian Sea oceanfront estate with dedicated butler & chef',
    description: 'Perched directly above the private sands of North Anjuna, Casa Marina is a 12,000 sq.ft Portuguese-modernist masterpiece featuring a 25-meter infinity pool, private cocktail deck, and dedicated culinary team.',
    amenities: ['Private Beach Access', 'Infinity Pool', 'Dedicated Butler', 'Executive Private Chef', 'Sunset Cocktail Deck', 'Chauffeur Van Included', 'High-Speed Starlink Wi-Fi'],
    serviceLevel: 'Ultra-Luxury Fully Staffed'
  },
  {
    id: 'villa-amalfi-01',
    slug: 'villa-clifftop-positano-amalfi',
    name: 'Villa Bellisima Positano',
    destination: 'amalfi',
    destinationName: 'Amalfi Coast, Italy',
    location: 'Positano Cliffside, Amalfi Coast, Italy',
    bedrooms: 6,
    bathrooms: 7,
    maxGuests: 12,
    nightlyRateINR: 620000,
    rating: 4.98,
    reviewCount: 36,
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80'
    ],
    tagline: 'Terraced Mediterranean cliffside palace with private funicular & sea jetty',
    description: 'Overlooking the turquoise Bay of Positano, Villa Bellisima offers panoramic sea views from every suite, cascading lemon grove terraces, private boat mooring, and Michelin-trained Italian private chefs.',
    amenities: ['Private Funicular Access', 'Cliffside Heated Pool', 'Private Riva Boat Berth', 'Sommelier Wine Cellar', 'Pizza Oven Terrace', 'Daily Yacht Charter Privileges'],
    serviceLevel: 'VIP Concierge & Full Estate Staff'
  },
  {
    id: 'villa-bali-01',
    slug: 'ubud-royal-rainforest-compound-bali',
    name: 'The Royal Ubud Rainforest Sanctuary',
    destination: 'bali',
    destinationName: 'Bali, Indonesia',
    location: 'Ayung River Gorge, Ubud, Bali',
    bedrooms: 4,
    bathrooms: 5,
    maxGuests: 8,
    nightlyRateINR: 195000,
    rating: 4.94,
    reviewCount: 58,
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80'
    ],
    tagline: 'Tiered cantilevered pool villa suspended over emerald jungle canopy',
    description: 'Immersed in sacred river valleys, this open-concept architectural sanctuary offers holistic Ayurvedic spa pavilions, sunrise yoga shalas, and organic farm-to-table dining prepared by Balinese master chefs.',
    amenities: ['Suspended Infinity Pools', 'Private Ayurvedic Spa', 'Yoga Shala', 'Organic Farm Kitchen', 'Private Butler 24/7', 'Helipad Access'],
    serviceLevel: 'Wellness Retreat Staffed Estate'
  },
  {
    id: 'villa-aspen-01',
    slug: 'the-monarch-alpine-chalet-aspen',
    name: 'The Monarch Ski-In Alpine Chalet',
    destination: 'aspen',
    destinationName: 'Aspen, USA',
    location: 'Red Mountain, Aspen, Colorado',
    bedrooms: 7,
    bathrooms: 8,
    maxGuests: 14,
    nightlyRateINR: 850000,
    rating: 4.97,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop&q=80'
    ],
    tagline: 'Direct ski-in/ski-out timber chalet with heated outdoor pool and fireside lounge',
    description: 'An alpine sanctuary on Aspen’s prestigious Red Mountain featuring hand-hewn cedar beams, stone fireplaces, private ski locker room with boot warmers, home theater, and heated outdoor mountain pool.',
    amenities: ['Direct Ski-in / Ski-out Access', 'Heated Outdoor Pool & Hot Tub', 'Private Ski Valet', 'Sub-Zero Wine Cellar', 'IMAX Screening Room', 'Private Chauffeur Escalade'],
    serviceLevel: 'Full Luxury Alpine Butler & Chef'
  },
  {
    id: 'villa-kyoto-01',
    slug: 'ryokan-machiya-imperial-garden-kyoto',
    name: 'The Imperial Garden Machiya Residence',
    destination: 'kyoto',
    destinationName: 'Kyoto, Japan',
    location: 'Higashiyama Heritage District, Kyoto',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    nightlyRateINR: 280000,
    rating: 4.95,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80'
    ],
    tagline: 'Centuries-old restored samurai estate with private onsen & moss zen garden',
    description: 'A protected Edo-period architectural residence featuring private aromatic hinoki cedar onsen baths, master tea ceremony tea room, tatami suites, and private Kaiseki multi-course dinners.',
    amenities: ['Private Hinoki Hot Spring Onsen', 'Authentic Zen Garden', 'Tea Ceremony Master On-Call', 'Private Kaiseki Dining', 'Kimono Concierge', 'Bilingual House Master'],
    serviceLevel: 'Traditional Ryokan VIP Service'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    destination = '',
    minBedrooms = 0,
    maxGuests = 0,
    amenity = ''
  } = req.query || {};

  const destFilter = String(destination).toLowerCase().trim();
  const minBeds = Number(minBedrooms) || 0;
  const minPax = Number(maxGuests) || 0;
  const amenityFilter = String(amenity).toLowerCase().trim();

  let filtered = CURATED_VILLAS.filter((v) => {
    if (destFilter && !v.destination.includes(destFilter) && !v.destinationName.toLowerCase().includes(destFilter)) {
      return false;
    }
    if (minBeds && v.bedrooms < minBeds) return false;
    if (minPax && v.maxGuests < minPax) return false;
    if (amenityFilter) {
      const match = v.amenities.some((a) => a.toLowerCase().includes(amenityFilter));
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0 && destFilter) {
    filtered = CURATED_VILLAS;
  }

  return res.status(200).json({
    success: true,
    totalVillas: filtered.length,
    villas: filtered,
    conciergeInclusions: [
      'Pre-arrival bespoke provisioning and pantry stocking',
      'Complimentary airport champagne reception and luxury transfer',
      'Dedicated 24/7 Horizon Private Concierge & Lifestyle Manager',
      'Daily housekeeping, turndown service and estate maintenance',
      'Flexible booking terms and member security deposit waiver'
    ]
  });
}
