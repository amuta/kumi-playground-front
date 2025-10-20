import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import type { ExecutionConfig, VisualizationConfig, CanvasConfig } from '@/types';

interface ConfigEditorProps {
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  canvasConfig: CanvasConfig;
  onExecutionConfigChange: (config: ExecutionConfig) => void;
  onVisualizationConfigChange: (config: VisualizationConfig) => void;
  onCanvasConfigChange: (config: CanvasConfig) => void;
}

interface CombinedConfig {
  execution_config: ExecutionConfig;
  visualization_config: VisualizationConfig;
  canvas_config: CanvasConfig;
}

export function ConfigEditor({
  executionConfig,
  visualizationConfig,
  canvasConfig,
  onExecutionConfigChange,
  onVisualizationConfigChange,
  onCanvasConfigChange,
}: ConfigEditorProps) {
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(
      {
        execution_config: executionConfig,
        visualization_config: visualizationConfig,
        canvas_config: canvasConfig,
      },
      null,
      2
    )
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonValue(
      JSON.stringify(
        {
          execution_config: executionConfig,
          visualization_config: visualizationConfig,
          canvas_config: canvasConfig,
        },
        null,
        2
      )
    );
  }, [executionConfig, visualizationConfig, canvasConfig]);

  const handleChange = (value: string | undefined) => {
    if (value === undefined) return;
    setJsonValue(value);
    try {
      const parsed: CombinedConfig = JSON.parse(value);
      if (parsed.execution_config) onExecutionConfigChange(parsed.execution_config);
      if (parsed.visualization_config) onVisualizationConfigChange(parsed.visualization_config);
      if (parsed.canvas_config) onCanvasConfigChange(parsed.canvas_config);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-[300px]">
        <div className="h-full">
          <EditorView height="100%" language="json" value={jsonValue} onChange={handleChange} options={{ lineNumbers: 'off', formatOnPaste: true }} />
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
