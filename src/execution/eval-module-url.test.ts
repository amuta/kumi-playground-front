import { describe, it, expect } from 'vitest';
import { evalCompiledModuleFromUrl, executeAllOutputsFromUrl } from './eval-module-url';
import { compileSchema } from '@/api/compile';

describe('evalCompiledModuleFromUrl', () => {
  it('loads and executes module from artifact URL', async () => {
    const schema = `schema do
      input do
        integer :x
      end
      value :result, input.x * 3
    end`;

    const compiled = await compileSchema(schema);
    const input = { x: 7 };

    const outputs = await executeAllOutputsFromUrl(
      compiled.artifact_url,
      input,
      compiled.output_schema
    );

    expect(outputs.result).toBe(21);
  });

  it('handles multiple outputs from URL', async () => {
    const schema = `schema do
      input do
        integer :a
        integer :b
      end
      value :sum, input.a + input.b
      value :diff, input.a - input.b
    end`;

    const compiled = await compileSchema(schema);
    const input = { a: 10, b: 3 };

    const outputs = await executeAllOutputsFromUrl(
      compiled.artifact_url,
      input,
      compiled.output_schema
    );

    expect(outputs.sum).toBe(13);
    expect(outputs.diff).toBe(7);
  });
});
