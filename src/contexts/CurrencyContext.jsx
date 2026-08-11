import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { parseINR } from '../utils/currency';

/**
 * Site-wide currency switcher.
 * All stored prices are in INR. The provider fetches live INR→X rates once
 * (via the free Frankfurter proxy) and re-formats every price on the fly.
 */

// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', locale: 'en-AE' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc', locale: 'de-CH' }
];

const STORAGE_KEY = 'horizon_currency';
const FALLBACK_RATES = {
  USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SGD: 0.016,
  JPY: 1.83, AUD: 0.018, CAD: 0.016, CHF: 0.0105
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) return saved;
    } catch { /* ignore */ }
    return 'INR';
  });
  const [rates, setRates] = useState({});

  // Fetch live INR→X rates once on mount (best effort; falls back to statics).
  useEffect(() => {
    const targets = CURRENCIES.filter((c) => c.code !== 'INR').map((c) => c.code).join(',');
    let cancelled = false;
    fetch(`/api/currency-converter?amount=1&from=INR&to=${targets}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('rates unavailable'))))
      .then((data) => {
        if (!cancelled && data.rates) setRates(data.rates);
      })
      .catch(() => {
        if (!cancelled) setRates({});
      });
    return () => { cancelled = true; };
  }, []);

  const changeCurrency = useCallback((code) => {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    setCurrency(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch { /* ignore */ }
  }, []);

  const formatAmount = useCallback(
    (amount) => {
      const inr = parseINR(amount);
      const meta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
      const rate = currency === 'INR' ? 1 : rates[currency] || FALLBACK_RATES[currency] || 1;
      const value = inr * rate;
      try {
        return new Intl.NumberFormat(meta.locale, {
          style: 'currency',
          currency: meta.code,
          maximumFractionDigits: 0
        }).format(value);
      } catch {
        return `${meta.symbol}${Math.round(value).toLocaleString('en-US')}`;
      }
    },
    [currency, rates]
  );

  const value = useMemo(
    () => ({ currency, changeCurrency, formatAmount, currencies: CURRENCIES }),
    [currency, changeCurrency, formatAmount]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
