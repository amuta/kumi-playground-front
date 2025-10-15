
This demo showcases Kumi end-to-end with **artifact-only** execution. Three roles: **View**, **Execute**, **Config**. Clean seams and typed contracts.

## Roles

**View (UI only)**
- Files: `App.tsx`, `SchemaTabContainer`, `SchemaEditor`, `ConfigEditor`, `CompiledCodeView`, `ExecuteTab`, `StickyActionBar`, `useKeyboard`.
- Owns tabs, input state, errors, and per-example state:
  `exampleStates[exampleId] = { schema, compiled, execution_config, visualization_config }`.
- Calls `compileSchema` only from `SchemaEditor`.
- In Execute, when `execution_config.type === "continuous"`, View renders play/pause/step/reset, speed slider, and iteration counter. Timers live here.

**Execute (pure compute, no DOM, no timers)**
- Files: `execution/artifact-runner.ts`, `execution/continuous-execution.ts`, `execution/feedback-loop.ts`.
- Load and run artifacts:
  - `loadArtifactModule(url)` → ES module.
  - `runAllOutputs(module, input, output_schema)` runs only `kind: "value"`.
  - `runAllOutputsFromUrl(url, input, output_schema)` convenience.
- Continuous:
  - `executeIterationLoop(artifact_url, output_schema, config, initialInput, n)` returns history.
  - `applyFeedbackMappings(config, outputs, currentInput)` maps outputs → next input.

**Config (data only)**
- Types: `ExecutionConfig`, `VisualizationConfig`, `Example`.
- `ConfigEditor` edits combined JSON. Emits parse errors. No I/O.

## Data flow
`Schema(edit)
 → POST /api/kumi/compile
 → CompileResult{ artifact_url, input_form_schema, output_schema, schema_hash, js_src?, ruby_src?, lir? }
 → ExecuteTab
 → runAllOutputsFromUrl(artifact_url, input, output_schema)
 → OutputView`

## Compiler contract
- Request: `{ schema_src }` to `{API_BASE}/api/kumi/compile`.
- Success: `artifact_url` is authoritative for execution. `js_src|ruby_src|lir` are display only.
- Failure: UI surfaces first `errors[0]` or `Compilation failed`.

## Visualization
- Router: `OutputView`.
- Precedence: `visualization_config.outputs[name]?.type` → `example.visualizations?.[name]` → `json`.
- `grid` applies `visualization_config.outputs[name].grid.cell_map` if present.
- Renderers: `JsonOutputViewer`, `TableVisualizer`, `GridVisualizer`. Fallback is JSON.

## Demo UX specifics
- Default example loads into Schema. Compile switches to Execute.
- Execute shows JSON input editor and output area.
- Continuous mode plays via View timer; each tick calls one iteration; state updates via feedback mappings.

## Security model
- No `eval`. Artifacts are fetched and imported as ES modules via `data:` URL.
- Requirements: CORS enabled, `Content-Type: text/javascript`, cache keyed by `schema_hash`.

## Non-goals
- No persistence backend beyond in-memory per-example state.
- No auth, multi-user, or remote execution queue.
- No runtime mutation of compiled artifacts.

## Extending the demo
- New visualizer: add component and register in the map inside `OutputView`.
- New execution mode: extend `ExecutionConfig` and add a pure runner; View only drives timing.
- New example: add to `examples/*` with `schema_src`, `base_input`, and optional configs.

## Test signals (contracts)
- Compile API errors surface in Schema.
- URL execution works and filters traits.
- Feedback loop preserves unmapped inputs.
- Per-example state restores on example switch.
- Visualization precedence and `cell_map` application.
- No DOM or timers in Execute code.

## Runbook for the demo
- Set `VITE_API_BASE`.
- Ensure artifacts serve with CORS and correct content type.
- Open app, select example, compile, execute, toggle continuous mode if available.
