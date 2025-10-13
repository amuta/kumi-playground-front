import { describe, it, expect } from 'vitest';
import { renderAsciiTable } from './ascii-table';

describe('renderAsciiTable', () => {
  it('renders simple table', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const result = renderAsciiTable(data, ['name', 'age']);

    expect(result).toContain('name');
    expect(result).toContain('age');
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
    expect(result).toContain('│');
    expect(result).toContain('─');
  });

  it('handles empty data', () => {
    expect(renderAsciiTable([], ['col'])).toBe('');
  });

  it('handles empty columns', () => {
    expect(renderAsciiTable([{ a: 1 }], [])).toBe('');
  });

  it('formats numbers with decimals', () => {
    const data = [{ value: 3.14159 }];
    const result = renderAsciiTable(data, ['value']);

    expect(result).toContain('3.14');
  });

  it('aligns columns', () => {
    const data = [
      { a: 'short', b: 1 },
      { a: 'longer text', b: 999 },
    ];
    const result = renderAsciiTable(data, ['a', 'b']);

    expect(result).toContain('longer text');
    expect(result).toContain('999');
    expect(result).toMatch(/│.*│/);
  });

  it('handles missing values', () => {
    const data = [{ a: 1 }, { a: 2, b: 'x' }];
    const result = renderAsciiTable(data, ['a', 'b']);

    expect(result).toContain('│');
    expect(result).not.toContain('undefined');
  });
});
