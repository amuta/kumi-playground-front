import { useState, useEffect, useRef } from 'react';
import type { Example, ExecutionConfig, VisualizationConfig } from '@/types';
import type { CompileResponse } from '@/api/compile';

interface ExampleState {
  schemaSource: string;
  compiledResult: CompileResponse | null;
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
}

export function useExampleState(example: Example) {
  const stateCache = useRef<Record<string, ExampleState>>({});
  const currentExampleId = useRef<string>(example.id);

  const getInitialState = (ex: Example): ExampleState => {
    if (stateCache.current[ex.id]) {
      return stateCache.current[ex.id];
    }

    return {
      schemaSource: ex.schema_src,
      compiledResult: null,
      executionConfig: ex.execution_config || { type: 'single' },
      visualizationConfig: ex.visualization_config || { outputs: {} },
    };
  };

  const [state, setState] = useState<ExampleState>(() => getInitialState(example));

  useEffect(() => {
    if (currentExampleId.current !== example.id) {
      stateCache.current[currentExampleId.current] = state;
      currentExampleId.current = example.id;
      setState(getInitialState(example));
    }
  }, [example.id]);

  useEffect(() => {
    stateCache.current[currentExampleId.current] = state;
  }, [state]);

  return {
    schemaSource: state.schemaSource,
    setSchemaSource: (schemaSource: string) => setState(s => ({ ...s, schemaSource })),
    compiledResult: state.compiledResult,
    setCompiledResult: (compiledResult: CompileResponse | null) => setState(s => ({ ...s, compiledResult })),
    executionConfig: state.executionConfig,
    setExecutionConfig: (executionConfig: ExecutionConfig) => setState(s => ({ ...s, executionConfig })),
    visualizationConfig: state.visualizationConfig,
    setVisualizationConfig: (visualizationConfig: VisualizationConfig) => setState(s => ({ ...s, visualizationConfig })),
  };
}
