import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

const isEditableElement = (element: Element | null): boolean => {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') {
    return !(element as HTMLInputElement).readOnly;
  }
  if ((element as HTMLElement).isContentEditable) return true;
  if (element.closest('.monaco-editor')) return true;
  return false;
};

const shouldIgnoreShortcut = (key: string, target: Element | null): boolean => {
  const isInEditor = isEditableElement(target);

  if (!isInEditor) return false;

  const allowedInEditor = [
    'meta+s', 'ctrl+s',
    'meta+enter', 'ctrl+enter',
    'escape', 'esc'
  ];

  return !allowedInEditor.includes(key);
};

export function useKeyboard(keyMap: KeyMap, deps: unknown[] = []) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (shouldIgnoreShortcut(key, event.target as Element)) {
        return;
      }

      const action = keyMap[key];
      if (action) {
        event.preventDefault();
        action(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, deps);
}
