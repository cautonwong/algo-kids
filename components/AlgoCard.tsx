'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmDef, AlgorithmState } from '@/lib/algo-types';
import { highlightCode } from '@/lib/syntax';

function genArr(size: number, deterministic = false) {
  if (deterministic) {
    const base = [65, 23, 78, 41, 12, 89, 54, 32, 9, 71, 46, 83, 58, 27, 95, 14, 61, 38, 77, 50];
    return base.slice(0, size);
  }
  const mx = 90;
  const a: number[] = [];
  const u = new Set();
  while (a.length < size) {
    const v = Math.floor(Math.random() * mx) + 5;
    if (!u.has(v)) {
      u.add(v);
      a.push(v);
    }
  }
  return a;
}

function generateNewState(size: number, isSearch: boolean, algo: AlgorithmDef, deterministic = false) {
  const newArr = genArr(size, deterministic);
  if (isSearch) newArr.sort((a, b) => a - b);
  let t = null;
  if (isSearch) {
    t = deterministic ? newArr[Math.floor(newArr.length / 2)] : newArr[Math.floor(Math.random() * newArr.length)];
  }
  const s = isSearch ? algo.genSteps([...newArr], t ?? 0) : algo.genSteps([...newArr]);
  return {
    arr: newArr,
    target: t,
    steps: s,
  };
}

