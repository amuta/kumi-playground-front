import type { OutputField } from '@/types';
import { renderAsciiTable } from '@/rendering/ascii-table';
import { renderAsciiGrid } from '@/rendering/ascii-grid';

interface OutputDisplayProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
}

export function OutputDisplay({ results, outputSchema }: OutputDisplayProps) {
  const renderValue = (name: string, value: any, schema: OutputField) => {
    if (schema.axes.length === 0) {
      return (
        <div className="py-2">
          <span className="font-medium">{name}:</span>{' '}
          <span className="font-mono">{JSON.stringify(value)}</span>
        </div>
      );
    }

    if (schema.axes.length === 1) {
      if (Array.isArray(value)) {
        const tableData = value.map((item, idx) => ({
          index: idx,
          value: item,
        }));
        const ascii = renderAsciiTable(tableData, ['index', 'value']);
        return (
          <div>
            <div className="font-medium mb-2">{name}:</div>
            <pre className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
              {ascii}
            </pre>
          </div>
        );
      }
    }

    if (schema.axes.length === 2) {
      if (Array.isArray(value) && Array.isArray(value[0])) {
        const ascii = renderAsciiGrid(value);
        return (
          <div>
            <div className="font-medium mb-2">{name}:</div>
            <pre className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
              {ascii}
            </pre>
          </div>
        );
      }
    }

    return (
      <div>
        <div className="font-medium mb-2">{name}:</div>
        <pre className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(results).map(([name, value]) => (
        <div key={name}>{renderValue(name, value, outputSchema[name])}</div>
      ))}
    </div>
  );
}
