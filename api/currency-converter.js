/**
 * Free Live Currency Exchange Rate API using Frankfurter Open API (Zero API key required).
 * - `GET /api/currency-converter?amount=100&from=USD`            → INR value (legacy, backward compatible)
 * - `GET /api/currency-converter?amount=1&from=INR&to=USD,EUR,...` → live rates map for the site-wide currency switcher
 */

const FALLBACK_INR_RATES = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
  JPY: 1.83,
  AUD: 0.018,
  CAD: 0.016,
  CHF: 0.0105
};

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

    // Backward-compatible single-INR response shape.
    const inrValue = rates.INR || Math.round(numAmount * 84);

    return res.status(200).json({
      success: true,
      amount: numAmount,
      from: baseCurrency,
      inrValue,
      formattedINR: `₹${Math.round(inrValue).toLocaleString('en-IN')}`,
      rate: (inrValue / numAmount).toFixed(2),
      rates,
      source: 'Free Frankfurter Live Open API'
    });
  } catch (err) {
    console.error('[GET /api/currency-converter] Fallback triggered:', err);
    // Estimated static rate fallback so the UI never breaks.
    const fallbackRates = {};
    targets.forEach((t) => {
      if (t === 'INR') fallbackRates.INR = numAmount;
      else if (baseCurrency === 'INR') fallbackRates[t] = numAmount * (FALLBACK_INR_RATES[t] || 0.012);
      else fallbackRates[t] = numAmount * (t === 'EUR' ? 91 : 84) / (baseCurrency === 'EUR' ? 91 : 84);
    });
    const inrValue = fallbackRates.INR || Math.round(numAmount * 84);

    return res.status(200).json({
      success: true,
      amount: numAmount,
      from: baseCurrency,
      inrValue,
      formattedINR: `₹${inrValue.toLocaleString('en-IN')}`,
      rate: (inrValue / numAmount).toFixed(2),
      rates: fallbackRates,
      source: 'Fallback Exchange Rate Cache (Free)'
    });
  }
}
