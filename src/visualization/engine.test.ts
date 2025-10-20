import { describe, it, expect } from 'vitest';
import { VisualizationEngine } from '@/visualization/engine';

const mockMod = {
  _sum: (i: any) => i.a + i.b,
  _next_state: (i: any) => i.rows.map((r: number[]) => r.slice()),
};

describe('VisualizationEngine', () => {
  it('runs all outputs and increments stepCount', () => {
    const engine = new VisualizationEngine({
      mod: mockMod,
      outputSchema: { sum: {}, next_state: {} },
      initialInput: { a: 2, b: 3, rows: [[1]] },
    });

    const s1 = engine.step();
    expect(s1.outputs).toEqual({ sum: 5, next_state: [[1]], step: 1 });
    expect(s1.stepCount).toBe(1);
  });

  it('pipes outputs to input with feedback mappings', () => {
    const engine = new VisualizationEngine({
      mod: mockMod,
      outputSchema: { next_state: {} },
      execConfig: {
        type: 'continuous',
        continuous: { feedback_mappings: [{ from_output: 'next_state', to_input: 'rows' }] },
      },
      initialInput: { rows: [[0,1],[1,0]] },
    });

    const s1 = engine.step();
    expect(s1.outputs?.next_state).toEqual([[0,1],[1,0]]);
    const s2 = engine.step();
    // since next_state mirrors rows, input should have been replaced identically
    expect(s2.outputs?.next_state).toEqual([[0,1],[1,0]]);
    expect(s2.stepCount).toBe(2);
  });
});
