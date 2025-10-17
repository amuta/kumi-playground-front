import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Code, Eye } from 'lucide-react';

interface StickyActionBarProps {
  action: 'compile' | 'execute' | 'run' | 'visualize' | 'play' | 'pause';
  onAction: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  /** One-time visual boost on first render */
  boostOnFirstRender?: boolean;
}

const SEEN_KEY = 'sticky_action_bar_seen_v1';

/**
 * Floating action button that sits ABOVE the global bottom bar.
 * Respects --bottom-bar-h and iOS safe area insets.
 */
export function StickyActionBar({
  action,
  onAction,
  disabled,
  isLoading,
  boostOnFirstRender = true,
}: StickyActionBarProps) {
  const isCompile = action === 'compile';
  const isRun = action === 'run';
  const isExecute = action === 'execute';
  const isVisualize = action === 'visualize';
  const isPlay = action === 'play';
  const isPause = action === 'pause';

  const [showLoading, setShowLoading] = useState(false);
  const [firstBoost, setFirstBoost] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) t = setTimeout(() => setShowLoading(true), 300);
    else setShowLoading(false);
    return () => t && clearTimeout(t);
  }, [isLoading]);

  // One-time boost on first render
  useEffect(() => {
    if (!boostOnFirstRender) return;
    const seen = typeof window !== 'undefined' && localStorage.getItem(SEEN_KEY);
    if (!seen) setFirstBoost(true);
  }, [boostOnFirstRender]);

  // Auto-dismiss boost after a few seconds
  useEffect(() => {
    if (!firstBoost) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
      setFirstBoost(false);
    }, 3500);
    return () => clearTimeout(t);
  }, [firstBoost]);

  const bottomOffset = useMemo(
    () => `calc(var(--bottom-bar-h, 56px) + env(safe-area-inset-bottom, 0px) + 0.75rem)`,
    []
  );

  const handleClick = () => {
    if (firstBoost) {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
      setFirstBoost(false);
    }
    onAction();
  };

  // Base size bumped; firstBoost adds temporary emphasis
  const baseBtn =
    'h-24 px-16 text-lg shadow-2xl hover:shadow-primary/20 transition-transform hover:scale-105 focus-ring gap-3 font-semibold';
  const boosted =
    'ring-4 ring-primary/40 shadow-primary/40 scale-105 animate-pulse';
  const loadingSpinner =
    'h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent';

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300"
      style={{ bottom: bottomOffset }}
    >
      <Button
        onClick={handleClick}
        disabled={disabled}
        size="lg"
        className={`${baseBtn} ${firstBoost ? boosted : ''}`}
      >
        {showLoading ? (
          <>
            <div className={loadingSpinner} />
            {isCompile ? 'Compiling…' : 'Executing…'}
          </>
        ) : (
          <>
            {isCompile && (<><Code className="h-6 w-6" />Compile</>)}
            {isRun && (<><Play className="h-6 w-6" />Run</>)}
            {isExecute && (<><Play className="h-6 w-6" />Execute</>)}
            {isVisualize && (<><Eye className="h-6 w-6" />Visualize</>)}
            {isPlay && (<><Play className="h-6 w-6" />Play</>)}
            {isPause && (<><Pause className="h-6 w-6" />Pause</>)}
            <kbd className="ml-8 px-2.5 py-1.5 text-xs font-mono bg-primary-foreground/20 rounded">
              {isPlay || isPause ? '[Ctrl]+[Enter]' : '[Ctrl]+[Enter]'}
            </kbd>
          </>
        )}
      </Button>
    </div>
  );
}
