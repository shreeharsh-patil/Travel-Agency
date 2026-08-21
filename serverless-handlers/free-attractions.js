/**
 * Free Attractions & Zero-Cost Activities API.
 * Provides travelers with top recommended free places to visit in popular destinations.
 */

const FREE_ATTRACTIONS_DATA = {
  goa: [
    { title: 'Sunset at Baga & Palolem Beach', category: 'Free Beach Access', fee: 'Free (₹0)', description: 'Enjoy vibrant coastal sunsets, golden sand walks, and tide watching.' },
    { title: 'Explore Fontainhas Latin Quarter', category: 'Cultural Heritage', fee: 'Free (₹0)', description: 'Stroll through historic Portuguese colorful streets and colonial architecture.' },
    { title: 'Chapora Fort Panoramic Viewpoint', category: 'Historical Monument', fee: 'Free (₹0)', description: 'Climb the famous fort hill for panoramic views of the Arabian Sea.' }
  ],
  kyoto: [
    { title: 'Fushimi Inari Shrine Torii Gates', category: 'Zen Sanctuary', fee: 'Free (₹0)', description: 'Walk through thousands of vermilion torii gates winding up Mount Inari.' },
    { title: 'Arashiyama Bamboo Grove Walk', category: 'Nature & Bamboo Forest', fee: 'Free (₹0)', description: 'Immerse yourself in towering bamboo stalks swaying under sunlight.' },
    { title: 'Kamo River Sunset Stroll', category: 'Scenic Riverbank', fee: 'Free (₹0)', description: 'Join locals for a peaceful evening along Kyoto’s iconic riverbank.' }
  ],
  amalfi: [
    { title: 'Path of the Gods Hiking Trail', category: 'Cliffside Hike', fee: 'Free (₹0)', description: 'Breathtaking coastal hiking trail connecting Nocelle and Bomerano.' },
    { title: 'Public Amalfi Marina Promenade', category: 'Scenic Harbor Walk', fee: 'Free (₹0)', description: 'Explore cliffside vistas, fishing boats, and Mediterranean sea breezes.' }
  ],
  default: [
    { title: 'City Heritage Walking Tour', category: 'Cultural Walk', fee: 'Free (₹0)', description: 'Self-guided tour of local architecture, public plazas, and historic landmarks.' },
    { title: 'Sunset Viewpoint Trail', category: 'Scenic Nature', fee: 'Free (₹0)', description: 'Panoramic overlook point open to the public daily with free entry.' }
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'goa' } = req.query || {};
  const key = String(destination).toLowerCase().trim();

  const attractions = FREE_ATTRACTIONS_DATA[key] || FREE_ATTRACTIONS_DATA.default;

  return res.status(200).json({
    success: true,
    destination: key,
    freeAttractionsCount: attractions.length,
    attractions,
    notice: 'All listed attractions are 100% free with no entry fees required.'
  });
}
