import { describe, it, expect } from 'vitest';
import { calculateStats } from './calculate-stats';

describe('calculateStats', () => {
  it('calculates mean correctly', () => {
    const data = [1, 2, 3, 4, 5];
    const stats = calculateStats(data);
    expect(stats.mean).toBe(3);
  });

  it('calculates median for odd length', () => {
    const data = [1, 3, 5];
    const stats = calculateStats(data);
    expect(stats.median).toBe(3);
  });

  it('calculates median for even length', () => {
    const data = [1, 2, 3, 4];
    const stats = calculateStats(data);
    expect(stats.median).toBe(3);
  });

  it('calculates std dev', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = calculateStats(data);
    expect(stats.std).toBeCloseTo(2.0, 0);
  });

  it('calculates min and max', () => {
    const data = [5, 2, 9, 1, 7];
    const stats = calculateStats(data);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(9);
  });

  it('calculates p95', () => {
    const data = Array.from({ length: 100 }, (_, i) => i);
    const stats = calculateStats(data);
    expect(stats.p95).toBe(95);
  });

  it('throws on empty data', () => {
    expect(() => calculateStats([])).toThrow('empty data');
  });

  it('handles single value', () => {
    const stats = calculateStats([42]);
    expect(stats.mean).toBe(42);
    expect(stats.median).toBe(42);
    expect(stats.std).toBe(0);
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
  });
});
