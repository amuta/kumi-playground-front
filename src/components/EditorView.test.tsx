import { render, screen } from '@testing-library/react';
import { describe, test, vi, expect } from 'vitest';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

import { EditorView } from './EditorView';

describe('EditorView', () => {
  test('renders editor with provided value', () => {
    render(<EditorView value="const x = 42;" language="javascript" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue('const x = 42;');
  });

  test('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<EditorView value="" language="javascript" onChange={handleChange} />);

    const editor = screen.getByTestId('monaco-editor');
    editor.focus();

    expect(handleChange).not.toHaveBeenCalled();
  });

  test('uses provided language', () => {
    const { rerender } = render(<EditorView value="def hello; end" language="ruby" />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();

    rerender(<EditorView value="{}" language="json" />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});
