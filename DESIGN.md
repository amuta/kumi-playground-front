# Kumi Play v2 - Design Document

## Overview

Clean, minimal frontend for Kumi's declarative calculation DSL:
1. **Tab-based UI** - Single focus area, clean navigation
2. **Codegen transparency** - View compiled JS/Ruby/LIR
3. **Auto-generated forms** - Input forms from schema
4. **ASCII rendering** - Built-in renderers for tables and grids

## UI Architecture

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Header: "Kumi Play"                                   │
├──────────────────────────────────────────────────────┤
│ [Schema] [Compiled Code] [Execute]  ← Main Tabs     │
├──────────────────────────────────────────────────────┤
│                                                       │
│            Active tab content (full screen)          │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Three Tabs

**1. Schema** - Monaco editor with Compile button
**2. Compiled Code** - Sub-tabs for JS/Ruby/LIR (read-only)
**3. Execute** - Auto-generated form + output display

## Component Structure

```
App
├── Header
└── Tabs
    ├── SchemaTab
    │   ├── SchemaEditor (Monaco)
    │   └── CompileButton
    ├── CompiledCodeTab
    │   └── CodeSubTabs (JS | Ruby | LIR)
    └── ExecuteTab
        ├── InputForm (auto-generated)
        ├── ExecuteButton
        └── OutputView (ASCII renderers)
```

## Data Flow

```
User edits schema → Compile → API call → Store compiled result
Switch to Execute → Fill form → Execute JS → Render output
```

## State Management

Simple React useState:
```typescript
schemaSource: string
compiledResult: CompileResponse | null
compileError: string | null
inputValues: Record<string, any>
executionResult: any | null
executionError: string | null
```

## Backend API

**POST `/api/kumi/compile`**

Request:
```json
{ "schema_src": "schema do ... end" }
```

Response:
```json
{
  "js_src": "...",
  "ruby_src": "...",
  "lir": "...",
  "input_form_schema": { "x": { "type": "integer" } },
  "output_schema": { "doubled": { "kind": "value", "type": "integer", "axes": [] } }
}
```

## Technology Stack

**Core**
- React 18 + TypeScript
- Vite (build + dev server)
- Tailwind CSS

**UI Components**
- shadcn/ui (Radix UI + Tailwind)
- Monaco Editor (@monaco-editor/react)

**Utilities** (already implemented)
- ASCII renderers (grid, histogram, table)
- Execution module (dynamic import eval)
- API client
- Statistics calculator
- RNG utilities

## Output Rendering

Based on `output_schema.axes`:
- `axes: []` → Scalar (key-value)
- `axes: ["items"]` → Table (ASCII)
- `axes: ["rows", "cols"]` → Grid (ASCII art)

## Testing

**55/55 tests passing**
- Unit tests for utilities
- Integration tests for compile → execute flow
- Component tests for App UI
- Monaco mocked in tests

## Implementation Complete

### Core Features ✅
- Tab-based navigation
- Schema editor with Monaco
- Compilation with error handling
- Code viewer (JS/Ruby/LIR)
- Auto-generated input forms
- ASCII output rendering
- Full test coverage

### Future Enhancements
- Example selector dropdown
- Canvas mode (animations)
- Simulation mode (Monte Carlo)
- Keyboard shortcuts
- Share/permalink

## Design Principles

1. **Single focus** - One tab at a time
2. **Progressive disclosure** - Tabs unlock after compilation
3. **Minimal dependencies** - Use proven libraries
4. **ASCII-first** - Simple before complex
5. **Type-safe** - TypeScript everywhere
