// components/StickyActionBar.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Code } from 'lucide-react';

interface StickyActionBarProps {
  action: 'compile' | 'execute' | 'run';
  onAction: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * Floating action button that sits ABOVE the global bottom bar.
 * Respects --bottom-bar-h and iOS safe area insets.
 */
export function StickyActionBar({ action, onAction, disabled, isLoading }: StickyActionBarProps) {
  const isCompile = action === 'compile';
  const isRun = action === 'run';
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) t = setTimeout(() => setShowLoading(true), 300);
    else setShowLoading(false);
    return () => t && clearTimeout(t);
  }, [isLoading]);

  const bottomOffset = useMemo(
    () => `calc(var(--bottom-bar-h, 56px) + env(safe-area-inset-bottom, 0px) + 0.75rem)`,
    []
  );

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300"
      style={{ bottom: bottomOffset }}
    >
      <Button
        onClick={onAction}
        disabled={disabled}
        size="lg"
        className="h-14 px-8 shadow-2xl hover:shadow-primary/20 transition-transform hover:scale-105 focus-ring gap-3 text-base font-semibold"
      >
        {showLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            {isCompile ? 'Compiling…' : 'Executing…'}
          </>
        ) : (
          <>
            {isCompile ? (
              <>
                <Code className="h-5 w-5" />
                Compile
              </>
            ) : isRun ? (
              <>
                <Play className="h-5 w-5" />
                Run
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Execute
              </>
            )}
            <kbd className="ml-8 px-2 py-1 text-xs font-mono bg-primary-foreground/20 rounded">
              {isRun ? '[Ctrl]+[Enter]' : '[Ctrl]+[Enter]'}
            </kbd>
          </>
        )}
      </Button>
    </div>
  );
}
