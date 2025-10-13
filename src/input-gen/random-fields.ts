import type { SimulationConfig } from '../types';
import { boxMullerRandom, uniformRandom } from './rng';

export function generateRandomFields(
  fields: SimulationConfig['random_fields']
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, config] of Object.entries(fields)) {
    if (config.distribution === 'normal') {
      result[key] = boxMullerRandom(config.mean, config.std);
    } else if (config.distribution === 'uniform') {
      result[key] = uniformRandom(config.min, config.max);
    }
  }

  return result;
}
