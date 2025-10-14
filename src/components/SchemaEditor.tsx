
import { useImperativeHandle, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { compileSchema, type CompileResponse } from '@/api/compile';


interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCompileSuccess: (result: CompileResponse) => void;
  onCompileError: (error: string) => void;
  compileError: string | null;
  onCompileStart?: () => void;
  onCompileEnd?: () => void;
}

export interface SchemaEditorRef {
  compile: () => Promise<void>;
}

export const SchemaEditor = forwardRef<SchemaEditorRef, SchemaEditorProps>(({
  value,
  onChange,
  onCompileSuccess,
  onCompileError,
  compileError,
  onCompileStart,
  onCompileEnd,
}, ref) => {
  

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const handleCompile = async () => {
    
    onCompileStart?.();
    try {
      const result = await compileSchema(value);
      onCompileSuccess(result);
    } catch (error) {
      onCompileError(error instanceof Error ? error.message : 'Compilation failed');
    } finally {
      
      onCompileEnd?.();
    }
  };

  useImperativeHandle(ref, () => ({
    compile: handleCompile,
  }));

  return (
    <div className="flex flex-col h-full">
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-[300px]">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage="ruby"
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            onMount={() => {
              // Keyboard shortcuts handled globally by App.tsx useKeyboard hook
              // to ensure they respect the active tab state
            }}
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

      {compileError && (
        <Card className="mt-6 p-4 bg-destructive/10 border-destructive shadow-sm">
          <p className="text-sm text-destructive font-mono leading-relaxed">{compileError}</p>
        </Card>
      )}
    </div>
  );
});
