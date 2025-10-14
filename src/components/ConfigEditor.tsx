import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import type { ExecutionConfig, VisualizationConfig } from '@/types';

interface ConfigEditorProps {
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  onChange: (execution: ExecutionConfig, visualization: VisualizationConfig) => void;
}

type CombinedConfig = {
  execution: ExecutionConfig;
  visualization: VisualizationConfig;
};

export function ConfigEditor({ executionConfig, visualizationConfig, onChange }: ConfigEditorProps) {
  const [configJson, setConfigJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const combined: CombinedConfig = {
      execution: executionConfig,
      visualization: visualizationConfig,
    };
    setConfigJson(JSON.stringify(combined, null, 2));
  }, [executionConfig, visualizationConfig]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;

    setConfigJson(newValue);

    try {
      const parsed = JSON.parse(newValue) as CombinedConfig;
      setParseError(null);
      onChange(parsed.execution, parsed.visualization);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-[300px]">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={configJson}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
      </Card>

      {parseError && (
        <Card className="mt-6 p-4 bg-destructive/10 border-destructive shadow-sm">
          <p className="text-sm text-destructive font-mono leading-relaxed">{parseError}</p>
        </Card>
      )}
    </div>
  );
}
