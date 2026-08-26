/**
 * Free Cultural Festivals & Events Calendar API (Zero API Key Required).
 * Returns world-renowned seasonal celebrations, music carnivals, and cultural festivals.
 */

const FESTIVAL_CALENDAR = {
  goa: [
    { name: 'Goa Carnival', month: 'February', description: 'Vibrant four-day Portuguese-origin carnival with colorful street parades, floats, and music.', type: 'Cultural Carnival' },
    { name: 'Shigmo Festival', month: 'March', description: 'Goan traditional spring festival with folk dances, mythological floats, and street processions.', type: 'Traditional' },
    { name: 'Sao Joao Water Festival', month: 'June', description: 'Monsoon celebration where revelers leap into village wells wearing floral crowns (kopels).', type: 'Monsoon Tradition' },
    { name: 'Sunburn Music Festival', month: 'December', description: 'Asia’s premier electronic dance music festival on the shores of Vagator Beach.', type: 'Music & Arts' }
  ],
  kyoto: [
    { name: 'Cherry Blossom Season (Hanami)', month: 'Late March - Mid April', description: 'Iconic sakura blooming across Maruyama Park, Philosopher’s Path, and Arashiyama.', type: 'Seasonal Nature' },
    { name: 'Aoi Matsuri (Hollyhock Festival)', month: 'May 15', description: 'One of Kyoto’s three grand festivals, featuring an elegant Heian-period imperial procession.', type: 'Ancient Heritage' },
    { name: 'Gion Matsuri', month: 'Entire July', description: 'Kyoto’s most famous festival with towering 25-meter Yamaboko floats and evening street festivities.', type: 'Grand Festival' },
    { name: 'Autumn Foliage (Momiji)', month: 'November - Early December', description: 'Fiery crimson maples illuminated at night across Kiyomizu-dera and Eikan-do temples.', type: 'Seasonal Nature' }
  ],
  'amalfi-coast': [
    { name: 'Amalfi Historical Regatta', month: 'June (Annual)', description: 'Traditional rowing race between the four ancient Italian maritime republics.', type: 'Maritime Heritage' },
    { name: 'Ravello Music Festival', month: 'July - August', description: 'World-class orchestral symphony concerts suspended over cliffside gardens at Villa Rufolo.', type: 'Classical Music' },
    { name: 'Sfusato Lemon Harvest Fair', month: 'July', description: 'Gastronomy celebrations honoring the world-famous IGP Amalfi lemons and limoncello.', type: 'Gastronomy' }
  ],
  paris: [
    { name: 'Fête de la Musique', month: 'June 21', description: 'Free live musical performances of every genre across every public square and bridge in Paris.', type: 'Music' },
    { name: 'Bastille Day & Fireworks', month: 'July 14', description: 'National celebration culminating in military parade on Champs-Élysées and Eiffel Tower fireworks.', type: 'National Day' },
    { name: 'Nuit Blanche (White Night)', month: 'June', description: 'All-night contemporary art installations and open-door museums across the city.', type: 'Contemporary Arts' }
  ],
  zermatt: [
    { name: 'Zermatt Unplugged', month: 'April', description: 'Acoustic music festival hosting international headliners with the Matterhorn as backdrop.', type: 'Acoustic Music' },
    { name: 'Matterhorn Ultraks', month: 'August', description: 'Spectacular alpine trail running race traversing glaciers and panoramic summits.', type: 'Alpine Sports' }
  ],
  bali: [
    { name: 'Nyepi (Day of Silence)', month: 'March (Saka New Year)', description: '24 hours of complete island-wide silence preceded by the dramatic Ogoh-Ogoh demon parades.', type: 'Sacred Tradition' },
    { name: 'Bali Arts Festival', month: 'June - July', description: 'Month-long celebration of Balinese gamelan, sacred mask dances, and royal arts in Denpasar.', type: 'Cultural Arts' }
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'goa' } = req.query || {};
  const clean = String(destination).toLowerCase().trim();

  let list = FESTIVAL_CALENDAR[clean];
  if (!list) {
    for (const [key, val] of Object.entries(FESTIVAL_CALENDAR)) {
      if (clean.includes(key)) {
        list = val;
        break;
      }
    }
  }

  if (!list) {
    list = [
      { name: 'Annual Cultural Heritage Celebration', month: 'Spring & Autumn', description: 'Local folk dances, seasonal food fairs, and community celebrations.', type: 'Cultural' },
      { name: 'Seasonal Arts & Music Evenings', month: 'Summer Months', description: 'Outdoor open-air concerts, theater performances, and artisan night markets.', type: 'Arts & Music' }
    ];
  }

  return res.status(200).json({
    success: true,
    destination: destination,
    count: list.length,
    festivals: list,
    source: 'Free Cultural Festivals & Seasonal Calendar Engine'
  });
}
