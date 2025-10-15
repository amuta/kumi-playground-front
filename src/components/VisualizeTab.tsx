import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OutputView } from '@/components/OutputView';
import { VisualizationController } from '@/visualization/controller';
import { VisualizationEngine } from '@/visualization/engine';
import { windowScheduler } from '@/visualization/scheduler';
import { loadArtifactModule } from '@/execution/artifact-runner';
import type { CompileResponse } from '@/api/compile';
import type { Example, VisualizationConfig, ExecutionConfig } from '@/types';

interface VisualizeTabProps {
  compiledResult: CompileResponse;
  example?: Example;
  visualizationConfig?: VisualizationConfig;
  executionConfig?: ExecutionConfig;
}

export interface VisualizeTabRef {
  togglePlay: () => void;
  isPlaying: boolean;
  step: () => void;
}

export const VisualizeTab = forwardRef<VisualizeTabRef, VisualizeTabProps>(function VisualizeTab(
  { compiledResult, example, visualizationConfig, executionConfig },
  ref
) {
  const controllerRef = useRef<VisualizationController | null>(null);
  const [outputs, setOutputs] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // build controller once
  if (controllerRef.current == null) {
    controllerRef.current = new VisualizationController(windowScheduler);
    controllerRef.current.onUpdate = (snap) => setOutputs(snap.outputs);
    controllerRef.current.onError = (msg) => setError(msg);
  }

  // init engine when artifact_url or example changes
  useEffect(() => {
    const url = compiledResult.artifact_url;
    if (!url) {
      setError('No executable artifact available. Recompile to get artifact_url.');
      return;
    }
    if (!compiledResult.output_schema) {
      setError('Missing output_schema from compile result.');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const mod = await loadArtifactModule(url);
        if (!mounted) return;

        const engine = new VisualizationEngine({
          mod,
          outputSchema: compiledResult.output_schema,
          execConfig: executionConfig,
          initialInput: example?.base_input,
        });

        await controllerRef.current!.init({
          engine,
          baseInput: example?.base_input,
        });

        setOutputs(null);
        setError(null);
        setIsPlaying(false);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load artifact');
      }
    })();

    return () => {
      mounted = false;
      controllerRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledResult.artifact_url, example?.id]);

  const step = () => controllerRef.current?.step();
  const togglePlay = () => {
    const speed = Math.max(50, executionConfig?.continuous?.playback_speed ?? 250);
    if (controllerRef.current?.isPlaying) controllerRef.current.pause();
    else controllerRef.current?.play(speed);
    setIsPlaying(controllerRef.current?.isPlaying ?? false);
  };

  useImperativeHandle(ref, () => ({
    togglePlay,
    isPlaying,
    step,
  }), [isPlaying]);

  return (
    <div className="h-full min-h-0 p-6">
      <div className="h-full">
        <Card className="shadow-lg border-2 h-full max-w-4xl mx-auto">
          <CardContent className="pt-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="text-sm text-muted-foreground">
                {isPlaying ? 'Playing' : 'Paused'}
              </div>
            </div>

            {error ? (
              <div className="text-destructive font-mono text-sm">{error}</div>
            ) : outputs ? (
              <div className="flex-1 min-h-0">
                <OutputView
                  results={outputs}
                  outputSchema={compiledResult.output_schema}
                  example={example}
                  visualizationConfig={visualizationConfig}
                />
              </div>
            ) : (
              <div className="flex-1 min-h-0 grid place-items-center text-muted-foreground">
                Press Play to visualize. Use ⌘/Ctrl+Enter to toggle.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
