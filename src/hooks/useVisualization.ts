import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { VisualizationController } from '@/visualization/controller';
import type { ExecutionConfig, OutputField } from '@/types';

export function useVisualization(_opts: {
  artifactUrl?: string;
  initialInput?: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  execConfig?: ExecutionConfig;
}) {
  const ctrl = useMemo(() => new VisualizationController(), []);

  const subscribe = (cb: () => void) => ctrl.onChange(cb);
  const getSnapshot = () => ({
    isPlaying: ctrl.isPlaying,
    stepCount: ctrl.stepCount,
    outputs: ctrl.outputs,
    error: ctrl.error,
  });
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {}, []);

  return {
    ...snap,
    play: (speed = 250) => ctrl.play(speed),
    pause: () => ctrl.pause(),
    toggle: () => (ctrl.isPlaying ? ctrl.pause() : ctrl.play(250)),
    step: () => ctrl.step(),
    setInput: (v: Record<string, any>) => ctrl.setInput(v),
  };
}
