import { AlgorithmDef, AlgorithmState } from './algo-types';

export const SORTING_2: AlgorithmDef[] = [
  {
    id: 'merge', name: '归并排序', en: 'Merge Sort',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true,
    desc: '分治法：切碎后两两有序合并。',
    code: `void merge(int arr[], int l, int m, int r) {\n    int n1=m-l+1, n2=r-m, L[n1], R[n2];\n    int i, j, k;\n    for (i=0; i<n1; i++) L[i]=arr[l+i];\n    for (j=0; j<n2; j++) R[j]=arr[m+1+j];\n    i=0; j=0; k=l;\n    while (i<n1 && j<n2) {\n        if (L[i]<=R[j]) arr[k++]=L[i++];\n        else arr[k++]=R[j++];\n    }\n    while (i<n1) arr[k++]=L[i++];\n    while (j<n2) arr[k++]=R[j++];\n}\nvoid mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r-l)/2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m+1, r);\n        merge(arr, l, m, r);\n    }\n}`,
    explains: ['mer', '定义', 'l移', 'r移', '装载', '排环', '左选', '右选', '左接', '右接', '出', '主', '分边', '取中', '主左', '主右', '重装'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      function merge(l: number, m: number, r: number) {
        const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
          s.push({ a: [...a], cmp: [l + i, m + 1 + j], swp: [], srt: [], ptrs: { l, mid: m, r }, line: 7, msg: `比较` });
          if (L[i] <= R[j]) { a[k] = L[i]; i++; } else { a[k] = R[j]; j++; }
          s.push({ a: [...a], cmp: [], swp: [k], srt: [], ptrs: { l, mid: m, r }, line: 8, msg: `放置位 ${k}` });
          k++;
        }
        while (i < L.length) { a[k] = L[i]; s.push({ a: [...a], cmp: [], swp: [k], srt: [], line: 10, msg: `剩入 ${k}` }); i++; k++; }
        while (j < R.length) { a[k] = R[j]; s.push({ a: [...a], cmp: [], swp: [k], srt: [], line: 11, msg: `剩入 ${k}` }); j++; k++; }
      }
      function ms(l: number, r: number) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        s.push({ a: [...a], cmp: [], swp: [], srt: [], ptrs: { l, mid: m, r }, line: 14, msg: `割 ${m}` });
        ms(l, m);
        ms(m + 1, r);
        merge(l, m, r);
      }
      ms(0, n - 1);
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: '完!' });
      return s;
    }
  },
  {
    id: 'quick', name: '快速排序', en: 'Quick Sort',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false,
    desc: '基准划分。极其经典。',
    code: `int partition(int arr[], int lo, int hi) {\n    int pivot=arr[hi], i=lo-1, j, temp;\n    for (j=lo; j<hi; j++) {\n        if (arr[j] <= pivot) {\n            i++;\n            temp=arr[i]; arr[i]=arr[j]; arr[j]=temp;\n        }\n    }\n    temp=arr[i+1]; arr[i+1]=arr[hi]; arr[hi]=temp;\n    return i+1;\n}\nvoid quickSort(int arr[], int lo, int hi) {\n    if (lo < hi) {\n        int pi = partition(arr, lo, hi);\n        quickSort(arr, lo, pi-1);\n        quickSort(arr, pi+1, hi);\n    }\n}`,
    explains: ['部分', '置', '循', '比较', '增', '换', '外', '收尾', '退', '入快', '边', '获中', '排左', '排右'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      function qs(lo: number, hi: number) {
        if (lo >= hi) { if (lo === hi) sorted.add(lo); return; }
        const pv = a[hi];
        s.push({ a: [...a], cmp: [], swp: [], srt: Array.from(sorted), pivot: hi, line: 1, msg: `基准=${pv}` });
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
          s.push({ a: [...a], cmp: [j, hi], swp: [], srt: Array.from(sorted), pivot: hi, line: 3, msg: `较` });
          if (a[j] <= pv) {
            i++;
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              s.push({ a: [...a], cmp: [], swp: [i, j], srt: Array.from(sorted), pivot: hi, line: 5, msg: `换` });
            }
          }
        }
        [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
        const pi = i + 1;
        sorted.add(pi);
        s.push({ a: [...a], cmp: [], swp: [pi], srt: Array.from(sorted), pivot: pi, line: 7, msg: `轴归位` });
        qs(lo, pi - 1);
        qs(pi + 1, hi);
      }
      qs(0, n - 1);
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), pivot: -1, line: -1, msg: '完!' });
      return s;
    }
  },
  {
    id: 'heap', name: '堆排序', en: 'Heap Sort',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false,
    desc: '堆树转换。',
    code: `void heapify(int arr[], int n, int i) {\n    int largest=i, l=2*i+1, r=2*i+2, temp;\n    if (l<n && arr[l]>arr[largest]) largest=l;\n    if (r<n && arr[r]>arr[largest]) largest=r;\n    if (largest != i) {\n        temp=arr[i]; arr[i]=arr[largest]; arr[largest]=temp;\n        heapify(arr, n, largest);\n    }\n}\nvoid heapSort(int arr[], int n) {\n    int i, temp;\n    for (i=n/2-1; i>=0; i--) heapify(arr, n, i);\n    for (i=n-1; i>0; i--) {\n        temp=arr[0]; arr[0]=arr[i]; arr[i]=temp;\n        heapify(arr, i, 0);\n    }\n}`,
    explains: ['堆', '拉', '左判断', '右判断', '终位否', '互换重组', '回归', '完', '引', '初', '跑', '回缩', '收尾', '打磨', '散'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      function hp(sz: number, i: number) {
        let la = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < sz) {
          s.push({ a: [...a], cmp: [l, la], swp: [], srt: Array.from(sorted), line: 2, msg: `查左子` });
          if (a[l] > a[la]) la = l;
        }
        if (r < sz) {
          s.push({ a: [...a], cmp: [r, la], swp: [], srt: Array.from(sorted), line: 3, msg: `查右子` });
          if (a[r] > a[la]) la = r;
        }
        if (la !== i) {
          [a[i], a[la]] = [a[la], a[i]];
          s.push({ a: [...a], cmp: [], swp: [i, la], srt: Array.from(sorted), line: 5, msg: `维系` });
          hp(sz, la);
        }
      }
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 10, msg: '建树' });
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) hp(n, i);
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 11, msg: '树完备' });
      for (let i = n - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        sorted.add(i);
        s.push({ a: [...a], cmp: [], swp: [0, i], srt: Array.from(sorted), line: 12, msg: `斩落顶峰` });
        hp(i, 0);
      }
      sorted.add(0);
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: '完!' });
      return s;
    }
  },
  {
    id: 'counting', name: '计数排序', en: 'Counting Sort',
    best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: true,
    desc: '统计分布映射回放。',
    code: `void countingSort(int arr[], int n) {\n    int max = arr[0], min=arr[0], i;\n    for (i = 1; i < n; i++) {\n        if (arr[i] > max) max = arr[i];\n        if (arr[i] < min) min = arr[i];\n    }\n    int range = max - min + 1;\n    int count[range], output[n];\n    for (i = 0; i < range; i++) count[i] = 0;\n    for (i = 0; i < n; i++) count[arr[i] - min]++;\n    for (i = 1; i < range; i++) count[i] += count[i - 1];\n    for (i = n - 1; i >= 0; i--) {\n        output[count[arr[i] - min] - 1] = arr[i];\n        count[arr[i] - min]--;\n    }\n    for (i = 0; i < n; i++) arr[i] = output[i];\n}`,
    explains: ['引', '变', '搜', '确', '置', '终', '距', '空', '空复', '加码', '推界', '退位', '拿', '入', '尾', '刷回原'],
    genSteps: (arr) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 0, msg: "开局" });
      let max = a[0], min = a[0];
      for (let i = 1; i < n; i++) {
        s.push({ a: [...a], cmp: [i], swp: [], srt: [], line: 3, msg: `查值` });
        if (a[i] > max) max = a[i];
        if (a[i] < min) min = a[i];
      }
      const range = max - min + 1;
      const count = new Array(range).fill(0), output = new Array(n).fill(0);
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 6, msg: `桶备!` });

      for (let i = 0; i < n; i++) count[a[i] - min]++;
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 9, msg: `投桶统计` });

      for (let i = 1; i < range; i++) count[i] += count[i - 1];
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 10, msg: `边界算清` });

      for (let i = n - 1; i >= 0; i--) {
        const val = a[i];
        const pos = count[val - min] - 1;
        output[pos] = val;
        count[val - min]--;
        s.push({ a: [...a], cmp: [i], swp: [], srt: [], line: 12, msg: `退归` });
      }

      for (let i = 0; i < n; i++) {
        a[i] = output[i];
        sorted.add(i);
        s.push({ a: [...a], cmp: [], swp: [i], srt: Array.from(sorted), line: 15, msg: `平涂` });
      }
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: '完!' });
      return s;
    }
  }
];
