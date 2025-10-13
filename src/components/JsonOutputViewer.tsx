import Editor from '@monaco-editor/react';

interface JsonOutputViewerProps {
  value: any;
  height?: string;
}

export function JsonOutputViewer({ value, height = '300px' }: JsonOutputViewerProps) {
  const jsonString = JSON.stringify(value, null, 2);

  return (
    <Editor
      height={height}
      language="json"
      theme="vs-dark"
      value={jsonString}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
