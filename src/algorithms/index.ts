/**
 * @matz/ui/algorithms — Biblioteca Oficial de Algoritmos portada do COE Framework
 * (Containers, Graph, Concurrency, RateLimit, Anomaly, Sampling, Crypto e Spatial)
 *
 * Projetada com estruturas de dados Zero-GC / O(1) para aplicações Desktop Go + Wails e Web.
 */

// ============================================================================
// 1. CONTAINERS (RingBuffer, LRUCache, MinHeap, HashedTimingWheel)
// ============================================================================

export class RingBuffer<T> {
  readonly capacity: number;
  private _size = 0;
  private head = 0;
  private tail = 0;
  private readonly storage: Array<T | undefined>;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("RingBuffer: capacidade deve ser inteira positiva");
    }
    this.capacity = capacity;
    this.storage = new Array<T | undefined>(capacity);
  }

  get size(): number {
    return this._size;
  }

  push(item: T): T | undefined {
    let overwritten: T | undefined;
    if (this._size === this.capacity) {
      overwritten = this.storage[this.head];
      this.head = (this.head + 1) % this.capacity;
    } else {
      this._size++;
    }
    this.storage[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    return overwritten;
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined;
    const item = this.storage[this.head];
    this.storage[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this._size--;
    return item;
  }

  peekNewest(offset = 0): T | undefined {
    if (offset < 0 || offset >= this._size) return undefined;
    const idx = (this.tail - 1 - offset + this.capacity * 2) % this.capacity;
    return this.storage[idx];
  }

  peekOldest(): T | undefined {
    if (this._size === 0) return undefined;
    return this.storage[this.head];
  }

  toArray(): T[] {
    const out = new Array<T>(this._size);
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this.capacity;
      out[i] = this.storage[idx] as T;
    }
    return out;
  }

  clear(): void {
    this.storage.fill(undefined);
    this._size = 0;
    this.head = 0;
    this.tail = 0;
  }
}

export class LRUCache<K, V> {
  readonly capacity: number;
  private _size = 0;
  private head = 0;
  private tail = 0;
  private freeTop: number;
  private readonly freeList: Int32Array;
  private readonly keyToIdx = new Map<K, number>();
  private readonly keys: Array<K | undefined>;
  private readonly vals: Array<V | undefined>;
  private readonly exp: Float64Array;
  private readonly prev: Int32Array;
  private readonly nxt: Int32Array;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 2) {
      throw new Error("LRUCache: capacidade deve ser >= 2");
    }
    this.capacity = capacity;
    this.freeTop = capacity;
    this.freeList = new Int32Array(capacity + 1);
    for (let i = 1; i <= capacity; i++) {
      this.freeList[i] = capacity - i + 1;
    }
    this.keys = new Array<K | undefined>(capacity + 1);
    this.vals = new Array<V | undefined>(capacity + 1);
    this.exp = new Float64Array(capacity + 1);
    this.prev = new Int32Array(capacity + 1);
    this.nxt = new Int32Array(capacity + 1);
  }

  get size(): number {
    return this._size;
  }

  private detach(idx: number): void {
    const p = this.prev[idx];
    const n = this.nxt[idx];
    if (p !== 0) {
      this.nxt[p] = n;
    } else {
      this.head = n;
    }
    if (n !== 0) {
      this.prev[n] = p;
    } else {
      this.tail = p;
    }
    this.prev[idx] = 0;
    this.nxt[idx] = 0;
  }

  private attachFront(idx: number): void {
    this.prev[idx] = 0;
    this.nxt[idx] = this.head;
    if (this.head !== 0) {
      this.prev[this.head] = idx;
    }
    this.head = idx;
    if (this.tail === 0) {
      this.tail = idx;
    }
  }

  invalidate(key: K): boolean {
    const idx = this.keyToIdx.get(key);
    if (idx === undefined) return false;
    this.detach(idx);
    this.keyToIdx.delete(key);
    this.keys[idx] = undefined;
    this.vals[idx] = undefined;
    this.exp[idx] = 0;
    this.freeTop++;
    this.freeList[this.freeTop] = idx;
    this._size--;
    return true;
  }

  get(key: K, nowMs = Date.now()): V | undefined {
    const idx = this.keyToIdx.get(key);
    if (idx === undefined) return undefined;
    const e = this.exp[idx];
    if (e > 0 && nowMs >= e) {
      this.invalidate(key);
      return undefined;
    }
    if (idx !== this.head) {
      this.detach(idx);
      this.attachFront(idx);
    }
    return this.vals[idx];
  }

  put(key: K, value: V, ttlMs = 0, nowMs = Date.now()): { evictedKey?: K; evictedValue?: V } {
    const expiry = ttlMs > 0 ? nowMs + ttlMs : 0;
    const existing = this.keyToIdx.get(key);
    if (existing !== undefined) {
      this.vals[existing] = value;
      this.exp[existing] = expiry;
      if (existing !== this.head) {
        this.detach(existing);
        this.attachFront(existing);
      }
      return {};
    }

    let evictedKey: K | undefined;
    let evictedValue: V | undefined;
    if (this.freeTop === 0) {
      const victim = this.tail;
      evictedKey = this.keys[victim];
      evictedValue = this.vals[victim];
      if (evictedKey !== undefined) {
        this.invalidate(evictedKey);
      }
    }

    const newIdx = this.freeList[this.freeTop];
    this.freeTop--;
    this.keys[newIdx] = key;
    this.vals[newIdx] = value;
    this.exp[newIdx] = expiry;
    this.keyToIdx.set(key, newIdx);
    this.attachFront(newIdx);
    this._size++;
    return { evictedKey, evictedValue };
  }
}

