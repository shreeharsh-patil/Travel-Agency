/**
 * Formats numbers into Indian Rupees (INR) format with the ₹ symbol.
 * Example:
 * formatINR(1499) => "₹1,499"
 * formatINR(12500) => "₹12,500"
 * formatINR(125000) => "₹1,25,000"
 * formatINR(1250000) => "₹12,500,000" or Indian standard "₹12,50,000"
 */

export function formatINR(amount) {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  
  let num = amount;
  if (typeof amount === 'string') {
    // Extract the first numeric value (handles symbols, commas and words).
    const match = String(amount).replace(/,/g, '').match(/\d+(\.\d+)?/);
    if (!match) return amount;
    num = parseFloat(match[0]);
    if (isNaN(num)) return amount;
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    // Fallback if Intl fails
    const formatted = Math.round(num).toLocaleString('en-IN');
    return `₹${formatted}`;
  }
}


/**
 * Returns numeric value from an INR price string or number.
 */
export function parseINR(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const num = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}
