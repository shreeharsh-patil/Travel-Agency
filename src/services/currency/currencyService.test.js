import { describe, it, expect, vi, afterEach } from 'vitest';
import { convertCurrency, formatINR } from './currencyService';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('formatINR', () => {
  it('formats using Indian numbering', () => {
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(500)).toBe('₹500');
  });
});

describe('convertCurrency', () => {
  it('short-circuits when currencies are identical', async () => {
    const result = await convertCurrency(1000, 'INR', 'inr');
    expect(result.convertedAmount).toBe(1000);
    expect(result.formatted).toBe('₹1,000');
  });

  it('uses the live API result when available', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ inrValue: 84000, formattedINR: '₹84,000', rate: 84 })
    })));

    const result = await convertCurrency(1000, 'USD', 'INR');
    expect(result.convertedAmount).toBe(84000);
    expect(result.formatted).toBe('₹84,000');
    expect(result.rate).toBe(84);
  });

  it('falls back to the static rate when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));

    const result = await convertCurrency(1000, 'USD', 'INR');
    expect(result.convertedAmount).toBe(84000);
    expect(result.formatted).toBe('₹84,000');
    expect(result.rate).toBe(84);
  });
});
