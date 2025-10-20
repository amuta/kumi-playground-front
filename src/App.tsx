import { useState, useRef, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaTabContainer, type SchemaTabContainerRef } from '@/components/SchemaTabContainer';
import { CompiledCodeView } from '@/components/CompiledCodeView';
import { ExecuteTab, type ExecuteTabRef } from '@/components/ExecuteTab';
import { ExampleSelector } from '@/components/ExampleSelector';
import { StickyActionBar } from '@/components/StickyActionBar';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { VisualizeTab, type VisualizeTabRef } from '@/components/VisualizeTab';
import { useExampleState } from '@/hooks/useExampleState';
import type { CompileResponse } from '@/api/compile';
import type { CompileErrorInfo } from '@/components/SchemaEditor';
import { examples, getDefaultExample } from '@/examples';
import type { Example, VisualizationType } from '@/types';

function hasVisualization(
  compiled: CompileResponse | null,
  example: Example,
  visCfg: ReturnType<typeof useExampleState>['visualizationConfig'],
): boolean {
  if (!compiled) return false;
  const outputs = Object.keys(compiled.output_schema || {});
  for (const name of outputs) {
    const t1 = visCfg?.outputs?.[name]?.type as VisualizationType | undefined;
    const t2 = example?.visualizations?.[name] as VisualizationType | undefined;
    if ((t1 && t1 !== 'json') || (t2 && t2 !== 'json')) return true;
  }
  return false;
}

