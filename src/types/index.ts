export type InputField =
  | { type: 'string' | 'integer' | 'float' | 'boolean' }
  | { type: 'array'; element: InputField }
  | { type: 'object'; fields: Record<string, InputField> };

export type OutputField = {
  kind: 'value' | 'trait';
  type: 'string' | 'integer' | 'float' | 'boolean';
  axes: string[];
};

export type CompileResult = {
  js_src: string;
  ruby_src: string;
  lir: string;
  schema_hash: string;
  input_form_schema: Record<string, InputField>;
  output_schema: Record<string, OutputField>;
};

export type ExampleMode = 'notebook' | 'canvas' | 'simulation';

export type VisualizationType = 'json' | 'table' | 'grid';

export type CanvasConfig = {
  render: 'grid2d';
  controls?: {
    speed?: { min: number; max: number; default: number };
    seed?: { default: number };
  };
};

export type SimulationConfig = {
  iterations: number;
  random_fields: Record<
    string,
    | { distribution: 'normal'; mean: number; std: number }
    | { distribution: 'uniform'; min: number; max: number }
  >;
  track_outputs: string[];
};

export type Example = {
  id: string;
  title: string;
  schema_src: string;
  mode: ExampleMode;
  base_input?: Record<string, any>;
  canvas_config?: CanvasConfig;
  simulation_config?: SimulationConfig;
  visualizations?: Record<string, VisualizationType>;
};

export type Statistics = {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  p95: number;
};
