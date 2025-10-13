import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compileKumiSchema } from './api/compile';
import { evalCompiledModule, executeOutput, executeAllOutputs } from './execution/eval-module';
import type { CompileResult } from './types';

describe('Integration: compile + execute flow', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('compiles and executes simple arithmetic schema', async () => {
    const mockResult: CompileResult = {
      js_src: `
        export function _sum(input) {
          return input.x + input.y;
        }
        export function _product(input) {
          return input.x * input.y;
        }
      `,
      ruby_src: '',
      lir: '',
      schema_hash: 'test123',
      input_form_schema: {
        x: { type: 'integer' },
        y: { type: 'integer' }
      },
      output_schema: {
        sum: { kind: 'value', type: 'integer', axes: [] },
        product: { kind: 'value', type: 'integer', axes: [] }
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const compiled = await compileKumiSchema('schema do\nend');
    const module = await evalCompiledModule(compiled.js_src);
    const results = executeAllOutputs(module, { x: 3, y: 4 }, compiled.output_schema);

    expect(results).toEqual({
      sum: 7,
      product: 12
    });
  });

  it('compiles and executes single output', async () => {
    const mockResult: CompileResult = {
      js_src: `
        export function _total(input) {
          return input.price * input.quantity;
        }
      `,
      ruby_src: '',
      lir: '',
      schema_hash: 'test456',
      input_form_schema: {
        price: { type: 'float' },
        quantity: { type: 'integer' }
      },
      output_schema: {
        total: { kind: 'value', type: 'float', axes: [] }
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const compiled = await compileKumiSchema('schema do\nend');
    const module = await evalCompiledModule(compiled.js_src);
    const result = executeOutput(module, 'total', { price: 10.5, quantity: 3 });

    expect(result).toBeCloseTo(31.5);
  });

  it('handles compilation errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ['Undefined variable: foo'] })
    });

    await expect(compileKumiSchema('schema do\nend'))
      .rejects.toThrow('Undefined variable: foo');
  });

  it('handles execution errors from compiled code', async () => {
    const mockResult: CompileResult = {
      js_src: `
        export function _divide(input) {
          if (input.b === 0) throw new Error('Division by zero');
          return input.a / input.b;
        }
      `,
      ruby_src: '',
      lir: '',
      schema_hash: 'test789',
      input_form_schema: {
        a: { type: 'integer' },
        b: { type: 'integer' }
      },
      output_schema: {
        divide: { kind: 'value', type: 'float', axes: [] }
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const compiled = await compileKumiSchema('schema do\nend');
    const module = await evalCompiledModule(compiled.js_src);

    expect(() => executeOutput(module, 'divide', { a: 10, b: 0 }))
      .toThrow(/Division by zero/);
  });

  it('filters trait outputs in executeAllOutputs', async () => {
    const mockResult: CompileResult = {
      js_src: `
        export function _score(input) {
          return input.points;
        }
        export function _rank(input) {
          return 'gold';
        }
      `,
      ruby_src: '',
      lir: '',
      schema_hash: 'test999',
      input_form_schema: {
        points: { type: 'integer' }
      },
      output_schema: {
        score: { kind: 'value', type: 'integer', axes: [] },
        rank: { kind: 'trait', type: 'string', axes: [] }
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const compiled = await compileKumiSchema('schema do\nend');
    const module = await evalCompiledModule(compiled.js_src);
    const results = executeAllOutputs(module, { points: 100 }, compiled.output_schema);

    expect(results).toEqual({
      score: 100
    });
    expect(results.rank).toBeUndefined();
  });
});
