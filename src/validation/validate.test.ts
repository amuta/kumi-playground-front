import { describe, it, expect } from 'vitest';
import { validateInputData } from './validate';
import type { InputField } from '@/types';

describe('modular validation', () => {
  it('validates simple types correctly', () => {
    const schema: Record<string, InputField> = {
      name: { type: 'string' },
      age: { type: 'integer' },
      score: { type: 'float' },
      active: { type: 'boolean' },
    };

    const validInput = { name: 'Alice', age: 30, score: 95.5, active: true };
    const collector = validateInputData(validInput, schema);
    expect(collector.hasErrors()).toBe(false);

    const invalidInput = { name: 'Bob', age: 'thirty', score: 95.5, active: true };
    const collector2 = validateInputData(invalidInput, schema);
    expect(collector2.hasErrors()).toBe(true);
    expect(collector2.getErrors()[0].field).toBe('age');
  });

  it('detects missing required fields', () => {
    const schema: Record<string, InputField> = {
      name: { type: 'string' },
      age: { type: 'integer' },
    };

    const input = { name: 'Alice' };
    const collector = validateInputData(input, schema);
    expect(collector.hasErrors()).toBe(true);
    expect(collector.getErrors()[0].field).toBe('age');
    expect(collector.getErrors()[0].message).toContain('Required field missing');
  });

  it('validates arrays', () => {
    const schema: Record<string, InputField> = {
      numbers: { type: 'array', element: { type: 'integer' } },
    };

    const validInput = { numbers: [1, 2, 3] };
    const collector = validateInputData(validInput, schema);
    expect(collector.hasErrors()).toBe(false);

    const invalidInput = { numbers: [1, 'two', 3] };
    const collector2 = validateInputData(invalidInput, schema);
    expect(collector2.hasErrors()).toBe(true);
  });

  it('validates nested objects', () => {
    const schema: Record<string, InputField> = {
      person: {
        type: 'object',
        fields: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      },
    };

    const validInput = { person: { name: 'Alice', age: 30 } };
    const collector = validateInputData(validInput, schema);
    expect(collector.hasErrors()).toBe(false);

    const invalidInput = { person: { name: 'Bob', age: 'thirty' } };
    const collector2 = validateInputData(invalidInput, schema);
    expect(collector2.hasErrors()).toBe(true);
  });

  it('formats validation errors nicely', () => {
    const schema: Record<string, InputField> = {
      age: { type: 'integer' },
      email: { type: 'string' },
    };

    const input = { age: 'not an int' };
    const collector = validateInputData(input, schema);
    const formatted = collector.formatErrors();
    expect(formatted).toContain('age');
    expect(formatted).toContain('Expected integer');
    expect(formatted).toContain('email');
    expect(formatted).toContain('Required field missing');
  });

  it('returns empty string for no errors', () => {
    const schema: Record<string, InputField> = {
      name: { type: 'string' },
    };

    const input = { name: 'Alice' };
    const collector = validateInputData(input, schema);
    const formatted = collector.formatErrors();
    expect(formatted).toBe('');
  });

  it('clears errors', () => {
    const schema: Record<string, InputField> = {
      age: { type: 'integer' },
    };

    const input = { age: 'not an int' };
    const collector = validateInputData(input, schema);
    expect(collector.hasErrors()).toBe(true);

    collector.clear();
    expect(collector.hasErrors()).toBe(false);
    expect(collector.getErrors()).toHaveLength(0);
  });
});
