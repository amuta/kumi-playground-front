import type { CompileResult } from '../types';

export type CompileResponse = CompileResult;

export interface CompileError {
  message: string;
  line?: number;
  column?: number;
}

export class CompilationError extends Error {
  line?: number;
  column?: number;

  constructor(error: CompileError) {
    super(error.message);
    this.name = 'CompilationError';
    this.line = error.line;
    this.column = error.column;
  }
}

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  'http://localhost:3000';

export async function compileSchema(
  schemaSrc: string
): Promise<CompileResponse> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15000); // 15s hard timeout

  try {
    const response = await fetch(`${API_BASE}/api/kumi/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema_src: schemaSrc }),
      signal: ctrl.signal,
    });

    if (!response.ok) {
      const ctype = response.headers.get('content-type') || '';
      if (ctype.includes('application/json')) {
        const data = await response.json().catch(() => ({}));
        const errorInfo = data.errors?.[0];

        if (errorInfo && typeof errorInfo === 'object' && 'message' in errorInfo) {
          throw new CompilationError(errorInfo as CompileError);
        } else {
          throw new Error(errorInfo || 'Compilation failed');
        }
      } else {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }
    }

    return response.json();
  } catch (err) {
    if ((err as any)?.name === 'AbortError') {
      throw new Error('Compilation request timed out');
    }
    throw err as Error;
  } finally {
    clearTimeout(timeout);
  }
}

export const compileKumiSchema = compileSchema;
