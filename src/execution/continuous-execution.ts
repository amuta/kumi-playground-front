import type { OutputField, ExecutionConfig } from '@/types';
import { executeAllOutputsFromUrl } from './eval-module-url';
import { applyFeedbackMappings } from './feedback-loop';

export async function executeSingleIteration(
  artifactUrl: string,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>
): Promise<Record<string, any>> {
  return executeAllOutputsFromUrl(artifactUrl, input, outputSchema);
}

export type IterationStep = {
  input: Record<string, any>;
  outputs: Record<string, any>;
};

export async function executeIterationLoop(
  artifactUrl: string,
  outputSchema: Record<string, OutputField>,
  config: ExecutionConfig,
  initialInput: Record<string, any>,
  maxIterations: number
): Promise<IterationStep[]> {
  const history: IterationStep[] = [];
  let currentInput = initialInput;

  for (let i = 0; i < maxIterations; i++) {
    const outputs = await executeSingleIteration(artifactUrl, currentInput, outputSchema);

    history.push({
      input: currentInput,
      outputs
    });

    currentInput = applyFeedbackMappings(config, outputs, currentInput);
  }

  return history;
}
