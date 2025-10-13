# JSON-First Visualizations Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Refactor output display to default to JSON with explicit opt-in visualizations, removing inference logic for cleaner, more predictable rendering.

**Architecture:** Remove axes-based auto-detection. Create visualization registry with pure renderer components (JSON/inline/table/grid). Examples explicitly configure visualizations via `visualizations` property. JSON is default for all outputs unless overridden.

**Tech Stack:** React, TypeScript, Monaco Editor, existing ASCII renderers

---

## Task 1: Create JsonOutputViewer Component [done]
## Task 2: Add visualizations to Example type [done]
## Task 3: Create Inline Visualizer Component [done]
## Task 4: Create Table Visualizer Component [done]
## Task 5: Create Grid Visualizer Component [done]

## Task 6: Refactor OutputDisplay to use Visualizer Registry

**Files:**
- Modify: `src/components/OutputDisplay.tsx`
- Modify: `src/components/OutputDisplay.test.tsx` (if exists, otherwise skip)
- Read: Current OutputDisplay implementation

**Step 1: Write the failing test**

Update or create `src/components/OutputDisplay.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { OutputDisplay } from './OutputDisplay';
import type { Example } from '@/types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => <div data-testid="monaco">{value}</div>,
}));

describe('OutputDisplay with visualization registry', () => {
  const mockOutputSchema = {
    sum: { axes: [] },
    history: { axes: [10] },
    matrix: { axes: [3, 3] },
  };

  it('defaults to JSON visualization when no config', () => {
    const results = { sum: 42, product: 100 };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} />);

    expect(screen.getAllByTestId('monaco')).toHaveLength(2);
  });

  it('uses visualization config from example', () => {
    const results = { sum: 42, product: 100 };
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: '',
      base_input: {},
      visualizations: {
        sum: 'inline',
        product: 'inline',
      },
    };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByText('sum:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('product:')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('falls back to JSON for invalid visualization type', () => {
    const results = { value: 123 };
    const example: Example = {
      id: 'test',
      title: 'Test',
      mode: 'notebook',
      schema_src: '',
      base_input: {},
      visualizations: {
        value: 'invalid-type' as any,
      },
    };

    render(<OutputDisplay results={results} outputSchema={mockOutputSchema} example={example} />);

    expect(screen.getByTestId('monaco')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- OutputDisplay.test.tsx`

Expected: FAIL - OutputDisplay doesn't accept example prop yet

**Step 3: Refactor OutputDisplay implementation**

Modify `src/components/OutputDisplay.tsx`:

```typescript
import type { OutputField, Example, VisualizationType } from '@/types';
import { JsonOutputViewer } from './JsonOutputViewer';
import { InlineValue } from './visualizers/InlineValue';
import { TableVisualizer } from './visualizers/TableVisualizer';
import { GridVisualizer } from './visualizers/GridVisualizer';

interface OutputDisplayProps {
  results: Record<string, any>;
  outputSchema: Record<string, OutputField>;
  example?: Example;
}

const visualizers = {
  json: JsonOutputViewer,
  inline: InlineValue,
  table: TableVisualizer,
  grid: GridVisualizer,
} as const;

export function OutputDisplay({ results, outputSchema, example }: OutputDisplayProps) {
  const getVisualizationType = (outputName: string): VisualizationType => {
    const configuredType = example?.visualizations?.[outputName];

    if (configuredType && configuredType in visualizers) {
      return configuredType;
    }

    if (configuredType) {
      console.warn(`Unknown visualization type "${configuredType}" for output "${outputName}", falling back to JSON`);
    }

    return 'json';
  };

  const renderOutput = (name: string, value: any) => {
    const vizType = getVisualizationType(name);
    const Visualizer = visualizers[vizType];

    if (vizType === 'json') {
      return (
        <div key={name}>
          <div className="font-medium mb-2">{name}:</div>
          <JsonOutputViewer value={value} />
        </div>
      );
    }

    return <Visualizer key={name} name={name} value={value} />;
  };

  return (
    <div className="space-y-6">
      {Object.entries(results).map(([name, value]) => renderOutput(name, value))}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- OutputDisplay.test.tsx`

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add src/components/OutputDisplay.tsx src/components/OutputDisplay.test.tsx
git commit -m "refactor: use visualization registry in OutputDisplay, default to JSON"
```

---