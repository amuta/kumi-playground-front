# Next Steps for Kumi Play v2

## ✅ Completed

### Backend Updates
- [x] Updated `KumiCompile` service to extract `input_form_schema`, `output_schema`, and `lir`
- [x] Updated API controller to return new fields
- [x] Created test script (`web/test-compile-api.sh`)
- [x] Fully backwards compatible - no breaking changes

### Frontend Foundation
- [x] Project structure set up (`web-v2/`)
- [x] 37 tests passing for core utilities
- [x] ASCII renderers (grid, histogram, table)
- [x] Statistics calculator
- [x] RNG utilities (Box-Muller, seeded, uniform)
- [x] Complete design document

## ✅ Completed (Phase 1)

### 1. Execution Module ✓

Created `/web-v2/src/execution/eval-module.ts` and tests:

```typescript
/**
 * Safely evaluate compiled Kumi JS module
 * Returns an instance of the compiled module class
 */
export function evalCompiledModule(jsSrc: string): any {
  try {
    // Create isolated context
    const moduleContext = {
      exports: {},
      KumiCompiledModule: null as any
    };

    // Wrap in function to avoid global pollution
    const wrappedCode = `
      ${jsSrc}
      return KumiCompiledModule;
    `;

    const moduleClass = new Function(wrappedCode)();
    return new moduleClass();
  } catch (error) {
    throw new Error(`Failed to evaluate compiled module: ${error.message}`);
  }
}

/**
 * Execute a specific output declaration
 */
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
    throw new Error(`Execution failed for '${outputName}': ${error.message}`);
  }
}

/**
 * Execute all outputs and return results keyed by name
 */
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
```

### 2. API Client ✓

Created `/web-v2/src/api/compile.ts` with full test coverage.

### 3. Integration Tests ✓

Created `/web-v2/src/integration.test.ts` to verify the full compile → eval → execute flow.

**Test Status**: 52/52 passing (9 test files)

## 🚧 Current Priority: React UI

Build the user interface components.

### OLD: Add Execution Tests (DONE)

Create `/web-v2/src/execution/eval-module.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { evalCompiledModule, executeOutput, executeAllOutputs } from './eval-module';

describe('evalCompiledModule', () => {
  it('evaluates valid JS module', () => {
    const jsSrc = `
      class KumiCompiledModule {
        _total(input) {
          return input.a + input.b;
        }
      }
    `;

    const mod = evalCompiledModule(jsSrc);
    expect(mod._total({ a: 2, b: 3 })).toBe(5);
  });

  it('throws on syntax error', () => {
    const invalidJs = 'class { invalid }';
    expect(() => evalCompiledModule(invalidJs)).toThrow();
  });
});

describe('executeOutput', () => {
  const mockModule = {
    _total: (input: any) => input.price * input.qty,
    _doubled: (input: any) => input.x * 2
  };

  it('executes correct method', () => {
    const result = executeOutput(mockModule, 'total', { price: 10, qty: 3 });
    expect(result).toBe(30);
  });

  it('handles missing method', () => {
    expect(() => executeOutput(mockModule, 'nonexistent', {}))
      .toThrow(/not found/);
  });
});

describe('executeAllOutputs', () => {
  const mockModule = {
    _sum: (input: any) => input.x + input.y,
    _product: (input: any) => input.x * input.y
  };

  const outputSchema = {
    sum: { kind: 'value', type: 'integer', axes: [] },
    product: { kind: 'value', type: 'integer', axes: [] }
  };

  it('executes all value outputs', () => {
    const results = executeAllOutputs(mockModule, { x: 3, y: 4 }, outputSchema);

    expect(results).toEqual({
      sum: 7,
      product: 12
    });
  });
});
```

Run tests: `npm test`

## 📋 NEXT: React Components

Build the UI:

### 1. Basic App Shell (NEXT)

First, install Tailwind CSS:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then create the React entry point at `/web-v2/src/main.tsx` and basic app at `/web-v2/src/App.tsx`.

### OLD: API Client (DONE)

Create `/web-v2/src/api/compile.ts`:

```typescript
import type { CompileResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

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
```

### 4. Basic App Shell

Create `/web-v2/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `/web-v2/src/App.tsx`:

```typescript
import { useState } from 'react';
import { compileKumiSchema } from './api/compile';
import type { CompileResult } from './types';

export function App() {
  const [schema, setSchema] = useState(EXAMPLE_SCHEMA);
  const [compiled, setCompiled] = useState<CompileResult | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleCompile() {
    setLoading(true);
    setError(undefined);

    try {
      const result = await compileKumiSchema(schema);
      setCompiled(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Kumi Play v2</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg mb-2">Schema</h2>
          <textarea
            className="w-full h-64 bg-gray-800 p-2 font-mono text-sm"
            value={schema}
            onChange={e => setSchema(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleCompile}
            disabled={loading}
          >
            {loading ? 'Compiling...' : 'Compile & Run'}
          </button>
        </div>

        <div>
          <h2 className="text-lg mb-2">Output</h2>
          {error && (
            <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
          )}
          {compiled && (
            <div>
              <p>✅ Compiled: {compiled.schema_hash.slice(0, 8)}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(compiled.output_schema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_SCHEMA = `schema do
  input do
    integer :x
    integer :y
  end

  value :sum, input.x + input.y
  value :product, input.x * input.y
end`;
```

### 5. Add Basic CSS

Create `/web-v2/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

pre {
  font-family: 'Monaco', 'Courier New', monospace;
}
```

Install Tailwind:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🎯 Immediate Action Plan

### Completed:
1. ✅ Backend changes done
2. ✅ Implement execution module + tests
3. ✅ Run: `npm test` - verify all passing (52/52)
4. ✅ Create API client with tests
5. ✅ Create integration tests

### Next (2-3 hours):
6. [ ] Install Tailwind CSS
7. [ ] Build basic App shell (`src/main.tsx`, `src/App.tsx`)
8. [ ] Start Rails server: `cd ../web && rails s`
9. [ ] Start Vite dev: `npm run dev`
10. [ ] Test end-to-end: type schema → compile → see output

### This Week:
9. [ ] Implement NotebookView with input form
10. [ ] Add Monaco editor for schema editing
11. [ ] Create first 3 examples (shopping cart, Game of Life, options pricing)

## 📁 File Checklist

Completed:
- [x] `src/execution/eval-module.ts`
- [x] `src/execution/eval-module.test.ts`
- [x] `src/api/compile.ts`
- [x] `src/api/compile.test.ts`
- [x] `src/integration.test.ts`

Create next:
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`
- [ ] `src/index.css`
- [ ] `tailwind.config.js`
- [ ] `postcss.config.js`

## 🧪 Testing Backend Changes

Start the Rails server and run:
```bash
cd /home/muta/repos/kumi-play/web
rails s

# In another terminal:
./test-compile-api.sh
```

Expected output should include:
```json
{
  "input_form_schema": { "x": { "type": "integer" }, ... },
  "output_schema": { "sum": { "kind": "value", ... }, ... }
}
```

## 🎨 Design Notes

- Keep ASCII rendering for v1 - fancy charts later
- Focus on notebook mode first (simplest)
- Canvas mode can wait until notebook works
- Simulation mode is v2 feature

## 📚 Reference

- Design doc: `web-v2/DESIGN.md`
- Backend changes: `web-v2/BACKEND_CHANGES.md`
- Current status: `web-v2/STATUS.md`
- All tests passing: `npm test` in `web-v2/`
