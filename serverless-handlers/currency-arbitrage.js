/**
 * Luxury Purchasing Power, Currency Arbitrage & Smart Payment Guide API.
 * Computes comparative value index, zero-forex credit card usage advice, and cash vs card tips.
 */

const CURRENCY_INTELLIGENCE = {
  inr: {
    baseCode: 'INR',
    country: 'India',
    purchasingPowerIndex: 3.2,
    luxuryValueRating: 'Exceptional Luxury Value (5-Star Palaces at high purchasing efficiency)',
    cashVsCard: 'UPI QR Codes & Cards accepted universally in 98% of luxury establishments.',
    recommendedPaymentMode: 'Indian Rupay / Visa Infinite / UPI for instant contactless payments.',
    tippingCurrency: 'Indian Rupee (INR cash)',
    atmAdvice: 'SBI, HDFC, ICICI ATMs charge zero withdrawal fees for domestic and major international cards.'
  },
  jpy: {
    baseCode: 'JPY',
    country: 'Japan',
    purchasingPowerIndex: 2.8,
    luxuryValueRating: 'High Purchasing Power Advantage (Favorable exchange rates for luxury shopping & dining)',
    cashVsCard: 'Cards accepted at luxury hotels and department stores; physical yen cash essential for historic shrines and small ryokans.',
    recommendedPaymentMode: 'Zero-Forex Markup Credit Cards (Visa/Mastercard) + IC Transit Card (Suica/Pasmo) on Apple/Google Wallet.',
    tippingCurrency: 'Strictly No Tipping (Gratuities included).',
    atmAdvice: '7-Eleven (Seven Bank) and Japan Post ATMs accept international cards 24/7 with zero local surcharge.'
  },
  eur: {
    baseCode: 'EUR',
    country: 'Italy / France (Eurozone)',
    purchasingPowerIndex: 1.2,
    luxuryValueRating: 'Standard European Luxury Pricing',
    cashVsCard: 'Contactless chip & PIN cards accepted almost everywhere. Small cash notes (€5, €10, €20) useful for beach clubs and taxis.',
    recommendedPaymentMode: 'Zero-forex foreign travel card. Always choose "Pay in EUR" (never DCC local currency conversion).',
    tippingCurrency: 'Euro (€ cash notes given directly).',
    atmAdvice: 'Use official bank ATMs (Intesa Sanpaolo, BNP Paribas). Avoid standalone yellow Euronet ATMs which levy heavy markup fees.'
  },
  usd: {
    baseCode: 'USD',
    country: 'United States',
    purchasingPowerIndex: 1.0,
    luxuryValueRating: 'Benchmark Global Rate',
    cashVsCard: '100% cashless friendly (Apple Pay, Google Pay, contactless cards everywhere).',
    recommendedPaymentMode: 'Premium travel credit cards with lounge access & trip delay protections.',
    tippingCurrency: 'Credit card tip entry or $5-$20 cash notes.',
    atmAdvice: 'Chase, Bank of America, Wells Fargo branches.'
  },
  idr: {
    baseCode: 'IDR',
    country: 'Indonesia (Bali)',
    purchasingPowerIndex: 3.6,
    luxuryValueRating: 'Ultra-High Purchasing Power for Private Villas & Spa Treatments',
    cashVsCard: 'Cards accepted at major villas and beach clubs (often with a 2-3% card surcharge). Cash IDR required for local drivers and temples.',
    recommendedPaymentMode: 'Zero-forex debit/credit card + local IDR cash withdrawn from verified bank ATMs.',
    tippingCurrency: 'Indonesian Rupiah (IDR 50,000 / 100,000 notes).',
    atmAdvice: 'BCA or Mandiri bank ATMs located inside bank branches (avoid isolated standalone kiosks).'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currency = 'jpy' } = req.query || {};
  const code = String(currency).toLowerCase().trim();

  const matched = CURRENCY_INTELLIGENCE[code] || CURRENCY_INTELLIGENCE.jpy;

  return res.status(200).json({
    success: true,
    currencyCode: matched.baseCode,
    country: matched.country,
    arbitrageIndex: {
      relativePurchasingPower: matched.purchasingPowerIndex,
      luxuryValueAssessment: matched.luxuryValueRating
    },
    paymentGuide: {
      cardAcceptanceSummary: matched.cashVsCard,
      recommendedPaymentMethod: matched.recommendedPaymentMode,
      tippingPractice: matched.tippingCurrency,
      atmSecurityAndFeeAdvice: matched.atmAdvice
    },
    goldenTravelRules: [
      'Always select "Charge in Local Currency" (Never let overseas card terminals do Dynamic Currency Conversion)',
      'Use a credit card with 0% Foreign Exchange Markup fee to save 3.5% - 5.0% on every transaction',
      'Notify your card issuer of international luxury itineraries in advance to avoid fraud triggers'
    ]
  });
}
