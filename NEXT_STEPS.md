# Next Steps for Kumi Play v2

## ✅ Completed

### Backend Updates
- [x] Updated `KumiCompile` service to extract `input_form_schema`, `output_schema`, and `lir`
- [x] Updated API controller to return new fields
- [x] Created test script (`web/test-compile-api.sh`)
- [x] Fully backwards compatible

### Frontend Foundation
- [x] Project structure set up (`web-v2/`)
- [x] Core utilities: ASCII renderers, statistics, RNG
- [x] Execution module with dynamic import-based eval
- [x] API client with comprehensive error handling
- [x] Integration tests for full compile → eval → execute flow
- [x] **52/52 tests passing (9 test files)**

## 🚧 Current Priority: React UI

Build the user interface to connect everything together.

### 1. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### 2. Create Basic App Shell

Files to create:
- `src/main.tsx` - React entry point
- `src/App.tsx` - Main application component
- `src/index.css` - Tailwind imports and base styles

The App should:
- Show schema editor (textarea for now, Monaco later)
- Have "Compile & Run" button
- Display compilation errors
- Show output results

### 3. Test End-to-End

Start both servers:
```bash
# Terminal 1: Rails backend
cd ../web && rails s

# Terminal 2: Vite frontend
npm run dev
```

Test flow:
1. Type schema in editor
2. Click "Compile & Run"
3. See compiled output or errors

## 📋 Next Phase: Enhanced UI

Once basic app works:

### Notebook Mode
- [ ] Form generator from `input_form_schema`
- [ ] Output renderer (JSON → formatted display)
- [ ] Multiple examples with selector

### Canvas Mode
- [ ] ASCII grid display with `renderAsciiGrid()`
- [ ] Play/pause controls
- [ ] Speed slider
- [ ] Canvas worker for animation loop

### Simulation Mode
- [ ] Progress bar
- [ ] Histogram visualization
- [ ] Statistics display (mean, p95, etc)
- [ ] Simulation worker for batch execution

## 🎯 Immediate Action Plan

### Today (2-3 hours):
1. [ ] Install Tailwind CSS
2. [ ] Create `src/main.tsx`, `src/App.tsx`, `src/index.css`
3. [ ] Start both servers and test compile → execute flow
4. [ ] Fix any issues with the integration

### This Week:
5. [ ] Implement input form generation from schema
6. [ ] Add Monaco editor for better schema editing
7. [ ] Create 3 example schemas (arithmetic, shopping cart, Game of Life)
8. [ ] Add example selector dropdown

## 🧪 Testing Backend

Backend is already running. To test API directly:
```bash
cd /home/muta/repos/kumi-play/web
./test-compile-api.sh
```

Expected response includes `input_form_schema`, `output_schema`, `js_src`, etc.

## 📁 Files to Create Next

- [ ] `src/App.tsx`
- [ ] `src/main.tsx`
- [ ] `src/index.css`
- [ ] `tailwind.config.js`
- [ ] `postcss.config.js`

## 🎨 Design Principles

- **Start simple**: Textarea + JSON output first
- **ASCII rendering**: Use existing utilities, upgrade visuals later
- **Notebook mode first**: Simplest mode, no workers needed
- **Progressive enhancement**: Add Monaco/Canvas/Simulation incrementally

## 📚 Reference Docs

- `DESIGN.md` - Full architecture and design decisions
- `STATUS.md` - Current state and what's implemented
- `BACKEND_CHANGES.md` - API changes and schema
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation notes
