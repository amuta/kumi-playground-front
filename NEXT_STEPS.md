# Kumi Play v2 - Status & Next Steps

## ✅ Complete

### Frontend (55/55 tests passing)
- Tab-based UI with Monaco editor
- Schema compilation with error handling
- Code viewer (JS/Ruby/LIR tabs)
- Auto-generated input forms
- ASCII output rendering
- Full test coverage

### Running
```bash
# Frontend dev server
npm run dev
# → http://localhost:5173

# Backend (Rails)
cd ../web && rails s
# → http://localhost:3000
```

## 🧪 Test It

1. Open http://localhost:5173
2. Edit schema in Schema tab
3. Click "Compile"
4. View compiled code in Compiled Code tab
5. Switch to Execute tab
6. Fill form and click "Execute"
7. See ASCII-rendered output

## 📋 Next Enhancements

### 1. Refactor for Multiple Execution Modes

**Problem**: ExecuteTab is hardcoded for Notebook mode only.

**Solution**: Refactor to support Canvas and Simulation modes.

```
src/components/executors/
├── NotebookExecutor.tsx    (current ExecuteTab logic)
├── CanvasExecutor.tsx      (future: Game of Life with play/pause)
└── SimulationExecutor.tsx  (future: Monte Carlo with histogram)
```

**Steps**:
1. Create `src/examples/` with Example metadata (mode, schema_src, config)
2. Add example selector dropdown in header
3. Extract NotebookExecutor from ExecuteTab
4. Refactor ExecuteTab to route by mode:
   ```typescript
   switch(mode) {
     case 'notebook': return <NotebookExecutor />
     case 'canvas': return <CanvasExecutor />
     case 'simulation': return <SimulationExecutor />
   }
   ```

### 2. Example Schemas

Pre-built examples with mode detection:
- **Notebook**: Basic arithmetic, shopping cart
- **Canvas**: Game of Life grid (2D, animated)
- **Simulation**: Monte Carlo pricing (random inputs, statistics)

### 3. Future Mode Implementation

**Canvas Mode** - For animations (Game of Life)
- Play/pause/step controls
- Speed slider
- Web worker for animation loop

**Simulation Mode** - For Monte Carlo
- Progress bar
- Histogram visualization
- Statistics display (mean, std, p95)
- Web worker for batch execution

## 📁 Project Structure

```
web-v2/
├── src/
│   ├── api/compile.ts           API client
│   ├── execution/eval-module.ts JS execution
│   ├── rendering/               ASCII renderers
│   ├── components/
│   │   ├── SchemaEditor.tsx     Monaco editor
│   │   ├── CompiledCodeView.tsx Code tabs
│   │   ├── ExecuteTab.tsx       Execution UI
│   │   ├── InputForm.tsx        Form generator
│   │   └── OutputDisplay.tsx    Output renderer
│   └── App.tsx                  Main app
├── tests                        55 tests
└── docs/
    ├── DESIGN.md                Architecture
    └── NEXT_STEPS.md            This file
```

## 🎯 Current Status

**Ready for use!** Start the backend and test the full flow.

All core features implemented. Future work is enhancements only.
