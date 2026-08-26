/**
 * International Travel Health, Vaccine Requirements & Acclimatization Advisory API.
 * Provides WHO-aligned destination health notices, vaccine mandates, and altitude advice.
 */

const DESTINATION_HEALTH_GUIDES = {
  ladakh: {
    destination: 'Ladakh (Himalayas, India)',
    altitudeRisk: 'High Altitude (3,500m - 5,359m / 11,500ft - 17,500ft)',
    acclimatizationProtocol: {
      mandatoryRest: 'Mandatory 48 hours complete rest in Leh upon landing before high passes.',
      medication: 'Acetazolamide (Diamox) 125-250mg twice daily starting 24h prior, consult physician.',
      hydration: 'Drink 4-5 liters of water daily with oral rehydration salts (ORS).',
      oxygenPolicy: 'Horizon provides in-vehicle supplemental medical oxygen cylinders and hotel oxygen concentrators.'
    },
    vaccinesRecommended: ['Routine vaccines (Tetanus, MMR)', 'Hepatitis A & Typhoid'],
    vaccinesMandatory: 'None for general tourist entry',
    waterSafety: 'Drink only sealed mineral water or reverse-osmosis boiled water.'
  },
  aspen: {
    destination: 'Aspen, Colorado, USA',
    altitudeRisk: 'Moderate Alpine (2,400m / 8,000ft base, 3,400m summit)',
    acclimatizationProtocol: {
      mandatoryRest: 'First 24 hours light activity; avoid heavy alcohol during first night.',
      hydration: 'High-altitude alpine humidity is low; increase electrolyte intake.',
      oxygenPolicy: 'In-chalet hyperbaric oxygen therapy & mobile IV hydration therapy available on-demand.'
    },
    vaccinesRecommended: ['Routine vaccines', 'Annual Influenza during ski season'],
    vaccinesMandatory: 'None',
    waterSafety: 'Municipal mountain tap water is Grade A pure and safe to drink.'
  },
  bali: {
    destination: 'Bali, Indonesia',
    altitudeRisk: 'Sea Level to Low Elevation',
    acclimatizationProtocol: {
      tropicalHydration: 'Stay hydrated with fresh young coconut water and electrolyte beverages.',
      sunProtection: 'High UV tropical index requires SPF 50+ mineral sunscreen.'
    },
    vaccinesRecommended: ['Hepatitis A & B', 'Typhoid', 'Tetanus booster', 'Rabies (if interacting with wildlife in Ubud monkey forest)'],
    vaccinesMandatory: 'Yellow Fever certificate only if traveling from a yellow-fever endemic country.',
    waterSafety: 'Avoid raw tap water; use filtered/bottled water for brushing teeth.'
  },
  goa: {
    destination: 'Goa, India',
    altitudeRisk: 'Sea level coastal',
    acclimatizationProtocol: {
      tropicalHydration: 'Keep hydrated in warm coastal climate with coconut water and lemon water.',
      sunProtection: 'Broad spectrum SPF 50+ recommended during peak beach hours (11 AM - 3 PM).'
    },
    vaccinesRecommended: ['Hepatitis A & Typhoid', 'Tetanus booster'],
    vaccinesMandatory: 'None for domestic & standard international travelers',
    waterSafety: 'Drink packaged mineral water.'
  },
  kyoto: {
    destination: 'Kyoto / Tokyo, Japan',
    altitudeRisk: 'None',
    acclimatizationProtocol: {
      comfort: 'Comfortable walking shoes essential (average 12,000 - 18,000 steps daily across temple grounds).'
    },
    vaccinesRecommended: ['Routine vaccines (MMR, DTP)'],
    vaccinesMandatory: 'None',
    waterSafety: 'Tap water across Japan meets highest international purity and is 100% safe to drink.'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'ladakh' } = req.query || {};
  const clean = String(destination).toLowerCase().trim();

  let guide = DESTINATION_HEALTH_GUIDES[clean];
  if (!guide) {
    for (const [k, v] of Object.entries(DESTINATION_HEALTH_GUIDES)) {
      if (clean.includes(k) || v.destination.toLowerCase().includes(clean)) {
        guide = v;
        break;
      }
    }
  }
  if (!guide) guide = DESTINATION_HEALTH_GUIDES.ladakh;

  return res.status(200).json({
    success: true,
    destination: guide.destination,
    altitudeRiskLevel: guide.altitudeRisk,
    acclimatizationProtocol: guide.acclimatizationProtocol,
    vaccineAdvisories: {
      recommended: guide.vaccinesRecommended,
      mandatoryCertificates: guide.vaccinesMandatory
    },
    drinkingWaterSafety: guide.waterSafety,
    medicalSupport: 'Horizon Travels concierge connects with 24/7 English-speaking private emergency medical teams.'
  });
}
