import { renderAsciiGrid } from '@/rendering/ascii-grid';

interface GridVisualizerProps {
  name: string;
  value: any;
}

export function GridVisualizer({ name, value }: GridVisualizerProps) {
  if (!Array.isArray(value) || !Array.isArray(value[0])) {
    return (
      <div>
        <div className="font-medium mb-2">{name}:</div>
        <p className="text-destructive text-sm">
          Cannot render as grid: expected 2D array
        </p>
      </div>
    );
  }

  const ascii = renderAsciiGrid(value);

  return (
    <div>
      <div className="font-medium mb-2">{name}:</div>
      <pre role="group" className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
        {ascii}
      </pre>
    </div>
  );
}
