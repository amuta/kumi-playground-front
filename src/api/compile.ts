import type { CompileResult } from '../types';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:3000';

export async function compileKumiSchema(
  schemaSrc: string
): Promise<CompileResult> {
  const response = await fetch(`${API_BASE}/api/kumi/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema_src: schemaSrc })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0] || 'Compilation failed');
  }

  return response.json();
}
