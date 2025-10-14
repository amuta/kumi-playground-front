import { describe, it, expect } from 'vitest';
import { applyFeedbackMappings } from './feedback-loop';
import type { ExecutionConfig } from '@/types';

describe('applyFeedbackMappings', () => {
  it('maps single output to input', () => {
    const config: ExecutionConfig = {
      type: 'continuous',
      continuous: {
        feedback_mappings: [
          { from_output: 'next_state', to_input: 'rows' }
        ]
      }
    };

    const outputs = {
      next_state: [[1, 0], [0, 1]]
    };

    const currentInput = {
      rows: [[0, 0], [0, 0]]
    };

    const result = applyFeedbackMappings(config, outputs, currentInput);

    expect(result.rows).toEqual([[1, 0], [0, 1]]);
  });

  it('preserves unmapped input fields', () => {
    const config: ExecutionConfig = {
      type: 'continuous',
      continuous: {
        feedback_mappings: [
          { from_output: 'next_state', to_input: 'rows' }
        ]
      }
    };

    const outputs = {
      next_state: [[1, 1], [1, 1]]
    };

    const currentInput = {
      rows: [[0, 0], [0, 0]],
      generation: 5,
      speed: 100
    };

    const result = applyFeedbackMappings(config, outputs, currentInput);

    expect(result.rows).toEqual([[1, 1], [1, 1]]);
    expect(result.generation).toBe(5);
    expect(result.speed).toBe(100);
  });

  it('returns input unchanged if no feedback mappings', () => {
    const config: ExecutionConfig = {
      type: 'single'
    };

    const outputs = {
      result: 42
    };

    const currentInput = {
      x: 10,
      y: 20
    };

    const result = applyFeedbackMappings(config, outputs, currentInput);

    expect(result).toEqual(currentInput);
  });
});
