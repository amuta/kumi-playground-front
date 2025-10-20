import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compileKumiSchema, CompilationError } from './compile';
import type { CompileResult } from '../types';

describe('compileKumiSchema', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as any;
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
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
        sum: { type: 'integer', axes: [] }   // removed kind
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockResult
    });

    const schema = 'schema do\n  input do\n    integer :x\n  end\nend';
    const result = await compileKumiSchema(schema);

    expect(result).toEqual(mockResult);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/kumi/compile',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema_src: schema }),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('throws error on compilation failure with JSON error message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      headers: { get: () => 'application/json' },
      json: async () => ({ errors: ['Syntax error on line 3'] })
    });

    await expect(compileKumiSchema('invalid schema'))
      .rejects.toThrow('Syntax error on line 3');
  });

  it('throws text error when non-JSON response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      headers: { get: () => 'text/plain' },
      text: async () => 'Bad Request'
    });

    await expect(compileKumiSchema('invalid schema'))
      .rejects.toThrow('Bad Request');
  });

  it('throws generic error when no error details provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      headers: { get: () => 'application/json' },
      json: async () => ({})
    });

    await expect(compileKumiSchema('invalid schema'))
      .rejects.toThrow('Compilation failed');
  });

  it('handles network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(compileKumiSchema('schema do\nend'))
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
      headers: { get: () => 'application/json' },
      json: async () => mockResult
    });

    const result = await compileKumiSchema('');
    expect(result).toEqual(mockResult);
  });

  describe('structured error handling', () => {
    it('throws CompilationError with line and column for syntax errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({
          ok: false,
          errors: [{
            message: 'Expected schema, got input',
            line: 1,
            column: 6
          }]
        })
      });

      try {
        await compileKumiSchema('input { x: integer }');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompilationError);
        expect((error as CompilationError).message).toBe('Expected schema, got input');
        expect((error as CompilationError).line).toBe(1);
        expect((error as CompilationError).column).toBe(6);
      }
    });

    it('throws CompilationError with line and column for parse errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({
          ok: false,
          errors: [{
            message: 'Unexpected token +',
            line: 3,
            column: 15
          }]
        })
      });

      try {
        await compileKumiSchema('schema Test\ninput { x: integer }\noutput { y: x + + 5 }');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompilationError);
        expect((error as CompilationError).message).toBe('Unexpected token +');
        expect((error as CompilationError).line).toBe(3);
        expect((error as CompilationError).column).toBe(15);
      }
    });

    it('throws CompilationError for errors without location', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({
          ok: false,
          errors: [{
            message: 'Internal compiler error'
          }]
        })
      });

      try {
        await compileKumiSchema('some schema');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompilationError);
        expect((error as CompilationError).message).toBe('Internal compiler error');
        expect((error as CompilationError).line).toBeUndefined();
        expect((error as CompilationError).column).toBeUndefined();
      }
    });

    it('falls back to generic Error for string errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({
          errors: ['Simple string error']
        })
      });

      await expect(compileKumiSchema('invalid'))
        .rejects.toThrow('Simple string error');
    });
  });
});
