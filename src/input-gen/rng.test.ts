import { describe, it, expect } from 'vitest';
import { boxMullerRandom, uniformRandom, seededRng } from './rng';

describe('boxMullerRandom', () => {
  it('generates values around mean', () => {
    const results = [];
    for (let i = 0; i < 1000; i++) {
      results.push(boxMullerRandom(0, 1));
    }

    const mean = results.reduce((a, b) => a + b) / results.length;
    expect(mean).toBeCloseTo(0, 0.1);
  });

  it('respects custom mean and std', () => {
    const results = [];
    for (let i = 0; i < 1000; i++) {
      results.push(boxMullerRandom(10, 2));
    }

    const mean = results.reduce((a, b) => a + b) / results.length;
    expect(mean).toBeCloseTo(10, 0.5);
  });
});

describe('uniformRandom', () => {
  it('generates values in range', () => {
    for (let i = 0; i < 100; i++) {
      const val = uniformRandom(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
    }
  });

  it('handles negative range', () => {
    const val = uniformRandom(-10, -5);
    expect(val).toBeGreaterThanOrEqual(-10);
    expect(val).toBeLessThanOrEqual(-5);
  });
});

describe('seededRng', () => {
  it('produces deterministic sequence', () => {
    const rng1 = seededRng(42);
    const seq1 = [rng1(), rng1(), rng1()];

    const rng2 = seededRng(42);
    const seq2 = [rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = seededRng(42);
    const rng2 = seededRng(43);

    expect(rng1()).not.toBe(rng2());
  });

  it('generates values in [0, 1)', () => {
    const rng = seededRng(123);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});
