'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { highlightCode, getTranslatedCode } from '@/lib/syntax';

interface StringDSStep {
  line: number;
  explanation: string;
  i: number;            // pointer in txt
  j: number;            // pointer in pat
  status: 'init' | 'compare' | 'match' | 'mismatch' | 'found' | 'slide' | 'next_calc' | 'hash_compare' | 'hash_match' | 'hash_collision' | 'done';
  txtCmpIdxs: number[];  // indices in txt currently active
  patCmpIdxs: number[];  // indices in pat currently active
  matchedIndices: number[]; // indices in txt that have a confirmed full match
  nextArr?: number[];    // for KMP next array
  pHash?: number;        // for Rabin-Karp
  tHash?: number;        // for Rabin-Karp
  windowStart?: number;  // start of current window in txt
}

interface AlgoDefinition {
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
}

const ALGO_DEFS: AlgoDefinition[] = [
  {
    id: 'naive',
    name: '朴素匹配 (Brute-Force)',
    en: 'Naive String Matching',
    best: 'O(n)',
    avg: 'O(n * m)',
    worst: 'O(n * m)',
    space: 'O(1)',
    desc: '最直观的模式匹配方式。逐个滑动对齐，不放过主串的任意字符。',
    code: `void naiveSearch(char* txt, char* pat) {\n    int N = strlen(txt);\n    int M = strlen(pat);\n    for (int i = 0; i <= N - M; i++) {\n        int j;\n        for (j = 0; j < M; j++) {\n            if (txt[i + j] != pat[j])\n                break;\n        }\n        if (j == M) {\n            printf("Pattern found at index %d\\n", i);\n        }\n    }\n}`,
    explains: [
      '主入口函数，传入 text 主串与 pattern 模式串',
      '计算主文本串长度 N',
      '计算待检索模式串长度 M',
      '主循环开始：寻找主串中所有可能的起始对齐位 i',
      '定义模式串比较索引 j',
      '模式串自左向右挨个检查元素比较（j 递增）',
      '关键点比较：逐字节检查 txt[i+j] 是否等于 pat[j]',
      '若有任何一个不符，产生失配，提前跳出内循环',
      '内循环边界',
      '若比较索引 j 等于模式串长度 M，代表完整匹配！',
      '输出正确命中起始坐标 i',
      '安全闭环',
      '外循环边界',
      '匹配探索全部结束'
    ]
  },
  {
    id: 'kmp',
    name: 'KMP 算法',
    en: 'Knuth-Morris-Pratt Algorithm',
    best: 'O(n + m)',
    avg: 'O(n + m)',
    worst: 'O(n + m)',
    space: 'O(m)',
    desc: '避开无意义的重复比较，利用模式串自对称特性构建前缀跳转表（LPS/next 数组），失配时回退无忧。',
    code: `void KMPSearch(char* txt, char* pat) {\n    int N = strlen(txt);\n    int M = strlen(pat);\n    int lps[M];\n    computeLPSArray(pat, M, lps);\n    int i = 0, j = 0;\n    while (i < N) {\n        if (pat[j] == txt[i]) {\n            i++; j++;\n        }\n        if (j == M) {\n            printf("Found at %d\\n", i - j);\n            j = lps[j - 1];\n        } else if (i < N && pat[j] != txt[i]) {\n            if (j != 0) j = lps[j - 1];\n            else i++;\n        }\n    }\n}`,
    explains: [
      '主入口函数，传入 text 主串与 pattern 模式串',
      '计算两串的长度：主串长度 N，模式串长度 M',
      '分配辅助跳转表（lps数组，长度为模式串长度 M）',
      '自对称匹配：分析模式串本身，计算前缀函数表格（LPS/next）',
      '初始化主指针 i = 0，模式指针 j = 0',
      '大循环启动：i 从头扫到尾',
      '逐字符比较：评估 pat[j] 是否等于 txt[i]',
      '字符相同！双指针结伴联动右移一位（i++, j++）',
      '行进完校验',
      '若模式指针 j 走满 M 位，证明捕捉到完全对齐！',
      '通知成功对齐，命中起点是 i - j',
      '关键跃升：通过 lps[j-1] 将 j 智能前滑，复用前缀匹配，无痛跳转',
      '若主串未尽，但遇到了 pat[j] 冲突失配',
      '失配避痛：若 j > 0，则查表回退 j = lps[j-1]，少做无用功',
      '若 j = 0 表无可再退，强制将主串指针 i 前引一位（i++重新开启）',
      '边界闭环',
      '匹配完全就绪'
    ]
  },
  {
    id: 'rabinkarp',
    name: 'Rabin-Karp 算法',
    en: 'Rabin-Karp Rolling Hash',
    best: 'O(n + m)',
    avg: 'O(n + m)',
    worst: 'O(n * m)',
    space: 'O(1)',
    desc: '将字符串匹配转化为数字哈希。通过滑动窗口数学公式算增量值，极大概率过滤掉不配对区域。',
    code: `void RabinKarp(char* txt, char* pat) {\n    int N = strlen(txt), M = strlen(pat);\n    int d = 256, q = 101, p = 0, t = 0, h = 1;\n    for (int i = 0; i < M - 1; i++) h = (h * d) % q;\n    for (int i = 0; i < M; i++) {\n        p = (d * p + pat[i]) % q;\n        t = (d * t + txt[i]) % q;\n    }\n    for (int i = 0; i <= N - M; i++) {\n        if (p == t) {\n            int j;\n            for (j = 0; j < M; j++)\n                if (txt[i+j] != pat[j]) break;\n            if (j == M) printf("Found at %d\\n", i);\n        }\n        if (i < N - M) {\n            t = (d * (t - txt[i]*h) + txt[i+M]) % q;\n            if (t < 0) t = (t + q);\n        }\n    }\n}`,
    explains: [
      '主入口函数，传入 text 主串与 pattern 模式串',
      '获取主串长度 N 和模式串长度 M',
      '定义进制底数 d=256，质数取模 q=101，准备哈希暂存器',
      '计算特征权重 h = d^(M-1) % q，用于提取滚动哈希最左位',
      '预处理器：计算模式串与主串首个覆盖窗口的哈希',
      '模式串哈希加权累计（加宽模式）',
      '主串前缀窗口哈希加权累计（首格覆写）',
      '循环首位核算',
      '主窗口滑动定位：i 步进在 0 到 N-M 之间',
      '初筛：检查当前主窗口哈希 t 与模式哈希 p 是否相等',
      '哈希雷同！启动二级精确字词逐位比对，保障安全',
      '遍历检验细节（j 步进 0 到 M）',
      '一旦发生单个字节不同（Hash 碰撞），立刻阻断',
      '小边界合拢',
      '完全匹配！即通过了哈希初筛，也通过了逐字节校对！输出起始索引 i',
      '冲突规避',
      '哈希滑进：减去剔除字的特征值，乘以进制，加上新增字特征值',
      '滚动增量：t = (d * (t - txt[i]*h) + txt[i+M]) % q',
      '校准：算出来是负数，直接加上 q 取正数以防溢出异常',
      '滑窗细节收尾',
      '扫描终止',
      '匹配流程告终'
    ]
  }
];