export class MinHeap<K, V = undefined> {
  private readonly ids: K[] = [];
  private readonly prios: number[] = [];
  private readonly payloads: Array<V | undefined> = [];
  private readonly pos = new Map<K, number>();

  get size(): number {
    return this.ids.length;
  }

  private swap(i: number, j: number): void {
    const idI = this.ids[i];
    const idJ = this.ids[j];
    this.ids[i] = idJ;
    this.ids[j] = idI;
    const p = this.prios[i];
    this.prios[i] = this.prios[j];
    this.prios[j] = p;
    const pl = this.payloads[i];
    this.payloads[i] = this.payloads[j];
    this.payloads[j] = pl;
    this.pos.set(idI, j);
    this.pos.set(idJ, i);
  }

  private siftUp(idx: number): void {
    let curr = idx;
    while (curr > 0) {
      const parent = (curr - 1) >> 1;
      if (this.prios[curr] < this.prios[parent]) {
        this.swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(idx: number): void {
    let curr = idx;
    const n = this.ids.length;
    while (true) {
      const left = (curr << 1) + 1;
      const right = left + 1;
      let smallest = curr;
      if (left < n && this.prios[left] < this.prios[smallest]) smallest = left;
      if (right < n && this.prios[right] < this.prios[smallest]) smallest = right;
      if (smallest !== curr) {
        this.swap(curr, smallest);
        curr = smallest;
      } else {
        break;
      }
    }
  }

  push(id: K, priority: number, payload?: V): void {
    const existing = this.pos.get(id);
    if (existing !== undefined) {
      const oldPrio = this.prios[existing];
      this.prios[existing] = priority;
      if (payload !== undefined) this.payloads[existing] = payload;
      if (priority < oldPrio) this.siftUp(existing);
      else this.siftDown(existing);
      return;
    }
    const idx = this.ids.length;
    this.ids.push(id);
    this.prios.push(priority);
    this.payloads.push(payload);
    this.pos.set(id, idx);
    this.siftUp(idx);
  }

  pop(): { id: K; priority: number; payload?: V } | undefined {
    const n = this.ids.length;
    if (n === 0) return undefined;
    const topId = this.ids[0];
    const topPrio = this.prios[0];
    const topPayload = this.payloads[0];
    this.pos.delete(topId);
    const last = n - 1;
    if (last > 0) {
      this.ids[0] = this.ids[last];
      this.prios[0] = this.prios[last];
      this.payloads[0] = this.payloads[last];
      this.pos.set(this.ids[0], 0);
    }
    this.ids.pop();
    this.prios.pop();
    this.payloads.pop();
    if (last > 0) this.siftDown(0);
    return { id: topId, priority: topPrio, payload: topPayload };
  }

  peek(): { id: K; priority: number; payload?: V } | undefined {
    if (this.ids.length === 0) return undefined;
    return { id: this.ids[0], priority: this.prios[0], payload: this.payloads[0] };
  }

  remove(id: K): boolean {
    const idx = this.pos.get(id);
    if (idx === undefined) return false;
    this.pos.delete(id);
    const last = this.ids.length - 1;
    if (idx === last) {
      this.ids.pop();
      this.prios.pop();
      this.payloads.pop();
      return true;
    }
    const lastPrio = this.prios[last];
    const removedPrio = this.prios[idx];
    this.ids[idx] = this.ids[last];
    this.prios[idx] = lastPrio;
    this.payloads[idx] = this.payloads[last];
    this.pos.set(this.ids[idx], idx);
    this.ids.pop();
    this.prios.pop();
    this.payloads.pop();
    if (lastPrio < removedPrio) this.siftUp(idx);
    else this.siftDown(idx);
    return true;
  }
}

export class HashedTimingWheel<T = unknown> {
  readonly tickIntervalMs: number;
  private currentSlot = 0;
  private readonly slots: Array<
    Array<{ id: string; slot: number; slotIdx: number; rounds: number; cb: (id: string, payload?: T) => void; payload?: T }>
  >;
  private readonly timers = new Map<
    string,
    { id: string; slot: number; slotIdx: number; rounds: number; cb: (id: string, payload?: T) => void; payload?: T }
  >();

  constructor(tickIntervalMs = 100) {
    this.tickIntervalMs = tickIntervalMs > 0 ? tickIntervalMs : 100;
    this.slots = Array.from({ length: 256 }, () => []);
  }

  schedule(id: string, delayMs: number, cb: (id: string, payload?: T) => void, payload?: T): boolean {
    this.cancel(id);
    const ticks = Math.max(1, Math.ceil(delayMs / this.tickIntervalMs));
    const rounds = (ticks - 1) >> 8;
    const targetSlot = (this.currentSlot + ticks) & 255;
    const bucket = this.slots[targetSlot];
    const entry = { id, slot: targetSlot, slotIdx: bucket.length, rounds, cb, payload };
    bucket.push(entry);
    this.timers.set(id, entry);
    return true;
  }

  cancel(id: string): boolean {
    const entry = this.timers.get(id);
    if (!entry) return false;
    const bucket = this.slots[entry.slot];
    const lastIdx = bucket.length - 1;
    if (entry.slotIdx < lastIdx) {
      const last = bucket[lastIdx];
      bucket[entry.slotIdx] = last;
      last.slotIdx = entry.slotIdx;
    }
    bucket.pop();
    this.timers.delete(id);
    return true;
  }

  advanceTick(): void {
    this.currentSlot = (this.currentSlot + 1) & 255;
    const bucket = this.slots[this.currentSlot];
    let i = 0;
    while (i < bucket.length) {
      const entry = bucket[i];
      if (entry.rounds > 0) {
        entry.rounds--;
        i++;
      } else {
        this.cancel(entry.id);
        entry.cb(entry.id, entry.payload);
      }
    }
  }
}

// ============================================================================
// 2. GRAPH (TopologicalSort Kahn + Parallel Waves, CascadeRestartPlan, A* 3D)
// ============================================================================

export interface TopologicalSortResult {
  bootOrder: string[] | null;
  parallelWaves: string[][] | null;
  cycleNodes: string[] | null;
}

export function topologicalSort(nodes: string[], dependencies: Record<string, string[]>): TopologicalSortResult {
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const u of nodes) {
    inDegree.set(u, 0);
    dependents.set(u, []);
  }
  for (const u of nodes) {
    const deps = dependencies[u] || [];
    for (const dep of deps) {
      if (inDegree.has(dep)) {
        inDegree.set(u, (inDegree.get(u) || 0) + 1);
        dependents.get(dep)!.push(u);
      }
    }
  }

  let currentWave: string[] = [];
  for (const u of nodes) {
    if (inDegree.get(u) === 0) currentWave.push(u);
  }
  currentWave.sort();

  const bootOrder: string[] = [];
  const parallelWaves: string[][] = [];

  while (currentWave.length > 0) {
    parallelWaves.push(currentWave);
    const nextWave: string[] = [];
    for (const u of currentWave) {
      bootOrder.push(u);
      for (const v of dependents.get(u) || []) {
        const nextDeg = (inDegree.get(v) || 0) - 1;
        inDegree.set(v, nextDeg);
        if (nextDeg === 0) nextWave.push(v);
      }
    }
    nextWave.sort();
    currentWave = nextWave;
  }

  if (bootOrder.length < nodes.length) {
    const cycleNodes = nodes.filter((u) => (inDegree.get(u) || 0) > 0).sort();
    return { bootOrder: null, parallelWaves: null, cycleNodes };
  }

  return { bootOrder, parallelWaves, cycleNodes: null };
}

export function cascadeRestartPlan(
  targetNode: string,
  nodes: string[],
  dependencies: Record<string, string[]>
): { stopOrder: string[] | null; startOrder: string[] | null; cycleNodes: string[] | null } {
  const { bootOrder, cycleNodes } = topologicalSort(nodes, dependencies);
  if (!bootOrder) return { stopOrder: null, startOrder: null, cycleNodes };

  const dependents = new Map<string, string[]>();
  for (const u of nodes) dependents.set(u, []);
  for (const u of nodes) {
    for (const dep of dependencies[u] || []) {
      dependents.get(dep)?.push(u);
    }
  }

  const affected = new Set<string>([targetNode]);
  const queue = [targetNode];
  for (let head = 0; head < queue.length; head++) {
    const curr = queue[head];
    for (const dep of dependents.get(curr) || []) {
      if (!affected.has(dep)) {
        affected.add(dep);
        queue.push(dep);
      }
    }
  }

  const startOrder = bootOrder.filter((u) => affected.has(u));
  const stopOrder = [...startOrder].reverse();
  return { stopOrder, startOrder, cycleNodes: null };
}

export interface AStarGraphNode {
  x: number;
  y: number;
  z?: number;
  edges?: Array<{ to: string; cost: number }>;
}

export function astar(
  graphNodes: Record<string, AStarGraphNode>,
  startId: string,
  goalId: string
): { path: string[] | null; cost: number } {
  const goalNode = graphNodes[goalId];
  if (!graphNodes[startId] || !goalNode) return { path: null, cost: Number.POSITIVE_INFINITY };

  const openSet = new MinHeap<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startId, 0]]);

  const heuristic = (nodeId: string): number => {
    const n = graphNodes[nodeId];
    const dx = n.x - goalNode.x;
    const dy = n.y - goalNode.y;
    const dz = (n.z || 0) - (goalNode.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  openSet.push(startId, heuristic(startId));

  while (openSet.size > 0) {
    const top = openSet.pop()!;
    const current = top.id;
    if (current === goalId) {
      const rev: string[] = [];
      let curr: string | undefined = current;
      while (curr !== undefined) {
        rev.push(curr);
        curr = cameFrom.get(curr);
      }
      return { path: rev.reverse(), cost: gScore.get(goalId)! };
    }

    const currG = gScore.get(current) ?? Number.POSITIVE_INFINITY;
    for (const edge of graphNodes[current].edges || []) {
      const tentativeG = currG + edge.cost;
      const prevG = gScore.get(edge.to);
      if (prevG === undefined || tentativeG < prevG) {
        cameFrom.set(edge.to, current);
        gScore.set(edge.to, tentativeG);
        openSet.push(edge.to, tentativeG + heuristic(edge.to));
      }
    }
  }

  return { path: null, cost: Number.POSITIVE_INFINITY };
}

// ============================================================================
// 3. CONCURRENCY (Saga Orchestrator & WriteBehindCoalescer)
// ============================================================================

export interface SagaStep<C, O = unknown> {
  name: string;
  action: (ctx: C) => O;
  compensate?: (ctx: C, output: O) => void;
}

export function executeSaga<C>(
  steps: Array<SagaStep<C, any>>,
  context: C
): { ok: boolean; failedStep?: string; reason?: string } {
  const completed: Array<{ name: string; compensate?: (ctx: C, output: any) => void; output: any }> = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      const res = step.action(context);
      if (res === false || res === null || res === undefined) {
        throw new Error("step_returned_falsy");
      }
      completed.push({ name: step.name, compensate: step.compensate, output: res });
    } catch (err: any) {
      for (let j = completed.length - 1; j >= 0; j--) {
        const comp = completed[j];
        try {
          comp.compensate?.(context, comp.output);
        } catch {
          // Ignora falha na compensação reversa para garantir execução de todas as etapas anteriores
        }
      }
      return { ok: false, failedStep: step.name || `step_${i + 1}`, reason: String(err?.message || err) };
    }
  }
  return { ok: true };
}

