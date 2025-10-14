# Kumi Play

Compile and run Kumi schemas against a backend compiler. UI-first, artifact-only execution.

## Quickstart
- Node 18+
- `npm i`
- `VITE_API_BASE=http://localhost:3000` (or your endpoint)
- Run: `npm run dev`
- Test: `npm test`

## Architecture

**Separation**
- **View**: React UI. Orchestrates tabs, state, keyboard, errors. No execution.
- **Execute**: Pure compute. Loads and runs the compiled **artifact**. No DOM, no timers.
- **Config**: Typed data shaping behavior. No I/O.

**Data flow**
```

Schema(edit)
→ compileSchema(POST /api/kumi/compile)
→ CompileResult{ artifact_url, input_form_schema, output_schema, js_src?, ruby_src?, lir? }
→ ExecuteTab
→ runAllOutputsFromUrl(artifact_url, input, output_schema)
→ OutputDisplay(visualize)

````

## Compiler Contract

`POST {API_BASE}/api/kumi/compile` with `{ schema_src }`

**Success**
```json
{
  "artifact_url": "https://…/abcdef.js",
  "js_src": "...", "ruby_src": "...", "lir": "...",
  "schema_hash": "abcdef",
  "input_form_schema": { "...": { "type": "integer" } },
  "output_schema": { "sum": { "kind": "value", "type": "integer", "axes": [] } }
}
````

**Failure**

```json
{ "errors": ["message"] }
```

UI surfaces `errors[0]` or `Compilation failed`.

## View

* `App.tsx`: Tabs (Schema/Compiled/Execute), keyboard, wiring.
* **Per-example state**:
  `exampleStates[id] = { schema, compiled, execution_config, visualization_config }`.
  Load on example change. Save on edits/compiles.
* `SchemaTabContainer`: `SchemaEditor` + `ConfigEditor`. Only place that calls `compileSchema`.
* `CompiledCodeView`: read-only previews.
* `ExecuteTab`: JSON input + results.
  If `execution_config.type === "continuous"`: render **play/pause/step/reset**, **speed slider**, **iteration counter**.
  Playback uses a View timer; each tick runs **one** execution step.

## Execute

* `src/execution/artifact-runner.ts`

  * `loadArtifactModule(url)`
  * `executeOutput(mod, name, input)`  // calls `_${name}`
  * `runAllOutputs(mod, input, output_schema)`  // filters `kind:"value"`
  * `runAllOutputsFromUrl(url, input, output_schema)`
* Continuous:

  * `executeIterationLoop(artifact_url, output_schema, config, initialInput, n)`
  * `applyFeedbackMappings(config, outputs, currentInput)`

## Config

* Types: `ExecutionConfig`, `VisualizationConfig`, `Example`.
* `ConfigEditor`: edits combined JSON; emits parse errors only.

## Visualization

* Precedence: `visualization_config.outputs[name]?.type` → `example.visualizations?.[name]` → `json`.
* `grid` applies `visualization_config.outputs[name].grid.cell_map` (e.g. `{ "0":"·", "1":"█" }`).
* Renderers: `JsonOutputViewer`, `TableVisualizer` (ASCII table), `GridVisualizer` (ASCII grid).

## Keyboard

* ⌘/Ctrl+1/2/3: tabs
* ⌘/Ctrl+S: compile
* ⌘/Ctrl+Enter: compile/execute
* ⌘/Ctrl+K or `?`: shortcuts panel

## Testing

* API and error surfacing.
* URL execution and trait filtering.
* Feedback loop mapping and multi-iteration history.
* Per-example state restore on example switch.
* ExecuteTab control rendering for `continuous`.
* Visualizer precedence + `cell_map`.

## Known Requirements

* **CORS**: artifact must allow cross-origin fetch.
* **Caching**: cache by `schema_hash`; bust on change.
* **Content-Type**: `text/javascript`.
* **Tests**: Node/Vitest need `Buffer` (Node 18 OK).

## Roadmap Fit

* Per-example state isolation: **covered**.
* `SchemaTabContainer` integration: **covered**.
* ExecuteTab simulation UI with timer-driven steps: **covered**.
* Visualization from `visualization_config` with `grid.cell_map`: **covered**.
* Keep other examples `single`: **no change needed**.
