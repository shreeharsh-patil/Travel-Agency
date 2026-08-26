/**
 * Private Luxury Yacht & Sailing Catamaran Charter Fleet API.
 * Computes day/week charter rates, crew staffing, water toys, and APA allowances across marine sanctuaries.
 */

const YACHT_FLEET = [
  {
    id: 'yacht-amalfi-riva',
    name: 'Riva Rivamare 38 "Dolce Vita"',
    category: 'Speedboat & Day Cruiser',
    lengthFeet: 38,
    destination: 'Amalfi Coast, Italy',
    dayGuests: 6,
    overnightCabins: 1,
    dailyCharterRateINR: 280000,
    captainAndCrew: 2,
    cruisingSpeedKnots: 31,
    waterToys: ['Snorkel gear', 'SeaBob F5S', 'Champagne cooler & sound system'],
    apaPercent: 20, // Advanced Provisioning Allowance for fuel & marina docking
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800'
  },
  {
    id: 'yacht-amalfi-mega',
    name: 'Sanlorenzo SX88 "Sirena"',
    category: 'Ultra-Luxury Motor Yacht',
    lengthFeet: 88,
    destination: 'Amalfi Coast / Capri',
    dayGuests: 12,
    overnightCabins: 4,
    dailyCharterRateINR: 850000,
    captainAndCrew: 4,
    cruisingSpeedKnots: 20,
    waterToys: ['Williams Jet Tender', '2x SeaDoo Spark Jet Skis', '2x E-Foils', 'Paddleboards', 'Inflatable sea pool'],
    apaPercent: 30,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800'
  },
  {
    id: 'yacht-goa-catamaran',
    name: 'Lagoon 46 "Horizon Wave"',
    category: 'Luxury Sailing Catamaran',
    lengthFeet: 46,
    destination: 'Goa (Mandovi & Arabian Sea)',
    dayGuests: 15,
    overnightCabins: 3,
    dailyCharterRateINR: 185000,
    captainAndCrew: 3,
    cruisingSpeedKnots: 10,
    waterToys: ['Kayaks', 'Snorkel sets', 'BBQ Grill on deck', 'Floating water mat'],
    apaPercent: 15,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  },
  {
    id: 'yacht-bali-phinisi',
    name: 'Royal Phinisi Schooner "Nirvana"',
    category: 'Handcrafted Heritage Wooden Schooner',
    lengthFeet: 110,
    destination: 'Bali / Komodo National Park',
    dayGuests: 18,
    overnightCabins: 6,
    dailyCharterRateINR: 950000,
    captainAndCrew: 10,
    cruisingSpeedKnots: 12,
    waterToys: ['PADI Dive Compressor & gear', 'Speedboat tender', 'Wakeboards', 'SeaBobs'],
    apaPercent: 25,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = '', guests = 0 } = req.query || {};
  const destClean = String(destination).toLowerCase().trim();
  const pax = Number(guests) || 0;

  let filtered = YACHT_FLEET.filter((y) => {
    if (destClean && !y.destination.toLowerCase().includes(destClean)) return false;
    if (pax && y.dayGuests < pax) return false;
    return true;
  });

  if (filtered.length === 0) filtered = YACHT_FLEET;

  return res.status(200).json({
    success: true,
    totalVessels: filtered.length,
    fleet: filtered,
    conciergeYachtInclusions: [
      'Dedicated licensed Master Captain and professional marine crew',
      'Customized itinerary and private secluded cove anchorages',
      'Fresh fruit platters, canapés, soft drinks & ice provided on-board',
      'Fuel for 4 hours standard cruising per day included'
    ]
  });
}
