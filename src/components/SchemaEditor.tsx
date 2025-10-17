
import { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { type Monaco } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import { compileSchema, type CompileResponse, CompilationError, ServerError } from '@/api/compile';
import type { editor as MonacoEditor } from 'monaco-editor';

export interface CompileErrorInfo {
  message: string;
  line?: number;
  column?: number;
}

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCompileSuccess: (result: CompileResponse) => void;
  onCompileError: (error: CompileErrorInfo) => void;
  compileError: string | null;
  errorLine?: number;
  errorColumn?: number;
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
  errorLine,
  errorColumn,
  onCompileStart,
  onCompileEnd,
}, ref) => {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const highlightErrorLine = (line: number, column: number) => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations: MonacoEditor.IModelDeltaDecoration[] = [{
      range: new monaco.Range(line, column, line, column + 1),
      options: {
        className: 'error-highlight',
        glyphMarginClassName: 'codicon codicon-error',
        glyphMarginHoverMessage: { value: 'Compilation error' },
        inlineClassName: 'error-underline',
        isWholeLine: true,
      }
    }];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    editor.revealLineInCenter(line);
  };

  const clearErrorHighlight = () => {
    if (!editorRef.current) return;
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
  };

  const handleCompile = async () => {
    onCompileStart?.();
    clearErrorHighlight();
    try {
      const result = await compileSchema(value);
      onCompileSuccess(result);
    } catch (error) {
      if (error instanceof CompilationError) {
        onCompileError({
          message: error.message,
          line: error.line,
          column: error.column
        });
        if (error.line && error.column) {
          highlightErrorLine(error.line, error.column);
        }
      } else if (error instanceof ServerError) {
        onCompileError({
          message: `⚠️ ${error.message}`
        });
      } else {
        onCompileError({
          message: error instanceof Error ? error.message : 'Compilation failed'
        });
      }
    } finally {
      onCompileEnd?.();
    }
  };

  useEffect(() => {
    if (errorLine && errorColumn && !compileError) {
      clearErrorHighlight();
    }
  }, [value]);

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
          <p className="text-sm text-destructive font-mono leading-relaxed">
            {compileError}
            {errorLine && errorColumn && ` (line ${errorLine}, column ${errorColumn})`}
          </p>
        </Card>
      )}
    </div>
  );
});
