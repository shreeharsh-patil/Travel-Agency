/**
 * Sustainable Luxury Travel Carbon Footprint & Verified Offset API.
 * Computes ICAO-compliant flight & travel emissions and provides certified carbon offset portfolios.
 */

const FLIGHT_CLASS_MULTIPLIERS = {
  economy: 1.0,
  premium_economy: 1.6,
  business: 2.9,
  first: 4.0,
  private_jet: 8.5
};

const VERIFIED_OFFSET_PROJECTS = [
  {
    id: 'proj-himalayan-reforest',
    name: 'Himalayan High-Altitude Forest Regeneration',
    location: 'Ladakh & Uttarakhand, India',
    standard: 'Gold Standard & VCS Certified',
    costPerTonneCO2eINR: 1250,
    impact: 'Restores native Deodar Cedar and Himalayan Birch forests, preserving snow leopard watersheds.',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800'
  },
  {
    id: 'proj-sundarbans-mangrove',
    name: 'Sundarbans Coastal Mangrove Carbon Barrier',
    location: 'Bay of Bengal, India',
    standard: 'Verra VCS + CCB Gold',
    costPerTonneCO2eINR: 1400,
    impact: 'Sequesters blue carbon at 4x the rate of tropical rainforests while protecting royal Bengal tiger habitats.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'
  },
  {
    id: 'proj-alpine-glacier-green',
    name: 'Swiss Alps Renewable Hydro & Glacial Conservation',
    location: 'Valais, Switzerland',
    standard: 'Swiss Federal Climate Standard',
    costPerTonneCO2eINR: 2200,
    impact: 'Powers high-altitude clean grid solutions and alpine biodiversity conservation.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    distanceKm = 2400,
    travelClass = 'business',
    passengers = 1,
    mode = 'commercial_flight' // 'commercial_flight' | 'private_jet' | 'chauffeur_vehicle'
  } = req.query || {};

  const dist = Math.max(50, Math.min(25000, Number(distanceKm) || 2400));
  const pax = Math.max(1, Math.min(50, Number(passengers) || 1));
  const cleanClass = String(travelClass).toLowerCase().trim();
  const multiplier = FLIGHT_CLASS_MULTIPLIERS[cleanClass] || FLIGHT_CLASS_MULTIPLIERS.business;

  // Base emission factor (ICAO average ~0.115 kg CO2 per passenger-km for short/medium haul)
  const baseKgCO2PerKm = mode === 'private_jet' ? 1.85 : 0.115;
  const totalKgCO2e = Math.round(dist * baseKgCO2PerKm * multiplier * pax);
  const totalTonnesCO2e = Math.round((totalKgCO2e / 1000) * 100) / 100;

  // Tree planting equivalent (1 mature tree absorbs ~22 kg CO2 per year)
  const treesRequired = Math.ceil(totalKgCO2e / 22);

  // Offset options for each verified project
  const offsetPortfolios = VERIFIED_OFFSET_PROJECTS.map((proj) => {
    const costINR = Math.max(500, Math.round(totalTonnesCO2e * proj.costPerTonneCO2eINR));
    return {
      projectId: proj.id,
      projectName: proj.name,
      location: proj.location,
      certification: proj.standard,
      contributionAmountINR: costINR,
      contributionFormatted: `₹${costINR.toLocaleString('en-IN')}`,
      impactDescription: proj.impact,
      treesEquivalent: treesRequired
    };
  });

  return res.status(200).json({
    success: true,
    footprint: {
      distanceKm: dist,
      travelMode: mode,
      travelClass: cleanClass,
      passengers: pax,
      totalKgCO2e,
      totalTonnesCO2e,
      equivalentTreesToPlant: treesRequired,
      sustainableImpactScore: totalTonnesCO2e < 1.0 ? 'Low Impact' : totalTonnesCO2e < 3.5 ? 'Moderate' : 'High Footprint'
    },
    offsetPortfolios,
    sustainabilityCommitment: 'Horizon Travels matches 100% of all client carbon offsets with verified Gold Standard blue carbon projects.'
  });
}
