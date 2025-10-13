import { describe, it, expect } from 'vitest';
import { renderAsciiGrid } from './ascii-grid';

describe('renderAsciiGrid', () => {
  it('renders 2D grid with default chars', () => {
    const grid = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];

    const result = renderAsciiGrid(grid);

    expect(result).toBe('░█░\n███\n░█░');
  });

  it('renders with custom chars', () => {
    const grid = [[0, 1]];
    const result = renderAsciiGrid(grid, ' ', '●');
    expect(result).toBe(' ●');
  });

  it('handles empty grid', () => {
    expect(renderAsciiGrid([])).toBe('');
  });

  it('handles grayscale values (0-255)', () => {
    const grid = [[0, 64, 128, 192, 255]];
    const result = renderAsciiGrid(grid);

    expect(result).toContain('░');
    expect(result).toContain('▒');
    expect(result).toContain('█');
    expect(result).toHaveLength(5);
  });

  it('renders multi-row grid', () => {
    const grid = [
      [1, 0],
      [0, 1],
    ];
    const result = renderAsciiGrid(grid);
    expect(result).toBe('█░\n░█');
  });

  it('clamps values outside 0-255', () => {
    const grid = [[-10, 300]];
    const result = renderAsciiGrid(grid);
    expect(result).toBe(' █');
  });
});
