import type { ExecutionConfig, OutputField } from '@/types';
import { runAllOutputs } from '@/execution/artifact-runner';
import { applyFeedbackMappings } from '@/execution/feedback-loop';

export type EngineSnapshot = {
  stepCount: number;
  input: Record<string, any>;
  outputs: Record<string, any> | null;
  error: string | null;
};

export interface ModuleLike {
  [k: string]: any; // expects compiled functions named _<output>
}

export class VisualizationEngine {
  private mod: ModuleLike;
  private schema: Record<string, OutputField>;
  private execCfg?: ExecutionConfig;

  private _stepCount = 0;
  private _input: Record<string, any>;
  private _outputs: Record<string, any> | null = null;
  private _error: string | null = null;

  constructor(opts: {
    mod: ModuleLike;
    outputSchema: Record<string, OutputField>;
    execConfig?: ExecutionConfig;
    initialInput?: Record<string, any>;
  }) {
    this.mod = opts.mod;
    this.schema = opts.outputSchema;
    this.execCfg = opts.execConfig;
    this._input = opts.initialInput ?? {};
  }

  snapshot(): EngineSnapshot {
    return {
      stepCount: this._stepCount,
      input: this._input,
      outputs: this._outputs,
      error: this._error,
    };
  }

  setInput(next: Record<string, any>) { this._input = next; }
  step(): EngineSnapshot {
    try {
      const stepIdx = this._stepCount + 1;
      const inForStep = { ...this._input, step: stepIdx };

      const outputs = runAllOutputs(this.mod, inForStep, this.schema);
      (outputs as any).step = stepIdx;

      this._outputs = outputs;
      this._error = null;
      this._stepCount = stepIdx;

      if (this.execCfg?.type === 'continuous' && this.execCfg.continuous?.feedback_mappings?.length) {
        this._input = applyFeedbackMappings(this.execCfg, outputs, inForStep);
      } else {
        // keep step visible on subsequent iterations
        this._input = inForStep;
      }
    } catch (e) {
      this._error = e instanceof Error ? e.message : 'Execution failed';
    }
    return this.snapshot();
  }
}
