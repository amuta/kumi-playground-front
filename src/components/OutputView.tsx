import type { OutputField, Example, VisualizationType, VisualizationConfig } from '@/types';
import { JsonOutputEditor } from './JsonOutputEditor';
import { TableVisualizer } from './visualizers/TableVisualizer';
import { GridVisualizer } from './visualizers/GridVisualizer';

interface OutputViewProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  example?: Example;
  visualizationConfig?: VisualizationConfig;
  showJson?: boolean;
}

type CustomVisualizerType = Exclude<VisualizationType, 'json'>;

const customVisualizers: Record<CustomVisualizerType, (props: { name: string; value: any; label?: string }) => JSX.Element> = {
  table: TableVisualizer,
  grid: GridVisualizer,
};

const isCustomVisualizer = (type: VisualizationType | undefined): type is CustomVisualizerType =>
  type === 'table' || type === 'grid';

export function OutputView({
  results,
  example,
  visualizationConfig,
  showJson = true,
}: OutputViewProps) {
  const getVisualizationType = (outputName: string): VisualizationType => {
    const fromConfig = visualizationConfig?.outputs?.[outputName]?.type as VisualizationType | undefined;
    if (fromConfig && isCustomVisualizer(fromConfig)) return fromConfig;
    const fromExample = example?.visualizations?.[outputName] as VisualizationType | undefined;
    if (fromExample && isCustomVisualizer(fromExample)) return fromExample;
    if (fromConfig || fromExample) console.warn(`Unknown visualization type for output "${outputName}", falling back to JSON`);
    return 'json';
  };

  const jsonOutputs: Record<string, any> = {};
  const customVisualizations: Array<{ name: string; value: any; vizType: CustomVisualizerType; label?: string }> = [];
  let suppressedJson = false;

  Object.entries(results).forEach(([name, value]) => {
    const vizType = getVisualizationType(name);
    if (vizType === 'json') {
      if (!showJson) {
        suppressedJson = true;
        return;
      }
      jsonOutputs[name] = value;
    } else {
      const label = visualizationConfig?.outputs?.[name]?.label;
      customVisualizations.push({ name, value, vizType, label });
    }
  });

  return (
    <div className="flex flex-col h-full min-h-0 space-y-6">
      {showJson && Object.keys(jsonOutputs).length > 0 && (
        <div className="flex-1 min-h-0">
          <JsonOutputEditor value={jsonOutputs} height="100%" />
        </div>
      )}
      {customVisualizations.map(({ name, value, vizType, label }) => {
        const Visualizer = customVisualizers[vizType];
        return (
          <div key={name} className="flex-1 min-h-0">
            <Visualizer name={name} value={value} label={label} />
          </div>
        );
      })}
      {!showJson && customVisualizations.length === 0 && suppressedJson && (
        <div className="text-sm text-muted-foreground">
          No visualization configured for these outputs yet.
        </div>
      )}
    </div>
  );
}
