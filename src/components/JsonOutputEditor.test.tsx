import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { JsonOutputEditor } from './JsonOutputEditor';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => (
    <div data-testid="monaco-json" data-value={value} />
  ),
}));

describe('JsonOutputEditor', () => {
  it('renders Monaco editor with formatted JSON', () => {
    const value = { name: 'Alice', age: 30 };

    render(<JsonOutputEditor value={value} />);

    const editor = screen.getByTestId('monaco-json');
    const displayedValue = editor.getAttribute('data-value');
    const parsed = JSON.parse(displayedValue!);

    expect(parsed).toEqual(value);
  });

  it('handles nested objects', () => {
    const value = { user: { name: 'Bob', items: [1, 2, 3] } };

    render(<JsonOutputEditor value={value} />);

    const editor = screen.getByTestId('monaco-json');
    expect(editor).toBeInTheDocument();
  });

  it('uses custom height when provided', () => {
    const value = { test: 'data' };

    render(<JsonOutputEditor value={value} height="200px" />);

    const editor = screen.getByTestId('monaco-json');
    expect(editor).toBeInTheDocument();
  });

  describe('edge cases', () => {
    it('handles null value', () => {
      render(<JsonOutputEditor value={null} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');

      expect(displayedValue).toBe('null');
    });

    it('handles undefined value', () => {
      render(<JsonOutputEditor value={undefined} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');

      expect(displayedValue).toBe('undefined');
    });

    it('handles empty object', () => {
      render(<JsonOutputEditor value={{}} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');

      expect(displayedValue).toBe('{}');
    });

    it('handles empty array', () => {
      render(<JsonOutputEditor value={[]} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');

      expect(displayedValue).toBe('[]');
    });

    it('handles object with undefined values', () => {
      const value = { a: 1, b: undefined, c: 'test' };

      render(<JsonOutputEditor value={value} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');
      const parsed = JSON.parse(displayedValue!);

      expect(parsed).toEqual({ a: 1, c: 'test' });
    });

    it('handles circular reference', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      render(<JsonOutputEditor value={obj} />);

      const editor = screen.getByTestId('monaco-json');
      const displayedValue = editor.getAttribute('data-value');

      expect(displayedValue).toContain('Circular reference detected');
    });

    it('handles function values gracefully', () => {
      const value = { fn: () => {}, data: 'test' };

      render(<JsonOutputEditor value={value} />);

      const editor = screen.getByTestId('monaco-json');
      expect(editor).toBeInTheDocument();
    });

    it('handles symbols gracefully', () => {
      const sym = Symbol('test');
      const value = { [sym]: 'value', normal: 'data' };

      render(<JsonOutputEditor value={value} />);

      const editor = screen.getByTestId('monaco-json');
      expect(editor).toBeInTheDocument();
    });
  });
});
