export type InputField =
  | { type: 'string' | 'integer' | 'float' | 'boolean' }
  | { type: 'array'; element: InputField }
  | { type: 'object'; fields: Record<string, InputField> };

export type OutputField = {
  // Kind removed. Outputs are not differentiated.
  type?: 'string' | 'integer' | 'float' | 'boolean';
  axes?: string[];
};

export type CompileResult = {
  // URL for executable JS artifact produced by the compiler.
  artifact_url?: string;

  // Optional display artifacts for UI.
  js_src: string;
  ruby_src: string;
  lir: string;

  schema_hash: string;
  input_form_schema: Record<string, InputField>;
  output_schema: Record<string, OutputField>;
};

export type ExampleMode = 'notebook' | 'canvas' | 'simulation';
export type VisualizationType = 'json' | 'table' | 'grid';

export type ExecutionConfig = {
  type: 'single' | 'continuous';
  continuous?: {
    feedback_mappings: Array<{
      from_output: string;
      to_input: string;
    }>;
    max_iterations?: number;
    auto_start?: boolean;
    playback_speed?: number;
  };
};

export type VisualizationConfig = {
  outputs: Record<string, {
    type: VisualizationType;
    grid?: {
      cell_render?: 'numeric' | 'boolean' | 'custom';
      cell_map?: Record<string, string>;
    };
  }>;
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
  execution_config?: ExecutionConfig;
  visualization_config?: VisualizationConfig;
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

export type CanvasConfig = {
  render: 'grid2d';
  controls?: {
    speed?: { min: number; max: number; default: number };
    seed?: { default: number };
    width?: { default: number };  
    height?: { default: number }; 
    density?: { default: number };
  };
};
