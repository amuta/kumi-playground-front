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

  const heading = label ?? name;
  const isRecordTable =
    value.length > 0 &&
    value.every((row) => row && typeof row === 'object' && !Array.isArray(row));

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: Math.abs(val) < 1 ? 2 : 0,
      }).format(val);
    }
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
  };

  const columns = isRecordTable
    ? Array.from(
        value.reduce((set, row) => {
          Object.keys(row as Record<string, any>).forEach((key) => set.add(key));
          return set;
        }, new Set<string>())
      )
    : ['index', 'value'];

  const rows = isRecordTable
    ? (value as Record<string, any>[])
    : value.map((item, idx) => ({ index: idx, value: item }));

  return (
    <div className="flex flex-col h-full min-h-0">
      {heading ? <div className="font-medium mb-2">{heading}</div> : null}
      <div className="flex-1 min-h-0 overflow-auto rounded border border-border">
        <table className="min-w-full border-collapse text-sm" role="table" aria-label={heading ?? name}>
          <thead className="bg-muted/60 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-xs text-muted-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border-border/70 odd:bg-muted/10">
                {columns.map((col) => {
                  const cell = (row as Record<string, any>)[col];
                  const isNumber = typeof cell === 'number';
                  return (
                    <td key={col} className={`px-3 py-2 align-middle whitespace-nowrap ${isNumber ? 'text-right tabular-nums font-mono' : ''}`}>
                      {formatValue(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
