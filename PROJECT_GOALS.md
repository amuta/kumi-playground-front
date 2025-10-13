# Kumi Play v2 - Project Goals & Roadmap

## Primary Goal

Create a working playground to demonstrate Kumi's capabilities through interactive examples.

### Success Criteria
- ✅ Users can compile and execute Kumi schemas
- ✅ Clean, professional UI with Monaco editor
- ✅ Support for different output types (scalars, arrays, grids)
- 🚧 Pre-built examples to explore Kumi features
- 🚧 End-to-end testing with backend
- 🚧 Visual polish and user experience

## Current Status

**Completed** (55/55 tests passing):
- Tab-based UI architecture
- Schema editor with Monaco
- Code viewer (JS/Ruby/LIR)
- Auto-generated input forms
- ASCII output rendering
- Browser-compatible execution

**In Progress**:
- Example schemas system

## Roadmap

### Phase 1: Examples & Validation ⬅️ Current Focus

**Goal**: Validate the full stack with real schemas and make the app immediately useful.

**Tasks**:
1. Create example schemas:
   - Basic arithmetic (scalars)
   - Shopping cart (1D array)
   - Grid/matrix operations (2D array)
2. Add example selector dropdown in header
3. Test with real backend (Rails)
4. Fix any rendering issues discovered

**Why first**: Validates everything works end-to-end before adding complexity.

### Phase 2: Visual Polish

**Goal**: Make the UI professional and delightful to use.

**Tasks**:
1. Header styling (gradient, better typography)
2. Button hover effects and transitions
3. Card shadows and depth
4. Loading states with spinners
5. Success/error animations
6. Better spacing and padding
7. Improved focus states (accessibility)

**Why next**: Polish makes a great first impression and improves UX.

### Phase 3: Mode Architecture Refactor

**Goal**: Prepare for Canvas and Simulation modes.

**Tasks**:
1. Extract NotebookExecutor from ExecuteTab
2. Create executors directory structure
3. Add mode routing in ExecuteTab
4. Update examples to include mode metadata
5. Design CanvasExecutor UI (without implementation)
6. Design SimulationExecutor UI (without implementation)

**Why later**: Architecture needed for advanced features, but works fine as-is for notebooks.

### Phase 4: Canvas Mode

**Goal**: Support animated visualizations (Game of Life).

**Tasks**:
1. Implement CanvasExecutor component
2. Add play/pause/step/reset controls
3. Add speed slider
4. Create canvas-worker for animation loop
5. Add Game of Life example
6. Test performance with large grids

**Dependencies**: Phase 3 (mode refactor) must be complete.

### Phase 5: Simulation Mode

**Goal**: Support Monte Carlo simulations with statistics.

**Tasks**:
1. Implement SimulationExecutor component
2. Add progress bar for batch execution
3. Create simulation-worker for background processing
4. Integrate histogram rendering
5. Add statistics display (mean, std, p95)
6. Add random field generation UI
7. Create pricing/risk simulation examples

**Dependencies**: Phase 3 (mode refactor) must be complete.

## Success Metrics

### Usability
- Can load and run examples in < 30 seconds
- Clear visual feedback for all actions
- No confusing errors or dead ends

### Technical
- All tests passing
- Works with real backend
- No layout issues on common screen sizes
- Fast compile and execution (<1s for simple schemas)

### Feature Completeness
- Notebook mode: 100% ✅
- Canvas mode: 0% 📋
- Simulation mode: 0% 📋

## Non-Goals (for now)

- Multi-user / authentication
- Schema saving / persistence
- Mobile responsiveness (desktop-first)
- Custom themes beyond dark/light
- Syntax highlighting for Kumi DSL
- Share/permalink functionality
- Performance profiling dashboard

These may be added later based on user feedback.
