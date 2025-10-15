import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, vi, expect, beforeEach } from 'vitest';

vi.mock('@monaco-editor/react', () => ({
  default: () => <div>Monaco Editor</div>,
}));

vi.mock('@/api/compile', () => ({
  compileSchema: vi.fn(),
}));

import { App } from './App';
import { compileSchema } from '@/api/compile';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main navigation tabs', () => {
    render(<App />);

    expect(screen.getByText('Kumi Play')).toBeInTheDocument();
    expect(screen.getAllByRole('tab', { name: /Schema/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('tab', { name: /Compiled Code/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Execute/i })).toBeInTheDocument();
  });

  test('Schema tab is active by default', () => {
    render(<App />);

    const schemaTabs = screen.getAllByRole('tab', { name: /Schema/i });
    const mainSchemaTab = schemaTabs.find(tab =>
      tab.textContent?.includes('⌘1')
    );
    expect(mainSchemaTab).toHaveAttribute('data-state', 'active');
  });

  test('Compile button is present in Schema tab', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /Compile/i })).toBeInTheDocument();
  });

  test('switches to Compiled Code tab after successful compile', async () => {
    const mockResult = {
      artifact_url: 'https://example.com/artifact.js',
      js_src: 'function _next_state() {}',
      ruby_src: 'def next_state; end',
      lir: 'next_state: () -> int',
      schema_hash: 'abc123',
      input_form_schema: {},
      output_schema: { next_state: {} }, // <- ensure Visualize tab enabled for default example
    };

    vi.mocked(compileSchema).mockResolvedValue(mockResult);

    render(<App />);

    const compileButton = screen.getByRole('button', { name: /Compile/i });
    compileButton.click();

    await waitFor(() => {
      const compiledTab = screen.getByRole('tab', { name: /Compiled Code/i });
      expect(compiledTab).toHaveAttribute('data-state', 'active');
    });
  });

  test('shows Run action bar when on Compiled Code tab', async () => {
    const mockResult = {
      artifact_url: 'https://example.com/artifact.js',
      js_src: 'function _next_state() {}',
      ruby_src: 'def next_state; end',
      lir: 'next_state: () -> int',
      schema_hash: 'abc123',
      input_form_schema: {},
      output_schema: { next_state: {} }, // <- ensure Visualize tab enabled for default example
    };

    vi.mocked(compileSchema).mockResolvedValue(mockResult);

    render(<App />);

    const compileButton = screen.getByRole('button', { name: /Compile/i });
    compileButton.click();

    await waitFor(() => {
      const runButton = screen.getByRole('button', { name: /Visualize/i });
      expect(runButton).toBeInTheDocument();
    });
  });
});
