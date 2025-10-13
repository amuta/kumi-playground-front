# Implementation Guide - Starting Fresh

This document provides complete context and step-by-step instructions to continue building Kumi Play v2 from a clean session.

## Current State

### What's Already Done ✅

**Backend (`/home/muta/repos/kumi-play/web`)**
- Rails API endpoint updated: `POST /api/kumi/compile`
- Returns: `js_src`, `ruby_src`, `lir`, `input_form_schema`, `output_schema`, `schema_hash`
- Files modified:
  - `/web/app/services/kumi_compile.rb`
  - `/web/app/controllers/api/kumi_compile_controller.rb`

**Frontend (`/home/muta/repos/kumi-play/web-v2`)**
- Project scaffolded with Vite + React + TypeScript + Vitest
- 37 tests passing for core utilities:
  - ASCII renderers (grid, histogram, table)
  - Statistics calculator
  - RNG utilities (normal, uniform, seeded)
  - Random field generation
- Dependencies installed, ready to code

**Structure:**
```
web-v2/
├── src/
│   ├── types/index.ts              ✅ All TypeScript types
│   ├── rendering/                  ✅ ASCII renderers + tests
│   │   ├── ascii-grid.ts
│   │   ├── ascii-histogram.ts
│   │   └── ascii-table.ts
│   ├── stats/calculate-stats.ts    ✅ Statistics + tests
│   └── input-gen/                  ✅ RNG + tests
│       ├── rng.ts
│       └── random-fields.ts
├── package.json                    ✅
├── vite.config.ts                  ✅
├── index.html                      ✅
└── [docs]                          ✅
```

### What Needs to Be Built 🚧

1. **Execution module** - Safely eval and run compiled JS
2. **API client** - Fetch from backend
3. **React components** - UI layer
4. **Example library** - Sample Kumi schemas
5. **Integration** - Wire everything together

---

## Step 1: Execution Module (30 minutes)

### Context
The backend returns compiled JavaScript code as a string. We need to:
1. Evaluate it safely to get a module class
2. Instantiate the class
3. Call methods on it to get outputs

### Files to Create

#### `src/execution/eval-module.ts`

```typescript
import type { OutputField } from '../types';

/**
 * Evaluates compiled Kumi JavaScript module
 * @param jsSrc - JavaScript source code from backend (export class KumiCompiledModule {...})
 * @returns Instance of the compiled module
 * @throws Error if evaluation fails
 */
export function evalCompiledModule(jsSrc: string): any {
  try {
    // The compiled JS exports a class named KumiCompiledModule
    // We need to eval it and instantiate
    const wrappedCode = `
      ${jsSrc}
      return new KumiCompiledModule();
    `;

    // Use Function constructor for safer eval (no access to closure scope)
    const factory = new Function(wrappedCode);
    return factory();
  } catch (error: any) {
    throw new Error(`Failed to evaluate compiled module: ${error.message}`);
  }
}

/**
 * Executes a single output declaration
 * @param module - Compiled module instance
 * @param outputName - Name of the output (e.g., "total")
 * @param input - Input data object
 * @returns Result of executing the output
 */
export function executeOutput(
  module: any,
  outputName: string,
  input: Record<string, any>
): any {
  // Compiled modules prefix methods with underscore
  const methodName = `_${outputName}`;

  if (typeof module[methodName] !== 'function') {
    throw new Error(
      `Output '${outputName}' not found. Available: ${Object.keys(module)
        .filter((k) => k.startsWith('_'))
        .join(', ')}`
    );
  }

  try {
    return module[methodName](input);
  } catch (error: any) {
    throw new Error(
      `Execution failed for '${outputName}': ${error.message}\nStack: ${error.stack}`
    );
  }
}

/**
 * Executes all value declarations (not traits)
 * @param module - Compiled module instance
 * @param input - Input data object
 * @param outputSchema - Output schema from backend (tells us which are values vs traits)
 * @returns Object with output name -> result
 */
export function executeAllOutputs(
  module: any,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>
): Record<string, any> {
  const results: Record<string, any> = {};

  for (const [name, schema] of Object.entries(outputSchema)) {
    // Only execute 'value' declarations, skip 'trait' for now
    if (schema.kind === 'value') {
      try {
        results[name] = executeOutput(module, name, input);
      } catch (error: any) {
        // Store error for this output instead of failing completely
        results[name] = { __error: error.message };
      }
    }
  }

  return results;
}
```

