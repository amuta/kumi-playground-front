import Editor from '@monaco-editor/react';

interface JsonOutputViewerProps {
  value: any;
  height?: string;
}

function safeJsonStringify(value: any): string {
  if (value === undefined) {
    return 'undefined';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('circular')) {
      return JSON.stringify(
        {
          error: 'Circular reference detected',
          message: 'Cannot stringify object with circular references',
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        error: 'Serialization error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      null,
      2
    );
  }
}

export function JsonOutputViewer({ value, height = '300px' }: JsonOutputViewerProps) {
  const jsonString = safeJsonStringify(value);

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
