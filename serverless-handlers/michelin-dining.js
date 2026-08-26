/**
 * Michelin-Starred Dining & Haute Gastronomy Guide API.
 * Provides destination-specific fine dining sanctuaries, Michelin star distinctions, and reservation protocol.
 */

const MICHELIN_DIRECTORY = {
  kyoto: [
    {
      name: 'Kikunoi Honten (菊乃井 本店)',
      michelinRating: '3 Michelin Stars ★★★',
      cuisine: 'Traditional Kaiseki Imperial Cuisine',
      location: 'Higashiyama, Kyoto',
      headChef: 'Master Yoshihiro Murata',
      signatureDish: 'Seasonal Hamo Pike-Conger in Lotus Broth with Mountain Herbs',
      averageCostINR: 32000,
      dressCode: 'Smart Elegant (Socks required for tatami mat dining)',
      reservationLeadTime: '2-3 months advance concierge booking'
    },
    {
      name: 'Hyotei (瓢亭)',
      michelinRating: '3 Michelin Stars ★★★',
      cuisine: '450-Year-Old Historic Kaiseki',
      location: 'Nanzenji Temple Grounds, Kyoto',
      headChef: 'Master Eiichi Takahashi',
      signatureDish: 'World-renowned Hyotei soft-boiled Imperial Egg & morning Asagayu porridge',
      averageCostINR: 28000,
      dressCode: 'Formal or Elegant Traditional Kimono',
      reservationLeadTime: '60 days in advance'
    }
  ],
  paris: [
    {
      name: 'Plénitude – Cheval Blanc Paris',
      michelinRating: '3 Michelin Stars ★★★',
      cuisine: 'Contemporary French Haute Gastronomy',
      location: 'Seine Riverfront, Paris 1st',
      headChef: 'Chef Arnaud Donckele',
      signatureDish: 'Symphony of Broths & Consommés paired with Brittany Turbot',
      averageCostINR: 48000,
      dressCode: 'Jacket required for gentlemen',
      reservationLeadTime: '90 days concierge release'
    },
    {
      name: 'L’Ambroisie',
      michelinRating: '3 Michelin Stars ★★★',
      cuisine: 'Classic Grand French Cuisine',
      location: 'Place des Vosges, Paris',
      headChef: 'Chef Bernard & Mathieu Pacaud',
      signatureDish: 'Feuillantine of Langoustines with Sesame and Curry Emulsion',
      averageCostINR: 42000,
      dressCode: 'Formal Elegance',
      reservationLeadTime: '30-45 days'
    }
  ],
  amalfi: [
    {
      name: 'Don Alfonso 1890',
      michelinRating: '2 Michelin Stars ★★ & Green Star (Sustainability)',
      cuisine: 'Campanian Mediterranean Gastronomy',
      location: 'Sant’Agata sui Due Golfi, Amalfi Coast',
      headChef: 'Chef Ernesto Iaccarino',
      signatureDish: 'Rigatoni with Vesuvian San Marzano Tomatoes & Mozzarella foam',
      averageCostINR: 26000,
      dressCode: 'Resort Chic / Smart Casual',
      reservationLeadTime: '30 days in advance'
    },
    {
      name: 'La Sponda – Le Sirenuse',
      michelinRating: '1 Michelin Star ★',
      cuisine: 'Positano Coastal Italian',
      location: 'Positano, Amalfi Coast',
      headChef: 'Chef Gennaro Russo',
      signatureDish: 'Local Red Prawn Carpaccio with Lemon Verbena & Sea Salt',
      averageCostINR: 22000,
      dressCode: 'Smart Casual / Elegant',
      reservationLeadTime: '45 days in advance'
    }
  ],
  goa: [
    {
      name: 'Cavala Heritage & Jamun Gastronomy',
      michelinRating: 'Culinary Icon / Fine Dining Destination',
      cuisine: 'Heritage Indo-Portuguese Coastal',
      location: 'Assagao & Baga, Goa',
      headChef: 'Chef Rahul Gomez',
      signatureDish: 'Smoked Butter Garlic Lobster & Slow-Braised Pork Vindaloo in aged coconut vinegar',
      averageCostINR: 7500,
      dressCode: 'Resort Elegant',
      reservationLeadTime: '7-14 days'
    }
  ],
  aspen: [
    {
      name: 'Matsuhisa Aspen',
      michelinRating: 'Michelin Recommended / VIP Hotspot',
      cuisine: 'Japanese-Peruvian Fusion',
      location: 'Downtown Aspen, Colorado',
      headChef: 'Chef Nobu Matsuhisa',
      signatureDish: 'Miso-Marinated Black Cod & A5 Wagyu Beef Tataki',
      averageCostINR: 22000,
      dressCode: 'Alpine Chic',
      reservationLeadTime: '30 days in advance'
    }
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'kyoto' } = req.query || {};
  const key = String(destination).toLowerCase().trim();

  let list = MICHELIN_DIRECTORY[key];
  if (!list) {
    for (const [k, v] of Object.entries(MICHELIN_DIRECTORY)) {
      if (key.includes(k)) {
        list = v;
        break;
      }
    }
  }
  if (!list) list = MICHELIN_DIRECTORY.kyoto;

  return res.status(200).json({
    success: true,
    destination: key,
    totalRestaurants: list.length,
    restaurants: list,
    sommelierPrivilege: 'Horizon Travels concierge manages priority table reservations, corkage waivers, and private chef greetings.'
  });
}
