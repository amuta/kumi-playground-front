import type { OutputField } from '@/types';
import { executeAllOutputs } from './eval-module';

export async function evalCompiledModuleFromUrl(artifactUrl: string): Promise<any> {
  try {
    const response = await fetch(artifactUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const jsSrc = await response.text();
    const dataUrl = `data:text/javascript;base64,${btoa(jsSrc)}`;
    const module = await import(/* @vite-ignore */ dataUrl);
    return module;
  } catch (error) {
    throw new Error(`Failed to load module from ${artifactUrl}: ${(error as Error).message}`);
  }
}

export async function executeAllOutputsFromUrl(
  artifactUrl: string,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>
): Promise<Record<string, any>> {
  const module = await evalCompiledModuleFromUrl(artifactUrl);
  return executeAllOutputs(module, input, outputSchema);
}
