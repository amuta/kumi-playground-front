import { renderAsciiTable } from '@/rendering/ascii-table';

interface TableVisualizerProps {
  name: string;
  value: any;
  label?: string;
}

export function TableVisualizer({ name, value, label }: TableVisualizerProps) {
  if (!Array.isArray(value)) {
    return (
      <div>
        <div className="font-medium mb-2">{label ?? name}</div>
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
  const heading = label ?? name;

  return (
    <div className="flex flex-col h-full min-h-0">
      {heading ? <div className="font-medium mb-2">{heading}</div> : null}
      <pre
        role="group"
        className="font-mono text-sm bg-muted p-4 rounded overflow-auto flex-1 min-h-0"
      >
        {ascii}
      </pre>
    </div>
  );
}
