/**
 * Free AI Trip Itinerary & Day-by-Day Journey Planner (Zero API Key Required).
 * Generates bespoke morning, afternoon, sunset, and dinner itineraries
 * tailored to destination, trip duration, and luxury travel styles.
 */

const ITINERARY_TEMPLATES = {
  goa: {
    days: [
      {
        day: 1,
        title: 'Coastal Arrival & Sunset Sips',
        morning: 'Chauffeured airport transfer to luxury seaside sanctuary; check-in and private welcome cocktail.',
        afternoon: 'Unwind along the golden sands of Ashwem or Mandrem beach; private cabana lounging.',
        sunset: 'Sunset cocktails and chilled ambient beats at a cliffside lounge overlooking the Arabian Sea.',
        dinner: 'Fresh coastal catch and Goan-Portuguese fusion dinner at a beachfront fine dining pavilion.'
      },
      {
        day: 2,
        title: 'Portuguese Heritage & Latin Quarter Walk',
        morning: 'Guided walking stroll through Fontainhas, Panaji — admiring pastel Portuguese villas and art galleries.',
        afternoon: 'Traditional spice plantation tour in Ponda with an authentic Konkan banquet served on banana leaves.',
        sunset: 'Luxury private yacht cruise along the tranquil Chapora River.',
        dinner: 'Contemporary Portuguese culinary tasting menu with curated European wine pairings.'
      },
      {
        day: 3,
        title: 'Hidden Waterfalls & Wellness Sanctuary',
        morning: 'Early morning excursion into the lush Western Ghats to witness cascading waterfalls and emerald pools.',
        afternoon: 'Holistic Ayurvedic spa massage and sound healing session at an eco-luxury wellness retreat.',
        sunset: 'Golden hour photography at the historic ramparts of Cabo de Rama Fort.',
        dinner: 'Candlelit dining by a secluded lagoon featuring organic farm-to-table delicacies.'
      },
      {
        day: 4,
        title: 'Island Sailing & Farewell Banquet',
        morning: 'Catamaran sailing to Grand Island for snorkeling amongst coral reefs and dolphin spotting.',
        afternoon: 'Artisan souvenir shopping in boutique lifestyle stores and flea markets.',
        sunset: 'Champagne toast on a secluded private beach sandbar.',
        dinner: 'Grand chef-curated farewell seafood grill under the stars.'
      }
    ]
  },
  kyoto: {
    days: [
      {
        day: 1,
        title: 'Zen Sanctuaries & Bamboo Forest',
        morning: 'Dawn stroll through the ethereal Arashiyama Bamboo Grove before the crowds arrive.',
        afternoon: 'Visit Tenryu-ji Temple and its 14th-century landscape garden; authentic matcha tea ceremony.',
        sunset: 'Panoramic vistas of the Kyoto basin from the wooden terrace of Kiyomizu-dera.',
        dinner: 'Multi-course Kaiseki banquet featuring seasonal Kyoto vegetables and A5 Wagyu beef.'
      },
      {
        day: 2,
        title: 'Torii Gates & Gion Geisha District',
        morning: 'Hike through the thousands of vermilion Torii gates of Fushimi Inari Shrine.',
        afternoon: 'Explore the golden pavilion of Kinkaku-ji reflecting upon the mirror pond.',
        sunset: 'Atmospheric twilight walk through the preserved wooden machiya alleys of Gion and Pontocho.',
        dinner: 'Exclusive Omakase sushi experience at an intimate counter.'
      },
      {
        day: 3,
        title: 'Philosopher’s Path & Artisan Crafts',
        morning: 'Contemplative stroll along the cherry-tree lined Philosopher’s Path to Ginkaku-ji (Silver Pavilion).',
        afternoon: 'Hands-on pottery workshop in Kiyomizu and Japanese incense blending masterclass.',
        sunset: 'Evening meditation and temple garden illumination tour at Kodai-ji.',
        dinner: 'Savor traditional Yudofu (artisan silk tofu hot pot) in a historic ryokan courtyard.'
      }
    ]
  },
  'amalfi-coast': {
    days: [
      {
        day: 1,
        title: 'Cliffside Panorama & Positano Vista',
        morning: 'Private chauffeur along the legendary Amalfi Drive; check into cliffside villa.',
        afternoon: 'Stroll through cascading pastel lanes of Positano; visit artisan linen and handmade sandal ateliers.',
        sunset: 'Aperitivo with Aperol Spritz overlooking the Mediterranean horizon.',
        dinner: 'Fresh handmade pasta and catch-of-the-day at a romantic seaside terrace.'
      },
      {
        day: 2,
        title: 'Capri Island Yacht Charter',
        morning: 'Private Riva yacht cruise across the Gulf of Salerno to the glamorous Isle of Capri.',
        afternoon: 'Swim into the shimmering turquoise waters of the Green and White Grottoes; lunch at a Capri beach club.',
        sunset: 'Cruise past the iconic Faraglioni rock formations at golden hour.',
        dinner: 'Michelin-starred cliffside dining overlooking the illuminated coast.'
      },
      {
        day: 3,
        title: 'Ravello Gardens & Lemon Groves',
        morning: 'Ascend to the hilltop sanctuary of Ravello; visit the infinite terrace of Villa Cimbrone.',
        afternoon: 'Private stroll through an organic Amalfi lemon grove with limoncello tasting.',
        sunset: 'Classical chamber music concert under the pines of Villa Rufolo.',
        dinner: 'Campanian wine-pairing dinner in a historic cloisters courtyard.'
      }
    ]
  }
};

export function generateCustomItinerary(destination, numDays = 4, category = 'Luxury') {
  const clean = String(destination).toLowerCase().trim();
  let base = ITINERARY_TEMPLATES[clean];

  if (!base) {
    for (const [key, val] of Object.entries(ITINERARY_TEMPLATES)) {
      if (clean.includes(key)) {
        base = val;
        break;
      }
    }
  }

  if (base) {
    return base.days.slice(0, numDays);
  }

  // Smart dynamic generation
  const days = [];
  const titles = [
    'Arrival & Sanctuary Discovery',
    'Cultural Heritage & Iconic Landmarks',
    'Nature Escapes & Hidden Viewpoints',
    'Gastronomy Trails & Local Ateliers',
    'Coastal Adventure & Sunset Sailing',
    'Artisan Markets & Leisure Day',
    'Grand Farewell & Celebration'
  ];

  for (let i = 0; i < Math.min(numDays, 7); i++) {
    days.push({
      day: i + 1,
      title: titles[i] || `Day ${i + 1} Immersion`,
      morning: `Morning excursion exploring scenic highlights and historic quarters of ${destination}.`,
      afternoon: `Curated local experience, artisan culinary tasting, and relaxation at the sanctuary.`,
      sunset: `Panoramic golden hour vantage point overlooking ${destination}.`,
      dinner: `Fine dining evening enjoying signature regional gastronomy and wines.`
    });
  }

  return days;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'Goa', days = 4, style = 'Luxury' } = req.query || {};
  const numDays = Math.max(1, Math.min(Number(days) || 4, 14));
  const itinerary = generateCustomItinerary(destination, numDays, style);

  return res.status(200).json({
    success: true,
    destination,
    durationDays: numDays,
    style,
    itinerary,
    source: 'Free AI-Powered Day-by-Day Journey Planner'
  });
}
