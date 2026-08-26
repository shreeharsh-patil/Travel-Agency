/**
 * Private Aviation Jet Charter Pricing & Route Calculation API.
 * Computes on-demand private jet charter estimates, flight durations, and aircraft specifications.
 */

const JET_HUBS = {
  DEL: { name: 'Indira Gandhi International (DEL)', city: 'New Delhi', country: 'India', lat: 28.5562, lon: 77.1000 },
  BOM: { name: 'Chhatrapati Shivaji Maharaj (BOM)', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656 },
  GOX: { name: 'Manohar International MOPA (GOX)', city: 'Goa', country: 'India', lat: 15.7675, lon: 73.8647 },
  BLR: { name: 'Kempegowda International (BLR)', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066 },
  DXB: { name: 'Dubai International (DXB / Al Maktoum DWC)', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657 },
  HND: { name: 'Tokyo Haneda (HND)', city: 'Tokyo / Kyoto', country: 'Japan', lat: 35.5494, lon: 139.7798 },
  LHR: { name: 'London Farnborough / Luton (FAB / LTN)', city: 'London', country: 'United Kingdom', lat: 51.2758, lon: -0.7763 },
  CDG: { name: 'Paris Le Bourget Business Airport (LBG)', city: 'Paris', country: 'France', lat: 48.9694, lon: 2.4414 },
  NCE: { name: 'Nice Côte d’Azur / Cannes Mandelieu (NCE)', city: 'Amalfi / Riviera', country: 'France/Italy', lat: 43.6653, lon: 7.2150 },
  ASE: { name: 'Aspen Pitkin County Airport (ASE)', city: 'Aspen', country: 'USA', lat: 39.2232, lon: -106.8689 },
  JFK: { name: 'New York Teterboro (TEB / JFK)', city: 'New York', country: 'USA', lat: 40.8501, lon: -74.0608 },
  DPS: { name: 'Ngurah Rai International (DPS)', city: 'Bali', country: 'Indonesia', lat: -8.7482, lon: 115.1672 },
  MLE: { name: 'Velana International (MLE)', city: 'Maldives', country: 'Maldives', lat: 4.1918, lon: 73.5291 },
  KEF: { name: 'Keflavík International (KEF)', city: 'Reykjavik', country: 'Iceland', lat: 63.9850, lon: -22.6056 }
};

const AIRCRAFT_CLASSES = [
  {
    category: 'very_light',
    name: 'Very Light Jet (VLJ)',
    models: ['Embraer Phenom 100EV', 'Cessna Citation Mustang'],
    capacity: 4,
    speedKnots: 380,
    rangeNm: 1178,
    hourlyRateINR: 220000,
    luggageBags: 4,
    cabinAltitudeFt: 8000,
    features: ['Enclosed lavatory', 'Leather club seating', 'Short runway access', 'Complimentary bar']
  },
  {
    category: 'light_jet',
    name: 'Light Jet',
    models: ['Cessna Citation CJ3+', 'Pilatus PC-24', 'Embraer Phenom 300E'],
    capacity: 7,
    speedKnots: 450,
    rangeNm: 2040,
    hourlyRateINR: 350000,
    luggageBags: 7,
    cabinAltitudeFt: 6600,
    features: ['High speed cruise', 'Spacious baggage bay', 'In-flight Wi-Fi', 'Refreshment center']
  },
  {
    category: 'midsize_jet',
    name: 'Midsize Jet',
    models: ['Hawker 900XP', 'Cessna Citation Latitude', 'Learjet 75'],
    capacity: 9,
    speedKnots: 470,
    rangeNm: 2850,
    hourlyRateINR: 520000,
    luggageBags: 9,
    cabinAltitudeFt: 5950,
    features: ['Stand-up cabin', 'Gourmet hot galley', 'Flight attendant available', 'Quiet cabin technology']
  },
  {
    category: 'super_midsize',
    name: 'Super-Midsize Jet',
    models: ['Bombardier Challenger 3500', 'Embraer Praetor 600'],
    capacity: 10,
    speedKnots: 490,
    rangeNm: 3400,
    hourlyRateINR: 700000,
    luggageBags: 12,
    cabinAltitudeFt: 4800,
    features: ['Transcontinental range', 'Full standing headroom', 'Private stateroom option', 'Ultra-fast Ka-band satellite Wi-Fi']
  },
  {
    category: 'heavy_jet',
    name: 'Heavy Executive Jet',
    models: ['Gulfstream G500', 'Dassault Falcon 2000LXS', 'Bombardier Challenger 650'],
    capacity: 14,
    speedKnots: 515,
    rangeNm: 4800,
    hourlyRateINR: 980000,
    luggageBags: 18,
    cabinAltitudeFt: 3900,
    features: ['Intercontinental range', 'Two living zones', 'Full berthing beds', 'Dedicated VIP flight attendant & Sommelier']
  },
  {
    category: 'ultra_long_range',
    name: 'Ultra Long-Range Flagship',
    models: ['Bombardier Global 7500', 'Gulfstream G700'],
    capacity: 18,
    speedKnots: 530,
    rangeNm: 7700,
    hourlyRateINR: 1450000,
    luggageBags: 25,
    cabinAltitudeFt: 2900,
    features: ['Four living spaces', 'Master suite with double bed & en-suite shower', 'Global non-stop range', 'Circadian lighting system']
  }
];

