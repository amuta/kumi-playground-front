import { Component, ReactNode } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';

interface EditorViewProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  onMount?: OnMount;
  readOnly?: boolean;
  height?: string;
  options?: MonacoEditor.IStandaloneEditorConstructionOptions;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class EditorErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Suppress Monaco language parsing errors
    if (error.message.includes('trying to pop an empty stack')) {
      console.log('Suppressed Monaco parser error (this is normal for syntax errors)', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100%', background: '#1e1e1e', color: '#d4d4d4', padding: '16px', overflow: 'auto' }}>
          <p>Editor encountered an error. This usually happens with invalid syntax.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function EditorView({ value, language, onChange, onMount, readOnly = false, height = '100%', options = {} }: EditorViewProps) {
  const handleMount: OnMount = (editor, monaco) => {
    const keybindingsService = (editor as any)._standaloneKeybindingService;
    if (keybindingsService) {
      const bindings = [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit1,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit2,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit3,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
      ];
      bindings.forEach(k => { keybindingsService.addDynamicKeybinding(`-${k}`, k, () => {}); });
    }
    onMount?.(editor, monaco);
  };

  return (
    <EditorErrorBoundary>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: readOnly ? true : false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          readOnly,
          ...options,
        }}
      />
    </EditorErrorBoundary>
  );
}
