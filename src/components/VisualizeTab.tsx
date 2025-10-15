import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OutputView } from '@/components/OutputView';
import { loadArtifactModule, runAllOutputs } from '@/execution/artifact-runner';
import { applyFeedbackMappings } from '@/execution/feedback-loop';
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
  step: () => Promise<void>;
}

export const VisualizeTab = forwardRef<VisualizeTabRef, VisualizeTabProps>(function VisualizeTab(
  { compiledResult, example, visualizationConfig, executionConfig },
  ref
) {
  const [outputs, setOutputs] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const modRef = useRef<any | null>(null);
  const inputRef = useRef<Record<string, any>>({});
  const playingRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  const timerIdRef = useRef<number | null>(null);

  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { errorRef.current = error; }, [error]);

  useEffect(() => {
    if (example?.base_input) inputRef.current = example.base_input;
    setOutputs(null);
    setError(null);
    stopPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [example?.id]);

  useEffect(() => {
    stopPlay();
    modRef.current = null;
    const url = compiledResult.artifact_url;
    if (url) {
      loadArtifactModule(url).then(m => { modRef.current = m; }).catch(e => setError(String(e)));
    } else {
      setError('No executable artifact available. Recompile to get artifact_url.');
    }
    return () => stopPlay();
  }, [compiledResult.artifact_url]);

  const step = async () => {
    const mod = modRef.current;
    if (!mod) { setError('Artifact not loaded yet'); return; }
    try {
      const result = runAllOutputs(mod, inputRef.current, compiledResult.output_schema);
      setOutputs(result);
      setError(null);
      if (executionConfig?.type === 'continuous' && executionConfig.continuous?.feedback_mappings?.length) {
        inputRef.current = applyFeedbackMappings(executionConfig, result, inputRef.current);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Execution failed');
    }
  };

  const loopOnce = async () => {
    if (!playingRef.current) return;
    await step();
    if (!playingRef.current || errorRef.current) { stopPlay(); return; }
    const delay = Math.max(50, executionConfig?.continuous?.playback_speed ?? 250);
    timerIdRef.current = window.setTimeout(loopOnce, delay) as unknown as number;
  };

  const startPlay = () => {
    if (playingRef.current) return;
    setIsPlaying(true);
    playingRef.current = true;
    loopOnce();
  };

  const stopPlay = () => {
    playingRef.current = false;
    setIsPlaying(false);
    if (timerIdRef.current) { clearTimeout(timerIdRef.current); timerIdRef.current = null; }
  };

  const togglePlay = () => (playingRef.current ? stopPlay() : startPlay());

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
              <div className="text-sm text-muted-foreground">Game of Life</div>
              {/* No in-pane buttons; controlled by StickyActionBar */}
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