export class WriteBehindCoalescer<T extends Record<string, any> = Record<string, any>> {
  private readonly dirtyMap = new Map<string, T>();
  private readonly dirtyList: string[] = [];
  private readonly flushCallback: (batch: Array<{ key: string; data: T }>) => void;

  constructor(flushCallback: (batch: Array<{ key: string; data: T }>) => void) {
    this.flushCallback = flushCallback;
  }

  markDirty(entityKey: string, statePatch: Partial<T>): void {
    const existing = this.dirtyMap.get(entityKey);
    if (!existing) {
      this.dirtyMap.set(entityKey, { ...(statePatch as T) });
      this.dirtyList.push(entityKey);
    } else {
      Object.assign(existing, statePatch);
    }
  }

  flush(): number {
    const count = this.dirtyList.length;
    if (count === 0) return 0;
    const batch = this.dirtyList.map((key) => ({ key, data: this.dirtyMap.get(key)! }));
    this.dirtyMap.clear();
    this.dirtyList.length = 0;
    this.flushCallback(batch);
    return count;
  }

  pendingCount(): number {
    return this.dirtyList.length;
  }
}

// ============================================================================
// 4. RATELIMIT (GCRA - Generic Cell Rate Algorithm O(1))
// ============================================================================

export class GCRALimiter {
  readonly T: number;
  readonly tau: number;
  private readonly tats = new Map<string, number>();
  private readonly violations = new Map<string, number>();

