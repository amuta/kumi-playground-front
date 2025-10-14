import { render, screen } from '@testing-library/react';
import { describe, test, vi, expect } from 'vitest';

vi.mock('@monaco-editor/react', () => ({
  default: () => <div>Monaco Editor</div>,
}));

import { App } from './App';

describe('App', () => {
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

});
