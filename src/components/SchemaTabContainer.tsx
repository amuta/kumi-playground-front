import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaEditor, type SchemaEditorRef } from '@/components/SchemaEditor';
import { ConfigEditor } from '@/components/ConfigEditor';
import type { CompileResponse } from '@/api/compile';
import type { ExecutionConfig, VisualizationConfig } from '@/types';

interface SchemaTabContainerProps {
  schemaSource: string;
  onSchemaSourceChange: (source: string) => void;
  executionConfig: ExecutionConfig;
  visualizationConfig: VisualizationConfig;
  onExecutionConfigChange: (config: ExecutionConfig) => void;
  onVisualizationConfigChange: (config: VisualizationConfig) => void;
  onCompileSuccess: (result: CompileResponse) => void;
  onCompileError: (error: string) => void;
  compileError: string | null;
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
      onExecutionConfigChange,
      onVisualizationConfigChange,
      onCompileSuccess,
      onCompileError,
      compileError,
      onCompileStart,
      onCompileEnd,
    },
    ref
  ) => {
    const [schemaSubTab, setSchemaSubTab] = useState('schema');
    const schemaEditorRef = useRef<SchemaEditorRef>(null);

    useImperativeHandle(ref, () => ({
      compile: async () => {
        await schemaEditorRef.current?.compile();
      },
    }));

    return (
      <Tabs value={schemaSubTab} onValueChange={setSchemaSubTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <TabsContent value="schema" className="m-0 h-full">
            <SchemaEditor
              ref={schemaEditorRef}
              value={schemaSource}
              onChange={onSchemaSourceChange}
              onCompileSuccess={onCompileSuccess}
              onCompileError={onCompileError}
              compileError={compileError}
              onCompileStart={onCompileStart}
              onCompileEnd={onCompileEnd}
            />
          </TabsContent>

          <TabsContent value="config" className="m-0 h-full">
            <ConfigEditor
              executionConfig={executionConfig}
              visualizationConfig={visualizationConfig}
              onExecutionConfigChange={onExecutionConfigChange}
              onVisualizationConfigChange={onVisualizationConfigChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    );
  }
);