  constructor(emissionIntervalMs: number, burstToleranceMs = 0) {
    if (emissionIntervalMs <= 0) throw new Error("GCRALimiter: T deve ser > 0");
    this.T = emissionIntervalMs;
    this.tau = Math.max(0, burstToleranceMs);
  }

  allow(key: string, nowMs = Date.now(), cost = 1): { allowed: boolean; retryAfterMs: number; violations: number } {
    const increment = this.T * Math.max(1, cost);
    const tat = this.tats.get(key) ?? nowMs;
    const baseTime = Math.max(tat, nowMs);
    const diff = baseTime - nowMs;

    if (diff <= this.tau) {
      this.tats.set(key, baseTime + increment);
      this.violations.delete(key);
      return { allowed: true, retryAfterMs: 0, violations: 0 };
    }
    const retryAfterMs = diff - this.tau;
    const vCount = (this.violations.get(key) || 0) + 1;
    this.violations.set(key, vCount);
    return { allowed: false, retryAfterMs, violations: vCount };
  }

  reset(key: string): void {
    this.tats.delete(key);
    this.violations.delete(key);
  }

  sweep(nowMs = Date.now()): number {
    let removed = 0;
    const cutoff = nowMs - this.tau;
    for (const [k, tat] of this.tats.entries()) {
      if (tat <= cutoff) {
        this.tats.delete(k);
        this.violations.delete(k);
        removed++;
      }
    }
    return removed;
  }
}

