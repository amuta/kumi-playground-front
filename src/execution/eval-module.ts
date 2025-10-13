import type { OutputField } from '../types';

export async function evalCompiledModule(jsSrc: string): Promise<any> {
  try {
    const dataUrl = `data:text/javascript;base64,${Buffer.from(jsSrc).toString('base64')}`;
    const module = await import(/* @vite-ignore */ dataUrl);
    return module;
  } catch (error) {
    throw new Error(`Failed to evaluate compiled module: ${(error as Error).message}`);
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