#### `src/execution/eval-module.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  evalCompiledModule,
  executeOutput,
  executeAllOutputs,
} from './eval-module';

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

  it('evaluates module with multiple methods', () => {
    const jsSrc = `
      class KumiCompiledModule {
        _sum(input) { return input.x + input.y; }
        _product(input) { return input.x * input.y; }
      }
    `;

    const mod = evalCompiledModule(jsSrc);
    expect(mod._sum({ x: 3, y: 4 })).toBe(7);
    expect(mod._product({ x: 3, y: 4 })).toBe(12);
  });

  it('throws on syntax error', () => {
    const invalidJs = 'class { invalid syntax }';
    expect(() => evalCompiledModule(invalidJs)).toThrow(/Failed to evaluate/);
  });

  it('throws on runtime error in constructor', () => {
    const jsSrc = `
      class KumiCompiledModule {
        constructor() {
          throw new Error('Constructor failed');
        }
      }
    `;
    expect(() => evalCompiledModule(jsSrc)).toThrow();
  });
});

describe('executeOutput', () => {
  const mockModule = {
    _total: (input: any) => input.price * input.qty,
    _doubled: (input: any) => input.x * 2,
    _greeting: (input: any) => `Hello ${input.name}`,
  };

  it('executes correct method', () => {
    const result = executeOutput(mockModule, 'total', { price: 10, qty: 3 });
    expect(result).toBe(30);
  });

  it('executes with different inputs', () => {
    expect(executeOutput(mockModule, 'doubled', { x: 5 })).toBe(10);
    expect(executeOutput(mockModule, 'greeting', { name: 'World' })).toBe(
      'Hello World'
    );
  });

  it('throws on missing method', () => {
    expect(() => executeOutput(mockModule, 'nonexistent', {})).toThrow(
      /not found/
    );
  });

  it('provides helpful error with available methods', () => {
    try {
      executeOutput(mockModule, 'missing', {});
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e.message).toContain('Available:');
      expect(e.message).toContain('_total');
    }
  });

  it('wraps execution errors', () => {
    const badModule = {
      _bad: () => {
        throw new Error('Intentional failure');
      },
    };

    expect(() => executeOutput(badModule, 'bad', {})).toThrow(
      /Execution failed.*Intentional failure/
    );
  });
});

describe('executeAllOutputs', () => {
  const mockModule = {
    _sum: (input: any) => input.x + input.y,
    _product: (input: any) => input.x * input.y,
    _is_positive: (input: any) => input.x > 0,
  };

  it('executes all value outputs', () => {
    const outputSchema = {
      sum: { kind: 'value' as const, type: 'integer', axes: [] },
      product: { kind: 'value' as const, type: 'integer', axes: [] },
      is_positive: { kind: 'trait' as const, type: 'boolean', axes: [] },
    };

    const results = executeAllOutputs(
      mockModule,
      { x: 3, y: 4 },
      outputSchema
    );

    expect(results).toEqual({
      sum: 7,
      product: 12,
      // is_positive is a trait, not executed
    });
  });

  it('handles empty output schema', () => {
    const results = executeAllOutputs(mockModule, { x: 1, y: 2 }, {});
    expect(results).toEqual({});
  });

  it('captures errors per output instead of failing', () => {
    const faultyModule = {
      _good: () => 42,
      _bad: () => {
        throw new Error('Boom');
      },
    };

    const outputSchema = {
      good: { kind: 'value' as const, type: 'integer', axes: [] },
      bad: { kind: 'value' as const, type: 'integer', axes: [] },
    };

    const results = executeAllOutputs(faultyModule, {}, outputSchema);

    expect(results.good).toBe(42);
    expect(results.bad).toHaveProperty('__error');
    expect(results.bad.__error).toContain('Boom');
  });

  it('handles array outputs', () => {
    const arrayModule = {
      _items: (input: any) => input.data.map((x: number) => x * 2),
    };

    const outputSchema = {
      items: {
        kind: 'value' as const,
        type: 'integer',
        axes: ['data'] as string[],
      },
    };

    const results = executeAllOutputs(
      arrayModule,
      { data: [1, 2, 3] },
      outputSchema
    );

    expect(results.items).toEqual([2, 4, 6]);
  });
});
```

### Verify

```bash
cd /home/muta/repos/kumi-play/web-v2
npm test

