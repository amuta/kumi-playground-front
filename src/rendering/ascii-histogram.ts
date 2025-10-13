export function renderAsciiHistogram(
  data: number[],
  numBins: number = 10,
  barWidth: number = 30
): string {
  if (data.length === 0) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) {
    return `${min.toFixed(1)}-${max.toFixed(1)} │ █ 1`;
  }

  const binSize = range / numBins;
  const bins: number[] = Array(numBins).fill(0);

  for (const value of data) {
    const binIndex = Math.min(
      numBins - 1,
      Math.floor((value - min) / binSize)
    );
    bins[binIndex]++;
  }

  const maxCount = Math.max(...bins);
  const lines: string[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;
    const count = bins[i];
    const barLength = Math.round((count / maxCount) * barWidth);
    const bar = '█'.repeat(barLength) + '░'.repeat(barWidth - barLength);

    const label = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`.padEnd(12);
    lines.push(`${label}│ ${bar} ${count}`);
  }

  return lines.join('\n');
}
