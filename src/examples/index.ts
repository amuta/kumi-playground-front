import type { Example } from '@/types';
import { arithmetic } from './arithmetic';
import { shoppingCart } from './shopping-cart';
import { arrayOperations } from './array-operations';
import { nestedHash } from './nested-hash';
import { tupleFunctions } from './tuple-functions';
import { gridShift } from './grid-shift';
import { gameOfLife } from './game-of-life';
import { diamondWave } from './diamond-wave';
import { languageIntro } from './language-intro';
import { usFederalTax2024 } from './us-federal-tax-2024';
import { monteCarloSimulation } from './monte-carlo-simulation';

export const examples: Example[] = [
  languageIntro,
  usFederalTax2024,
  gameOfLife,
  diamondWave,
  monteCarloSimulation,
  arithmetic,
  shoppingCart,
  arrayOperations,
  nestedHash,
  tupleFunctions,
  gridShift,
];

export function getExample(id: string): Example | undefined {
  return examples.find((ex) => ex.id === id);
}

export function getDefaultExample(): Example {
  return examples[0];
}
