import type { OutputField, Example, VisualizationType } from '@/types';
import { JsonOutputViewer } from './JsonOutputViewer';
import { TableVisualizer } from './visualizers/TableVisualizer';
import { GridVisualizer } from './visualizers/GridVisualizer';

interface OutputDisplayProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  example?: Example;
}

const visualizers = {
  json: JsonOutputViewer,
  table: TableVisualizer,
  grid: GridVisualizer,
} as const;

export function OutputDisplay({ results, example }: OutputDisplayProps) {
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

  const jsonOutputs: Record<string, any> = {};
  const customVisualizations: Array<{ name: string; value: any; vizType: VisualizationType }> = [];

  Object.entries(results).forEach(([name, value]) => {
    const vizType = getVisualizationType(name);
    if (vizType === 'json') {
      jsonOutputs[name] = value;
    } else {
      customVisualizations.push({ name, value, vizType });
    }
  });

  return (
    <div className="space-y-6">
      {Object.keys(jsonOutputs).length > 0 && (
        <div>
          <div className="font-medium mb-2">Outputs:</div>
          <JsonOutputViewer value={jsonOutputs} />
        </div>
      )}
      {customVisualizations.map(({ name, value, vizType }) => {
        const Visualizer = visualizers[vizType];
        return <Visualizer key={name} name={name} value={value} />;
      })}
    </div>
  );
}
