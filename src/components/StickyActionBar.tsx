import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Code, Eye, LucideIcon } from 'lucide-react';

type ActionType = 'compile' | 'execute' | 'run' | 'visualize' | 'play' | 'pause' | 'call' | 'changeInputs';

interface ActionConfig {
  icon: LucideIcon;
  label: string;
  loadingText: string;
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  compile: { icon: Code, label: 'Compile', loadingText: 'Compiling…' },
  execute: { icon: Play, label: 'Execute', loadingText: 'Executing…' },
  run: { icon: Play, label: 'Run', loadingText: 'Executing…' },
  call: { icon: Play, label: 'Call', loadingText: 'Executing…' },
  changeInputs: { icon: Play, label: 'Change Inputs', loadingText: 'Executing…' },
  visualize: { icon: Eye, label: 'Visualize', loadingText: 'Executing…' },
  play: { icon: Play, label: 'Play', loadingText: 'Executing…' },
  pause: { icon: Pause, label: 'Pause', loadingText: 'Executing…' },
};

interface StickyActionBarProps {
  action: ActionType;
  onAction: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * Floating action button that sits ABOVE the global bottom bar.
 * Respects --bottom-bar-h and iOS safe area insets.
 */
export function StickyActionBar({
  action,
  onAction,
  disabled,
  isLoading,
}: StickyActionBarProps) {
  const [showLoading, setShowLoading] = useState(false);
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) t = setTimeout(() => setShowLoading(true), 300);
    else setShowLoading(false);
    return () => t && clearTimeout(t);
  }, [isLoading]);

  const bottomOffset = useMemo(
    () => `env(safe-area-inset-bottom, 0px)`,
    []
  );

  const baseBtn =
    'shadow-2xl hover:shadow-primary/20 transition-transform hover:scale-105 focus-ring gap-3 font-semibold';
  const loadingSpinner =
    'h-8 w-8 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent';

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300"
      style={{ bottom: bottomOffset, padding: '0 1rem 1rem 1rem' }}
    >
      <Button
        onClick={onAction}
        disabled={disabled}
        size="lg"
        className={baseBtn}
        style={{
          height: 'clamp(48px, 8vw, 64px)',
          padding: '0 clamp(16px, 4vw, 28px)',
          fontSize: 'clamp(14px, 3vw, 16px)',
          minWidth: 'clamp(160px, 30vw, 240px)',
          gap: '0.375rem',
          borderRadius: '0.75rem',
        }}
      >
        {showLoading ? (
          <>
            <div className={loadingSpinner} />
            {config.loadingText}
          </>
        ) : (
          <>
            <Icon className="h-8 w-8" />
            <span>{config.label}</span>
            <kbd className="px-3 py-2 text-sm font-mono bg-primary-foreground/20 rounded">
              [Ctrl]+[Enter]
            </kbd>
          </>
        )}
      </Button>
    </div>
  );
}
