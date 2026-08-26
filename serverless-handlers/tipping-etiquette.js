/**
 * Global Luxury Tipping, Dining & Cultural Etiquette Intelligence API.
 * Provides destination-specific gratuity standards, luxury protocol, and cultural norms.
 */

const ETIQUETTE_DATABASE = {
  japan: {
    country: 'Japan',
    destinations: ['Kyoto', 'Tokyo', 'Hakone', 'Osaka'],
    currency: 'Japanese Yen (JPY)',
    tippingCulture: 'Strictly No Tipping',
    dining: {
      restaurants: 'No tipping. Leaving extra money is considered impolite or confusing. Exceptional service is included as standard Omotenashi hospitality.',
      serviceCharge: 'High-end Kaiseki ryokans and Michelin establishments include a 10-15% service charge (Otoshi/Service) on the bill.'
    },
    services: {
      hotelBellhops: 'No tips accepted.',
      privateChauffeur: 'No tips expected; giving small packaged luxury gifts (Omiyage) or bowing with sincere thanks (Arigatou gozaimasu) is appreciated.',
      privateGuide: 'If exceptional, place cash inside an elegant sealed envelope (Shugi-bukuro) and present with both hands.'
    },
    culturalProtocols: [
      'Always remove shoes before entering traditional Machiya ryokans or tatami rooms.',
      'Do not stick chopsticks vertically in rice bowls (resembles funerary incense rites).',
      'Quiet voice in bullet trains and public transport.'
    ]
  },
  italy: {
    country: 'Italy',
    destinations: ['Amalfi Coast', 'Rome', 'Florence', 'Venice', 'Milan'],
    currency: 'Euro (EUR)',
    tippingCulture: 'Discretionary / Modest Luxury Standard',
    dining: {
      restaurants: 'Coperto (bread/cover charge) is normal. For exceptional service at fine dining restaurants, leaving 5–10% in cash is customary.',
      serviceCharge: 'Check if "Servizio Incluso" is on the receipt. If included, rounding up to the nearest €10 or €20 is standard.'
    },
    services: {
      hotelBellhops: '€2 – €5 per luggage piece.',
      privateChauffeur: '€10 – €30 per day depending on service duration.',
      privateYachtCrew: '10–15% of the yacht charter base fee given in an envelope to the Captain for crew distribution.'
    },
    culturalProtocols: [
      'Do not order Cappuccino after 11:00 AM (Espresso or Macchiato is customary after meals).',
      'Modest dress covering shoulders and knees required for visiting historic cathedrals.',
      'Greet shopkeepers and staff with "Buongiorno" or "Buonasera" upon entering.'
    ]
  },
  india: {
    country: 'India',
    destinations: ['Goa', 'Jaipur', 'Udaipur', 'Kerala', 'Ladakh', 'Agra'],
    currency: 'Indian Rupee (INR)',
    tippingCulture: 'Customary & Highly Appreciated (Baksheesh)',
    dining: {
      restaurants: '10% is standard. Many luxury hotels add a 10% Service Charge directly on the bill, in which case additional tip is discretionary.',
      serviceCharge: 'Service charge is optional by Indian law, but customary in luxury dining.'
    },
    services: {
      hotelBellhops: '₹100 – ₹200 per bag in 5-star heritage palaces.',
      privateChauffeur: '₹500 – ₹1,000 per full day for dedicated private drivers.',
      houseboatCrew: '₹1,000 – ₹2,000 per night for private chef and navigator crew in Kerala.'
    },
    culturalProtocols: [
      'Remove footwear before entering temples, shrines, and private heritage homes.',
      'Use right hand for eating, passing food, or giving payments.',
      'Greet with "Namaste" with folded palms as a respectful sign of reverence.'
    ]
  },
  france: {
    country: 'France',
    destinations: ['Paris', 'French Riviera', 'Courchevel', 'Bordeaux'],
    currency: 'Euro (EUR)',
    tippingCulture: 'Service Compris (Discretionary Pourboire)',
    dining: {
      restaurants: '15% service is legally included in all bills ("Service Compris"). For Michelin-starred or high-end dining, leaving €10 – €30 extra in cash is standard for impeccable service.',
      serviceCharge: 'Always included by French law.'
    },
    services: {
      hotelBellhops: '€2 – €5 per bag in luxury Palace-category hotels.',
      hotelConcierge: '€20 – €50 for securing hard-to-book Michelin tables or VIP access.',
      privateChauffeur: '€20 – €40 per day.'
    },
    culturalProtocols: [
      'Always greet staff with "Bonjour Madame / Monsieur" before asking any question.',
      'Never rush a meal; dining in France is considered a social art form.',
      'Speak softly in dining rooms and wine cellars.'
    ]
  },
  usa: {
    country: 'United States',
    destinations: ['Aspen', 'New York', 'Miami', 'Hawaii', 'Los Angeles'],
    currency: 'US Dollar (USD)',
    tippingCulture: 'High Expectation / Standard 20%',
    dining: {
      restaurants: '18% to 22% of the pre-tax total is standard. 25% for exceptional sommelier & fine dining service.',
      serviceCharge: 'Some high-end restaurants include a 20% auto-gratuity for parties of 6 or more.'
    },
    services: {
      hotelBellhops: '$5 – $10 per bag.',
      valetParking: '$5 – $10 upon car retrieval.',
      privateSkiGuide: '$50 – $100 per day in luxury alpine resorts like Aspen.'
    },
    culturalProtocols: [
      'Tipping is a primary component of hospitality workers’ compensation.',
      'Always tip in card or crisp dollar bills.'
    ]
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country = 'japan' } = req.query || {};
  const query = String(country).toLowerCase().trim();

  let matched = ETIQUETTE_DATABASE[query];
  if (!matched) {
    for (const [key, val] of Object.entries(ETIQUETTE_DATABASE)) {
      if (val.destinations.some((d) => d.toLowerCase().includes(query)) || val.country.toLowerCase().includes(query)) {
        matched = val;
        break;
      }
    }
  }

  if (!matched) {
    matched = ETIQUETTE_DATABASE.japan;
  }

  return res.status(200).json({
    success: true,
    country: matched.country,
    currency: matched.currency,
    tippingCultureSummary: matched.tippingCulture,
    diningEtiquette: matched.dining,
    privateServices: matched.services,
    culturalEtiquetteRules: matched.culturalProtocols,
    availableCountries: Object.keys(ETIQUETTE_DATABASE)
  });
}
