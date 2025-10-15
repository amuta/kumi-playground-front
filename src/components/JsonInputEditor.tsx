import { useState, useEffect } from 'react';
import { EditorView } from '@/components/EditorView';

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
    <EditorView
      height={height}
      language="json"
      value={editorValue}
      onChange={handleChange}
      options={{
        tabSize: 2,
        formatOnPaste: true,
      }}
    />
  );
}
