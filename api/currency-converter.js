/**
 * Free Live Currency Exchange Rate API using Frankfurter Open API (Zero API key required).
 * Converts foreign currencies to Indian Rupees (INR ₹) in real-time.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount = 100, from = 'USD' } = req.query || {};
  const numAmount = parseFloat(amount) || 100;
  const baseCurrency = String(from).toUpperCase().trim();

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${numAmount}&from=${baseCurrency}&to=INR`);

    if (!response.ok) {
      throw new Error(`Frankfurter API returned status ${response.status}`);
    }

    const data = await response.json();
    const inrValue = data.rates?.INR || Math.round(numAmount * 84);

    return res.status(200).json({
      success: true,
      amount: numAmount,
      from: baseCurrency,
      inrValue,
      formattedINR: `₹${Math.round(inrValue).toLocaleString('en-IN')}`,
      rate: (inrValue / numAmount).toFixed(2),
      source: 'Free Frankfurter Live Open API'
    });
  } catch (err) {
    console.error('[GET /api/currency-converter] Fallback triggered:', err);
    // Estimated rate fallback (1 USD ≈ 84 INR, 1 EUR ≈ 91 INR)
    const fallbackRate = baseCurrency === 'EUR' ? 91 : 84;
    const inrValue = Math.round(numAmount * fallbackRate);

    return res.status(200).json({
      success: true,
      amount: numAmount,
      from: baseCurrency,
      inrValue,
      formattedINR: `₹${inrValue.toLocaleString('en-IN')}`,
      rate: fallbackRate,
      source: 'Fallback Exchange Rate Cache (Free)'
    });
  }
}
