'use client';

import { useState, useEffect, useRef } from 'react';
import { highlightCode } from '@/lib/syntax';

interface TrackingState {
  line: number;
  msg: string;
  // Specific visual indicators
  activeElements?: number[];
  selectedIndices?: number[];
  matrix?: (number | string)[][];
  array1D?: number[];
  arrayHighlight?: number[];
  stats?: Record<string, string | number>;
  graphNodes?: { id: string; val: string; status: 'unvisited' | 'visiting' | 'visited' }[];
  graphEdges?: { u: string; v: string; w: number; active: boolean; mst?: boolean }[];
}

interface CustomInputs {
  greedyCoinsAmount: number;
  dpCoinsAmount: number;
  capacity: number;
  fibN: number;
  strA: string;
  strB: string;
}

interface MiniDef {
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
  genSteps: (inputs: CustomInputs) => TrackingState[];
}

const GREEDY_DEFS: MiniDef[] = [
  {
    id: 'g_activity',
    name: '区间调度 (Activity Selection)',
    en: 'Activity Selection Problem',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
    desc: '贪心法则：总是选择结束时间最早且不与已选区间冲突的活动，以容纳最多活动。',
    code: `void selectActivities(int start[], int end[], int n) {\n    // 已经按结束时间升序排序\n    int i = 0;\n    printf("Select activity 0\\n");\n    for (int j = 1; j < n; j++) {\n        if (start[j] >= end[i]) {\n            printf("Select activity %d\\n", j);\n            i = j;\n        }\n    }\n}`,
    explains: [
      '主入口，传入按结束时间排好序的活动开始与结束时间',
      '假定第 0 个活动(结束最早)必然入选，记录当前末尾指针 i = 0',
      '输出第 0 个选择',
      '从第 1 个活动开始依次评估后续区间 j',
      '贪心研判：判断活动 j 的开始时间是否晚于或等于上一入选活动 i 的结束时间',
      '不冲突！确认贪心采纳该活动，追加输出',
      '转移更新上一个入选位置 i = j',
      '闭合并继续后续步进扫描',
      '检索循环终止'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const starts = [1, 3, 0, 5, 8, 5];
      const ends =   [2, 4, 6, 7, 9, 9]; // sorted by ends
      s.push({ line: 0, msg: '开始区间活动度调度。原始事件列表已按结束时间升序排序完毕。', activeElements: [], selectedIndices: [] });
      s.push({ line: 1, msg: '贪心初始，直接选择结束时间最早的第一个活动 (0号: 1~2)。', activeElements: [0], selectedIndices: [0] });
      s.push({ line: 2, msg: '确认0号活动入选。设定前置末梢指针 i = 0。', activeElements: [0], selectedIndices: [0] });
      
      let last = 0;
      const sel = [0];
      for (let j = 1; j < starts.length; j++) {
        s.push({ line: 3, msg: `外循环：检测活动 ${j} (时间: ${starts[j]}~${ends[j]})。`, activeElements: [j], selectedIndices: [...sel] });
        s.push({ line: 4, msg: `判定：当前时间 ${starts[j]} 是否大于等于上次活动结束 ${ends[last]}？`, activeElements: [j, last], selectedIndices: [...sel] });
        if (starts[j] >= ends[last]) {
          sel.push(j);
          s.push({ line: 5, msg: `符合贪心不冲突！成功收录活动 ${j}。`, activeElements: [j], selectedIndices: [...sel] });
          last = j;
          s.push({ line: 6, msg: `指针拉进：更新 last = ${j}。`, activeElements: [j], selectedIndices: [...sel] });
        } else {
          s.push({ line: 4, msg: `冲突失配：活动 ${j} 起点 ${starts[j]} 早于上次结束 ${ends[last]}，舍弃。`, activeElements: [j, last], selectedIndices: [...sel] });
        }
      }
      s.push({ line: 8, msg: `全检索完毕。最终选择活动序列: [${sel.join(', ')}]`, activeElements: [], selectedIndices: [...sel] });
      return s;
    }
  },
  {
    id: 'g_knapsack',
    name: '分数背包 (Fractional Knapsack)',
    en: 'Fractional Knapsack',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
    desc: '贪心法则：将物品按单位价值(性价比)进行降序排序，优先全额打包性价王，放不下时可以对最后一个进行切分。',
    code: `double fractionalKnapsack(Item arr[], int n, int W) {\n    sortItem(arr, n); // 性价比价值/重量降序排序\n    double finalVal = 0.0;\n    for (int i = 0; i < n; i++) {\n        if (arr[i].weight <= W) {\n            W -= arr[i].weight;\n            finalVal += arr[i].val;\n        } else {\n            finalVal += arr[i].val * ((double)W / arr[i].weight);\n            break;\n        }\n    }\n    return finalVal;\n}`,
    explains: [
      '主入口，传入物品、节点数量 n，和总容量限制 W',
      '按照单位单价 (Value / Weight) 高低对物品进行优先降序排列',
      '定义并初始化总价值累计 finalVal = 0.0',
      '循环检查排序优秀的物品清单',
      '如果当前物品的剩余重量完全装得下 (weight <= W)',
      '扣减剩余可承重：W = W - weight',
      '直接吸收该部分的全部价值：finalVal += val',
      '否则（只放得下部分物品）',
      '比例切分贪心折现：加成 finalVal += val * (剩余可载 / 当前物重)',
      '容量塞满，提前中断退出',
      '循环闭合',
      '最终返回满载的总贪心得益'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const W = inputs.capacity;
      // Items: high price first
      const items = [
        { id: 'A', v: 60, w: 10, ratio: 6 },
        { id: 'B', v: 100, w: 20, ratio: 5 },
        { id: 'C', v: 120, w: 30, ratio: 4 }
      ];
      s.push({ line: 0, msg: `开始分数背包，限定限重 W = ${W}。`, activeElements: [], matrix: [] });
      s.push({ line: 1, msg: `物品已按单位价值排序：A(6/kg) > B(5/kg) > C(4/kg)。`, activeElements: [], matrix: [ ['物品', '价值', '重量', '单价'] ] });
      
      let curW = W;
      let profit = 0;
      const progress: (number|string)[][] = [['物品', '价值', '重量', '单价', '装入比例']];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        s.push({ line: 3, msg: `检测最具性价比排位 ${i}: ${item.id} (重 ${item.w}kg, 得益 ${item.v})。当前剩余容量: ${curW}kg`, activeElements: [i] });
        if (item.w <= curW) {
          curW -= item.w;
          profit += item.v;
          progress.push([item.id, item.v, item.w, item.ratio, '100%']);
          s.push({ line: 4, msg: `全额塞入！完全吃掉性价比物品 ${item.id}。`, activeElements: [i], matrix: [...progress], stats: { '剩余空间': curW, '总价值': profit } });
        } else {
          const ratio = curW / item.w;
          const portionVal = item.v * ratio;
          profit += portionVal;
          progress.push([item.id, item.v, item.w, item.ratio, `${(ratio*100).toFixed(0)}%`]);
          s.push({ line: 7, msg: `空间不足！对商品 ${item.id} 拆箱切分，只索取 ${curW}kg (比率 ${(ratio*100).toFixed(1)}%)。`, activeElements: [i], matrix: [...progress], stats: { '剩余空间': 0, '总价值': profit.toFixed(1) } });
          curW = 0;
          break;
        }
      }
      s.push({ line: 11, msg: `分数背包填充执行完成。累计极值总收益：${profit.toFixed(1)} 用户。`, matrix: [...progress] });
      return s;
    }
  },
  {
    id: 'g_huffman',
    name: '哈夫曼编码 (Huffman Coding)',
    en: 'Huffman Coding Tree',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
    desc: '贪心法则：将节点按词频放入小根堆，每次选出词频最低的两个节点，合成为一个新父节点再次放回。',
    code: `void buildHuffmanTree(char data[], int freq[], int size) {\n    MinHeapNode* left, *right, *top;\n    createMinHeap(nodes, size);\n    while (!isSizeOne()) {\n        left = extractMin();\n        right = extractMin();\n        top = newParentNode('$', left->freq + right->freq);\n        top->left = left; top->right = right;\n        insertMinHeap(top);\n    }\n}`,
    explains: [
      '哈夫曼树构造程序入口',
      '准备暂存临时合并节点及顶层汇总节点',
      '将所有字符节点放入低词频优先堆（小顶堆）',
      '只要堆中节点多于1，表示树未封顶，继续归集',
      '贪心弹出第1个词频最小的节点 left',
      '贪心弹出第2个词频最小的节点 right',
      '父节点生成：赋代号 $，取两者词频之和作为父节点权重',
      '构造树分叉：挂载 left 到左，right 到右',
      '将组合好的新父节点返还小顶堆，重估排序',
      '终止迭代'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const d = [{ k: 'A', f: 5 }, { k: 'B', f: 9 }, { k: 'C', f: 12 }, { k: 'D', f: 13 }, { k: 'E', f: 16 }, { k: 'F', f: 45 }];
      s.push({ line: 0, msg: '开始哈夫曼树构造。输入字符频率：F:45, E:16, D:13, C:12, B:9, A:5', matrix: [['字符', '频率']] });
      s.push({ line: 2, msg: '开局构建最小堆，频度最低的 A(5) 和 B(9) 处于树的最底端。', matrix: d.map(x => [x.k, x.f]) });
      s.push({ line: 3, msg: '堆大小大于 1，准备弹出最小的两个节点。', matrix: d.map(x => [x.k, x.f]) });
      s.push({ line: 4, msg: '提取第1最小节点：A(5)', matrix: d.slice(1).map(x => [x.k, x.f]) });
      s.push({ line: 5, msg: '提取第2最小节点：B(9)', matrix: d.slice(2).map(x => [x.k, x.f]) });
      s.push({ line: 6, msg: '合并生成父节点 $(14) = A(5) + B(9)。', matrix: [['$(A+B)', 14], ...d.slice(2).map(x => [x.k, x.f])] });
      s.push({ line: 8, msg: '将合并节点 $(14) 重塞回小根堆，重新形成堆顺序：C(12), D(13), $(14), E(16), F(45)' });
      s.push({ line: 3, msg: '循环继续，再次提取 C(12) 与 D(13) 进行合并，生成 $(25)节点...' });
      s.push({ line: 8, msg: '经过多次贪心归类，生成完成。最末极大型哈夫曼树树根总价值: 100 词频汇总。F 离根最近，分配一位编码 0，而 A 与 B 离根最远（长码：1100, 1101）。' });
      return s;
    }
  },
  {
    id: 'g_dijkstra',
    name: '最短路径 (Dijkstra\'s)',
    en: 'Dijkstra Routing',
    best: 'O(V²)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)',
    desc: '贪心法则：从当前所有“未访问”节点中，选择路程估值最短的一个，作为下一个确定的松弛锚点。',
    code: `void dijkstra(int graph[V][V], int src) {\n    int dist[V]; bool sptSet[V];\n    for (int i = 0; i < V; i++) dist[i] = INT_MAX, sptSet[i] = false;\n    dist[src] = 0;\n    for (int count = 0; count < V - 1; count++) {\n        int u = minDistance(dist, sptSet); // 贪心选取未入集合之最短距离点u\n        sptSet[u] = true;\n        for (int v = 0; v < V; v++)\n            if (!sptSet[v] && graph[u][v] && dist[u] != INT_MAX && dist[u] + graph[u][v] < dist[v])\n                dist[v] = dist[u] + graph[u][v]; // 辐射周围邻居松弛距离\n    }\n}`,
    explains: [
      '主入口，传入邻接矩阵和起点编号 src',
      '创建辅助距离表 dist[] 以及用来标识是否访问完毕的 sptSet[]',
      '初始化数据：所有节点暂不访问，除起点外其余路径假定无限远 (INT_MAX)',
      '确立起点距离为 0',
      '外循环：遍历其余每个点以便进行松弛确定',
      '贪心一跃：选择未处理的最短距离点 u (minDistance)',
      '标志置位：将节点 u 标定为已收录完成',
      '内遍历循环：寻找当前松弛出的所有相邻关联路径 v',
      '研判松弛：如果该路径更短，更新路程 dist[v] = dist[u] + cost',
      '辐射并填表刷新点距离',
      '内闭合',
      '最外圈合拢'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const nodes = [
        { id: 'SRC', val: '0', status: 'visited' as const },
        { id: 'B', val: '∞', status: 'unvisited' as const },
        { id: 'C', val: '∞', status: 'unvisited' as const },
        { id: 'D', val: '∞', status: 'unvisited' as const }
      ];
      s.push({ line: 0, msg: '开始迪杰斯特拉单源最短通路寻径。', graphNodes: nodes });
      s.push({ line: 2, msg: '初始化：设定起点 SRC 的初始累积代价为 0，其余未访问点为 ∞', graphNodes: nodes });
      s.push({ line: 5, msg: '贪心提取未处理最前端最短节点：SRC(0)。作为当前松弛主点。', graphNodes: nodes });
      
      const n2 = [
        { id: 'SRC', val: '0', status: 'visited' as const },
        { id: 'B', val: '4', status: 'visiting' as const },
        { id: 'C', val: '2', status: 'visiting' as const },
        { id: 'D', val: '∞', status: 'unvisited' as const }
      ];
      s.push({ line: 8, msg: '内圈探索 SRC 邻边：松弛到点 B 权值为 4，点 C 权值为 2。更新距离表。', graphNodes: n2 });
      
      const n3 = [
        { id: 'SRC', val: '0', status: 'visited' as const },
        { id: 'B', val: '4', status: 'unvisited' as const },
        { id: 'C', val: '2', status: 'visited' as const },
        { id: 'D', val: '∞', status: 'unvisited' as const }
      ];
      s.push({ line: 5, msg: '下一轮：贪心挑出未确立之距离最短点：C(2)。纳入已确定区域。', graphNodes: n3 });
      
      const n4 = [
        { id: 'SRC', val: '0', status: 'visited' as const },
        { id: 'B', val: '3', status: 'visiting' as const }, // from C: 2 + 1 = 3 < 4
        { id: 'C', val: '2', status: 'visited' as const },
        { id: 'D', val: '7', status: 'visiting' as const }  // from C: 2 + 5 = 7
      ];
      s.push({ line: 9, msg: '利用 C(2) 松弛相邻路径：到 B 路径权重缩短为 3 (2+1)，到 D 路径设为 7 (2+5)。', graphNodes: n4 });
      
      const n5 = [
        { id: 'SRC', val: '0', status: 'visited' as const },
        { id: 'B', val: '3', status: 'visited' as const },
        { id: 'C', val: '2', status: 'visited' as const },
        { id: 'D', val: '7', status: 'visited' as const }
      ];
      s.push({ line: 11, msg: '搜索圆满结束！所有点均已松弛达最优态。最终最短代价值：B:3, C:2, D:7。', graphNodes: n5 });
      return s;
    }
  },
  {
    id: 'g_kruskal',
    name: 'Kruskal 最小生成树',
    en: 'Kruskal MST',
    best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', space: 'O(V + E)',
    desc: '贪心法则：对全图所有边按权值升序排列，依次检验，只要这条边不使生成树产生环路（并查集实现），就将其收录。',
    code: `void KruskalMST(Edge edges[], int E, int V) {\n    sortEdges(edges, E); // 降升序排列所有边\n    Subset subsets[V];\n    for (int v = 0; v < V; v++) subsets[v].parent = v, subsets[v].rank = 0;\n    int e_count = 0, i = 0;\n    while (e_count < V - 1) {\n        Edge next_edge = edges[i++];\n        int x = find(subsets, next_edge.src);\n        int y = find(subsets, next_edge.dest);\n        if (x != y) {\n            MST_Add(next_edge);\n            Union(subsets, x, y);\n        }\n    }\n}`,
    explains: [
      '主入口，传入关联边集合 edges，以及图的定点与边阶数',
      '对全网内的边集，依权重(Cost)自小到大全局升序排好序',
      '分配辅助Union-Find（并查集）记录路径树树根',
      '并查集前置初始化操作，令每个顶点的始根为其本身',
      '控制已收集边数 e_count，及边表测试候选指针 i',
      '满足树连通停止条件：MST 的总边数必然等于 V - 1',
      '贪心选取：取出当前权值最小的下一条边 next_edge',
      '通过并查集查找获取当前边源点 src 所在的集合树根 x',
      '通过并查集查找获取当前边目标点 dest 所在的集合树根 y',
      '闭合并查检验环路：若根不同 (x != y)，证明加边决不致环',
      '完美采纳边：计入最小生成树 MST',
      '通过并查集合并：将两个集合融为一体 (Union)'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const edges = [
        { u: 'A', v: 'B', w: 1, active: false },
        { u: 'B', v: 'C', w: 3, active: false },
        { u: 'A', v: 'C', w: 4, active: false }
      ];
      s.push({ line: 0, msg: '开始克鲁斯卡尔(Kruskal)算法求最小生成树。', graphEdges: edges });
      s.push({ line: 1, msg: '贪心前置第一步：对所有关系边按权值排序：(A-B:1) < (B-C:3) < (A-C:4)', graphEdges: edges });
      s.push({ line: 6, msg: '取出并测试代价最轻的边 (A-B: 1)。', graphEdges: [{ u: 'A', v: 'B', w: 1, active: true, mst: false }, edges[1], edges[2]] });
      
      const e2 = [
        { u: 'A', v: 'B', w: 1, active: false, mst: true },
        edges[1],
        edges[2]
      ];
      s.push({ line: 10, msg: '并查集检测无环。同意合并！正式加入 MST。', graphEdges: e2 });
      s.push({ line: 6, msg: '取出权值第 2 小的边 (B-C: 3)。', graphEdges: [e2[0], { u: 'B', v: 'C', w: 3, active: true }, edges[2]] });
      
      const e3 = [
        e2[0],
        { u: 'B', v: 'C', w: 3, active: false, mst: true },
        edges[2]
      ];
      s.push({ line: 10, msg: '检测不构成并集冲突，成功收录该边。', graphEdges: e3 });
      s.push({ line: 6, msg: '判定：由于已收边数 V-1 = 2，生成树连通已达成，Kruskal 提前收网。', graphEdges: e3 });
      return s;
    }
  },
  {
    id: 'g_prim',
    name: 'Prim 最小生成树',
    en: 'Prim MST',
    best: 'O(V²)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)',
    desc: '贪心法则：起点任意，每次物色连接已入树节点集与未入树节点集的最短的一条割边并吞并其对岸点。',
    code: `void primMST(int graph[V][V]) {\n    int parent[V], key[V]; bool mstSet[V];\n    for (int i = 0; i < V; i++) key[i] = INT_MAX, mstSet[i] = false;\n    key[0] = 0; parent[0] = -1;\n    for (int count = 0; count < V - 1; count++) {\n        int u = minKey(key, mstSet); // 贪心：挑选切边代价最小的节点u\n        mstSet[u] = true;\n        for (int v = 0; v < V; v++) {\n            if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v]) {\n                parent[v] = u; key[v] = graph[u][v];\n            }\n        }\n    }\n}`,
    explains: [
      'Prim 节点主入口，传入连通网结构图',
      '分配 parent 数组追踪连通弧，key 用于存储切边最小估值，mstSet 防止重复建树',
      '默认每个点的划归权重为无穷大，初始化均未入树',
      '指定 0 号顶点为开辟树根',
      '大闭合控制收集边数 V-1 个',
      '贪心选取：挑选当前切口代价最小的临界点 u 加入生成树',
      '标志置位：确定纳入 MST 管理领域',
      '内遍历搜索从刚刚吸收节点 u 衍伸出的割边群 v',
      '贪心更新：若在切边附近发现去往该临界点 v 的权值更短',
      '刷新对应顶点的 parent 来源和其 key 的权位暂存',
      '两层内循环结束',
      '最外层闭合标志'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const nodes = [
        { id: 'A', val: '0 (入树)', status: 'visited' as const },
        { id: 'B', val: '∞', status: 'unvisited' as const },
        { id: 'C', val: '∞', status: 'unvisited' as const }
      ];
      s.push({ line: 0, msg: 'Prim 建树算法启动。随机选取 A 为筑网锚点。', graphNodes: nodes });
      s.push({ line: 3, msg: '初置设定：A(0)，邻域等待扩张。', graphNodes: nodes });
      s.push({ line: 5, msg: '取出估值最小的未入树节点 A。正式锁入。', graphNodes: nodes });
      
      const n2 = [
        { id: 'A', val: 'A(入树)', status: 'visited' as const },
        { id: 'B', val: 'key:2', status: 'visiting' as const },
        { id: 'C', val: 'key:4', status: 'visiting' as const }
      ];
      s.push({ line: 8, msg: '割边更新：借助 A 点对邻边摸排检索。到 B 新距离为 2，到 C 距离为 4。', graphNodes: n2 });
      
      const n3 = [
        { id: 'A', val: 'A(入树)', status: 'visited' as const },
        { id: 'B', val: '2 (入树)', status: 'visited' as const },
        { id: 'C', val: 'key:4', status: 'unvisited' as const }
      ];
      s.push({ line: 5, msg: '贪心挑选：下一个割边 key 最小的即 B(2)，将 B 吸收。', graphNodes: n3 });
      
      const n4 = [
        { id: 'A', val: 'A(入树)', status: 'visited' as const },
        { id: 'B', val: 'B(入树)', status: 'visited' as const },
        { id: 'C', val: 'key:3', status: 'visiting' as const } // optimized via B
      ];
      s.push({ line: 9, msg: '从 B 摸排边，发现 B-C 距离为 3 优于先前的 A-C (4)。更新 C 的割边引用。', graphNodes: n4 });
      return s;
    }
  },
  {
    id: 'g_job',
    name: '带期限作业调度 (Job Sequencing)',
    en: 'Job Sequencing',
    best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(n)',
    desc: '贪心法则：按利润从高到低排序，排定时间时，总是尽力将高利润作业分配到它允许的最后一个时间片。',
    code: `void jobSequencing(Job arr[], int n) {\n    sortJobsByProfit(arr, n); // 性比利润降序排序\n    bool slot[n];\n    for (int i = 0; i < n; i++) slot[i] = false;\n    for (int i = 0; i < n; i++) {\n        for (int j = min(n, arr[i].deadline) - 1; j >= 0; j--) {\n            if (slot[j] == false) {\n                slot[j] = true;\n                printf("Schedule job %s at timeSlot %d\\n", arr[i].id, j);\n                break;\n            }\n        }\n    }\n}`,
    explains: [
      '带期限作业最大收益调度开始',
      '极其重要贪心准备：按利润高低对 Job 进行降序大排序',
      '分配时间位槽标识 slot[]，标记每个小时是否被占用',
      '全部位置默认清空（可接受排任）',
      '作业主扫描循环，率先处理利润一等奖的作业',
      '自该作业期限的最后可托日子（截止时刻）向前倒计时摸排空缺',
      '若探测到之前存在未占空位槽 slot[j] == false',
      '占领位标志位置为 busy (slot[j] = true)',
      '输出正确被该高暴利方案征募入驻的时刻片 j',
      '锁定并即刻截止本作业对空位的争夺，让位给后续计划',
      '倒序寻找空隙结束',
      '作业外循环结束'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const J = [
        { id: 'J1', p: 100, d: 2 },
        { id: 'J2', p: 60, d: 1 },
        { id: 'J3', p: 40, d: 2 }
      ];
      s.push({ line: 0, msg: '开始高盈利作业最佳期限排列规划。', matrix: [ ['计划', '利润', '时效'] ] });
      s.push({ line: 1, msg: '将作业按最高利润进行倒排序：J1(100) > J2(60) > J3(40)', matrix: J.map(x => [x.id, x.p, x.d]) });
      s.push({ line: 4, msg: '审查作业 1：J1 (利润 100，截止 2h)。首战选择。', activeElements: [0] });
      s.push({ line: 6, msg: '为 J1 腾位：由于期限是 2h，在区间时间表末尾分配：第 2 个时间片。', activeElements: [0], stats: { '时间片 0': '空', '时间片 1': 'J1' } });
      s.push({ line: 4, msg: '审查作业 2：J2 (利润 60，截止 1h)。', activeElements: [1] });
      s.push({ line: 7, msg: '为 J2 腾位：在期限第 1 个小时时间片（小时[0]）填充。', activeElements: [1], stats: { '时间片 0': 'J2', '时间片 1': 'J1' } });
      s.push({ line: 4, msg: '审查作业 3：J3 (利润 40，截止 2h)。', activeElements: [2] });
      s.push({ line: 5, msg: '查看位置：J3 理想坑位已被前面高利润组占领，遗弃。', activeElements: [2], stats: { '时间片 0': 'J2', '时间片 1': 'J1' } });
      return s;
    }
  },
  {
    id: 'g_coins',
    name: '找零钱 (Greedy Coins)',
    en: 'Greedy Coin Change',
    best: 'O(k)', avg: 'O(k)', worst: 'O(k)', space: 'O(1)',
    desc: '贪心法则：从币值最高开始，尽量多地选择单面额最大钞票，直至筹齐目标额（对法定制币完美适用）。',
    code: `void greedyChange(int coins[], int size, int val) {\n    for (int i = 0; i < size; i++) {\n        while (val >= coins[i]) {\n            printf("Give coin: %d\\n", coins[i]);\n            val -= coins[i];\n        }\n    }\n}`,
    explains: [
      '主找零钱入口，面额数组 coins 已按从大到小有序组织',
      '从最高大面额硬币开始，自左向右检索',
      '只要凑合的目标数值还装得下当前币种 size',
      '贪心出库！发放该大额钱币',
      '递减折现，削减需找零价值段'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const coins = [100, 50, 20, 10, 5, 1];
      let val = inputs.greedyCoinsAmount;
      s.push({ line: 0, msg: `开始贪心极简面额找零。待凑目标 = ¥${val}`, array1D: [] });
      
      const res: number[] = [];
      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (val >= coin) {
          s.push({ line: 1, msg: `检索高比格面额 ¥${coin}，可以吸纳。`, arrayHighlight: [i] });
          while (val >= coin) {
            val -= coin;
            res.push(coin);
            s.push({ line: 2, msg: `贪心取下一枚 ¥${coin}，还剩待凑额 ¥${val}`, array1D: [...res], arrayHighlight: [i] });
          }
        } else {
          s.push({ line: 1, msg: `面额 ¥${coin} 溢出了，跳过并滑向更小单位。`, arrayHighlight: [i] });
        }
      }
      s.push({ line: 0, msg: `完成找零！共用硬币：[${res.join(', ')}]，总数: ${res.length} 枚。`, array1D: [...res] });
      return s;
    }
  },
  {
    id: 'g_kcenters',
    name: 'K-中心选择 (K-Centers)',
    en: 'K-Centers Approximation',
    best: 'O(n * k)', avg: 'O(n * k)', worst: 'O(n * k)', space: 'O(n)',
    desc: '贪心法则：挑选第一个中心后，每次选取离当前已选中心集合最远的那一个点，并将其作为下一个加入。',
    code: `void selectKCenters(int k, int dist[V][V]) {\n    vector<int> centers;\n    centers.push_back(0); // 任选首中心\n    for (int i = 1; i < k; i++) {\n        int next_center = findFarWestPoint(centers);\n        centers.push_back(next_center);\n    }\n}`,
    explains: [
      '中心选择函数，要挑选出 k 个战略网点',
      '数组 centers 记录确立的枢纽标位',
      '贪心初始：通常任意选定首位 0 作为第 1 个站长中心',
      '启动外循环，物色后续 k-1 个极值节点',
      '计算寻找离当前已有中心圈集距离最远的那个死角点',
      '选拔加冕：纳为下一代聚类中心枢纽'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      s.push({ line: 0, msg: '开始 K-中心(K-Centers)近似网络选址分配。' });
      s.push({ line: 2, msg: '第一步：直取首中心 center-0，置入枢纽中心，并标定坐标。', activeElements: [0] });
      s.push({ line: 3, msg: '开始探路以锁定下两个重要据点。' });
      s.push({ line: 4, msg: '核算各节点距离。寻找距离 center-0 最远的游离点 Node-4。', activeElements: [0, 4] });
      s.push({ line: 5, msg: '第2中心加冕：成功选定 Node-4。', activeElements: [0, 4] });
      return s;
    }
  },
  {
    id: 'g_interval',
    name: '区间染色 (Interval Coloring)',
    en: 'Interval Coloring',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
    desc: '贪心法则：按开始时间升序排列。每次尽可能将其分配入不冲突且已分配好的教室/色格，否则新建教室。',
    code: `void scheduleRooms(Interval arr[], int n) {\n    sortByStartTime(arr, n); // 按起点排序\n    int rooms = 0;\n    for (int i = 0; i < n; i++) {\n        int r = findFreeRoom(arr[i]);\n        if (r == -1) rooms++, lockRoom(rooms, arr[i]);\n        else allocateRoom(r, arr[i]);\n    }\n}`,
    explains: [
      '主入口，传入待分配区间活动表',
      '先将所有事件按上课开始时刻 (StartTime) 依次整齐排好序',
      '定义总共所需开辟的教室数目 rooms = 0',
      '遍历寻找每一堂课程的插入机遇',
      '寻找有没有已经建立且此时处于空闲防冲突的空位 r',
      '没有闲置可用教室 (r == -1)，迫不得已扩建加房数，指派进该新开区域',
      '检索到可用空档：将该事件填入已有教室 r 中，高频利用资源',
      '分配完毕'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const raw = [
        { id: 'Math', s: 9, e: 11 },
        { id: 'Eng', s: 10, e: 12 },
        { id: 'CS', s: 11, e: 13 }
      ];
      s.push({ line: 0, msg: '区间染色(Interval Coloring) 教室资源优化分配。' });
      s.push({ line: 1, msg: '先按开课时间排序：Math(9:00) < Eng(10:00) < CS(11:00)', matrix: [['学科', '上课', '下课']] });
      s.push({ line: 3, msg: '探索 Math (9:00~11:00)。目前完全没有可用教室。', activeElements: [0] });
      s.push({ line: 5, msg: '由于找不到匹配，新开【1号教室】，容纳 Math 系列。', activeElements: [0], stats: { '1号教室': 'Math' } });
      s.push({ line: 3, msg: '探索 Eng (10:00~12:00)。在 10:00 时 1 号教室仍被占领。', activeElements: [1] });
      s.push({ line: 5, msg: '冲突发生！唯有新申请扩建【2号教室】，挂牌入驻 Eng。', activeElements: [1], stats: { '1号教室': 'Math', '2号教室': 'Eng' } });
      s.push({ line: 3, msg: '探索 CS (11:00~13:00)。此时由于 Math 刚好下课撤退！', activeElements: [2] });
      s.push({ line: 6, msg: '贪心复用：CS 使用已释放的 1 号教室，完美融合不冲突。', activeElements: [2], stats: { '1号教室': 'Math -> CS', '2号教室': 'Eng' } });
      return s;
    }
  }
];

