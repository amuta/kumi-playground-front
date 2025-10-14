// Standalone execution helpers that load compiled artifacts by URL.
// No DOM access. Safe for Node/Vitest. Pure compute except for the fetch().

import type { OutputField } from '@/types';

function toBase64(input: string): string {
  // Works in browser and Node test environments
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof btoa === 'function') return btoa(input);
  return Buffer.from(input, 'utf-8').toString('base64');
}

export async function evalCompiledModuleFromUrl(artifactUrl: string): Promise<any> {
  try {
    const response = await fetch(artifactUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const jsSrc = await response.text();
    const dataUrl = `data:text/javascript;base64,${toBase64(jsSrc)}`;
    const mod = await import(/* @vite-ignore */ dataUrl);
    return mod;
  } catch (error) {
    throw new Error(`Failed to load module from ${artifactUrl}: ${(error as Error).message}`);
  }
}

export function executeOutput(
  module: any,
  outputName: string,
  input: Record<string, any>
): any {
  const methodName = `_${outputName}`;
  if (typeof module[methodName] !== 'function') {
    throw new Error(`Output '${outputName}' not found in compiled module`);
  }
  try {
    return module[methodName](input);
  } catch (error) {
    throw new Error(`Execution failed for '${outputName}': ${(error as Error).message}`);
  }
}

export function executeAllOutputs(
  module: any,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>
): Record<string, any> {
  const results: Record<string, any> = {};
  for (const [name, schema] of Object.entries(outputSchema)) {
    if (schema.kind === 'value') {
      results[name] = executeOutput(module, name, input);
    }
  }
  return results;
}

export async function executeAllOutputsFromUrl(
  artifactUrl: string,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>
): Promise<Record<string, any>> {
  const module = await evalCompiledModuleFromUrl(artifactUrl);
  return executeAllOutputs(module, input, outputSchema);
}
