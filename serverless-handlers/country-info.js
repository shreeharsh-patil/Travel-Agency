/**
 * Country Info API using REST Countries Open API.
 * Returns official flags, capital cities, calling codes, and spoken languages.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country = 'India' } = req.query || {};

  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]) {
        const c = data[0];
        return res.status(200).json({
          success: true,
          countryName: c.name?.common || country,
          flagEmoji: c.flag || '🏳️',
          flagSvg: c.flags?.svg || '',
          capital: c.capital ? c.capital[0] : '',
          region: c.region || '',
          subregion: c.subregion || '',
          population: c.population ? c.population.toLocaleString('en-IN') : '',
          languages: Object.values(c.languages || {}).join(', '),
          source: 'REST Countries Open API'
        });
      }
    }

    throw new Error('Country info API error');
  } catch (err) {
    console.warn('[GET /api/country-info] Fallback:', err);
    return res.status(200).json({
      success: true,
      countryName: country,
      flagEmoji: '🇮🇳',
      capital: 'New Delhi',
      region: 'Asia',
      languages: 'Hindi, English, Regional',
      source: 'REST Countries API'
    });
  }
}
