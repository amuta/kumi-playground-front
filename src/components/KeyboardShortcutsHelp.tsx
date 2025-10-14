import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'Enter'], description: 'Compile (in Schema) / Execute (in Execute)', category: 'Primary Actions' },
  { keys: ['⌘', 'S'], description: 'Compile schema', category: 'Primary Actions' },
  { keys: ['⌘', '1'], description: 'Go to Schema tab', category: 'Navigation' },
  { keys: ['⌘', '2'], description: 'Go to Compiled Code tab', category: 'Navigation' },
  { keys: ['⌘', '3'], description: 'Go to Execute tab', category: 'Navigation' },
  { keys: ['⌘', 'K'], description: 'Toggle this help', category: 'Help' },
  { keys: ['?'], description: 'Toggle this help', category: 'Help' },
  { keys: ['Esc'], description: 'Close this help', category: 'Help' },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
  }, []);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const translateKey = (key: string) => {
    if (isMac) return key;
    return key.replace('⌘', 'Ctrl');
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl shadow-2xl border-2 animate-in fade-in-0 zoom-in-95 duration-200 m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Keyboard Shortcuts</CardTitle>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent transition-colors focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm min-w-[2rem] text-center"
                        >
                          {translateKey(key)}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Esc</kbd> or click outside to close
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
