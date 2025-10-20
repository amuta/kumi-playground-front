/**
 * Monaco Diagnostics Utility
 *
 * Converts compilation errors to Monaco editor diagnostics format.
 * Enables showing errors in the Problems panel with proper highlighting.
 */

import type { CompilationError } from '@/api/compile';

export interface Diagnostic {
  message: string;
  severity: number; // Monaco.MarkerSeverity
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

// Monaco error severity levels
export const SEVERITY = {
  Hint: 1,
  Information: 2,
  Warning: 4,
  Error: 8,
} as const;

/**
 * Convert a CompilationError to Monaco diagnostic format
 * Handles errors with or without line/column information
 */
export function toDiagnostics(error: CompilationError): Diagnostic[] {
  const line = error.line ?? 1;
  const column = error.column ?? 1;
  const cleanMessage = cleanErrorMessage(error.message);
  const endColumn = calculateEndColumn(cleanMessage, column);

  return [
    {
      message: cleanMessage,
      severity: SEVERITY.Error,
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn,
    },
  ];
}

/**
 * Clean error message by removing file location prefix
 * Converts "schema:4:13: Parse error" to just "Parse error"
 */
function cleanErrorMessage(message: string): string {
  // Strip "file:line:column: " prefix if present
  return message.replace(/^\S+:\d+:\d+:\s+/, '');
}

/**
 * Calculate the end column for a diagnostic
 * Tries to extract the error token from the message to estimate width
 */
function calculateEndColumn(message: string, startColumn: number): number {
  // Try to extract a word in quotes from the error message
  const match = message.match(/"([^"]+)"/);
  if (match && match[1]) {
    return startColumn + match[1].length;
  }

  // Try to extract a word identifier from common error patterns
  const identifierMatch = message.match(/(?:identifier|keyword|token)\s+"(\w+)"/i);
  if (identifierMatch && identifierMatch[1]) {
    return startColumn + identifierMatch[1].length;
  }

  // Default: highlight one character
  return startColumn + 1;
}

/**
 * Check if an error has location information
 */
export function hasLocation(error: CompilationError): boolean {
  return !!(error.line && error.column);
}

/**
 * Format error location for display
 */
export function formatErrorLocation(error: CompilationError): string {
  if (error.line && error.column) {
    return `Line ${error.line}, Column ${error.column}`;
  }
  if (error.line) {
    return `Line ${error.line}`;
  }
  return 'Unknown location';
}
