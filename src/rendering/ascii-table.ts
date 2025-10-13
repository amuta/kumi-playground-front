export function renderAsciiTable(
  data: Record<string, any>[],
  columns: string[]
): string {
  if (data.length === 0 || columns.length === 0) return '';

  const colWidths = columns.map(col => {
    const dataWidth = Math.max(
      ...data.map(row => String(row[col] ?? '').length)
    );
    return Math.max(col.length, dataWidth, 3);
  });

  const header = columns
    .map((col, i) => col.padEnd(colWidths[i]))
    .join(' │ ');

  const separator = colWidths
    .map(width => '─'.repeat(width))
    .join('─┼─');

  const rows = data.map(row =>
    columns
      .map((col, i) => {
        const value = row[col];
        const str =
          typeof value === 'number' ? value.toFixed(2) : String(value ?? '');
        return str.padEnd(colWidths[i]);
      })
      .join(' │ ')
  );

  return ['┌─' + separator + '─┐', '│ ' + header + ' │', '├─' + separator + '─┤', ...rows.map(r => '│ ' + r + ' │'), '└─' + separator + '─┘'].join(
    '\n'
  );
}
