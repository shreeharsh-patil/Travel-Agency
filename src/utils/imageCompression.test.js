import { describe, it, expect } from 'vitest';
import { estimateBytes } from './imageCompression';

describe('estimateBytes', () => {
  it('estimates decoded size of a base64 data URL', () => {
    // "SGVsbG8=" = "Hello" (5 bytes), padding included in the math.
    expect(estimateBytes('data:image/jpeg;base64,SGVsbG8=')).toBe(5);
  });

  it('returns 0 for an empty payload', () => {
    expect(estimateBytes('data:image/jpeg;base64,')).toBe(0);
  });

  it('handles a URL without a prefix', () => {
    expect(estimateBytes('SGVsbG8=')).toBe(5);
  });

  it('is monotonic with longer base64 input', () => {
    const small = estimateBytes('data:image/jpeg;base64,AAAA');
    const large = estimateBytes('data:image/jpeg;base64,AAAA' + 'AA=='.repeat(50));
    expect(large).toBeGreaterThan(small);
  });
});
