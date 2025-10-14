import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SchemaTabContainer } from './SchemaTabContainer';
import type { ExecutionConfig, VisualizationConfig } from '@/types';

vi.mock('@monaco-editor/react', () => ({
  default: () => <div>Monaco Editor</div>,
}));

vi.mock('@/api/compile', () => ({
  compileSchema: vi.fn(),
}));

describe('SchemaTabContainer', () => {
  const defaultProps = {
    schemaSource: 'schema do\nend',
    onSchemaSourceChange: vi.fn(),
    executionConfig: { type: 'single' } as ExecutionConfig,
    visualizationConfig: { outputs: {} } as VisualizationConfig,
    onExecutionConfigChange: vi.fn(),
    onVisualizationConfigChange: vi.fn(),
    onCompileSuccess: vi.fn(),
    onCompileError: vi.fn(),
    compileError: null,
    onCompileStart: vi.fn(),
    onCompileEnd: vi.fn(),
  };

  test('renders Schema and Config tabs', () => {
    render(<SchemaTabContainer {...defaultProps} />);

    expect(screen.getByRole('tab', { name: /Schema/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Config/i })).toBeInTheDocument();
  });

  test('Schema tab is active by default', () => {
    render(<SchemaTabContainer {...defaultProps} />);

    const schemaTab = screen.getByRole('tab', { name: /Schema/i });
    expect(schemaTab).toHaveAttribute('data-state', 'active');
  });

  test('switches to Config tab when clicked', async () => {
    const user = userEvent.setup();
    render(<SchemaTabContainer {...defaultProps} />);

    const configTab = screen.getByRole('tab', { name: /Config/i });
    await user.click(configTab);

    expect(configTab).toHaveAttribute('data-state', 'active');
  });

  test('displays schema editor in Schema tab', () => {
    render(<SchemaTabContainer {...defaultProps} />);

    expect(screen.getAllByText('Monaco Editor').length).toBeGreaterThan(0);
  });

  test('exposes compile method via ref', () => {
    const ref = { current: null as any };
    render(<SchemaTabContainer {...defaultProps} ref={ref} />);

    expect(ref.current).toHaveProperty('compile');
    expect(typeof ref.current.compile).toBe('function');
  });
});
