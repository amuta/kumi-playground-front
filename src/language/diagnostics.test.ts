import { describe, test, expect } from 'vitest';
import { toDiagnostics } from './diagnostics';
import { CompilationError } from '@/api/compile';

describe('toDiagnostics', () => {
  test('converts error with line and column to diagnostic', () => {
    const error = new CompilationError({
      message: 'Syntax error: invalid keyword',
      line: 5,
      column: 10,
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toBe('Syntax error: invalid keyword');
    expect(diagnostics[0].startLineNumber).toBe(5);
    expect(diagnostics[0].startColumn).toBe(10);
    expect(diagnostics[0].endLineNumber).toBe(5);
    expect(diagnostics[0].severity).toBe(8); // Monaco.MarkerSeverity.Error
  });

  test('converts error without location to diagnostic', () => {
    const error = new CompilationError({
      message: 'Internal compiler error',
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toBe('Internal compiler error');
    expect(diagnostics[0].startLineNumber).toBe(1);
    expect(diagnostics[0].startColumn).toBe(1);
  });

  test('handles error with only line', () => {
    const error = new CompilationError({
      message: 'Error on line 3',
      line: 3,
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].startLineNumber).toBe(3);
    expect(diagnostics[0].startColumn).toBe(1);
  });

  test('calculates end column based on word length', () => {
    const error = new CompilationError({
      message: 'Unknown identifier "foobar"',
      line: 2,
      column: 5,
    });

    const diagnostics = toDiagnostics(error);

    // Extracts word from error message and calculates end column
    expect(diagnostics[0].startColumn).toBe(5);
    expect(diagnostics[0].endColumn).toBeGreaterThan(5);
  });

  test('sets error severity', () => {
    const error = new CompilationError({
      message: 'Error message',
      line: 1,
      column: 1,
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics[0].severity).toBe(8); // Monaco.MarkerSeverity.Error
  });

  test('creates proper end line number equal to start line', () => {
    const error = new CompilationError({
      message: 'Error',
      line: 5,
      column: 10,
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics[0].endLineNumber).toBe(5);
  });

  test('defaults to end column if extraction fails', () => {
    const error = new CompilationError({
      message: 'Generic error',
      line: 1,
      column: 1,
    });

    const diagnostics = toDiagnostics(error);

    expect(diagnostics[0].endColumn).toBeGreaterThanOrEqual(diagnostics[0].startColumn);
  });
});
