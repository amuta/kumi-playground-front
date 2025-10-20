/**
 * Monaco Editor Integration for Kumi Language
 *
 * Registers the Kumi language with Monaco Editor, providing:
 * - Syntax highlighting
 * - Keyword recognition
 * - Code completion
 * - Error suppression for Kumi-specific constructs
 */

import type { Monaco } from '@monaco-editor/react';
import { getAllKeywords, kumiLanguage } from './kumi';

/**
 * Register Kumi language with Monaco Editor
 * Must be called with Monaco instance after it's loaded
 */
export function registerKumiLanguage(monaco: Monaco): void {
  // Check if already registered
  if (monaco.languages.getLanguages().some(lang => lang.id === 'kumi')) {
    return;
  }

  // Register the Kumi language
  monaco.languages.register({ id: 'kumi' });

  // Define tokenization rules
  monaco.languages.setMonarchTokensProvider('kumi', {
    keywords: getAllKeywords(),
    typeKeywords: kumiLanguage.typeKeywords,
    builtinFunctions: kumiLanguage.builtInFunctions,
    operators: kumiLanguage.operators,

    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],

        // String literals
        [/"(?:\\.|[^"\\])*"/, 'string'],
        [/'(?:\\.|[^'\\])*'/, 'string'],

        // Numbers
        [/\b\d+(\.\d+)?\b/, 'number'],

        // Symbols (Ruby-style)
        [/:\w+/, 'variable.predefined'],

        // Built-in functions
        [/\b(fn|select|shift|min|max|sum|count|map|filter|clamp)\b/, 'function'],

        // Type keywords
        [/\b(integer|float|string|boolean|array|hash)\b/, 'type'],

        // Schema keywords
        [/\b(schema|input|end|value|let|do)\b/, 'keyword'],

        // Identifiers
        [/\b[a-zA-Z_]\w*\b/, 'identifier'],

        // Operators
        [/[+\-*/%=<>!&|]+/, 'operator'],

        // Whitespace
        [/\s+/, 'white'],

        // Delimiters
        [/[{}()\[\].]/, 'delimiter'],
      ],
    },
  } as any);

  // Define theme for Kumi language (extends dark theme)
  monaco.editor.defineTheme('kumi-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable.predefined', foreground: 'CE9178' },
      { token: 'comment', foreground: '6A9955' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'operator', foreground: 'D4D4D4' },
    ],
    colors: {},
  } as any);
}

/**
 * Set up language configuration (indentation, brackets, etc.)
 */
export function configureKumiLanguage(monaco: Monaco): void {
  monaco.languages.setLanguageConfiguration('kumi', {
    comments: {
      lineComment: '#',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: /\b(schema|input|do)\b/,
        end: /\bend\b/,
      },
    },
  });
}
