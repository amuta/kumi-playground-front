import { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { EditorView } from '@/components/EditorView';
import type { CompileResponse } from '@/api/compile';

interface CompiledCodeViewProps {
  result: CompileResponse;
}

function CompiledCodeViewComponent({ result }: CompiledCodeViewProps) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <Tabs defaultValue="js" className="flex-1 min-h-0 flex flex-col">
        <TabsList className="w-full justify-start gap-1 bg-transparent border-0 p-0">
          <TabsTrigger value="js" className="flex-1">JavaScript</TabsTrigger>
          <TabsTrigger value="ruby" className="flex-1">Ruby</TabsTrigger>
          <TabsTrigger value="lir" className="flex-1">LIR</TabsTrigger>
        </TabsList>

        <TabsContent value="js" className="flex-1 min-h-0 m-0">
          <Card className="overflow-hidden h-full">
            <EditorView
              height="100%"
              language="javascript"
              value={result.js_src}
              readOnly
              options={{ scrollbar: { vertical: 'hidden', horizontal: 'auto' } }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="ruby" className="flex-1 min-h-0 m-0">
          <Card className="overflow-hidden h-full">
            <EditorView
              height="100%"
              language="ruby"
              value={result.ruby_src}
              readOnly
              options={{ scrollbar: { vertical: 'hidden', horizontal: 'auto' } }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="lir" className="flex-1 min-h-0 m-0">
          <Card className="overflow-hidden h-full">
            <EditorView
              height="100%"
              language="plaintext"
              value={result.lir}
              readOnly
              options={{ scrollbar: { vertical: 'hidden', horizontal: 'auto' } }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const CompiledCodeView = memo(CompiledCodeViewComponent, (prevProps, nextProps) => {
  return prevProps.result.schema_hash === nextProps.result.schema_hash;
});
