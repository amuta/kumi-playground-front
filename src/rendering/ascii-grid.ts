export function renderAsciiGrid(
  grid: number[][],
  char0: string = '░',
  char1: string = '█'
): string {
  if (grid.length === 0) return '';

  return grid
    .map(row =>
      row
        .map(cell => {
          if (cell === 0) return char0;
          if (cell === 1) return char1;

          // Handle grayscale (0-255)
          const normalized = Math.max(0, Math.min(255, cell)) / 255;
          if (normalized < 0.25) return ' ';
          if (normalized < 0.5) return '░';
          if (normalized < 0.75) return '▒';
          return '█';
        })
        .join('')
    )
    .join('\n');
}
