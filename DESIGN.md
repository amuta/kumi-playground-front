# Kumi Play v2 - Design Document

## Overview

Simplified frontend for showcasing Kumi's declarative calculation DSL with emphasis on:
1. **Codegen transparency** - Show JS/Ruby/LIR alongside execution
2. **Diverse examples** - Forms, tables, Monte Carlo, spatial simulations
3. **ASCII-first rendering** - Start simple, upgrade visuals later
4. **Minimal abstraction** - ~500 LOC core logic

## Architecture

### Three Execution Modes

#### 1. Notebook Mode (Default)
For: calculations, business rules, data processing

```
┌─────────────────────────────────────┐
│ Schema Editor                       │
├─────────────────────────────────────┤
│ Tabs: JS | Ruby | LIR               │
├─────────────────────────────────────┤
│ Input (form or JSON)                │
├─────────────────────────────────────┤
│ Output (ASCII tables/values)        │
└─────────────────────────────────────┘
```

- Single execution on input change
- No workers needed
- Smart rendering based on `output_schema`

#### 2. Canvas Mode
For: Game of Life, cellular automata

```
┌───────────┬─────────────────────┐
│ Schema    │ ASCII Grid Canvas   │
│ Editor    │ ░░░█████░░░         │
│           │ ░░█░░░░░█░░         │
│ Tabs:     │                     │
│ JS/Ruby   │ [▶] Speed: [──●─]  │
└───────────┴─────────────────────┘
```

- Worker with continuous loop
- Renders 2D grid as ASCII art
- Play/pause/step/reset controls

#### 3. Simulation Mode
For: Monte Carlo, batch runs with statistics

```
┌─────────────────────────────────────┐
│ Parameters (form)                   │
│ Iterations: 10000 [Run] [Stop]     │
│ Progress: [████████░░] 80%         │
├─────────────────────────────────────┤
│ Distribution (ASCII histogram):     │
│ 0-5   │ ████████░░░░░░░░░░░░ 234  │
│ 5-10  │ ████████████████████ 567  │
│ 10-15 │ ████████████░░░░░░░░ 321  │
│                                     │
│ Stats: mean=7.2 std=3.1 p95=12.4   │
└─────────────────────────────────────┘
```

- Worker with batch execution
- Live progress updates
- ASCII histogram + statistics

## Data Flow

```
User edits schema
    ↓
POST /api/compile { schema_src }
    ↓
Returns { js_src, ruby_src, lir, input_form_schema, output_schema }
    ↓
Mode router:
  - notebook   → Execute JS, render output
  - canvas     → Worker loop + ASCII grid
  - simulation → Worker batch + histogram
```

## Backend Contract

### Compile Endpoint

**POST `/api/compile`**

Request:
```json
{
  "schema_src": "schema do\n  input do\n    integer :x\n  end\n  value :doubled, input.x * 2\nend"
}
```

Response:
```json
{
  "js_src": "export class KumiCompiledModule { ... }",
  "ruby_src": "module Kumi::Compiled::... end",
  "lir": "...",
  "schema_hash": "abc123...",
  "input_form_schema": {
    "x": { "type": "integer" }
  },
  "output_schema": {
    "doubled": {
      "kind": "value",
      "type": "integer",
      "axes": []
    }
  }
}
```

## Example Metadata Structure

```typescript
type Example = {
  id: string;
  title: string;
  schema_src: string;
  mode: 'notebook' | 'canvas' | 'simulation';
  base_input?: Record<string, any>;

  // Canvas-specific
  canvas_config?: {
    render: 'grid2d';
    controls?: {
      speed?: { min: number; max: number; default: number };
      seed?: { default: number };
    };
  };

  // Simulation-specific
  simulation_config?: {
    iterations: number;
    random_fields: Record<string, {
      distribution: 'normal' | 'uniform';
      mean?: number;
      std?: number;
      min?: number;
      max?: number;
    }>;
    track_outputs: string[];
  };
};
```

## Rendering Strategy

### Output Inference

Based on `output_schema.axes`:

- `axes: []` → Scalar (show as key-value)
- `axes: ["items"]` → 1D array (ASCII table)
- `axes: ["rows", "cols"]` → 2D grid (ASCII art)

### ASCII Renderers

All implemented and tested:

- **ascii-grid**: 2D arrays with grayscale support
- **ascii-histogram**: Distribution visualization with bins
- **ascii-table**: Formatted tables with borders

## Implementation Status

### ✅ Completed (37 tests passing)

- Project structure
- TypeScript types
- ASCII grid renderer
- ASCII histogram renderer
- ASCII table renderer
- Statistics calculator
- RNG utilities (Box-Muller, seeded)
- Random field generation

### 🚧 Next Steps

1. Module execution (eval compiled JS safely)
2. React components (Editor, ExecutionPanel, mode views)
3. Workers (canvas-worker.ts, simulation-worker.ts)
4. Example library (bundled Kumi examples)
5. API integration (compile endpoint)

## Testing Approach

- **Unit tests** for all pure functions (rendering, stats, RNG)
- **Integration tests** for full compile → execute → render flow
- **No mocking** of core logic - test real behavior
- **Vitest** for fast, Vite-native testing

## Future Enhancements (v2+)

- Chart.js for fancy histograms
- Canvas/WebGL for high-performance grids
- Form auto-generation from input_form_schema
- Syntax highlighting for Kumi schemas
- Share/permalink functionality
- Performance profiling dashboard

## File Structure

```
web-v2/
├── src/
│   ├── types/              ✅ Core TypeScript types
│   ├── rendering/          ✅ ASCII renderers (grid, histogram, table)
│   ├── stats/              ✅ Statistics calculator
│   ├── input-gen/          ✅ RNG and random field generation
│   ├── execution/          🚧 Module eval and execution
│   ├── components/         🚧 React components
│   ├── workers/            🚧 Web workers
│   └── examples/           🚧 Bundled examples
├── package.json            ✅
├── tsconfig.json           ✅
├── vite.config.ts          ✅
├── README.md               ✅
└── DESIGN.md               ✅ (this file)
```

## Design Principles

1. **Test-first**: All core logic has tests before React integration
2. **Pure functions**: Rendering/stats/RNG are stateless
3. **Progressive enhancement**: ASCII → fancy visuals later
4. **Backend drives UI**: Use metadata from analyzer
5. **No premature abstraction**: Build what you need, when you need it
