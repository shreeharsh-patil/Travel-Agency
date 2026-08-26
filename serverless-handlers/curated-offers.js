/**
 * VIP Seasonal Offers, Exclusive Privileges & Member Packages API.
 * Powers luxury promotion campaigns, discount codes, and seasonal travel blueprints.
 */

const SEASONAL_OFFERS = [
  {
    id: 'offer-amalfi-heli',
    code: 'AMALFIHELI26',
    title: 'The Amalfi Clifftop Privilege & Private Helicopter Transfer',
    destination: 'Amalfi Coast, Italy',
    category: 'Luxury Villa & Aviation',
    discountPercent: 25,
    originalPriceINR: 560000,
    offerPriceINR: 420000,
    expiryDate: '2026-10-31',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Book 5+ nights in a Positano clifftop estate and receive complimentary helicopter transfer from Naples.',
    privilegesIncluded: [
      'Complimentary Twin-Engine Helicopter transfer from Naples Airport direct to Ravello',
      'Private Riva Yacht full-day cruise across Capri & Faraglioni caves',
      'Complimentary multi-course tasting dinner at 2-Michelin starred Don Alfonso 1890',
      'Daily champagne breakfast & private estate butler'
    ],
    terms: 'Valid for bookings made through October 2026. Non-combinable with other member vouchers.'
  },
  {
    id: 'offer-goa-monsoon-wellness',
    code: 'GOAWELCOME26',
    title: 'Goa Private Beach Estate & Ayurvedic Rejuvenation',
    destination: 'Goa, India',
    category: 'Coastal Wellness',
    discountPercent: 30,
    originalPriceINR: 195000,
    offerPriceINR: 136500,
    expiryDate: '2026-11-30',
    image: 'https://images.unsplash.com/photo-1512343800234-840322ee8146?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Seven nights in a private oceanfront estate with daily customized holistic therapies.',
    privilegesIncluded: [
      'Daily 90-minute bespoke Ayurvedic herbal oil therapies and panchakarma treatments',
      'Private sunset catamaran sailing on the Mandovi river with live jazz',
      'Dedicated private chef specializing in Konkan coastal gastronomy',
      'VIP luxury airport transfers in private Mercedes Maybach'
    ],
    terms: 'Minimum 5 nights stay. Complimentary date changes up to 72 hours prior.'
  },
  {
    id: 'offer-kyoto-cherry-blossom',
    code: 'KYOTOSAKURA26',
    title: 'Kyoto Imperial Machiya & Private Master Tea Ceremony',
    destination: 'Kyoto, Japan',
    category: 'Heritage & Culture',
    discountPercent: 20,
    originalPriceINR: 350000,
    offerPriceINR: 280000,
    expiryDate: '2026-12-15',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Private Edo-period townhouse with after-hours temple access and onsen baths.',
    privilegesIncluded: [
      'Private dawn access to Kiyomizu-dera temple before public opening',
      'Authentic Tea Ceremony with a 15th-generation Urasenke Grand Master in Gion',
      'Private Kaiseki feast with Geiko performance in a historic Pontocho teahouse',
      'High-speed Shinkansen Gran Class bullet train transfers'
    ],
    terms: 'Requires at least 14 days advance reservation due to heritage master availability.'
  },
  {
    id: 'offer-aspen-ski-chalet',
    code: 'ASPENPOWDER26',
    title: 'Aspen Ski-In Chalet & Heli-Skiing Expedition',
    destination: 'Aspen, USA',
    category: 'Winter Alpine Sports',
    discountPercent: 20,
    originalPriceINR: 680000,
    offerPriceINR: 544000,
    expiryDate: '2026-12-31',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Full luxury Red Mountain chalet with heated pool and private backcountry ski guide.',
    privilegesIncluded: [
      'Single-day backcountry heli-skiing expedition with certified UIAGM alpine mountain guides',
      'Complimentary full-season Aspen Snowmass Premier Lift Passes for all guests',
      'Private ski valet, equipment fitting in-chalet, and daily boot warming',
      'Après-ski sommelier wine tasting by the outdoor heated infinity pool'
    ],
    terms: 'Valid for winter 2026 reservations. Subject to alpine weather safety clearance.'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = '', category = '' } = req.query || {};
  const destClean = String(destination).toLowerCase().trim();
  const catClean = String(category).toLowerCase().trim();

  let filtered = SEASONAL_OFFERS.filter((o) => {
    if (destClean && !o.destination.toLowerCase().includes(destClean)) return false;
    if (catClean && !o.category.toLowerCase().includes(catClean)) return false;
    return true;
  });

  if (filtered.length === 0 && (destClean || catClean)) {
    filtered = SEASONAL_OFFERS;
  }

  return res.status(200).json({
    success: true,
    totalOffers: filtered.length,
    offers: filtered,
    memberPerks: [
      'Automatic room & villa category upgrades upon availability at check-in',
      'Early check-in (10:00 AM) and guaranteed late check-out (4:00 PM)',
      'US$100 equivalent food & beverage resort credit per booking',
      'Dedicated VIP Concierge booking support line'
    ]
  });
}