// ============================================================================
// 5. ANOMALY (WelfordCUSUM, ShannonEntropy, VerifyKinematics, IdentityGraph)
// ============================================================================

export interface WelfordCUSUMResult {
  count: number;
  mean: number;
  variance: number;
  stdDev: number;
  ewma: number;
  cusumPos: number;
  cusumNeg: number;
  isAlarm: boolean;
}

export class WelfordCUSUM {
  private n = 0;
  private mean = 0;
  private m2 = 0;
  private ewma: number;
  private readonly mu0: number;
  private readonly k: number;
  private readonly h: number;
  private readonly alpha: number;
  private sPos = 0;
  private sNeg = 0;

  constructor(targetMean: number, slackK: number, thresholdH: number, ewmaAlpha = 0.25) {
    this.ewma = targetMean;
    this.mu0 = targetMean;
    this.k = slackK;
    this.h = thresholdH;
    this.alpha = ewmaAlpha > 0 && ewmaAlpha <= 1 ? ewmaAlpha : 0.25;
  }

  observe(x: number): WelfordCUSUMResult {
    this.n++;
    const delta = x - this.mean;
    this.mean += delta / this.n;
    const delta2 = x - this.mean;
    this.m2 += delta * delta2;

    const variance = this.n > 1 ? this.m2 / (this.n - 1) : 0;
    const stdDev = Math.sqrt(variance);

    this.ewma = this.alpha * x + (1 - this.alpha) * this.ewma;
    this.sPos = Math.max(0, this.sPos + (x - this.mu0 - this.k));
    this.sNeg = Math.max(0, this.sNeg + (this.mu0 - this.k - x));

    const isAlarm = this.sPos > this.h || this.sNeg > this.h;
    return {
      count: this.n,
      mean: this.mean,
      variance,
      stdDev,
      ewma: this.ewma,
      cusumPos: this.sPos,
      cusumNeg: this.sNeg,
      isAlarm,
    };
  }

