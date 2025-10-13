import type { OutputField, Example, VisualizationType } from '@/types';
import { JsonOutputViewer } from './JsonOutputViewer';
import { InlineValue } from './visualizers/InlineValue';
import { TableVisualizer } from './visualizers/TableVisualizer';
import { GridVisualizer } from './visualizers/GridVisualizer';

interface OutputDisplayProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  example?: Example;
}

const visualizers = {
  json: JsonOutputViewer,
  inline: InlineValue,
  table: TableVisualizer,
  grid: GridVisualizer,
} as const;

export function OutputDisplay({ results, outputSchema, example }: OutputDisplayProps) {
  const getVisualizationType = (outputName: string): VisualizationType => {
    const configuredType = example?.visualizations?.[outputName];

    if (configuredType && configuredType in visualizers) {
      return configuredType;
    }

    if (configuredType) {
      console.warn(`Unknown visualization type "${configuredType}" for output "${outputName}", falling back to JSON`);
    }

    return 'json';
  };

  const renderOutput = (name: string, value: any) => {
    const vizType = getVisualizationType(name);
    const Visualizer = visualizers[vizType];

    if (vizType === 'json') {
      return (
        <div key={name}>
          <div className="font-medium mb-2">{name}:</div>
          <JsonOutputViewer value={value} />
        </div>
      );
    }

    return <Visualizer key={name} name={name} value={value} />;
  };

  return (
    <div className="space-y-6">
      {Object.entries(results).map(([name, value]) => renderOutput(name, value))}
    </div>
  );
}
