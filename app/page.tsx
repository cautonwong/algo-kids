import React from 'react';
import { SORTING, SEARCHING } from '@/lib/algorithms';
import AlgoCard from '@/components/AlgoCard';

export default function Page() {
  const ALL = [...SORTING, ...SEARCHING];

  return (
    <main className="min-h-screen text-[var(--text)] font-sans relative">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-7 h-[52px] bg-[rgba(6,6,14,0.88)] backdrop-blur-md border-b border-[var(--border)]">
        <div className="font-extrabold text-[15px] text-[var(--accent)] tracking-wide pointer-events-none">ALGO-VIZ</div>
        <div className="flex gap-1">
          <a href="#overview" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">总览</a>
          <a href="#sorting" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">排序 ({SORTING.length})</a>
          <a href="#searching" className="px-3.5 py-1.5 rounded-full text-[12.5px] text-[var(--text-sec)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">搜索 ({SEARCHING.length})</a>
        </div>
      </nav>

      <section className="relative pt-[110px] pb-14 px-6 text-center overflow-hidden">
        <h1 className="font-sans text-[clamp(28px,5.5vw,56px)] font-extrabold leading-[1.15] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-[var(--accent)] to-[var(--purple)] relative">
          排序与搜索算法<br />全景详解
        </h1>
        <p className="mt-3 text-[16px] text-[var(--text-sec)] font-light">零基础起步 · 逐行读懂每一行代码 · 交互式可视化</p>
        <div className="flex gap-2.5 justify-center mt-6 flex-wrap">
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            {SORTING.length} 种排序算法
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            {SEARCHING.length} 种搜索算法
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            完整代码实现
          </span>
          <span className="px-4 py-1.5 border border-[var(--border)] rounded-full text-[12px] text-[var(--text-sec)] font-mono bg-[rgba(12,12,26,0.5)]">
            逐行代码讲解
          </span>
        </div>
      </section>

      <section id="overview" className="max-w-[1200px] mx-auto px-5 pb-7">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">全景速览</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">OVERVIEW</span>
        </div>
        <div className="overflow-x-auto text-[12.5px] font-mono">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">算法</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">类型</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">最好</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">平均</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">最坏</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">空间</th>
                <th className="text-left py-2 px-3 border-b-2 border-[var(--border)] text-[var(--text-muted)] text-[10.5px] uppercase tracking-wider font-medium">稳定</th>
              </tr>
            </thead>
            <tbody>
              {ALL.map((algo) => {
                const isSearch = SEARCHING.some(a => a.id === algo.id);
                const stableText = algo.stable === null ? '-' : (algo.stable ? '是' : '否');
                return (
                  <tr key={algo.id} className="hover:bg-[var(--accent-dim)] transition-colors group">
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]">
                      <a href={\`#algo-\${algo.id}\`} className="text-[var(--accent)] font-medium hover:underline">{algo.name}</a>
                    </td>
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]">{isSearch ? '搜索' : '排序'}</td>
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.best }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.avg }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.worst }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: algo.space }} />
                    <td className="py-2.5 px-3 border-b border-[rgba(26,26,58,0.4)] text-[var(--text-sec)]">{stableText}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="sorting" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">排序算法</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">SORTING · {SORTING.length}</span>
        </div>
        <div>
          {SORTING.map((algo, idx) => (
             <AlgoCard key={algo.id} algo={algo} isSearch={false} index={idx} />
          ))}
        </div>
      </section>

      <section id="searching" className="max-w-[1200px] mx-auto px-5 pb-9">
        <div className="flex items-center gap-3 mb-7 pb-3 border-b border-[var(--border)]">
          <h2 className="font-extrabold text-[24px]">搜索算法</h2>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(0,229,255,0.15)]">SEARCHING · {SEARCHING.length}</span>
        </div>
        <div>
          {SEARCHING.map((algo, idx) => (
             <AlgoCard key={algo.id} algo={algo} isSearch={true} index={idx} />
          ))}
        </div>
      </section>

      <footer className="text-center py-9 mt-9 px-5 border-t border-[var(--border)] text-[var(--text-muted)] text-[12px] font-mono">
        ALGO-VIZ PRO &mdash; 排序与搜索算法全景教学 · {ALL.length} 个算法 · 逐行代码讲解
      </footer>
    </main>
  );
}
