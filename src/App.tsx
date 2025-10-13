import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaEditor } from '@/components/SchemaEditor';
import { CompiledCodeView } from '@/components/CompiledCodeView';
import { ExecuteTab } from '@/components/ExecuteTab';
import { ExampleSelector } from '@/components/ExampleSelector';
import type { CompileResponse } from '@/api/compile';
import { examples, getDefaultExample } from '@/examples';
import type { Example } from '@/types';

export function App() {
  const [currentExample, setCurrentExample] = useState<Example>(getDefaultExample());
  const [schemaSource, setSchemaSource] = useState(currentExample.schema_src);
  const [compiledResult, setCompiledResult] = useState<CompileResponse | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('schema');

  const handleCompileSuccess = (result: CompileResponse) => {
    setCompiledResult(result);
    setCompileError(null);
    setActiveTab('execute');
  };

  const handleCompileError = (error: string) => {
    setCompileError(error);
    setCompiledResult(null);
  };

  const handleExampleChange = (example: Example) => {
    setCurrentExample(example);
    setSchemaSource(example.schema_src);
    setCompiledResult(null);
    setCompileError(null);
    setActiveTab('schema');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kumi Play</h1>
          <ExampleSelector
            examples={examples}
            currentExample={currentExample}
            onExampleChange={handleExampleChange}
          />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="compiled" disabled={!compiledResult}>
              Compiled Code
            </TabsTrigger>
            <TabsTrigger value="execute" disabled={!compiledResult}>
              Execute
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-4">
            <SchemaEditor
              value={schemaSource}
              onChange={setSchemaSource}
              onCompileSuccess={handleCompileSuccess}
              onCompileError={handleCompileError}
              compileError={compileError}
            />
          </TabsContent>

          <TabsContent value="compiled" className="mt-4">
            {compiledResult && <CompiledCodeView result={compiledResult} />}
          </TabsContent>

          <TabsContent value="execute" className="mt-4">
            {compiledResult && <ExecuteTab compiledResult={compiledResult} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
