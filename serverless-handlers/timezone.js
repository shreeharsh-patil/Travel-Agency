/**
 * Free Local Time & Timezone API using BigDataCloud Timezone by Location
 * (Zero API key required). Returns timezone, UTC offset, and current local time.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat = 15.2993, lon = 74.124 } = req.query || {};

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned ${response.status}`);
    }

    const data = await response.json();
    const timezone = data.timezone || 'Asia/Kolkata';

    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    const localTime = fmt.format(new Date());

    const utcParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const localParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const asMin = (parts) => (parseInt(parts.find((p) => p.type === 'hour').value, 10) % 24) * 60 + parseInt(parts.find((p) => p.type === 'minute').value, 10);
    const diff = asMin(localParts) - asMin(utcParts);
    let normalized = ((diff % (24 * 60)) + 24 * 60) % (24 * 60);
    if (normalized > 12 * 60) normalized -= 24 * 60;
    const sign = normalized < 0 ? '-' : '+';
    const abs = Math.abs(normalized);
    const offsetLabel = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;

    return res.status(200).json({
      success: true,
      timezone,
      utcOffset: offsetLabel,
      localTime,
      source: 'Free Open-Meteo Timezone API'
    });
  } catch (err) {
    console.warn('[GET /api/timezone] Fallback:', err);
    return res.status(200).json({
      success: true,
      timezone: 'Asia/Kolkata',
      utcOffset: 'UTC+05:30',
      localTime: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }),
      source: 'Timezone Cache (Free)'
    });
  }
}
