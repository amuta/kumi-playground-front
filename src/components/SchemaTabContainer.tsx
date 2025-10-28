// COPY-AND-REPLACE: ./src/components/SchemaTabContainer.tsx
import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorNotification } from '@/components/ui/ErrorNotification';
import { SchemaEditor, type SchemaEditorRef, type CompileErrorInfo } from '@/components/SchemaEditor';
import { ConfigEditor } from '@/components/ConfigEditor';
import type { CompileResponse } from '@/api/compile';
import type { ExecutionConfig, VisualizationConfig, CanvasConfig } from '@/types';

interface SchemaTabContainerProps {
  schemaSource: string;
  onSchemaSourceChange: (source: string) => void;
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  canvasConfig: CanvasConfig;
  onExecutionConfigChange: (config: ExecutionConfig) => void;
  onVisualizationConfigChange: (config: VisualizationConfig) => void;
  onCanvasConfigChange: (config: CanvasConfig) => void;
  onCompileSuccess: (result: CompileResponse) => void;
  onCompileError: (error: CompileErrorInfo) => void;
  onCompileStart?: () => void;
  onCompileEnd?: () => void;
}

export interface SchemaTabContainerRef {
  compile: () => Promise<void>;
}

export const SchemaTabContainer = forwardRef<SchemaTabContainerRef, SchemaTabContainerProps>(
  (
    {
      schemaSource,
      onSchemaSourceChange,
      executionConfig,
      visualizationConfig,
      canvasConfig,
      onExecutionConfigChange,
      onVisualizationConfigChange,
      onCanvasConfigChange,
      onCompileSuccess,
      onCompileError,
      onCompileStart,
      onCompileEnd,
    },
    ref
  ) => {
    const [schemaSubTab, setSchemaSubTab] = useState('schema');
    const schemaEditorRef = useRef<SchemaEditorRef>(null);
    const [localError, setLocalError] = useState<CompileErrorInfo | null>(null);

    const handleCompileSuccess = (result: CompileResponse) => {
      setLocalError(null);
      onCompileSuccess(result);
    };

    const handleCompileError = (error: CompileErrorInfo) => {
      setLocalError(error);
      onCompileError(error);
    };

    useImperativeHandle(ref, () => ({
      compile: async () => { await schemaEditorRef.current?.compile(); },
    }));

    return (
      <div className="flex flex-col h-full relative">
        <Tabs value={schemaSubTab} onValueChange={setSchemaSubTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0">
            <TabsContent value="schema" className="m-0 h-full" forceMount>
              <SchemaEditor
                ref={schemaEditorRef}
                value={schemaSource}
                onChange={onSchemaSourceChange}
                onCompileSuccess={handleCompileSuccess}
                onCompileError={handleCompileError}
                onCompileStart={onCompileStart}
                onCompileEnd={onCompileEnd}
              />
            </TabsContent>

            <TabsContent value="config" className="m-0 h-full">
              <ConfigEditor
                executionConfig={executionConfig}
                visualizationConfig={visualizationConfig}
                canvasConfig={canvasConfig}
                onExecutionConfigChange={onExecutionConfigChange}
                onVisualizationConfigChange={onVisualizationConfigChange}
                onCanvasConfigChange={onCanvasConfigChange}
              />
            </TabsContent>
          </div>
        </Tabs>

        {localError && (
          <ErrorNotification
            message={`${localError.message}${localError.line && localError.column ? ` (line ${localError.line}, column ${localError.column})` : ''}`}
            onClose={() => setLocalError(null)}
            position="top"
          />
        )}
      </div>
    );
  }
);

SchemaTabContainer.displayName = 'SchemaTabContainer';
