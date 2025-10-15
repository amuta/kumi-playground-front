import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import type { ExecutionConfig, VisualizationConfig } from '@/types';

interface ConfigEditorProps {
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  onExecutionConfigChange: (config: ExecutionConfig) => void;
  onVisualizationConfigChange: (config: VisualizationConfig) => void;
}

interface CombinedConfig {
  execution_config: ExecutionConfig;
  visualization_config: VisualizationConfig;
}

export function ConfigEditor({
  executionConfig,
  visualizationConfig,
  onExecutionConfigChange,
  onVisualizationConfigChange,
}: ConfigEditorProps) {
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(
      { execution_config: executionConfig, visualization_config: visualizationConfig },
      null,
      2
    )
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonValue(
      JSON.stringify(
        { execution_config: executionConfig, visualization_config: visualizationConfig },
        null,
        2
      )
    );
  }, [executionConfig, visualizationConfig]);

  const handleChange = (value: string | undefined) => {
    if (value === undefined) return;

    setJsonValue(value);

    try {
      const parsed: CombinedConfig = JSON.parse(value);

      if (parsed.execution_config && parsed.visualization_config) {
        setError(null);
        onExecutionConfigChange(parsed.execution_config);
        onVisualizationConfigChange(parsed.visualization_config);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-[300px]">
        <div className="h-full">
          <EditorView
            height="100%"
            language="json"
            value={jsonValue}
            onChange={handleChange}
          />
        </div>
      </Card>

      {error && (
        <Card className="mt-6 p-4 bg-destructive/10 border-destructive shadow-sm">
          <p className="text-sm text-destructive font-mono leading-relaxed">Invalid JSON: {error}</p>
        </Card>
      )}
    </div>
  );
}
