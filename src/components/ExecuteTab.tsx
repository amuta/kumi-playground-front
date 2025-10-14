import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JsonInputEditor } from '@/components/JsonInputEditor';
import { OutputDisplay } from '@/components/OutputDisplay';
import { executeAllOutputsFromUrl } from '@/execution/eval-module-url';
import type { CompileResponse } from '@/api/compile';
import type { Example } from '@/types';

interface ExecuteTabProps {
  compiledResult: CompileResponse;
  example?: Example;
  onExecuteStart?: () => void;
  onExecuteEnd?: () => void;
}

export interface ExecuteTabRef {
  execute: () => Promise<void>;
  isExecuting: boolean;
}

export const ExecuteTab = forwardRef<ExecuteTabRef, ExecuteTabProps>(function ExecuteTab(
  { compiledResult, example, onExecuteStart, onExecuteEnd },
  ref
) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<Record<string, any> | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (example?.base_input) setInputValues(example.base_input);
  }, [example]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    onExecuteStart?.();
    try {
      const results = await executeAllOutputsFromUrl(
        compiledResult.artifact_url,
        inputValues,
        compiledResult.output_schema
      );
      setExecutionResult(results);
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Execution failed');
      setExecutionResult(null);
    } finally {
      setIsExecuting(false);
      onExecuteEnd?.();
    }
  };

  useImperativeHandle(ref, () => ({ execute: handleExecute, isExecuting }));

  return (
    <div className="h-[calc(100vh-4rem)] min-h-0 p-6">
      <div className="grid grid-cols-2 gap-8 h-full items-stretch min-h-0">
        {/* Input */}
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

        {/* Output */}
        <div className="flex flex-col h-full min-h-0">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Output
          </h3>

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
                  <OutputDisplay
                    results={executionResult}
                    outputSchema={compiledResult.output_schema}
                    example={example}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-2 border-dashed bg-muted/20 flex-1 flex flex-col min-h-0">
              <CardContent className="pt-6 flex-1 min-h-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-2">
                  <div className="text-4xl">⚡</div>
                  <p className="text-sm font-medium">Press Execute to see results</p>
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
