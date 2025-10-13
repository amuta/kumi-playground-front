import { describe, it, expect } from 'vitest';
import { generateRandomFields } from './random-fields';

describe('generateRandomFields', () => {
  it('generates normal distribution', () => {
    const config = {
      random_normal: {
        distribution: 'normal' as const,
        mean: 0,
        std: 1,
      },
    };

    const results = [];
    for (let i = 0; i < 1000; i++) {
      const fields = generateRandomFields(config);
      results.push(fields.random_normal);
    }

    const mean = results.reduce((a, b) => a + b) / results.length;
    expect(mean).toBeCloseTo(0, 0.1);
  });

  it('generates uniform distribution', () => {
    const config = {
      random_uniform: {
        distribution: 'uniform' as const,
        min: 10,
        max: 20,
      },
    };

    for (let i = 0; i < 100; i++) {
      const fields = generateRandomFields(config);
      expect(fields.random_uniform).toBeGreaterThanOrEqual(10);
      expect(fields.random_uniform).toBeLessThanOrEqual(20);
    }
  });

  it('handles multiple fields', () => {
    const config = {
      x: { distribution: 'normal' as const, mean: 0, std: 1 },
      y: { distribution: 'uniform' as const, min: 0, max: 1 },
    };

    const fields = generateRandomFields(config);
    expect(fields).toHaveProperty('x');
    expect(fields).toHaveProperty('y');
  });

  it('handles empty config', () => {
    const fields = generateRandomFields({});
    expect(fields).toEqual({});
  });
});
