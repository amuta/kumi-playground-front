// Artifact runner: loads compiled JS by URL and runs outputs.
import type { OutputField, InputField } from '@/types';
import { validateInputData } from '@/validation/validate';

function toBase64(s: string){
  // btoa in browser, Buffer in Node/Vitest
  // @ts-ignore
  return typeof btoa === 'function' ? btoa(s) : Buffer.from(s,'utf8').toString('base64');
}

const moduleCache = new Map<string, Promise<any>>();

export async function loadArtifactModule(url: string){
  if (!url) throw new Error('artifact_url is empty');
  if (moduleCache.has(url)) return moduleCache.get(url)!;

  const p = (async () => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    const js = await r.text();
    const mod = await import(/* @vite-ignore */ `data:text/javascript;base64,${toBase64(js)}`);
    return mod;
  })();

  moduleCache.set(url, p);
  return p;
}

export function clearArtifactCache(url?: string){
  if (url) moduleCache.delete(url);
  else moduleCache.clear();
}

export function executeOutput(mod: any, name: string, input: Record<string,any>){
  const fn = mod[`_${name}`];
  if (typeof fn !== 'function') throw new Error(`Output '${name}' not found in compiled module`);
  try { return fn(input); } catch (e) { throw new Error(`Execution failed for '${name}': ${(e as Error).message}`); }
}

export function runAllOutputs(mod: any, input: Record<string,any>, schema: Record<string,OutputField>){
  const out: Record<string,any> = {};
  for (const name of Object.keys(schema)) out[name] = executeOutput(mod, name, input);
  return out;
}

export async function runAllOutputsFromUrl(url: string, input: Record<string,any>, schema: Record<string,OutputField>, inputSchema?: Record<string, InputField>){
  const mod = await loadArtifactModule(url);

  if (inputSchema) {
    const errorCollector = validateInputData(input, inputSchema);
    if (errorCollector.hasErrors()) {
      throw new Error(errorCollector.formatErrors());
    }
  }

  return runAllOutputs(mod, input, schema);
}
