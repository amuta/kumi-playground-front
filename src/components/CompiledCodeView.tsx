import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { CompileResponse } from '@/api/compile';

interface CompiledCodeViewProps {
  result: CompileResponse;
}

export function CompiledCodeView({ result }: CompiledCodeViewProps) {
  return (
    <div className="h-[calc(100vh-200px)]">
      <Tabs defaultValue="js" className="h-full flex flex-col">
        <TabsList>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
          <TabsTrigger value="ruby">Ruby</TabsTrigger>
          <TabsTrigger value="lir">LIR</TabsTrigger>
        </TabsList>

        <TabsContent value="js" className="flex-1 mt-4">
          <Card className="h-full overflow-hidden">
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
          </Card>
        </TabsContent>

        <TabsContent value="ruby" className="flex-1 mt-4">
          <Card className="h-full overflow-hidden">
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
          </Card>
        </TabsContent>

        <TabsContent value="lir" className="flex-1 mt-4">
          <Card className="h-full overflow-hidden">
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
