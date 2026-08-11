/**
 * Currency Service
 * Supports Indian Rupee (INR ₹) formatting by default according to Indian numbering standards (₹1,499, ₹12,500, ₹1,25,000, ₹2,50,000).
 * Connects to live free Frankfurter Open API for real-time currency conversion.
 */

export function formatINR(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    const formatted = Math.round(num).toLocaleString('en-IN');
    return `₹${formatted}`;
  }
}

export async function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'INR') {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return {
      amount,
      convertedAmount: amount,
      formatted: formatINR(amount)
    };
  }

  try {
    const res = await fetch(`/api/currency-converter?amount=${amount}&from=${fromCurrency}`);
    if (res.ok) {
      const data = await res.json();
      return {
        amount,
        convertedAmount: data.inrValue,
        formatted: data.formattedINR,
        rate: data.rate
      };
    }
  } catch (err) {
    console.warn('[CurrencyService] Live conversion fallback:', err);
  }

  // Fallback conversion (1 USD ≈ 84 INR)
  const rate = fromCurrency.toUpperCase() === 'EUR' ? 91 : 84;
  const inrVal = Math.round(amount * rate);
  return {
    amount,
    convertedAmount: inrVal,
    formatted: formatINR(inrVal),
    rate
  };
}

export const CurrencyService = {
  formatINR,
  convertCurrency
};
