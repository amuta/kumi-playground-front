import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExampleState } from './useExampleState';
import type { Example, ExecutionConfig, VisualizationConfig } from '@/types';
import type { CompileResponse } from '@/api/compile';

const example1: Example = {
  id: 'example-1',
  title: 'Example 1',
  mode: 'notebook',
  schema_src: 'schema do\n  value :x, 1\nend',
};

const example2: Example = {
  id: 'example-2',
  title: 'Example 2',
  mode: 'notebook',
  schema_src: 'schema do\n  value :y, 2\nend',
};

const mockCompiledResult: CompileResponse = {
  artifact_url: 'https://example.com/artifact.js',
  js_src: 'export function _x() { return 1; }',
  ruby_src: 'def x; 1; end',
  lir: 'let x = 1',
  schema_hash: 'abc123',
  input_form_schema: {},
  output_schema: { x: { type: 'integer', axes: [] } }, // removed kind
};

describe('useExampleState', () => {
  test('initializes with example schema source', () => {
    const { result } = renderHook(() => useExampleState(example1));

    expect(result.current.schemaSource).toBe(example1.schema_src);
    expect(result.current.compiledResult).toBeNull();
    expect(result.current.executionConfig).toEqual({ type: 'single' });
    expect(result.current.visualizationConfig).toEqual({ outputs: {} });
  });

  test('preserves state when switching examples', () => {
    const { result, rerender } = renderHook(
      ({ example }) => useExampleState(example),
      { initialProps: { example: example1 } }
    );

    act(() => {
      result.current.setSchemaSource('modified schema');
      result.current.setCompiledResult(mockCompiledResult);
    });

    expect(result.current.schemaSource).toBe('modified schema');
    expect(result.current.compiledResult).toBe(mockCompiledResult);

    rerender({ example: example2 });

    expect(result.current.schemaSource).toBe(example2.schema_src);
    expect(result.current.compiledResult).toBeNull();

    rerender({ example: example1 });

    expect(result.current.schemaSource).toBe('modified schema');
    expect(result.current.compiledResult).toBe(mockCompiledResult);
  });

  test('updates execution config per example', () => {
    const { result, rerender } = renderHook(
      ({ example }) => useExampleState(example),
      { initialProps: { example: example1 } }
    );

    const config: ExecutionConfig = {
      type: 'continuous',
      continuous: {
        feedback_mappings: [{ from_output: 'next_state', to_input: 'rows' }],
        playback_speed: 200,
      },
    };

    act(() => {
      result.current.setExecutionConfig(config);
    });

    expect(result.current.executionConfig).toEqual(config);

    rerender({ example: example2 });
    expect(result.current.executionConfig).toEqual({ type: 'single' });

    rerender({ example: example1 });
    expect(result.current.executionConfig).toEqual(config);
  });

  test('updates visualization config per example', () => {
    const { result, rerender } = renderHook(
      ({ example }) => useExampleState(example),
      { initialProps: { example: example1 } }
    );

    const config: VisualizationConfig = {
      outputs: {
        next_state: {
          type: 'grid',
          grid: { cell_map: { '0': '·', '1': '█' } },
        },
      },
    };

    act(() => {
      result.current.setVisualizationConfig(config);
    });

    expect(result.current.visualizationConfig).toEqual(config);

    rerender({ example: example2 });
    expect(result.current.visualizationConfig).toEqual({ outputs: {} });

    rerender({ example: example1 });
    expect(result.current.visualizationConfig).toEqual(config);
  });
});