# Should show 45+ tests passing (37 existing + 8 new)
```

---

## Step 2: API Client (15 minutes)

### Context
Create a client to call the backend compile endpoint.

### Files to Create

#### `src/api/compile.ts`

```typescript
import type { CompileResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export class CompileError extends Error {
  constructor(
    message: string,
    public errors: string[]
  ) {
    super(message);
    this.name = 'CompileError';
  }
}

/**
 * Compiles a Kumi schema via the backend API
 * @param schemaSrc - Kumi schema source code
 * @returns Promise with compiled artifacts and metadata
 * @throws CompileError if compilation fails
 */
export async function compileKumiSchema(
  schemaSrc: string
): Promise<CompileResult> {
  try {
    const response = await fetch(`${API_BASE}/api/kumi/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schema_src: schemaSrc }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new CompileError(
        data.errors?.[0] || 'Compilation failed',
        data.errors || []
      );
    }

    return {
      js_src: data.js_src,
      ruby_src: data.ruby_src,
      lir: data.lir,
      schema_hash: data.schema_hash,
      input_form_schema: data.input_form_schema,
      output_schema: data.output_schema,
    };
  } catch (error: any) {
    if (error instanceof CompileError) {
      throw error;
    }

    // Network or other errors
    throw new CompileError(
      `Failed to reach compile API: ${error.message}`,
      [error.message]
    );
  }
}
```

#### `.env.example`

```bash
# Backend API base URL
VITE_API_BASE=http://localhost:3000
```

#### `.env`

```bash
VITE_API_BASE=http://localhost:3000
```

### Test Manually

```bash
# Terminal 1: Start backend
cd /home/muta/repos/kumi-play/web
rails s

# Terminal 2: Test compile endpoint
./test-compile-api.sh

# Should see JSON with input_form_schema and output_schema
```

---

## Step 3: Minimal Working App (45 minutes)

### Context
Build the simplest possible UI that:
1. Takes Kumi schema as input
2. Compiles it
3. Shows compiled JS/Ruby
4. Shows input/output schemas

### Files to Create

#### `src/main.tsx`

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

#### `src/App.tsx`

```typescript
import { useState } from 'react';
import { compileKumiSchema, CompileError } from './api/compile';
import { evalCompiledModule, executeAllOutputs } from './execution/eval-module';
import type { CompileResult } from './types';

const EXAMPLE_SCHEMA = `schema do
  input do
    integer :x
    integer :y
  end

  value :sum, input.x + input.y
  value :product, input.x * input.y
  trait :both_positive, (input.x > 0) & (input.y > 0)
end`;

const EXAMPLE_INPUT = { x: 5, y: 7 };

export function App() {
  const [schema, setSchema] = useState(EXAMPLE_SCHEMA);
  const [compiled, setCompiled] = useState<CompileResult | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState(JSON.stringify(EXAMPLE_INPUT, null, 2));
  const [output, setOutput] = useState<Record<string, any> | null>(null);

  const [tab, setTab] = useState<'js' | 'ruby' | 'lir' | 'schemas'>('schemas');

  async function handleCompile() {
    setLoading(true);
    setError(undefined);
    setOutput(null);

    try {
      const result = await compileKumiSchema(schema);
      setCompiled(result);

      // Auto-execute with current input
      try {
        const inputData = JSON.parse(input);
        const module = evalCompiledModule(result.js_src);
        const results = executeAllOutputs(module, inputData, result.output_schema);
        setOutput(results);
      } catch (execError: any) {
        setError(`Execution error: ${execError.message}`);
      }
    } catch (e: any) {
      if (e instanceof CompileError) {
        setError(`Compilation failed:\n${e.errors.join('\n')}`);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleExecute() {
    if (!compiled) return;

    setError(undefined);
    try {
      const inputData = JSON.parse(input);
      const module = evalCompiledModule(compiled.js_src);
      const results = executeAllOutputs(module, inputData, compiled.output_schema);
      setOutput(results);
    } catch (e: any) {
      setError(`Execution error: ${e.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-4 py-3">
        <h1 className="text-xl font-bold">Kumi Play v2</h1>
      </header>

      <div className="grid grid-cols-2 h-[calc(100vh-60px)]">
        {/* Left: Schema Editor */}
        <div className="border-r border-gray-800 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800">
            <h2 className="font-semibold">Schema</h2>
          </div>
          <textarea
            className="flex-1 bg-gray-900 p-4 font-mono text-sm resize-none"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
          />
          <div className="p-4 border-t border-gray-800">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              onClick={handleCompile}
              disabled={loading}
            >
              {loading ? 'Compiling...' : 'Compile & Run'}
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col">
          {/* Tabs */}
          {compiled && (
            <div className="border-b border-gray-800 flex">
              {(['schemas', 'js', 'ruby', 'lir'] as const).map((t) => (
                <button
                  key={t}
                  className={`px-4 py-2 ${
                    tab === t ? 'bg-gray-800' : 'hover:bg-gray-900'
                  }`}
                  onClick={() => setTab(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {error && (
              <pre className="p-4 text-red-400 whitespace-pre-wrap">{error}</pre>
            )}

            {!compiled && !error && (
              <div className="p-4 text-gray-500">
                Enter a Kumi schema and click "Compile & Run"
              </div>
            )}

            {compiled && tab === 'schemas' && (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Input</h3>
                <textarea
                  className="w-full h-32 bg-gray-900 p-2 font-mono text-sm mb-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm mb-4"
                  onClick={handleExecute}
                >
                  Execute
                </button>

                <h3 className="font-semibold mb-2">Input Schema</h3>
                <pre className="bg-gray-900 p-2 text-xs mb-4 overflow-auto">
                  {JSON.stringify(compiled.input_form_schema, null, 2)}
                </pre>

                <h3 className="font-semibold mb-2">Output Schema</h3>
                <pre className="bg-gray-900 p-2 text-xs mb-4 overflow-auto">
                  {JSON.stringify(compiled.output_schema, null, 2)}
                </pre>

                {output && (
                  <>
                    <h3 className="font-semibold mb-2">Results</h3>
                    <pre className="bg-gray-900 p-2 text-xs overflow-auto">
                      {JSON.stringify(output, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}

            {compiled && tab === 'js' && (
              <pre className="p-4 text-xs overflow-auto">{compiled.js_src}</pre>
            )}

            {compiled && tab === 'ruby' && (
              <pre className="p-4 text-xs overflow-auto">{compiled.ruby_src}</pre>
            )}

            {compiled && tab === 'lir' && (
              <pre className="p-4 text-xs overflow-auto">{compiled.lir || 'No LIR available'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

pre, textarea, code {
  font-family: 'Monaco', 'Courier New', monospace;
}
```

#### `tailwind.config.js`

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Install Tailwind

```bash
cd /home/muta/repos/kumi-play/web-v2
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Run the App

```bash
# Terminal 1: Backend (if not running)
cd /home/muta/repos/kumi-play/web
rails s

# Terminal 2: Frontend
cd /home/muta/repos/kumi-play/web-v2
npm run dev

# Open: http://localhost:5173
```

### Test the Flow

1. Type or paste a Kumi schema
2. Click "Compile & Run"
3. See tabs: SCHEMAS, JS, RUBY, LIR
4. In SCHEMAS tab: Edit input JSON, click "Execute"
5. See results below

---

## Step 4: Add ASCII Rendering (30 minutes)

### Context
Now that basic execution works, render outputs using the ASCII utilities we already built.

### File to Create

#### `src/components/OutputDisplay.tsx`

```typescript
import type { OutputField } from '../types';
import { renderAsciiGrid } from '../rendering/ascii-grid';
import { renderAsciiTable } from '../rendering/ascii-table';

export function OutputDisplay({
  output,
  schema,
}: {
  output: Record<string, any>;
  schema: Record<string, OutputField>;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(output).map(([name, value]) => {
        const field = schema[name];
        if (!field) return null;

        return (
          <div key={name} className="border border-gray-800 rounded p-3">
            <h3 className="font-semibold mb-2">
              {name}{' '}
              <span className="text-xs text-gray-500">
                ({field.kind} • {field.type} • {field.axes.length}D)
              </span>
            </h3>
            {renderOutput(value, field)}
          </div>
        );
      })}
    </div>
  );
}

function renderOutput(value: any, schema: OutputField) {
  // Handle errors
  if (value && typeof value === 'object' && '__error' in value) {
    return <pre className="text-red-400 text-xs">{value.__error}</pre>;
  }

  // Scalar value
  if (schema.axes.length === 0) {
    return <div className="text-lg">{formatScalar(value, schema.type)}</div>;
  }

  // 1D array (render as table or list)
  if (schema.axes.length === 1) {
    if (Array.isArray(value)) {
      // If array of primitives
      if (typeof value[0] !== 'object') {
        return (
          <div className="font-mono text-xs whitespace-pre">
            {value.map((v, i) => `[${i}] ${v}`).join('\n')}
          </div>
        );
      }

      // If array of objects, render as table
      const columns = Object.keys(value[0] || {});
      const ascii = renderAsciiTable(value, columns);
      return <pre className="text-xs whitespace-pre overflow-auto">{ascii}</pre>;
    }
  }

  // 2D array (render as ASCII grid)
  if (schema.axes.length === 2 && Array.isArray(value)) {
    const ascii = renderAsciiGrid(value);
    return <pre className="text-xs whitespace-pre leading-tight">{ascii}</pre>;
  }

  // Fallback: JSON
  return (
    <pre className="text-xs overflow-auto bg-gray-900 p-2 rounded">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function formatScalar(value: any, type: string): string {
  if (value === null || value === undefined) return 'null';

  if (type === 'boolean') {
    return value ? '✓ true' : '✗ false';
  }

  if (type === 'float' && typeof value === 'number') {
    return value.toFixed(2);
  }

  return String(value);
}
```

### Update App to Use OutputDisplay

In `src/App.tsx`, replace the results rendering:

```typescript
import { OutputDisplay } from './components/OutputDisplay';

// ...

{output && compiled && (
  <>
    <h3 className="font-semibold mb-2">Results</h3>
    <OutputDisplay output={output} schema={compiled.output_schema} />
  </>
)}
```

---

## Step 5: Add Example Library (20 minutes)

### Context
Bundle a few Kumi examples so users can try them quickly.

### File to Create

#### `src/examples/library.ts`

```typescript
export type Example = {
  id: string;
  title: string;
  schema: string;
  sampleInput: Record<string, any>;
};

export const examples: Example[] = [
  {
    id: 'simple_math',
    title: 'Simple Math',
    schema: `schema do
  input do
    integer :x
    integer :y
  end

  value :sum, input.x + input.y
  value :difference, input.x - input.y
  value :product, input.x * input.y
  trait :both_positive, (input.x > 0) & (input.y > 0)
end`,
    sampleInput: { x: 12, y: 5 },
  },

  {
    id: 'shopping_cart',
    title: 'Shopping Cart',
    schema: `schema do
  input do
    array :items do
      hash :item do
        float :price
        integer :qty
      end
    end
    float :discount
  end

  value :subtotals, input.items.item.price * input.items.item.qty
  value :total, fn(:sum, subtotals)
  value :discounted_total, total * (1.0 - input.discount)

  trait :expensive, input.items.item.price > 100.0
  value :expensive_count, fn(:sum_if, 1, expensive)
end`,
    sampleInput: {
      items: [
        { price: 29.99, qty: 2 },
        { price: 149.99, qty: 1 },
        { price: 9.99, qty: 3 },
      ],
      discount: 0.1,
    },
  },

  {
    id: 'game_of_life_3x3',
    title: 'Game of Life (3x3)',
    schema: `schema do
  input do
    array :rows do
      array :col do
        integer :alive
      end
    end
  end

  let :a, input.rows.col.alive

  let :n,  shift(a, -1, axis_offset: 1)
  let :s,  shift(a,  1, axis_offset: 1)
  let :w,  shift(a, -1)
  let :e,  shift(a,  1)
  let :nw, shift(n, -1)
  let :ne, shift(n,  1)
  let :sw, shift(s, -1)
  let :se, shift(s,  1)

  let :neighbors, fn(:sum, [n, s, w, e, nw, ne, sw, se])
  let :alive, a > 0
  let :n3_alive, neighbors == 3
  let :n2_alive, neighbors == 2
  let :keep_alive, n2_alive & alive
  let :next_alive, n3_alive | keep_alive

  value :next_state, select(next_alive, 1, 0)
end`,
    sampleInput: {
      rows: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    },
  },
];
```

### Update App with Example Selector

In `src/App.tsx`, add example selector:

```typescript
import { examples } from './examples/library';

// In component:
const [selectedExample, setSelectedExample] = useState(examples[0].id);

// Add this before schema textarea:
<div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
  <h2 className="font-semibold">Schema</h2>
  <select
    className="ml-auto px-2 py-1 bg-gray-800 rounded text-sm"
    value={selectedExample}
    onChange={(e) => {
      const ex = examples.find((x) => x.id === e.target.value);
      if (ex) {
        setSelectedExample(ex.id);
        setSchema(ex.schema);
        setInput(JSON.stringify(ex.sampleInput, null, 2));
      }
    }}
  >
    {examples.map((ex) => (
      <option key={ex.id} value={ex.id}>
        {ex.title}
      </option>
    ))}
  </select>
</div>
```

---

## Testing Checklist

```bash
# Backend running?
cd /home/muta/repos/kumi-play/web
rails s
# Visit: http://localhost:3000 - should see Rails page

# Frontend tests passing?
cd /home/muta/repos/kumi-play/web-v2
npm test
# Should see 45+ tests passing

# Frontend running?
npm run dev
# Visit: http://localhost:5173

# End-to-end test:
# 1. Select "Shopping Cart" example
# 2. Click "Compile & Run"
# 3. Should see results with subtotals, total, etc.
# 4. Edit input JSON (change discount to 0.2)
# 5. Click "Execute"
# 6. See updated results
```

---

## Troubleshooting

### Backend not responding
```bash
cd /home/muta/repos/kumi-play/web
bundle install
rails s
```

### Frontend deps missing
```bash
cd /home/muta/repos/kumi-play/web-v2
npm install
```

### CORS errors
Add to `/web/config/application.rb`:
```ruby
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '*', headers: :any, methods: [:get, :post, :options]
  end
end
```

Then: `gem install rack-cors` and restart Rails.

### Tests fail after changes
```bash
npm test -- --run --reporter=verbose
# Check which test failed and why
```

---

## Summary

After following these steps you'll have:

✅ Safe JS execution module
✅ API client for backend
✅ Minimal working UI
✅ ASCII output rendering
✅ Example library
✅ ~45 tests passing

**Total time:** ~2.5 hours

**Result:** Working demo where you can edit Kumi schemas, compile them, execute them, and see ASCII-rendered outputs.

Next sessions can add:
- Monaco editor for syntax highlighting
- Input form auto-generation
- Canvas mode for Game of Life
- Simulation mode for Monte Carlo
