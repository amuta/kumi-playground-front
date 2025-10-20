/**
 * Kumi Language Definition
 *
 * This module defines the Kumi schema language syntax, keywords, and types.
 * It's designed to be used by multiple tools (Monaco, linters, documentation, etc.)
 * without depending on any specific editor or framework.
 */

export const kumiLanguage = {
  // Core schema structure keywords
  schemaKeywords: ['schema', 'input', 'end'],

  // Value definition keywords
  valueKeywords: ['value', 'let'],

  // Type keywords for input definitions
  typeKeywords: [
    'integer',
    'float',
    'string',
    'boolean',
    'array',
    'hash',
  ],

  // Built-in functions
  builtInFunctions: [
    'fn',
    'select',
    'shift',
    'min',
    'max',
    'sum',
    'sum_if',
    'count',
    'count_if',
    'map',
    'filter',
    'clamp',
  ],

  // Operators
  operators: [
    '+', '-', '*', '/', '%',  // arithmetic
    '==', '!=', '<', '>', '<=', '>=',  // comparison
    '&', '|', '!',  // logical
    '=',  // assignment in let/value
  ],

  // Special keywords and symbols
  specialKeywords: ['input', 'do', 'end'],

  // Comments (Ruby-style)
  commentStart: '#',
};

/**
 * Get all keywords as a flattened array
 * Useful for editor integrations
 */
export function getAllKeywords(): string[] {
  return [
    ...kumiLanguage.schemaKeywords,
    ...kumiLanguage.valueKeywords,
    ...kumiLanguage.typeKeywords,
    ...kumiLanguage.builtInFunctions,
    ...kumiLanguage.specialKeywords,
  ];
}

/**
 * Check if a word is a Kumi keyword
 */
export function isKumiKeyword(word: string): boolean {
  return getAllKeywords().includes(word);
}

/**
 * Check if a symbol is a Kumi operator
 */
export function isKumiOperator(symbol: string): boolean {
  return kumiLanguage.operators.includes(symbol);
}
