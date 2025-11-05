import { useState, useEffect, useRef } from 'react';
import type { Example, ExecutionConfig, VisualizationConfig, CanvasConfig, SimulationConfig } from '@/types';
import type { CompileResponse } from '@/api/compile';

interface ExampleState {
  schemaSource: string;
  compiledResult: CompileResponse | null;
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  canvasConfig: CanvasConfig;
  simulationConfig: SimulationConfig | null;
}

export function useExampleState(example: Example) {
  const stateCache = useRef<Record<string, ExampleState>>({});
  const currentExampleId = useRef<string>(example.id);

  const deepClone = <T,>(value: T): T => (value ? JSON.parse(JSON.stringify(value)) : value);

  const getInitialState = (ex: Example): ExampleState => {
    if (stateCache.current[ex.id]) return stateCache.current[ex.id];
    return {
      schemaSource: ex.schema_src,
      compiledResult: null,
      executionConfig: ex.execution_config || { type: 'single' },
      visualizationConfig: ex.visualization_config || { outputs: {} },
      canvasConfig: ex.canvas_config || { render: 'grid2d', controls: {} },
      simulationConfig: ex.simulation_config ? deepClone(ex.simulation_config) : null,
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
    canvasConfig: state.canvasConfig,
    setCanvasConfig: (canvasConfig: CanvasConfig) => setState(s => ({ ...s, canvasConfig })),
    simulationConfig: state.simulationConfig,
    setSimulationConfig: (simulationConfig: SimulationConfig | null) => setState(s => ({ ...s, simulationConfig })),
  };
}
