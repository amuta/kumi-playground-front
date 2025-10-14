// Transitional shim. Prefer importing from './artifact-runner'.
export {
  loadArtifactModule as evalCompiledModuleFromUrl,
  runAllOutputsFromUrl as executeAllOutputsFromUrl,
  runAllOutputs as executeAllOutputs,
  executeOutput,
} from './artifact-runner';
