import type { OutputField, InputField, ExecutionConfig } from '@/types';
import { runAllOutputsFromUrl } from './artifact-runner';
import { applyFeedbackMappings } from './feedback-loop';

export async function executeSingleIteration(
  artifactUrl: string | undefined,
  input: Record<string, any>,
  outputSchema: Record<string, OutputField>,
  inputSchema?: Record<string, InputField>
): Promise<Record<string, any>> {
  if (!artifactUrl) throw new Error('artifact_url is missing');
  return runAllOutputsFromUrl(artifactUrl, input, outputSchema, inputSchema);
}

export type IterationStep = { input: Record<string, any>; outputs: Record<string, any> };

export async function executeIterationLoop(
  artifactUrl: string | undefined,
  outputSchema: Record<string, OutputField>,
  config: ExecutionConfig,
  initialInput: Record<string, any>,
  maxIterations: number,
  inputSchema?: Record<string, InputField>
): Promise<IterationStep[]> {
  if (!artifactUrl) throw new Error('artifact_url is missing');
  const history: IterationStep[] = [];
  let currentInput = initialInput;

  for (let i = 0; i < maxIterations; i++) {
    const stepIdx = i + 1;
    const inForStep = { ...currentInput, step: stepIdx };

    const outputs = await executeSingleIteration(artifactUrl, inForStep, outputSchema, inputSchema);
    (outputs as any).step = stepIdx;

    history.push({ input: inForStep, outputs });
    currentInput = applyFeedbackMappings(config, outputs, inForStep);
  }
  return history;
}
