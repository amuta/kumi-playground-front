import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { JsonInputEditor } from './JsonInputEditor';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      aria-label="json-input"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

describe('JsonInputEditor', () => {
  it('calls onChange with parsed object when valid JSON is entered', () => {
    const onChange = vi.fn();
    const initialValue = { name: 'Alice' };

    render(<JsonInputEditor value={initialValue} onChange={onChange} />);

    const input = screen.getByLabelText('json-input');
    fireEvent.change(input, { target: { value: '{"name": "Bob", "age": 30}' } });

    expect(onChange).toHaveBeenCalledWith({ name: 'Bob', age: 30 });
  });

  it('calls onError when invalid JSON is entered', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const initialValue = { name: 'Alice' };

    render(<JsonInputEditor value={initialValue} onChange={onChange} onError={onError} />);

    const input = screen.getByLabelText('json-input');
    fireEvent.change(input, { target: { value: '{invalid json' } });

    expect(onError).toHaveBeenCalledWith(expect.stringContaining(''));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays formatted JSON from value prop', () => {
    const onChange = vi.fn();
    const value = { name: 'Alice', items: [1, 2, 3] };

    render(<JsonInputEditor value={value} onChange={onChange} />);

    const input = screen.getByLabelText('json-input') as HTMLTextAreaElement;
    const parsedValue = JSON.parse(input.value);

    expect(parsedValue).toEqual(value);
  });
});
