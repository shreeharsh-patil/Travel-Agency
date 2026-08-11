import { describe, it, expect } from 'vitest';
import { formatINR, parseINR } from './currency';

describe('formatINR', () => {
  it('formats plain numbers with Indian grouping', () => {
    expect(formatINR(1499)).toBe('₹1,499');
    expect(formatINR(12500)).toBe('₹12,500');
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(1250000)).toBe('₹12,50,000');
  });

  it('handles strings with currency symbols and commas', () => {
    expect(formatINR('₹35,000')).toBe('₹35,000');
    expect(formatINR('Rs. 1,25,000')).toBe('₹1,25,000');
  });

  it('falls back to ₹0 for empty/undefined values', () => {
    expect(formatINR(undefined)).toBe('₹0');
    expect(formatINR(null)).toBe('₹0');
    expect(formatINR('')).toBe('₹0');
  });

  it('returns the original string when it contains no digits', () => {
    expect(formatINR('On Request')).toBe('On Request');
  });

  it('rounds decimals to whole rupees', () => {
    expect(formatINR(1499.6)).toBe('₹1,500');
  });
});

describe('parseINR', () => {
  it('extracts a number from an INR string', () => {
    expect(parseINR('₹35,000')).toBe(35000);
    expect(parseINR('₹1,25,000')).toBe(125000);
  });

  it('passes through plain numbers', () => {
    expect(parseINR(42000)).toBe(42000);
  });

  it('returns 0 for unparseable input', () => {
    expect(parseINR('')).toBe(0);
    expect(parseINR(null)).toBe(0);
    expect(parseINR('nope')).toBe(0);
  });
});
