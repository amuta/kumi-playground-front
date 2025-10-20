// components/JsonOutputEditor.tsx
import { EditorView } from '@/components/EditorView';

interface JsonOutputEditorProps {
  value: any;
  height?: string; // use "100%" to fill parent
}

function safeJsonStringify(value: any): string {
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const payload =
      error instanceof TypeError && msg.includes('circular')
        ? {
          error: 'Circular reference detected',
          message: 'Cannot stringify object with circular references',
        }
        : { error: 'Serialization error', message: msg };
    return JSON.stringify(payload, null, 2);
  }
}

export function JsonOutputEditor({ value, height = '100%' }: JsonOutputEditorProps) {
  const jsonString = safeJsonStringify(value);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <EditorView
        height={height}
        language="json"
        value={jsonString}
        readOnly
        options={{
          tabSize: 2,
          scrollbar: { vertical: 'auto', horizontal: 'auto', alwaysConsumeMouseWheel: false },
        }}
      />
    </div>
  );
}
