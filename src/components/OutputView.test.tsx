import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { OutputView } from './OutputView';
import type { Example } from '@/types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => <div data-testid="monaco">{value}</div>,
}));

describe('OutputView with visualization registry', () => {
  const mockOutputSchema: Record<string, { type: 'integer'; axes?: string[] }> = {
    sum: { type: 'integer' },
    history: { type: 'integer', axes: ['10'] },
    matrix: { type: 'integer', axes: ['3', '3'] },
  };

  it('defaults to JSON visualization when no config', () => {
    const results = { sum: 42, product: 100 };

    render(<OutputView results={results} outputSchema={mockOutputSchema} />);

    expect(screen.getByTestId('monaco')).toBeInTheDocument();
    const json = screen.getByTestId('monaco').textContent as string;
    expect(json).toContain('sum');
    expect(json).toContain('product');
  });

  it('uses table visualization config from example', () => {
    const results = { history: [1, 2, 3] };
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: '',
      base_input: {},
      visualizations: { history: 'table' },
    };

    render(<OutputView results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByText('history:')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument(); // <pre role="group">
  });

  it('falls back to JSON for invalid visualization type', () => {
    const results = { value: 123 };
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: '',
      base_input: {},
      visualizations: { value: 'invalid-type' as any },
    };

    render(<OutputView results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByTestId('monaco')).toBeInTheDocument();
  });
});
