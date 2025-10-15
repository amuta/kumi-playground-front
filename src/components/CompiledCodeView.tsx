import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
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
              <EditorView
                height="100%"
                language="javascript"
                value={result.js_src}
                readOnly
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ruby" className="mt-4">
          <Card className="overflow-hidden">
            <div className="h-[600px]">
              <EditorView
                height="100%"
                language="ruby"
                value={result.ruby_src}
                readOnly
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lir" className="mt-4">
          <Card className="overflow-hidden">
            <div className="h-[600px]">
              <EditorView
                height="100%"
                language="plaintext"
                value={result.lir}
                readOnly
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
