import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputForm } from '@/components/InputForm';
import { OutputDisplay } from '@/components/OutputDisplay';
import { evalCompiledModule, executeAllOutputs } from '@/execution/eval-module';
import type { CompileResponse } from '@/api/compile';

interface ExecuteTabProps {
  compiledResult: CompileResponse;
}

export function ExecuteTab({ compiledResult }: ExecuteTabProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<Record<string, any> | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const module = await evalCompiledModule(compiledResult.js_src);
      const results = executeAllOutputs(
        module,
        inputValues,
        compiledResult.output_schema
      );
      setExecutionResult(results);
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Execution failed');
      setExecutionResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <InputForm
            schema={compiledResult.input_form_schema}
            values={inputValues}
            onChange={setInputValues}
          />
          <Button onClick={handleExecute} disabled={isExecuting} className="mt-4" size="lg">
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </CardContent>
      </Card>

      {executionError && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-destructive">{executionError}</p>
          </CardContent>
        </Card>
      )}

      {executionResult && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <OutputDisplay
              results={executionResult}
              outputSchema={compiledResult.output_schema}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
