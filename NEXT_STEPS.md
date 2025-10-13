# Kumi Play v2 - Status & Next Steps

## ✅ Complete

### Frontend (62/62 tests passing)
- Tab-based UI with Monaco editor
- Schema compilation with error handling
- Code viewer (JS/Ruby/LIR tabs)
- Auto-generated input forms with textarea for arrays/objects
- ASCII output rendering
- Example selector with 7 examples
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
2. Select example from dropdown
3. Edit schema in Schema tab
4. Click "Compile"
5. View compiled code in Compiled Code tab
6. Switch to Execute tab
7. Edit input values and click "Execute"
8. See ASCII-rendered output

## 📋 Next: Replace InputForm with Monaco JSON Editor

### Problem
Current InputForm is confusing:
- Individual JSON textareas per complex field (arrays, nested hashes)
- Hard to edit nested structures
- Not intuitive for users

### Approved Design: Single JSON Editor

Replace the per-field InputForm with a single Monaco editor showing the entire input JSON object.

### Implementation Plan

#### 1. Install Monaco Editor React Wrapper
```bash
npm install @monaco-editor/react
```

#### 2. Create JsonInputEditor Component
**File:** `src/components/JsonInputEditor.tsx`

**Features:**
- Wraps `@monaco-editor/react`
- Props: `value` (JSON object), `onChange` (parsed object callback), `onError` (validation errors)
- Language: `json`
- Validation: Real-time JSON parsing, show errors inline
- Height: ~400px
- Theme: Match app theme

**API:**
```typescript
interface JsonInputEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  onError?: (error: string | null) => void;
  height?: string;
}
```

#### 3. Update ExecuteTab
- Remove `InputForm` import
- Add `JsonInputEditor` import
- Replace `<InputForm>` with `<JsonInputEditor>`
- Initialize with `example.base_input`

#### 4. Pass Example to ExecuteTab
In `App.tsx`, pass `currentExample` to `ExecuteTab` for initial input.

#### 5. Tests (TDD)
Write tests first:
- Renders Monaco editor
- Parses valid JSON and calls onChange
- Catches invalid JSON and calls onError
- Displays formatted JSON

### Benefits
- Simpler UX: one editor, entire input visible
- More powerful: Monaco autocomplete, error highlighting, formatting
- Uses example data: `base_input` loads automatically
- Clean architecture: single source of truth

### Monaco Configuration
```typescript
<Editor
  height="400px"
  language="json"
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    formatOnPaste: true,
  }}
/>
```

## 📁 Project Structure

```
web-v2/
├── src/
│   ├── api/compile.ts           API client
│   ├── execution/eval-module.ts JS execution
│   ├── rendering/               ASCII renderers
│   ├── examples/                Example definitions
│   │   ├── index.ts
│   │   ├── arithmetic.ts
│   │   ├── array-operations.ts
│   │   └── ... (7 total)
│   ├── components/
│   │   ├── SchemaEditor.tsx     Monaco editor
│   │   ├── CompiledCodeView.tsx Code tabs
│   │   ├── ExecuteTab.tsx       Execution UI
│   │   ├── InputForm.tsx        Form generator (to be replaced)
│   │   ├── ExampleSelector.tsx  Example dropdown
│   │   └── OutputDisplay.tsx    Output renderer
│   └── App.tsx                  Main app
├── tests                        62 tests
└── docs/
    ├── DESIGN.md                Architecture
    └── NEXT_STEPS.md            This file
```

## 🎯 Current Status

**Working:** All features functional, 62 tests passing.

**Next session:** Implement Monaco JSON editor to replace InputForm.