const DP_DEFS: MiniDef[] = [
  {
    id: 'dp_fib',
    name: '递推斐波那契 (Fibonacci DP)',
    en: 'Fibonacci Tabulation',
    best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)',
    desc: '自底向上：通过一个简单 1D DP 数组直接算出状态的值：F[i] = F[i-1] + F[i-2], 打破指数级暴风。',
    code: `int fib(int n) {\n    int f[n + 2];\n    f[0] = 0; f[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        f[i] = f[i - 1] + f[i - 2];\n    }\n    return f[n];\n}`,
    explains: [
      '斐波那契求值主入口',
      '声明一个 1D 表格 F[]，避免昂贵的递归重复分支',
      '奠定 DP 塔基：F[0] = 0, F[1] = 1，定义边界初状态',
      '外步递推：自 2 开始一直填充格子至设定第 n 个数据为止',
      '状态决策转移：当前值是最近前两个格子和的累加 F[i] = F[i-1] + F[i-2]',
      '环路终止',
      '向出口返回已经安全固化好的第 n 阶终极结果'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const n = inputs.fibN;
      s.push({ line: 0, msg: `斐波那契递推(Tabulation 状态表格化)。待估第 N = ${n} 项。`, array1D: [] });
      s.push({ line: 1, msg: `开辟 size 为 ${n + 1} 的一维 DP 缓存表。`, array1D: [] });
      
      const f = new Array(n + 1).fill(0);
      f[0] = 0;
      if (n > 0) f[1] = 1;
      
      s.push({ line: 2, msg: `铺设根基初始态：F[0] = 0, F[1] = 1。`, array1D: [...f], arrayHighlight: [0, 1] });
      
      for (let i = 2; i <= n; i++) {
        f[i] = f[i - 1] + f[i - 2];
        s.push({ line: 4, msg: `动态规划转移：F[${i}] = F[${i - 1}] (${f[i - 1]}) + F[${i - 2}] (${f[i - 2]}) = ${f[i]}`, array1D: [...f], arrayHighlight: [i - 1, i - 2, i] });
      }
      s.push({ line: 6, msg: `最终递推计算顺利完成。F[${n}] = ${f[n]}。`, array1D: [...f] });
      return s;
    }
  },
  {
    id: 'dp_knapsack',
    name: '0-1 背包问题 (0-1 Knapsack)',
    en: '0-1 Knapsack DP',
    best: 'O(nW)', avg: 'O(nW)', worst: 'O(nW)', space: 'O(nW)',
    desc: '决策公式：DP[i][w] = max(DP[i-1][w], DP[i-1][w-wt[i-1]] + val[i-1])；装与不装，两重世界中取最优。',
    code: `int knapSack(int W, int wt[], int val[], int n) {\n    int dp[n + 1][W + 1];\n    for (int i = 0; i <= n; i++) {\n        for (int w = 0; w <= W; w++) {\n            if (i == 0 || w == 0)\n                dp[i][w] = 0;\n            else if (wt[i - 1] <= w)\n                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);\n            else\n                dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][W];\n}`,
    explains: [
      '背包 DP 入口',
      '申请二维决策表 dp[n+1][W+1]',
      '行约束：循环遍历可选取的物品序列 i (0 到 n)',
      '列约束：循环遍历可用各档位极限压力 w (0 到 W)',
      '基准测试，当无物品或体积为 0 时直接归零',
      '初基置零',
      '如果当前行物品能够被当前负重装下 (wt[i-1] <= w)',
      '在“放下新物品并享受增益 + 剩余重量状态”和“不带它仍保持上一重价值”间取大者，做出最佳转移',
      '如果承载不住物品分量，无可选择',
      '只能平移：平盘继承上一行的价值分量',
      '内遍历结束',
      '两层内循环结束',
      '返回最右底角的最优全额结清极值'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const W = inputs.capacity;
      const wt = [2, 3, 5];
      const val = [10, 15, 30];
      const n = wt.length;

      // Init 2D DP Table 
      const dpMatrix: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
      s.push({ line: 0, msg: `0-1背包DP大幕拉开。总承重 W = ${W}。三个物品：Wt[2,3,5], Val[10,15,30]`, matrix: [...dpMatrix] });
      s.push({ line: 1, msg: `申请 ${n + 1} * ${W + 1} 二维规划抉择矩阵。`, matrix: [...dpMatrix] });

      for (let i = 0; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
          if (i === 0 || w === 0) {
            dpMatrix[i][w] = 0;
            if (w === 0) s.push({ line: 5, msg: `填零初始：当物品为0或载重为0，价值必然为0。`, matrix: dpMatrix.map(r => [...r]) });
          } else if (wt[i - 1] <= w) {
            const pick = val[i - 1] + dpMatrix[i - 1][w - wt[i - 1]];
            const drop = dpMatrix[i - 1][w];
            dpMatrix[i][w] = Math.max(pick, drop);
            s.push({ 
              line: 7, 
              msg: `物品${i} (重${wt[i-1]}, 值${val[i-1]}) 遇承重档W=${w}：选(值+余重格): ${pick} 🆚 放弃(直接头顶格): ${drop}，最大值 = ${dpMatrix[i][w]}`,
              matrix: dpMatrix.map(r => [...r])
            });
          } else {
            dpMatrix[i][w] = dpMatrix[i - 1][w];
            s.push({ line: 9, msg: `物品${i}过于庞大(重${wt[i-1]}kg)，该档负重 w=${w} 接纳不下，被迫直读上代：${dpMatrix[i][w]}`, matrix: dpMatrix.map(r => [...r]) });
          }
        }
      }
      s.push({ line: 12, msg: `全表填毕。最终得出最大全景组合收益最高值：${dpMatrix[n][W]}`, matrix: dpMatrix.map(r => [...r]) });
      return s;
    }
  },
  {
    id: 'dp_lcs',
    name: '最长公共子序列 (LCS)',
    en: 'Longest Common Subsequence',
    best: 'O(mn)', avg: 'O(mn)', worst: 'O(mn)', space: 'O(mn)',
    desc: '决策公式：字符匹配时 DP[i][j] = DP[i-1][j-1] + 1，失配时取左格和上格的大者，逐步寻找字符串交集。',
    code: `int lcs(char* X, char* Y, int m, int n) {\n    int L[m + 1][n + 1];\n    for (int i = 0; i <= m; i++) {\n        for (int j = 0; j <= n; j++) {\n            if (i == 0 || j == 0)\n                L[i][j] = 0;\n            else if (X[i - 1] == Y[j - 1])\n                L[i][j] = L[i - 1][j - 1] + 1;\n            else\n                L[i][j] = max(L[i - 1][j], L[i][j - 1]);\n        }\n    }\n    return L[m][n];\n}`,
    explains: [
      '主入口，传入字符序列 X、Y 及其特征大小 m，n',
      '声明二维比对决策网格 L[m+1][n+1]',
      '探查行游标 i，对应匹配 X 的第 i 位字符',
      '探查列游标 j，对应匹配 Y 的第 j 位字符',
      '基础设零：第一行或空置边界，无同序列可言',
      '边缘初始化置为 0',
      '大突破！当探针字符恰好咬合一致 (X[i-1] == Y[j-1])',
      '斜角前移转移状态：累积一分 L[i][j] = L[i-1][j-1] + 1',
      '失配情景（字符错位不一致）',
      '左右兼顾：在“放弃 X[i] 维持旧量”和“放弃 Y[j] 维持前序”两路分支 L[i-1][j], L[i][j-1] 取大，延续前朝气度',
      '内层闭环',
      '外圈闭合',
      '返回尾端坐标，即最长同序长度结果'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const X = inputs.strA;
      const Y = inputs.strB;
      const m = X.length;
      const n = Y.length;
      
      const matrix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      s.push({ line: 0, msg: `启动 LCS 子序列探寻。主串 A: "${X}", 模式 B: "${Y}"。`, matrix: [...matrix] });
      s.push({ line: 1, msg: `初始化二维匹配格 ${m + 1} * ${n + 1}。`, matrix: [...matrix] });

      for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
          if (i === 0 || j === 0) {
            matrix[i][j] = 0;
          } else if (X[i - 1] === Y[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1] + 1;
            s.push({ line: 7, msg: `字符完全吻合 A[${i-1}]('${X[i-1]}') == B[${j-1}]('${Y[j-1]}')! LCS斜角步进，值增加：${matrix[i][j]}`, matrix: matrix.map(r => [...r]) });
          } else {
            matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            s.push({ line: 9, msg: `失匹配对：A[${i-1}](${X[i-1]}) != B[${j-1}](${Y[j-1]})。取左格(${matrix[i][j-1]}) 🆚 上格(${matrix[i-1][j]})的最大值: ${matrix[i][j]}`, matrix: matrix.map(r => [...r]) });
          }
        }
      }
      s.push({ line: 12, msg: `递推求解完成！最长公共子序列长度为: ${matrix[m][n]}`, matrix: matrix.map(r => [...r]) });
      return s;
    }
  },
  {
    id: 'dp_lis',
    name: '最长递增子序列 (LIS)',
    en: 'Longest Increasing Subsequence',
    best: 'O(n log n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(n)',
    desc: '决策公式：DP[i] = 1 + max(DP[j]) (j < i 且 Arr[j] < Arr[i])；步步回头搜寻，建立层级攀升记录。',
    code: `int lis(int arr[], int n) {\n    int lis[n], max_val = 0;\n    for (int i = 0; i < n; i++) lis[i] = 1;\n    for (int i = 1; i < n; i++) {\n        for (int j = 0; j < i; j++) {\n            if (arr[i] > arr[j] && lis[i] < lis[j] + 1)\n                lis[i] = lis[j] + 1;\n        }\n    }\n    for (int i = 0; i < n; i++) if (max_val < lis[i]) max_val = lis[i];\n    return max_val;\n}`,
    explains: [
      '主入口，传入无序系列数组与基数大小 n',
      '声明辅助 1D 数组 lis[] 标识以当前格直接打底的前缀长，及全局最大 LIS 暂存',
      '由于单字本色即自称队列，初设为 1',
      '主移外指针 i 自 1 位步进扫描至边缘',
      '铺垫内指针 j 从 0 号哨位向前方探索到 i',
      '核心递增决策：若前序元素数字 arr[i] 真正大于 arr[j]，确认上升关系，且此时前缀组合价值更高 (lis[i] < lis[j] + 1)',
      '果断确立并更新最佳晋级长度纪录：lis[i] = lis[j] + 1',
      '内探j循环边界',
      '大循环终止，启动 LIS 统计：遍历所有节点查找最大 LIS 表项',
      '挑选全局最大成就极值返回，算法完成'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const arr = [10, 22, 9, 33, 21, 50];
      const n = arr.length;
      const dp = new Array(n).fill(1);
      s.push({ line: 0, msg: `开始最长递增子序列规划。分析数组: [10, 22, 9, 33, 21, 50]`, array1D: [...dp] });
      s.push({ line: 2, msg: `一维 LIS 状态数组初始化，各个位置独立成线默认起始长度为 1。`, array1D: [...dp] });
      
      for (let i = 1; i < n; i++) {
        s.push({ line: 3, msg: `外位 i = ${i} (当前处理数值: ${arr[i]})。寻觅先导。`, arrayHighlight: [i] });
        for (let j = 0; j < i; j++) {
          if (arr[i] > arr[j] && dp[i] < dp[j] + 1) {
            dp[i] = dp[j] + 1;
            s.push({ line: 6, msg: `接连成功！数值 arr[${i}](${arr[i]}) > arr[${j}](${arr[j]}) 形成上升链。更新 LIS[${i}] 到极致: ${dp[i]}`, array1D: [...dp], arrayHighlight: [i, j] });
          }
        }
      }
      s.push({ line: 9, msg: `LIS 处理全线终了。寻找最大数获得：LIS最终长度为 ${Math.max(...dp)}`, array1D: [...dp] });
      return s;
    }
  },
  {
    id: 'dp_matrix',
    name: '矩阵链乘积 (Matrix Chain)',
    en: 'Matrix Chain Product',
    best: 'O(n³)', avg: 'O(n³)', worst: 'O(n³)', space: 'O(n²)',
    desc: '决策公式：DP[i][j] = min(DP[i][k] + DP[k+1][j] + Cost)；括号排布怎么优，多点切分查表寻规律。',
    code: `int matrixChain(int p[], int n) {\n    int m[n][n];\n    for (int i = 1; i < n; i++) m[i][i] = 0;\n    for (int L = 2; L < n; L++) {\n        for (int i = 1; i < n - L + 1; i++) {\n            int j = i + L - 1;\n            m[i][j] = INT_MAX;\n            for (int k = i; k <= j - 1; k++) {\n                int q = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];\n                if (q < m[i][j]) m[i][j] = q;\n            }\n        }\n    }\n    return m[1][n - 1];\n}`,
    explains: [
      '主求解程序，传入各段矩阵尺寸围栏维度 p[]',
      '开辟二维跨越段区间决策表 m[n][n]',
      '初始斜切面设置，单个矩阵本身不需要乘积代价，对应值归为零',
      'L表示当前计算区间长度跨度 (自2到n)',
      '寻起始位游标 i',
      '计算获取对端跨越完节点 j',
      '置暂存位最大代偿无限大（INT_MAX）以待比小',
      '中继分裂点 k 循环（从 i 直到 j-1 分别卡位置试）',
      '计算合并消耗转移：左斜乘积代价 + 右斜乘积代价 + 拼合产生开销 p[i-1]*p[k]*p[j]',
      '极轻判定：如果测试得到的计算数更小，果断吃进。m[i][j] = q',
      '内层分裂切削 k 终止',
      '内圈行位移终止',
      '外圈矩阵合并阶段求毕'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const mSize = 4; // A1, A2, A3
      const dp: any[][] = Array.from({ length: mSize }, () => new Array(mSize).fill(0));
      s.push({ line: 0, msg: '开始矩阵链乘积(Matrix Chain)求解代偿。输入维度：10x20, 20x30, 30x40', matrix: dp });
      s.push({ line: 2, msg: '对角线对齐：自己相乘代价毫无悬念为 0。', matrix: dp });
      s.push({ line: 3, msg: '长度 L=2。考虑 A1 A2 相乘，以及 A2 A3 相乘的总运算量。', matrix: dp });
      s.push({ line: 8, msg: '切分试验：计算 dp[1][2]... 代价得出 6000 并安全存入。' });
      return s;
    }
  },
  {
    id: 'dp_edit',
    name: '编辑距离 (Edit Distance)',
    en: 'Levenstein Distance',
    best: 'O(mn)', avg: 'O(mn)', worst: 'O(mn)', space: 'O(mn)',
    desc: '决策公式：若 A[i]==B[j] 直取斜角，否则取 DP[i-1][j](删除)、DP[i][j-1](插入)、DP[i-1][j-1](替换)中最少动作并增1。',
    code: `int editDist(char* str1, char* str2, int m, int n) {\n    int dp[m + 1][n + 1];\n    for (int i = 0; i <= m; i++) {\n        for (int j = 0; j <= n; j++) {\n            if (i == 0) dp[i][j] = j;\n            else if (j == 0) dp[i][j] = i;\n            else if (str1[i - 1] == str2[j - 1])\n                dp[i][j] = dp[i - 1][j - 1];\n            else\n                dp[i][j] = 1 + min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);\n        }\n    }\n    return dp[m][n];\n}`,
    explains: [
      '主编辑距离探空入口',
      '创建二维编辑格子决策表 dp[m+1][n+1]',
      '主串 X 执行长度位置 i 行数搜索',
      '辅串 Y 执行长度位置 j 列数搜索',
      '第一行空档设置，意味着所有的步骤全都是增加插入，对应值为 j',
      '第一列空档设置，意味着所有的步骤全都是做移除，对应值为 i',
      '大幸运：如果正好字符一致 (str1[i-1] == str2[j-1])',
      '免消耗置位，直读斜下方历史状态：dp[i][j] = dp[i-1][j-1]',
      '其余产生变动修改方案',
      '在“新增（j-1格）”、“剔除（i-1格）”、“替换（尖端斜底格）”三个策略的方案里选取最低改动消费，加改动消费 1',
      '内层遍历结束',
      '两层内循环结束',
      '回传终极右底位置格子，为最少消耗编辑工序数'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const X = inputs.strA;
      const Y = inputs.strB;
      const m = X.length;
      const n = Y.length;
      
      const dp: (number|string)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      s.push({ line: 0, msg: `开始编辑距离求解。源: "${X}" -> 最终: "${Y}"。`, matrix: dp });
      
      for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
          if (i === 0) {
            dp[i][j] = j;
          } else if (j === 0) {
            dp[i][j] = i;
          } else if (X[i - 1] === Y[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
            s.push({ line: 7, msg: `字符完美一致 A[${i-1}]('${X[i-1]}') == B[${j-1}]('${Y[j-1]}')。继承左斜角代价: ${dp[i][j]}`, matrix: dp.map(r => [...r]) });
          } else {
            const ins = dp[i][j - 1] as number;
            const del = dp[i - 1][j] as number;
            const rep = dp[i - 1][j - 1] as number;
            dp[i][j] = 1 + Math.min(ins, del, rep);
            s.push({ 
              line: 9, 
              msg: `不吻合：增一分动作。评估 [插入:${ins}, 删除:${del}, 替换:${rep}] 的最低动作, 值 = ${dp[i][j]}`,
              matrix: dp.map(r => [...r])
            });
          }
        }
      }
      return s;
    }
  },
  {
    id: 'dp_coins',
    name: '极简找零钱 (Coin Change DP)',
    en: 'Coin Change Minimum Coins',
    best: 'O(mv)', avg: 'O(mv)', worst: 'O(mv)', space: 'O(v)',
    desc: '决策公式：DP[i] = min(DP[i], DP[i - Coin] + 1)；硬币无限，扫过各等零钱额，自底向上累计最低张数。',
    code: `int minCoins(int coins[], int m, int V) {\n    int table[V + 1];\n    table[0] = 0;\n    for (int i = 1; i <= V; i++) table[i] = INT_MAX;\n    for (int i = 1; i <= V; i++) {\n        for (int j = 0; j < m; j++) {\n            if (coins[j] <= i) {\n                int sub_res = table[i - coins[j]];\n                if (sub_res != INT_MAX && sub_res + 1 < table[i])\n                    table[i] = sub_res + 1;\n            }\n        }\n    }\n    return table[V];\n}`,
    explains: [
      '主入口，传入币值数组 coins、硬币数量 m、目标总钱数 V',
      '创建 1D DP 备忘层级数组 table[V+1]',
      '开辟根基 table[0] = 0 (零元自然需要 0 枚硬币凑)',
      '将其余位置设定为无穷大（INT_MAX）',
      '外步推进：逐元逼进 table，从小额 1 元拼到 V 元',
      '内遍历：测试所有已知硬币面额 j',
      '当硬币额足够填补当前正在递增凑的数值 (coins[j] <= i)',
      '查备份：找到之前刨除该币值后余下额度 table[i-coin] 的表现',
      '若有解且该支线更省硬币：其张数 +1 比当前的少',
      '抉择采纳更新：table[i] = sub_res + 1',
      '内部分叉闭合',
      '两层内循环结束',
      '返回尾部 table[V]，若等于 INFINITY 证明在定制货币下目标无解'
    ],
    genSteps: (inputs) => {
      const s: TrackingState[] = [];
      const C = [1, 3, 5];
      const V = inputs.dpCoinsAmount;
      const dp = new Array(V + 1).fill(999);
      dp[0] = 0;
      
      s.push({ line: 0, msg: `开始最少硬币硬核找零。面额:[1, 3, 5]，目标 ¥${V}。`, array1D: [...dp] });
      s.push({ line: 2, msg: `设定 table[0] = 0 元根基状态。其它的设假定极大值 999。`, array1D: [...dp] });

      for (let i = 1; i <= V; i++) {
        s.push({ line: 4, msg: `外循环：开始推导凑 ¥${i} 需要的最少硬币数。`, arrayHighlight: [i] });
        for (let j = 0; j < C.length; j++) {
          const coin = C[j];
          if (coin <= i) {
            const sub = dp[i - coin];
            if (sub !== 999 && sub + 1 < dp[i]) {
              dp[i] = sub + 1;
              s.push({ 
                line: 9, 
                msg: `硬币 ¥${coin} 适用：¥${i} 钱找 ¥${coin} 面值后余 ¥${i-coin}。由于 1 + table[${i-coin}] (${sub}) < table[${i}]，更新零钱格 table[${i}] = ${dp[i]}`,
                array1D: [...dp],
                arrayHighlight: [i, i - coin] 
              });
            }
          }
        }
      }
      s.push({ line: 12, msg: `找零钱规划完成。最少需要硬币总张数：${dp[V]} 枚。`, array1D: [...dp] });
      return s;
    }
  },
  {
    id: 'dp_floyd',
    name: '多源最短路 (Floyd-Warshall)',
    en: 'Floyd Warshall DP',
    best: 'O(V³)', avg: 'O(V³)', worst: 'O(V³)', space: 'O(V²)',
    desc: '决策公式：Dist[i][j] = min(Dist[i][j], Dist[i][k] + Dist[k][j])；借中间点k过桥，刷新所有的通途。',
    code: `void floydWarshall(int graph[V][V]) {\n    int dist[V][V], i, j, k;\n    for (i = 0; i < V; i++) {\n        for (j = 0; j < V; j++) dist[i][j] = graph[i][j];\n    }\n    for (k = 0; k < V; k++) {\n        for (i = 0; i < V; i++) {\n            for (j = 0; j < V; j++) {\n                if (dist[i][k] + dist[k][j] < dist[i][j])\n                    dist[i][j] = dist[i][k] + dist[k][j];\n            }\n        }\n    }\n}`,
    explains: [
      '所有多节点最短路径算法入口',
      '定义并开辟距离转移图表 dist[V][V]',
      '把图的原始邻接物理通路完全塞入转移图表中，建立原初始图',
      '一二层原初赋代完',
      '核心中转点 k 大循环（让各顶点依次扮演中间过桥点的角色）',
      '行源探测游标 i',
      '列汇目的地探测游标 j',
      '核心中继判定：倘若跨越 K 中断比直接两点拉线过去 dist[i][j] 代价更低',
      '更新决策通路，吃进最短路：dist[i][j] = dist[i][k] + dist[k][j]',
      '内j层更新完毕',
      'i层闭环',
      '大K演替毕'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const dist: any[][] = [
        [0, 3, 99, 5],
        [2, 0, 1, 99],
        [99, 99, 0, 2],
        [99, 99, 99, 0]
      ];
      s.push({ line: 0, msg: '弗洛伊德多源最短路径分析拉开序幕。', matrix: dist });
      s.push({ line: 2, msg: '预置默认边：1号到2号=3，1到4=5，2到3=1（99代表两点不连通，代价无限）。', matrix: dist });
      s.push({ line: 4, msg: '选择 2 号节点做中继桥。', matrix: dist });
      s.push({ line: 8, msg: '路径优化：发现 1 -> 2 -> 3 综合代偿仅为 4 (3+1) < 99。更新 1->3 的距离！', matrix: [ [0,3,4,5], [2,0,1,99], [99,99,0,2], [99,99,99,0] ] });
      return s;
    }
  },
  {
    id: 'dp_paths',
    name: '网格不同路径数 (Unique Paths)',
    en: 'Unique Paths DP',
    best: 'O(mn)', avg: 'O(mn)', worst: 'O(mn)', space: 'O(mn)',
    desc: '决策公式：DP[i][j] = DP[i-1][j] + DP[i][j-1]；只能朝右或朝下，每个格子的路径数等于左格和上格之和。',
    code: `int uniquePaths(int m, int n) {\n    int dp[m][n];\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {\n            if (i == 0 || j == 0) dp[i][j] = 1;\n            else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}`,
    explains: [
      '独特路径数探索主程序',
      '开辟 m * n 二维单元网格 DP 表',
      '行循环推进游标',
      '列循环推进游标',
      '如果位于顶缘（只能一路向右）或左边缘（只能一路向下），抵达路径归一：1',
      '中圈主体决策：当前格方案等于上方邻舍 dp[i-1][j] 与左侧手足 dp[i][j-1] 通路方案数目之和',
      '内遍历结束',
      '两层内循环结束',
      '返回右下脚终极终点被汇集计算达到的路径大总成'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const m = 3, n = 3;
      const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
      s.push({ line: 0, msg: '启动独立方向独特路径。目标为从左上单元直抵右下端。', matrix: dp });
      
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (i === 0 || j === 0) {
            dp[i][j] = 1;
          } else {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            s.push({ line: 5, msg: `规划求和：单元格 [${i}][${j}] = 上方格方案数 (${dp[i - 1][j]}) + 左方格方案数 (${dp[i][j - 1]}) = ${dp[i][j]}`, matrix: dp.map(r => [...r]) });
          }
        }
      }
      return s;
    }
  },
  {
    id: 'dp_subset',
    name: '等和子集划分 (Subset Sum)',
    en: 'Subset Sum Partition',
    best: 'O(n * sum)', avg: 'O(n * sum)', worst: 'O(n * sum)', space: 'O(sum)',
    desc: '决策公式：DP[i][j] = DP[i-1][j] || DP[i-1][j-Num]；用此数字或不用此数字，能否凑出目标总和。',
    code: `bool canPartition(int arr[], int n) {\n    int sum = 0; for (int i = 0; i < n; i++) sum += arr[i];\n    if (sum % 2 != 0) return false;\n    int target = sum / 2;\n    bool dp[target + 1];\n    for (int i = 0; i <= target; i++) dp[i] = false;\n    dp[0] = true;\n    for (int i = 0; i < n; i++) {\n        for (int j = target; j >= arr[i]; j--) {\n            dp[j] = dp[j] || dp[j - arr[i]];\n        }\n    }\n    return dp[target];\n}`,
    explains: [
      '主入口，传入无序正整数组',
      '先将集合中所有数字代数求出累加总和',
      '奇偶判定：若总和是奇数，决不可能有方案折半分，直接宣称失败',
      '求得待凑目标折半切分算分子集和 target = sum / 2',
      '构建 1D dp 布尔数组记录哪些子集和已被锁定凑出',
      '默认为 false 状态表',
      '基初：零元的空集可以自然组成总和 0 (dp[0] = true)',
      '拿当前手牌数字进行扫荡',
      '倒桩滚动：从 target 重荷向手牌面值倒序迭代（防单子重复扣减）',
      '组合研判：原方案就行，或者拿上当前等值抵扣之前的段落也凑得通，直接赋值真值',
      '内遍历结束',
      '两层内循环结束',
      '回传是否能够成功均匀折半对分的结论布尔'
    ],
    genSteps: () => {
      const s: TrackingState[] = [];
      const arr = [1, 5, 5]; // target = 5.5? 1+5+5 = 11, cannot. If [1,5,11,5], sum=22, target=11. Let's use [1, 2, 3] sum=6, target=3.
      const dp = [true, false, false, false];
      s.push({ line: 0, msg: '开始等和子集划分判定 [1, 2, 3]。总和 = 6。', array1D: [1, 0, 0, 0] });
      s.push({ line: 2, msg: '6 是偶数，可以均匀两对半劈。分割目标 target = 3。', array1D: [1, 0, 0, 0] });
      s.push({ line: 6, msg: '初始项 dp[0] = true（空集极简可行）。', array1D: [1, 0, 0, 0] });
      
      const dp2 = [1, 1, 0, 0];
      s.push({ line: 9, msg: '手牌数字 1：可以凑出和 1 (dp[1] = true)。', array1D: dp2 });
      const dp3 = [1, 1, 1, 1];
      s.push({ line: 9, msg: '加入手牌数字 2：可以凑出 1+2=3 系列。全规划成功！', array1D: dp3 });
      return s;
    }
  }
];

