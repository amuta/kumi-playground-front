
import { useImperativeHandle, forwardRef, useRef } from 'react';
import { type Monaco } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import { compileSchema, type CompileResponse, CompilationError, ServerError } from '@/api/compile';
import { registerKumiLanguage, configureKumiLanguage } from '@/language/monaco';
import { toDiagnostics } from '@/language/diagnostics';
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

  const setDiagnostics = (error: CompilationError) => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    const diagnostics = toDiagnostics(error);
    monaco.editor.setModelMarkers(model, 'kumi', diagnostics as any);

    if (error.line) {
      editor.revealLineInCenter(error.line);
    }
  };

  const clearDiagnostics = () => {
    if (!monacoRef.current || !editorRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(model, 'kumi', []);
  };

  const handleCompile = async () => {
    onCompileStart?.();
    clearDiagnostics();
    try {
      const result = await compileSchema(value);
      onCompileSuccess(result);
    } catch (error) {
      let errorInfo: CompileErrorInfo = { message: 'Compilation failed' };

      if (error instanceof CompilationError) {
        errorInfo = {
          message: error.error_text || error.message,
          line: error.line,
          column: error.column
        };
        setDiagnostics(error);
      } else if (error instanceof ServerError) {
        errorInfo = {
          message: `⚠️ ${error.message}`
        };
      } else {
        errorInfo = {
          message: error instanceof Error ? error.message : 'Compilation failed'
        };
      }

      onCompileError(errorInfo);
    } finally {
      onCompileEnd?.();
    }
  };

  const handleEditorDidMount = (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    registerKumiLanguage(monaco);
    configureKumiLanguage(monaco);
  };

  useImperativeHandle(ref, () => ({
    compile: handleCompile,
  }));

  return (
    <div className="h-full flex flex-col min-h-0">
      <Card className="shadow-lg border-2 flex-1 min-h-0">
        <div className="h-full overflow-hidden">
          <EditorView
            height="100%"
            language="kumi"
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              scrollbar: { vertical: 'auto', horizontal: 'auto', alwaysConsumeMouseWheel: false },
            }}
          />
        </div>
      </Card>
    </div>
  );
});
