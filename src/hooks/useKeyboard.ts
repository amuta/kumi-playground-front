import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

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
