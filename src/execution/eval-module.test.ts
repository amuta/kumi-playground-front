import { describe, it, expect } from 'vitest';
import { evalCompiledModule, executeOutput, executeAllOutputs } from './eval-module';

describe('evalCompiledModule', () => {
  it('evaluates valid JS module', async () => {
    const jsSrc = `
      export function _total(input) {
        return input.a + input.b;
      }
    `;

    const mod = await evalCompiledModule(jsSrc);
    expect(mod._total({ a: 2, b: 3 })).toBe(5);
  });

  it('throws on syntax error', async () => {
    const invalidJs = 'export class { invalid }';
    await expect(evalCompiledModule(invalidJs)).rejects.toThrow();
  });
});

describe('executeOutput', () => {
  const mockModule = {
    _total: (input: any) => input.price * input.qty,
    _doubled: (input: any) => input.x * 2
  };

  it('executes correct method', () => {
    const result = executeOutput(mockModule, 'total', { price: 10, qty: 3 });
    expect(result).toBe(30);
  });

  it('handles missing method', () => {
    expect(() => executeOutput(mockModule, 'nonexistent', {}))
      .toThrow(/not found/);
  });
});

describe('executeAllOutputs', () => {
  const mockModule = {
    _sum: (input: any) => input.x + input.y,
    _product: (input: any) => input.x * input.y
  };

  const outputSchema = {
    sum: { kind: 'value' as const, type: 'integer' as const, axes: [] },
    product: { kind: 'value' as const, type: 'integer' as const, axes: [] }
  };

  it('executes all value outputs', () => {
    const results = executeAllOutputs(mockModule, { x: 3, y: 4 }, outputSchema);

    expect(results).toEqual({
      sum: 7,
      product: 12
    });
  });
});
