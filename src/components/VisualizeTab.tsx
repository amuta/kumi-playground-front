import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OutputView } from '@/components/OutputView';
import { VisualizationController } from '@/visualization/controller';
import { VisualizationEngine } from '@/visualization/engine';
import { loadArtifactModule } from '@/execution/artifact-runner';
import type { CompileResponse } from '@/api/compile';
import { makeBinaryGrid } from '@/input-gen/grid';
import type { Example, VisualizationConfig, ExecutionConfig, CanvasConfig } from '@/types';

interface VisualizeTabProps {
  compiledResult: CompileResponse;
  example?: Example;
  visualizationConfig?: VisualizationConfig;
  executionConfig?: ExecutionConfig;
  canvasConfig?: CanvasConfig;
  enabled?: boolean;
}

export interface VisualizeTabRef {
  togglePlay: () => void;
  step: () => void;
  isPlaying: boolean;
}

export const VisualizeTab = forwardRef<VisualizeTabRef, VisualizeTabProps>(function VisualizeTab(
  { compiledResult, example, visualizationConfig, executionConfig, canvasConfig, enabled = true },
  ref
) {
  const controllerRef = useRef<VisualizationController | null>(null);
  const engineRef = useRef<any>(null);

  const [outputs, setOutputs] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [actualSps, setActualSps] = useState(0);

  // refs for live SPS estimate (EWMA)
  const lastTsRef = useRef<number | null>(null);
  const lastStepRef = useRef(0);

  // init controller once
  if (controllerRef.current == null) {
    controllerRef.current = new VisualizationController();
    controllerRef.current.onUpdate = (snap) => {
      setOutputs(snap.outputs);
      setIsPlaying(controllerRef.current?.isPlaying ?? false);
      setStepCount(snap.stepCount);

      const now = performance.now();
      if (lastTsRef.current != null) {
        const dSteps = snap.stepCount - lastStepRef.current;
        const dt = (now - lastTsRef.current) / 1000;
        if (dSteps > 0 && dt > 0) {
          const inst = dSteps / dt;
          setActualSps((prev) => (prev ? prev * 0.8 + inst * 0.2 : inst));
        }
      }
      lastTsRef.current = now;
      lastStepRef.current = snap.stepCount;
    };
    controllerRef.current.onError = (msg) => setError(msg);
  }

  const effectiveCanvas = canvasConfig ?? example?.canvas_config;

  // Max steps/sec from executionConfig
  const maxStepsPerSec = useMemo(
    () => executionConfig?.continuous?.playback_speed ?? 4,
    [executionConfig?.continuous?.playback_speed]
  );
  const intervalMs = useMemo(
    () => Math.max(16, Math.round(1000 / Math.max(1, maxStepsPerSec))),
    [maxStepsPerSec]
  );

  // allow tests to force main-thread path
  const disableWorker =
    !!(import.meta as any)?.env?.VITE_DISABLE_WORKER ||
    (typeof process !== 'undefined' && (process as any).env?.NODE_ENV === 'test');

  // simple signature so any canvas sizing change forces rebuild
  const canvasSig = JSON.stringify({
    render: effectiveCanvas?.render,
    w: effectiveCanvas?.controls?.width?.default,
    h: effectiveCanvas?.controls?.height?.default,
    density: effectiveCanvas?.controls?.density?.default,
    seed: effectiveCanvas?.controls?.seed?.default,
  });

  // hard rebuild on any change
  useEffect(() => {
    const ctrl = controllerRef.current!;
    const tearDown = () => {
      ctrl.pause();
      engineRef.current?.__terminate?.();
      engineRef.current = null;
      setOutputs(null);
      setIsPlaying(false);
      setStepCount(0);
      setActualSps(0);
      lastTsRef.current = null;
      lastStepRef.current = 0;
    };

    if (!enabled) {
      tearDown();
      setError(null);
      return;
    }

    const url = compiledResult.artifact_url;
    const schema = compiledResult.output_schema;
    if (!url) { setError('No executable artifact available.'); tearDown(); return; }
    if (!schema) { setError('Missing output_schema.'); tearDown(); return; }

    let cancelled = false;
    (async () => {
      try {
        tearDown();

        // initial input: use example base_input or generate from canvas_config
        const c = effectiveCanvas?.controls;
        const generated =
          !example?.base_input && (effectiveCanvas?.render === 'grid2d')
            ? {
                rows: makeBinaryGrid(
                  c?.height?.default ?? 40,
                  c?.width?.default ?? 60,
                  c?.density?.default ?? 0.18,
                  c?.seed?.default
                ),
              }
            : undefined;
        const initialInput = example?.base_input ?? generated ?? {};

        // prefer worker, fall back to main thread
        let engine: any;
        if (typeof Worker !== 'undefined' && !disableWorker) {
          const w = new Worker(new URL('../visualization/engine.worker.ts', import.meta.url), { type: 'module' });

          let last = { stepCount: 0, input: initialInput, outputs: null as any, error: null as string | null };
          const waiters: Array<() => void> = [];
          w.onmessage = (ev: MessageEvent<any>) => {
            if (ev.data?.type === 'snapshot') {
              last = ev.data.payload;
              waiters.shift()?.();
            }
          };
          w.postMessage({ type: 'init', artifactUrl: url, schema, execCfg: executionConfig, initialInput });

          engine = {
            snapshot: () => last,
            setInput: (v: Record<string, any>) => w.postMessage({ type: 'setInput', input: v }),
            setConfig: (cfg: any) => w.postMessage({ type: 'setConfig', execCfg: cfg }),
            step: () => new Promise((resolve) => { waiters.push(() => resolve(last)); w.postMessage({ type: 'step' }); }),
            __terminate: () => w.terminate(),
          };
        } else {
          const mod = await loadArtifactModule(url);
          engine = new VisualizationEngine({ mod, outputSchema: schema, execConfig: executionConfig, initialInput });
        }

        if (cancelled) { engine?.__terminate?.(); return; }

        engineRef.current = engine;
        await ctrl.init({ engine, baseInput: initialInput });

        setOutputs(null);
        setError(null);
        setIsPlaying(ctrl.isPlaying);
        setStepCount(0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to init visualization');
      }
    })();

    return () => {
      cancelled = true;
      tearDown();
    };
  }, [enabled, compiledResult.artifact_url, example?.id, executionConfig, canvasSig, disableWorker]);

  // if speed changes while playing, restart with new interval
  useEffect(() => {
    const ctrl = controllerRef.current!;
    if (ctrl?.isPlaying) {
      ctrl.pause();
      ctrl.play(intervalMs);
      setIsPlaying(ctrl.isPlaying);
    }
  }, [intervalMs]);

  const togglePlay = () => {
    if (!enabled) return;
    const ctrl = controllerRef.current!;
    if (ctrl.isPlaying) ctrl.pause();
    else ctrl.play(intervalMs);
    setIsPlaying(ctrl.isPlaying);
  };

  const stepOnce = () => {
    if (!enabled) return;
    controllerRef.current?.step();
    setIsPlaying(controllerRef.current?.isPlaying ?? false);
  };

  useImperativeHandle(ref, () => ({ togglePlay, step: stepOnce, isPlaying }), [isPlaying, enabled, intervalMs]);

  return (
    <div className="h-full min-h-0 p-6">
      <div className="h-full">
        <Card className="shadow-lg border-2 h-full max-w-4xl mx-auto">
          <CardContent className="pt-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="text-sm text-muted-foreground">
                {enabled ? (isPlaying ? 'Playing' : 'Paused') : 'Visualization disabled'}
              </div>
              <div className="text-xs text-muted-foreground">
                Step: {stepCount} • {Math.round(actualSps)} steps/s
              </div>
            </div>

            {!enabled ? (
              <div className="flex-1 min-h-0 grid place-items-center text-muted-foreground text-center px-8">
                <div>
                  <div className="text-sm space-y-3">
                    <p>No visualization configured</p>
                    <p className="text-xs">
                      Add via{' '}
                      <code className="px-1 py-0.5 bg-muted rounded">visualization_config</code>
                      {' '}or{' '}
                      <code className="px-1 py-0.5 bg-muted rounded">visualizations</code>
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div data-testid="viz-error" className="text-destructive font-mono text-sm">{error}</div>
            ) : outputs ? (
              <div className="flex-1 min-h-0">
                <OutputView
                  results={outputs!}
                  outputSchema={compiledResult.output_schema}
                  example={example}
                  visualizationConfig={visualizationConfig}
                />
              </div>
            ) : (
              <div data-testid="viz-placeholder" className="flex-1 min-h-0 grid place-items-center text-muted-foreground">
                Press Play to visualize. Use ⌘/Ctrl+Enter to toggle.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
