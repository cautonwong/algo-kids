'use client';

import { useState, useRef } from 'react';
import { highlightCode, getTranslatedCode } from '@/lib/syntax';

// Visual structural step definition
interface InteractiveDSStep {
  line: number;
  explanation: string;
  highlightedIndices?: number[];
  highlightedNodeLevel?: { val: number | 'H'; level: number };
  highlightedBloomIdxs?: number[];
}

export default function DataStructuresPlayground() {
  const [activeTab, setActiveTab] = useState<'stack' | 'queue' | 'linkedlist' | 'array' | 'bst' | 'heap' | 'hash' | 'graph' | 'skiplist' | 'bloomfilter' | 'set' | 'zset' | 'bitmap'>('stack');
  const [lang, setLang] = useState<'c' | 'python' | 'javascript'>('c');

  // --- Skip List State & Engine ---
  const [skipListNodes, setSkipListNodes] = useState<{ val: number | 'H'; levels: boolean[] }[]>([
    { val: 'H', levels: [true, true, true, true] },
    { val:  8,  levels: [true, true, true, true] },
    { val: 19,  levels: [true, false, false, false] },
    { val: 31,  levels: [true, true, false, false] },
    { val: 43,  levels: [true, false, false, false] },
    { val: 57,  levels: [true, true, true, false] },
    { val: 72,  levels: [true, false, false, false] },
  ]);
  const [skipListSteps, setSkipListSteps] = useState<InteractiveDSStep[]>([]);
  const [skipListHistory, setSkipListHistory] = useState<{ nodes: { val: number | 'H'; levels: boolean[] }[]; stepIdx: number; hNodeLevel?: { val: number | 'H'; level: number } }[]>([]);
  const [currentSkipListStepIdx, setCurrentSkipListStepIdx] = useState<number>(-1);
  const [skipListInputValue, setSkipListInputValue] = useState<number>(31);
  const [hNodeLevel, setHNodeLevel] = useState<{ val: number | 'H'; level: number } | undefined>(undefined);

  // --- Bloom Filter State & Engine ---
  const [bloomBits, setBloomBits] = useState<number[]>(new Array(16).fill(0));
  const [bloomSteps, setBloomSteps] = useState<InteractiveDSStep[]>([]);
  const [bloomHistory, setBloomHistory] = useState<{ bits: number[]; stepIdx: number; hBloomIdxs?: number[] }[]>([]);
  const [currentBloomStepIdx, setCurrentBloomStepIdx] = useState<number>(-1);
  const [bloomInputValue, setBloomInputValue] = useState<number>(18);
  const [hBloomIdxs, setHBloomIdxs] = useState<number[]>([]);

  // --- Set State & Engine ---
  const [setA, setSetA] = useState<number[]>([12, 45, 67, 88]);
  const [setB, setSetB] = useState<number[]>([23, 45, 88, 99]);
  const [setSteps, setSetSteps] = useState<InteractiveDSStep[]>([]);
  const [setHistory, setSetHistory] = useState<{ setA: number[]; setB: number[]; stepIdx: number; hSetKeys?: string[] }[]>([]);
  const [currentSetStepIdx, setCurrentSetStepIdx] = useState<number>(-1);
  const [setInputValue, setSetInputValue] = useState<number>(55);
  const [hSetKeys, setHSetKeys] = useState<string[]>([]);

  // --- ZSet State & Engine ---
  const [zsetData, setZsetData] = useState<{ member: string; score: number }[]>([
    { member: 'Charlie', score: 68 },
    { member: 'Bob', score: 85 },
    { member: 'Alice', score: 92 },
  ]);
  const [zsetSteps, setZsetSteps] = useState<InteractiveDSStep[]>([]);
  const [zsetHistory, setZsetHistory] = useState<{ zset: { member: string; score: number }[]; stepIdx: number; hMember?: string }[]>([]);
  const [currentZsetStepIdx, setCurrentZsetStepIdx] = useState<number>(-1);
  const [zsetMemberValue, setZsetMemberValue] = useState<string>('David');
  const [zsetScoreValue, setZsetScoreValue] = useState<number>(80);
  const [hZsetMember, setHZsetMember] = useState<string | undefined>(undefined);

  // --- Bitmap State & Engine ---
  const [bitmapBits, setBitmapBits] = useState<number[]>(new Array(16).fill(0));
  const [bitmapSteps, setBitmapSteps] = useState<InteractiveDSStep[]>([]);
  const [bitmapHistory, setBitmapHistory] = useState<{ bits: number[]; stepIdx: number; hBitmapIdx?: number }[]>([]);
  const [currentBitmapStepIdx, setCurrentBitmapStepIdx] = useState<number>(-1);
  const [bitmapOffsetValue, setBitmapOffsetValue] = useState<number>(5);
  const [hBitmapIdx, setHBitmapIdx] = useState<number | undefined>(undefined);

  // --- Stack State & Engine ---
  const [stackData, setStackData] = useState({
    items: [23, 56, 12, 0, 0, 0], // MAX 6
    top: 2,
  });
  const [stackSteps, setStackSteps] = useState<InteractiveDSStep[]>([]);
  const [stackHistory, setStackHistory] = useState<{ data: typeof stackData; stepIdx: number }[]>([]);
  const [currentStackStepIdx, setCurrentStackStepIdx] = useState<number>(-1);
  const [stackInputValue, setStackInputValue] = useState<number>(45);

  // --- Queue State & Engine ---
  const [queueData, setQueueData] = useState({
    items: [14, 82, 33, null, null, null], // MAX 6
    front: 0,
    rear: 3,
  });
  const [queueSteps, setQueueSteps] = useState<InteractiveDSStep[]>([]);
  const [queueHistory, setQueueHistory] = useState<{ data: typeof queueData; stepIdx: number }[]>([]);
  const [currentQueueStepIdx, setCurrentQueueStepIdx] = useState<number>(-1);
  const [queueInputValue, setQueueInputValue] = useState<number>(71);

  // --- Linked List State & Engine ---
  const [linkedListData, setLinkedListData] = useState([
    { id: 'n1', val: 18, ptr: '0x2a04' },
    { id: 'n2', val: 92, ptr: '0x5b32' },
    { id: 'n3', val: 64, ptr: '0x9f18' },
  ]);
  const [llSteps, setLlSteps] = useState<InteractiveDSStep[]>([]);
  const [llHistory, setLlHistory] = useState<{ data: typeof linkedListData; stepIdx: number; tempNode?: any }[]>([]);
  const [currentLlStepIdx, setCurrentLlStepIdx] = useState<number>(-1);
  const [llInputValue, setLlInputValue] = useState<number>(85);
  const [tempLLNode, setTempLLNode] = useState<any>(null);

  // --- Static Array State & Engine ---
  const [arrayData, setArrayData] = useState({
    items: [15, 33, 48, 72, null, null], // MAX 6
    size: 4,
  });
  const [arraySteps, setArraySteps] = useState<InteractiveDSStep[]>([]);
  const [arrayHistory, setArrayHistory] = useState<{ data: typeof arrayData; stepIdx: number; targetIdx?: number; hoverIdxs?: number[] }[]>([]);
  const [currentArrayStepIdx, setCurrentArrayStepIdx] = useState<number>(-1);
  const [arrayIdxValue, setArrayIdxValue] = useState<number>(2);
  const [arrayValValue, setArrayValValue] = useState<number>(55);
  const [activeArrayTargetIdx, setActiveArrayTargetIdx] = useState<number | null>(null);
  const [arrayHoverIdxs, setArrayHoverIdxs] = useState<number[]>([]);

  // --- BST State & Engine ---
  const [bstData, setBstData] = useState<{ [idx: number]: number }>({
    1: 50,
    2: 30,
    3: 70,
    4: 15,
  });
  const [bstSteps, setBstSteps] = useState<InteractiveDSStep[]>([]);
  const [bstHistory, setBstHistory] = useState<{ data: typeof bstData; stepIdx: number; highlightedIdxs?: number[] }[]>([]);
  const [currentBstStepIdx, setCurrentBstStepIdx] = useState<number>(-1);
  const [bstInputValue, setBstInputValue] = useState<number>(45);
  const [highlightedBstIdxs, setHighlightedBstIdxs] = useState<number[]>([]);

  // --- Heap State & Engine ---
  const [heapData, setHeapData] = useState<number[]>([90, 70, 80, 40, 30, 60]); // MAX 7
  const [heapSteps, setHeapSteps] = useState<InteractiveDSStep[]>([]);
  const [heapHistory, setHeapHistory] = useState<{ data: number[]; stepIdx: number; highlightedIdxs?: number[] }[]>([]);
  const [currentHeapStepIdx, setCurrentHeapStepIdx] = useState<number>(-1);
  const [heapInputValue, setHeapInputValue] = useState<number>(75);
  const [highlightedHeapIdxs, setHighlightedHeapIdxs] = useState<number[]>([]);

  // --- Hash Table State & Engine ---
  const [hashData, setHashData] = useState<{ [bucketIdx: number]: number[] }>({
    0: [40],
    1: [21, 11],
    2: [32],
    3: [8],
    4: [44],
  });
  const [hashSteps, setHashSteps] = useState<InteractiveDSStep[]>([]);
  const [hashHistory, setHashHistory] = useState<{ data: typeof hashData; stepIdx: number; activeBucketIdx?: number | null }[]>([]);
  const [currentHashStepIdx, setCurrentHashStepIdx] = useState<number>(-1);
  const [hashInputValue, setHashInputValue] = useState<number>(18);
  const [activeHashBucketIdx, setActiveHashBucketIdx] = useState<number | null>(null);

  // --- Graph State & Engine ---
  const [graphAdj, setGraphAdj] = useState<number[][]>([
    [0, 1, 1, 0], // Node A (0)
    [1, 0, 0, 1], // Node B (1)
    [1, 0, 0, 1], // Node C (2)
    [0, 1, 1, 0], // Node D (3)
  ]);
  const [graphVisited, setGraphVisited] = useState<boolean[]>([false, false, false, false]);
  const [graphQueue, setGraphQueue] = useState<number[]>([]);
  const [graphSteps, setGraphSteps] = useState<InteractiveDSStep[]>([]);
  const [graphHistory, setGraphHistory] = useState<{ adj: number[][]; visited: boolean[]; queue: number[]; stepIdx: number }[]>([]);
  const [currentGraphStepIdx, setCurrentGraphStepIdx] = useState<number>(-1);

  // Refs for scrolling code panels
  const codePanelRef = useRef<HTMLDivElement>(null);

  // Scroll active code line into view
  const autoScrollCode = (activeLine: number) => {
    if (codePanelRef.current) {
      const activeElement = codePanelRef.current.querySelector(`[data-ds-line="${activeLine}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // -----------------------------------------------------------------
  // 1. STACK METHODS
  // -----------------------------------------------------------------
  const handleStackPush = () => {
    const val = stackInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];
    const MAX = 6;
    const currentTop = stackData.top;
    steps.push({ line: 5, explanation: `[1] 开始 push(${val})。检查 top 是否达到了最高限 MAX-1 (${MAX-1})。当前 top = ${currentTop}.` });
    if (currentTop >= MAX - 1) {
      steps.push({ line: 6, explanation: `[拒绝] top 达到最大值，说明栈溢出 (Stack Overflow)！` });
      setStackSteps(steps);
      setCurrentStackStepIdx(0);
      return;
    }
    steps.push({ line: 8, explanation: `[2] 空间足够，自增栈顶指针 top++ (从 ${currentTop} 变为 ${currentTop + 1})。` });
    steps.push({ line: 9, explanation: `[3] 把值写入 stack[top]：将数值 ${val} 分配给 stack[${currentTop + 1}]。` });
    steps.push({ line: -1, explanation: `[4] push 成功！新数据已置于最新栈顶。` });
    setStackSteps(steps);
    setCurrentStackStepIdx(0);
  };

  const handleStackPop = () => {
    const steps: InteractiveDSStep[] = [];
    const currentTop = stackData.top;
    steps.push({ line: 13, explanation: `[1] 开始 pop()。检查栈是否为空 (即 top < 0)。当前 top = ${currentTop}.` });
    if (currentTop < 0) {
      steps.push({ line: 14, explanation: `[拒绝] 栈已为空，发生栈下溢错误 (Stack Underflow)！` });
      setStackSteps(steps);
      setCurrentStackStepIdx(0);
      return;
    }
    steps.push({ line: 16, explanation: `[2] 取出栈顶数值 val = stack[top] (这里是数值: ${stackData.items[currentTop]})。` });
    steps.push({ line: 17, explanation: `[3] 自减退居首指 top-- (从 ${currentTop} 在逻辑上变动为 ${currentTop - 1})。` });
    steps.push({ line: 18, explanation: `[4] 弹出成功！安全取回原栈顶项。` });
    setStackSteps(steps);
    setCurrentStackStepIdx(0);
  };

  const nextStackStep = () => {
    if (currentStackStepIdx < 0 || currentStackStepIdx >= stackSteps.length) return;
    const nextIdx = currentStackStepIdx + 1;
    if (nextIdx >= stackSteps.length) {
      setCurrentStackStepIdx(-1);
      setStackSteps([]);
      return;
    }
    setStackHistory(prev => [...prev, { data: { ...stackData, items: [...stackData.items] }, stepIdx: currentStackStepIdx }]);
    const activeStep = stackSteps[nextIdx];
    if (activeStep.explanation.includes('top++')) {
      setStackData(prev => ({ ...prev, top: prev.top + 1 }));
    } else if (activeStep.explanation.includes('stack[top]')) {
      const val = stackInputValue;
      setStackData(prev => {
        const newItems = [...prev.items];
        newItems[prev.top] = val;
        return { ...prev, items: newItems };
      });
    } else if (activeStep.explanation.includes('top--')) {
      setStackData(prev => ({ ...prev, top: prev.top - 1 }));
    }
    setCurrentStackStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevStackStep = () => {
    if (stackHistory.length === 0) return;
    const prev = stackHistory[stackHistory.length - 1];
    setStackData(prev.data);
    setCurrentStackStepIdx(prev.stepIdx);
    setStackHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(stackSteps[prev.stepIdx].line);
  };

  const resetStackState = () => {
    setStackData({ items: [23, 56, 12, 0, 0, 0], top: 2 });
    setStackSteps([]);
    setStackHistory([]);
    setCurrentStackStepIdx(-1);
  };

  // -----------------------------------------------------------------
  // 2. QUEUE METHODS
  // -----------------------------------------------------------------
  const handleQueueEnqueue = () => {
    const val = queueInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];
    const MAX = 6;
    const currentRear = queueData.rear;
    steps.push({ line: 5, explanation: `[1] 开始 enqueue(${val})。检查 rear 指针是否达到了数组最大物理限制 (MAX = ${MAX})。当前 rear = ${currentRear}.` });
    if (currentRear >= MAX) {
      steps.push({ line: 6, explanation: `[拒绝] rear >= MAX，队列无空闲空间，无法继续入队！ (在非循环队列下会导致无法复用前面出队的空档)。` });
      setQueueSteps(steps);
      setCurrentQueueStepIdx(0);
      return;
    }
    steps.push({ line: 8, explanation: `[2] 进行入队赋值：将数值放置于末尾槽 queue[rear] = ${val}。` });
    steps.push({ line: 9, explanation: `[3] 自增队尾指针 rear++ (rear 变为 ${currentRear + 1}) 指向后一空白位。` });
    steps.push({ line: -1, explanation: `[4] 入队完成！新项被挂靠至队尾。` });
    setQueueSteps(steps);
    setCurrentQueueStepIdx(0);
  };

  const handleQueueDequeue = () => {
    const steps: InteractiveDSStep[] = [];
    const currentFront = queueData.front;
    const currentRear = queueData.rear;
    steps.push({ line: 13, explanation: `[1] 开始 dequeue()。检验队头 front == 队尾 rear 是否成立。当前 front = ${currentFront}, rear = ${currentRear}.` });
    if (currentFront === currentRear) {
      steps.push({ line: 14, explanation: `[拒绝] 两者相等代表没有可取出元素，队列已空 (Queue Empty)！` });
      setQueueSteps(steps);
      setCurrentQueueStepIdx(0);
      return;
    }
    steps.push({ line: 16, explanation: `[2] 获得当前需要出队的元素数值：val = queue[front] (提取得出：${queueData.items[currentFront]})。` });
    steps.push({ line: 17, explanation: `[3] 自增队首指针：front++ (front 移动指向下一索引 ${currentFront + 1})。` });
    steps.push({ line: 18, explanation: `[4] 出队顺利！头数据被移出队列逻辑。` });
    setQueueSteps(steps);
    setCurrentQueueStepIdx(0);
  };

  const nextQueueStep = () => {
    if (currentQueueStepIdx < 0 || currentQueueStepIdx >= queueSteps.length) return;
    const nextIdx = currentQueueStepIdx + 1;
    if (nextIdx >= queueSteps.length) {
      setCurrentQueueStepIdx(-1);
      setQueueSteps([]);
      return;
    }
    setQueueHistory(prev => [...prev, { data: { ...queueData, items: [...queueData.items] }, stepIdx: currentQueueStepIdx }]);
    const activeStep = queueSteps[nextIdx];
    if (activeStep.explanation.includes('queue[rear] =')) {
      const val = queueInputValue;
      setQueueData(prev => {
        const newItems = [...prev.items];
        newItems[prev.rear] = val;
        return { ...prev, items: newItems };
      });
    } else if (activeStep.explanation.includes('rear++')) {
      setQueueData(prev => ({ ...prev, rear: prev.rear + 1 }));
    } else if (activeStep.explanation.includes('front++')) {
      setQueueData(prev => ({ ...prev, front: prev.front + 1 }));
    }
    setCurrentQueueStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevQueueStep = () => {
    if (queueHistory.length === 0) return;
    const prev = queueHistory[queueHistory.length - 1];
    setQueueData(prev.data);
    setCurrentQueueStepIdx(prev.stepIdx);
    setQueueHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(queueSteps[prev.stepIdx].line);
  };

  const resetQueueState = () => {
    setQueueData({ items: [14, 82, 33, null, null, null], front: 0, rear: 3 });
    setQueueSteps([]);
    setQueueHistory([]);
    setCurrentQueueStepIdx(-1);
  };

  // -----------------------------------------------------------------
  // 3. LINKED LIST METHODS
  // -----------------------------------------------------------------
  const handleLLInsertHead = () => {
    const val = llInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];
    const newHex = '0x' + Math.floor(Math.random() * 60000 + 4000).toString(16).padStart(4, '0');
    steps.push({ line: 7, explanation: `[1] 执行 malloc 分配一个 Node 结构体物理内存单元：新节点地址空间赋予给 temp 指针 temp = ${newHex}。` });
    steps.push({ line: 8, explanation: `[2] 对数据域成员项写值：temp->data = ${val}。` });
    steps.push({ line: 9, explanation: `[3] 挂接头地址：令 temp->next 指向老链表在全局的头节点 head (${linkedListData[0]?.ptr || 'NULL'})。` });
    steps.push({ line: 10, explanation: `[4] 更新表头关系：让 head 指针重新指向该新临时地址 temp (${newHex})，从而让它升级成最头部。` });
    steps.push({ line: -1, explanation: `[5] 插入完成！新节点已稳固地挂接于头部。` });
    setLlSteps(steps);
    setCurrentLlStepIdx(0);
    setTempLLNode({ id: 'tempNode', val, ptr: newHex });
  };

  const handleLLDeleteHead = () => {
    const steps: InteractiveDSStep[] = [];
    if (linkedListData.length === 0) {
      steps.push({ line: 14, explanation: `[已空] 检查头指针为 NULL，无法继续切除首项！` });
      setLlSteps(steps);
      setCurrentLlStepIdx(0);
      return;
    }
    steps.push({ line: 14, explanation: `[1] 开始头部切割。检查 head 不为空。当前 head 指向 ${linkedListData[0].ptr}。` });
    steps.push({ line: 15, explanation: `[2] 用临时局部游指锁定头地址：temp = head (${linkedListData[0].ptr})。` });
    steps.push({ line: 16, explanation: `[3] 转移头指针重定向：令 head 指向原来第一个节点的 next (移动并指向 ${linkedListData[1]?.ptr || 'NULL'})。` });
    steps.push({ line: 17, explanation: `[4] 内存释放核心：调用 free(temp) 将前节点的物理堆地址归还。彻底杜绝堆内存泄漏。` });
    steps.push({ line: -1, explanation: `[5] 头删成功！老头部已被脱机，剩余节点内存完美。` });
    setLlSteps(steps);
    setCurrentLlStepIdx(0);
  };

  const nextLlStep = () => {
    if (currentLlStepIdx < 0 || currentLlStepIdx >= llSteps.length) return;
    const nextIdx = currentLlStepIdx + 1;
    if (nextIdx >= llSteps.length) {
      setCurrentLlStepIdx(-1);
      setLlSteps([]);
      setTempLLNode(null);
      return;
    }
    setLlHistory(prev => [...prev, { data: [...linkedListData], stepIdx: currentLlStepIdx, tempNode: tempLLNode }]);
    const activeStep = llSteps[nextIdx];
    if (activeStep.explanation.includes('head 指针重新指向')) {
      if (tempLLNode) {
        setLinkedListData(prev => [tempLLNode, ...prev]);
        setTempLLNode(null);
      }
    } else if (activeStep.explanation.includes('head 指向原来第一个节点')) {
      setLinkedListData(prev => prev.slice(1));
    }
    setCurrentLlStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevLlStep = () => {
    if (llHistory.length === 0) return;
    const prev = llHistory[llHistory.length - 1];
    setLinkedListData(prev.data);
    setCurrentLlStepIdx(prev.stepIdx);
    setTempLLNode(prev.tempNode || null);
    setLlHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(llSteps[prev.stepIdx].line);
  };

  const resetLlState = () => {
    setLinkedListData([
      { id: 'n1', val: 18, ptr: '0x2a04' },
      { id: 'n2', val: 92, ptr: '0x5b32' },
      { id: 'n3', val: 64, ptr: '0x9f18' },
    ]);
    setLlSteps([]);
    setLlHistory([]);
    setCurrentLlStepIdx(-1);
    setTempLLNode(null);
  };

  // -----------------------------------------------------------------
  // 4. SEQUENTIAL LIST (ARRAY) METHODS
  // -----------------------------------------------------------------
  const handleArrayInsert = () => {
    const idx = arrayIdxValue;
    const val = arrayValValue;
    const steps: InteractiveDSStep[] = [];
    const MAX = 6;
    const currentSize = arrayData.size;

    steps.push({ line: 5, explanation: `[1] 开始 insert(${idx}, ${val})。校验是否超出了 MAX (${MAX}) 及索引 [0, ${currentSize}] 。` });
    if (currentSize >= MAX || idx < 0 || idx > currentSize) {
      steps.push({ line: 5, explanation: `[拒绝] 合法性检验未通过 (越界或数组已满)！` });
      setArraySteps(steps);
      setCurrentArrayStepIdx(0);
      return;
    }
    steps.push({ line: 6, explanation: `[2] 启动右移：由于插入了中部值，必须用 for 循环把位置从 ${currentSize - 1} 到 ${idx} 的元素整体向右侧复制。` });
    for (let i = currentSize - 1; i >= idx; i--) {
      steps.push({
        line: 7,
        explanation: `右移数据：把位置 arr[${i}] (${arrayData.items[i]}) 数据拷贝移至下一位 arr[${i+1}]。`,
        highlightedIndices: [i, i + 1],
      });
    }
    steps.push({ line: 9, explanation: `[3] 给空出槽赋值：在已经空出的目标指定下标插入：arr[${idx}] = ${val}。`, highlightedIndices: [idx] });
    steps.push({ line: 10, explanation: `[4] 增加表大小：size++ (逻辑长度由原先的 ${currentSize} 变成 ${currentSize + 1})。` });
    setArraySteps(steps);
    setCurrentArrayStepIdx(0);
  };

  const nextArrayStep = () => {
    if (currentArrayStepIdx < 0 || currentArrayStepIdx >= arraySteps.length) return;
    const nextIdx = currentArrayStepIdx + 1;
    if (nextIdx >= arraySteps.length) {
      setCurrentArrayStepIdx(-1);
      setArraySteps([]);
      setActiveArrayTargetIdx(null);
      setArrayHoverIdxs([]);
      return;
    }
    setArrayHistory(prev => [
      ...prev,
      {
        data: { ...arrayData, items: [...arrayData.items] },
        stepIdx: currentArrayStepIdx,
        targetIdx: activeArrayTargetIdx ?? undefined,
        hoverIdxs: [...arrayHoverIdxs],
      },
    ]);
    const arrStep = arraySteps[nextIdx];
    if (arrStep.highlightedIndices) {
      setArrayHoverIdxs(arrStep.highlightedIndices);
    }
    if (arrStep.explanation.includes('数据拷贝移至下一位') && arrStep.highlightedIndices && arrStep.highlightedIndices.length === 2) {
      const [fromIdx, toIdx] = arrStep.highlightedIndices;
      setArrayData(prev => {
        const newItems = [...prev.items];
        newItems[toIdx] = newItems[fromIdx];
        return { ...prev, items: newItems };
      });
    } else if (arrStep.explanation.includes('给空出槽赋值') || arrStep.explanation.includes('arr[idx] =')) {
      const idx = arrayIdxValue;
      const val = arrayValValue;
      setArrayData(prev => {
        const newItems = [...prev.items];
        newItems[idx] = val;
        return { ...prev, items: newItems };
      });
      setActiveArrayTargetIdx(idx);
    } else if (arrStep.explanation.includes('size++')) {
      setArrayData(prev => ({ ...prev, size: prev.size + 1 }));
    }
    setCurrentArrayStepIdx(nextIdx);
    autoScrollCode(arrStep.line);
  };

  const prevArrayStep = () => {
    if (arrayHistory.length === 0) return;
    const prev = arrayHistory[arrayHistory.length - 1];
    setArrayData(prev.data);
    setCurrentArrayStepIdx(prev.stepIdx);
    setActiveArrayTargetIdx(prev.targetIdx !== undefined ? prev.targetIdx : null);
    setArrayHoverIdxs(prev.hoverIdxs || []);
    setArrayHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(arraySteps[prev.stepIdx].line);
  };

  const resetArrayState = () => {
    setArrayData({ items: [15, 33, 48, 72, null, null], size: 4 });
    setArraySteps([]);
    setArrayHistory([]);
    setCurrentArrayStepIdx(-1);
    setActiveArrayTargetIdx(null);
    setArrayHoverIdxs([]);
  };

  // -----------------------------------------------------------------
  // 5. BST METHODS
  // -----------------------------------------------------------------
  const handleBSTInsert = () => {
    const val = bstInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];
    const tempBst = { ...bstData };
    let curr = 1;

    steps.push({ line: 6, explanation: `[1] 开始插入 ${val}。检查树根节点。` });
    while (curr <= 7) {
      const nodeVal = tempBst[curr];
      if (nodeVal === undefined || nodeVal === null) {
        steps.push({ line: 7, explanation: `[2] 索引位置 [${curr}] 为空，作为子项插入该节点。`, highlightedIndices: [curr] });
        break;
      }
      if (val === nodeVal) {
        steps.push({ line: 0, explanation: `数值 ${val} 与已有节点冲突，BST 无重复。终止。` });
        break;
      } else if (val < nodeVal) {
        const next = 2 * curr;
        steps.push({ line: 9, explanation: `比较 ${val} < ${nodeVal}，决定走向当前节点的左子树 (索引 [${next}])。`, highlightedIndices: [curr] });
        curr = next;
      } else {
        const next = 2 * curr + 1;
        steps.push({ line: 11, explanation: `比较 ${val} > ${nodeVal}，决定走向当前节点的右子树 (索引 [${next}])。`, highlightedIndices: [curr] });
        curr = next;
      }
    }

    if (curr > 7) {
      steps.push({ line: 0, explanation: `[溢出] 索引超过了 3 层深度，不影响算法原理。请直接重置。` });
    } else {
      steps.push({ line: -1, explanation: `[完成] 节点 ${val} 顺利插入至 [${curr}] 槽中。` });
    }
    setBstSteps(steps);
    setCurrentBstStepIdx(0);
    setHighlightedBstIdxs([1]);
  };

  const nextBSTStep = () => {
    if (currentBstStepIdx < 0 || currentBstStepIdx >= bstSteps.length) return;
    const nextIdx = currentBstStepIdx + 1;
    if (nextIdx >= bstSteps.length) {
      setCurrentBstStepIdx(-1);
      setBstSteps([]);
      setHighlightedBstIdxs([]);
      return;
    }
    setBstHistory(prev => [...prev, { data: { ...bstData }, stepIdx: currentBstStepIdx, highlightedIdxs: [...highlightedBstIdxs] }]);
    const activeStep = bstSteps[nextIdx];
    if (activeStep.highlightedIndices) {
      setHighlightedBstIdxs(activeStep.highlightedIndices);
    }
    if (activeStep.explanation.includes('作为子项插入') && activeStep.highlightedIndices && activeStep.highlightedIndices.length > 0) {
      const val = bstInputValue;
      const slot = activeStep.highlightedIndices[0];
      setBstData(prev => ({ ...prev, [slot]: val }));
    }
    setCurrentBstStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevBSTStep = () => {
    if (bstHistory.length === 0) return;
    const prev = bstHistory[bstHistory.length - 1];
    setBstData(prev.data);
    setCurrentBstStepIdx(prev.stepIdx);
    setHighlightedBstIdxs(prev.highlightedIdxs || []);
    setBstHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(bstSteps[prev.stepIdx].line);
  };

  const resetBstState = () => {
    setBstData({ 1: 50, 2: 30, 3: 70, 4: 15 });
    setBstSteps([]);
    setBstHistory([]);
    setCurrentBstStepIdx(-1);
    setHighlightedBstIdxs([]);
  };

  // -----------------------------------------------------------------
  // 6. HEAP METHODS
  // -----------------------------------------------------------------
  const handleHeapInsert = () => {
    const val = heapInputValue;
    if (val < 1 || val > 99) return;
    if (heapData.length >= 7) {
      setHeapSteps([{ line: 5, explanation: `[1] 堆数组已达最大层容量 7。请先重置堆结构。` }]);
      setCurrentHeapStepIdx(0);
      return;
    }
    const steps: InteractiveDSStep[] = [];
    const tempHeap = [...heapData];
    const len = tempHeap.length;

    // Step 0: Initial state (Preparation)
    steps.push({ line: 5, explanation: `[1] 准备将新数值 ${val} 插入大顶二叉堆。` });

    // Step 1: Append
    steps.push({ line: 6, explanation: `[2] 首先将新值 ${val} 追加到堆数组末尾槽号 heap[${len}]。`, highlightedIndices: [len] });
    tempHeap.push(val);

    let i = len;
    while (i > 0) {
      const parentIdx = Math.floor((i - 1) / 2);
      if (tempHeap[i] > tempHeap[parentIdx]) {
        steps.push({
          line: 9,
          explanation: `[上滤] 子节点 heap[${i}] (${tempHeap[i]}) > 父节点 heap[${parentIdx}] (${tempHeap[parentIdx]})，不符合大顶堆特性，故对调两侧。`,
          highlightedIndices: [i, parentIdx]
        });
        const t = tempHeap[i];
        tempHeap[i] = tempHeap[parentIdx];
        tempHeap[parentIdx] = t;
        i = parentIdx;
      } else {
        steps.push({
          line: 10,
          explanation: `[上滤] 节点 heap[${i}] (${tempHeap[i]}) <= 父节点 heap[${parentIdx}] (${tempHeap[parentIdx]})，满足大顶堆属性，过滤结束。`,
          highlightedIndices: [i, parentIdx]
        });
        break;
      }
    }
    steps.push({ line: -1, explanation: `[完成] 大顶堆的结构调整以及上滤流程全部大功告成！` });
    setHeapSteps(steps);
    setCurrentHeapStepIdx(0);
    setHighlightedHeapIdxs([]);
  };

  const nextHeapStep = () => {
    if (currentHeapStepIdx < 0 || currentHeapStepIdx >= heapSteps.length) return;
    const nextIdx = currentHeapStepIdx + 1;
    if (nextIdx >= heapSteps.length) {
      setCurrentHeapStepIdx(-1);
      setHeapSteps([]);
      setHighlightedHeapIdxs([]);
      return;
    }
    setHeapHistory(prev => [...prev, { data: [...heapData], stepIdx: currentHeapStepIdx, highlightedIdxs: [...highlightedHeapIdxs] }]);
    const activeStep = heapSteps[nextIdx];
    if (activeStep.highlightedIndices) {
      setHighlightedHeapIdxs(activeStep.highlightedIndices);
    }
    if (activeStep.explanation.includes('追加到堆数组末尾槽号')) {
      const val = heapInputValue;
      setHeapData(prev => [...prev, val]);
    } else if (activeStep.explanation.includes('不符合大顶堆特性，故对调两侧')) {
      if (activeStep.highlightedIndices && activeStep.highlightedIndices.length === 2) {
        const [a, b] = activeStep.highlightedIndices;
        setHeapData(prev => {
          const nextHeap = [...prev];
          const t = nextHeap[a];
          nextHeap[a] = nextHeap[b];
          nextHeap[b] = t;
          return nextHeap;
        });
      }
    }
    setCurrentHeapStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevHeapStep = () => {
    if (heapHistory.length === 0) return;
    const prev = heapHistory[heapHistory.length - 1];
    setHeapData(prev.data);
    setCurrentHeapStepIdx(prev.stepIdx);
    setHighlightedHeapIdxs(prev.highlightedIdxs || []);
    setHeapHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(heapSteps[prev.stepIdx].line);
  };

  const resetHeapState = () => {
    setHeapData([90, 70, 80, 40, 30, 60]);
    setHeapSteps([]);
    setHeapHistory([]);
    setCurrentHeapStepIdx(-1);
    setHighlightedHeapIdxs([]);
  };

  // -----------------------------------------------------------------
  // 7. HASH TABLE METHODS
  // -----------------------------------------------------------------
  const handleHashInsert = () => {
    const val = hashInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];
    const hashIdx = val % 5;
    steps.push({ line: 6, explanation: `[1] 计算哈希数组槽：idx = key % 5 = ${val} % 5 = ${hashIdx}。`, highlightedIndices: [hashIdx] });
    steps.push({ line: 7, explanation: `[2] malloc 分配新节点并将 val = ${val} 赋给数据域。`, highlightedIndices: [hashIdx] });
    steps.push({ line: 8, explanation: `[3] 把新链表指针 next 挂接在 slots[${hashIdx}] 起始链首。`, highlightedIndices: [hashIdx] });
    steps.push({ line: 9, explanation: `[4] 重新让 slots[${hashIdx}] 根头指针重新指向本节点，完成拉链法挂接。`, highlightedIndices: [hashIdx] });
    setHashSteps(steps);
    setCurrentHashStepIdx(0);
    setActiveHashBucketIdx(hashIdx);
  };

  const nextHashStep = () => {
    if (currentHashStepIdx < 0 || currentHashStepIdx >= hashSteps.length) return;
    const nextIdx = currentHashStepIdx + 1;
    if (nextIdx >= hashSteps.length) {
      setCurrentHashStepIdx(-1);
      setHashSteps([]);
      setActiveHashBucketIdx(null);
      return;
    }
    const cloned: { [bucketIdx: number]: number[] } = {};
    Object.keys(hashData).forEach(k => { cloned[parseInt(k)] = [...hashData[parseInt(k)]]; });
    setHashHistory(prev => [...prev, { data: cloned, stepIdx: currentHashStepIdx, activeBucketIdx: activeHashBucketIdx }]);
    const activeStep = hashSteps[nextIdx];
    if (activeStep.highlightedIndices) {
      setActiveHashBucketIdx(activeStep.highlightedIndices[0]);
    }
    if (activeStep.explanation.includes('完成拉链法挂接') && activeStep.highlightedIndices && activeStep.highlightedIndices.length > 0) {
      const val = hashInputValue;
      const hashIdx = activeStep.highlightedIndices[0];
      setHashData(prev => {
        const nextBuckets = { ...prev };
        nextBuckets[hashIdx] = [val, ...(nextBuckets[hashIdx] || [])];
        return nextBuckets;
      });
    }
    setCurrentHashStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevHashStep = () => {
    if (hashHistory.length === 0) return;
    const prev = hashHistory[hashHistory.length - 1];
    setHashData(prev.data);
    setCurrentHashStepIdx(prev.stepIdx);
    setActiveHashBucketIdx(prev.activeBucketIdx !== undefined ? prev.activeBucketIdx : null);
    setHashHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(hashSteps[prev.stepIdx].line);
  };

  const resetHashState = () => {
    setHashData({ 0: [40], 1: [21, 11], 2: [32], 3: [8], 4: [44] });
    setHashSteps([]);
    setHashHistory([]);
    setCurrentHashStepIdx(-1);
    setActiveHashBucketIdx(null);
  };

  // -----------------------------------------------------------------
  // 8. GRAPH BFS METHODS
  // -----------------------------------------------------------------
  const handleGraphRunBFS = () => {
    const steps: InteractiveDSStep[] = [];
    const visited = [false, false, false, false];
    const queue: number[] = [];

    steps.push({ line: 5, explanation: `[1] 开始 A (0) 的 4阶图 BFS 表遍历评估。visited 数组清空。` });
    visited[0] = true;
    queue.push(0);
    steps.push({ line: 6, explanation: `[2] A 点已读，标记 visited[0]=1，且装入 queue [A]。`, highlightedIndices: [0] });

    while (queue.length > 0) {
      const u = queue[0];
      const name = ['A', 'B', 'C', 'D'][u];
      steps.push({ line: 8, explanation: `[3] 出队头部 ${name} (索引 ${u})。搜查它未访的所有出边邻接节点。`, highlightedIndices: [u] });
      queue.shift();

      for (let v = 0; v < 4; v++) {
        if (graphAdj[u][v] === 1) {
          const adjName = ['A', 'B', 'C', 'D'][v];
          if (!visited[v]) {
            visited[v] = true;
            queue.push(v);
            steps.push({
              line: 11,
              explanation: `邻点 A[${u}][${v}]=1。发现新邻点 ${adjName} 且未访，做 visited 标记、置入对列项。`,
              highlightedIndices: [u, v]
            });
          }
        }
      }
    }
    steps.push({ line: -1, explanation: `[4] BFS 队列为空，全图关联项搜查告捷！` });
    setGraphSteps(steps);
    setCurrentGraphStepIdx(0);
    setGraphVisited([false, false, false, false]);
    setGraphQueue([]);
  };

  const nextGraphStep = () => {
    if (currentGraphStepIdx < 0 || currentGraphStepIdx >= graphSteps.length) return;
    const nextIdx = currentGraphStepIdx + 1;
    if (nextIdx >= graphSteps.length) {
      setCurrentGraphStepIdx(-1);
      setGraphSteps([]);
      setGraphVisited([false, false, false, false]);
      setGraphQueue([]);
      return;
    }
    setGraphHistory(prev => [
      ...prev,
      {
        adj: graphAdj.map(r => [...r]),
        visited: [...graphVisited],
        queue: [...graphQueue],
        stepIdx: currentGraphStepIdx
      }
    ]);
    const activeStep = graphSteps[nextIdx];
    if (activeStep.explanation.includes('装入 queue')) {
      setGraphVisited([true, false, false, false]);
      setGraphQueue([0]);
    } else if (activeStep.explanation.includes('出队头部')) {
      setGraphQueue(prev => prev.slice(1));
    } else if (activeStep.explanation.includes('发现新邻点') && activeStep.highlightedIndices && activeStep.highlightedIndices.length === 2) {
      const v = activeStep.highlightedIndices[1];
      setGraphVisited(prev => {
        const nextV = [...prev];
        nextV[v] = true;
        return nextV;
      });
      setGraphQueue(prev => [...prev, v]);
    }
    setCurrentGraphStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevGraphStep = () => {
    if (graphHistory.length === 0) return;
    const prev = graphHistory[graphHistory.length - 1];
    setGraphAdj(prev.adj);
    setGraphVisited(prev.visited);
    setGraphQueue(prev.queue);
    setCurrentGraphStepIdx(prev.stepIdx);
    setGraphHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(graphSteps[prev.stepIdx].line);
  };

  const toggleGraphEdge = (u: number, v: number) => {
    if (u === v) return;
    setGraphAdj(prev => {
      const nextAdj = prev.map(row => [...row]);
      nextAdj[u][v] = nextAdj[u][v] === 1 ? 0 : 1;
      nextAdj[v][u] = nextAdj[u][v]; // 无向图对称
      return nextAdj;
    });
  };

  const resetGraphState = () => {
    setGraphAdj([
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [0, 1, 1, 0],
    ]);
    setGraphVisited([false, false, false, false]);
    setGraphQueue([]);
    setGraphSteps([]);
    setGraphHistory([]);
    setCurrentGraphStepIdx(-1);
  };

  // -----------------------------------------------------------------
  // 9. SKIP LIST METHODS
  // -----------------------------------------------------------------
  const handleSkipListSearch = () => {
    const target = skipListInputValue;
    const steps: InteractiveDSStep[] = [];

    // Begin path search
    steps.push({
      line: 7,
      explanation: `[开始] 在跳表最上层 Level 3 头部节点(H)开始检索目标值 ${target}。`,
      highlightedNodeLevel: { val: 'H', level: 3 }
    });

    let currIdx = 0; // Starts at 'H'
    let currLevel = 3;
    let found = false;

    while (currLevel >= 0) {
      const currNode = skipListNodes[currIdx];
      // Find the next node in the same level
      let nextIdx = -1;
      for (let j = currIdx + 1; j < skipListNodes.length; j++) {
        if (skipListNodes[j].levels[currLevel]) {
          nextIdx = j;
          break;
        }
      }

      if (nextIdx !== -1) {
        const nextNode = skipListNodes[nextIdx];
        const nextVal = nextNode.val as number;
        if (nextVal < target) {
          steps.push({
            line: 10,
            explanation: `[右跨越] Level ${currLevel}: 下个节点值为 ${nextVal} < ${target}。向右跳转。`,
            highlightedNodeLevel: { val: nextNode.val, level: currLevel }
          });
          currIdx = nextIdx;
        } else if (nextVal === target) {
          steps.push({
            line: 13,
            explanation: `[命中] Level ${currLevel}: 下个节点正好是目标值 ${target}！正在跨越跳转。`,
            highlightedNodeLevel: { val: nextNode.val, level: currLevel }
          });
          currIdx = nextIdx;
          found = true;
          break;
        } else {
          // nextVal > target
          if (currLevel > 0) {
            steps.push({
              line: 11,
              explanation: `[下沉] Level ${currLevel}: 下个节点值为 ${nextVal} > ${target}。无法右进，下沉至 Level ${currLevel - 1}。`,
              highlightedNodeLevel: { val: currNode.val, level: currLevel - 1 }
            });
            currLevel--;
          } else {
            steps.push({
              line: 15,
              explanation: `[结束] 底层 Level 0 下个节点值为 ${nextVal} > ${target}，无法右进。说明目标 ${target} 绝对不存在。`,
              highlightedNodeLevel: { val: currNode.val, level: 0 }
            });
            break;
          }
        }
      } else {
        // No next node in this level
        if (currLevel > 0) {
          steps.push({
            line: 11,
            explanation: `[下沉] Level ${currLevel}: 位列右侧为 NULL 尾哨兵。下沉至 Level ${currLevel - 1}。`,
            highlightedNodeLevel: { val: currNode.val, level: currLevel - 1 }
          });
          currLevel--;
        } else {
          steps.push({
            line: 15,
            explanation: `[结束] 底层 Level 0 亦无后继且无法下沉。目标值 ${target} 绝对不存在！`,
            highlightedNodeLevel: { val: currNode.val, level: 0 }
          });
          break;
        }
      }
    }

    if (found) {
      steps.push({
        line: 14,
        explanation: `[完成] 成功检索到对应目标节点！返回目标 ${target} 的物理位置。`,
        highlightedNodeLevel: { val: target, level: currLevel }
      });
    }

    setSkipListSteps(steps);
    setCurrentSkipListStepIdx(0);
    setHNodeLevel({ val: 'H', level: 3 });
  };

  const handleSkipListInsert = () => {
    const val = skipListInputValue;
    if (val < 1 || val > 99) return;
    if (skipListNodes.some(n => n.val === val)) {
      setSkipListSteps([{ line: 0, explanation: `[提示] 数值 ${val} 已在跳表中存在，无需重复插入。` }]);
      setCurrentSkipListStepIdx(0);
      return;
    }
    if (skipListNodes.length >= 10) {
      setSkipListSteps([{ line: 0, explanation: `[提示] 空间饱满，跳表节点已达展示上限 10 个。` }]);
      setCurrentSkipListStepIdx(0);
      return;
    }

    const steps: InteractiveDSStep[] = [];
    steps.push({ line: 7, explanation: `[1] 开始检索插入位置。新值 ${val} 会被追加插入到 sorted 序列中。` });

    // Coin flips to simulate heights
    const levels = [true, false, false, false];
    let height = 1;
    for (let l = 1; l < 4; l++) {
      if (Math.random() > 0.5) {
        levels[l] = true;
        height++;
      } else {
        break;
      }
    }

    steps.push({ line: 10, explanation: `[2] 抛硬币决定随机索引高度。新节点拥有的连带层高为: ${height} 层。` });
    steps.push({
      line: 13,
      explanation: `[3] 在底层 Level 0 建立排序连接关联。正在将 ${val} 串联到跳表中。`,
      highlightedNodeLevel: { val: 'H', level: 0 }
    });
    steps.push({
      line: -1,
      explanation: `[完成] 空降插入 ${val} 正常完毕！1 ~ ${height} 层受影响的前驱/后继指针均已被重新串接。`,
      highlightedNodeLevel: { val, level: 0 }
    });

    setSkipListSteps(steps);
    setCurrentSkipListStepIdx(0);
    setHNodeLevel({ val, level: 0 });
  };

  const nextSkipListStep = () => {
    if (currentSkipListStepIdx < 0 || currentSkipListStepIdx >= skipListSteps.length) return;
    const nextIdx = currentSkipListStepIdx + 1;
    if (nextIdx >= skipListSteps.length) {
      setCurrentSkipListStepIdx(-1);
      setSkipListSteps([]);
      setHNodeLevel(undefined);
      return;
    }

    setSkipListHistory(prev => [...prev, { nodes: [...skipListNodes], stepIdx: currentSkipListStepIdx, hNodeLevel }]);
    const activeStep = skipListSteps[nextIdx];
    if (activeStep.highlightedNodeLevel) {
      setHNodeLevel(activeStep.highlightedNodeLevel);
    }
    if (activeStep.explanation.includes('重新串接')) {
      const val = skipListInputValue;
      if (!skipListNodes.some(n => n.val === val)) {
        const levels = [true, Math.random() > 0.5, false, false];
        if (levels[1]) levels[2] = Math.random() > 0.5;
        if (levels[2]) levels[3] = Math.random() > 0.5;
        const newNodes = [...skipListNodes];
        let insIdx = newNodes.length;
        for (let i = 1; i < newNodes.length; i++) {
          if ((newNodes[i].val as number) > val) {
            insIdx = i;
            break;
          }
        }
        newNodes.splice(insIdx, 0, { val, levels });
        setSkipListNodes(newNodes);
      }
    }
    setCurrentSkipListStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevSkipListStep = () => {
    if (skipListHistory.length === 0) return;
    const prev = skipListHistory[skipListHistory.length - 1];
    setSkipListNodes(prev.nodes);
    setCurrentSkipListStepIdx(prev.stepIdx);
    setHNodeLevel(prev.hNodeLevel);
    setSkipListHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(skipListSteps[prev.stepIdx].line);
  };

  const resetSkipListState = () => {
    setSkipListNodes([
      { val: 'H', levels: [true, true, true, true] },
      { val:  8,  levels: [true, true, true, true] },
      { val: 19,  levels: [true, false, false, false] },
      { val: 31,  levels: [true, true, false, false] },
      { val: 43,  levels: [true, false, false, false] },
      { val: 57,  levels: [true, true, true, false] },
      { val: 72,  levels: [true, false, false, false] },
    ]);
    setSkipListSteps([]);
    setSkipListHistory([]);
    setCurrentSkipListStepIdx(-1);
    setHNodeLevel(undefined);
  };

  // -----------------------------------------------------------------
  // 10. BLOOM FILTER METHODS
  // -----------------------------------------------------------------
  const handleBloomInsert = () => {
    const val = bloomInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];

    const h1 = (val * 3 + 5) % 16;
    const h2 = (val * 7 + 2) % 16;

    steps.push({
      line: 11,
      explanation: `[1] 开始插入数值 ${val}。布隆过滤器将开始使用哈希算法进行指纹构建。`
    });
    steps.push({
      line: 13,
      explanation: `[H1] 计算 Hash 1: (${val} * 3 + 5) % 16 = ${h1}。标记槽位 [${h1}] = 1。`,
      highlightedBloomIdxs: [h1]
    });
    steps.push({
      line: 14,
      explanation: `[H2] 计算 Hash 2: (${val} * 7 + 2) % 16 = ${h2}。标记槽位 [${h2}] = 1。`,
      highlightedBloomIdxs: [h1, h2]
    });
    steps.push({
      line: -1,
      explanation: `[完成] 数值 ${val} 的两个哈希位图槽 [${h1}] 和 [${h2}] 均成功点亮，指纹录入完毕。`,
      highlightedBloomIdxs: [h1, h2]
    });

    setBloomSteps(steps);
    setCurrentBloomStepIdx(0);
    setHBloomIdxs([]);
  };

  const handleBloomQuery = () => {
    const val = bloomInputValue;
    if (val < 1 || val > 99) return;
    const steps: InteractiveDSStep[] = [];

    const h1 = (val * 3 + 5) % 16;
    const h2 = (val * 7 + 2) % 16;
    const b1 = bloomBits[h1];
    const b2 = bloomBits[h2];

    steps.push({
      line: 19,
      explanation: `[1] 开始查询元素 ${val} 是否在布隆集合中。`
    });
    steps.push({
      line: 21,
      explanation: `[H1] 校验 Hash 1 位置: (${val} * 3 + 5) % 16 = ${h1}。检验该二进制位为: ${b1}。`,
      highlightedBloomIdxs: [h1]
    });
    steps.push({
      line: 22,
      explanation: `[H2] 校验 Hash 2 位置: (${val} * 7 + 2) % 16 = ${h2}。检验该二进制位为: ${b2}。`,
      highlightedBloomIdxs: [h1, h2]
    });

    if (b1 === 1 && b2 === 1) {
      steps.push({
        line: 23,
        explanation: `[命中] 两个哈希检测位 [${h1}] 与 [${h2}] 均为 1！结论：元素【可能存在】(Maybe inside, 极低假阳性概率)`,
        highlightedBloomIdxs: [h1, h2]
      });
    } else {
      steps.push({
        line: -1,
        explanation: `[错过] 检测到位 bit[${b1 === 0 ? h1 : h2}] 校验值为 0。结论：该元素【绝对不存在】(100% Not in Set)`,
        highlightedBloomIdxs: [h1, h2]
      });
    }

    setBloomSteps(steps);
    setCurrentBloomStepIdx(0);
    setHBloomIdxs([]);
  };

  const nextBloomStep = () => {
    if (currentBloomStepIdx < 0 || currentBloomStepIdx >= bloomSteps.length) return;
    const nextIdx = currentBloomStepIdx + 1;
    if (nextIdx >= bloomSteps.length) {
      setCurrentBloomStepIdx(-1);
      setBloomSteps([]);
      setHBloomIdxs([]);
      return;
    }

    setBloomHistory(prev => [...prev, { bits: [...bloomBits], stepIdx: currentBloomStepIdx, hBloomIdxs }]);
    const activeStep = bloomSteps[nextIdx];
    if (activeStep.highlightedBloomIdxs) {
      setHBloomIdxs(activeStep.highlightedBloomIdxs);
    }
    if (activeStep.explanation.includes('槽位 [') && activeStep.explanation.includes('H1')) {
      const h1 = (bloomInputValue * 3 + 5) % 16;
      setBloomBits(prev => {
        const nextBits = [...prev];
        nextBits[h1] = 1;
        return nextBits;
      });
    } else if (activeStep.explanation.includes('槽位 [') && activeStep.explanation.includes('H2')) {
      const h1 = (bloomInputValue * 3 + 5) % 16;
      const h2 = (bloomInputValue * 7 + 2) % 16;
      setBloomBits(prev => {
        const nextBits = [...prev];
        nextBits[h1] = 1;
        nextBits[h2] = 1;
        return nextBits;
      });
    } else if (activeStep.explanation.includes('指纹录入完毕')) {
      const h1 = (bloomInputValue * 3 + 5) % 16;
      const h2 = (bloomInputValue * 7 + 2) % 16;
      setBloomBits(prev => {
        const nextBits = [...prev];
        nextBits[h1] = 1;
        nextBits[h2] = 1;
        return nextBits;
      });
    }

    setCurrentBloomStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevBloomStep = () => {
    if (bloomHistory.length === 0) return;
    const prev = bloomHistory[bloomHistory.length - 1];
    setBloomBits(prev.bits);
    setCurrentBloomStepIdx(prev.stepIdx);
    setHBloomIdxs(prev.hBloomIdxs || []);
    setBloomHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(bloomSteps[prev.stepIdx].line);
  };

  const resetBloomState = () => {
    setBloomBits(new Array(16).fill(0));
    setBloomSteps([]);
    setBloomHistory([]);
    setCurrentBloomStepIdx(-1);
    setHBloomIdxs([]);
  };

  // -----------------------------------------------------------------
  // 11. SET METHODS
  // -----------------------------------------------------------------
  const handleSetInsert = (setChar: 'A' | 'B') => {
    const val = setInputValue;
    if (val < 1 || val > 99) return;
    const targetSet = setChar === 'A' ? setA : setB;
    const steps: InteractiveDSStep[] = [];

    steps.push({
      line: 6,
      explanation: `[1] 开始插入 ${setChar} 集合。检查当前集合中是否已存在元素 ${val}。`
    });

    if (targetSet.includes(val)) {
      steps.push({
        line: 9,
        explanation: `[唯一值校验] 集合不能包含重复值！由于 ${val} 已存在于 Set ${setChar}，本次插入被安全忽略。`,
      });
    } else {
      steps.push({
        line: 11,
        explanation: `[插入完成] 确认 ${val} 具备唯一性，顺利追加至 Set ${setChar}。`,
      });
    }

    setSetSteps(steps);
    setCurrentSetStepIdx(0);
    setHSetKeys([]);
  };

  const handleSetDelete = (val: number, setChar: 'A' | 'B') => {
    const steps: InteractiveDSStep[] = [];
    steps.push({
      line: 15,
      explanation: `[1] 准备从 Set ${setChar} 移除元素 ${val}。`
    });
    steps.push({
      line: 18,
      explanation: `[移除完成] 成功从 Set ${setChar} 移除了元素 ${val}。`,
    });

    setSetSteps(steps);
    setCurrentSetStepIdx(0);
    setHSetKeys([]);
  };

  const handleSetUnion = () => {
    const steps: InteractiveDSStep[] = [];
    const unionSet = Array.from(new Set([...setA, ...setB])).sort((a, b) => a - b);
    steps.push({
      line: 21,
      explanation: `[开始并集] A ∪ B：收集 Set A 和 Set B 的所有元素，完成去重。`
    });
    steps.push({
      line: 23,
      explanation: `[合并去重] 并集运算结果：{${unionSet.join(', ')}}。`,
    });
    setSetSteps(steps);
    setCurrentSetStepIdx(0);
    setHSetKeys(unionSet.map(v => `union-${v}`));
  };

  const handleSetIntersect = () => {
    const steps: InteractiveDSStep[] = [];
    const interSet = setA.filter(v => setB.includes(v)).sort((a, b) => a - b);
    steps.push({
      line: 26,
      explanation: `[开始交集] A ∩ B：寻找同时存在于 Set A 和 Set B 中的所有公共交叠元素。`
    });
    steps.push({
      line: 28,
      explanation: `[检索交叠] 交集运算结果：{${interSet.join(', ')}}。`,
    });
    setSetSteps(steps);
    setCurrentSetStepIdx(0);
    setHSetKeys(interSet.map(v => `inter-${v}`));
  };

  const handleSetDifference = () => {
    const steps: InteractiveDSStep[] = [];
    const diffSet = setA.filter(v => !setB.includes(v)).sort((a, b) => a - b);
    steps.push({
      line: 31,
      explanation: `[开始差集] A - B：提取在 Set A 中存在、但绝不在 Set B 中存在的所有独立元素。`
    });
    steps.push({
      line: 33,
      explanation: `[排异结果] 相对差集(A - B)结果：{${diffSet.join(', ')}}。`,
    });
    setSetSteps(steps);
    setCurrentSetStepIdx(0);
    setHSetKeys(diffSet.map(v => `diff-${v}`));
  };

  const nextSetStep = () => {
    if (currentSetStepIdx < 0 || currentSetStepIdx >= setSteps.length) return;
    const nextIdx = currentSetStepIdx + 1;
    if (nextIdx >= setSteps.length) {
      setCurrentSetStepIdx(-1);
      setSetSteps([]);
      setHSetKeys([]);
      return;
    }

    setSetHistory(prev => [...prev, { setA: [...setA], setB: [...setB], stepIdx: currentSetStepIdx, hSetKeys: hSetKeys }]);
    const activeStep = setSteps[nextIdx];
    
    if (activeStep.explanation.includes('顺利追加至 Set')) {
      const val = setInputValue;
      const setChar = activeStep.explanation.includes('Set A') ? 'A' : 'B';
      if (setChar === 'A') {
        setSetA(prev => [...prev, val]);
      } else {
        setSetB(prev => [...prev, val]);
      }
    } else if (activeStep.explanation.includes('成功从 Set')) {
      const matches = activeStep.explanation.match(/Set (A|B) 移除了元素 (\d+)/);
      if (matches) {
        const setChar = matches[1];
        const val = parseInt(matches[2]);
        if (setChar === 'A') {
          setSetA(prev => prev.filter(v => v !== val));
        } else {
          setSetB(prev => prev.filter(v => v !== val));
        }
      }
    }

    setCurrentSetStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevSetStep = () => {
    if (setHistory.length === 0) return;
    const prev = setHistory[setHistory.length - 1];
    setSetA(prev.setA);
    setSetB(prev.setB);
    setCurrentSetStepIdx(prev.stepIdx);
    setHSetKeys(prev.hSetKeys || []);
    setSetHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(setSteps[prev.stepIdx].line);
  };

  const resetSetState = () => {
    setSetA([12, 45, 67, 88]);
    setSetB([23, 45, 88, 99]);
    setSetSteps([]);
    setSetHistory([]);
    setCurrentSetStepIdx(-1);
    setHSetKeys([]);
  };

  // -----------------------------------------------------------------
  // 12. ZSET METHODS
  // -----------------------------------------------------------------
  const handleZSetInsert = () => {
    const mem = zsetMemberValue.trim();
    const score = zsetScoreValue;
    if (!mem) return;
    const steps: InteractiveDSStep[] = [];

    steps.push({
      line: 6,
      explanation: `[1] 开始插入/更新有序集合。成员 ${mem}，附加分数为 ${score}。`
    });

    const exists = zsetData.some(x => x.member.toLowerCase() === mem.toLowerCase());
    if (exists) {
      steps.push({
        line: 9,
        explanation: `[更新评分] 发现已存在成员 ${mem}。正将其分数覆写为 ${score}。`,
      });
    } else {
      steps.push({
        line: 12,
        explanation: `[增加新元素] 成员 ${mem} 属于新成员，分配初始分数 ${score}。`,
      });
    }

    steps.push({
      line: 15,
      explanation: `[重调排序] ZSet 按 Score 从高到低进行权重排序以构建排行榜。`,
    });

    setZsetSteps(steps);
    setCurrentZsetStepIdx(0);
    setHZsetMember(undefined);
  };

  const handleZSetIncr = (member: string, amount: number) => {
    const steps: InteractiveDSStep[] = [];
    const currentScore = zsetData.find(x => x.member === member)?.score || 0;
    const nextScore = currentScore + amount;

    steps.push({
      line: 18,
      explanation: `[数值递增/减] 为成员 ${member} 加分：${amount}。旧分数：${currentScore}。`
    });
    steps.push({
      line: 19,
      explanation: `[分数更新] 成员 ${member} 的分数更新为：${nextScore}。`,
    });
    steps.push({
      line: 15,
      explanation: `[重调排序] ZSet 根据新的分数更新自动微调排行榜的排序位置。`,
    });

    setZsetMemberValue(member);
    setZsetScoreValue(nextScore);
    setZsetSteps(steps);
    setCurrentZsetStepIdx(0);
    setHZsetMember(undefined);
  };

  const nextZsetStep = () => {
    if (currentZsetStepIdx < 0 || currentZsetStepIdx >= zsetSteps.length) return;
    const nextIdx = currentZsetStepIdx + 1;
    if (nextIdx >= zsetSteps.length) {
      setCurrentZsetStepIdx(-1);
      setZsetSteps([]);
      setHZsetMember(undefined);
      return;
    }

    setZsetHistory(prev => [...prev, { zset: [...zsetData], stepIdx: currentZsetStepIdx, hMember: hZsetMember }]);
    const activeStep = zsetSteps[nextIdx];

    if (activeStep.explanation.includes('重调排序')) {
      const mem = zsetMemberValue;
      const score = zsetScoreValue;
      setZsetData(prev => {
        const filtered = prev.filter(x => x.member.toLowerCase() !== mem.toLowerCase());
        const updated = [...filtered, { member: mem, score }].sort((a, b) => b.score - a.score);
        return updated;
      });
      setHZsetMember(mem);
    }

    setCurrentZsetStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevZsetStep = () => {
    if (zsetHistory.length === 0) return;
    const prev = zsetHistory[zsetHistory.length - 1];
    setZsetData(prev.zset);
    setCurrentZsetStepIdx(prev.stepIdx);
    setHZsetMember(prev.hMember);
    setZsetHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(zsetSteps[prev.stepIdx].line);
  };

  const resetZsetState = () => {
    setZsetData([
      { member: 'Charlie', score: 68 },
      { member: 'Bob', score: 85 },
      { member: 'Alice', score: 92 },
    ]);
    setZsetSteps([]);
    setZsetHistory([]);
    setCurrentZsetStepIdx(-1);
    setHZsetMember(undefined);
  };

  // -----------------------------------------------------------------
  // 13. BITMAP METHODS
  // -----------------------------------------------------------------
  const handleBitmapSet = (bitVal: 0 | 1) => {
    const offset = bitmapOffsetValue;
    if (offset < 0 || offset > 15) return;
    const steps: InteractiveDSStep[] = [];

    const byteIdx = Math.floor(offset / 8);

    steps.push({
      line: 4,
      explanation: `[1] 开始对位图 Offset (偏移量) [${offset}] 写入二进制状态值 ${bitVal}。`
    });

    steps.push({
      line: 6,
      explanation: `[映射槽位] 每一个 Byte 容纳 8 位。偏移位 ${offset} 对应第 ${byteIdx} 个字节的第 ${offset % 8} 个 bit。`,
      highlightedBloomIdxs: [offset]
    });

    if (bitVal === 1) {
      steps.push({
        line: 11,
        explanation: `[按位或运算] 写入 1（例: 签到成功）：执行 bits[${byteIdx}] |= (1 << ${offset % 8})，置位成功。`,
        highlightedBloomIdxs: [offset]
      });
    } else {
      steps.push({
        line: 12,
        explanation: `[按位与非运算] 写入 0（例: 清除漏签）：执行 bits[${byteIdx}] &= ~(1 << ${offset % 8})，清除置 0。`,
        highlightedBloomIdxs: [offset]
      });
    }

    setBitmapSteps(steps);
    setCurrentBitmapStepIdx(0);
    setHBitmapIdx(undefined);
  };

  const nextBitmapStep = () => {
    if (currentBitmapStepIdx < 0 || currentBitmapStepIdx >= bitmapSteps.length) return;
    const nextIdx = currentBitmapStepIdx + 1;
    if (nextIdx >= bitmapSteps.length) {
      setCurrentBitmapStepIdx(-1);
      setBitmapSteps([]);
      setHBitmapIdx(undefined);
      return;
    }

    setBitmapHistory(prev => [...prev, { bits: [...bitmapBits], stepIdx: currentBitmapStepIdx, hBitmapIdx }]);
    const activeStep = bitmapSteps[nextIdx];

    if (activeStep.explanation.includes('按位或')) {
      const idx = bitmapOffsetValue;
      setBitmapBits(prev => {
        const nextBits = [...prev];
        nextBits[idx] = 1;
        return nextBits;
      });
      setHBitmapIdx(idx);
    } else if (activeStep.explanation.includes('按位与非')) {
      const idx = bitmapOffsetValue;
      setBitmapBits(prev => {
        const nextBits = [...prev];
        nextBits[idx] = 0;
        return nextBits;
      });
      setHBitmapIdx(idx);
    } else if (activeStep.highlightedBloomIdxs && activeStep.highlightedBloomIdxs.length > 0) {
      setHBitmapIdx(activeStep.highlightedBloomIdxs[0]);
    }

    setCurrentBitmapStepIdx(nextIdx);
    autoScrollCode(activeStep.line);
  };

  const prevBitmapStep = () => {
    if (bitmapHistory.length === 0) return;
    const prev = bitmapHistory[bitmapHistory.length - 1];
    setBitmapBits(prev.bits);
    setCurrentBitmapStepIdx(prev.stepIdx);
    setHBitmapIdx(prev.hBitmapIdx);
    setBitmapHistory(history => history.slice(0, history.length - 1));
    autoScrollCode(bitmapSteps[prev.stepIdx].line);
  };

  const resetBitmapState = () => {
    setBitmapBits(new Array(16).fill(0));
    setBitmapSteps([]);
    setBitmapHistory([]);
    setCurrentBitmapStepIdx(-1);
    setHBitmapIdx(undefined);
  };

  // Code definitions for C implementation
  const codes = {
    stack: `#define MAX 6\nint stack[MAX];\nint top = -1;\n\nvoid push(int val) {\n    if (top >= MAX - 1) return;\n    top++;\n    stack[top] = val;\n}\n\nint pop() {\n    if (top < 0) return -1;\n    int val = stack[top];\n    top--;\n    return val;\n}`,
    queue: `#define MAX 6\nint queue[MAX];\nint front = 0, rear = 0;\n\nvoid enqueue(int val) {\n    if (rear >= MAX) return;\n    queue[rear] = val;\n    rear++;\n}\n\nint dequeue() {\n    if (front == rear) return -1;\n    int val = queue[front];\n    front++;\n    return val;\n}`,
    linkedlist: `struct Node {\n    int data;\n    struct Node* next;\n};\nstruct Node* head = NULL;\n\nvoid insertHead(int val) {\n    struct Node* temp = (struct Node*)malloc(sizeof(struct Node));\n    temp->data = val;\n    temp->next = head;\n    head = temp;\n}\n\nvoid deleteHead() {\n    if (head == NULL) return;\n    struct Node* temp = head;\n    head = head->next;\n    free(temp);\n}`,
    array: `#define MAX 6\nint arr[MAX];\nint size = 0;\n\nvoid insertAt(int idx, int val) {\n    if (size >= MAX || idx < 0 || idx > size) return;\n    for (int i = size - 1; i >= idx; i--) {\n        arr[i + 1] = arr[i];\n    }\n    arr[idx] = val;\n    size++;\n}`,
    bst: `struct Node {\n    int key;\n    struct Node *left, *right;\n};\n\nstruct Node* insert(struct Node* root, int val) {\n    if (root == NULL) return newNode(val);\n    if (val < root->key)\n        root->left = insert(root->left, val);\n    else if (val > root->key)\n        root->right = insert(root->right, val);\n    return root;\n}`,
    heap: `#define MAX 7\nint heap[MAX];\nint size = 0;\n\nvoid insert(int val) {\n    if (size >= MAX) return;\n    heap[size] = val;\n    int i = size++;\n    while (i > 0 && heap[i] > heap[(i-1)/2]) {\n        swap(&heap[i], &heap[(i-1)/2]);\n        i = (i-1)/2;\n    }\n}`,
    hash: `struct Node {\n    int key;\n    struct Node* next;\n};\nstruct Node* slots[5] = {NULL};\n\nvoid insert(int key) {\n    int idx = key % 5;\n    struct Node* temp = malloc(sizeof(struct Node));\n    temp->key = key;\n    temp->next = slots[idx];\n    slots[idx] = temp;\n}`,
    graph: `int adj[4][4];\nint visited[4];\n\nvoid bfs(int start) {\n    visited[start] = 1;\n    enqueue(start);\n    while (!isEmpty()) {\n        int u = dequeue();\n        for (int v = 0; v < 4; v++) {\n            if (adj[u][v] && !visited[v]) {\n                visited[v] = 1;\n                enqueue(v);\n            }\n        }\n    }\n}`,
    skiplist: `struct Node {\n    int val;\n    struct Node* forward[4];\n};\nstruct Node* head = NULL;\n\nstruct Node* search(int target) {\n    struct Node* curr = head;\n    for (int i = 3; i >= 0; i--) {\n        while (curr->forward[i] && curr->forward[i]->val < target)\n            curr = curr->forward[i];\n    }\n    curr = curr->forward[0];\n    if (curr && curr->val == target)\n        return curr;\n    return NULL;\n}`,
    bloomfilter: `unsigned char filter[2] = {0}; // 16 bits\n\nint hash1(int x) {\n    return (x * 3 + 5) % 16;\n}\nint hash2(int x) {\n    return (x * 7 + 2) % 16;\n}\n\nvoid insert(int val) {\n    int h1 = hash1(val);\n    int h2 = hash2(val);\n    filter[h1 / 8] |= (1 << (h1 % 8));\n    filter[h2 / 8] |= (1 << (h2 % 8));\n}\n\nbool query(int val) {\n    int h1 = hash1(val);\n    int h2 = hash2(val);\n    bool b1 = filter[h1 / 8] & (1 << (h1 % 8));\n    bool b2 = filter[h2 / 8] & (1 << (h2 % 8));\n    return b1 && b2;\n}`,
    set: `struct Set {\n    int items[15];\n    int size;\n};\n\nbool contains(struct Set* s, int val) {\n    for (int i = 0; i < s->size; i++) {\n        if (s->items[i] == val) return true;\n    }\n    return false;\n}\n\nvoid insert(struct Set* s, int val) {\n    if (!contains(s, val)) {\n        s->items[s->size++] = val;\n    }\n}`,
    zset: `struct Member {\n    char member[10];\n    int score;\n};\nstruct Member zset[10];\nint size = 0;\n\nvoid insert(char* name, int score) {\n    int idx = find(name);\n    if (idx != -1) {\n        zset[idx].score = score;\n    } else {\n        strcpy(zset[size].member, name);\n        zset[size].score = score;\n        size++;\n    }\n    sortZSet();\n}`,
    bitmap: `unsigned char bits[2] = {0}; // 16 bits\n\nvoid setBit(int offset, int val) {\n    int byteIdx = offset / 8;\n    int bitIdx = offset % 8;\n    if (val == 1) {\n        bits[byteIdx] |= (1 << bitIdx);\n    } else {\n        bits[byteIdx] &= ~(1 << bitIdx);\n    }\n}`,
  };

  // Direct active configs according to active tab
  const steps = activeTab === 'stack' ? stackSteps : activeTab === 'queue' ? queueSteps : activeTab === 'linkedlist' ? llSteps : activeTab === 'array' ? arraySteps : activeTab === 'bst' ? bstSteps : activeTab === 'heap' ? heapSteps : activeTab === 'hash' ? hashSteps : activeTab === 'graph' ? graphSteps : activeTab === 'skiplist' ? skipListSteps : activeTab === 'bloomfilter' ? bloomSteps : activeTab === 'set' ? setSteps : activeTab === 'zset' ? zsetSteps : bitmapSteps;
  const currIdx = activeTab === 'stack' ? currentStackStepIdx : activeTab === 'queue' ? currentQueueStepIdx : activeTab === 'linkedlist' ? currentLlStepIdx : activeTab === 'array' ? currentArrayStepIdx : activeTab === 'bst' ? currentBstStepIdx : activeTab === 'heap' ? currentHeapStepIdx : activeTab === 'hash' ? currentHashStepIdx : activeTab === 'graph' ? currentGraphStepIdx : activeTab === 'skiplist' ? currentSkipListStepIdx : activeTab === 'bloomfilter' ? currentBloomStepIdx : activeTab === 'set' ? currentSetStepIdx : activeTab === 'zset' ? currentZsetStepIdx : currentBitmapStepIdx;
  const currentStep = steps[currIdx];

  const handleNextStep = () => {
    if (activeTab === 'stack') nextStackStep();
    else if (activeTab === 'queue') nextQueueStep();
    else if (activeTab === 'linkedlist') nextLlStep();
    else if (activeTab === 'array') nextArrayStep();
    else if (activeTab === 'bst') nextBSTStep();
    else if (activeTab === 'heap') nextHeapStep();
    else if (activeTab === 'hash') nextHashStep();
    else if (activeTab === 'graph') nextGraphStep();
    else if (activeTab === 'skiplist') nextSkipListStep();
    else if (activeTab === 'bloomfilter') nextBloomStep();
    else if (activeTab === 'set') nextSetStep();
    else if (activeTab === 'zset') nextZsetStep();
    else if (activeTab === 'bitmap') nextBitmapStep();
  };

  const handlePrevStep = () => {
    if (activeTab === 'stack') prevStackStep();
    else if (activeTab === 'queue') prevQueueStep();
    else if (activeTab === 'linkedlist') prevLlStep();
    else if (activeTab === 'array') prevArrayStep();
    else if (activeTab === 'bst') prevBSTStep();
    else if (activeTab === 'heap') prevHeapStep();
    else if (activeTab === 'hash') prevHashStep();
    else if (activeTab === 'graph') prevGraphStep();
    else if (activeTab === 'skiplist') prevSkipListStep();
    else if (activeTab === 'bloomfilter') prevBloomStep();
    else if (activeTab === 'set') prevSetStep();
    else if (activeTab === 'zset') prevZsetStep();
    else if (activeTab === 'bitmap') prevBitmapStep();
  };

  // Tab configurations (Bento Style Layout - 13 items)
  const TABS = [
    { key: 'stack' as const, name: '1. Stack 顺序栈', details: 'LIFO 先进后出模型' },
    { key: 'queue' as const, name: '2. Queue 顺序队列', details: 'FIFO 极速双指排队' },
    { key: 'linkedlist' as const, name: '3. Linked 单链表', details: 'malloc & free 链式节点' },
    { key: 'array' as const, name: '4. SeqList 顺序表', details: '物理连续，高成本挪移' },
    { key: 'bst' as const, name: '5. BST 二叉搜索树', details: '两翼分流 遍历分界' },
    { key: 'heap' as const, name: '6. Heap 大顶二叉堆', details: '数组树形完美互映' },
    { key: 'hash' as const, name: '7. Hash 拉链哈希表', details: '分桶散列 解决碰撞冲突' },
    { key: 'graph' as const, name: '8. Graph 图与BFS', details: '4阶无向邻接矩阵' },
    { key: 'skiplist' as const, name: '9. SkipList 跳表', details: '多层分级 指数级跨越检索' },
    { key: 'bloomfilter' as const, name: '10. BloomFilter 布隆过滤器', details: '哈希位图 概率过滤高位压缩' },
    { key: 'set' as const, name: '11. Set 无序集合', details: '哈希结构 唯一去重交并差集' },
    { key: 'zset' as const, name: '12. ZSet 有序集合', details: '跳表双指针 元素带权排行榜' },
    { key: 'bitmap' as const, name: '13. Bitmap 极速位图', details: '字节级别按位压缩 状态位秒算' },
  ];

  return (
    <div id="data-structures" className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] p-5 mb-10 overflow-hidden relative">
      <div className="flex items-center gap-3.5 border-b border-[var(--border)] pb-4 flex-wrap">
        <div>
          <h2 className="font-extrabold text-[22px] font-sans flex items-center gap-2">
            <span>💻 数据结构全景演练场</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] border border-[rgba(0,229,255,0.15)] text-[var(--accent)] font-mono uppercase tracking-wider">PANORAMA (13 MODELS)</span>
          </h2>
          <p className="text-[13px] text-[var(--text-sec)] font-light mt-1">C 语言原生态指针、堆栈、非线性树、堆、哈希拉链、跳表、布隆过滤器、集合、有序表、位图以及图论遍历的全景演练。</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 mt-4 border-b border-[var(--border)] pb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
            }}
            className={`text-left p-2.5 rounded-[var(--rs)] transition-all border ${activeTab === tab.key ? 'bg-[var(--accent-dim)] border-[rgba(0,229,255,0.3)] text-white shadow-[0_0_12px_rgba(0,229,255,0.05)] font-bold' : 'bg-black/15 border-transparent hover:bg-white/5 text-[var(--text-sec)] hover:text-[var(--text)]'}`}
          >
            <div className="font-mono text-[11.5px] leading-tight shrink-0">{tab.name}</div>
            <div className="text-[9.5px] text-zinc-500 mt-1 truncate font-light">{tab.details}</div>
          </button>
        ))}
      </div>

      {/* Main split dashboard: Viz vs Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-[var(--border)] mt-4">
        
        {/* Visual Stage */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col gap-3 min-h-[350px]">
          <div className="flex-1 bg-black/35 rounded-[var(--rs)] p-5 flex flex-col justify-center items-center relative overflow-hidden min-h-[240px]">
            
            {/* STACK VISUAL */}
            {activeTab === 'stack' && (
              <div className="flex flex-col items-center gap-2">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">栈物理高度模型 (MAX = 6)</div>
                <div className="w-[110px] border-x-[3px] border-b-[3px] border-[var(--border)] rounded-b-lg flex flex-col-reverse p-1 bg-black/20 gap-1 h-[150px] justify-start items-stretch">
                  {stackData.items.map((v, i) => {
                    const isTop = stackData.top === i;
                    const isValid = i <= stackData.top && stackData.top >= 0 && v !== 0;
                    return (
                      <div
                        key={i}
                        className={`h-[20px] rounded-[3px] border flex items-center justify-between px-2 text-[11px] font-mono transition-all duration-300 relative ${
                          isValid 
                            ? isTop 
                              ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' 
                              : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-200'
                            : 'bg-transparent border-dashed border-zinc-900 text-zinc-800'
                        }`}
                      >
                        <span className="text-[9px] text-zinc-600">[{i}]</span>
                        <span className={isValid ? 'font-bold text-white' : ''}>{isValid ? v : '-'}</span>
                        {isTop && (
                          <div className="absolute right-[-45px] flex items-center gap-[4px] animate-pulse">
                            <span className="text-[9px] text-orange-400 font-bold">&#8592; top</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUEUE VISUAL */}
            {activeTab === 'queue' && (
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">队列物理连续单元</div>
                <div className="flex border border-[var(--border)] rounded-[var(--rs)] bg-black/40 overflow-hidden w-full max-w-[300px]">
                  {queueData.items.map((v, i) => {
                    const hasVal = v !== null;
                    const isFront = queueData.front === i;
                    const isRear = queueData.rear === i;
                    const isInside = i >= queueData.front && i < queueData.rear;
                    return (
                      <div
                        key={i}
                        className={`flex-1 border-r last:border-r-0 border-[var(--border)] py-[10px] flex flex-col justify-center items-center font-mono text-[11px] relative transition-all duration-300 ${isInside && hasVal ? 'bg-cyan-500/5 text-cyan-100' : 'bg-zinc-900/10 text-zinc-800'}`}
                      >
                        <span className="text-[8px] text-zinc-600 block">[{i}]</span>
                        <span className="font-bold text-white">{hasVal && isInside ? v : '-'}</span>
                        <div className="absolute top-8 flex flex-col items-center gap-px mt-0.5">
                          {isFront && <span className="text-[8px] px-1 bg-purple-500/20 text-purple-300 rounded font-bold">f</span>}
                          {isRear && <span className="text-[8px] px-1 bg-orange-500/20 text-orange-300 rounded font-bold">r</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-[10px] font-mono mt-5 text-[var(--text-sec)]">
                  <div>f: 队头(front={queueData.front})</div>
                  <div>r: 队尾(rear={queueData.rear})</div>
                </div>
              </div>
            )}

            {/* LINKED LIST VISUAL */}
            {activeTab === 'linkedlist' && (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase">头动态链表 head</div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 w-full max-w-full justify-center">
                  <div className="flex flex-col items-center scale-90 shrink-0">
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">head</span>
                    <div className="p-1 bg-cyan-950/20 border border-cyan-500/40 text-[var(--accent)] font-mono text-[10px] rounded">{linkedListData.length > 0 ? linkedListData[0].ptr : 'NULL'}</div>
                  </div>
                  {linkedListData.map((node, i) => (
                    <div key={node.id} className="flex items-center shrink-0">
                      <span className="text-cyan-500/60 font-mono text-[11px] px-px animate-pulse">&#10141;</span>
                      <div className="border border-[var(--border)] bg-black/30 rounded-[var(--rs)] p-1 flex flex-col min-w-[70px] select-none text-[11px]">
                        <div className="font-mono text-[8px] text-zinc-500 text-center">{node.ptr}</div>
                        <div className="grid grid-cols-2 text-center bg-black/25 rounded mt-0.5">
                          <div>
                            <span className="block text-[8px] text-zinc-500">val</span>
                            <span className="font-bold text-white">{node.val}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-zinc-500">next</span>
                            <span className="text-cyan-400 text-[9px]">{linkedListData[i + 1] ? linkedListData[i + 1].ptr.slice(-4) : 'NULL'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {tempLLNode && (
                  <div className="p-1 rounded bg-orange-500/5 border border-dashed border-orange-500/20 text-[10px] font-mono text-orange-300">
                    temp malloc(): {tempLLNode.val} at {tempLLNode.ptr}
                  </div>
                )}
              </div>
            )}

            {/* ARRAY VISUAL */}
            {activeTab === 'array' && (
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">连续线性内存 (size = {arrayData.size})</div>
                <div className="flex border border-[var(--border)] rounded-[var(--rs)] bg-black/40 overflow-hidden w-full max-w-[300px]">
                  {arrayData.items.map((v, i) => {
                    const hasVal = v !== null;
                    const isHovered = arrayHoverIdxs.includes(i);
                    const isTarget = activeArrayTargetIdx === i;
                    const isValidSize = i < arrayData.size;
                    return (
                      <div
                        key={i}
                        className={`flex-1 border-r last:border-r-0 border-[var(--border)] py-[12px] flex flex-col justify-center items-center font-mono text-[11px] relative transition-all duration-300 ${isTarget ? 'bg-emerald-500/12 text-emerald-200' : isHovered ? 'bg-orange-500/12 text-orange-200' : isValidSize ? 'bg-cyan-500/5 text-cyan-100' : 'bg-transparent text-zinc-800'}`}
                      >
                        <span className="text-[8px] text-zinc-600 block">[{i}]</span>
                        <span className="font-bold text-white">{isValidSize && hasVal ? v : '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 二叉搜索树 BST VISUAL */}
            {activeTab === 'bst' && (
              <div className="flex flex-col items-center w-full select-none">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-2 uppercase">二叉搜索树结构 (3阶深度)</div>
                <div className="relative w-full max-w-[280px] h-[120px] bg-black/10 rounded">
                  {/* SVG paths to nodes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-700 stroke-[1.5] fill-none">
                    {bstData[1] && bstData[2] && <line x1="50%" y1="15%" x2="25%" y2="48%" />}
                    {bstData[1] && bstData[3] && <line x1="50%" y1="15%" x2="75%" y2="48%" />}
                    {bstData[2] && bstData[4] && <line x1="25%" y1="48%" x2="12%" y2="82%" />}
                    {bstData[2] && bstData[5] && <line x1="25%" y1="48%" x2="38%" y2="82%" />}
                    {bstData[3] && bstData[6] && <line x1="75%" y1="48%" x2="62%" y2="82%" />}
                    {bstData[3] && bstData[7] && <line x1="75%" y1="48%" x2="88%" y2="82%" />}
                  </svg>
                  {/* Nodes positions map */}
                  {[
                    { idx: 1, left: '50%', top: '15%' },
                    { idx: 2, left: '25%', top: '48%' },
                    { idx: 3, left: '75%', top: '48%' },
                    { idx: 4, left: '12%', top: '82%' },
                    { idx: 5, left: '38%', top: '82%' },
                    { idx: 6, left: '62%', top: '82%' },
                    { idx: 7, left: '88%', top: '82%' },
                  ].map(pos => {
                    const val = bstData[pos.idx];
                    if (!val) return null;
                    const isHigh = highlightedBstIdxs.includes(pos.idx);
                    return (
                      <div
                        key={pos.idx}
                        style={{ left: pos.left, top: pos.top }}
                        className={`absolute -translate-x-[50%] -translate-y-[50%] w-[24px] h-[24px] rounded-full border flex items-center justify-center text-[10.5px] font-mono leading-none ${isHigh ? 'bg-orange-500 border-orange-400 text-white font-bold scale-110 shadow-lg shadow-orange-500/20' : 'bg-zinc-900 border-zinc-700 text-cyan-200'}`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 大顶二叉堆 HEAP VISUAL */}
            {activeTab === 'heap' && (
              <div className="flex flex-col items-center w-full select-none">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">大顶二叉堆 (数组映射树)</div>
                <div className="relative w-full max-w-[280px] h-[100px] bg-black/10 rounded mb-1">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-700 stroke-[1.5] fill-none">
                    {heapData[0] !== undefined && heapData[1] !== undefined && <line x1="50%" y1="15%" x2="25%" y2="50%" />}
                    {heapData[0] !== undefined && heapData[2] !== undefined && <line x1="50%" y1="15%" x2="75%" y2="50%" />}
                    {heapData[1] !== undefined && heapData[3] !== undefined && <line x1="25%" y1="50%" x2="12%" y2="85%" />}
                    {heapData[1] !== undefined && heapData[4] !== undefined && <line x1="25%" y1="50%" x2="38%" y2="85%" />}
                    {heapData[2] !== undefined && heapData[5] !== undefined && <line x1="75%" y1="50%" x2="62%" y2="85%" />}
                    {heapData[2] !== undefined && heapData[6] !== undefined && <line x1="75%" y1="50%" x2="88%" y2="85%" />}
                  </svg>
                  {[
                    { idx: 0, left: '50%', top: '15%' },
                    { idx: 1, left: '25%', top: '50%' },
                    { idx: 2, left: '75%', top: '50%' },
                    { idx: 3, left: '12%', top: '85%' },
                    { idx: 4, left: '38%', top: '85%' },
                    { idx: 5, left: '62%', top: '85%' },
                    { idx: 6, left: '88%', top: '85%' },
                  ].map(pos => {
                    const val = heapData[pos.idx];
                    if (val === undefined) return null;
                    const isHigh = highlightedHeapIdxs.includes(pos.idx);
                    return (
                      <div
                        key={pos.idx}
                        style={{ left: pos.left, top: pos.top }}
                        className={`absolute -translate-x-[50%] -translate-y-[50%] w-[22px] h-[22px] rounded-full border flex items-center justify-center text-[10px] font-mono leading-none ${isHigh ? 'bg-orange-500 border-orange-400 text-white font-extrabold' : 'bg-zinc-900 border-zinc-700 text-cyan-200'}`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
                {/* Continuous memory representation */}
                <div className="flex border border-zinc-800 rounded overflow-hidden max-w-[260px] w-full text-[10px] font-mono bg-black/20 text-center">
                  {heapData.map((v, i) => {
                    const isHigh = highlightedHeapIdxs.includes(i);
                    return (
                      <div key={i} className={`flex-1 py-1 border-r last:border-0 border-zinc-850 ${isHigh ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400'}`}>
                        <div className="text-[7.5px] opacity-45">[{i}]</div>
                        <div className="font-bold">{v}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 哈希链表 HASH VISUAL */}
            {activeTab === 'hash' && (
              <div className="flex flex-col items-center w-full">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">哈希分桶大拉链 5槽 (MODULO 5)</div>
                <div className="flex flex-col gap-1 w-full max-w-[260px] bg-black/10 p-2 rounded border border-[var(--border)]">
                  {[0, 1, 2, 3, 4].map(slot => {
                    const isHigh = activeHashBucketIdx === slot;
                    const chain = hashData[slot] || [];
                    return (
                      <div key={slot} className="flex items-center gap-2 text-[11px] font-mono">
                        <div className={`w-[60px] border px-1.5 py-0.5 rounded text-[10px] text-center ${isHigh ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-black/25 text-zinc-500 border-zinc-800'}`}>
                          slots[{slot}]
                        </div>
                        <span className="text-zinc-600">&#10141;</span>
                        <div className="flex gap-1 items-center flex-wrap">
                          {chain.map((val, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-900 rounded text-zinc-300">{val}</div>
                              {idx < chain.length - 1 && <span className="text-zinc-700 text-[9px]">&#10141;</span>}
                            </div>
                          ))}
                          {chain.length === 0 && <span className="text-zinc-700 text-[10px]">NULL</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4阶图与BFS GRAPH VISUAL */}
            {activeTab === 'graph' && (
              <div className="flex flex-col items-center w-full select-none">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase">4阶无向邻接邻网图（顶点 A-B-D-C）</div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-[290px]">
                  {/* Drawing of nodes */}
                  <div className="relative w-full h-[120px] bg-black/10 rounded">
                    <svg className="absolute inset-0 w-full h-full stroke-zinc-700 stroke-[1.5] fill-none pointer-events-none">
                      {/* Lines based on connections */}
                      {graphAdj[0][1] === 1 && <line x1="50%" y1="15%" x2="15%" y2="50%" />}
                      {graphAdj[0][2] === 1 && <line x1="50%" y1="15%" x2="85%" y2="50%" />}
                      {graphAdj[1][3] === 1 && <line x1="15%" y1="50%" x2="50%" y2="85%" />}
                      {graphAdj[2][3] === 1 && <line x1="85%" y1="50%" x2="50%" y2="85%" />}
                      {graphAdj[1][2] === 1 && <line x1="15%" y1="50%" x2="85%" y2="50%" />}
                    </svg>
                    {[
                      { idx: 0, label: 'A(0)', left: '50%', top: '15%' },
                      { idx: 1, label: 'B(1)', left: '15%', top: '50%' },
                      { idx: 2, label: 'C(2)', left: '85%', top: '50%' },
                      { idx: 3, label: 'D(3)', left: '50%', top: '85%' },
                    ].map(pos => {
                      const isVisited = graphVisited[pos.idx];
                      return (
                        <div
                          key={pos.idx}
                          style={{ left: pos.left, top: pos.top }}
                          className={`absolute -translate-x-[50%] -translate-y-[50%] text-[10px] font-mono leading-none rounded-full px-1.5 py-1 border text-center ${isVisited ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold scale-105' : 'bg-black/60 border-zinc-750 text-zinc-400'}`}
                        >
                          {pos.label}
                        </div>
                      );
                    })}
                  </div>
                  {/* Matrix interactive controller */}
                  <div className="flex flex-col justify-center text-center">
                    <div className="text-[8.5px] uppercase text-zinc-500 font-mono mb-1">连通邻接矩阵 (点击切换边)</div>
                    <div className="grid grid-cols-4 border border-zinc-800 rounded overflow-hidden text-[9px] font-mono bg-black/15">
                      {graphAdj.map((row, r) =>
                        row.map((val, c) => (
                          <button
                            key={`${r}-${c}`}
                            onClick={() => toggleGraphEdge(r, c)}
                            className={`p-1 border-r last:border-r-0 border-b border-zinc-850 cursor-pointer ${val === 1 ? 'bg-cyan-950/20 text-cyan-400 font-bold' : 'text-zinc-650 hover:bg-white/5'} ${r === c ? 'bg-zinc-900/40 text-red-900 cursor-not-allowed pointer-events-none' : ''}`}
                          >
                            {val}
                          </button>
                        ))
                      )}
                    </div>
                    {graphQueue.length > 0 && (
                      <div className="text-[10px] font-mono text-purple-400 mt-2">
                        BFS 队: [{graphQueue.map(idx => ['A', 'B', 'C', 'D'][idx]).join(', ')}]
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 跳表 SKIP LIST VISUAL */}
            {activeTab === 'skiplist' && (
              <div className="flex flex-col gap-3.5 w-full select-none justify-center">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase text-center">4层跳表 (随机高度多级连跳索引)</div>
                <div className="flex flex-col gap-2.5 bg-black/20 p-3.5 rounded border border-zinc-850">
                  {[3, 2, 1, 0].map(level => {
                    const levelNodes = skipListNodes.filter(n => n.levels[level]);
                    return (
                      <div key={level} className="flex items-center gap-1.5 text-[10.5px] font-mono">
                        <div className="w-[30px] font-semibold text-zinc-500 shrink-0 text-right pr-1">L{level}</div>
                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                          {levelNodes.map((node, i) => {
                            const isHNode = hNodeLevel?.val === node.val && hNodeLevel?.level === level;
                            return (
                              <div key={i} className="flex items-center gap-1">
                                <div
                                  className={`px-2 py-0.5 rounded border font-bold text-center min-w-[28px] transition-all duration-300 ${isHNode ? 'bg-cyan-500/25 text-cyan-300 border-cyan-450 scale-110 shadow-[0_0_10px_rgba(0,229,255,0.25)] font-extrabold' : 'bg-black/35 text-zinc-300 border-zinc-750 font-normal'}`}
                                >
                                  {node.val}
                                </div>
                                {i < levelNodes.length - 1 && (
                                  <div className="text-zinc-650 flex items-center shrink-0">
                                    <span className="text-[12px] opacity-75">&#10141;</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <span className="text-zinc-700 text-[9.5px]">⤏ NULL</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 布隆过滤器 BLOOM FILTER VISUAL */}
            {activeTab === 'bloomfilter' && (
              <div className="flex flex-col gap-3.5 w-full select-none justify-center">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-1 uppercase text-center">16-Bit 哈希型二进制位图 (指纹记录器/核验)</div>
                <div className="grid grid-cols-8 gap-1.5 max-w-[340px] mx-auto bg-black/15 p-3 rounded border border-zinc-800">
                  {bloomBits.map((bit, idx) => {
                    const isHigh = hBloomIdxs.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-1 rounded border transition-all duration-300 ${isHigh ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : bit === 1 ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-black/30 border-zinc-850 text-zinc-650'}`}
                      >
                        <span className="text-[8px] font-mono text-zinc-500 select-none">#{idx}</span>
                        <span className="text-xs font-mono font-bold mt-0.5">{bit}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 justify-center text-[10px] font-mono text-zinc-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-950/20 border border-emerald-500/40"></div>
                    <span>已占位 (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-black/30 border border-zinc-800"></div>
                    <span>未初始 (0)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-400 animate-pulse"></div>
                    <span>哈希探针</span>
                  </div>
                </div>
              </div>
            )}

            {/* 无序集合 SET VISUAL */}
            {activeTab === 'set' && (
              <div className="flex flex-col gap-4 w-full select-none justify-center">
                <div className="font-mono text-[10px] text-[var(--text-muted)] text-center uppercase">Venn Set 集合模型 (去重、并集、交集、差集演示)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Set A Panel */}
                  <div className="bg-emerald-950/10 border border-emerald-500/20 rounded p-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1 mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">Set A (集合A)</span>
                      <span className="text-[10px] font-mono text-zinc-500">size: {setA.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[48px] items-center">
                      {setA.length === 0 ? (
                        <span className="text-xs text-zinc-600 font-light italic">空集 ∅</span>
                      ) : (
                        setA.map(val => {
                          const isHighlighted = hSetKeys.includes(`union-${val}`) || hSetKeys.includes(`inter-${val}`) || hSetKeys.includes(`diff-${val}`);
                          return (
                            <div
                              key={val}
                              onClick={() => handleSetDelete(val, 'A')}
                              title="点击快捷移除元素"
                              className={`group cursor-pointer px-2.5 py-1 rounded-full border text-xs font-mono transition-all flex items-center gap-1 ${isHighlighted ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] font-bold' : 'bg-black/30 border-emerald-500/30 text-emerald-300 hover:border-red-500/60 hover:text-red-400'}`}
                            >
                              <span>{val}</span>
                              <span className="text-[9px] text-zinc-600 group-hover:text-red-400 font-bold ml-0.5">×</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Set B Panel */}
                  <div className="bg-purple-950/10 border border-purple-500/20 rounded p-3">
                    <div className="flex items-center justify-between border-b border-purple-500/10 pb-1 mb-2">
                      <span className="text-xs font-mono font-bold text-purple-400">Set B (集合B)</span>
                      <span className="text-[10px] font-mono text-zinc-500">size: {setB.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[48px] items-center">
                      {setB.length === 0 ? (
                        <span className="text-xs text-zinc-600 font-light italic">空集 ∅</span>
                      ) : (
                        setB.map(val => {
                          const isHighlighted = hSetKeys.includes(`union-${val}`) || hSetKeys.includes(`inter-${val}`);
                          return (
                            <div
                              key={val}
                              onClick={() => handleSetDelete(val, 'B')}
                              title="点击快捷移除元素"
                              className={`group cursor-pointer px-2.5 py-1 rounded-full border text-xs font-mono transition-all flex items-center gap-1 ${isHighlighted ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] font-bold' : 'bg-black/30 border-purple-500/30 text-purple-300 hover:border-red-500/60 hover:text-red-400'}`}
                            >
                              <span>{val}</span>
                              <span className="text-[9px] text-zinc-600 group-hover:text-red-400 font-bold ml-0.5">×</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Operation result render cards */}
                {hSetKeys.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5 text-center transition-all animate-fade-in">
                    <span className="text-[10.5px] font-sans text-amber-400 block mb-1 font-semibold">💻 运算结果 (Result Panel)</span>
                    <div className="flex justify-center flex-wrap gap-1.5 mt-1.5">
                      {hSetKeys.map((key) => {
                        const val = key.split('-')[1];
                        return (
                          <span key={key} className="px-2 py-0.5 rounded border border-amber-400/50 bg-amber-500/15 text-amber-200 font-mono text-xs font-bold shadow-[0_0_6px_rgba(245,158,11,0.1)]">
                            {val}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="text-[9.5px] text-zinc-500 text-center font-light leading-snug">
                  * 提示: 集合不允许包含重复项。点击元素右侧 X 符号可直接从集合中踢除元素。
                </div>
              </div>
            )}

            {/* 有序集合 ZSET VISUAL */}
            {activeTab === 'zset' && (
              <div className="flex flex-col gap-3.5 w-full select-none justify-center">
                <div className="font-mono text-[10px] text-[var(--text-muted)] text-center uppercase">Sorted Set Leaderboard 排行榜模型 (KV 有序检索)</div>
                <div className="flex flex-col gap-1.5 max-w-[340px] w-full mx-auto bg-black/20 p-3 rounded border border-zinc-850">
                  {zsetData.map((item, idx) => {
                    const isTarget = hZsetMember === item.member;
                    return (
                      <div
                        key={item.member}
                        className={`flex items-center justify-between px-3 py-2 rounded border transition-all duration-300 ${isTarget ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 scale-[1.02] shadow-[0_0_10px_rgba(245,158,11,0.15)] font-extrabold' : 'bg-black/35 border-zinc-800 text-zinc-300'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${idx === 0 ? 'bg-amber-450 text-black' : idx === 1 ? 'bg-zinc-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-sans font-medium">{item.member}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 font-bold">{item.score} <span className="text-[8px] text-zinc-500 font-normal">分</span></span>
                          <button
                            onClick={() => handleZSetIncr(item.member, 5)}
                            className="w-4 h-4 rounded bg-zinc-805 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 text-[10px] font-bold border border-transparent hover:border-emerald-500/30 flex items-center justify-center transition-colors shadow-sm"
                            title="分数 +5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[9.5px] text-zinc-500 text-center font-light leading-snug">
                  * 提示: ZSet 集合以元素名称(key)唯一，对应分数进行动态排行。成员加分可自动升降改变名次。
                </div>
              </div>
            )}

            {/* 位图 BITMAP VISUAL */}
            {activeTab === 'bitmap' && (
              <div className="flex flex-col gap-3.5 w-full select-none justify-center">
                <div className="font-mono text-[10px] text-[var(--text-muted)] text-center uppercase">16-Bit Byte Array 按位存储模型 (16天连续签到演示)</div>
                
                {/* Visual Attendance Calendar Grid */}
                <div className="grid grid-cols-4 gap-2.5 max-w-[340px] w-full mx-auto bg-black/15 p-3.5 rounded border border-zinc-800">
                  {bitmapBits.map((bit, idx) => {
                    const isTarget = hBitmapIdx === idx;
                    const dayNum = idx + 1;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setBitmapOffsetValue(idx);
                          handleBitmapSet(bit === 1 ? 0 : 1);
                        }}
                        title={`第 ${dayNum} 天，点击快捷切换签到状态`}
                        className={`cursor-pointer flex flex-col items-center justify-between p-2 rounded border transition-all duration-300 hover:scale-[1.03] ${isTarget ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.25)]' : bit === 1 ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]' : 'bg-black/30 border-zinc-850 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <span className="text-[8.5px] font-mono text-zinc-500">Day {dayNum}</span>
                        <div className="my-1 text-center">
                          {bit === 1 ? (
                            <span className="text-emerald-400 font-bold text-xs select-none">✔ 签到</span>
                          ) : (
                            <span className="text-zinc-600 font-light text-[10.5px] select-none">未签</span>
                          )}
                        </div>
                        <span className="text-[7.5px] font-mono text-zinc-650 shrink-0">bit: #{idx}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Byte diagnostics summary */}
                <div className="text-center bg-black/25 py-2 px-3 rounded max-w-[340px] mx-auto border border-zinc-850 flex items-center justify-around font-mono text-[9.5px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block">Byte 0 (位#0-7)</span>
                    <span className="text-zinc-300 font-bold">{bitmapBits.slice(0, 8).join('')}</span>
                  </div>
                  <div className="w-px h-5 bg-zinc-800"></div>
                  <div>
                    <span className="text-zinc-500 block">Byte 1 (位#8-15)</span>
                    <span className="text-zinc-300 font-bold">{bitmapBits.slice(8, 16).join('')}</span>
                  </div>
                </div>

                <div className="text-[9.5px] text-zinc-500 text-center font-light leading-snug">
                  * 提示: 字节级别位操作，仅用 2 字节(16字节比)记录 16 天考勤，内存利用率相比结构体提升 98%+。
                </div>
              </div>
            )}

          </div>

          {/* Controls & Inputs */}
          <div className="border-t border-[var(--border)] pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">数据结构控制套件</span>
              {steps.length > 0 && (
                <div className="flex gap-1.5 font-mono text-[10.5px] text-[var(--accent)] bg-black/30 px-2 py-1 rounded-[var(--rs)]">
                  <span>微步逐步： {currIdx + 1} / {steps.length}</span>
                </div>
              )}
            </div>

            {/* Inputs & actions based on tab */}
            <div className="mt-1 flex items-center gap-2 flex-wrap min-h-[36px]">
              {activeTab === 'stack' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">入栈数值:</span>
                  <input
                    type="number"
                    value={stackInputValue}
                    onChange={e => setStackInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleStackPush} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer">push() 压入</button>
                  <button onClick={handleStackPop} className="px-2 py-0.5 bg-red-500/15 text-red-400 hover:border-red-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer">pop() 弹出</button>
                  <button onClick={resetStackState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">重置</button>
                </div>
              )}
              {activeTab === 'queue' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">入队数值:</span>
                  <input
                    type="number"
                    value={queueInputValue}
                    onChange={e => setQueueInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleQueueEnqueue} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">enqueue()</button>
                  <button onClick={handleQueueDequeue} className="px-2 py-0.5 bg-red-500/15 text-red-400 hover:border-red-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">dequeue()</button>
                  <button onClick={resetQueueState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">重置</button>
                </div>
              )}
              {activeTab === 'linkedlist' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">链极元素:</span>
                  <input
                    type="number"
                    value={llInputValue}
                    onChange={e => setLlInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleLLInsertHead} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer">insertHead()</button>
                  <button onClick={handleLLDeleteHead} className="px-2 py-0.5 bg-red-500/15 text-red-400 hover:border-red-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer animate-pulse">deleteHead()</button>
                  <button onClick={resetLlState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">重置</button>
                </div>
              )}
              {activeTab === 'array' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-zinc-500 font-mono">idx:</span>
                  <input
                    type="number"
                    value={arrayIdxValue}
                    onChange={e => setArrayIdxValue(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-8 px-1 py-px border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <span className="text-zinc-500 font-mono">val:</span>
                  <input
                    type="number"
                    value={arrayValValue}
                    onChange={e => setArrayValValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-10 px-1 py-px border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleArrayInsert} className="px-2 py-px bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer">insertAt()</button>
                  <button onClick={resetArrayState} className="px-2 py-px bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">还原</button>
                </div>
              )}
              {activeTab === 'bst' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">树元插入:</span>
                  <input
                    type="number"
                    value={bstInputValue}
                    onChange={e => setBstInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleBSTInsert} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer">insertBST</button>
                  <button onClick={resetBstState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">重置二叉树</button>
                </div>
              )}
              {activeTab === 'heap' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">堆元插入:</span>
                  <input
                    type="number"
                    value={heapInputValue}
                    onChange={e => setHeapInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleHeapInsert} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer">insertHeap</button>
                  <button onClick={resetHeapState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer font-sans">重置大顶堆</button>
                </div>
              )}
              {activeTab === 'hash' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">散列冲突元素:</span>
                  <input
                    type="number"
                    value={hashInputValue}
                    onChange={e => setHashInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleHashInsert} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">hash(key)</button>
                  <button onClick={resetHashState} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10.5px] rounded cursor-pointer">重置散列表</button>
                </div>
              )}
              {activeTab === 'graph' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)] font-mono text-[11px]">图搜索 A 开始:</span>
                  <button onClick={handleGraphRunBFS} className="px-2.5 py-0.5 bg-purple-900 border border-purple-600 text-purple-100 font-bold text-[10.5px] rounded-[var(--rs)] hover:bg-purple-800 cursor-pointer">bfs(0) 图广遍历</button>
                  <button onClick={resetGraphState} className="px-2 py-0.5 bg-zinc-800 text-zinc-305 text-[10.5px] rounded cursor-pointer">重网结构</button>
                </div>
              )}
              {activeTab === 'skiplist' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">数值:</span>
                  <input
                    type="number"
                    value={skipListInputValue}
                    onChange={e => setSkipListInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleSkipListSearch} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">search() 检索</button>
                  <button onClick={handleSkipListInsert} className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">insert() 插入</button>
                  <button onClick={resetSkipListState} className="px-2 py-0.5 bg-zinc-800 text-zinc-350 text-[10.5px] rounded cursor-pointer">随机重构</button>
                </div>
              )}
              {activeTab === 'bloomfilter' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">指纹值:</span>
                  <input
                    type="number"
                    value={bloomInputValue}
                    onChange={e => setBloomInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleBloomQuery} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono">query() 校验</button>
                  <button onClick={handleBloomInsert} className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono font-bold animate-pulse">insert() 注册</button>
                  <button onClick={resetBloomState} className="px-2 py-0.5 bg-zinc-800 text-zinc-350 text-[10.5px] rounded cursor-pointer">清空位图</button>
                </div>
              )}
              {activeTab === 'set' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">元素值 (1-99):</span>
                  <input
                    type="number"
                    value={setInputValue}
                    onChange={e => setSetInputValue(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-11 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={() => handleSetInsert('A')} className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-semibold">→ Set A 插入</button>
                  <button onClick={() => handleSetInsert('B')} className="px-2 py-0.5 bg-purple-500/15 text-purple-400 hover:border-purple-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-semibold">→ Set B 插入</button>
                  <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>
                  <button onClick={handleSetUnion} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono font-bold">A ∪ B (并集)</button>
                  <button onClick={handleSetIntersect} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono font-bold">A ∩ B (交集)</button>
                  <button onClick={handleSetDifference} className="px-2 py-0.5 bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--accent)] border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono font-bold">A - B (差集)</button>
                  <button onClick={resetSetState} className="px-2 py-0.5 bg-zinc-800 text-zinc-350 text-[10.5px] rounded cursor-pointer">重置集合</button>
                </div>
              )}
              {activeTab === 'zset' && (
                <div className="flex items-center gap-2 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">成员 (Key):</span>
                  <input
                    type="text"
                    value={zsetMemberValue}
                    onChange={e => setZsetMemberValue(e.target.value.slice(0, 10))}
                    placeholder="David"
                    className="w-16 px-1.5 py-0.5 border border-[var(--border)] rounded bg-black/30 font-sans focus:outline-none text-[11px]"
                  />
                  <span className="text-[var(--text-sec)]">评分:</span>
                  <input
                    type="number"
                    value={zsetScoreValue}
                    onChange={e => setZsetScoreValue(Math.min(999, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-12 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={handleZSetInsert} className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-mono font-bold">add / update() 双操作</button>
                  <button onClick={resetZsetState} className="px-2 py-0.5 bg-zinc-800 text-zinc-350 text-[10.5px] rounded cursor-pointer">恢复默认</button>
                </div>
              )}
              {activeTab === 'bitmap' && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                  <span className="text-[var(--text-sec)]">Offset (0-15):</span>
                  <input
                    type="number"
                    value={bitmapOffsetValue}
                    onChange={e => setBitmapOffsetValue(Math.min(15, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-10 px-1 py-0.5 border border-[var(--border)] rounded bg-black/30 text-center font-mono focus:outline-none"
                  />
                  <button onClick={() => handleBitmapSet(1)} className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-bold select-none">setBit(1) 签到成功</button>
                  <button onClick={() => handleBitmapSet(0)} className="px-2.5 py-0.5 bg-red-500/15 text-red-400 hover:border-red-500 border border-transparent hover:border text-[10.5px] rounded cursor-pointer font-bold select-none">setBit(0) 漏卡补置</button>
                  <button onClick={resetBitmapState} className="px-2 py-0.5 bg-zinc-800 text-zinc-350 text-[10.5px] rounded cursor-pointer">清空状态</button>
                </div>
              )}
            </div>

            {/* Step execution overlay */}
            {steps.length > 0 && (
              <div className="mt-3.5 p-2 bg-black/40 border border-[var(--border)] rounded-[var(--rs)] flex items-center gap-1.5">
                <button
                  onClick={handlePrevStep}
                  disabled={currIdx <= 0}
                  className="w-6 h-6 flex items-center justify-center border border-[var(--border)] rounded bg-black/20 text-[var(--text-sec)] text-[11px] hover:border-[var(--accent)] hover:text-white disabled:opacity-30 disabled:border-transparent cursor-pointer transition-colors"
                >
                  ◀
                </button>
                <div className="flex-1 text-[11.5px] text-zinc-100 flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[11px] text-[var(--accent)] font-bold shrink-0 font-mono">STEP {currIdx + 1}:</span>
                  <span className="animate-[fadeIn_0.15s_ease-out] font-light leading-snug truncate">{currentStep?.explanation}</span>
                </div>
                <button
                  onClick={handleNextStep}
                  className="w-6 h-6 flex items-center justify-center border border-[var(--border)] rounded bg-black/20 text-[var(--text-sec)] text-[11px] hover:border-[var(--accent)] hover:text-white cursor-pointer transition-colors font-bold"
                >
                  {currIdx === steps.length - 1 ? '✔' : '▶'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Code Visual Panel (Split Left) */}
        <div className="flex flex-col max-h-[440px] shadow-inner bg-zinc-950 border border-zinc-900 rounded overflow-hidden" ref={codePanelRef}>
          <div className="p-2 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center text-[10.5px] px-4 font-mono select-none">
            <span className="text-zinc-[var(--text-muted)] tracking-wide">💻 CODE PREVIEW</span>
            <div className="flex items-center gap-2">
              {(['c', 'python', 'javascript'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); }}
                  className={`px-1.5 py-0.5 rounded transition-all text-[9.5px] tracking-wide border uppercase ${lang === l ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] font-bold' : 'border-transparent text-zinc-400 hover:text-white'}`}
                >
                  {l === 'javascript' ? 'JS' : l}
                </button>
              ))}
              <span className="text-zinc-800">|</span>
              <button 
                onClick={() => {
                  const translated = getTranslatedCode(codes[activeTab], lang);
                  const blob = new Blob([translated], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  const extension = lang === 'c' ? 'c' : lang === 'python' ? 'py' : 'js';
                  link.download = `${activeTab}_structure.${extension}`;
                  link.click();
                  URL.revokeObjectURL(url);
                }} 
                className="px-2 py-0.5 border border-zinc-900 rounded bg-black/25 hover:border-[var(--accent)] hover:text-white text-zinc-400 text-[10.5px] transition-all"
                title="导出独立本端可执行源码"
              >
                📥 导出
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2.5 bg-[var(--bg-code)] font-mono text-[11.5px] leading-[1.75] scrollbar-thin">
            {getTranslatedCode(codes[activeTab], lang).split('\n').map((line, i) => {
              const adjustedLineNum = i + 1;
              const isActive = currentStep?.line === adjustedLineNum;
              return (
                <div
                  key={`${activeTab}-code-line-${i}`}
                  data-ds-line={adjustedLineNum}
                  className={`code-line flex py-[1.5px] pr-3 cursor-default transition-all border-l-2 ${isActive ? 'bg-cyan-500/10 text-white font-bold border-cyan-400' : 'border-transparent hover:bg-white/5'}`}
                >
                  <span className="line-num w-6 text-right pr-2 text-zinc-600 select-none shrink-0 text-[10px]">
                    {isActive ? '▶' : adjustedLineNum}
                  </span>
                  <span className="flex-1 whitespace-pre text-[11px] text-zinc-300" dangerouslySetInnerHTML={{ __html: highlightCode(line, lang) }} />
                </div>
              );
            })}
          </div>
          <div className="p-2.5 px-3 min-h-[38px] bg-[#0d0d22] border-t border-[var(--border)] text-[11.5px] text-[var(--text-sec)] flex items-start gap-1.5 max-w-full">
            <span className="inline-flex items-center justify-center w-4 min-w-[16px] h-4 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] font-sans font-bold italic text-[9px]">{lang === 'javascript' ? 'JS' : lang}</span>
            <span className="flex-1 text-[11.5px] font-sans truncate text-zinc-450">
              {currentStep ? currentStep.explanation : '操作左侧控制器，开始跟进指针和链表演化行为'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
