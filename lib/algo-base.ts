import { AlgorithmDef, AlgorithmState } from './algo-types';

export const SORTING_BASE: AlgorithmDef[] = [
  {
    id: 'bubble', name: '冒泡排序', en: 'Bubble Sort',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
    desc: '反复遍历数组，比较相邻元素并交换。',
    code: `void bubbleSort(int arr[], int n) {\n    int i, j, temp;\n    for (i = 0; i < n - 1; i++) {\n        for (j = 0; j < n - 1 - i; j++) {\n            if (arr[j] > arr[j + 1]) {\n                temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}`,
    explains: ['定义函数', '声明变量', '外层循环', '内层循环', '比较大小', '暂存', '位置移动', '完成一次交换', '内层下探', '外层下探', '结束'],
    genSteps: (arr: number[]) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length, sorted = new Set<number>();
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 0, msg: '开始冒泡排序' });
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          s.push({ a: [...a], cmp: [j, j + 1], swp: [], srt: Array.from(sorted), line: 4, msg: `比较` });
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            s.push({ a: [...a], cmp: [], swp: [j, j + 1], srt: Array.from(sorted), line: 5, msg: `交换` });
          }
        }
        sorted.add(n - 1 - i);
        s.push({ a: [...a], cmp: [], swp: [], srt: Array.from(sorted), line: 2, msg: `就位` });
      }
      sorted.add(0);
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: '排序完成!' });
      return s;
    }
  },
  {
    id: 'radix', name: '基数排序', en: 'Radix Sort',
    best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: true,
    desc: '按位排序。',
    code: `void radixSort(int arr[], int n) {\n    int max = arr[0], i, exp;\n    for (i=1; i<n; i++) if (arr[i]>max) max=arr[i];\n    for (exp=1; max/exp>0; exp*=10) {\n        int output[n], count[10]={0};\n        for (i=0; i<n; i++) count[(arr[i]/exp)%10]++;\n        for (i=1; i<10; i++) count[i]+=count[i-1];\n        for (i=n-1; i>=0; i--) {\n            output[count[(arr[i]/exp)%10]-1]=arr[i];\n            count[(arr[i]/exp)%10]--;\n        }\n        for (i=0; i<n; i++) arr[i]=output[i];\n    }\n}`,
    explains: ['定义', '提取变量', '获取最大值', '循环获取位数', '准备新桶', '统计词频', '累加边界', '放置output', '赋值', '退位', '回写', '', '结束'],
    genSteps: (arr: number[]) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 0, msg: "开始基数排序(LSD)" });
      let max = a[0];
      for (let i = 1; i < n; i++) if (a[i] > max) max = a[i];
      s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 2, msg: `最大数值 ${max}` });

      for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        s.push({ a: [...a], cmp: [], swp: [], srt: [], line: 3, msg: `> > > 按照权值 ${exp} 分发` });
        const output = new Array(n).fill(0), count = new Array(10).fill(0);

        for (let i = 0; i < n; i++) {
          const digit = Math.floor(a[i] / exp) % 10;
          count[digit]++;
          s.push({ a: [...a], cmp: [i], swp: [], srt: [], line: 5, msg: `提取按位分布` });
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];

        for (let i = n - 1; i >= 0; i--) {
          const digit = Math.floor(a[i] / exp) % 10;
          output[count[digit] - 1] = a[i];
          count[digit]--;
        }

        for (let i = 0; i < n; i++) {
          a[i] = output[i];
          s.push({ a: [...a], cmp: [], swp: [i], srt: [], line: 10, msg: `回填归位 arr[${i}]=${a[i]}` });
        }
      }
      s.push({ a: [...a], cmp: [], swp: [], srt: Array.from({ length: n }, (_, i) => i), line: -1, msg: "排序完成!" });
      return s;
    }
  }
];

export const SEARCHING_BASE: AlgorithmDef[] = [
  {
    id: 'exponential', name: '指数搜索', en: 'Exponential Search',
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', stable: null,
    desc: '指数跳跃定边界，再进行二分检索。',
    code: `int exponentialSearch(int arr[], int n, int target) {\n    if (arr[0] == target) return 0;\n    int bound = 1;\n    while (bound < n && arr[bound] <= target)\n        bound *= 2;\n    int left = bound / 2;\n    int right = (bound < n - 1) ? bound : n - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
    explains: ['主函数', '开局秒查', '定义初始步宽', '跳跃', '拉伸', '寻左区', '寻右区', '常规', '规避', '捕获', '向右侧收敛', '向左收敛', '...', '退出'],
    genSteps: (arr: number[], target = 0) => {
      const s: AlgorithmState[] = [], a = [...arr], n = a.length;
      s.push({ a: [...a], cmp: [], found: -1, elim: [], ptrs: {}, line: 0, msg: `指数查找 ${target}` });
      if (a[0] === target) {
        s.push({ a: [...a], cmp: [0], found: 0, elim: [], ptrs: {}, line: 1, msg: `命中` });
        return s;
      }
      s.push({ a: [...a], cmp: [0], found: -1, elim: [], ptrs: {}, line: 1, msg: `未命中` });

      let bound = 1;
      while (bound < n && a[bound] <= target) {
        s.push({ a: [...a], cmp: [bound], found: -1, elim: [], est: bound, line: 3, msg: `加倍探出边界` });
        bound *= 2;
      }
      let l = Math.floor(bound / 2), r = Math.min(bound, n - 1);
      s.push({ a: [...a], cmp: [], found: -1, elim: [], ptrs: { l, r }, line: 5, msg: `锁定 L=${l}, R=${r}` });

      while (l <= r) {
        const mid = Math.floor(l + (r - l) / 2);
        s.push({ a: [...a], cmp: [mid], found: -1, elim: [], ptrs: { l, r, mid }, line: 8, msg: `二分中切` });
        if (a[mid] === target) {
          s.push({ a: [...a], cmp: [], found: mid, elim: [], ptrs: { l, r, mid }, line: 9, msg: `命中!` });
          return s;
        } else if (a[mid] < target) {
          const e = []; for (let k = l; k <= mid; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l: mid + 1, r, mid }, line: 10, msg: `排除左侧` });
          l = mid + 1;
        } else {
          const e = []; for (let k = mid; k <= r; k++) e.push(k);
          s.push({ a: [...a], cmp: [], found: -1, elim: e, ptrs: { l, r: mid - 1, mid }, line: 11, msg: `排除右侧` });
          r = mid - 1;
        }
      }
      s.push({ a: [...a], cmp: [], found: -1, elim: Array.from({ length: n }, (_, i) => i), ptrs: {}, line: 13, msg: `无` });
      return s;
    }
  }
];
