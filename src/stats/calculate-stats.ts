import type { Statistics } from '../types';

export function calculateStats(data: number[]): Statistics {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics for empty data');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = data.reduce((sum, x) => sum + x, 0) / n;

  const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  const median = sorted[Math.floor(n / 2)];

  const min = sorted[0];
  const max = sorted[n - 1];

  const p95 = sorted[Math.floor(n * 0.95)];

  return { mean, median, std, min, max, p95 };
}
