import { describe, test, expect } from 'vitest';
import { kumiLanguage, getAllKeywords, isKumiKeyword, isKumiOperator } from './kumi';

describe('kumiLanguage', () => {
  test('defines schema keywords', () => {
    expect(kumiLanguage.schemaKeywords).toContain('schema');
    expect(kumiLanguage.schemaKeywords).toContain('input');
    expect(kumiLanguage.schemaKeywords).toContain('end');
  });

  test('defines value keywords', () => {
    expect(kumiLanguage.valueKeywords).toContain('value');
    expect(kumiLanguage.valueKeywords).toContain('let');
  });

  test('defines type keywords', () => {
    expect(kumiLanguage.typeKeywords).toContain('integer');
    expect(kumiLanguage.typeKeywords).toContain('string');
    expect(kumiLanguage.typeKeywords).toContain('array');
    expect(kumiLanguage.typeKeywords).toContain('hash');
  });

  test('defines built-in functions', () => {
    expect(kumiLanguage.builtInFunctions).toContain('fn');
    expect(kumiLanguage.builtInFunctions).toContain('select');
    expect(kumiLanguage.builtInFunctions).toContain('shift');
    expect(kumiLanguage.builtInFunctions).toContain('sum');
    expect(kumiLanguage.builtInFunctions).toContain('clamp');
  });

  test('defines operators', () => {
    expect(kumiLanguage.operators).toContain('+');
    expect(kumiLanguage.operators).toContain('==');
    expect(kumiLanguage.operators).toContain('&');
    expect(kumiLanguage.operators).toContain('|');
  });

  test('defines comment syntax', () => {
    expect(kumiLanguage.commentStart).toBe('#');
  });
});

describe('getAllKeywords', () => {
  test('returns array of all keywords', () => {
    const keywords = getAllKeywords();
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
  });

  test('includes schema keywords', () => {
    const keywords = getAllKeywords();
    expect(keywords).toContain('schema');
    expect(keywords).toContain('input');
  });

  test('includes type keywords', () => {
    const keywords = getAllKeywords();
    expect(keywords).toContain('integer');
    expect(keywords).toContain('array');
  });

  test('includes value keywords', () => {
    const keywords = getAllKeywords();
    expect(keywords).toContain('value');
    expect(keywords).toContain('let');
  });

  test('includes built-in functions', () => {
    const keywords = getAllKeywords();
    expect(keywords).toContain('fn');
    expect(keywords).toContain('select');
  });
});

describe('isKumiKeyword', () => {
  test('returns true for schema keywords', () => {
    expect(isKumiKeyword('schema')).toBe(true);
    expect(isKumiKeyword('input')).toBe(true);
    expect(isKumiKeyword('end')).toBe(true);
  });

  test('returns true for type keywords', () => {
    expect(isKumiKeyword('integer')).toBe(true);
    expect(isKumiKeyword('array')).toBe(true);
    expect(isKumiKeyword('hash')).toBe(true);
  });

  test('returns true for value keywords', () => {
    expect(isKumiKeyword('value')).toBe(true);
    expect(isKumiKeyword('let')).toBe(true);
  });

  test('returns true for built-in functions', () => {
    expect(isKumiKeyword('fn')).toBe(true);
    expect(isKumiKeyword('select')).toBe(true);
    expect(isKumiKeyword('shift')).toBe(true);
  });

  test('returns false for non-keywords', () => {
    expect(isKumiKeyword('myVariable')).toBe(false);
    expect(isKumiKeyword('foobar')).toBe(false);
    expect(isKumiKeyword('if')).toBe(false);
  });

  test('is case-sensitive', () => {
    expect(isKumiKeyword('Schema')).toBe(false);
    expect(isKumiKeyword('INTEGER')).toBe(false);
  });
});

describe('isKumiOperator', () => {
  test('recognizes arithmetic operators', () => {
    expect(isKumiOperator('+')).toBe(true);
    expect(isKumiOperator('-')).toBe(true);
    expect(isKumiOperator('*')).toBe(true);
    expect(isKumiOperator('/')).toBe(true);
  });

  test('recognizes comparison operators', () => {
    expect(isKumiOperator('==')).toBe(true);
    expect(isKumiOperator('!=')).toBe(true);
    expect(isKumiOperator('<')).toBe(true);
    expect(isKumiOperator('>')).toBe(true);
  });

  test('recognizes logical operators', () => {
    expect(isKumiOperator('&')).toBe(true);
    expect(isKumiOperator('|')).toBe(true);
  });

  test('returns false for non-operators', () => {
    expect(isKumiOperator('hello')).toBe(false);
    expect(isKumiOperator('123')).toBe(false);
    expect(isKumiOperator('@')).toBe(false);
  });
});
