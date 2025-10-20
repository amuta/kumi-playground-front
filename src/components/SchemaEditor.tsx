
import { useImperativeHandle, forwardRef, useRef } from 'react';
import { type Monaco } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import { compileSchema, type CompileResponse, CompilationError, ServerError } from '@/api/compile';
import { registerKumiLanguage, configureKumiLanguage } from '@/language/monaco';
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
      let errorInfo: CompileErrorInfo = { message: 'Compilation failed' };

      if (error instanceof CompilationError) {
        errorInfo = {
          message: error.message,
          line: error.line,
          column: error.column
        };
        if (error.line && error.column) {
          highlightErrorLine(error.line, error.column);
        }
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
      <Card className="overflow-hidden shadow-lg border-2 flex-1 min-h-0">
        <div className="h-full">
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
