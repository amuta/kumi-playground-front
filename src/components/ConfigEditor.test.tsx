import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { ConfigEditor } from './ConfigEditor';
import type { ExecutionConfig, VisualizationConfig } from '@/types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string | undefined) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('ConfigEditor', () => {
  const defaultExecutionConfig: ExecutionConfig = { type: 'single' };
  const defaultVisualizationConfig: VisualizationConfig = { outputs: {} };

  test('renders JSON editor with combined config', () => {
    const onExecutionConfigChange = vi.fn();
    const onVisualizationConfigChange = vi.fn();

    render(
      <ConfigEditor
        executionConfig={defaultExecutionConfig}
        visualizationConfig={defaultVisualizationConfig}
        onExecutionConfigChange={onExecutionConfigChange}
        onVisualizationConfigChange={onVisualizationConfigChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();

    const value = (editor as HTMLTextAreaElement).value;
    const parsed = JSON.parse(value);
    expect(parsed).toEqual({
      execution_config: defaultExecutionConfig,
      visualization_config: defaultVisualizationConfig,
    });
  });

  test('calls onChange handlers when valid JSON is entered', () => {
    const onExecutionConfigChange = vi.fn();
    const onVisualizationConfigChange = vi.fn();

    render(
      <ConfigEditor
        executionConfig={defaultExecutionConfig}
        visualizationConfig={defaultVisualizationConfig}
        onExecutionConfigChange={onExecutionConfigChange}
        onVisualizationConfigChange={onVisualizationConfigChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');

    const newConfig = {
      execution_config: {
        type: 'continuous' as const,
        continuous: {
          feedback_mappings: [{ from_output: 'next_state', to_input: 'rows' }],
          playback_speed: 200,
        },
      },
      visualization_config: {
        outputs: {
          next_state: {
            type: 'grid' as const,
            grid: { cell_map: { '0': '·', '1': '█' } },
          },
        },
      },
    };

    fireEvent.change(editor, { target: { value: JSON.stringify(newConfig, null, 2) } });

    expect(onExecutionConfigChange).toHaveBeenCalledWith(newConfig.execution_config);
    expect(onVisualizationConfigChange).toHaveBeenCalledWith(newConfig.visualization_config);
  });

  test('shows error message for invalid JSON', () => {
    const onExecutionConfigChange = vi.fn();
    const onVisualizationConfigChange = vi.fn();

    render(
      <ConfigEditor
        executionConfig={defaultExecutionConfig}
        visualizationConfig={defaultVisualizationConfig}
        onExecutionConfigChange={onExecutionConfigChange}
        onVisualizationConfigChange={onVisualizationConfigChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');

    fireEvent.change(editor, { target: { value: '{invalid json}' } });

    expect(screen.getByText(/Invalid JSON:/i)).toBeInTheDocument();
    expect(onExecutionConfigChange).not.toHaveBeenCalled();
    expect(onVisualizationConfigChange).not.toHaveBeenCalled();
  });

  test('does not call onChange for partial valid JSON', () => {
    const onExecutionConfigChange = vi.fn();
    const onVisualizationConfigChange = vi.fn();

    render(
      <ConfigEditor
        executionConfig={defaultExecutionConfig}
        visualizationConfig={defaultVisualizationConfig}
        onExecutionConfigChange={onExecutionConfigChange}
        onVisualizationConfigChange={onVisualizationConfigChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');

    fireEvent.change(editor, { target: { value: '{"execution_config": {"type": "single"}' } });

    expect(onExecutionConfigChange).not.toHaveBeenCalled();
    expect(onVisualizationConfigChange).not.toHaveBeenCalled();
  });
});
