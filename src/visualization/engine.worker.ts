// Module worker: offloads one-step-at-a-time execution and pipes outputs→inputs.
let mod: any = null;
let schema: Record<string, any> = {};
let execCfg: any = null;
let input: Record<string, any> = {};
let stepCount = 0;

type Msg =
  | { type: 'init'; artifactUrl: string; schema: any; execCfg: any; initialInput?: any }
  | { type: 'setInput'; input: any }
  | { type: 'setConfig'; execCfg: any }
  | { type: 'step' };

onmessage = async (e: MessageEvent<Msg>) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      const r = await fetch(m.artifactUrl);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const js = await r.text();
      const u = 'data:text/javascript;base64,' + btoa(js);
      // @vite-ignore
      mod = await import(u);
      schema = m.schema;
      execCfg = m.execCfg;
      input = m.initialInput ?? {};
      stepCount = 0;
      post('snapshot', snap(null, null));
      return;
    }
    if (m.type === 'setConfig') { execCfg = m.execCfg; return; }
    if (m.type === 'setInput')  { input = m.input; stepCount = 0; post('snapshot', snap(null, null)); return; }

    if (m.type === 'step') {
      let outputs: any = null, error: string | null = null;
      try {
        outputs = {};
        for (const k of Object.keys(schema || {})) {
          const fn = mod['_' + k];
          if (typeof fn !== 'function') throw new Error(`Output '${k}' not found`);
          outputs[k] = fn(input);
        }
        stepCount += 1;
        input = applyFeedback(execCfg, outputs, input); // piping here
      } catch (e: any) {
        error = e?.message ?? 'Execution failed';
      }
      post('snapshot', snap(error, outputs));
      return;
    }
  } catch (e: any) {
    post('snapshot', snap(e?.message ?? 'Worker error', null));
  }
};

function snap(error: string | null, outputs: any) {
  return { stepCount, input, outputs, error };
}

// Output and input paths are exact; nested paths supported.
function applyFeedback(cfg: any, outputs: any, cur: any) {
  const maps = cfg?.continuous?.feedback_mappings ?? [];
  if (!maps.length) return cur;
  let next = cur;
  for (const { from_output, to_input } of maps) {
    const v = getAt(outputs, from_output);
    if (v !== undefined) next = setAt(next, to_input, v);
  }
  return next;
}

function getAt(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setAt(obj: any, path: string, v: any) {
  const keys = path.split('.');
  const out = Array.isArray(obj) ? obj.slice() : { ...obj };
  let p: any = out;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i], n = p[k];
    p[k] = Array.isArray(n) ? n.slice() : (n && typeof n === 'object' ? { ...n } : {});
    p = p[k];
  }
  p[keys[keys.length - 1]] = v;
  return out;
}

function post(type: string, payload: any) { (postMessage as any)({ type, payload }); }
