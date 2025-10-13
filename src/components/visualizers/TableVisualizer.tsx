import { renderAsciiTable } from '@/rendering/ascii-table';

interface TableVisualizerProps {
  name: string;
  value: any;
}

export function TableVisualizer({ name, value }: TableVisualizerProps) {
  if (!Array.isArray(value)) {
    return (
      <div>
        <div className="font-medium mb-2">{name}:</div>
        <p className="text-destructive text-sm">
          Cannot render as table: expected array, got {typeof value}
        </p>
      </div>
    );
  }

  const tableData = value.map((item, idx) => ({
    index: idx,
    value: item,
  }));

  const ascii = renderAsciiTable(tableData, ['index', 'value']);

  return (
    <div>
      <div className="font-medium mb-2">{name}:</div>
      <pre role="group" className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
        {ascii}
      </pre>
    </div>
  );
}
