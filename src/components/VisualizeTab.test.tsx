// mock Monaco BEFORE importing components that transitively import it
import { vi } from 'vitest';
vi.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="monaco">Monaco</div>,
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { VisualizeTab, type VisualizeTabRef } from './VisualizeTab';
import type { CompileResponse } from '@/api/compile';

// mock artifact loader for deterministic outputs
vi.mock('@/execution/artifact-runner', async () => {
  return {
    loadArtifactModule: vi.fn(async () => ({
      _next_state: ({ rows }: any) => rows.map((r: number[]) => r.slice()), // identity
      _v: ({ x }: any) => x + 1,
    })),
  };
});

const compiled: CompileResponse = {
  artifact_url: 'http://x/a.js',
  js_src: '',
  ruby_src: '',
  lir: '',
  schema_hash: 'h',
  input_form_schema: {},
  output_schema: { next_state: {}, v: {} },
};

const example = {
  id: 'gol',
  title: 'gol',
  mode: 'notebook',
  schema_src: '',
  base_input: { rows: [[0,1],[1,0]], x: 0 },
};

describe('VisualizeTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes controller and shows placeholder first', async () => {
    render(<VisualizeTab compiledResult={compiled} example={example as any} />);
    expect(await screen.findByText(/Press Play to visualize/i)).toBeInTheDocument();
  });

  it('renders OutputView when a step happens', async () => {
    const ref = createRef<VisualizeTabRef>();
    render(<VisualizeTab ref={ref} compiledResult={compiled} example={example as any} />);
    await screen.findByText(/Press Play/i);

    act(() => ref.current!.step());
    expect(screen.queryByText(/Press Play/i)).not.toBeInTheDocument();
  });

  it('togglePlay toggles playing flag', async () => {
    const ref = createRef<VisualizeTabRef>();
    render(
      <VisualizeTab
        ref={ref}
        compiledResult={compiled}
        example={example as any}
        executionConfig={{ type:'continuous', continuous:{ playback_speed: 180 } }}
      />
    );
    await screen.findByText(/Press Play/i);

    act(() => ref.current!.togglePlay());
    expect(ref.current!.isPlaying).toBe(true);

    act(() => ref.current!.togglePlay());
    expect(ref.current!.isPlaying).toBe(false);
  });

  it('default playback speed path works when not provided', async () => {
    const ref = createRef<VisualizeTabRef>();
    render(
      <VisualizeTab
        ref={ref}
        compiledResult={compiled}
        example={example as any}
        executionConfig={{ type:'continuous', continuous:{} }}
      />
    );
    await screen.findByText(/Press Play/i);
    act(() => ref.current!.togglePlay());
    expect(ref.current!.isPlaying).toBe(true);
    act(() => ref.current!.togglePlay());
    expect(ref.current!.isPlaying).toBe(false);
  });

  it('re-inits when artifact_url changes', async () => {
    const { rerender } = render(<VisualizeTab compiledResult={compiled} example={example as any} />);
    await screen.findByText(/Press Play/i);

    const compiled2 = { ...compiled, artifact_url: 'http://x/b.js' };
    rerender(<VisualizeTab compiledResult={compiled2} example={example as any} />);
    expect(await screen.findByText(/Press Play/i)).toBeInTheDocument();
  });

  it('exposes error when artifact_url missing', async () => {
    const bad = { ...compiled, artifact_url: undefined as unknown as string };
    render(<VisualizeTab compiledResult={bad} example={example as any} />);
    expect(await screen.findByText(/No executable artifact/i)).toBeInTheDocument();
  });
});