export default function DPAndGreedyAlgorithms() {
  const [activeTab, setActiveTab] = useState<'greedy' | 'dp'>('greedy');
  const [activeAlgoId, setActiveAlgoId] = useState<string>('g_activity');
  
  const [inputs, setInputs] = useState<CustomInputs>({
    greedyCoinsAmount: 126,
    dpCoinsAmount: 7,
    capacity: 40,
    fibN: 6,
    strA: 'ABCDGH',
    strB: 'AEDFHR'
  });

  const [curStepIdx, setCurStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sliderVal, setSliderVal] = useState(480);
  
  const [prevKey, setPrevKey] = useState<string>('greedy-g_activity');
  const currentKey = `${activeTab}-${activeAlgoId}-${inputs.greedyCoinsAmount}-${inputs.dpCoinsAmount}-${inputs.capacity}-${inputs.fibN}-${inputs.strA}-${inputs.strB}`;

  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setCurStepIdx(0);
    setPlaying(false);
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const activeDefs = activeTab === 'greedy' ? GREEDY_DEFS : DP_DEFS;
  const currentAlgo = activeDefs.find(a => a.id === activeAlgoId) || activeDefs[0];
  const speedMs = 880 - sliderVal;

  const steps = currentAlgo.genSteps(inputs);
  const activeStep = steps[curStepIdx] || { line: -1, msg: '计算已就绪!' };

  // Main playback loop
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

  const handleNext = () => {
    setPlaying(false);
    setCurStepIdx(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setPlaying(false);
    setCurStepIdx(prev => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setCurStepIdx(0);
    setPlaying(false);
  };

  return (
    <div id="greedy-dp-panel" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] mb-8 overflow-hidden hover:border-[rgba(0,229,255,0.2)] transition-colors text-zinc-100 font-sans shadow-lg">
      
      {/* Dynamic Tab Switching */}
      <div className="p-5 pb-3.5 flex items-center justify-between gap-3.5 flex-wrap border-b border-[var(--border)] bg-zinc-950/20">
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-extrabold text-[20px] text-zinc-150">高级算法范式：贪心 &amp; 动态规划</h3>
          <div className="font-mono text-[12px] text-[var(--text-muted)] mt-1">
            20 种高维经典模型 · 交互式推导比对 (10个贪心 + 10个DP)
          </div>
        </div>
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-black/35 rounded-full border border-zinc-800">
          <button 
            onClick={() => { setActiveTab('greedy'); setActiveAlgoId('g_activity'); }}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition-all ${activeTab === 'greedy' ? 'bg-[var(--accent)] text-black font-extrabold shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            贪心算法 (10实例)
          </button>
          <button 
            onClick={() => { setActiveTab('dp'); setActiveAlgoId('dp_fib'); }}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition-all ${activeTab === 'dp' ? 'bg-[var(--purple)] text-white font-extrabold shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            动态规划 (10实例)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[var(--border)] bg-black/10">
        {/* SIDE BAR / SUB-TABS SELECTOR FOR 10 ALGORITHMS */}
        <div className="col-span-1 border-r border-[var(--border)] flex flex-col max-h-[460px] overflow-y-auto divide-y divide-zinc-900/40">
          {activeDefs.map((def, idx) => {
            const isSelected = activeAlgoId === def.id;
            return (
              <button
                key={def.id}
                onClick={() => { setActiveAlgoId(def.id); }}
                className={`w-full text-left p-3.5 px-4 block text-[13px] hover:bg-white/5 transition-all relative ${isSelected ? 'bg-zinc-800/40 text-cyan-300 font-bold border-l-4 border-[var(--accent)] dark:border-cyan-400' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-500 mr-2">{(idx+1).toString().padStart(2, '0')}</span>
                  <span className="flex-1 truncate">{def.name.split(' (')[0]}</span>
                </div>
                <div className="font-mono text-[11px] text-zinc-600 mt-0.5 truncate">{def.en}</div>
              </button>
            );
          })}
        </div>

        {/* DETAILS DESCRIPTION & CONTROLLER BANNER */}
        <div className="col-span-3 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-[18px] font-extrabold text-zinc-100 flex items-center gap-2">
              <span>{currentAlgo.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-widest">{currentAlgo.en}</span>
            </h4>
            <p className="text-[13px] leading-relaxed text-zinc-300 font-light">{currentAlgo.desc}</p>
            
            {/* Complexity Table Badge Row */}
            <div className="flex gap-2.5 flex-wrap font-mono text-[11px] mt-2">
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850/80 text-zinc-400">最好: <b className="text-zinc-100">{currentAlgo.best}</b></span>
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850/80 text-zinc-400">平均: <b className="text-zinc-100">{currentAlgo.avg}</b></span>
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850/80 text-zinc-400">最坏: <b className="text-zinc-100">{currentAlgo.worst}</b></span>
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850/80 text-zinc-400">空间: <b className="text-zinc-100">{currentAlgo.space}</b></span>
            </div>
          </div>

          {/* DYNAMIC VARIABLE INPUT CONTROLLER INSIDE PANELS */}
          <div className="p-3.5 bg-zinc-950/45 rounded border border-zinc-900/70 flex items-center gap-4 flex-wrap text-[12.5px]">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider font-bold">仿真输入参数:</span>
            
            {/* Greedy Coins Input */}
            {currentAlgo.id === 'g_coins' && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">零钱总额:</span>
                <input 
                  type="number" 
                  min={1} max={500}
                  value={inputs.greedyCoinsAmount}
                  onChange={e => setInputs(prev => ({ ...prev, greedyCoinsAmount: parseInt(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[13px] rounded focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-zinc-500 font-mono">¥</span>
              </div>
            )}

            {/* DP Coins Input */}
            {currentAlgo.id === 'dp_coins' && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">零钱总额:</span>
                <input 
                  type="number" 
                  min={1} max={20}
                  value={inputs.dpCoinsAmount}
                  onChange={e => setInputs(prev => ({ ...prev, dpCoinsAmount: parseInt(e.target.value) || 5 }))}
                  className="w-16 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[13px] rounded focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-zinc-500 font-mono">¥</span>
              </div>
            )}

            {/* Knapsack Capacity Weight */}
            {(currentAlgo.id === 'g_knapsack' || currentAlgo.id === 'dp_knapsack') && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">背包承重限制:</span>
                <input 
                  type="number" 
                  min={1} max={50}
                  value={inputs.capacity}
                  onChange={e => setInputs(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                  className="w-16 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[13px] rounded focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-zinc-500 font-mono">kg</span>
              </div>
            )}

            {/* Fibonacci number */}
            {currentAlgo.id === 'dp_fib' && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Fibonacci 阶数 N:</span>
                <input 
                  type="number" 
                  min={1} max={12}
                  value={inputs.fibN}
                  onChange={e => setInputs(prev => ({ ...prev, fibN: parseInt(e.target.value) || 5 }))}
                  className="w-16 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[13px] rounded focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}

            {/* String input edit details for LCS / Edit Distance */}
            {(currentAlgo.id === 'dp_lcs' || currentAlgo.id === 'dp_edit') && (
              <div className="flex flex-wrap gap-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">串A:</span>
                  <input 
                    type="text" 
                    maxLength={7}
                    value={inputs.strA}
                    onChange={e => setInputs(prev => ({ ...prev, strA: e.target.value.toUpperCase() }))}
                    className="w-20 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[12.5px] rounded focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">串B:</span>
                  <input 
                    type="text" 
                    maxLength={7}
                    value={inputs.strB}
                    onChange={e => setInputs(prev => ({ ...prev, strB: e.target.value.toUpperCase() }))}
                    className="w-20 px-2 py-1 bg-black/45 border border-zinc-800 text-center font-mono text-[12.5px] rounded focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}

            {!['g_coins', 'dp_coins', 'g_knapsack', 'dp_knapsack', 'dp_fib', 'dp_lcs', 'dp_edit'].includes(currentAlgo.id) && (
              <span className="text-zinc-500 italic text-[11.5px]">当前实例已采用最经典的数据样例作为输入参考</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* 1. VISUALIZATION CHANNEL */}
        <div className="p-5 flex flex-col justify-between gap-5 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-zinc-950/20">
          
          {/* Main Visual Arena Grid */}
          <div className="flex-1 flex flex-col justify-center gap-5 py-5 min-h-[260px] bg-black/35 rounded-[var(--rs)] border border-zinc-900/60 p-5 relative overflow-hidden">
            
            {/* 1D Array view */}
            {activeStep.array1D && (
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest mb-1">主状态表 (1D DP Array)</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeStep.array1D.map((v, i) => {
                    const isHl = activeStep.arrayHighlight?.includes(i);
                    return (
                      <div 
                        key={i} 
                        className={`w-11 h-11 border rounded flex flex-col items-center justify-center font-mono transition-all duration-300 ${isHl ? 'border-amber-400 bg-amber-500/10 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)] scale-105' : 'border-zinc-800 bg-zinc-900/30 text-zinc-350'}`}
                      >
                        <span className="text-[8.5px] text-zinc-500 font-normal leading-none mb-1">i={i}</span>
                        <span className="font-extrabold text-[13.5px]">{v === 999 ? '∞' : v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2D Matrix view (backpacks, LCS, Floyd-Warshall, Edit Distance grids) */}
            {activeStep.matrix && (
              <div className="flex flex-col gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <div className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest mb-1 leading-none">二决策矩阵 (2D DP / Setup TabState Matrix)</div>
                <table className="border-collapse font-mono text-[12px] text-zinc-400 table-fixed">
                  <tbody>
                    {activeStep.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((val, cIdx) => (
                          <td 
                            key={cIdx} 
                            className="border border-zinc-900 text-center w-8 h-8 font-mono border-zinc-800/80 p-0"
                          >
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900/25 shrink-0 hover:bg-white/5 font-semibold text-zinc-100">
                              {val}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Graphical Nodes representation (Shortest Paths) */}
            {activeStep.graphNodes && (
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest leading-none">顶点路由跃迁 (Vertex Graph Status)</div>
                <div className="flex items-center gap-3 flex-wrap">
                  {activeStep.graphNodes.map((node, idx) => {
                    const cl = node.status === 'visited' 
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10' 
                      : node.status === 'visiting' 
                        ? 'border-amber-400 text-amber-300 bg-amber-400/15 animate-pulse'
                        : 'border-zinc-800 text-zinc-400 bg-zinc-900/10';
                    return (
                      <div key={idx} className={`px-3 py-2 border rounded-[4px] font-mono text-[12.5px] flex items-center justify-between gap-3 ${cl}`}>
                        <span className="font-extrabold">{node.id}</span>
                        <span className="text-[11px] font-bold text-zinc-500">→</span>
                        <span>{node.val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Graphical Edges representation (Kruskal Minimal Spanning Tree edges queue) */}
            {activeStep.graphEdges && (
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest leading-none">最小生成树关系边队列 (MST Edge Sequence)</div>
                <div className="flex flex-col gap-1.5 font-mono text-[12.5px]">
                  {activeStep.graphEdges.map((edge, idx) => {
                    const cl = edge.mst 
                      ? 'border-emerald-500/60 bg-emerald-900/10 text-emerald-300' 
                      : edge.active 
                        ? 'border-amber-400 bg-amber-400/5 text-amber-300 animate-pulse'
                        : 'border-zinc-900 bg-zinc-950/20 text-zinc-650';
                    return (
                      <div key={idx} className={`p-2.5 px-3 border rounded flex items-center justify-between ${cl}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{edge.u}</span>
                          <span className="text-zinc-500 text-[10px]">&lt;=== w:{edge.w} ===&gt;</span>
                          <span className="font-bold">{edge.v}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 rounded bg-black/30">
                          {edge.mst ? '已选边 (In MST)' : edge.active ? '评估中 (Testing)' : '排队中 (Queue)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra active items / variables HUD */}
            {activeStep.stats && (
              <div className="flex items-center gap-3.5 flex-wrap font-mono text-[12px] bg-black/45 rounded border border-zinc-900 p-3 mt-1 select-none">
                {Object.entries(activeStep.stats).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-zinc-500 font-bold">{k}:</span>
                    <span className="text-cyan-300 font-extrabold">{v}</span>
                  </div>
                ))}
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
            <span className="text-[12.5px] text-zinc-300 leading-relaxed font-sans">
              {activeStep.msg}
            </span>
          </div>

        </div>

        {/* 2. SOURCE CODE PANEL */}
        <div className="flex flex-col max-h-[380px] lg:max-h-[460px] bg-zinc-950 relative" ref={containerRef}>
          <div className="flex-1 overflow-y-auto py-3 bg-[var(--bg-code)] font-mono text-[11.5px] md:text-[12px] leading-[1.8] scrollbar-thin scrollbar-thumb-zinc-800">
            {currentAlgo.code.split(/\n/).map((line, idx) => {
              const isActive = activeStep.line === idx;
              return (
                <div 
                  key={idx} 
                  data-str-line={idx} 
                  className={`code-line flex py-[1px] pr-[14px] cursor-pointer transition-all border-l-[3px] ${isActive ? 'active border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-transparent hover:bg-white/5'}`}
                  onClick={() => { setPlaying(false); setCurStepIdx(steps.findIndex(s => s.line === idx) || 0); }}
                >
                  <span className="line-num w-8 text-right pr-2.5 text-zinc-650 select-none shrink-0 text-[10.5px] font-mono">
                    {isActive ? '▶' : (idx + 1)}
                  </span>
                  <span 
                    className="flex-1 whitespace-pre text-zinc-350 font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
                  />
                </div>
              );
            })}
          </div>

          {/* Comment description at bottom of code panel */}
          <div className="p-3 px-4 min-h-[50px] bg-black border-t border-zinc-900 text-[12.5px] text-zinc-400 leading-[1.6] flex items-start gap-2 select-none">
            <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-zinc-800 text-zinc-300 font-sans text-[10px] mt-[2px]">c</span>
            <span key={activeStep.line} className="animate-fadeIn flex-1 font-sans text-zinc-400">
              {currentAlgo.explains[activeStep.line] || (activeStep.line === -1 ? '算法抉择完全退出!' : '点击播放控制，可在左侧实时跟踪 C 语言执行行数的转移路径')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
