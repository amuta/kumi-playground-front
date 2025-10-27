import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
  position?: 'top' | 'bottom';
}

export function ErrorNotification({
  message,
  onClose,
  autoCloseDuration = 5000,
  position = 'top',
}: ErrorNotificationProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoCloseDuration > 0) {
      timeoutRef.current = setTimeout(onClose, autoCloseDuration);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onClose, autoCloseDuration]);

  const positionClasses = position === 'top'
    ? 'top-16 left-1/2 -translate-x-1/2'
    : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <div className={`absolute ${positionClasses} z-50 max-w-md px-4 pointer-events-none`}>
      <div
        className="px-6 py-4 border-2 border-amber-700 rounded-lg shadow-xl flex items-start gap-4 pointer-events-auto"
        style={{
          backgroundColor: 'rgba(78, 40, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-100 font-mono leading-relaxed">
            {message}
          </p>
        </div>
        <div
          onClick={onClose}
          className="flex-shrink-0 cursor-pointer text-amber-100 hover:text-amber-50 transition-colors flex items-center justify-center"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
        >
          <X className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
