import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import type { CompileResponse } from '@/api/compile';

interface CompiledCodeViewProps {
  result: CompileResponse;
  onNavigateToExecute?: () => void;
}

export function CompiledCodeView({ result, onNavigateToExecute }: CompiledCodeViewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Compiled Code</h2>
        {onNavigateToExecute && (
          <Button onClick={onNavigateToExecute} className="gap-2">
            <Play className="h-4 w-4" />
            Run
          </Button>
        )}
      </div>
      <Tabs defaultValue="js">
        <TabsList>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
          <TabsTrigger value="ruby">Ruby</TabsTrigger>
          <TabsTrigger value="lir">LIR</TabsTrigger>
        </TabsList>

        <TabsContent value="js" className="mt-4">
          <Card className="overflow-hidden">
            <div className="h-[600px]">
              <Editor
                height="100%"
                language="javascript"
                value={result.js_src}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ruby" className="mt-4">
          <Card className="overflow-hidden">
            <div className="h-[600px]">
              <Editor
                height="100%"
                language="ruby"
                value={result.ruby_src}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lir" className="mt-4">
          <Card className="overflow-hidden">
            <div className="h-[600px]">
              <Editor
                height="100%"
                language="plaintext"
                value={result.lir}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