function calculateHaversineNm(lat1, lon1, lat2, lon2) {
  const R_KM = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R_KM * c;
  return km * 0.539957; // convert km to nautical miles
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    from = 'BOM',
    to = 'GOX',
    passengers = 4,
    category = null
  } = req.query || {};

  const originCode = String(from).toUpperCase().trim();
  const destCode = String(to).toUpperCase().trim();
  const paxCount = Math.max(1, Math.min(25, Number(passengers) || 4));

  const originHub = JET_HUBS[originCode] || JET_HUBS.BOM;
  const destHub = JET_HUBS[destCode] || JET_HUBS.GOX;

  const distanceNm = Math.round(calculateHaversineNm(originHub.lat, originHub.lon, destHub.lat, destHub.lon));
  const distanceKm = Math.round(distanceNm * 1.852);

  // Filter or list suitable aircraft classes based on range and capacity
  let suitableAircraft = AIRCRAFT_CLASSES.filter((ac) => {
    if (category && ac.category !== category) return false;
    return ac.capacity >= paxCount;
  });

  if (suitableAircraft.length === 0) {
    suitableAircraft = AIRCRAFT_CLASSES;
  }

  const quotes = suitableAircraft.map((ac) => {
    // Flight time calculation = distance / cruise speed + 0.35h (taxi, climb, descent)
    const rawFlightHours = distanceNm / ac.speedKnots + 0.35;
    const blockHours = Math.max(1.0, Math.round(rawFlightHours * 10) / 10);
    const flightTimeMins = Math.round(rawFlightHours * 60);

    const baseCharterCost = Math.round(blockHours * ac.hourlyRateINR);
    const fboVipHandling = 85000;
    const cateringFee = paxCount * 12000;
    const landingPermits = 45000;
    const totalEstimateINR = baseCharterCost + fboVipHandling + cateringFee + landingPermits;

    const requiresFuelStop = distanceNm > ac.rangeNm;

    return {
      category: ac.category,
      name: ac.name,
      recommendedModels: ac.models,
      maxPassengers: ac.capacity,
      rangeNm: ac.rangeNm,
      speedKnots: ac.speedKnots,
      luggageCapacityBags: ac.luggageBags,
      features: ac.features,
      estimatedFlightDuration: `${Math.floor(flightTimeMins / 60)}h ${flightTimeMins % 60}m`,
      blockHours,
      requiresFuelStop,
      costBreakdown: {
        flightHourlyRateINR: ac.hourlyRateINR,
        baseFlightCostINR: baseCharterCost,
        vipFboTerminalFeeINR: fboVipHandling,
        gourmetCateringINR: cateringFee,
        landingAndPermitsINR: landingPermits,
        totalEstimateINR
      }
    };
  });

  return res.status(200).json({
    success: true,
    route: {
      origin: originHub,
      destination: destHub,
      distanceNm,
      distanceKm
    },
    requestedPassengers: paxCount,
    availableHubs: Object.entries(JET_HUBS).map(([code, h]) => ({ code, name: h.name, city: h.city, country: h.country })),
    quotes,
    conciergePrivileges: [
      '24/7 Dedicated Private Aviation Flight Manager',
      'VIP Private Terminal (FBO) access with zero customs lines',
      'Ramp-side chauffeur car direct to aircraft steps',
      'Michelin-starred bespoke in-flight catering & sommelier wine cellar',
      'Pet-friendly luxury cabin arrangements with zero crate restrictions'
    ]
  });
}
