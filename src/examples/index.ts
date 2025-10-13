import type { Example } from '@/types';
import { arithmetic } from './arithmetic';
import { shoppingCart } from './shopping-cart';
import { arrayOperations } from './array-operations';
import { userFilter } from './user-filter';
import { nestedHash } from './nested-hash';
import { tupleFunctions } from './tuple-functions';
import { gridShift } from './grid-shift';

export const examples: Example[] = [
  arithmetic,
  shoppingCart,
  arrayOperations,
  userFilter,
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