  resetCUSUM(): void {
    this.sPos = 0;
    this.sNeg = 0;
  }
}

export function shannonEntropy(counts: Record<string, number>): { entropyBits: number; totalSamples: number } {
  let total = 0;
  for (const c of Object.values(counts)) {
    if (c > 0) total += c;
  }
  if (total === 0) return { entropyBits: 0, totalSamples: 0 };
  const invTotal = 1 / total;
  const invLn2 = 1 / Math.LN2;
  let entropy = 0;
  for (const c of Object.values(counts)) {
    if (c > 0) {
      const p = c * invTotal;
      entropy -= p * (Math.log(p) * invLn2);
    }
  }
  return { entropyBits: entropy, totalSamples: total };
}

export class IdentityGraph {
  private readonly parent = new Map<string, string>();
  private readonly rank = new Map<string, number>();
  private readonly bannedRoots = new Map<string, string>();

  find(x: string): string {
    const p = this.parent.get(x);
    if (p === undefined) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      return x;
    }
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return p;
  }

  union(a: string, b: string): string {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return rootA;
    const rA = this.rank.get(rootA) || 0;
    const rB = this.rank.get(rootB) || 0;
    let newRoot: string;
    if (rA < rB) {
      this.parent.set(rootA, rootB);
      newRoot = rootB;
    } else if (rA > rB) {
      this.parent.set(rootB, rootA);
      newRoot = rootA;
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rA + 1);
      newRoot = rootA;
    }
    const ban = this.bannedRoots.get(rootA) || this.bannedRoots.get(rootB);
    if (ban) this.bannedRoots.set(newRoot, ban);
    return newRoot;
  }

  linkIdentityCluster(tokens: string[]): { root: string | null; isBanned: boolean; reason?: string } {
    if (tokens.length === 0) return { root: null, isBanned: false };
    let root = this.find(tokens[0]);
    for (let i = 1; i < tokens.length; i++) {
      root = this.union(tokens[0], tokens[i]);
    }
    const reason = this.bannedRoots.get(root);
    return { root, isBanned: reason !== undefined, reason };
  }

  banCluster(token: string, reason = "banned_cluster"): string {
    const root = this.find(token);
    this.bannedRoots.set(root, reason);
    return root;
  }
}

// ============================================================================
// 6. SAMPLING (Vose Alias Table O(1))
// ============================================================================

export class AliasTable<T> {
  readonly count: number;
  private readonly prob: Float64Array;
  private readonly alias: Int32Array;
  private readonly items: T[];
  private readonly uniqueFlags: boolean[];

