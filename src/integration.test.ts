import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compileKumiSchema } from './api/compile';
import { runAllOutputsFromUrl } from './execution/artifact-runner';
import type { CompileResult } from './types';

describe('Integration: compile → artifact → execute (URL-only)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as any;
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it('compiles and executes arithmetic via artifact URL', async () => {
    const artifactJs = `
      export function _sum(i){ return i.x + i.y; }
      export function _product(i){ return i.x * i.y; }
    `;

    const mockResult: CompileResult = {
      artifact_url: 'http://localhost:3000/artifacts/test123.js',
      js_src: '',
      ruby_src: '',
      lir: '',
      schema_hash: 'test123',
      input_form_schema: { x: { type: 'integer' }, y: { type: 'integer' } },
      output_schema: {
        sum: { kind: 'value', type: 'integer', axes: [] },
        product: { kind: 'value', type: 'integer', axes: [] },
      },
    };

    // 1) compile
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    // 2) artifact fetch
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => artifactJs,
    });

    const compiled = await compileKumiSchema('schema do end');
    const results = await runAllOutputsFromUrl(
      compiled.artifact_url,
      { x: 3, y: 4 },
      compiled.output_schema
    );

    expect(results).toEqual({ sum: 7, product: 12 });
  });

  it('surfaces compilation error messages', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ['Undefined variable: foo'] }),
    });

    await expect(compileKumiSchema('schema do end'))
      .rejects.toThrow('Undefined variable: foo');
  });

  it('propagates execution errors from artifact code', async () => {
    const artifactJs = `
      export function _divide(i){
        if (i.b === 0) throw new Error('Division by zero');
        return i.a / i.b;
      }
    `;

    const mockResult: CompileResult = {
      artifact_url: 'http://localhost:3000/artifacts/div.js',
      js_src: '',
      ruby_src: '',
      lir: '',
      schema_hash: 'div1',
      input_form_schema: { a: { type: 'integer' }, b: { type: 'integer' } },
      output_schema: { divide: { kind: 'value', type: 'float', axes: [] } },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockResult }) // compile
      .mockResolvedValueOnce({ ok: true, text: async () => artifactJs }); // artifact

    const compiled = await compileKumiSchema('schema do end');

    await expect(runAllOutputsFromUrl(
      compiled.artifact_url,
      { a: 10, b: 0 },
      compiled.output_schema
    )).rejects.toThrow(/Division by zero/);
  });

  it('filters trait outputs when executing from URL', async () => {
    const artifactJs = `
      export function _score(i){ return i.points; }
      export function _rank(){ return 'gold'; }
    `;

    const mockResult: CompileResult = {
      artifact_url: 'http://localhost:3000/artifacts/traits.js',
      js_src: '',
      ruby_src: '',
      lir: '',
      schema_hash: 'traits1',
      input_form_schema: { points: { type: 'integer' } },
      output_schema: {
        score: { kind: 'value', type: 'integer', axes: [] },
        rank: { kind: 'trait', type: 'string', axes: [] },
      },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockResult }) // compile
      .mockResolvedValueOnce({ ok: true, text: async () => artifactJs }); // artifact

    const compiled = await compileKumiSchema('schema do end');
    const results = await runAllOutputsFromUrl(
      compiled.artifact_url,
      { points: 100 },
      compiled.output_schema
    );

    expect(results).toEqual({ score: 100 });
    expect((results as any).rank).toBeUndefined();
  });
});
