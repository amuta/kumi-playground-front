import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { CompileResponse } from '@/api/compile';

interface CompiledCodeViewProps {
  result: CompileResponse;
}

export function CompiledCodeView({ result }: CompiledCodeViewProps) {
  return (
    <div>
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
