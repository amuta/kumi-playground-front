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
  );
}
