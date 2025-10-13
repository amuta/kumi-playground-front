import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { compileSchema, type CompileResponse } from '@/api/compile';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCompileSuccess: (result: CompileResponse) => void;
  onCompileError: (error: string) => void;
  compileError: string | null;
}

export function SchemaEditor({
  value,
  onChange,
  onCompileSuccess,
  onCompileError,
  compileError,
}: SchemaEditorProps) {
  const [isCompiling, setIsCompiling] = useState(false);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compileSchema(value);
      onCompileSuccess(result);
    } catch (error) {
      onCompileError(error instanceof Error ? error.message : 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="h-[600px]">
          <Editor
            height="100%"
            defaultLanguage="ruby"
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleCompile} disabled={isCompiling} size="lg">
          {isCompiling ? 'Compiling...' : 'Compile'}
        </Button>

        {compileError && (
          <Card className="flex-1 p-4 bg-destructive/10 border-destructive">
            <p className="text-sm text-destructive font-mono">{compileError}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