  constructor(entries: Array<{ item: T; weight: number; unique?: boolean }>) {
    const n = entries.length;
    if (n === 0) throw new Error("AliasTable: entradas vazias");
    let totalWeight = 0;
    for (const e of entries) {
      if (e.weight < 0) throw new Error("AliasTable: peso negativo");
      totalWeight += e.weight;
    }
    if (totalWeight <= 0) throw new Error("AliasTable: soma de pesos deve ser > 0");

    this.count = n;
    this.prob = new Float64Array(n);
    this.alias = new Int32Array(n);
    this.items = entries.map((e) => e.item);
    this.uniqueFlags = entries.map((e) => Boolean(e.unique));

    const scaled = new Float64Array(n);
    const small: number[] = [];
    const large: number[] = [];
    const scaleFactor = n / totalWeight;

    for (let i = 0; i < n; i++) {
      const s = entries[i].weight * scaleFactor;
      scaled[i] = s;
      if (s < 1.0) small.push(i);
      else large.push(i);
    }

    while (small.length > 0 && large.length > 0) {
      const l = small.pop()!;
      const g = large.pop()!;
      this.prob[l] = scaled[l];
      this.alias[l] = g;
      const newScaledG = scaled[g] + scaled[l] - 1.0;
      scaled[g] = newScaledG;
      if (newScaledG < 1.0) small.push(g);
      else large.push(g);
    }
    while (large.length > 0) {
      const g = large.pop()!;
      this.prob[g] = 1.0;
      this.alias[g] = g;
    }
    while (small.length > 0) {
      const l = small.pop()!;
      this.prob[l] = 1.0;
      this.alias[l] = l;
    }
  }

  sample(rngFloat: () => number = Math.random, rngInt?: (n: number) => number): { item: T; index: number } {
    const rInt = rngInt ? rngInt(this.count) : Math.floor(rngFloat() * this.count);
    const rFloat = rngFloat();
    const idx = rFloat < this.prob[rInt] ? rInt : this.alias[rInt];
    return { item: this.items[idx], index: idx };
  }

  sampleBatch(k: number, rngFloat: () => number = Math.random): T[] {
    const out: T[] = [];
    const pickedUnique = new Set<number>();
    const maxAttempts = k * 8;
    let attempts = 0;
    while (out.length < k && attempts < maxAttempts) {
      attempts++;
      const { item, index } = this.sample(rngFloat);
      if (this.uniqueFlags[index]) {
        if (pickedUnique.has(index)) continue;
        pickedUnique.add(index);
      }
      out.push(item);
    }
    return out;
  }
}

// ============================================================================
// 7. CRYPTO (JOAAT, ConstantTimeEquals, Anti-Replay Window, ForensicChain)
// ============================================================================

export function joaat(input: string): number {
  let hash = 0 >>> 0;
  const lower = input.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    hash = (hash + lower.charCodeAt(i)) >>> 0;
    hash = (hash + ((hash << 10) >>> 0)) >>> 0;
    hash = (hash ^ (hash >>> 6)) >>> 0;
  }
  hash = (hash + ((hash << 3) >>> 0)) >>> 0;
  hash = (hash ^ (hash >>> 11)) >>> 0;
  hash = (hash + ((hash << 15) >>> 0)) >>> 0;
  return hash >>> 0;
}

export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export class ReplayWindow {
  private highestSeq = 0n;
  private bitmap = 0n;

  verifyAndMark(seq: number | bigint): { ok: boolean; reason?: string } {
    const s = BigInt(seq);
    if (s <= 0n) return { ok: false, reason: "invalid_seq" };
    if (s > this.highestSeq) {
      const shift = s - this.highestSeq;
      if (shift >= 64n) {
        this.bitmap = 1n;
      } else {
        this.bitmap = ((this.bitmap << shift) | 1n) & 0xffffffffffffffffn;
      }
      this.highestSeq = s;
      return { ok: true };
    }
    const diff = this.highestSeq - s;
    if (diff >= 64n) return { ok: false, reason: "seq_too_old" };
    const mask = 1n << diff;
    if ((this.bitmap & mask) !== 0n) return { ok: false, reason: "replay_detected" };
    this.bitmap |= mask;
    return { ok: true };
  }
}

