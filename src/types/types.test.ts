import { describe, it, expect } from 'vitest';
import type { Example } from './index';

describe('Types', () => {
  it('Example accepts visualizations config', () => {
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: 'schema do end',
      base_input: {},
      visualizations: {
        output1: 'json',
        output2: 'table',
      },
    };

    expect(example.visualizations).toBeDefined();
    expect(example.visualizations!.output1).toBe('json');
  });

  it('Example visualizations is optional', () => {
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: 'schema do end',
      base_input: {},
    };

    expect(example.visualizations).toBeUndefined();
  });
});
