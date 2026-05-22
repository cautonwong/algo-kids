import { AlgorithmDef, AlgorithmState } from './algo-types';

export const SORTING_1: AlgorithmDef[] = [
  {
    id: 'selection', name: '选择排序', en: 'Selection Sort',
    best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false,
    desc: '每一轮从未排序部分找到最小的元素，放到已排序部分的末尾。像打扑克时每次从手牌中挑出最小的牌放到最前面。',
    code: `void selectionSort(int arr[], int n) {\n    int i, j, minIdx, temp;\n    for (i = 0; i < n - 1; i++) {\n        minIdx = i;\n        for (j = i + 1; j < n; j++) {\n            if (arr[j] < arr[minIdx]) {\n                minIdx = j;\n            }\n        }\n        if (minIdx != i) {\n            temp = arr[i];\n            arr[i] = arr[minIdx];\n            arr[minIdx] = temp;\n        }\n    }\n}`,
    explains: ['定义', '声明', '外层', '置位', '内层', '判定', '接值', '内出', '判定换', '暂存', '换入', '退暂'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      s.push({ a: [...a], cmp: [], swp: [], srt: [], pivot: -1, line: 0, msg: '开始选择排序' });
      for (let i = 0; i < n - 1; i++) {
        let mi = i;
        s.push({ a: [...a], cmp: [], swp: [], srt: Array.from(sorted), pivot: i, line: 3, msg: `第${i + 1}轮` });
        for (let j = i + 1; j < n; j++) {
          s.push({ a: [...a], cmp: [j, mi], swp: [], srt: Array.from(sorted), pivot: mi, line: 5, msg: `比较` });
          if (a[j] < a[mi]) mi = j;
        }
        if (mi !== i) {
          [a[i], a[mi]] = [a[mi], a[i]];
          s.push({ a: [...a], cmp: [], swp: [i, mi], srt: Array.from(sorted), pivot: -1, line: 9, msg: `交换` });
        }
        sorted.add(i);
      }
      sorted.add(n - 1);
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), pivot: -1, line: -1, msg: '完成' });
      return s;
    }
  },
  {
    id: 'insertion', name: '插入排序', en: 'Insertion Sort',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
    desc: '从第二个元素开始，将每个元素插入到前面已排序部分的正确位置。',
    code: `void insertionSort(int arr[], int n) {\n    int i, j, key;\n    for (i = 1; i < n; i++) {\n        key = arr[i];\n        j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}`,
    explains: ['定', '变', '外', '提取', '寻', '探', '移', '退', '挂', '入', '回', '落'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      s.push({ a: [...a], cmp: [], swp: [], srt: [0], pivot: -1, line: 0, msg: '开始插入' });
      for (let i = 1; i < n; i++) {
        const key = a[i];
        s.push({ a: [...a], cmp: [], swp: [], srt: [], pivot: i, line: 3, msg: `取 key ${key}` });
        let j = i - 1;
        while (j >= 0 && a[j] > key) {
          s.push({ a: [...a], cmp: [j], swp: [], srt: [], pivot: i, line: 6, msg: `右移` });
          a[j + 1] = a[j];
          s.push({ a: [...a], cmp: [], swp: [j, j + 1], srt: [], pivot: j, line: 7, msg: `移` });
          j--;
        }
        a[j + 1] = key;
        s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: i + 1 }, (_, k) => k), pivot: j + 1, line: 9, msg: `插入到位` });
      }
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), pivot: -1, line: -1, msg: '完成' });
      return s;
    }
  },
  {
    id: 'shell', name: '希尔排序', en: 'Shell Sort',
    best: 'O(n log n)', avg: 'O(n log² n)', worst: 'O(n²)', space: 'O(1)', stable: false,
    desc: '带间隔的插入排序。',
    code: `void shellSort(int arr[], int n) {\n    int gap, i, j, temp;\n    for (gap = n/2; gap > 0; gap /= 2) {\n        for (i = gap; i < n; i++) {\n            temp = arr[i];\n            j = i;\n            while (j >= gap && arr[j-gap] > temp) {\n                arr[j] = arr[j-gap];\n                j -= gap;\n            }\n            arr[j] = temp;\n        }\n    }\n}`,
    explains: ['定', '变', '分', '列', '暂', '设', '循', '挂', '减', '退', '入', '出', '毕'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 0, msg: '开始希尔' });
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        s.push({ a: [...a], cmp: [], swp: [], srt: Array.from(sorted), line: 2, msg: `gap=${gap}` });
        for (let i = gap; i < n; i++) {
          const tmp = a[i]; let j = i;
          s.push({ a: [...a], cmp: [i], swp: [], srt: Array.from(sorted), line: 4, msg: `抓取` });
          while (j >= gap && a[j - gap] > tmp) {
            s.push({ a: [...a], cmp: [j, j - gap], swp: [], srt: Array.from(sorted), line: 6, msg: `后移` });
            a[j] = a[j - gap];
            s.push({ a: [...a], cmp: [], swp: [j], srt: Array.from(sorted), line: 7, msg: `移动` });
            j -= gap;
          }
          a[j] = tmp;
          s.push({ a: [...a], cmp: [], swp: [j], srt: Array.from(sorted), line: 9, msg: `投入` });
        }
      }
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: '完成!' });
      return s;
    }
  }
];