export default function AlgoCard({ algo, isSearch, index }: { algo: AlgorithmDef, isSearch: boolean, index: number }) {
  const [size, setSize] = useState(10);
  const [sliderVal, setSliderVal] = useState(350);
  
  const [state, setState] = useState(() => {
    return generateNewState(10, isSearch, algo, true);
  });

  const [curIdx, setCurIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const speedMs = 880 - sliderVal;

  const initData = useCallback(() => {
    setState(generateNewState(size, isSearch, algo));
    setCurIdx(0);
    setPlaying(false);
  }, [algo, isSearch, size]);

  useEffect(() => {
    // Generate fresh random data on mount to provide high quality interactive arrays
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (curIdx >= state.steps.length - 1) {
      const t = setTimeout(() => {
        setPlaying(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const tId = setTimeout(() => {
      setCurIdx(c => c + 1);
    }, speedMs);
    return () => clearTimeout(tId);
  }, [playing, curIdx, state.steps.length, speedMs]);

  const st = state.steps[curIdx] || { a: [], msg: '...' };

  useEffect(() => {
    if (st.line >= 0) {
      const el = containerRef.current?.querySelector(`[data-line="${st.line}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [st.line]);

  const handleSetTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v)) {
      setPlaying(false);
      const s = algo.genSteps([...state.arr], v);
      setState({
        arr: state.arr,
        target: v,
        steps: s,
      });
      setCurIdx(0);
    }
  };

  const handleSizeClick = (ns: number) => {
    setSize(ns);
    setState(generateNewState(ns, isSearch, algo));
    setCurIdx(0);
    setPlaying(false);
  };

  return (
    <div id={`algo-${algo.id}`} className="algo-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] mb-7 overflow-hidden opacity-0 animate-[fadeUp_0.5s_ease_forwards] hover:border-[rgba(0,229,255,0.2)] transition-colors">
      <div className="algo-head p-5 pb-3.5 flex items-center gap-3.5 flex-wrap">
        <span className="font-extrabold text-[32px] text-[rgba(0,229,255,0.12)] leading-none font-sans">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-extrabold text-[20px] font-sans">{algo.name}</h3>
          <div className="font-mono text-[12px] text-[var(--text-muted)] mt-px">
            {algo.en}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap font-mono text-[10.5px]">
          <span className="px-2 py-0.5 rounded-full border border-[rgba(255,112,67,0.3)] text-[var(--orange)] bg-[rgba(255,112,67,0.06)]">
            时间 {algo.avg}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[rgba(171,71,188,0.3)] text-[var(--purple)] bg-[rgba(171,71,188,0.06)]">
            空间 {algo.space}
          </span>
          {algo.stable !== null && (
            algo.stable ? 
              <span className="px-2 py-0.5 rounded-full border border-[rgba(102,187,106,0.3)] text-[var(--green)] bg-[rgba(102,187,106,0.06)]">稳定</span> : 
              <span className="px-2 py-0.5 rounded-full border border-[rgba(239,83,80,0.3)] text-[var(--red)] bg-[rgba(239,83,80,0.06)]">不稳定</span>
          )}
        </div>
      </div>
      <p className="px-6 pb-4 text-[14px] text-[var(--text-sec)] leading-[1.8]">{algo.desc}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-[var(--border)]">
        {/* Viz Panel */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col gap-2.5">
          <div className="viz-bars flex items-end gap-[2px] h-[170px] p-4 pb-1 bg-black/25 rounded-[var(--rs)] relative overflow-hidden">
            {st.a.map((v: number, i: number) => {
              let cls = "viz-bar flex-1 min-w-[3px] rounded-t-[2px] border border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.1)] relative";
              if (st.found === i) cls += " found";
              else if (st.srt?.includes(i)) cls += " sorted";
              else if (st.elim?.includes(i)) cls += " eliminated";
              else if (st.swp?.includes(i)) cls += " swapping";
              else if (st.cmp?.includes(i)) cls += " comparing";
              else if (st.pivot === i) cls += " pivot";
              
              if (st.ptrs?.l === i) cls += " pointer-l";
              if (st.ptrs?.r === i) cls += " pointer-r";
              if (st.ptrs?.mid === i) cls += " pointer-m";

              if (st.est === i) cls += " estimated";
              if (st.ptr === i && (algo.id === 'linear' || algo.id === 'jump')) cls += " active";

              const mx = Math.max(...st.a, 1);
              const heightPct = (v / mx) * 100 + '%';

              return (
                <div key={i} className={cls} style={{ height: heightPct }}>
                  <span className="bar-val absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[var(--text-muted)] whitespace-nowrap pointer-events-none">
                    {v}
                  </span>
                  {st.ptrs?.l === i && <span className="ptr-label">L</span>}
                  {st.ptrs?.r === i && <span className="ptr-label">R</span>}
                  {st.ptrs?.mid === i && <span className="ptr-label">M</span>}
                  {st.ptr === i && algo.id === 'linear' && <span className="ptr-label">i</span>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-[var(--rs)] bg-[var(--bg-card)] text-[var(--text-sec)] text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all" onClick={() => initData()} title="重置">
              ↺
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-[var(--rs)] bg-[var(--bg-card)] text-[var(--text-sec)] text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all" onClick={() => { setPlaying(false); setCurIdx(c => Math.max(c - 1, 0)); }} title="后退">
              ◀
            </button>
            <button className={`w-10 h-8 flex items-center justify-center border rounded-[var(--rs)] bg-[var(--bg-card)] text-[15px] transition-all ${playing ? 'text-[var(--yellow)] border-[rgba(255,202,40,0.3)]' : 'text-[var(--text-sec)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`} onClick={() => setPlaying(!playing)} title="播放/暂停">
              {playing ? '⏸' : '▶'}
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-[var(--rs)] bg-[var(--bg-card)] text-[var(--text-sec)] text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all" onClick={() => { setPlaying(false); setCurIdx(c => Math.min(c + 1, state.steps.length - 1)); }} title="前进 font-mono text-[10.5px] text-[var(--text-muted)]">
              ▶
            </button>

            <div className="flex items-center gap-1.5 ml-auto font-mono text-[10.5px] text-[var(--text-muted)]">
              <span>慢</span>
              <input type="range" min="80" max="800" value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} className="w-[70px] accent-[var(--accent)]" />
              <span>快</span>
            </div>

            <div className="flex gap-[3px] ml-1.5">
              {[8, 10, 15, 20].map(s => (
                <button key={s} onClick={() => handleSizeClick(s)} className={`px-2 py-0.5 font-mono text-[10.5px] border rounded-full transition-all ${size === s ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[var(--border)] text-[var(--text-sec)] bg-transparent hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>
                  {s}
                </button>
              ))}
            </div>

            {isSearch && (
              <div className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--text-sec)] ml-1.5">
                <span>目标:</span>
                <input type="number" value={state.target ?? ''} onChange={handleSetTarget} className="w-[54px] px-1.5 py-0.5 border border-[var(--border)] rounded-[var(--rs)] bg-black/30 text-[var(--text)] text-center focus:outline-none focus:border-[var(--accent)]" />
              </div>
            )}
          </div>

          <div className="text-[12.5px] text-[var(--text-sec)] min-h-[36px] flex items-center gap-2 flex-wrap mt-1">
            <span className="flex-1 text-[13px]">{st.msg}</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">步骤 {curIdx + 1}/{Math.max(1, state.steps.length)}</span>
          </div>
        </div>

        {/* Code Panel */}
        <div className="flex flex-col max-h-[400px] lg:max-h-[500px]" ref={containerRef}>
          <div className="flex-1 overflow-y-auto py-3 bg-[var(--bg-code)] font-mono text-[12px] leading-[1.8] scrollbar-thin scrollbar-thumb-[var(--border)]">
            {algo.code.split('\\n').map((line, i) => (
              <div key={i} data-line={i} className={`code-line flex py-[1px] pr-[14px] cursor-pointer transition-all border-l-[3px] ${st.line === i ? 'active' : 'border-transparent hover:bg-white/5'}`} onClick={() => { setPlaying(false); }}>
                <span className="line-num w-8 text-right pr-2.5 text-[var(--text-muted)] select-none shrink-0 text-[10.5px] font-mono transition-all">
                  {st.line === i ? '▶' : (i + 1)}
                </span>
                <span className="flex-1 whitespace-pre text-[var(--text-sec)]" dangerouslySetInnerHTML={{ __html: highlightCode(line) }} />
              </div>
            ))}
          </div>
          <div className="p-3 px-4 min-h-[48px] bg-[#0d0d22] border-t border-[var(--border)] text-[13px] text-[var(--text-sec)] leading-[1.65] flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-[18px] min-w-[18px] h-[18px] rounded-full bg-[var(--accent-dim)] text-[var(--accent)] font-sans font-bold italic mt-[2px] text-[10px]">i</span>
            <span key={st.line} className="explain-text animate-[fadeIn_0.25s_ease-out] flex-1">
              {algo.explains[st.line] || (st.line === -1 ? '算法执行完毕!' : '点击播放观看动画，直观理解执行过程')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 px-6 border-t border-[var(--border)] flex gap-[18px] flex-wrap text-[12.5px] text-[var(--text-sec)]">
        <div className="flex items-center gap-[5px]">
          <span className="font-mono text-[10.5px] text-[var(--text-muted)] uppercase tracking-wide">最好</span>
          <span className="text-[var(--text)] font-medium" dangerouslySetInnerHTML={{ __html: algo.best }} />
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="font-mono text-[10.5px] text-[var(--text-muted)] uppercase tracking-wide">平均</span>
          <span className="text-[var(--text)] font-medium" dangerouslySetInnerHTML={{ __html: algo.avg }} />
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="font-mono text-[10.5px] text-[var(--text-muted)] uppercase tracking-wide">最坏</span>
          <span className="text-[var(--text)] font-medium" dangerouslySetInnerHTML={{ __html: algo.worst }} />
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="font-mono text-[10.5px] text-[var(--text-muted)] uppercase tracking-wide">空间</span>
          <span className="text-[var(--text)] font-medium" dangerouslySetInnerHTML={{ __html: algo.space }} />
        </div>
      </div>
    </div>
  );
}
