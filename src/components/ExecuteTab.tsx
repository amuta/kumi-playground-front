// src/components/ExecuteTab.tsx
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JsonInputEditor } from '@/components/JsonInputEditor';
import { OutputView } from '@/components/OutputView';
import { runAllOutputsFromUrl } from '@/execution/artifact-runner';
import { applyFeedbackMappings } from '@/execution/feedback-loop';
import type { CompileResponse } from '@/api/compile';
import type { Example, ExecutionConfig } from '@/types';
import { makeBinaryGrid } from '@/input-gen/grid';

interface ExecuteTabProps {
  compiledResult: CompileResponse;
  example?: Example;
  executionConfig?: ExecutionConfig;
  onExecuteStart?: () => void;
  onExecuteEnd?: () => void;
  hideInput?: boolean;
}

export interface ExecuteTabRef {
  execute: () => Promise<void>;
  isExecuting: boolean;
}

function deriveDefaultInput(example?: Example): Record<string, any> {
  if (!example) return {};
  if (example.base_input) return example.base_input;
  // Fallback for grid-based schemas without base_input (e.g., Game of Life)
  if (example.canvas_config?.render === 'grid2d') {
    const c = example.canvas_config.controls ?? {};
    return {
      rows: makeBinaryGrid(
        c.height?.default ?? 40,
        c.width?.default ?? 60,
        c.density?.default ?? 0.18,
        c.seed?.default
      ),
    };
  }
  return {};
}

export const ExecuteTab = forwardRef<ExecuteTabRef, ExecuteTabProps>(function ExecuteTab(
  { compiledResult, example, executionConfig, onExecuteStart, onExecuteEnd, hideInput = false },
  ref
) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<Record<string, any> | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Reset inputs when example or compiled artifact changes
  useEffect(() => {
    setInputValues(deriveDefaultInput(example));
    setExecutionResult(null);
    setExecutionError(null);
  }, [example?.id, compiledResult?.schema_hash]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    onExecuteStart?.();
    try {
      const results = await runAllOutputsFromUrl(
        compiledResult.artifact_url!,
        inputValues,
        compiledResult.output_schema
      );
      setExecutionResult(results);

      if (executionConfig?.type === 'continuous' && executionConfig.continuous?.feedback_mappings?.length) {
        const next = applyFeedbackMappings(executionConfig, results, inputValues);
        setInputValues(next);
      }
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Execution failed');
      setExecutionResult(null);
    } finally {
      setIsExecuting(false);
      onExecuteEnd?.();
    }
  };

  useImperativeHandle(ref, () => ({ execute: handleExecute, isExecuting }));

  const isContinuous = executionConfig?.type === 'continuous' && !!executionConfig.continuous?.feedback_mappings?.length;
  const headingLabel = hideInput
    ? (isContinuous ? 'Input → Output (continuous)' : 'Output (auto-piped)')
    : 'Output';

  const wrapperClass = 'h-[calc(100vh-4rem)] min-h-0 p-6';
  const gridClass = hideInput
    ? 'grid grid-cols-1 gap-8 h-full items-stretch min-h-0'
    : 'grid grid-cols-2 gap-8 h-full items-stretch min-h-0';

  return (
    <div className={wrapperClass}>
      <div className={gridClass}>
        {!hideInput && (
          <div className="flex flex-col h-full min-h-0">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Input
            </h3>
            <Card className="shadow-lg border-2 flex-1 flex flex-col min-h-0">
              <CardContent className="pt-6 space-y-4 flex-1 min-h-0 flex">
                <div className="flex-1 min-h-0">
                  <JsonInputEditor value={inputValues} onChange={setInputValues} onError={setJsonError} height="100%" />
                </div>
                {jsonError && (
                  <p className="text-destructive text-sm font-medium">Invalid JSON: {jsonError}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col h-full min-h-0">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {headingLabel}
          </h3>
          {hideInput && isContinuous && (
            <p className="text-xs text-muted-foreground mb-3">
              Outputs feed back into inputs each run.
            </p>
          )}

          {executionError ? (
            <Card className="bg-destructive/10 border-destructive shadow-sm flex-1 flex flex-col min-h-0">
              <CardContent className="pt-6 flex-1 min-h-0 overflow-hidden">
                <p className="font-mono text-sm text-destructive leading-relaxed">{executionError}</p>
              </CardContent>
            </Card>
          ) : executionResult ? (
            <Card className="shadow-lg border-2 flex-1 flex flex-col overflow-hidden min-h-0">
              <CardContent className="pt-6 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0">
                  <OutputView
                    results={executionResult}
                    outputSchema={compiledResult.output_schema}
                    example={example}
                    // visualizationConfig intentionally omitted here; Execute tab shows JSON by default unless example overrides.
                  />
                </div>
              </CardContent>
            </Card>
          ) : (

            <Card className="shadow-lg border-2 border-dashed bg-muted/20 flex-1 flex flex-col min-h-0">
              <CardContent className="pt-6 flex-1 min-h-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-2">
                  <div className="text-4xl">⚡</div>
                  <p className="text-sm font-medium">
                    Press Execute to see results
                  </p>
                  <p className="text-xs">
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">⌘↵</kbd>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});
