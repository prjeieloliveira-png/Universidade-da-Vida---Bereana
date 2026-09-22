import { describe, it, expect } from 'vitest';
import { formatCentsToBRL, parseBRLToCents } from './currency';

describe('Currency Utilities (Cents Handling)', () => {
  it('formats cents to Brazilian Real string properly', () => {
    // 10000 cents = R$ 100,00
    expect(formatCentsToBRL(10000).replace(/\s/g, ' ')).toBe('R$ 100,00');
    expect(formatCentsToBRL(0).replace(/\s/g, ' ')).toBe('R$ 0,00');
    expect(formatCentsToBRL(48550).replace(/\s/g, ' ')).toBe('R$ 485,50');
    expect(formatCentsToBRL(null).replace(/\s/g, ' ')).toBe('R$ 0,00');
    expect(formatCentsToBRL(undefined).replace(/\s/g, ' ')).toBe('R$ 0,00');
  });

  it('parses formatted BRL string to integer cents', () => {
    expect(parseBRLToCents('R$ 100,00')).toBe(10000);
    expect(parseBRLToCents('485,50')).toBe(48550);
    expect(parseBRLToCents('1.250,75')).toBe(125075);
    expect(parseBRLToCents('')).toBe(0);
  });
});
