import { useEffect, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

const isEditableElement = (element: Element | null): boolean => {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase?.() || '';
  if (tag === 'input' || tag === 'textarea') return !(element as HTMLInputElement).readOnly;
  if ((element as HTMLElement).isContentEditable) return true;
  if (element.closest('.monaco-editor')) return true;
  return false;
};

const shouldIgnoreShortcut = (key: string, target: Element | null): boolean => {
  const inEditor = isEditableElement(target);
  if (!inEditor) return false;

  const allowedInEditor = [
    'meta+s', 'ctrl+s',
    'meta+enter', 'ctrl+enter',
    'escape', 'esc',
    '?',
  ];
  return !allowedInEditor.includes(key);
};

export function useKeyboard(keyMap: KeyMap, deps: unknown[] = []) {
  const throttleRef = useRef(0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase(),
      ].filter(Boolean).join('+');

      if (shouldIgnoreShortcut(key, event.target as Element)) return;

      const now = performance.now();
      if (now - throttleRef.current < 60) return;

      const action = keyMap[key];
      if (!action) return;

      throttleRef.current = now;

      // If focus is on a tab trigger, blur it so shortcuts still work.
      const targetEl = event.target as Element | null;
      const tabEl = targetEl?.closest?.('[role="tab"]') as HTMLElement | null;
      if (tabEl) tabEl.blur();

      event.preventDefault();
      event.stopPropagation();
      // @ts-ignore
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

      action(event);
    };

    // Capture phase to beat Radix key handlers and prevent flicker
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true } as any);
  }, deps);
}
