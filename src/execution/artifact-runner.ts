// Artifact runner: loads compiled JS by URL and runs value outputs.
import type { OutputField } from '@/types';

function toBase64(s: string){
  // btoa in browser, Buffer in Node/Vitest
  // @ts-ignore
  return typeof btoa === 'function' ? btoa(s) : Buffer.from(s,'utf8').toString('base64');
}

export async function loadArtifactModule(url: string){
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  const js = await r.text();
  const mod = await import(/* @vite-ignore */ `data:text/javascript;base64,${toBase64(js)}`);
  return mod;
}

export function executeOutput(mod: any, name: string, input: Record<string,any>){
  const fn = mod[`_${name}`];
  if (typeof fn !== 'function') throw new Error(`Output '${name}' not found in compiled module`);
  try { return fn(input); } catch (e) { throw new Error(`Execution failed for '${name}': ${(e as Error).message}`); }
}

export function runAllOutputs(mod: any, input: Record<string,any>, schema: Record<string,OutputField>){
  const out: Record<string,any> = {};
  for (const [name, f] of Object.entries(schema)) if (f.kind === 'value') out[name] = executeOutput(mod, name, input);
  return out;
}

export async function runAllOutputsFromUrl(url: string, input: Record<string,any>, schema: Record<string,OutputField>){
  const mod = await loadArtifactModule(url);
  return runAllOutputs(mod, input, schema);
}
