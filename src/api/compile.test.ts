import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compileKumiSchema } from './compile';
import type { CompileResult } from '../types';

describe('compileKumiSchema', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully compiles valid schema', async () => {
    const mockResult: CompileResult = {
      artifact_url: 'http://localhost:3000/artifacts/abc123.js',
  js_src: 'class KumiCompiledModule {}',
      ruby_src: 'class CompiledModule; end',
      lir: 'module { }',
      schema_hash: 'abc123',
      input_form_schema: {
        x: { type: 'integer' },
        y: { type: 'integer' }
      },
      output_schema: {
        sum: { kind: 'value', type: 'integer', axes: [] }
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const schema = 'schema do\n  input do\n    integer :x\n  end\nend';
    const result = await compileKumiSchema(schema);

    expect(result).toEqual(mockResult);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/kumi/compile',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema_src: schema })
      }
    );
  });

  it('throws error on compilation failure with error message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ['Syntax error on line 3'] })
    });

    const schema = 'invalid schema';

    await expect(compileKumiSchema(schema))
      .rejects.toThrow('Syntax error on line 3');
  });

  it('throws generic error when no error details provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    const schema = 'invalid schema';

    await expect(compileKumiSchema(schema))
      .rejects.toThrow('Compilation failed');
  });

  it('handles network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(
      new Error('Network error')
    );

    const schema = 'schema do\nend';

    await expect(compileKumiSchema(schema))
      .rejects.toThrow('Network error');
  });

  it('handles empty schema', async () => {
    const mockResult: CompileResult = {
      artifact_url: 'http://localhost:3000/artifacts/abc123.js',
  js_src: 'class KumiCompiledModule {}',
      ruby_src: 'class CompiledModule; end',
      lir: 'module { }',
      schema_hash: 'def456',
      input_form_schema: {},
      output_schema: {}
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult
    });

    const result = await compileKumiSchema('');
    expect(result).toEqual(mockResult);
  });
});