export default function StringAlgorithms() {
  const [activeAlgoId, setActiveAlgoId] = useState<'naive' | 'kmp' | 'rabinkarp'>('naive');
  const [textVal, setTextVal] = useState('ABABDABACDABABCABLE');
  const [patternVal, setPatternVal] = useState('ABABC');
  const [lang, setLang] = useState<'c' | 'python' | 'javascript'>('c');

  const [prevInputs, setPrevInputs] = useState({ algo: 'naive', txt: 'ABABDABACDABABCABLE', pat: 'ABABC' });
  const [curStepIdx, setCurStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sliderVal, setSliderVal] = useState(350);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentAlgo = ALGO_DEFS.find(a => a.id === activeAlgoId)!;
  const speedMs = 880 - sliderVal;

  if (prevInputs.algo !== activeAlgoId || prevInputs.txt !== textVal || prevInputs.pat !== patternVal) {
    setPrevInputs({ algo: activeAlgoId, txt: textVal, pat: patternVal });
    setCurStepIdx(0);
    setPlaying(false);
  }

  // Precompute LPS (next) array for KMP visualization reference
  const computeKMPLPS = (pat: string): number[] => {
    const m = pat.length;
    if (m === 0) return [];
    const lps = new Array(m).fill(0);
    let len = 0;
    let i = 1;
    while (i < m) {
      if (pat[i] === pat[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  };

  const lpsTable = computeKMPLPS(patternVal);

  // -------------------------------------------------------------
  // GENERATORS
  // -------------------------------------------------------------
  const generateNaiveSteps = (txt: string, pat: string): StringDSStep[] => {
    const s: StringDSStep[] = [];
    const n = txt.length;
    const m = pat.length;

    // Line 0..2: calculate lens
    s.push({
      line: 0, explanation: `[开始] 启动 naiveSearch(char* txt, char* pat)。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });
    s.push({
      line: 1, explanation: `[长度计算] 获得主串长度 N = ${n}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });
    s.push({
      line: 2, explanation: `[长度计算] 获得模式串长度 M = ${m}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });

    if (n < m || m === 0) {
      s.push({
        line: 13, explanation: `[终止] 模式串为空或主串长度小于模式串，无匹配基础。`,
        i: 0, j: 0, status: 'done', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
      });
      return s;
    }

    const matchedPos: number[] = [];

    for (let i = 0; i <= n - m; i++) {
      s.push({
        line: 3, explanation: `[外循环] 起步滑窗，尝试从主文本 i = ${i} 处对齐模式串。`,
        i, j: 0, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos]
      });

      s.push({
        line: 4, explanation: `[声明] 初始内部对比索引起步 j = 0。`,
        i, j: 0, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos]
      });

      let j = 0;
      for (j = 0; j < m; j++) {
        // Line 5: inner loop
        s.push({
          line: 5, explanation: `[内循环] 逐字比对模式串第 j = ${j} 位。`,
          i, j, status: 'compare', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos]
        });

        // Line 6: checking character match
        const charTxt = txt[i + j];
        const charPat = pat[j];
        const isMatch = charTxt === charPat;

        if (isMatch) {
          s.push({
            line: 6, explanation: `[字符相符] txt[${i + j}] '${charTxt}' 与 pat[${j}] '${charPat}' 符合。`,
            i, j, status: 'match', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos]
          });
        } else {
          s.push({
            line: 6, explanation: `[字符异同] txt[${i + j}] '${charTxt}' 的值与 pat[${j}] '${charPat}' 分离（不匹配）。`,
            i, j, status: 'mismatch', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos]
          });
          s.push({
            line: 7, explanation: `[跳出] 发生失配！立刻中断当前 j = ${j} 对齐扫描，外窗右移。`,
            i, j, status: 'mismatch', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos]
          });
          break;
        }
      }

      // Line 9: did we reach M?
      s.push({
        line: 9, explanation: `[判定] 扫描完判定：j 值到达 ${j}。模式串长度 M 是 ${m}。`,
        i, j, status: j === m ? 'found' : 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos]
      });

      if (j === m) {
        matchedPos.push(i);
        s.push({
          line: 10, explanation: `[锁定成功] 精准对齐！在文本位置 i = ${i} 的范围成功拦截完全匹配。`,
          i, j: m - 1, status: 'found', txtCmpIdxs: Array.from({ length: m }, (_, k) => i + k), patCmpIdxs: Array.from({ length: m }, (_, k) => k), matchedIndices: [...matchedPos]
        });
      }
    }

    s.push({
      line: 13, explanation: `[全部搜毕] Naive 探索全部完毕！共检索到 ${matchedPos.length} 处匹配首位：[${matchedPos.join(', ')}]`,
      i: n - m, j: 0, status: 'done', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos]
    });

    return s;
  };

  const generateKMPSteps = (txt: string, pat: string): StringDSStep[] => {
    const s: StringDSStep[] = [];
    const n = txt.length;
    const m = pat.length;

    s.push({
      line: 0, explanation: `[开始] KMP 算法大举启动 KMPSearch(char* txt, char* pat)。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });
    s.push({
      line: 1, explanation: `[长检] 检出特征文本长：N = ${n}, M = ${m}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });

    const lps = computeKMPLPS(pat);
    s.push({
      line: 2, explanation: `[分配表格] 创建 lps 预存数组，大小为 M = ${m}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], nextArr: lps
    });
    s.push({
      line: 3, explanation: `[对称核对] 调用 computeLPSArray 成功！前缀跳转表已计算。lps = [${lps.join(', ')}]。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], nextArr: lps
    });
    s.push({
      line: 4, explanation: `[变量置备] 预推指针设好：主串指针 i = 0，模式串指针 j = 0。`,
      i: 0, j: 0, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], nextArr: lps
    });

    if (n < m || m === 0) {
      s.push({
        line: 16, explanation: `[终止] 无法实施匹配。`,
        i: 0, j: 0, status: 'done', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], nextArr: lps
      });
      return s;
    }

    let i = 0;
    let j = 0;
    const matchedPos: number[] = [];

    // Outer loop while i < N
    while (i < n) {
      s.push({
        line: 5, explanation: `[字符比对] 进入循环条件 (i < N)，开始评估 txt[i] 与 pat[j]。当前 i = ${i}, j = ${j}。`,
        i, j, status: 'compare', txtCmpIdxs: [i], patCmpIdxs: [j], matchedIndices: [...matchedPos], nextArr: lps
      });

      const isMatch = txt[i] === pat[j];

      if (isMatch) {
        s.push({
          line: 6, explanation: `[匹配前进] txt[${i}] '${txt[i]}' 吻合 pat[${j}] '${pat[j]}'! 双指针联动：i++, j++。`,
          i, j, status: 'match', txtCmpIdxs: [i], patCmpIdxs: [j], matchedIndices: [...matchedPos], nextArr: lps
        });
        i++;
        j++;
      }

      if (j === m) {
        matchedPos.push(i - j);
        s.push({
          line: 8, explanation: `[完全对齐] 模式指针 j 到达边缘 ${j}。在索引 ${i - j} 捕获完整的目标串！`,
          i, j: m - 1, status: 'found', txtCmpIdxs: Array.from({ length: m }, (_, k) => i - j + k), patCmpIdxs: Array.from({ length: m }, (_, k) => k), matchedIndices: [...matchedPos], nextArr: lps
        });

        const nextJ = lps[j - 1];
        s.push({
          line: 10, explanation: `[查前缀表] 查找 lps[${j - 1}] = ${nextJ}。模式串向后右滑，指针 j 优雅退至 ${nextJ} (不必从第一字重新对比)。`,
          i, j, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], nextArr: lps
        });
        j = nextJ;
      } else if (i < n && txt[i] !== pat[j]) {
        // Mismatch check
        s.push({
          line: 11, explanation: `[监测碰撞] 此时主串 txt[${i}] '${txt[i]}' 与模式 pat[${j}] '${pat[j]}' 产生失配错落！`,
          i, j, status: 'mismatch', txtCmpIdxs: [i], patCmpIdxs: [j], matchedIndices: [...matchedPos], nextArr: lps
        });

        if (j !== 0) {
          const nextJ = lps[j - 1];
          s.push({
            line: 12, explanation: `[失配回查] j = ${j} 即非起始。寻找跳转可能：j 跳回 lps[j-1] 即 lps[${j - 1}] = ${nextJ} 重新比较。`,
            i, j, status: 'slide', txtCmpIdxs: [i], patCmpIdxs: [nextJ], matchedIndices: [...matchedPos], nextArr: lps
          });
          j = nextJ;
        } else {
          s.push({
            line: 13, explanation: `[无可退路] 指针 j 已退至首字符 (j=0)。无前后缀可用，主指针 i 移前一位（i = ${i + 1}）。`,
            i, j, status: 'slide', txtCmpIdxs: [i], patCmpIdxs: [0], matchedIndices: [...matchedPos], nextArr: lps
          });
          i++;
        }
      }
    }

    s.push({
      line: 16, explanation: `[大功告成] KMP 全程跟踪完！总共在文本捕获 ${matchedPos.length} 处匹配索引：[${matchedPos.join(', ')}]`,
      i: n, j: 0, status: 'done', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], nextArr: lps
    });

    return s;
  };

  const generateRabinKarpSteps = (txt: string, pat: string): StringDSStep[] => {
    const s: StringDSStep[] = [];
    const n = txt.length;
    const m = pat.length;

    const d = 256;
    const q = 101;
    let p = 0; // hash for pattern
    let t = 0; // hash for txt current window
    let h = 1;

    s.push({
      line: 0, explanation: `[开始] 启动 Rabin-Karp 哈希匹配。底数 d = 256，质数模 q = 101。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });

    s.push({
      line: 1, explanation: `[长比] 主串 N = ${n}, 模式 M = ${m}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });

    // Compute h = d^(M-1) % q
    for (let i = 0; i < m - 1; i++) {
      h = (h * d) % q;
    }

    s.push({
      line: 3, explanation: `[权重计算] 获取滑窗最高位基数 h = d^(M-1) % q = ${h}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: []
    });

    // Precalculate hashes
    for (let i = 0; i < m; i++) {
      p = (d * p + pat.charCodeAt(i)) % q;
      t = (d * t + txt.charCodeAt(i)) % q;
    }

    s.push({
      line: 4, explanation: `[初筛哈希] 计算模式串哈希及主串首位置窗口哈希值。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], pHash: p, tHash: t, windowStart: 0
    });

    s.push({
      line: 5, explanation: `[模式哈希] \`pat\` 哈希值：P(hash) = ${p} (按字符权重与模数累加计算)。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], pHash: p, tHash: t, windowStart: 0
    });

    s.push({
      line: 6, explanation: `[主串首窗] 首个窗口 txt[0..${m - 1}] ("${txt.substring(0, m)}") 哈希：T(hash) = ${t}。`,
      i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [], pHash: p, tHash: t, windowStart: 0
    });

    const matchedPos: number[] = [];

    for (let i = 0; i <= n - m; i++) {
      s.push({
        line: 8, explanation: `[滑窗定位] 主滑窗索引 i = ${i}。当前覆盖字符串段为 "${txt.substring(i, i + m)}"。`,
        i, j: 0, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
      });

      s.push({
        line: 9, explanation: `[哈希验证] 比对窗口哈希 T_hash (${t}) 与模式哈希 P_hash (${p})。`,
        i, j: 0, status: 'hash_compare', txtCmpIdxs: Array.from({ length: m }, (_, k) => i + k), patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
      });

      if (p === t) {
        s.push({
          line: 9, explanation: `[模合通过] 哈希一致！同为 ${t}。开始在该格子对齐并挨个字符查验（防哈希冲突）。`,
          i, j: 0, status: 'hash_match', txtCmpIdxs: Array.from({ length: m }, (_, k) => i + k), patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
        });

        let j;
        let collisionFound = false;
        for (j = 0; j < m; j++) {
          s.push({
            line: 11, explanation: `[哈希吻合逐位] 比较字符 txt[${i + j}] '${txt[i + j]}' 与 pat[${j}] '${pat[j]}'`,
            i, j, status: 'compare', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
          });

          if (txt[i + j] !== pat[j]) {
            collisionFound = true;
            s.push({
              line: 12, explanation: `[哈希冲突] 失配！虽然哈希完全相同但字符不一致：'${txt[i + j]}' 冲突 '${pat[j]}'。这叫发生 Hash 碰撞。`,
              i, j, status: 'hash_collision', txtCmpIdxs: [i + j], patCmpIdxs: [j], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
            });
            break;
          }
        }

        if (!collisionFound && j === m) {
          matchedPos.push(i);
          s.push({
            line: 14, explanation: `[真切捕获] 命中！哈希相同且所有字符吻合！在 i = ${i} 确认模式串。`,
            i, j: m - 1, status: 'found', txtCmpIdxs: Array.from({ length: m }, (_, k) => i + k), patCmpIdxs: Array.from({ length: m }, (_, k) => k), matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
          });
        }
      } else {
        s.push({
          line: 9, explanation: `[不合略过] 哈希不符（${t} != ${p}）。该区域判定绝无可能匹配，快速跳转。`,
          i, j: 0, status: 'mismatch', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
        });
      }

      // Roll hash if we are not at end
      if (i < n - m) {
        s.push({
          line: 16, explanation: `[准备滚动] 递推滚动哈希：剔除左侧最旧字符 txt[${i}] '${txt[i]}'，收纳右侧新进字符 txt[${i + m}] '${txt[i + m]}'。`,
          i, j: 0, status: 'slide', txtCmpIdxs: [i, i + m], patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i
        });

        // Calculate next window hash
        const oldC = txt.charCodeAt(i);
        const newC = txt.charCodeAt(i + m);
        let nextT = (d * (t - oldC * h) + newC) % q;
        if (nextT < 0) {
          nextT = nextT + q;
        }

        t = nextT;

        s.push({
          line: 17, explanation: `[滚动完成] 哈希滑动到 i = ${i + 1}，用公式增量算得最新 T_hash = ${nextT}。`,
          i: i + 1, j: 0, status: 'slide', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: i + 1
        });
      }
    }

    s.push({
      line: 21, explanation: `[全搜完毕] Rabin-Karp 完美搜求完毕！共在 [${matchedPos.join(', ')}] 处检录到匹配。`,
      i: n - m, j: 0, status: 'done', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [...matchedPos], pHash: p, tHash: t, windowStart: n - m
    });

    return s;
  };

  const steps = (function() {
    // Generate steps inside an IIFE/hooks-safe way
    if (activeAlgoId === 'naive') {
      return generateNaiveSteps(textVal, patternVal);
    } else if (activeAlgoId === 'kmp') {
      return generateKMPSteps(textVal, patternVal);
    } else if (activeAlgoId === 'rabinkarp') {
      return generateRabinKarpSteps(textVal, patternVal);
    }
    return [];
  })();

  // Handle Playback Loop
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

  // Scrolling code panel line into view
  const activeStep = steps[curStepIdx] || { line: -1, explanation: '', i: 0, j: 0, status: 'init', txtCmpIdxs: [], patCmpIdxs: [], matchedIndices: [] };

  useEffect(() => {
    if (activeStep.line >= 0 && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-str-line="${activeStep.line}"]`);
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

  // Helper arrays for strings characters rendering
  const textChars = textVal.split('');
  const patternChars = patternVal.split('');

  return (
    <div id="string-algorithms-panel" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] mb-8 overflow-hidden hover:border-[rgba(0,229,255,0.2)] transition-colors text-zinc-100 font-sans shadow-lg">
      
      {/* Head section */}
      <div className="p-5 pb-3.5 flex items-center gap-3.5 flex-wrap border-b border-[var(--border)] bg-zinc-950/20">
        <span className="font-extrabold text-[32px] text-[rgba(0,184,212,0.15)] leading-none font-sans">03</span>
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-extrabold text-[20px] text-zinc-150">串匹配算法演练 (String Match)</h3>
          <div className="font-mono text-[12.5px] text-[var(--text-muted)] mt-1">
            Naive BFS Matching / KMP Automation / Rabin Karp Rolling Hash
          </div>
        </div>
        
        {/* Toggle between String Matching algorithms */}
        <div className="flex gap-1.5 p-1 bg-black/35 rounded-full border border-zinc-800">
          {(['naive', 'kmp', 'rabinkarp'] as const).map(id => {
            const label = id === 'naive' ? '朴素匹配' : id === 'kmp' ? 'KMP 算法' : 'Rabin-Karp';
            const isActive = activeAlgoId === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveAlgoId(id);
                  setPlaying(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${isActive ? 'bg-[var(--accent)] text-black font-extrabold shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 bg-zinc-900/10 border-b border-[var(--border)] flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <p className="flex-1 text-[13.5px] text-zinc-300 leading-relaxed font-light">
          <b>{currentAlgo.name} ({currentAlgo.en})</b>：{currentAlgo.desc}
          <span className="block mt-1 font-mono text-[11px] text-[var(--accent)]">
            空间复杂度: {currentAlgo.space} | 最坏时间: {currentAlgo.worst} | 平均时间: {currentAlgo.avg}
          </span>
        </p>
        
        {/* String Inputs Control */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">主文本串 (Text)</span>
            <input 
              type="text" 
              value={textVal} 
              maxLength={24}
              onChange={e => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                setTextVal(val || 'ABABD');
              }}
              className="px-3 py-1.5 border border-zinc-800 rounded-[var(--rs)] bg-black/45 text-[13px] md:text-[14px] font-mono tracking-wide text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="请输入大写英文字符"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">模式匹配串 (Pattern)</span>
            <input 
              type="text" 
              value={patternVal} 
              maxLength={8}
              onChange={e => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                setPatternVal(val || 'A');
              }}
              className="px-3 py-1.5 border border-zinc-800 rounded-[var(--rs)] bg-black/45 text-[13px] md:text-[14px] font-mono tracking-wide text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="大写串"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* 1. VISUALIZATION CHANNEL */}
        <div className="p-5 flex flex-col justify-between gap-5 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-zinc-950/20">
          
          {/* Main Virtual Visual Tracks */}
          <div className="flex-1 flex flex-col justify-center gap-7 py-6 min-h-[220px] bg-black/20 rounded-[var(--rs)] border border-zinc-900/60 p-5 relative overflow-hidden">
            
            {/* TEXT STRING ROW */}
            <div className="relative">
              <span className="absolute -top-5 left-0 font-mono text-[9px] text-[var(--text-muted)] tracking-wider uppercase">主串 Text (N={textVal.length})</span>
              <div className="flex items-center flex-wrap gap-1">
                {textChars.map((char, index) => {
                  const isCmp = activeStep.txtCmpIdxs.includes(index);
                  const isHistoryMatch = activeStep.matchedIndices.some(startIdx => index >= startIdx && index < startIdx + patternVal.length);
                  
                  // Construct styles based on status
                  let borderCls = "border-zinc-800 text-zinc-300";
                  let bgCls = "bg-zinc-900/40";
                  
                  if (isCmp) {
                    if (activeStep.status === 'match') {
                      borderCls = "border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-105";
                      bgCls = "bg-emerald-900/35";
                    } else if (activeStep.status === 'mismatch' || activeStep.status === 'hash_collision') {
                      borderCls = "border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse";
                      bgCls = "bg-rose-950/30";
                    } else if (activeStep.status === 'found') {
                      borderCls = "border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105";
                      bgCls = "bg-cyan-950/30";
                    } else {
                      borderCls = "border-yellow-500 text-yellow-300";
                      bgCls = "bg-yellow-950/20";
                    }
                  } else if (isHistoryMatch) {
                    borderCls = "border-emerald-500/80 text-emerald-400/90";
                    bgCls = "bg-emerald-950/20";
                  }

                  const isPteI = activeStep.i === index && activeAlgoId !== 'rabinkarp';

                  return (
                    <div key={index} className="flex flex-col items-center select-none relative shrink-0">
                      <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-[14px] border rounded-[4px] transition-all duration-200 ${borderCls} ${bgCls}`}>
                        {char}
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 mt-0.5">{index}</span>
                      
                      {/* Pointer Indicator 'i' */}
                      {isPteI && (
                        <div className="absolute -bottom-5 text-yellow-400 font-mono text-[11px] font-black animate-bounce -translate-x-[1px]">
                          ↑<span className="text-[9px] font-normal text-zinc-400 ml-px">i</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PATTERN STRING ROW */}
            <div className="relative pt-2">
              <span className="absolute -top-3 left-0 font-mono text-[9px] text-[var(--text-muted)] tracking-wider uppercase">模式串 Pattern (M={patternVal.length})</span>
              
              {/* Slide offset container */}
              <div 
                className="flex items-center gap-1 transition-all duration-300 pl-0"
                style={{
                  transform: `translateX(${activeStep.windowStart !== undefined ? (activeStep.windowStart * 36) : (activeStep.i - activeStep.j) * 36}px)`,
                }}
              >
                {patternChars.map((char, index) => {
                  const isCmp = activeStep.patCmpIdxs.includes(index);
                  
                  let borderCls = "border-zinc-800 text-zinc-300";
                  let bgCls = "bg-zinc-900/30";
                  
                  if (isCmp) {
                    if (activeStep.status === 'match') {
                      borderCls = "border-emerald-500 text-emerald-300";
                      bgCls = "bg-emerald-900/35";
                    } else if (activeStep.status === 'mismatch' || activeStep.status === 'hash_collision') {
                      borderCls = "border-rose-500 text-rose-300";
                      bgCls = "bg-rose-950/30";
                    } else if (activeStep.status === 'found') {
                      borderCls = "border-cyan-400 text-cyan-200";
                      bgCls = "bg-cyan-950/30";
                    } else {
                      borderCls = "border-yellow-500 text-yellow-300";
                      bgCls = "bg-yellow-950/20";
                    }
                  }

                  const isPteJ = activeStep.j === index && activeAlgoId !== 'rabinkarp';

                  return (
                    <div key={index} className="flex flex-col items-center select-none relative shrink-0">
                      <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-[14px] border rounded-[4px] transition-all duration-200 ${borderCls} ${bgCls}`}>
                        {char}
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 mt-0.5">{index}</span>
                      
                      {/* Pointer Indicator 'j' */}
                      {isPteJ && (
                        <div className="absolute -bottom-5 text-amber-500 font-mono text-[11px] font-black animate-pulse -translate-x-[1px]">
                          ↑<span className="text-[9px] font-normal text-zinc-400 ml-px">j</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALGORITHM SPECIFIC HUD EXTRA DETAILS */}
            {activeAlgoId === 'kmp' && activeStep.nextArr && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wide">KMP 前缀表 (LPS / next 数组):</span>
                  <span className="text-[9px] text-zinc-500">lps[k] 表示前缀中最长的公共前后缀长度</span>
                </div>
                <div className="flex gap-1.5 font-mono text-[12px]">
                  {lpsTable.map((val, idx) => {
                    const isFocus = activeStep.j - 1 === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 py-1 px-3 border border-zinc-800 rounded flex flex-col items-center justify-center transition-all ${isFocus ? 'border-amber-500 text-amber-300 bg-amber-500/5 scale-105' : 'text-zinc-400 bg-black/20'}`}
                      >
                        <span className="text-[9px] text-zinc-600 mb-0.5">j={idx}</span>
                        <span className="font-extrabold">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeAlgoId === 'rabinkarp' && activeStep.pHash !== undefined && activeStep.tHash !== undefined && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 animate-fadeIn flex flex-wrap gap-4 text-[12px] font-mono">
                <div className="p-2.5 bg-black/30 rounded border border-zinc-800/85 flex-1 min-w-[130px]">
                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest leading-none">模式串哈希 Pattern Hash</div>
                  <div className="text-[16px] font-extrabold text-cyan-400 mt-1">{activeStep.pHash}</div>
                </div>
                <div className="p-2.5 bg-black/30 rounded border border-zinc-800/85 flex-1 min-w-[130px]">
                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest leading-none">当前窗口哈希 Text Window Hash</div>
                  <div className="text-[16px] font-extrabold text-yellow-400 mt-1 flex items-center justify-between">
                    <span>{activeStep.tHash}</span>
                    {activeStep.pHash === activeStep.tHash && (
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">MATCH</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* PLAYBACK CONTROL BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap mt-1 border-t border-zinc-900/40 pt-3">
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handleReset} title="重置">
              ↺
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handlePrev} title="上一步">
              ◀
            </button>
            <button className={`w-10 h-8 flex items-center justify-center border rounded bg-[#101026] text-[15px] transition-all ${playing ? 'text-amber-400 border-amber-500/30' : 'text-zinc-300 border-zinc-800 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`} onClick={() => setPlaying(!playing)} title="播放 / 暂停">
              {playing ? '⏸' : '▶'}
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded bg-[#101026] text-zinc-300 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all" onClick={handleNext} title="下一步">
              ▶
            </button>

            <div className="flex items-center gap-1.5 ml-auto font-mono text-[10.5px] text-zinc-400">
              <span>慢</span>
              <input type="range" min="80" max="800" value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} className="w-[80px] accent-[var(--accent)]" />
              <span>快</span>
            </div>

            <div className="font-mono text-[11px] text-zinc-400 px-3 py-1 bg-black/20 rounded border border-zinc-800 shrink-0">
              步骤 {curStepIdx + 1}/{Math.max(1, steps.length)}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/25 rounded border border-zinc-800 min-h-[50px] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-[18px] min-w-[18px] h-[18px] rounded-full bg-cyan-950 text-cyan-400 font-sans font-bold italic text-[11px]">i</span>
            <span className="text-[13px] text-zinc-300 transition-all duration-300">
              {activeStep.explanation}
            </span>
          </div>

        </div>

        {/* 2. SOURCE CODE PANEL */}
        <div className="flex flex-col max-h-[380px] lg:max-h-[460px] bg-zinc-950 relative border border-zinc-900 rounded" ref={containerRef}>
          <div className="p-2 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center text-[11px] px-4 font-mono select-none">
            <span className="text-zinc-[var(--text-muted)] tracking-wide">💻 CODE PREVIEW</span>
            <div className="flex items-center gap-2">
              {(['c', 'python', 'javascript'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setPlaying(false); }}
                  className={`px-1.5 py-0.5 rounded transition-all text-[9.5px] tracking-wide border uppercase ${lang === l ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] font-bold' : 'border-transparent text-zinc-400 hover:text-white'}`}
                >
                  {l === 'javascript' ? 'JS' : l}
                </button>
              ))}
              <span className="text-zinc-850">|</span>
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
                className="px-2 py-0.5 border border-zinc-900 rounded bg-black/25 hover:border-[var(--accent)] hover:text-white text-zinc-400 text-[10px] transition-all"
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
                  data-str-line={idx} 
                  className={`code-line flex py-[1px] pr-[14px] cursor-pointer transition-all border-l-[3px] ${isActive ? 'active border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-transparent hover:bg-white/5'}`}
                  onClick={() => { setPlaying(false); setCurStepIdx(steps.findIndex(s => s.line === idx) || 0); }}
                >
                  <span className="line-num w-8 text-right pr-2.5 text-zinc-605 select-none shrink-0 text-[10.5px] font-mono">
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

          {/* Comment description at bottom of code panel */}
          <div className="p-3 px-4 min-h-[48px] bg-black border-t border-zinc-900 text-[12.5px] text-zinc-400 leading-[1.6] flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-zinc-800 text-zinc-300 font-sans text-[10px] mt-[2px]">{lang === 'javascript' ? 'js' : lang}</span>
            <span key={activeStep.line} className="animate-fadeIn flex-1 text-zinc-400">
              {currentAlgo.explains[activeStep.line] || (activeStep.line === -1 ? '算法匹配探索完全执行完毕!' : '点击步骤播放按钮，可在左侧实时跟踪 C 语言指针的跳转轨迹')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
