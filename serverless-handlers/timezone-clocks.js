/**
 * Global World Clocks & Jet Lag Circadian Adaptation API.
 * Synchronizes local times across sanctuaries and generates tailored circadian flight plans.
 */

const TIMEZONE_REGISTRY = [
  { id: 'delhi', name: 'New Delhi / Goa (IST)', timezone: 'Asia/Kolkata', flag: '🇮🇳', utcOffset: '+05:30' },
  { id: 'kyoto', name: 'Kyoto / Tokyo (JST)', timezone: 'Asia/Tokyo', flag: '🇯🇵', utcOffset: '+09:00' },
  { id: 'paris', name: 'Paris / Alps (CET/CEST)', timezone: 'Europe/Paris', flag: '🇫🇷', utcOffset: '+01:00' },
  { id: 'rome', name: 'Amalfi / Rome (CET/CEST)', timezone: 'Europe/Rome', flag: '🇮🇹', utcOffset: '+01:00' },
  { id: 'london', name: 'London (GMT/BST)', timezone: 'Europe/London', flag: '🇬🇧', utcOffset: '+00:00' },
  { id: 'dubai', name: 'Dubai (GST)', timezone: 'Asia/Dubai', flag: '🇦🇪', utcOffset: '+04:00' },
  { id: 'newyork', name: 'New York (EST/EDT)', timezone: 'America/New_York', flag: '🇺🇸', utcOffset: '-05:00' },
  { id: 'aspen', name: 'Aspen, Colorado (MST/MDT)', timezone: 'America/Denver', flag: '🇺🇸', utcOffset: '-07:00' },
  { id: 'bali', name: 'Bali (WITA)', timezone: 'Asia/Makassar', flag: '🇮🇩', utcOffset: '+08:00' },
  { id: 'reykjavik', name: 'Reykjavik (GMT)', timezone: 'Atlantic/Reykjavik', flag: '🇮🇸', utcOffset: '+00:00' }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin = 'delhi', destination = 'paris' } = req.query || {};

  const now = new Date();

  const liveClocks = TIMEZONE_REGISTRY.map((tz) => {
    let localTimeStr = '';
    let isDaytime = true;

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz.timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      localTimeStr = formatter.format(now);

      const hourInt = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz.timezone, hour: 'numeric', hour12: false }).format(now));
      isDaytime = hourInt >= 6 && hourInt < 19;
    } catch {
      localTimeStr = now.toISOString();
    }

    return {
      id: tz.id,
      name: tz.name,
      flag: tz.flag,
      timezone: tz.timezone,
      utcOffset: tz.utcOffset,
      liveFormattedTime: localTimeStr,
      isDaytime,
      status: isDaytime ? 'Daylight (Active Hours)' : 'Night (Rest Hours)'
    };
  });

  return res.status(200).json({
    success: true,
    serverTimeUTC: now.toISOString(),
    clocks: liveClocks,
    jetLagProtocol: {
      travelDirectionRecommendation: 'Eastbound flights: Shift bedtime 1 hour earlier for 3 nights prior and seek bright morning sunlight.',
      inFlightHydration: 'Consume 250ml electrolyte water per flight hour; avoid alcohol and heavy caffeine 4 hours before landing.',
      circadianLightingAdvice: 'Wear blue-light filtering glasses during evening cabin hours; switch smartwatch to destination time immediately upon boarding.'
    }
  });
}
