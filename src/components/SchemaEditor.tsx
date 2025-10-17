
import { useImperativeHandle, forwardRef, useRef } from 'react';
import { type Monaco } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import { compileSchema, type CompileResponse, CompilationError } from '@/api/compile';
import type { editor as MonacoEditor } from 'monaco-editor';


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
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

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
      if (error instanceof CompilationError) {
        const location = error.line && error.column
          ? ` (line ${error.line}, column ${error.column})`
          : '';
        onCompileError(`${error.message}${location}`);
      } else {
        onCompileError(error instanceof Error ? error.message : 'Compilation failed');
      }
    } finally {
      onCompileEnd?.();
    }
  };

  const handleEditorDidMount = (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useImperativeHandle(ref, () => ({
    compile: handleCompile,
  }));

  return (
    <div className="flex flex-col h-full">
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-[300px]">
        <div className="h-full">
          <EditorView
            height="100%"
            language="ruby"
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
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
