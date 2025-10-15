import type { OutputField, Example, VisualizationType, VisualizationConfig } from '@/types';
import { JsonOutputViewer } from './JsonOutputViewer';
import { TableVisualizer } from './visualizers/TableVisualizer';
import { GridVisualizer } from './visualizers/GridVisualizer';

interface OutputViewProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  example?: Example;
  visualizationConfig?: VisualizationConfig;
}

const visualizers = {
  json: JsonOutputViewer,
  table: TableVisualizer,
  grid: GridVisualizer,
} as const;

export function OutputView({ results, example, visualizationConfig }: OutputViewProps) {
  const getVisualizationType = (outputName: string): VisualizationType => {
    const fromConfig = visualizationConfig?.outputs?.[outputName]?.type as VisualizationType | undefined;
    if (fromConfig && fromConfig in visualizers) return fromConfig;

    const fromExample = example?.visualizations?.[outputName] as VisualizationType | undefined;
    if (fromExample && fromExample in visualizers) return fromExample;

    if (fromConfig || fromExample) {
      console.warn(`Unknown visualization type for output "${outputName}", falling back to JSON`);
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
    <div className="flex flex-col h-full min-h-0 space-y-6">
      {Object.keys(jsonOutputs).length > 0 && (
        <div className="flex-1 min-h-0">
          <JsonOutputViewer value={jsonOutputs} height="100%" />
        </div>
      )}
      {customVisualizations.map(({ name, value, vizType }) => {
        const Visualizer = visualizers[vizType];
        return <Visualizer key={name} name={name} value={value} />;
      })}
    </div>
  );
}
