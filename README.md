# Kumi Play v2

Simplified frontend for showcasing Kumi's declarative calculation DSL.

## Architecture

Three execution modes:
- **Notebook**: Single-shot calculations (forms, business rules)
- **Canvas**: Continuous animation (Game of Life, cellular automata)
- **Simulation**: Batch execution with statistics (Monte Carlo)

## Design Principles

1. **Codegen-first**: Show JS/Ruby/LIR prominently
2. **Backend provides metadata**: `input_form_schema` and `output_schema`
3. **ASCII rendering**: Start simple, upgrade to fancy visuals later
4. **Minimal abstraction**: ~500 LOC core, no complex adapter pattern

## Project Structure

```
src/
├── types/              # Shared TypeScript types
├── rendering/          # ASCII renderers (grid, histogram, table)
├── execution/          # Module eval and execution
├── input-gen/          # Input generation (initial + random)
├── stats/              # Statistics calculations
├── components/         # React components
└── workers/            # Web workers for canvas/simulation modes
```

## Getting Started

```bash
npm install
npm run dev
npm test
```

## Testing

Using Vitest for unit tests. Core logic is tested independently before React integration.

```bash
npm test          # Run tests once
npm test -- --watch  # Watch mode
npm run test:ui   # Visual test UI
```
