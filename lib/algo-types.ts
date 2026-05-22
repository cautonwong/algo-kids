export interface AlgorithmState {
  a: number[];
  cmp?: number[];
  swp?: number[];
  srt?: number[];
  pivot?: number;
  ptrs?: { l?: number; r?: number; mid?: number };
  found?: number;
  elim?: number[];
  ptr?: number;
  est?: number;
  line: number;
  msg: string;
}

export type AlgorithmDef = {
  id: string;
  name: string;
  en: string;
  best: string;
  avg: string;
  worst: string;
  space: string;
  stable: boolean | null;
  desc: string;
  code: string;
  explains: string[];
  genSteps: (arr: number[], target?: number) => AlgorithmState[];
};
