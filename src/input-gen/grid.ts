import { seededRng } from './rng';

export function makeBinaryGrid(
  rows: number,
  cols: number,
  density = 0.18,     // probability of 1
  seed?: number
): number[][] {
  const rnd = seed != null ? seededRng(seed) : Math.random;
  const g: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) g[r][c] = rnd() < density ? 1 : 0;
  }
  return g;
}