// ============================================================================
// 8. SPATIAL (SpatialGrid 2D/3D & PolygonZone 2.5D)
// ============================================================================

export class SpatialGrid<T = unknown> {
  readonly cellSize: number;
  private readonly invCellSize: number;
  private readonly cells = new Map<string, Array<{ id: string; x: number; y: number; z: number; bucket: number; cellKey: string; payload?: T }>>();
  private readonly entities = new Map<string, { id: string; x: number; y: number; z: number; bucket: number; cellKey: string; payload?: T }>();

  constructor(cellSize = 50) {
    this.cellSize = cellSize > 0 ? cellSize : 50;
    this.invCellSize = 1 / this.cellSize;
  }

  private coordToKey(x: number, y: number, z: number, bucket: number): string {
    const cx = Math.floor(x * this.invCellSize);
    const cy = Math.floor(y * this.invCellSize);
    const cz = Math.floor(z * this.invCellSize);
    return `${bucket}:${cx}:${cy}:${cz}`;
  }

  insert(id: string, x: number, y: number, z = 0, bucket = 0, payload?: T): boolean {
    if (this.entities.has(id)) {
      this.remove(id);
    }
    const cellKey = this.coordToKey(x, y, z, bucket);
    let cell = this.cells.get(cellKey);
    if (!cell) {
      cell = [];
      this.cells.set(cellKey, cell);
    }
    const ent = { id, x, y, z, bucket, cellKey, payload };
    cell.push(ent);
    this.entities.set(id, ent);
    return true;
  }

  remove(id: string): boolean {
    const ent = this.entities.get(id);
    if (!ent) return false;
    const cell = this.cells.get(ent.cellKey);
    if (cell) {
      const idx = cell.indexOf(ent);
      if (idx !== -1) cell.splice(idx, 1);
      if (cell.length === 0) this.cells.delete(ent.cellKey);
    }
    this.entities.delete(id);
    return true;
  }

  queryRadius(x: number, y: number, z: number, radius: number, bucket = 0): Array<{ id: string; x: number; y: number; z: number; payload?: T }> {
    const results: Array<{ id: string; x: number; y: number; z: number; payload?: T }> = [];
    const rSq = radius * radius;
    const minCx = Math.floor((x - radius) * this.invCellSize);
    const maxCx = Math.floor((x + radius) * this.invCellSize);
    const minCy = Math.floor((y - radius) * this.invCellSize);
    const maxCy = Math.floor((y + radius) * this.invCellSize);
    const minCz = Math.floor((z - radius) * this.invCellSize);
    const maxCz = Math.floor((z + radius) * this.invCellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const cell = this.cells.get(`${bucket}:${cx}:${cy}:${cz}`);
          if (!cell) continue;
          for (const ent of cell) {
            const dx = ent.x - x;
            const dy = ent.y - y;
            const dz = ent.z - z;
            if (dx * dx + dy * dy + dz * dz <= rSq) {
              results.push(ent);
            }
          }
        }
      }
    }
    return results;
  }
}

export class PolygonZone {
  readonly minZ: number;
  readonly maxZ: number;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  private readonly vx: number[] = [];
  private readonly vy: number[] = [];

  constructor(minZ: number, maxZ: number, points: number[]) {
    if (points.length < 6 || points.length % 2 !== 0) {
      throw new Error("PolygonZone: requer pelo menos 3 pares (x, y)");
    }
    this.minZ = minZ;
    this.maxZ = maxZ;
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < points.length; i += 2) {
      const px = points[i];
      const py = points[i + 1];
      this.vx.push(px);
      this.vy.push(py);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  contains(x: number, y: number, z = 0): boolean {
    if (z < this.minZ || z > this.maxZ || x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
      return false;
    }
    let inside = false;
    const n = this.vx.length;
    let j = n - 1;
    for (let i = 0; i < n; i++) {
      const xi = this.vx[i];
      const yi = this.vy[i];
      const xj = this.vx[j];
      const yj = this.vy[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }
}
