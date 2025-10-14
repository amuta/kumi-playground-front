import { describe, it, expect } from 'vitest';
import { executeSingleIteration, executeIterationLoop } from './continuous-execution';
import { compileSchema } from '@/api/compile';
import type { ExecutionConfig } from '@/types';

describe('executeSingleIteration', () => {
  it('executes compiled module and returns outputs', async () => {
    const schema = `schema do
      input do
        integer :x
      end
      value :double, input.x * 2
    end`;

    const compiled = await compileSchema(schema);
    const input = { x: 5 };

    const outputs = await executeSingleIteration(compiled.artifact_url, input, compiled.output_schema);

    expect(outputs.double).toBe(10);
  });

  it('handles multiple outputs', async () => {
    const schema = `schema do
      input do
        integer :a
        integer :b
      end
      value :sum, input.a + input.b
      value :product, input.a * input.b
    end`;

    const compiled = await compileSchema(schema);
    const input = { a: 3, b: 4 };

    const outputs = await executeSingleIteration(compiled.artifact_url, input, compiled.output_schema);

    expect(outputs.sum).toBe(7);
    expect(outputs.product).toBe(12);
  });
});

describe('executeIterationLoop', () => {
  it('runs multiple iterations with feedback mapping', async () => {
    const schema = `schema do
      input do
        integer :count
      end
      value :next_count, input.count + 1
    end`;

    const compiled = await compileSchema(schema);
    const config: ExecutionConfig = {
      type: 'continuous',
      continuous: {
        feedback_mappings: [
          { from_output: 'next_count', to_input: 'count' }
        ]
      }
    };

    const initialInput = { count: 0 };
    const iterations = 3;

    const history = await executeIterationLoop(
      compiled.artifact_url,
      compiled.output_schema,
      config,
      initialInput,
      iterations
    );

    expect(history).toHaveLength(3);
    expect(history[0].input).toEqual({ count: 0 });
    expect(history[0].outputs.next_count).toBe(1);
    expect(history[1].input).toEqual({ count: 1 });
    expect(history[1].outputs.next_count).toBe(2);
    expect(history[2].input).toEqual({ count: 2 });
    expect(history[2].outputs.next_count).toBe(3);
  });
});
