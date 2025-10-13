import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { InputForm } from './InputForm';
import type { InputField } from '@/types';

describe('InputForm', () => {
  describe('array inputs', () => {
    it('renders textarea for array type fields', () => {
      const schema: Record<string, InputField> = {
        items: {
          type: 'array',
          element: { type: 'integer' },
        },
      };

      render(<InputForm schema={schema} values={{}} onChange={() => {}} />);

      const textarea = screen.getByLabelText('items');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('displays array values as formatted JSON', () => {
      const schema: Record<string, InputField> = {
        items: {
          type: 'array',
          element: { type: 'integer' },
        },
      };
      const values = { items: [1, 2, 3] };

      render(<InputForm schema={schema} values={values} onChange={() => {}} />);

      const textarea = screen.getByLabelText('items') as HTMLTextAreaElement;
      expect(textarea.value).toBe('[\n  1,\n  2,\n  3\n]');
    });

    it('allows typing invalid JSON without adding backslashes', () => {
      const schema: Record<string, InputField> = {
        items: {
          type: 'array',
          element: { type: 'integer' },
        },
      };
      const onChange = vi.fn();

      render(<InputForm schema={schema} values={{ items: [1, 2] }} onChange={onChange} />);

      const textarea = screen.getByLabelText('items') as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: '[' } });

      expect(textarea.value).toBe('[');
    });
  });

  describe('object inputs', () => {
    it('renders textarea for object type fields', () => {
      const schema: Record<string, InputField> = {
        config: {
          type: 'object',
          fields: {
            name: { type: 'string' },
            age: { type: 'integer' },
          },
        },
      };

      render(<InputForm schema={schema} values={{}} onChange={() => {}} />);

      const textarea = screen.getByLabelText('config');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('displays object values as formatted JSON', () => {
      const schema: Record<string, InputField> = {
        config: {
          type: 'object',
          fields: {
            name: { type: 'string' },
          },
        },
      };
      const values = { config: { name: 'John' } };

      render(<InputForm schema={schema} values={values} onChange={() => {}} />);

      const textarea = screen.getByLabelText('config') as HTMLTextAreaElement;
      expect(textarea.value).toBe('{\n  "name": "John"\n}');
    });
  });

  describe('simple inputs', () => {
    it('renders input for integer fields', () => {
      const schema: Record<string, InputField> = {
        age: { type: 'integer' },
      };

      render(<InputForm schema={schema} values={{}} onChange={() => {}} />);

      const input = screen.getByLabelText('age');
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders input for string fields', () => {
      const schema: Record<string, InputField> = {
        name: { type: 'string' },
      };

      render(<InputForm schema={schema} values={{}} onChange={() => {}} />);

      const input = screen.getByLabelText('name');
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
