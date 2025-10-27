// src/components/ExecuteTab.tsx
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonInputEditor } from '@/components/JsonInputEditor';
import { OutputView } from '@/components/OutputView';
import { ErrorNotification } from '@/components/ui/ErrorNotification';
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
  onActiveSubTabChange?: (tab: 'input' | 'output') => void;
  activeSubTab?: 'input' | 'output';
  onSetActiveSubTab?: (tab: 'input' | 'output') => void;
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
  { compiledResult, example, executionConfig, onExecuteStart, onExecuteEnd, hideInput = false, onActiveSubTabChange, activeSubTab: externalActiveSubTab, onSetActiveSubTab },
  ref
) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<Record<string, any> | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'input' | 'output'>('input');

  const activeSubTab = externalActiveSubTab ?? internalActiveSubTab;
  const setActiveSubTab = onSetActiveSubTab ?? setInternalActiveSubTab;

  useEffect(() => {
    onActiveSubTabChange?.(activeSubTab);
  }, [activeSubTab, onActiveSubTabChange]);

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
        compiledResult.output_schema,
        compiledResult.input_form_schema
      );
      setExecutionResult(results);
      setActiveSubTab('output');

      if (executionConfig?.type === 'continuous' && executionConfig.continuous?.feedback_mappings?.length) {
        const next = applyFeedbackMappings(executionConfig, results, inputValues);
        setInputValues(next);
        setActiveSubTab('input');
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

  return (
    <div className="h-[calc(100vh-4rem)] min-h-0 p-6 flex flex-col relative">
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'input' | 'output')} className="h-full min-h-0 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          {!hideInput && <TabsTrigger value="input">Input</TabsTrigger>}
          <TabsTrigger value="output">Output</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          {!hideInput && (
            <TabsContent value="input" className="m-0 h-full">
              <JsonInputEditor value={inputValues} onChange={setInputValues} onError={setJsonError} height="100%" />
              {jsonError && (
                <p className="text-destructive text-sm font-medium mt-2">Invalid JSON: {jsonError}</p>
              )}
            </TabsContent>
          )}

          <TabsContent value="output" className="m-0 h-full flex flex-col">
            {hideInput && isContinuous && (
              <p className="text-xs text-muted-foreground mb-3 flex-shrink-0">
                Outputs feed back into inputs each run.
              </p>
            )}

            {executionResult ? (
              <div className="flex-1 min-h-0">
                <OutputView
                  results={executionResult}
                  outputSchema={compiledResult.output_schema}
                  example={example}
                  // visualizationConfig intentionally omitted here; Execute tab shows JSON by default unless example overrides.
                />
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex items-center justify-center border-2 border-dashed rounded-md bg-muted/20">
                <div className="text-center text-muted-foreground space-y-2">
                  <div className="text-4xl">⚡</div>
                  <p className="text-sm font-medium">
                    Press Execute to see results
                  </p>
                  <p className="text-xs">
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">⌘↵</kbd>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {executionError && (
        <ErrorNotification
          message={executionError}
          onClose={() => setExecutionError(null)}
          position="top"
        />
      )}
    </div>
  );
});
