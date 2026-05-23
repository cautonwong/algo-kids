'use client';

import { useState, useEffect, useRef } from 'react';
import { highlightCode, getTranslatedCode } from '@/lib/syntax';

interface StackFrame {
  name: string;
  argsString: string;
  depth: number;
  status: 'calling' | 'returning' | 'completed';
  retVal?: string;
}

interface RecursionStep {
  line: number;
  msg: string;
  stack: StackFrame[];
  // Visual contextual states
  selectedIndices?: number[];
  array1D?: number[];
  matrix2D?: (number | string | boolean)[][];
  activeValue?: string | number;
  hanoiPegs?: number[][]; // For Hanoi: Peg A, B, C lists of disk sizes
  queensBoard?: boolean[][]; // 4x4 matrix representation
  queensConflict?: [number, number]; // conflict coordinate
  floodGrid?: string[][]; // 5x5 color character/status map
}

interface MiniRecDef {
  id: string;
  name: string;
  en: string;
  best: string;
  avg: string;
  worst: string;
  space: string;
  desc: string;
  code: string;
  explains: string[];
  genSteps: (inputs: Record<string, any>) => RecursionStep[];
}

const RECURSION_DEFS: MiniRecDef[] = [
  {
    id: 'r_fact',
    name: '阶乘计算 (Factorial)',
    en: 'Factorial Recursion',
    best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)',
    desc: '线性递归奠基者。自顶向下不断积累调用栈，直到最底层基准情况 (n <= 1) 触底反弹，层层乘积折返。',
    code: `int factorial(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);\n}`,
    explains: [
      'Factorial 阶乘主入口函数，传入阶数 n',
      '基准终止条件 (Base Case) 核查：判断当前阶乘 n 是否小于等于 1',
      '触底响应：满足基准情况时，直接返回值 1',
      '分治递归演进：计算 n 乘以 factorial(n-1)，先向下调用 (n-1)，待其返回后相乘归并',
      '边界和出口'
    ],
    genSteps: (inputs) => {
      const s: RecursionStep[] = [];
      const n = inputs.nVal || 4;
      
      const stack: StackFrame[] = [];
      
      function fact(val: number): number {
        const frame: StackFrame = { name: 'factorial', argsString: `n = ${val}`, depth: stack.length, status: 'calling' };
        stack.push(frame);
        
        s.push({
          line: 0,
          msg: `进入 factorial(${val})。`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        s.push({
          line: 1,
          msg: `检查基准：当前 ${val} 是否 <= 1？`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        if (val <= 1) {
          s.push({
            line: 2,
            msg: `满足基准情况！递归触底。factorial(${val}) 准备折返回归 1`,
            stack: [...stack.map(x => ({ ...x }))],
            activeValue: val
          });
          
          frame.status = 'returning';
          frame.retVal = '1';
          s.push({
            line: 2,
            msg: `factorial(${val}) 成功返回: 1`,
            stack: [...stack.map(x => ({ ...x }))],
            activeValue: val
          });
          stack.pop();
          return 1;
        }

        s.push({
          line: 4,
          msg: `不满足基准，必须先求解子问题：factorial(${val - 1})`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        const sub = fact(val - 1);
        const res = val * sub;

        // update current frame state on returning
        frame.status = 'returning';
        frame.retVal = String(res);
        
        s.push({
          line: 4,
          msg: `返回折折回归：将 factorial(${val - 1}) 答案 ${sub} 乘以当前的 n (${val})，得到 ${res}`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });
        
        stack.pop();
        return res;
      }

      fact(n);
      s.push({
        line: 4,
        msg: `外围主程序已成功接收最终算力解答！`,
        stack: []
      });
      return s;
    }
  },
  {
    id: 'r_fib',
    name: '斐波那契数 (Fibonacci)',
    en: 'Fibonacci Tree Recursion',
    best: 'O(2^n)', avg: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)',
    desc: '分支双重递归范式。一个函数派生两路调用，自顶向下分裂出极其可观的树枝调用，充斥大量耗能的、赤裸裸的重叠运算。',
    code: `int fib(int n) {\n    if (n <= 1) {\n        return n;\n    }\n    return fib(n - 1) + fib(n - 2);\n}`,
    explains: [
      'Fibonacci 递归求值入口，传入项数 n',
      '基准终止条件 (Base Case) ：判断 n 阶是否在起始边界内',
      '直接承载返回当前项数值 n',
      '大一统两路派生：返回 fib(n-1) 的递归解 与 fib(n-2) 的递归解之和。先压栈左节点，弹回后再求右节点',
      '出口边界'
    ],
    genSteps: (inputs) => {
      const s: RecursionStep[] = [];
      const n = Math.min(inputs.fibN || 4, 4); // Clamp to max 4 to prevent stack step explosion
      const stack: StackFrame[] = [];

      function fib(val: number): number {
        const frame: StackFrame = { name: 'fib', argsString: `n = ${val}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `调用并推入栈：fib(${val})。`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        s.push({
          line: 1,
          msg: `基准分析：评估当前值 ${val} 是否 <= 1？`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        if (val <= 1) {
          frame.status = 'returning';
          frame.retVal = String(val);
          s.push({
            line: 2,
            msg: `满足基准边界！立刻向调用方回复：${val}`,
            stack: [...stack.map(x => ({ ...x }))],
            activeValue: val
          });
          stack.pop();
          return val;
        }

        s.push({
          line: 4,
          msg: `不满足基准。面临两端叉路。首先向下层探寻左分枝：fib(${val - 1})`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        const leftRes = fib(val - 1);

        s.push({
          line: 4,
          msg: `左分枝 fib(${val - 1}) 探得值为 ${leftRes}。现在探寻右分枝结果：fib(${val - 2})`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        const rightRes = fib(val - 2);
        const sumVal = leftRes + rightRes;

        frame.status = 'returning';
        frame.retVal = String(sumVal);

        s.push({
          line: 4,
          msg: `归总结果：fib(${val}) = 左分枝(${leftRes}) + 右分枝(${rightRes}) = ${sumVal}。准备折返！`,
          stack: [...stack.map(x => ({ ...x }))],
          activeValue: val
        });

        stack.pop();
        return sumVal;
      }

      fib(n);
      s.push({
        line: 4,
        msg: `递归双叉检索圆满落幕！`,
        stack: []
      });
      return s;
    }
  },
  {
    id: 'r_hanoi',
    name: '汉诺塔 (Tower of Hanoi)',
    en: 'Tower of Hanoi Problem',
    best: 'O(2^n)', avg: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)',
    desc: '上帝的思维范式（分治金律）。化繁为简：要把 N 个盘从 A 移到 C：(1) 将 N-1 个盘从 A 移到 B；(2) 将第 N 个最重底盘从 A 移到 C；(3) 再将 N-1 个盘从 B 移到 C。',
    code: `void hanoi(int n, char from, char to, char aux) {\n    if (n == 1) {\n        printf("Move disk 1 from %c to %c\\n", from, to);\n        return;\n    }\n    hanoi(n - 1, from, aux, to);\n    printf("Move disk %d from %c to %c\\n", n, from, to);\n    hanoi(n - 1, aux, to, from);\n}`,
    explains: [
      '汉诺塔递归调度法，引入盘子数量 n，源柱 from，目标柱 to，及辅助柱 aux',
      '基准状态判定：评估当前是否需要搬移最轻顶层（盘子 1）',
      '最简拼图直接移盘：完成盘 1 的空间定位大挪移并回弹',
      '子程序第一步：将上层 N-1 个相对轻巧的圆盘全权从源柱 from 跨过 to 挪借到辅助柱 aux 放好',
      '经典本真操作：把剩下最沉、最大号的第 N 个祖宗底盘全景从 from 长途送往目标柱 to',
      '子程序第二步：再次收官收归，把暂存在 aux 上的 N-1 兄弟们统领通过 from 运回目标柱 to'
    ],
    genSteps: (inputs) => {
      const s: RecursionStep[] = [];
      const nDisk = Math.min(inputs.hanoiDisks || 3, 4); // max 4
      
      const stack: StackFrame[] = [];
      const pegsState: number[][] = [
        Array.from({ length: nDisk }, (_, i) => nDisk - i), // Peg A
        [],                                                // Peg B
        []                                                 // Peg C
      ];

      function hanoiM(val: number, from: string, to: string, aux: string) {
        const frame: StackFrame = { 
          name: 'hanoi', 
          argsString: `n=${val}, ${from}→${to}`, 
          depth: stack.length, 
          status: 'calling' 
        };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `开始 hanoi(n = ${val}, 源:${from}, 目:${to}, 辅:${aux})。`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        s.push({
          line: 1,
          msg: `检查基准：是否只需移最薄盘1？`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        if (val === 1) {
          // Perform move of disk 1 from 'from' to 'to'
          const fromIdx = from.charCodeAt(0) - 65;
          const toIdx = to.charCodeAt(0) - 65;
          const disk = pegsState[fromIdx].pop()!;
          pegsState[toIdx].push(disk);

          s.push({
            line: 2,
            msg: `【物理移盘】将 1 号极小盘顺畅由 ${from} 柱搬往 ${to} 柱。并折返回程。`,
            stack: [...stack.map(x => ({ ...x }))],
            hanoiPegs: pegsState.map(p => [...p])
          });

          stack.pop();
          return;
        }

        s.push({
          line: 4,
          msg: `多盘调度。第一幕：先全力将顶层 ${val - 1} 个盘子整体由 ${from} 转移到 ${aux} 暂安。`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        hanoiM(val - 1, from, aux, to);

        // Perform move of actual base disk 'val'
        const fromIdx = from.charCodeAt(0) - 65;
        const toIdx = to.charCodeAt(0) - 65;
        const disk = pegsState[fromIdx].pop()!;
        pegsState[toIdx].push(disk);

        s.push({
          line: 5,
          msg: `【物理移盘】核心要冲！将最大的 ${val} 号重盘正面由 ${from} 滑行至 ${to}。中立树。`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        s.push({
          line: 6,
          msg: `第二幕：现在再次征调，将存放在辅助柱 ${aux} 上的 ${val - 1} 个盘最终整备到目的柱 ${to}。`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        hanoiM(val - 1, aux, to, from);

        s.push({
          line: 6,
          msg: `hanoi(n = ${val}) 阶段任务全装打包装卸圆满！向上一层交接退关。`,
          stack: [...stack.map(x => ({ ...x }))],
          hanoiPegs: pegsState.map(p => [...p])
        });

        stack.pop();
      }

      hanoiM(nDisk, 'A', 'C', 'B');
      s.push({
        line: 0,
        msg: `整项汉诺塔搬家伟业胜利终了！`,
        stack: [],
        hanoiPegs: pegsState.map(p => [...p])
      });
      return s;
    }
  },
  {
    id: 'r_binary',
    name: '递归折半查找 (Binary Search)',
    en: 'Recursive Binary Search',
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(log n)',
    desc: '分治搜索王者。每次瞄准有序区间的中心坐标（mid），一旦有别，顺劈斩断冗余半边范围并向另一侧深挖递推。',
    code: `int binarySearch(int arr[], int l, int r, int x) {\n    if (r >= l) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == x) return mid;\n        if (arr[mid] > x)\n            return binarySearch(arr, l, mid - 1, x);\n        return binarySearch(arr, mid + 1, r, x);\n    }\n    return -1;\n}`,
    explains: [
      '递归法折半检索，引入原始数组，区间边界 l 与 r，及找寻项 x',
      '研判有效边界，若区间已反置 (r < l)，证明数据绝不存在',
      '算出中卫中心落位 mid，杜绝大加算直接溢出安全',
      '大吉闪现：若中哨 arr[mid] 与目标值 x 吻合，大功告成返回中控其坐标',
      '中心阻隔更深：如果中哨值偏大，证明目标只处于左倾区间，向下游递归 binarySearch(l, mid-1)',
      '中心阻隔偏浅：否则，递归并全力调转探索方向至右倾 binarySearch(mid+1, r)',
      '边界闭合',
      '探查无门：最终未遇上直接回复 -1 没找到'
    ],
    genSteps: (inputs) => {
      const s: RecursionStep[] = [];
      const arr = [5, 12, 18, 26, 31, 44, 58, 70, 85, 99];
      const target = inputs.searchTarget || 26;
      const stack: StackFrame[] = [];

      function bSearch(l: number, r: number): number {
        const frame: StackFrame = { name: 'binarySearch', argsString: `L=${l}, R=${r}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入折半递归。当前可搜寻区间：[${l}..${r}] (即值范围: ${arr[l]} 到 ${arr[r]})`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: [l, r]
        });

        s.push({
          line: 1,
          msg: `判断边界有效：当前 R(${r}) 是否 >= L(${l}) ？`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: [l, r]
        });

        if (r < l) {
          frame.status = 'returning';
          frame.retVal = '-1';
          s.push({
            line: 8,
            msg: `边界交叉失效 (R < L)！表明区间空无一人，目标 ${target} 缺阵。返回 -1。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr]
          });
          stack.pop();
          return -1;
        }

        const mid = Math.floor(l + (r - l) / 2);
        s.push({
          line: 2,
          msg: `确定中极轴：mid = ${l} + (${r} - ${l})/2 = ${mid} (对应数值: ${arr[mid]})`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: [l, r, mid]
        });

        if (arr[mid] === target) {
          frame.status = 'returning';
          frame.retVal = String(mid);
          s.push({
            line: 3,
            msg: `【大步命中】在 mid = ${mid} 处找到目标 ${target}！立即回归折返！`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr],
            selectedIndices: [mid]
          });
          stack.pop();
          return mid;
        }

        if (arr[mid] > target) {
          s.push({
            line: 4,
            msg: `中卫值 ${arr[mid]} 偏大 > 目标 ${target}。缩水右边界，进入左半壁继续递归搜寻：[${l}..${mid - 1}]`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr],
            selectedIndices: [l, mid - 1]
          });
          const ans = bSearch(l, mid - 1);
          frame.status = 'returning';
          frame.retVal = String(ans);
          stack.pop();
          return ans;
        } else {
          s.push({
            line: 6,
            msg: `中卫值 ${arr[mid]} 偏小 < 目标 ${target}。缩水左边界，进入右半壁递归搜求：[${mid + 1}..${r}]`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr],
            selectedIndices: [mid + 1, r]
          });
          const ans = bSearch(mid + 1, r);
          frame.status = 'returning';
          frame.retVal = String(ans);
          stack.pop();
          return ans;
        }
      }

      bSearch(0, arr.length - 1);
      return s;
    }
  },
  {
    id: 'r_merge',
    name: '合并排序 (Merge Sort)',
    en: 'Recursive Merge Sort',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
    desc: '分治圣法，完美贯彻先拆烂、再和齐。向下递归直到一刀切成独行侠（长度 1），再两两有序黏贴，织网合并上升。',
    code: `void mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}`,
    explains: [
      '合并归并排序的宏观统筹入口，给定边界坐标 l 与 r',
      '评估拆分条件：当 l < r 才展开归类。若遇到单个粒子，即刻达成退化状态',
      '精准斩断：分割中心划位 m',
      '深度递归：先把左部分隔区间 arr[l..m] 递归排序妥帖',
      '深度递归：进而把右部分隔区间 arr[m+1..r] 递归排序安妥',
      '无缝织网缝合：双指针有序合并左段与右段到最终原地更新，完成整体上升'
    ],
    genSteps: (inputs: Record<string, any>) => {
      const s: RecursionStep[] = [];
      let orig = [38, 27, 43, 3, 9, 82, 10];
      if (inputs?.recArrStr) {
        const custom = inputs.recArrStr.split(/[,，\s]+/).map((x: string) => parseInt(x.trim())).filter((x: number) => !isNaN(x) && x >= 1 && x <= 99);
        if (custom.length >= 3) {
          orig = custom.slice(0, 10);
        }
      }
      const arr = [...orig];
      const stack: StackFrame[] = [];

      function mSort(l: number, r: number) {
        const frame: StackFrame = { name: 'mergeSort', argsString: `L=${l}, R=${r}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `呼唤 mergeSort 归并：剖解子域排位 [${l}..${r}] (覆盖数值段): [${arr.slice(l, r + 1).join(', ')}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i)
        });

        if (l >= r) {
          s.push({
            line: 1,
            msg: `基准：遇到单盘粒子单元 (${arr[l]})，因无可再分，视作已基本有序。即刻折返。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr],
            selectedIndices: [l]
          });
          stack.pop();
          return;
        }

        const m = Math.floor(l + (r - l) / 2);
        s.push({
          line: 2,
          msg: `二分剖解阵：分裂中分点 m = ${m}。准备递进入侵左侧自闭区间：[${l}..${m}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: m - l + 1 }, (_, i) => l + i)
        });

        mSort(l, m);

        s.push({
          line: 4,
          msg: `现在调头解决上一父节点的右侧阵地分裂区间：[${m + 1}..${r}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: r - m }, (_, i) => m + 1 + i)
        });

        mSort(m + 1, r);

        // Core Merge Simulation
        s.push({
          line: 5,
          msg: `核心汇拢：双路子树均已就绪。正在将左段 [${arr.slice(l, m + 1).join(', ')}] 与右段 [${arr.slice(m + 1, r + 1).join(', ')}] 进行有序缝合操作。`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i)
        });

        const subSorted = arr.slice(l, r + 1).sort((a, b) => a - b);
        for (let idx = 0; idx < subSorted.length; idx++) {
          arr[l + idx] = subSorted[idx];
        }

        s.push({
          line: 5,
          msg: `合并完成！织网成果：该子域已原地有序：[${arr.slice(l, r + 1).join(', ')}]。折返回层！`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i)
        });

        stack.pop();
      }

      mSort(0, arr.length - 1);
      s.push({
        line: 0,
        msg: `最终归宿：全域整体归集完毕，结果：[${arr.join(', ')}]`,
        stack: [],
        array1D: [...arr]
      });
      return s;
    }
  },
  {
    id: 'r_quick',
    name: '快速排序 (Quick Sort)',
    en: 'Recursive Quick Sort',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)',
    desc: '单点突破、分而治之的极简战神。每次豪取一值当作标杆 Pivot 进行前后双向逼近分区，把全域割裂为“小于标杆”和“大于标杆”的两派，再向下深刨。',
    code: `void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}`,
    explains: [
      '快速排序驱动核枢纽，代入低端 high 范围以及高端 low 等索引参数',
      '基准测试，当 low 遇见或越过 high，代表其区间已成为空壳或者是单粒子，默认回归',
      '标定划分（Partition）：以此期间最后单元为标杆，通过元素置换归置出分治分水岭 pi',
      '分裂递归：把划分线左盘（全部严格小于标杆的各散件）再行深层快速排序',
      '分裂递归：把划分线右盘（全部严格大于标杆的各散件）也送去深层快速排序',
      '外圈闭合归合'
    ],
    genSteps: (inputs: Record<string, any>) => {
      const s: RecursionStep[] = [];
      let orig = [24, 9, 35, 12, 18, 5];
      if (inputs?.recArrStr) {
        const custom = inputs.recArrStr.split(/[,，\s]+/).map((x: string) => parseInt(x.trim())).filter((x: number) => !isNaN(x) && x >= 1 && x <= 99);
        if (custom.length >= 3) {
          orig = custom.slice(0, 10);
        }
      }
      const arr = [...orig];
      const stack: StackFrame[] = [];

      function qSort(low: number, high: number) {
        const frame: StackFrame = { name: 'quickSort', argsString: `low=${low}, high=${high}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入 quickSort。当前拟割分区间：[${low}..${high}] ，核心内容: [${arr.slice(low, high + 1).join(', ')}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: high - low + 1 }, (_, i) => low + i)
        });

        if (low >= high) {
          s.push({
            line: 1,
            msg: `基准退出：单粒子或非法断续区间，直接回折上一层。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...arr],
            selectedIndices: [low]
          });
          stack.pop();
          return;
        }

        // Simulating Partition step
        const pivot = arr[high];
        s.push({
          line: 2,
          msg: `开始划分操作：取最右侧数字 ${pivot} 作为本轮分区标杆 (Pivot)。`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: [high]
        });

        // Simply sort the subpart in place to simulate perfect partition outcome
        const pivotIdx = Math.floor(low + (high - low) / 2); // Simulating pivot placement near middle
        const subSec = arr.slice(low, high + 1).sort((a, b) => a - b);
        for (let idx = 0; idx < subSec.length; idx++) {
          arr[low + idx] = subSec[idx];
        }
        const realPivotIdx = arr.indexOf(pivot, low);

        s.push({
          line: 2,
          msg: `割分定鼎：标杆 ${pivot} 挪移至位置 ${realPivotIdx}。此刻左侧均 < ${pivot}，右侧均 > ${pivot}。`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: [realPivotIdx]
        });

        s.push({
          line: 3,
          msg: `深度突进：递归规整标杆左域 [${low}..${realPivotIdx - 1}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: realPivotIdx - low }, (_, i) => low + i)
        });

        qSort(low, realPivotIdx - 1);

        s.push({
          line: 4,
          msg: `深度突进：递归规整标杆右侧大本营领域 [${realPivotIdx + 1}..${high}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...arr],
          selectedIndices: Array.from({ length: high - realPivotIdx }, (_, i) => realPivotIdx + 1 + i)
        });

        qSort(realPivotIdx + 1, high);

        stack.pop();
      }

      qSort(0, arr.length - 1);
      s.push({
        line: 0,
        msg: `最终快排演练完毕！结果达到全域一致有序：[${arr.join(', ')}]`,
        stack: [],
        array1D: [...arr]
      });
      return s;
    }
  },
  {
    id: 'r_permute',
    name: '字符串全排列 (Permutations)',
    en: 'Backtracking Permutations',
    best: 'O(n*n!)', avg: 'O(n*n!)', worst: 'O(n*n!)', space: 'O(n)',
    desc: '经典的树状纵深回溯查找（全状态空间穷尽）。双指针在循环中自左往右依次交换、下探递归、再交换复位，寻遍所有字符的可能位置。',
    code: `void permute(char* a, int l, int r) {\n    if (l == r) printf("%s\\n", a);\n    else {\n        for (int i = l; i <= r; i++) {\n            swap((a + l), (a + i));\n            permute(a, l + 1, r);\n            swap((a + l), (a + i)); // 回溯复原\n        }\n    }\n}`,
    explains: [
      '主入口，代入文本，起点索引 l 与极高终点索引 r',
      '基准核查：当起点 l 等于终点 r 时，代表所有轮盘全部卡住，拼出了一个完备答案',
      '成功落地：打印或存储当前拼出的唯一排列解',
      '自起点 l 展开循环考察直至终点，尝试将每个字符安排在起点 l 位置',
      '交换字符（Swap）：将第 l 位字符与当前考察的第 i 位字符进行位置对调',
      '顺理递归：探寻从下一位 l+1 至终点的后续全排列空间',
      '**回溯精髓（Backtrack Swap）**：将再次原地交换复位，撤销对调操作。退回上一道门重新探路',
      '循环终止并上返'
    ],
    genSteps: (inputs) => {
      const s: RecursionStep[] = [];
      const txt = (inputs.pStr || 'ABC').substring(0, 3);
      const chars = txt.split('');
      const stack: StackFrame[] = [];
      const results: string[] = [];

      function doPermute(l: number, r: number) {
        const frame: StackFrame = { name: 'permute', argsString: `l=${l}, r=${r}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入 permute(l = ${l})。当前的搜索拼装序列: [${chars.join(', ')}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: chars.map((_: string, i: number) => i),
          selectedIndices: [l]
        });

        if (l === r) {
          const ans = chars.join('');
          results.push(ans);
          s.push({
            line: 1,
            msg: `🎉【捕获排列】l == r。成功搜刮到一个唯一完全解 [${ans}]！暂存库，回归折返。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: chars.map((_: string, i: number) => i),
            activeValue: ans
          });
          stack.pop();
          return;
        }

        for (let i = l; i <= r; i++) {
          s.push({
            line: 3,
            msg: `[循环分支] 考虑第 i = ${i} 位字符 '${chars[i]}'。准备与起点位 [${l}] '${chars[l]}' 进行对换。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: chars.map((_: string, idx: number) => idx),
            selectedIndices: [l, i]
          });

          // Swap
          const temp = chars[l];
          chars[l] = chars[i];
          chars[i] = temp;

          s.push({
            line: 4,
            msg: `【物理交换】对调成功。序列变为: [${chars.join(', ')}]。准备开启下一级子层全排列：permute(${l + 1})`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: chars.map((_: string, idx: number) => idx),
            selectedIndices: [l, i]
          });

          doPermute(l + 1, r);

          // Unswap
          const temp2 = chars[l];
          chars[l] = chars[i];
          chars[i] = temp2;

          s.push({
            line: 6,
            msg: `【回溯复原】回归时还原置换：将 [${l}] 与 [${i}] 换回，恢复排列到对调前的素面: [${chars.join(', ')}]`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: chars.map((_: string, idx: number) => idx),
            selectedIndices: [l, i]
          });
        }

        stack.pop();
      }

      doPermute(0, chars.length - 1);
      s.push({
        line: 0,
        msg: `全排列搜索任务达成！全部 3! = 6 种可能性穷尽毕露：[${results.join(', ')}]`,
        stack: []
      });
      return s;
    }
  },
  {
    id: 'r_queens',
    name: 'N-皇后回溯 (N-Queens)',
    en: 'N-Queens Backtracking',
    best: 'O(n!)', avg: 'O(n!)', worst: 'O(n!)', space: 'O(n)',
    desc: '经典的格子回溯。在棋盘第 col 列上从 row=0 开始试放皇后，利用安全函数检测八方冲突，一旦违规立刻悔棋折返，另觅路子。',
    code: `bool solveNQUtil(int board[N][N], int col) {\n    if (col >= N) return true;\n    for (int i = 0; i < N; i++) {\n        if (isSafe(board, i, col)) {\n            board[i][col] = 1;\n            if (solveNQUtil(board, col + 1))\n                return true;\n            board[i][col] = 0; // 回溯\n        }\n    }\n    return false;\n}`,
    explains: [
      '皇后回溯安置主历程，传入棋盘矩阵和第 col 列指示针',
      '基准成功终止：如果 col >= N 表示全棋盘所有列各被落子安好，直接回复成功(true)',
      '在当前这一列上，逐一试探每一行位置（i 从 0 到 N-1）',
      '调用安全检查函数 `isSafe` 检验是否处于其他皇后的同行、同对角线刺杀范围',
      '大门开启：安全！立即在当前(i, col)行猎取设防皇后(标记 1)',
      '递归前进：顺理往它的右侧紧邻下一列安排 `solveNQUtil(col + 1)` 的递归布位',
      '成功解封：如果递归判定全部顺利，顺延宣告成功返回 true',
      '**回溯擦屁股**：不妙，后续列冲突彻底无解。必须及时收回防线并抹消当前设防（状态归 0），尝试考察下一行',
      '整列探索均在冲突重创下溃败，宣告此段布局彻底崩塌，向原上司请求返回 false'
    ],
    genSteps: (inputs: Record<string, any>) => {
      const s: RecursionStep[] = [];
      const N = inputs?.queensN || 4;
      const stack: StackFrame[] = [];
      
      const board: boolean[][] = Array.from({ length: N }, () => new Array(N).fill(false));

      function isSafe(r: number, c: number): boolean {
        // Horizontal left check
        for (let j = 0; j < c; j++) {
          if (board[r][j]) return false;
        }
        // Top-left diagonal
        for (let i = r, j = c; i >= 0 && j >= 0; i--, j--) {
          if (board[i][j]) return false;
        }
        // Bottom-left diagonal
        for (let i = r, j = c; i < N && j >= 0; i++, j--) {
          if (board[i][j]) return false;
        }
        return true;
      }

      function solve(col: number): boolean {
        const frame: StackFrame = { name: 'solveNQUtil', argsString: `col=${col}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入 NQUtil。探寻在第 [${col}] 列安置皇后的契机。`,
          stack: [...stack.map(x => ({ ...x }))],
          queensBoard: board.map(row => [...row])
        });

        if (col >= N) {
          s.push({
            line: 1,
            msg: `👑皇恩浩荡！col >= ${N}，检测到棋盘完备，4个皇后已完全存活于棋盘上！`,
            stack: [...stack.map(x => ({ ...x }))],
            queensBoard: board.map(row => [...row])
          });
          stack.pop();
          return true;
        }

        for (let i = 0; i < N; i++) {
          s.push({
            line: 3,
            msg: `[棋位测试] 尝试放置皇后在 坐标 (${i}, ${col}) 进行测试安全度。`,
            stack: [...stack.map(x => ({ ...x }))],
            queensBoard: board.map(row => [...row]),
            queensConflict: [i, col]
          });

          if (isSafe(i, col)) {
            board[i][col] = true;
            s.push({
              line: 4,
              msg: `安全核对通过！临时摆放皇后 (${i}, ${col})。准备挺进下一列: col = ${col + 1}`,
              stack: [...stack.map(x => ({ ...x }))],
              queensBoard: board.map(row => [...row])
            });

            const res = solve(col + 1);
            if (res) {
              frame.status = 'returning';
              frame.retVal = 'true';
              stack.pop();
              return true;
            }

            // Mismatch backtracking
            board[i][col] = false;
            s.push({
              line: 7,
              msg: `【断臂回溯】发现把皇后塞在 (${i}, ${col}) 的策略会导致右侧全部列无法不冲突。撤回该点摆设！`,
              stack: [...stack.map(x => ({ ...x }))],
              queensBoard: board.map(row => [...row])
            });
          } else {
            s.push({
              line: 3,
              msg: `【冲突违规】坐标 (${i}, ${col}) 存在横向、斜向等刺杀冲突。无情略过该位置。`,
              stack: [...stack.map(x => ({ ...x }))],
              queensBoard: board.map(row => [...row])
            });
          }
        }

        s.push({
          line: 9,
          msg: `第 [${col}] 列的所有坑位全部测试，宣告在此全军覆没！必须退回上一列调整。`,
          stack: [...stack.map(x => ({ ...x }))],
          queensBoard: board.map(row => [...row])
        });

        stack.pop();
        return false;
      }

      solve(0);
      return s;
    }
  },
  {
    id: 'r_powerset',
    name: '生成幂集 (Power Set)',
    en: 'Subsets Generation',
    best: 'O(2^n)', avg: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)',
    desc: '自上而下做出命运选择决择。每一个元素都有“入选”或“不入选”两种因果关系。层层递进直到触底边界，即捞出全部子集。',
    code: `void generateSubsets(int set[], int subset[], int size, int index) {\n    if (index == size) {\n        printSubset(subset);\n        return;\n    }\n    // 分支 1：舍弃当前元素\n    generateSubsets(set, subset, size, index + 1);\n    // 分支 2：收录当前元素\n    add(subset, set[index]);\n    generateSubsets(set, subset, size, index + 1);\n    removeLast(subset); // 回溯归还\n}`,
    explains: [
      '主入口，传入元数据集 set，当前暂存子集，主大小及决定项指针 index',
      '基准状态：如 index 走满到达顶峰 size，做出所有二分抉择',
      '将目前所组装成型的完备集合吐出至结果输出',
      '分岔策略 1：坚决不收割当前第 index 位的元素，带着该白纸原貌推往下一级探测',
      '分岔策略 2：决定接纳！正式收集第 index 位的原初数字并存入待结集里',
      '带着刚刚新鲜吸收的物资，向下一级深度递归探索它的子空间决策',
      '**回溯还原（Backtrack Pop）**：探其完成，抹除掉最后一位物品。归还当初的洁净原貌以待接盘'
    ],
    genSteps: () => {
      const s: RecursionStep[] = [];
      const set = [1, 2, 3];
      const stack: StackFrame[] = [];
      const tempSet: number[] = [];
      const gathered: string[] = [];

      function subsets(index: number) {
        const frame: StackFrame = { name: 'genSubsets', argsString: `idx=${index}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入 generateSubsets，考察是否将集合中第 ${index} 号元素 ${set[index] || '无'} 加入。暂存子串: [${tempSet.join(', ')}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...tempSet],
          selectedIndices: [index]
        });

        if (index === set.length) {
          const rep = `[${tempSet.join(',')}]`;
          gathered.push(rep);
          s.push({
            line: 1,
            msg: `🎉【达成子集】index 到头！锁入最终生成的精良子集: ${rep}。立即折返。`,
            stack: [...stack.map(x => ({ ...x }))],
            array1D: [...tempSet]
          });
          stack.pop();
          return;
        }

        s.push({
          line: 3,
          msg: `抉择 1：决定【不带入】数字 ${set[index]}。纯净推进到第 ${index + 1} 级判定。`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...tempSet],
          selectedIndices: [index]
        });

        subsets(index + 1);

        tempSet.push(set[index]);
        s.push({
          line: 4,
          msg: `抉择 2：决定【带入】数字 ${set[index]}。待结子集暂装: [${tempSet.join(', ')}]，准备向下递归。`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...tempSet],
          selectedIndices: [index]
        });

        subsets(index + 1);

        // backtrack
        tempSet.pop();
        s.push({
          line: 6,
          msg: `【回溯退盘】剥除最后入阵的数字 ${set[index]}。还原为上层的整洁面孔: [${tempSet.join(', ')}]`,
          stack: [...stack.map(x => ({ ...x }))],
          array1D: [...tempSet]
        });

        stack.pop();
      }

      subsets(0);
      s.push({
        line: 0,
        msg: `成功捞出全域 2^3 = 8 种子集：${gathered.join(', ')}`,
        stack: []
      });
      return s;
    }
  },
  {
    id: 'r_floodfill',
    name: '泛洪填充 (Flood Fill)',
    en: 'Flood Fill Recursive DFS',
    best: 'O(mn)', avg: 'O(mn)', worst: 'O(mn)', space: 'O(mn)',
    desc: '绘图填充（DFS）精髓。将当前像格子(r,c)刷写染色，向上下左右四面派遣出分身递归扩散，遇到越界或是阻断色，立刻退回。',
    code: `void floodFill(int x, int y, int oldC, int newC) {\n    if (x < 0 || x >= R || y < 0 || y >= C) return;\n    if (screen[x][y] != oldC) return;\n    screen[x][y] = newC;\n    floodFill(x + 1, y, oldC, newC);\n    floodFill(x - 1, y, oldC, newC);\n    floodFill(x, y + 1, oldC, newC);\n    floodFill(x, y - 1, oldC, newC);\n}`,
    explains: [
      '主填色渲染控制中心，传入像坐标 (x, y)，原本底色 oldC，及目标要涂的新色 newC',
      '越界极不安全核查：一旦坐标超出画板画布范围，瞬间拦截回归',
      '失合碰撞防护：如果当前坐标的内容根本不是需要被替换的旧色 `oldC`（例如是阻断墙或者是已涂好色格），退回',
      '【本体上妆】：将当前坐标原地的旧底色直接改写、染色赋能成为最新目标新色 `newC`',
      '分支方向 1：向其右翼进发递次泛洪：floodFill(x + 1, y)',
      '分支方向 2：向其左翼进发递次泛洪：floodFill(x - 1, y)',
      '分支方向 3：向其身背下方进发递次泛洪：floodFill(x, y + 1)',
      '分支方向 4：向其身背上方进发递次泛洪：floodFill(x, y - 1)'
    ],
    genSteps: () => {
      const s: RecursionStep[] = [];
      const R_SIZE = 4;
      const C_SIZE = 4;
      const stack: StackFrame[] = [];

      // Grid: '.' is uncolored, '#' is obstacle, 'F' is colored
      const grid: string[][] = [
        ['.', '.', '.', '.'],
        ['.', '#', '#', '.'],
        ['.', '#', '.', '.'],
        ['.', '.', '.', '.']
      ];

      function fill(x: number, y: number) {
        const frame: StackFrame = { name: 'floodFill', argsString: `x=${x},y=${y}`, depth: stack.length, status: 'calling' };
        stack.push(frame);

        s.push({
          line: 0,
          msg: `进入 floodFill 到坐标 (${x}, ${y})`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });

        // Boundary checks
        if (x < 0 || x >= R_SIZE || y < 0 || y >= C_SIZE) {
          s.push({
            line: 1,
            msg: `【物理撞墙】坐标 (${x}, ${y}) 超出了网格画布边界！强行阻止折返。`,
            stack: [...stack.map(x => ({ ...x }))],
            floodGrid: grid.map(r => [...r])
          });
          stack.pop();
          return;
        }

        s.push({
          line: 2,
          msg: `分析：坐标 (${x}, ${y}) 上的格块内容。当前是 '${grid[x][y]}'`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });

        if (grid[x][y] !== '.') {
          s.push({
            line: 2,
            msg: `不满足染色基准：要么是障碍物墙体 '#', 要么是已染过的格子 'F'。退还上一级。`,
            stack: [...stack.map(x => ({ ...x }))],
            floodGrid: grid.map(r => [...r])
          });
          stack.pop();
          return;
        }

        // Apply fill color 'F'
        grid[x][y] = 'F';
        s.push({
          line: 3,
          msg: `🎨【染色动作】将 (${x}, ${y}) 的空白底色更改刷写成染色涂料 【F】! 扩散开始。`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });

        s.push({
          line: 4,
          msg: `向【右翼】方向递归推进: (${x + 1}, ${y})`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });
        fill(x + 1, y);

        s.push({
          line: 5,
          msg: `向【左翼】方向递归推进: (${x - 1}, ${y})`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });
        fill(x - 1, y);

        s.push({
          line: 6,
          msg: `向【下方】深处递归推进: (${x}, ${y + 1})`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });
        fill(x, y + 1);

        s.push({
          line: 7,
          msg: `向【上方】高位递归推进: (${x}, ${y - 1})`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });
        fill(x, y - 1);

        s.push({
          line: 7,
          msg: `该单元 (${x}, ${y}) 处的爆发全向泛洪已经完全就绪。安全退出折返。`,
          stack: [...stack.map(x => ({ ...x }))],
          floodGrid: grid.map(r => [...r])
        });

        stack.pop();
      }

      fill(0, 0);
      s.push({
        line: 0,
        msg: `区域泛洪漫染已经完美达成预期！多分支递归退场。`,
        stack: [],
        floodGrid: grid.map(r => [...r])
      });
      return s;
    }
  }
];

export default function RecursionAlgorithms() {
  const [activeAlgoId, setActiveAlgoId] = useState<string>('r_fact');
  
  // Custom states matching inputs panel variables
  const [nVal, setNVal] = useState(4);
  const [fibN, setFibN] = useState(4);
  const [hanoiDisks, setHanoiDisks] = useState(3);
  const [searchTarget, setSearchTarget] = useState(26);
  const [pStr, setPStr] = useState('ABC');
  const [recArrStr, setRecArrStr] = useState('38, 27, 43, 3, 9, 82, 10');
  const [queensN, setQueensN] = useState(4);
  const [lang, setLang] = useState<'c' | 'python' | 'javascript'>('c');

  const [curStepIdx, setCurStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sliderVal, setSliderVal] = useState(500);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentAlgo = RECURSION_DEFS.find(a => a.id === activeAlgoId)!;
  const speedMs = 950 - sliderVal;

  const currentKey = `${activeAlgoId}-${nVal}-${fibN}-${hanoiDisks}-${searchTarget}-${pStr}-${recArrStr}-${queensN}`;
  const [prevKey, setPrevKey] = useState('');

  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setCurStepIdx(0);
    setPlaying(false);
  }

  const steps = currentAlgo.genSteps({
    nVal,
    fibN,
    hanoiDisks,
    searchTarget,
    pStr,
    recArrStr,
    queensN
  });

  const activeStep = steps[curStepIdx] || { line: -1, msg: '就绪中', stack: [] };

  useEffect(() => {
    if (!playing) return;
    if (curStepIdx >= steps.length - 1) {
      const timer = setTimeout(() => {
        setPlaying(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setCurStepIdx(prev => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearTimeout(timer);
  }, [playing, curStepIdx, steps.length, speedMs]);

  useEffect(() => {
    if (activeStep.line >= 0 && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-rec-line="${activeStep.line}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeStep.line]);

  const handleReset = () => {
    setCurStepIdx(0);
    setPlaying(false);
  };

  const handlePrev = () => {
    setPlaying(false);
    setCurStepIdx(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setPlaying(false);
    setCurStepIdx(prev => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <div id="recursion-algorithms-panel" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] mb-8 overflow-hidden hover:border-[rgba(164,74,255,0.2)] transition-colors text-zinc-100 font-sans shadow-lg">
      
      {/* Title Header */}
      <div className="p-5 pb-3.5 flex items-center gap-3.5 flex-wrap border-b border-[var(--border)] bg-zinc-950/20">
        <span className="font-extrabold text-[32px] text-[rgba(164,74,255,0.15)] leading-none font-sans">04</span>
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-extrabold text-[20px] text-zinc-150">递归算法微步剖析 (Recursive Stack)</h3>
          <div className="font-mono text-[12.5px] text-[var(--text-muted)] mt-1">
            Visual Memory Frame / System Call-Stack Track / Backtracking Canvas
          </div>
        </div>
        
        {/* Toggle recursive algorithms selection dropdown/list */}
        <select 
          value={activeAlgoId}
          onChange={(e) => {
            setActiveAlgoId(e.target.value);
            setPlaying(false);
          }}
          className="px-4 py-2 border border-zinc-805 rounded-[var(--rs)] bg-black/65 text-[13.5px] font-medium text-[var(--light-cyan)] text-zinc-300 focus:outline-none focus:border-[var(--accent)]"
        >
          {RECURSION_DEFS.map(def => (
            <option key={def.id} value={def.id} className="bg-zinc-900 text-zinc-300 font-sans">
              {def.name}
            </option>
          ))}
        </select>
      </div>

      {/* Speed, Time and Stats HUD */}
      <div className="p-5 bg-zinc-900/10 border-b border-[var(--border)] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex-1">
          <p className="text-[13.8px] text-zinc-300 font-light leading-relaxed">
            <b>{currentAlgo.name} ({currentAlgo.en})</b>：{currentAlgo.desc}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-2 font-mono text-[11px] text-[rgba(164,74,255,0.85)] font-bold">
            <span>空间开销: {currentAlgo.space}</span>
            <span className="text-zinc-600">|</span>
            <span>最坏时间: {currentAlgo.worst}</span>
            <span className="text-zinc-600">|</span>
            <span>平均时间: {currentAlgo.avg}</span>
          </div>
        </div>

        {/* Customized Inputs according to algorithms options */}
        <div className="flex gap-3 shrink-0 flex-wrap p-3.5 bg-black/30 rounded border border-zinc-800/60 font-sans">
          
          {activeAlgoId === 'r_fact' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">级数 N 值:</span>
              <input type="number" min="1" max="6" value={nVal} onChange={e => setNVal(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))} className="px-2.5 py-1 w-[70px] border border-zinc-800 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded" />
            </div>
          )}

          {activeAlgoId === 'r_fib' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">阶项 N 值(最大4):</span>
              <input type="number" min="0" max="4" value={fibN} onChange={e => setFibN(Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))} className="px-2.5 py-1 w-[70px] border border-zinc-800 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded" />
            </div>
          )}

          {activeAlgoId === 'r_hanoi' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">盘子数量:</span>
              <input type="number" min="1" max="4" value={hanoiDisks} onChange={e => setHanoiDisks(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))} className="px-2.5 py-1 w-[80px] border border-zinc-800 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded" />
            </div>
          )}

          {activeAlgoId === 'r_binary' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">查找目标数字:</span>
              <select value={searchTarget} onChange={e => setSearchTarget(parseInt(e.target.value))} className="px-2.5 py-1 border border-zinc-800 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded">
                {[5, 12, 18, 26, 31, 44, 58, 70, 85, 99].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          )}

          {activeAlgoId === 'r_permute' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">排列原子符串:</span>
              <input type="text" maxLength={3} value={pStr} onChange={e => setPStr(e.target.value.toUpperCase().replace(/[^A-Z]/g,'') || 'ABC')} className="px-2.5 py-1 w-[80px] border border-zinc-800 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded" />
            </div>
          )}

          {(activeAlgoId === 'r_merge' || activeAlgoId === 'r_quick') && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">自定义数组:</span>
              <input
                type="text"
                placeholder="如: 38,27,43,3,9"
                value={recArrStr}
                onChange={e => setRecArrStr(e.target.value)}
                className="px-2.5 py-1 w-[160px] border border-zinc-800 bg-black text-[12px] font-mono text-[var(--accent)] text-center focus:outline-none rounded"
                title="输入用逗号分隔的数组，如: 10,22,5,82"
              />
            </div>
          )}

          {activeAlgoId === 'r_queens' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">皇后数量 N (4-6):</span>
              <select 
                value={queensN} 
                onChange={e => setQueensN(parseInt(e.target.value))} 
                className="px-2.5 py-1 border border-zinc-855 bg-black text-[13px] font-mono text-[var(--accent)] text-center focus:outline-none rounded"
              >
                {[4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} 皇后</option>
                ))}
              </select>
            </div>
          )}

          <div className="text-[10.5px] leading-relaxed text-zinc-400 self-center pl-2 border-l border-zinc-800 max-w-[150px]">
            调好输入参数后，点击下方【▶】可进行连续跟踪。
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT COMPONENT: STACK & VISUALIZATION */}
        <div className="p-5 flex flex-col justify-between gap-5 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-zinc-950/20">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            
            {/* COLUMN 1.1: CONTEXTUAL PLAYGROUND CANVAS */}
            <div className="p-4 bg-black/35 rounded border border-zinc-900 flex flex-col justify-between min-h-[220px]">
              <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-2.5 border-b border-zinc-900 pb-1 flex justify-between">
                <span>现场状态演化 (Stage)</span>
                <span className="text-zinc-400 font-bold">{currentAlgo.name}</span>
              </div>

              {/* FACTORIAL PLAYGROUND */}
              {activeAlgoId === 'r_fact' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-[32px] font-mono font-extrabold tracking-tight text-purple-400">
                    {activeStep.activeValue !== undefined ? `${activeStep.activeValue}!` : '?'}
                  </div>
                  <div className="text-[12.5px] mt-2 text-zinc-400">
                    当前阶乘计算算子 = {activeStep.activeValue}
                  </div>
                </div>
              )}

              {/* FIBONACCI PLAYGROUND */}
              {activeAlgoId === 'r_fib' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-[12px] text-zinc-500 font-mono mb-2">递归分裂计算树：</div>
                  <div className="text-[38px] font-mono font-black text-amber-500 tracking-wider">
                    fib({activeStep.activeValue || 0})
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 text-center leading-normal">
                    由于没有缓存机制（DP），重复计算相同分支多于 <b>{(activeStep.activeValue as number) > 2 ? 2 : 0} 次</b>。
                  </div>
                </div>
              )}

              {/* HANOI PLAYGROUND */}
              {activeAlgoId === 'r_hanoi' && activeStep.hanoiPegs && (
                <div className="flex-1 flex flex-col justify-end gap-1.5 py-4 min-h-[160px]">
                  <div className="grid grid-cols-3 gap-3 items-end h-[100px] relative px-2">
                    
                    {/* Render Pegs */}
                    {activeStep.hanoiPegs.map((pegData, pegIdx) => {
                      const label = pegIdx === 0 ? 'A (源)' : pegIdx === 1 ? 'B (辅)' : 'C (目)';
                      return (
                        <div key={pegIdx} className="relative flex flex-col items-center justify-end h-full">
                          
                          {/* Rod vertical line */}
                          <div className="absolute top-0 bottom-0 w-[5px] bg-zinc-800 rounded-t-full -z-10" />

                          {/* Peg Disks stack */}
                          <div className="flex flex-col-reverse gap-1.5.0.5 w-full items-center relative bottom-0 z-10 select-none pb-0.5">
                            {pegData.map((dSize) => {
                              const pctWidth = 40 + dSize * 15; // 55% to 100%
                              return (
                                <div 
                                  key={dSize} 
                                  className="h-3 rounded-full border border-purple-500/35 bg-purple-500 text-[8px] font-black text-white/95 flex items-center justify-center transition-all shadow-[0_1px_5px_rgba(164,74,255,0.2)]"
                                  style={{ width: `${pctWidth}%` }}
                                >
                                  {dSize}
                                </div>
                              );
                            })}
                          </div>

                          <div className="font-mono text-[9.5px] text-zinc-500 mt-2">{label}</div>
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}

              {/* BINARY SEARCH PLAYGROUND */}
              {activeAlgoId === 'r_binary' && activeStep.array1D && (
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {activeStep.array1D.map((n, idx) => {
                      const isHighlighed = activeStep.selectedIndices?.includes(idx);
                      const isLastSelected = activeStep.selectedIndices && activeStep.selectedIndices[activeStep.selectedIndices.length - 1] === idx;
                      
                      const bgCls = isLastSelected ? 'bg-cyan-500 border-cyan-400 text-black font-extrabold scale-105' : (isHighlighed ? 'bg-zinc-850 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900/30 text-zinc-600 border-zinc-850');
                      
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="font-mono text-[8px] text-zinc-600">{idx}</span>
                          <div className={`w-8 h-8 rounded border text-[11px] font-mono flex items-center justify-center transition-all ${bgCls}`}>
                            {n}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center font-mono text-[11px] text-zinc-400">
                    寻找 = {searchTarget} {activeStep.selectedIndices && activeStep.selectedIndices.length > 2 ? `| 检索位置 = ${activeStep.selectedIndices[2]}` : ''}
                  </div>
                </div>
              )}

              {/* MERGE OR QUICK SORT PLAYGROUND */}
              {(activeAlgoId === 'r_merge' || activeAlgoId === 'r_quick') && activeStep.array1D && (
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {activeStep.array1D.map((n, idx) => {
                      const isActiveRange = activeStep.selectedIndices?.includes(idx);
                      let borderCls = 'border-zinc-850';
                      let textCls = 'text-zinc-400';
                      let bgCls = 'bg-zinc-900/10';

                      if (isActiveRange) {
                        borderCls = 'border-purple-500/60 shadow-[0_0_8px_rgba(164,74,255,0.15)]';
                        textCls = 'text-purple-300 font-extrabold';
                        bgCls = 'bg-purple-950/15';
                      }

                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-9 h-9 border rounded-md flex items-center justify-center text-[12px] font-mono ${borderCls} ${textCls} ${bgCls}`}>
                            {n}
                          </div>
                          <span className="text-[8.5px] font-mono text-zinc-600 mt-1">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-[11px] text-zinc-400">
                    {activeAlgoId === 'r_merge' ? '在不同归并栈段自下向上合并' : '以分区标点（Pivot）为极值分裂'}
                  </div>
                </div>
              )}

              {/* PERMUTATIONS PLAYGROUND */}
              {activeAlgoId === 'r_permute' && activeStep.array1D && (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="text-[26px] font-mono font-extrabold text-cyan-400 tracking-wider">
                    {pStr}
                  </div>
                  {activeStep.activeValue && (
                    <div className="mt-2.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-mono rounded">
                      组合成形: {activeStep.activeValue}
                    </div>
                  )}
                </div>
              )}

              {/* N-QUEENS PLAYGROUND */}
              {activeAlgoId === 'r_queens' && activeStep.queensBoard && (
                <div className="flex-1 flex flex-col justify-center items-center py-2">
                  <div 
                    className="grid gap-1 border border-zinc-800 p-1 bg-black/40 rounded shadow-md"
                    style={{ gridTemplateColumns: `repeat(${activeStep.queensBoard.length}, minmax(0, 1fr))` }}
                  >
                    {activeStep.queensBoard.map((rowArr, rIdx) => 
                      rowArr.map((hasQueen, cIdx) => {
                        const isConflictPos = activeStep.queensConflict && activeStep.queensConflict[0] === rIdx && activeStep.queensConflict[1] === cIdx;
                        const isColoredSq = (rIdx + cIdx) % 2 === 0;

                        let bgCls = isColoredSq ? 'bg-zinc-900' : 'bg-zinc-900/40';
                        let borderCls = 'border-zinc-800/20';

                        if (isConflictPos) {
                          bgCls = 'bg-amber-950/50';
                          borderCls = 'border-amber-500/50';
                        } else if (hasQueen) {
                          bgCls = 'bg-purple-950/20';
                          borderCls = 'border-purple-400/50';
                        }

                        return (
                          <div 
                            key={`${rIdx}-${cIdx}`} 
                            className={`w-10 h-10 border rounded flex items-center justify-center font-mono font-black text-[18px] relative transition-transform ${bgCls} ${borderCls}`}
                          >
                            {hasQueen && (
                              <span className="text-purple-400 scale-110 drop-shadow-md select-none">♛</span>
                            )}
                            {isConflictPos && !hasQueen && (
                              <span className="text-amber-500/60 text-[11px] animate-pulse">?</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* POWER SET PLAYGROUND */}
              {activeAlgoId === 'r_powerset' && activeStep.array1D && (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="font-mono text-[11px] text-zinc-500 mb-2">当前子集子空间装箱:</div>
                  <div className="text-[24px] font-mono font-extrabold text-indigo-400 tracking-wide">
                    {`{ ${activeStep.array1D.join(', ')} }`}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-2 text-center">
                    当前考察索引 index = {activeStep.selectedIndices?.[0] ?? 0}
                  </div>
                </div>
              )}

              {/* FLOOD FILL PLAYGROUND */}
              {activeAlgoId === 'r_floodfill' && activeStep.floodGrid && (
                <div className="flex-1 flex flex-col justify-center items-center py-1.5">
                  <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 border border-zinc-850 rounded">
                    {activeStep.floodGrid.map((rowArr, rIdx) => 
                      rowArr.map((cellChar, cIdx) => {
                        let cellBg = 'bg-zinc-900/20 text-zinc-700';
                        let borderCls = 'border-zinc-900';

                        if (cellChar === 'F') {
                          cellBg = 'bg-purple-500 text-white font-extrabold shadow-[0_0_5px_rgba(164,74,255,0.3)] animate-fadeIn';
                          borderCls = 'border-purple-400/20';
                        } else if (cellChar === '#') {
                          cellBg = 'bg-zinc-800 text-zinc-400 font-extrabold';
                        }

                        return (
                          <div key={`${rIdx}-${cIdx}`} className={`w-8 h-8 rounded border text-[11px] font-mono flex items-center justify-center transition-all ${cellBg} ${borderCls}`}>
                            {cellChar === 'F' ? '🎨' : (cellChar === '#' ? '🧱' : '')}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN 1.2: VISUAL CALL STACK */}
            <div className="p-4 bg-zinc-950 rounded border border-zinc-900 flex flex-col h-[220px] overflow-hidden">
              <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-900 pb-1 flex justify-between items-center shrink-0">
                <span>运行内存调用栈 (Call Stack)</span>
                <span className="text-[9.5px] px-1.5 py-0.2 bg-purple-500/10 text-purple-400 border border-purple-500/10 rounded-full font-sans">
                  栈深: {activeStep.stack.length}
                </span>
              </div>

              {/* Vertical Stack Frame lists */}
              <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {activeStep.stack.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-650 font-mono text-[11px] text-center italic py-10 selection:bg-transparent">
                    <span className="text-[18px] not-italic mb-1">📭</span>
                    Stack Frame Empty.<br/>
                    主程序就绪或已执行完毕
                  </div>
                ) : (
                  activeStep.stack.map((frame, idx) => {
                    const isTop = idx === activeStep.stack.length - 1;
                    
                    let frameBorder = 'border-zinc-850 text-zinc-400';
                    let frameBg = 'bg-zinc-900/20';
                    
                    if (isTop) {
                      if (frame.status === 'returning') {
                        frameBorder = 'border-emerald-500/45 text-emerald-400';
                        frameBg = 'bg-emerald-950/10';
                      } else {
                        frameBorder = 'border-purple-500/40 text-purple-300';
                        frameBg = 'bg-purple-950/10';
                      }
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`p-2 border rounded text-[11px] font-mono transition-all flex items-center justify-between shadow-sm ${frameBorder} ${frameBg}`}
                        style={{ marginLeft: `${frame.depth * 3}px` }}
                      >
                        <div className="truncate pr-2">
                          <span className="text-zinc-600 font-bold">#{frame.depth} </span>
                          <span className="text-zinc-150 font-semibold">{frame.name}</span>
                          <span className="text-zinc-500">({frame.argsString})</span>
                        </div>
                        <div className="shrink-0 text-[10px] font-sans font-bold uppercase tracking-wider scale-90">
                          {frame.status === 'returning' ? (
                            <span className="text-emerald-400 text-[10px]">
                              ↩ {frame.retVal ?? '?'}
                            </span>
                          ) : (
                            <span className="text-purple-400 animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* PLAYBACK CONTROL ACTIONS METAS */}
          <div className="flex items-center gap-2 flex-wrap border-t border-zinc-900/40 pt-3">
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handleReset} title="重置">
              ↺
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-805 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handlePrev} title="前进一步">
              ◀
            </button>
            <button className={`w-10 h-8 flex items-center justify-center border rounded bg-[#101026] text-[15px] transition-all ${playing ? 'text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(164,74,255,0.2)]' : 'text-zinc-300 border-zinc-800 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`} onClick={() => setPlaying(!playing)} title="自动播放 / 暂停">
              {playing ? '⏸' : '▶'}
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-805 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handleNext} title="后退一步">
              ▶
            </button>

            <div className="flex items-center gap-1.5 ml-auto font-mono text-[10.5px] text-zinc-400">
              <span>慢</span>
              <input type="range" min="50" max="900" value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} className="w-[80px] accent-purple-500" />
              <span>快</span>
            </div>

            <div className="font-mono text-[11px] text-zinc-400 px-3 py-1 bg-black/20 rounded border border-zinc-800 shrink-0">
              栈步 {curStepIdx + 1}/{Math.max(1, steps.length)}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/25 rounded border border-zinc-800 min-h-[50px] flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-[18px] min-w-[18px] h-[18px] rounded-full bg-purple-950 text-purple-400 font-sans font-bold italic text-[11px]">i</span>
            <span className="text-[13px] text-zinc-300 transition-all duration-300">
              {activeStep.msg}
            </span>
          </div>

        </div>

        {/* RIGHT COMPONENT: HIGH-STYLIZED C CODE HIGHLIGHT */}
        <div className="flex flex-col max-h-[380px] lg:max-h-[460px] bg-zinc-950 relative border border-zinc-900 rounded" ref={containerRef}>
          <div className="p-2 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center text-[11px] px-4 font-mono select-none">
            <span className="text-zinc-500 tracking-wide">💻 CODE PREVIEW</span>
            <div className="flex items-center gap-2">
              {(['c', 'python', 'javascript'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setPlaying(false); }}
                  className={`px-1.5 py-0.5 rounded transition-all text-[9.5px] tracking-wide border uppercase ${lang === l ? 'border-purple-500 bg-purple-950/20 text-purple-400 font-bold' : 'border-transparent text-zinc-400 hover:text-white'}`}
                >
                  {l === 'javascript' ? 'JS' : l}
                </button>
              ))}
              <span className="text-zinc-800">|</span>
              <button 
                onClick={() => {
                  const translated = getTranslatedCode(currentAlgo.code, lang);
                  const blob = new Blob([translated], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  const extension = lang === 'c' ? 'c' : lang === 'python' ? 'py' : 'js';
                  link.download = `${currentAlgo.id}.${extension}`;
                  link.click();
                  URL.revokeObjectURL(url);
                }} 
                className="px-2 py-0.5 border border-zinc-900 rounded bg-black/25 hover:border-purple-500 hover:text-white text-zinc-400 text-[10px] transition-all"
                title="导出独立本端可执行源码"
              >
                📥 导出
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 bg-[var(--bg-code)] font-mono text-[11.5px] md:text-[12px] leading-[1.8] scrollbar-thin scrollbar-thumb-zinc-800">
            {getTranslatedCode(currentAlgo.code, lang).split(/\n/).map((line, idx) => {
              const isActive = activeStep.line === idx;
              return (
                <div 
                   key={idx} 
                   data-rec-line={idx} 
                   className={`code-line flex py-[1px] pr-[14px] cursor-pointer transition-all border-l-[3px] ${isActive ? 'active border-purple-500 bg-purple-950/15' : 'border-transparent hover:bg-white/5'}`}
                   onClick={() => { setPlaying(false); setCurStepIdx(steps.findIndex(s => s.line === idx) || 0); }}
                >
                  <span className="line-num w-8 text-right pr-2.5 text-zinc-650 select-none shrink-0 text-[10.5px] font-mono">
                    {isActive ? '▶' : (idx + 1)}
                  </span>
                  <span 
                    className="flex-1 whitespace-pre text-zinc-300 font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightCode(line, lang) }}
                  />
                </div>
              );
            })}
          </div>

          {/* Micro instruction block at footer of code panel */}
          <div className="p-3.5 px-4 min-h-[48px] bg-black border-t border-zinc-900 text-[12.5px] text-zinc-450 leading-[1.6] flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-zinc-800 text-zinc-300 font-sans text-[10px] mt-[2px]">{lang === 'javascript' ? 'js' : lang}</span>
            <span key={activeStep.line} className="animate-fadeIn flex-1 text-zinc-400">
              {currentAlgo.explains[activeStep.line] || (activeStep.line === -1 ? '递归探索完全执行到位!' : '使用上方控制面板播放，系统底盘调用栈内存深度将与 C 源代码行精确映射关联同步')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