export function App() {
  const schemaTabContainerRef = useRef<SchemaTabContainerRef>(null);
  const executeTabRef = useRef<ExecuteTabRef>(null);
  const visualizeTabRef = useRef<VisualizeTabRef>(null);
  const [currentExample, setCurrentExample] = useState<Example>(getDefaultExample());

  useEffect(() => {
    // Suppress Monaco language parsing errors that don't affect functionality
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('trying to pop an empty stack')) {
        event.preventDefault();
        console.log('Suppressed Monaco parser error');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const {
    schemaSource,
    setSchemaSource,
    compiledResult,
    setCompiledResult,
    executionConfig,
    setExecutionConfig,
    visualizationConfig,
    setVisualizationConfig,
    canvasConfig,
    setCanvasConfig,
  } = useExampleState(currentExample);

  const [compileError, setCompileError] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | undefined>();
  const [errorColumn, setErrorColumn] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState('schema');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeTabSubTab, setExecuteTabSubTab] = useState<'input' | 'output'>('input');

  const canVisualize = useMemo(
    () => hasVisualization(compiledResult, currentExample, visualizationConfig),
    [compiledResult, currentExample, visualizationConfig]
  );

  const handleCompileSuccess = (result: CompileResponse) => {
    setCompiledResult(result);
    setCompileError(null);
    setErrorLine(undefined);
    setErrorColumn(undefined);
    setActiveTab('compiled');
  };

  const handleCompileError = (error: CompileErrorInfo) => {
    console.log('App.tsx handleCompileError called with:', error);
    setCompileError(error.message);
    setErrorLine(error.line);
    setErrorColumn(error.column);
    setCompiledResult(null);
  };

  const handleExampleChange = (example: Example) => {
    setCurrentExample(example);
    setCompiledResult(null);
    setCompileError(null);
    setErrorLine(undefined);
    setErrorColumn(undefined);
    setActiveTab('schema');
  };

  useKeyboard({
    'meta+1': () => { (document.activeElement as HTMLElement)?.blur(); setActiveTab('schema'); },
    'meta+2': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('compiled'); } },
    'meta+3': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('execute'); } },
    'meta+4': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('visualize'); } },
    'ctrl+1': () => { (document.activeElement as HTMLElement)?.blur(); setActiveTab('schema'); },
    'ctrl+2': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('compiled'); } },
    'ctrl+3': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('execute'); } },
    'ctrl+4': () => { if (compiledResult) { (document.activeElement as HTMLElement)?.blur(); setActiveTab('visualize'); } },
    'meta+enter': () => {
      const blur = () => (document.activeElement as HTMLElement)?.blur();
      const go = (tab: 'schema' | 'compiled' | 'execute' | 'visualize') =>
        requestAnimationFrame(() => setActiveTab(tab));

      if (activeTab === 'schema') {
        blur();
        schemaTabContainerRef.current?.compile();
      } else if (activeTab === 'compiled') {
        // Only shortcut to Visualize from codegen if there is an actual viz configured.
        blur();
        go(canVisualize ? 'visualize' : 'execute');
      } else if (activeTab === 'visualize') {
        visualizeTabRef.current?.togglePlay();
      } else {
        executeTabRef.current?.execute();
      }
    },
    'ctrl+enter': () => {
      const blur = () => (document.activeElement as HTMLElement)?.blur();
      const go = (tab: 'schema' | 'compiled' | 'execute' | 'visualize') =>
        requestAnimationFrame(() => setActiveTab(tab));

      if (activeTab === 'schema') {
        blur();
        schemaTabContainerRef.current?.compile();
      } else if (activeTab === 'compiled') {
        blur();
        go(canVisualize ? 'visualize' : 'execute');
      } else if (activeTab === 'visualize') {
        visualizeTabRef.current?.togglePlay();
      } else {
        executeTabRef.current?.execute();
      }
    },
  }, [compiledResult, activeTab, canVisualize]);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-bottom-bar overflow-auto">
      <header className="h-[var(--header-h)] border-b shadow-sm bg-card flex-shrink-0">
        <div className="px-6 h-full flex items-center justify-between max-w-[1800px] mx-auto w-full gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary hidden lg:block">Kumi Play</h1>
          <div className="flex-1 flex items-center justify-center hidden lg:flex">
            <a
              href="https://github.com/amuta/kumi"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 focus-ring border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 font-medium px-4 py-2 rounded-md inline-flex items-center"
              title="View on GitHub"
            >
              <span className="text-sm font-bold">Github</span>
              <Github className="h-5 w-5" />
            </a>
          </div>
          <ExampleSelector examples={examples} currentExample={currentExample} onExampleChange={handleExampleChange} />
          <div className="lg:hidden">
            <a
              href="https://github.com/amuta/kumi"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-primary hover:text-primary/70 transition-colors inline-flex items-center"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="h-under-chrome min-h-0 overflow-hidden">
        <div className="h-full min-h-0 flex flex-col max-w-[1800px] mx-auto w-full p-6 pb-32 sm:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full min-h-0 flex flex-col">
            <div className="sticky top-0 z-20 bg-background">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="schema" className="gap-2 justify-between">Schema<kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-muted rounded flex-shrink-0">⌘1</kbd></TabsTrigger>
                <TabsTrigger value="compiled" disabled={!compiledResult} className="gap-2 justify-between">Codegen<kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-muted rounded flex-shrink-0">⌘2</kbd></TabsTrigger>
                <TabsTrigger value="execute" disabled={!compiledResult} className="gap-2 justify-between">Execute<kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-muted rounded flex-shrink-0">⌘3</kbd></TabsTrigger>
                {/* Keep tab accessible even if no viz configured; content will explain. */}
                <TabsTrigger value="visualize" disabled={!compiledResult} className="gap-2 justify-between">Visualize<kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-muted rounded flex-shrink-0">⌘4</kbd></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative">
              <TabsContent value="schema" className="m-0 h-full" forceMount>
                <SchemaTabContainer
                  ref={schemaTabContainerRef}
                  schemaSource={schemaSource}
                  onSchemaSourceChange={setSchemaSource}
                  executionConfig={executionConfig}
                  visualizationConfig={visualizationConfig}
                  canvasConfig={canvasConfig}
                  onExecutionConfigChange={setExecutionConfig}
                  onVisualizationConfigChange={setVisualizationConfig}
                  onCanvasConfigChange={setCanvasConfig}
                  onCompileSuccess={handleCompileSuccess}
                  onCompileError={handleCompileError}
                  onCompileStart={() => setIsCompiling(true)}
                  onCompileEnd={() => setIsCompiling(false)}
                />
              </TabsContent>

              {compileError && activeTab === 'schema' && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-100 border-t-2 border-red-500 text-red-800 font-mono text-sm z-50">
                  <div>Error: {compileError}</div>
                  {errorLine && errorColumn && (
                    <div>Location: line {errorLine}, column {errorColumn}</div>
                  )}
                </div>
              )}

              <TabsContent value="compiled" className="m-0 h-full">
                {compiledResult && <CompiledCodeView result={compiledResult} />}
              </TabsContent>

              <TabsContent value="execute" className="m-0 h-full">
                {compiledResult && (
                  <ExecuteTab
                    ref={executeTabRef}
                    compiledResult={compiledResult}
                    example={currentExample}
                    executionConfig={executionConfig}
                    hideInput={
                      executionConfig?.type === 'continuous' &&
                      !!executionConfig.continuous?.feedback_mappings?.length
                    }
                    onExecuteStart={() => setIsExecuting(true)}
                    onExecuteEnd={() => setIsExecuting(false)}
                    onActiveSubTabChange={setExecuteTabSubTab}
                  />
                )}
              </TabsContent>

              <TabsContent value="visualize" className="m-0 h-full">
                {compiledResult && (
                  <VisualizeTab
                    ref={visualizeTabRef}
                    compiledResult={compiledResult}
                    example={currentExample}
                    visualizationConfig={visualizationConfig}
                    executionConfig={executionConfig}
                    enabled={canVisualize}
                    canvasConfig={canvasConfig}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {activeTab === 'schema' && (
        <StickyActionBar
          action="compile"
          onAction={() => schemaTabContainerRef.current?.compile()}
          disabled={isCompiling}
          isLoading={isCompiling}
        />
      )}

      {activeTab === 'compiled' && compiledResult && (
        <StickyActionBar
          action={canVisualize ? 'visualize' : 'execute'}
          onAction={() => setActiveTab(canVisualize ? 'visualize' : 'execute')}
        />
      )}

      {activeTab === 'execute' && compiledResult && executeTabSubTab === 'input' && (
        <StickyActionBar
          action="execute"
          onAction={() => executeTabRef.current?.execute()}
          disabled={isExecuting}
          isLoading={isExecuting}
        />
      )}

      {activeTab === 'visualize' && compiledResult && (
        <StickyActionBar
          action={visualizeTabRef.current?.isPlaying ? 'pause' : 'play'}
          onAction={() => visualizeTabRef.current?.togglePlay()}
        />
      )}

      {!(activeTab === 'schema' || (activeTab === 'compiled' && compiledResult) || (activeTab === 'execute' && compiledResult) || (activeTab === 'visualize' && compiledResult)) && (
        <div className="fixed inset-x-0 bottom-0 h-[var(--bottom-bar-h)] border-t bg-background/80 backdrop-blur z-40" />
      )}
    </div>
  );
}
