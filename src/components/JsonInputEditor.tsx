import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

interface JsonInputEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  onError?: (error: string | null) => void;
  height?: string;
}

export function JsonInputEditor({
  value,
  onChange,
  onError,
  height = '100%',
}: JsonInputEditorProps) {
  const [editorValue, setEditorValue] = useState(() => JSON.stringify(value, null, 2));

  useEffect(() => {
    setEditorValue(JSON.stringify(value, null, 2));
  }, [value]);

  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;
    setEditorValue(newValue);
    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
      onError?.(null);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <Editor
      height={height}
      language="json"
      theme="vs-dark"
      value={editorValue}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        formatOnPaste: true,
      }}
    />
  );
}
