'use client';

import React, { useState } from 'react';
import { SORTING, SEARCHING } from '@/lib/algorithms';
import AlgoCard from '@/components/AlgoCard';
import DataStructuresPlayground from '@/components/DataStructuresPlayground';
import StringAlgorithms from '@/components/StringAlgorithms';
import DPAndGreedyAlgorithms from '@/components/DPAndGreedyAlgorithms';
import RecursionAlgorithms from '@/components/RecursionAlgorithms';

const COMPLEXITY_LEVELS = [
  { name: 'all', label: '显示全部', speed: 'Reset', desc: '查看完整的经典算法与数据结构列表。', border: 'border-zinc-800 text-zinc-400 bg-zinc-900/10 hover:border-zinc-700 font-sans' },
  { name: 'O(1)', label: '常数级 O(1)', speed: '极强 (Instant)', desc: '执行开销恒定，不随数据量增加。比如：哈希读取、数组索引直达。', border: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:border-emerald-400' },
  { name: 'O(log n)', label: '对数级 O(log n)', speed: '极快 (Logarithmic)', desc: '数据量翻倍，执行步骤仅多一次。代表算法：二分搜索系列。', border: 'border-teal-500/20 text-teal-400 bg-teal-500/5 hover:border-teal-400' },
  { name: 'O(n)', label: '线性级 O(n)', speed: '匀速 (Linear)', desc: '耗时与输入规模一比一增长。代表算法：顺序遍历线性查找。', border: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:border-cyan-400' },
  { name: 'O(n log n)', label: '线性对数级 O(n log n)', speed: '高效 (Efficient)', desc: '经典分治或高效排序的巅峰范式。代表算法：快速排序、归并排序。', border: 'border-blue-500/20 text-blue-400 bg-blue-500/5 hover:border-blue-400' },
  { name: 'O(n²)', label: '平方级 O(n²)', speed: '缓慢 (Quadratic)', desc: '常发于双重嵌套循环，数据偏大时极易卡死。代表算法：冒泡排序。', border: 'border-orange-500/20 text-orange-400 bg-orange-500/5 hover:border-orange-400' },
];

export default function Page() {
  const ALL = [...SORTING, ...SEARCHING];
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');

  // Filter lists based on selected standard complexity
  const filteredALL = ALL.filter(algo => 
    selectedComplexity === 'all' || 
    algo.avg.includes(selectedComplexity) || 
    algo.space.includes(selectedComplexity)
  );

  const filteredSorting = SORTING.filter(algo => 
    selectedComplexity === 'all' || 
    algo.avg.includes(selectedComplexity) || 
    algo.space.includes(selectedComplexity)
  );

  const filteredSearching = SEARCHING.filter(algo => 
    selectedComplexity === 'all' || 
    algo.avg.includes(selectedComplexity) || 
    algo.space.includes(selectedComplexity)
  );

  return (
    <main className="min-h-screen text-[var(--text)] font-sans relative">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-7 h-[52px] bg-[rgba(6,6,14,0.88)] backdrop-blur-md border-b border-[var(--border)]">
        <div className="font-extrabold text-[15px] text-[var(--accent)] tracking-wide pointer-events-none">ALGO-VIZ</div>
        <div className="flex gap-1">
          <a href="#overview" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">全景速览</a>
          <a href="#data-structures" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">数据结构 (13)</a>
          <a href="#sorting" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">排序 ({SORTING.length})</a>
          <a href="#searching" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">搜索 ({SEARCHING.length})</a>
          <a href="#string-algos" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">字符串匹配 ({3})</a>
          <a href="#advanced-algos" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">贪心与动态规划 ({20})</a>
          <a href="#recursion-algos" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">递归专题 (10)</a>
        </div>
      </nav>

      <section className="relative pt-[110px] pb-14 px-6 text-center overflow-hidden">
        <h1 className="font-sans text-[clamp(28px,5.5vw,56px)] font-extrabold leading-[1.1 lead] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-[var(--accent)] to-[var(--purple)] relative">
          数据结构与算法<br />全景详解
        </h1>
        <p className="mt-3 text-[16px] text-[var(--text-sec)] font-light">零基础起步 · 逐行读懂 C 语言代码 · 100% 交互式可视化</p>
        <div className="flex gap-2.5 justify-center mt-6 flex-wrap">
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            13 种核心数据结构
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            {SORTING.length} 种经典排序算法
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            {SEARCHING.length} 种基础搜索算法
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            3 种经典字符串匹配算法
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            10 种贪心算法 + 10 种动态规划
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            10 例经典递归专题演练
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            C 语言逐行代码级剖析
          </span>
        </div>
      </section>

      {/* Overview section with Interactive Big-O cheatsheet */}
      <section id="overview" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">全景速览与复杂度</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">BIG-O EXPLORER</span>
        </div>

        {/* Big-O Interactive Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
          {COMPLEXITY_LEVELS.map((level) => {
            const isCurrent = selectedComplexity === level.name;
            return (
              <button
                key={level.name}
                onClick={() => setSelectedComplexity(level.name)}
                className={`text-left p-3.5 border rounded-[var(--rs)] transition-all cursor-pointer ${level.border} ${isCurrent ? 'ring-2 ring-[var(--accent)] scale-[1.02] bg-white/[0.02]' : 'opacity-85 hover:opacity-100'}`}
              >
                <div className="font-extrabold text-[14.5px] font-mono leading-none">{level.label}</div>
                <div className="text-[10px] uppercase font-mono tracking-wide mt-1 opacity-70">{level.speed}</div>
                <p className="text-[11.5px] text-zinc-400 mt-2.5 leading-relaxed font-light">{level.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Dynamic filters alert */}
        {selectedComplexity !== 'all' && (
          <div className="mb-4 text-[12.5px] font-mono text-[var(--accent)] p-2.5 px-4 bg-[var(--accent-dim)] rounded-[var(--rs)] border border-[rgba(0,229,255,0.2)] flex items-center gap-2">
            <span>🔍 已启用复杂度检索：仅展示与 <b>{selectedComplexity}</b> 相关的经典模型 (过滤后共: {filteredALL.length} 项)</span>
            <button onClick={() => setSelectedComplexity('all')} className="ml-auto underline hover:text-white cursor-pointer font-bold">重置</button>
          </div>
        )}

        <div className="overflow-x-auto text-[12.5px] font-mono bg-black/15 border border-[var(--border)] rounded-[var(--r)] p-1.5">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">算法</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">类型</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">最好</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">平均</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">最坏</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">空间</th>
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">稳定</th>
              </tr>
            </thead>
            <tbody>
              {filteredALL.map((algo) => {
                const isSearch = SEARCHING.some(a => a.id === algo.id);
                const stableText = algo.stable === null ? '-' : (algo.stable ? '是' : '否');
                return (
                  <tr key={algo.id} className="hover:bg-[var(--accent-dim)] transition-colors group">
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]">
                      <a href={`#algo-${algo.id}`} className="text-[var(--accent)] font-medium hover:underline">{algo.name}</a>
                    </td>
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]">{isSearch ? '搜索' : '排序'}</td>
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.best }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.avg }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.worst }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.space }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.25)] text-[var(--text-sec)]">{stableText}</td>
                  </tr>
                )
              })}
              {filteredALL.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-7 text-zinc-500">
                    没有找到符合复杂度条件的记录。点击上方 &quot;显示全部&quot; 恢复。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Structures Playground Section */}
      <section className="max-w-[1200px] mx-auto px-5 pb-7">
        <DataStructuresPlayground />
      </section>

      {/* Algorithm: Sorting */}
      <section id="sorting" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">1. 排序算法演练</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">SORTING · {filteredSorting.length} / {SORTING.length}</span>
        </div>
        <div>
          {filteredSorting.map((algo, idx) => (
             <AlgoCard key={algo.id} algo={algo} isSearch={false} index={idx} />
          ))}
          {filteredSorting.length === 0 && (
            <div className="p-10 border border-dashed border-[var(--border)] text-zinc-500 text-center rounded-lg bg-black/5 font-mono text-[13px]">
              无排序算法符合当前筛选复杂度。
            </div>
          )}
        </div>
      </section>

      {/* Algorithm: Searching */}
      <section id="searching" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">2. 搜索算法演练</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">SEARCHING · {filteredSearching.length} / {SEARCHING.length}</span>
        </div>
        <div>
          {filteredSearching.map((algo, idx) => (
             <AlgoCard key={algo.id} algo={algo} isSearch={true} index={idx} />
          ))}
          {filteredSearching.length === 0 && (
            <div className="p-10 border border-dashed border-[var(--border)] text-zinc-500 text-center rounded-lg bg-black/5 font-mono text-[13px]">
              无搜索算法符合当前筛选复杂度。
            </div>
          )}
        </div>
      </section>

      {/* Algorithm: String Matching */}
      <section id="string-algos" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">3. 字符串匹配算法演练</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">STRING MATCH · 3 种模式</span>
        </div>
        <StringAlgorithms />
      </section>

      {/* Algorithm: Advanced greedy & dp paradigms */}
      <section id="advanced-algos" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">4. 贪心与动态规划专题</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--purple-dim)] text-[var(--purple)] border border-[rgba(238,130,238,0.15)]">GREEDY &amp; DP · 20 种经典范式</span>
        </div>
        <DPAndGreedyAlgorithms />
      </section>

      {/* Algorithm: Recursion & Backtracking */}
      <section id="recursion-algos" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">5. 递归与回溯专题</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--purple-dim)] text-[var(--purple)] border border-[rgba(238,130,238,0.15)]">RECURSION &amp; BACKTRACKING · 10 种经典案例</span>
        </div>
        <RecursionAlgorithms />
      </section>

      <footer className="text-center py-9 mt-9 px-5 border-t border-[var(--border)] text-[var(--text-muted)] text-[12px] font-mono">
        ALGO-VIZ PRO &mdash; 排序与搜索算法全景教学 · {ALL.length + 30} 个经典算法实例 · C 语言原生态指针与堆栈微步跟踪
      </footer>
    </main>
  );
}
