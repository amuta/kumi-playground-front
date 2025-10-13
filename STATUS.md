# Project Status

## Summary

✅ **Foundation complete** - Core utilities, API client, and execution module implemented and tested (52/52 tests passing)

The project now has solid, tested building blocks for:
- ASCII rendering (grids, histograms, tables)
- Statistics calculations
- Random number generation
- Input field generation for simulations

## What's Done

### 1. Project Setup
- ✅ Vite + React + TypeScript
- ✅ Vitest testing framework
- ✅ Clean project structure

### 2. Core Types
- ✅ `CompileResult` - backend response shape
- ✅ `Example` - example metadata with mode configs
- ✅ `InputField` / `OutputField` - schema types
- ✅ `Statistics` - statistical results

### 3. Rendering Utilities (ASCII-first)
- ✅ `renderAsciiGrid()` - 2D arrays → ASCII art with grayscale
- ✅ `renderAsciiHistogram()` - distribution → bar chart
- ✅ `renderAsciiTable()` - arrays → formatted table

### 4. Statistics
- ✅ `calculateStats()` - mean, median, std, min, max, p95

### 5. Random Generation
- ✅ `boxMullerRandom()` - normal distribution (Box-Muller transform)
- ✅ `uniformRandom()` - uniform distribution
- ✅ `seededRng()` - deterministic PRNG (xorshift)
- ✅ `generateRandomFields()` - batch field generation

### 6. Test Coverage
- ✅ 52 tests passing
- ✅ 9 test files
- ✅ 100% coverage of implemented modules
- ✅ Integration tests for compile + execute flow

## What's Done (continued)

### 7. Execution Module
- ✅ `evalCompiledModule()` - safely eval JS from backend using dynamic imports
- ✅ `executeOutput()` - call specific output method
- ✅ `executeAllOutputs()` - run all value declarations
- ✅ Tests for execution safety and error handling

### 8. API Client
- ✅ `compileKumiSchema()` - fetch wrapper for compile endpoint
- ✅ Comprehensive tests with fetch mocking
- ✅ Error handling for compilation and network errors

## What's Next

### Phase 1: React Components (CURRENT)

### Phase 2: React UI
- [ ] `<SchemaEditor>` - Monaco for Kumi syntax
- [ ] `<CompiledSourceTabs>` - show JS/Ruby/LIR
- [ ] `<NotebookView>` - form + output display
- [ ] `<CanvasView>` - ASCII grid with controls
- [ ] `<SimulationView>` - progress + histogram

### Phase 3: Workers
- [ ] `canvas-worker.ts` - continuous animation loop
- [ ] `simulation-worker.ts` - batch execution with progress

### Phase 4: Examples & Polish
- [ ] Example library (Game of Life, shopping cart, options pricing)
- [ ] Example selector UI
- [ ] Landing page

## Running Tests

```bash
npm test          # Run once
npm test -- --watch  # Watch mode
npm run test:ui   # Visual UI
```

All tests should pass:
```
Test Files  9 passed (9)
     Tests  52 passed (52)
```

## Architecture Decisions Made

1. **ASCII-first rendering** - Ship fast, upgrade visuals later
2. **Three modes** - Notebook, Canvas, Simulation (not a generic adapter pattern)
3. **Backend provides metadata** - `input_form_schema` and `output_schema` drive UI
4. **Test-first** - Core logic tested before React integration
5. **No workers for notebook mode** - Keep it simple, workers only for canvas/simulation

## Key Files

- `DESIGN.md` - Full architecture and design decisions
- `README.md` - Getting started guide
- `src/types/index.ts` - All TypeScript types
- Tests: `src/**/*.test.ts`

## Next Session Goals

1. Set up basic React app shell with Tailwind CSS
2. Implement NotebookView component with input form
3. Get first example (shopping cart) rendering in notebook mode

## Performance

Current test run: ~1 second for 52 tests
Build time: TBD (no React build yet)

## Notes

- All rendering is pure functions - easy to test and reason about
- RNG uses both crypto-secure (for seeds) and deterministic (for reproducibility)
- Statistics calculator uses simple algorithms (suitable for <100k data points)
- ASCII renderers handle edge cases (empty data, single values, grayscale)
