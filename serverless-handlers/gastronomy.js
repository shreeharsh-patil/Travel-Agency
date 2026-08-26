/**
 * Free Regional Gastronomy & Culinary Culture API (Zero API Key Required).
 * Outlines iconic signature dishes, traditional street eats, regional wine/drinks,
 * and dietary guidance (Vegetarian, Vegan, Halal, Gluten-Free).
 */

const GASTRONOMY_GUIDE = {
  goa: {
    destination: 'Goa',
    signatureDishes: [
      { name: 'Goan Fish Curry (Xitt Codi)', description: 'Kingfish simmered in fresh ground coconut, red Kashmiri chilies, and tangy kokum.' },
      { name: 'Pork / Chicken Vindaloo', description: 'Traditional Portuguese-Goan spiced preparation infused with palm vinegar and garlic.' },
      { name: 'Bebinca', description: 'Royal 7-layer baked Goan dessert made with coconut milk, egg yolks, ghee, and nutmeg.' },
      { name: 'Prawn Balchão & Poi', description: 'Spicy, fiery pickled shrimp served inside warm Goan crusty wood-fired bread.' }
    ],
    drinks: ['Feni (Cashew & Palm spirit cocktail with Limca & green chili)', 'Fresh King Coconut Water', 'Sol Kadhi (Digestive kokum coconut cooler)'],
    dietaryNotes: 'Plentiful fresh vegetarian Hindu Saraswat dishes; pure vegetarian beach cafés widely available.'
  },
  kyoto: {
    destination: 'Kyoto',
    signatureDishes: [
      { name: 'Kyo-Kaiseki', description: 'Centuries-old imperial banquet presenting delicate seasonal courses with exquisite artistic plating.' },
      { name: 'Shojin Ryori', description: 'Zen Buddhist temple vegetarian cuisine using mountain herbs, tofu, and seasonal root vegetables.' },
      { name: 'Yudofu (Simmered Silk Tofu)', description: 'Simmered artisan tofu in kelp broth with grated ginger, scallions, and soy dipping sauce.' },
      { name: 'Uji Matcha Parfait', description: 'High-grade matcha sponge, jelly, sweet adzuki beans, and dango mochi.' }
    ],
    drinks: ['Uji Ceremonial Matcha', 'Fushimi Region Junmai Daiginjo Sake', 'Hojicha (Roasted green tea)'],
    dietaryNotes: 'Shojin Ryori offers the pinnacle of 100% plant-based Zen vegetarian and vegan dining.'
  },
  'amalfi-coast': {
    destination: 'Amalfi Coast',
    signatureDishes: [
      { name: 'Spaghetti alle Vongole', description: 'Al dente pasta tossed with fresh Mediterranean clams, garlic, olive oil, and parsley.' },
      { name: 'Delizia al Limone', description: 'Sponge dome soaked in limoncello syrup and filled with fragrant lemon custard.' },
      { name: 'Scialatielli ai Frutti di Mare', description: 'Thick handmade ribbons of ribbon pasta tossed with squid, mussels, prawns, and cherry tomatoes.' },
      { name: 'Mozzarella di Bufala Campana', description: 'Ultra-creamy fresh water buffalo mozzarella served with vine-ripened tomatoes and basil.' }
    ],
    drinks: ['Chilled Limoncello di Amalfi (IGP)', 'Costa d’Amalfi DOC White Wine', 'Aperol & Campari Spritz'],
    dietaryNotes: 'Mediterranean diet naturally features abundant olive oil, tomatoes, grilled vegetables, and gluten-free pasta options.'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'goa' } = req.query || {};
  const clean = String(destination).toLowerCase().trim();

  let guide = GASTRONOMY_GUIDE[clean];
  if (!guide) {
    for (const [key, val] of Object.entries(GASTRONOMY_GUIDE)) {
      if (clean.includes(key)) {
        guide = val;
        break;
      }
    }
  }

  if (!guide) {
    guide = {
      destination,
      signatureDishes: [
        { name: 'Regional Signature Tasting', description: 'Seasonal chef-curated delicacies prepared with authentic local spices and farm-fresh ingredients.' },
        { name: 'Artisan Culinary Specialties', description: 'Traditional family recipes, wood-fired hearth cooking, and heritage street flavors.' }
      ],
      drinks: ['Local Heritage Spirits & Signature Cocktails', 'Artisan Coffee & Botanical Teas'],
      dietaryNotes: 'Hospitality establishments cater seamlessly to vegetarian, vegan, and special dietary preferences.'
    };
  }

  return res.status(200).json({
    success: true,
    gastronomy: guide,
    source: 'Free Culinary & Regional Gastronomy Engine'
  });
}
