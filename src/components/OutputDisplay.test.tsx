import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { OutputDisplay } from './OutputDisplay';
import type { Example } from '@/types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => <div data-testid="monaco">{value}</div>,
}));

describe('OutputDisplay with visualization registry', () => {
  const mockOutputSchema = {
    sum: { axes: [], kind: 'value' as const, type: 'integer' as const },
    history: { axes: ['10'], kind: 'value' as const, type: 'integer' as const },
    matrix: { axes: ['3', '3'], kind: 'value' as const, type: 'integer' as const },
  };

  it('defaults to JSON visualization when no config', () => {
    const results = { sum: 42, product: 100 };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} />);

    expect(screen.getByTestId('monaco')).toBeInTheDocument();
    const json = screen.getByTestId('monaco').textContent;
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
      visualizations: {
        history: 'table',
      },
    };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByText('history:')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('falls back to JSON for invalid visualization type', () => {
    const results = { value: 123 };
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: '',
      base_input: {},
      visualizations: {
        value: 'invalid-type' as any,
      },
    };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByTestId('monaco')).toBeInTheDocument();
  });
});
