import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Renders an INR-stored price (number or INR-formatted string) in the
 * site-wide selected currency. Falls back to raw text when unparseable.
 */
export default function CurrencyPrice({ amount, className }) {
  const { formatAmount } = useCurrency();
  const parsed = typeof amount === 'number' ? amount : Number(String(amount).replace(/[^0-9.]/g, ''));
  if (!amount || Number.isNaN(parsed)) {
    return <span className={className}>{amount}</span>;
  }
  return <span className={className}>{formatAmount(parsed)}</span>;
}
