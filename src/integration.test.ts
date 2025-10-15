import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadArtifactModule,
  executeOutput,
  runAllOutputs,
  runAllOutputsFromUrl,
} from './execution/artifact-runner';

describe('executeOutput / runAllOutputs (pure helpers)', () => {
  const mockModule = {
    _total: (input: any) => input.price * input.qty,
    _doubled: (input: any) => input.x * 2,
    _flag: (_: any) => true,
  };

  it('executes a single output', () => {
    const result = executeOutput(mockModule, 'total', { price: 10, qty: 3 });
    expect(result).toBe(30);
  });

  it('errors on missing output', () => {
    expect(() => executeOutput(mockModule, 'missing', {})).toThrow(/not found/);
  });

  it('executes value and trait outputs', () => {
    const outputSchema = {
      total:   { kind: 'value' as const, type: 'float' as const,   axes: [] },
      doubled: { kind: 'value' as const, type: 'integer' as const, axes: [] },
      flag:    { kind: 'trait' as const, type: 'boolean' as const, axes: [] },
    };
    const results = runAllOutputs(mockModule, { price: 2, qty: 5, x: 7 }, outputSchema);
    expect(results).toEqual({ total: 10, doubled: 14, flag: true });
  });
});

describe('URL-based evaluation', () => {
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    (global.fetch as any) = vi.fn();
  });

  afterEach(() => {
    (global.fetch as any) = originalFetch;
  });

  it('loads module from artifact URL and executes outputs (including traits)', async () => {
    const js = `
      export function _sum(i){ return i.a + i.b; }
      export function _trait_example(){ return true; }
    `;
    (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => js });

    const schema = {
      sum: { kind: 'value' as const, type: 'integer' as const, axes: [] },
      trait_example: { kind: 'trait' as const, type: 'boolean' as const, axes: [] },
    };

    const outputs = await runAllOutputsFromUrl('http://x/artifacts/abc.js', { a: 3, b: 4 }, schema);
    expect(outputs).toEqual({ sum: 7, trait_example: true });
  });

  it('propagates HTTP errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(loadArtifactModule('http://x/missing.js'))
      .rejects.toThrow(/HTTP 404: Not Found/);
  });
});
