// COPY-AND-REPLACE: ./src/components/SchemaTabContainer.tsx
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
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
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleCompileSuccess = (result: CompileResponse) => {
      setLocalError(null);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      onCompileSuccess(result);
    };

    const handleCompileError = (error: CompileErrorInfo) => {
      setLocalError(error);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setLocalError(null);
      }, 5000);
      onCompileError(error);
    };

    const closeError = () => {
      setLocalError(null);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };

    useEffect(() => {
      return () => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      };
    }, []);

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
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 pointer-events-none">
            <div
              className="px-6 py-4 border-2 border-amber-700 rounded-lg shadow-xl flex items-start gap-4 pointer-events-auto"
              style={{
                backgroundColor: 'rgba(78, 40, 8, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-100 font-mono leading-relaxed">
                  {localError.message}
                  {localError.line && localError.column && ` (line ${localError.line}, column ${localError.column})`}
                </p>
              </div>
              <div
                onClick={closeError}
                className="flex-shrink-0 cursor-pointer text-amber-100 hover:text-amber-50 transition-colors flex items-center justify-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') closeError();
                }}
              >
                <X className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
