import { AlgorithmDef, AlgorithmState } from './algo-types';

export const SEARCHING_REST: AlgorithmDef[] = [
  {
    id: 'linear', name: '线性搜索', en: 'Linear Search',
    best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', stable: null,
    desc: '从头到尾逐个检查每个元素。',
    code: `int linearSearch(int arr[], int n, int target) {\n    int i;\n    for (i = 0; i < n; i++) {\n        if (arr[i] == target) {\n            return i;\n        }\n    }\n    return -1;\n}`,
    explains: ['入', '参', '找', '探', '中', '退', '闭', '未'],
    genSteps: (arr, target = 0) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      s.push({ a: [...a], cmp: [], found: -1, elim: [], ptr: -1, line: 0, msg: \`搜 \${target}\` });
      for (let i = 0; i < n; i++) {
        s.push({ a: [...a], cmp: [i], found: -1, elim: [], ptr: i, line: 3, msg: \`探 \${a[i]}\` });
        if (a[i] === target) {
          s.push({ a: [...a], cmp: [], found: i, elim: [], ptr: i, line: 4, msg: \`中!\` });
          return s;
        }
      }
      s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), ptr: -1, line: 7, msg: \`脱靶\` });
      return s;
    }
  },
  {
    id: 'binary', name: '二分搜索', en: 'Binary Search',
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', stable: null,
    desc: '在有序数组中对半切。',
    code: `int binarySearch(int arr[], int n, int target) {\n    int left=0, right=n-1, mid;\n    while (left <= right) {\n        mid = left + (right-left)/2;\n        if (arr[mid] == target)\n            return mid;\n        else if (arr[mid] < target)\n            left = mid + 1;\n        else\n            right = mid - 1;\n    }\n    return -1;\n}`,
    explains: ['入', '划边界', '大循环', '切点', '比点', '打中', '太小', '挪左', '太大', '挪右', '闭圈', '偏'],
    genSteps: (arr, target = 0) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      let l = 0, r = n - 1;
      s.push({ a: [...a], cmp: [], found: -1, elim: [], ptrs: { l: 0, r: n - 1 }, line: 0, msg: \`搜 \${target}\` });
      while (l <= r) {
        const mid = Math.floor(l + (r - l) / 2);
        s.push({ a: [...a], cmp: [mid], found: -1, elim: [], ptrs: { l, r, mid }, line: 3, msg: \`切L\${l}R\${r}看\${mid}\` });
        if (a[mid] === target) {
          s.push({ a: [...a], cmp: [], found: mid, elim: [], ptrs: { l, r, mid }, line: 5, msg: \`中!\` });
          return s;
        } else if (a[mid] < target) {
          const e: number[] = []; for (let k = l; k <= mid; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l: mid + 1, r, mid }, line: 7, msg: \`往后找\` });
          l = mid + 1;
        } else {
          const e: number[] = []; for (let k = mid; k <= r; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l, r: mid - 1, mid }, line: 9, msg: \`往前找\` });
          r = mid - 1;
        }
      }
      s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), ptrs: {}, line: 11, msg: \`无\` });
      return s;
    }
  },
  {
    id: 'jump', name: '跳转搜索', en: 'Jump Search',
    best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)', space: 'O(1)', stable: null,
    desc: '步宽 √n 跳跃，顺滑过渡。',
    code: `int jumpSearch(int arr[], int n, int target) {\n    int step = (int)sqrt(n);\n    int prev = 0, curr = step;\n    while (curr < n && arr[curr-1] < target) {\n        prev = curr;\n        curr += step;\n    }\n    for (int i = prev; i < curr && i < n; i++) {\n        if (arr[i] == target) return i;\n    }\n    return -1;\n}`,
    explains: ['入', '步宽', '起始点', '寻边', '记录推移', '跨步', '锁框', '内扫', '命中', '环', '未'],
    genSteps: (arr, target = 0) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      const step = Math.max(1, Math.floor(Math.sqrt(n)));
      let prev = 0, curr = step;
      s.push({ a: [...a], cmp: [], found: -1, elim: [], est: -1, ptr: 0, line: 1, msg: \`跳\` });
      while (curr < n && a[curr - 1] < target) {
        s.push({ a: [...a], cmp: [curr - 1], found: -1, elim: [], est: curr, line: 3, msg: \`接力\` });
        prev = curr; curr += step;
        if (prev >= n) {
          s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), est: -1, ptr: -1, line: 8, msg: \`跃出\` });
          return s;
        }
      }
      const be = Math.min(curr, n);
      s.push({ a: [...a], cmp: [], found: -1, elim: [], est: -1, ptr: prev, line: 6, msg: \`线查\` });
      for (let i = prev; i < be; i++) {
        s.push({ a: [...a], cmp: [i], found: -1, elim: [], est: -1, ptr: i, line: 6, msg: \`碰\` });
        if (a[i] === target) {
          s.push({ a: [...a], cmp: [], found: i, elim: [], est: -1, ptr: i, line: 7, msg: \`中!\` });
          return s;
        }
      }
      s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), est: -1, ptr: -1, line: 9, msg: \`无\` });
      return s;
    }
  },
  {
    id: 'interpolation', name: '插值搜索', en: 'Interpolation Search',
    best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)', space: 'O(1)', stable: null,
    desc: '数学估摸位置。',
    code: `int interpolationSearch(int arr[], int n, int t) {\n    int lo=0, hi=n-1, pos;\n    while (lo<=hi && t>=arr[lo] && t<=arr[hi]) {\n        if (lo == hi) {\n            if (arr[lo]==t) return lo;\n            return -1;\n        }\n        pos = lo + (int)((double)(hi-lo) * (t-arr[lo]) / (arr[hi]-arr[lo]));\n        if (arr[pos] == t) return pos;\n        if (arr[pos] < t) lo = pos + 1;\n        else hi = pos - 1;\n    }\n    return -1;\n}`,
    explains: ['头', '边', '框', '单', '中', '飞', '飞', '公式推', '中', '左', '右', '退环', '瞎'],
    genSteps: (arr, target = 0) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      let lo = 0, hi = n - 1;
      s.push({ a: [...a], cmp: [], found: -1, elim: [], ptrs: { l: 0, r: n - 1 }, est: -1, line: 0, msg: \`插\` });
      while (lo <= hi && target >= a[lo] && target <= a[hi]) {
        if (lo === hi) {
          if (a[lo] === target) {
            s.push({ a: [...a], cmp: [], found: lo, elim: [], ptrs: { l: lo, r: hi }, est: lo, line: 4, msg: \`中!\` });
            return s;
          }
          break;
        }
        const pos = lo + Math.floor((hi - lo) * (target - a[lo]) / (a[hi] - a[lo]));
        s.push({ a: [...a], cmp: [pos], found: -1, elim: [], ptrs: { l: lo, r: hi }, est: pos, line: 7, msg: \`估算pos=\${pos}\` });
        if (a[pos] === target) {
          s.push({ a: [...a], cmp: [], found: pos, elim: [], ptrs: { l: lo, r: hi }, est: pos, line: 8, msg: \`中!\` });
          return s;
        }
        if (a[pos] < target) {
          const e: number[] = []; for (let k = lo; k <= pos; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l: pos + 1, r: hi }, est: -1, line: 9, msg: \`砍后背\` });
          lo = pos + 1;
        } else {
          const e: number[] = []; for (let k = pos; k <= hi; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l: lo, r: pos - 1 }, est: -1, line: 10, msg: \`砍前胸\` });
          hi = pos - 1;
        }
      }
      s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), ptrs: {}, est: -1, line: 12, msg: \`空\` });
      return s;
    }
  }
];
