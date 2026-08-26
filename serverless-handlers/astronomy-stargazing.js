/**
 * Dark Sky Stargazing, Moon Phase & Milky Way Core Intelligence API.
 * Computes lunar illumination, Bortle Dark Sky rating, and optimal astrophotography windows.
 */

const DARK_SKY_SANCTUARIES = {
  ladakh: {
    name: 'Pangong Tso & Hanle Dark Sky Reserve',
    destination: 'Ladakh, India',
    bortleScale: 'Class 1 (Pristine Dark Sky — World-Class Astronomical Reserve)',
    altitudeMeters: 4500,
    highlights: 'Home to Indian Astronomical Observatory; naked-eye Andromeda Galaxy & zodiacal light.',
    milkyWaySeason: 'May to September (Crystal dry alpine nights)'
  },
  aspen: {
    name: 'Maroon Bells Dark Sky Wilderness',
    destination: 'Aspen, Colorado, USA',
    bortleScale: 'Class 2 (Truly Dark Sky)',
    altitudeMeters: 2900,
    highlights: 'Reflections of the Milky Way across Maroon Lake and alpine granite peaks.',
    milkyWaySeason: 'June to October'
  },
  zermatt: {
    name: 'Gornergrat Alpine Observatory Plateau',
    destination: 'Zermatt, Switzerland',
    bortleScale: 'Class 2 (Dark Alpine Sky)',
    altitudeMeters: 3100,
    highlights: 'Sub-zero crystal mountain air with unobstructed Matterhorn backdrop.',
    milkyWaySeason: 'July to September'
  },
  reykjavik: {
    name: 'Thingvellir Dark Sky Park',
    destination: 'Iceland',
    bortleScale: 'Class 2 (Dark Sky Northern Reserve)',
    altitudeMeters: 120,
    highlights: 'Combined Aurora Borealis & deep space nebula stargazing.',
    milkyWaySeason: 'September to March'
  }
};

const METEOR_SHOWERS = [
  { name: 'Lyrids', peakMonth: 'April 21-22', ratePerHour: '15-20 meteors/hr' },
  { name: 'Perseids', peakMonth: 'August 12-13', ratePerHour: '80-100 meteors/hr (Bright fireballs)' },
  { name: 'Orionids', peakMonth: 'October 21-22', ratePerHour: '20-30 meteors/hr (Halley comet dust)' },
  { name: 'Geminids', peakMonth: 'December 13-14', ratePerHour: '120-150 meteors/hr (Year’s best shower)' }
];

function getMoonPhase() {
  const now = new Date();
  // Known new moon reference date: Jan 11, 2024 11:57 UTC
  const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.53058867 * 86400 * 1000;
  const diff = (now.getTime() - knownNewMoon) % synodicMonth;
  const phaseFraction = diff / synodicMonth;

  const illuminationPercent = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * phaseFraction))) * 100);

  let phaseName = 'New Moon';
  if (phaseFraction < 0.03 || phaseFraction > 0.97) phaseName = 'New Moon (Ideal for Stargazing)';
  else if (phaseFraction < 0.22) phaseName = 'Waxing Crescent';
  else if (phaseFraction < 0.28) phaseName = 'First Quarter';
  else if (phaseFraction < 0.47) phaseName = 'Waxing Gibbous';
  else if (phaseFraction < 0.53) phaseName = 'Full Moon (Bright Sky)';
  else if (phaseFraction < 0.72) phaseName = 'Waning Gibbous';
  else if (phaseFraction < 0.78) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent (Dark Skies Returning)';

  return {
    phaseName,
    illuminationPercent: `${illuminationPercent}%`,
    stargazingCondition: illuminationPercent < 25 ? 'Outstanding (Zero Lunar Interference)' : illuminationPercent < 60 ? 'Good' : 'Lunar Washout for Deep Nebulae'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sanctuary = 'ladakh' } = req.query || {};
  const key = String(sanctuary).toLowerCase().trim();

  let place = DARK_SKY_SANCTUARIES[key];
  if (!place) {
    for (const [k, v] of Object.entries(DARK_SKY_SANCTUARIES)) {
      if (key.includes(k) || v.destination.toLowerCase().includes(key)) {
        place = v;
        break;
      }
    }
  }
  if (!place) place = DARK_SKY_SANCTUARIES.ladakh;

  const moon = getMoonPhase();

  return res.status(200).json({
    success: true,
    darkSkySanctuary: place,
    currentLunarPhase: moon,
    milkyWayGalacticCore: {
      visibilitySeason: place.milkyWaySeason,
      optimalWindow: '00:30 – 04:00 (Moonset to Astronomical Dawn)',
      recommendedCameraSettings: 'Full-frame f/1.4 - f/2.8 lens, ISO 3200-6400, 15-20s exposure'
    },
    upcomingMajorMeteorShowers: METEOR_SHOWERS,
    astronomyEquipmentInclusions: [
      'High-aperture motorized Celestron/Sky-Watcher computerized telescopes at sanctuary',
      'Astronomer-guided private laser constellation walkthroughs',
      'Astrophotography heated viewing domes with warm spiced beverages'
    ]
  });
}
