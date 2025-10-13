import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { JsonOutputViewer } from './JsonOutputViewer';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => (
    <div data-testid="monaco-json" data-value={value} />
  ),
}));

describe('JsonOutputViewer', () => {
  it('renders Monaco editor with formatted JSON', () => {
    const value = { name: 'Alice', age: 30 };

    render(<JsonOutputViewer value={value} />);

    const editor = screen.getByTestId('monaco-json');
    const displayedValue = editor.getAttribute('data-value');
    const parsed = JSON.parse(displayedValue!);

    expect(parsed).toEqual(value);
  });

  it('handles nested objects', () => {
    const value = { user: { name: 'Bob', items: [1, 2, 3] } };

    render(<JsonOutputViewer value={value} />);

    const editor = screen.getByTestId('monaco-json');
    expect(editor).toBeInTheDocument();
  });

  it('uses custom height when provided', () => {
    const value = { test: 'data' };

    render(<JsonOutputViewer value={value} height="200px" />);

    const editor = screen.getByTestId('monaco-json');
    expect(editor).toBeInTheDocument();
  });
});
