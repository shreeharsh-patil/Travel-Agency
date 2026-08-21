/**
 * Free Live Currency Exchange Rate API using Frankfurter Open API (Zero API key required).
 * - `GET /api/currency-converter?amount=100&from=USD`            → INR value (legacy, backward compatible)
 * - `GET /api/currency-converter?amount=1&from=INR&to=USD,EUR,...` → live rates map for the site-wide currency switcher
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount = 100, from = 'USD', to = 'INR' } = req.query || {};
  const numAmount = parseFloat(amount) || 100;
  const baseCurrency = String(from).toUpperCase().trim();
  const targets = String(to)
    .toUpperCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${numAmount}&from=${baseCurrency}&to=${targets.join(',')}`
    );

    if (!response.ok) {
      throw new Error(`Frankfurter API returned status ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates || {};

    const inrValue = rates.INR ?? null;

    return res.status(200).json({
      success: true,
      amount: numAmount,
      from: baseCurrency,
      inrValue,
      formattedINR: inrValue === null ? null : `₹${Math.round(inrValue).toLocaleString('en-IN')}`,
      rate: inrValue === null ? null : (inrValue / numAmount).toFixed(6),
      rates,
      source: 'Frankfurter',
      lastUpdated: data.date || null
    });
  } catch (err) {
    console.error('[currency] Frankfurter unavailable:', err.message);
    return res.status(503).json({ available: false, error: 'Currency rates currently unavailable', source: 'Frankfurter' });
  }
}
