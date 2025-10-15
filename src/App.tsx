// src/App.tsx
import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaTabContainer, type SchemaTabContainerRef } from '@/components/SchemaTabContainer';
import { CompiledCodeView } from '@/components/CompiledCodeView';
import { ExecuteTab, type ExecuteTabRef } from '@/components/ExecuteTab';
import { ExampleSelector } from '@/components/ExampleSelector';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { StickyActionBar } from '@/components/StickyActionBar';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { VisualizeTab, type VisualizeTabRef } from '@/components/VisualizeTab';
import { useExampleState } from '@/hooks/useExampleState';
import type { CompileResponse } from '@/api/compile';
import { examples, getDefaultExample } from '@/examples';
import type { Example } from '@/types';

export function App() {
  const schemaTabContainerRef = useRef<SchemaTabContainerRef>(null);
  const executeTabRef = useRef<ExecuteTabRef>(null);
  const visualizeTabRef = useRef<VisualizeTabRef>(null);
  const [currentExample, setCurrentExample] = useState<Example>(getDefaultExample());

  const {
    schemaSource,
    setSchemaSource,
    compiledResult,
    setCompiledResult,
    executionConfig,
    setExecutionConfig,
    visualizationConfig,
    setVisualizationConfig,
  } = useExampleState(currentExample);

  const [compileError, setCompileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('schema');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCompileSuccess = (result: CompileResponse) => {
    setCompiledResult(result);
    setCompileError(null);
    setActiveTab('compiled');
  };

  const handleCompileError = (error: string) => { setCompileError(error); setCompiledResult(null); };

  const handleExampleChange = (example: Example) => {
    setCurrentExample(example);
    setCompiledResult(null);
    setCompileError(null);
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
        blur();
        go('visualize');     // was 'execute'
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
        go('visualize');     // was 'execute'
      } else if (activeTab === 'visualize') {
        visualizeTabRef.current?.togglePlay();
      } else {
        executeTabRef.current?.execute();
      }
    },
  }, [compiledResult, activeTab]);

  return (
    <div className="h-screen flex flex-col bg-background pb-bottom-bar overflow-hidden">
      <header className="h-[var(--header-h)] border-b shadow-sm bg-card flex-shrink-0">
        <div className="px-6 h-full flex items-center justify-between max-w-[1800px] mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Kumi Play</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(true)} className="gap-2 focus-ring text-muted-foreground hover:text-foreground">
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs font-mono bg-muted rounded">?</kbd>
            </Button>
            <ExampleSelector examples={examples} currentExample={currentExample} onExampleChange={handleExampleChange} />
          </div>
        </div>
      </header>

      <main className="h-under-chrome min-h-0 overflow-hidden">
        <div className="h-full min-h-0 flex flex-col max-w-[1800px] mx-auto w-full p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full min-h-0 flex flex-col">
            <div className="sticky top-0 z-20 bg-background">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="schema" className="gap-3">Schema<kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘1</kbd></TabsTrigger>
                <TabsTrigger value="compiled" disabled={!compiledResult} className="gap-3">Compiled Code<kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘2</kbd></TabsTrigger>
                <TabsTrigger value="execute" disabled={!compiledResult} className="gap-3">Execute<kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘3</kbd></TabsTrigger>
                <TabsTrigger value="visualize" disabled={!compiledResult} className="gap-3">Visualize<kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-xs font-mono bg-muted rounded">⌘4</kbd></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="schema" className="m-0 h-full">
                <SchemaTabContainer
                  ref={schemaTabContainerRef}
                  schemaSource={schemaSource}
                  onSchemaSourceChange={setSchemaSource}
                  executionConfig={executionConfig}
                  visualizationConfig={visualizationConfig}
                  onExecutionConfigChange={setExecutionConfig}
                  onVisualizationConfigChange={setVisualizationConfig}
                  onCompileSuccess={handleCompileSuccess}
                  onCompileError={handleCompileError}
                  compileError={compileError}
                  onCompileStart={() => setIsCompiling(true)}
                  onCompileEnd={() => setIsCompiling(false)}
                />
              </TabsContent>

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
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <KeyboardShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

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
          action="visualize"
          onAction={() => setActiveTab('visualize')}
        />
      )}

      {activeTab === 'execute' && compiledResult && (
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
