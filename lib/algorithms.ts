import { SORTING_BASE, SEARCHING_BASE } from './algo-base';
import { SORTING_1 } from './algo-sorting-1';
import { SORTING_2 } from './algo-sorting-2';
import { SEARCHING_REST } from './algo-searching';
import { AlgorithmDef, AlgorithmState } from './algo-types';

export type { AlgorithmDef, AlgorithmState };
export const SORTING = [...SORTING_BASE, ...SORTING_1, ...SORTING_2];
export const SEARCHING = [...SEARCHING_BASE, ...SEARCHING_REST];
