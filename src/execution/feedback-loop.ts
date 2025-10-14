import type { ExecutionConfig } from '@/types';

export function applyFeedbackMappings(
  config: ExecutionConfig,
  outputs: Record<string, any>,
  currentInput: Record<string, any>
): Record<string, any> {
  if (config.type !== 'continuous' || !config.continuous?.feedback_mappings) {
    return currentInput;
  }

  const newInput = { ...currentInput };

  for (const mapping of config.continuous.feedback_mappings) {
    const outputValue = outputs[mapping.from_output];
    if (outputValue !== undefined) {
      newInput[mapping.to_input] = outputValue;
    }
  }

  return newInput;
}
