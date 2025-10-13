import { describe, it, expect } from 'vitest';
import { renderAsciiHistogram } from './ascii-histogram';

describe('renderAsciiHistogram', () => {
  it('renders histogram with bins', () => {
    const data = [1, 2, 2, 3, 3, 3, 4, 4, 5];
    const result = renderAsciiHistogram(data, 5, 10);

    expect(result).toContain('1.0-1.8');
    expect(result).toContain('│');
    expect(result).toMatch(/█+░*/);
  });

  it('handles single value', () => {
    const data = [42];
    const result = renderAsciiHistogram(data, 1);
    expect(result).toContain('42.0-42.0');
    expect(result).toContain('█ 1');
  });

  it('auto-calculates bin ranges', () => {
    const data = [0, 10, 20, 30, 40, 50];
    const result = renderAsciiHistogram(data, 5);

    expect(result).toMatch(/0\.0-10\.0/);
    expect(result).toMatch(/40\.0-50\.0/);
  });

  it('shows counts per bin', () => {
    const data = [1, 1, 2, 2, 2];
    const result = renderAsciiHistogram(data, 2);

    expect(result).toMatch(/2\s*$/m);
    expect(result).toMatch(/3\s*$/m);
  });

  it('handles empty data', () => {
    const result = renderAsciiHistogram([]);
    expect(result).toBe('');
  });

  it('scales bars relative to max count', () => {
    const data = [1, 2, 2, 2];
    const result = renderAsciiHistogram(data, 2, 10);

    const lines = result.split('\n');
    const bar1 = lines[0].match(/█+/)?.[0].length ?? 0;
    const bar2 = lines[1].match(/█+/)?.[0].length ?? 0;

    expect(bar2).toBeGreaterThan(bar1);
    expect(bar2).toBe(10);
  });
});
