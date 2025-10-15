import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { VisualizationController } from '@/visualization/controller';
import { WindowScheduler } from '@/visualization/scheduler';
import type { ExecutionConfig, OutputField } from '@/types';

export function useVisualization(opts: {
  artifactUrl?: string;
  initialInput?: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  execConfig?: ExecutionConfig;
}) {
  const ctrl = useMemo(
    () => new VisualizationController(new WindowScheduler()),
    []
  );

  const subscribe = (cb: () => void) => ctrl.onChange(cb);
  const getSnapshot = () => ({
    isPlaying: ctrl.isPlaying,
    stepCount: ctrl.stepCount,
    outputs: ctrl.outputs,
    error: ctrl.error,
  });
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ctrl.init({
      artifactUrl: opts.artifactUrl || '',
      initialInput: opts.initialInput || {},
      outputSchema: opts.outputSchema,
      execConfig: opts.execConfig,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.artifactUrl]);

  return {
    ...snap,
    play: () => ctrl.play(opts.execConfig),
    pause: () => ctrl.pause(),
    toggle: () => ctrl.toggle(opts.execConfig),
    step: () => ctrl.step(),
    setInput: (v: Record<string, any>) => ctrl.setInput(v),
  };
}
