import { describe, it, expect } from "vitest";
import {
  RingBuffer,
  LRUCache,
  MinHeap,
  HashedTimingWheel,
  topologicalSort,
  cascadeRestartPlan,
  astar,
  executeSaga,
  WriteBehindCoalescer,
  GCRALimiter,
  WelfordCUSUM,
  shannonEntropy,
  IdentityGraph,
  AliasTable,
  joaat,
  constantTimeEquals,
  ReplayWindow,
  SpatialGrid,
  PolygonZone,
} from "./index";

describe("COE Framework Algorithms in @matz/ui", () => {
  it("RingBuffer e LRUCache operam em O(1) com sobrescrita e TTL", () => {
    const rb = new RingBuffer<string>(3);
    rb.push("1");
    rb.push("2");
    rb.push("3");
    expect(rb.push("4")).toBe("1");
    expect(rb.toArray()).toEqual(["2", "3", "4"]);
    expect(rb.peekNewest(0)).toBe("4");

    const lru = new LRUCache<string, number>(2);
    lru.put("a", 10, 500, 1000);
    lru.put("b", 20, 500, 1000);
    expect(lru.get("a", 1200)).toBe(10);
    const ev = lru.put("c", 30, 500, 1200);
    expect(ev.evictedKey).toBe("b");
    expect(lru.get("a", 1600)).toBeUndefined(); // TTL expirado
  });

  it("MinHeap e HashedTimingWheel escalonam prioridades e timers", () => {
    const heap = new MinHeap<string, string>();
    heap.push("taskB", 20, "B");
    heap.push("taskA", 5, "A");
    heap.push("taskB", 1, "B-Urgent");
    expect(heap.pop()?.id).toBe("taskB");

    const fired: string[] = [];
    const wheel = new HashedTimingWheel<string>(50);
    wheel.schedule("t1", 100, (id) => fired.push(id));
    wheel.advanceTick();
    expect(fired).toEqual([]);
    wheel.advanceTick();
    expect(fired).toEqual(["t1"]);
  });

  it("Graph: TopologicalSort, CascadeRestartPlan e A* 3D", () => {
    const nodes = ["matz-core", "matz-ui", "matz-hub", "bycode"];
    const deps = {
      "matz-core": [],
      "matz-ui": [],
      "matz-hub": ["matz-core", "matz-ui"],
      bycode: ["matz-core", "matz-ui"],
    };
    const res = topologicalSort(nodes, deps);
    expect(res.cycleNodes).toBeNull();
    expect(res.parallelWaves).toHaveLength(2);
    expect(res.parallelWaves?.[0]).toEqual(["matz-core", "matz-ui"]);

    const cascade = cascadeRestartPlan("matz-ui", nodes, deps);
    expect(cascade.startOrder).toEqual(["matz-ui", "bycode", "matz-hub"]);
    expect(cascade.stopOrder?.[cascade.stopOrder.length - 1]).toBe("matz-ui");

    const astarRes = astar(
      {
        start: { x: 0, y: 0, edges: [{ to: "mid", cost: 3 }, { to: "goal", cost: 10 }] },
        mid: { x: 2, y: 2, edges: [{ to: "goal", cost: 2 }] },
        goal: { x: 4, y: 4 },
      },
      "start",
      "goal"
    );
    expect(astarRes.path).toEqual(["start", "mid", "goal"]);
    expect(astarRes.cost).toBe(5);
  });

  it("Concurrency (Saga & WriteBehind), RateLimit (GCRA) e Anomaly (WelfordCUSUM + Entropy)", () => {
    let rolledBack = false;
    const saga = executeSaga(
      [
        { name: "s1", action: () => "ok", compensate: () => { rolledBack = true; } },
        { name: "s2", action: () => { throw new Error("fail"); } },
      ],
      {}
    );
    expect(saga.ok).toBe(false);
    expect(rolledBack).toBe(true);

    let flushedCount = 0;
    const wb = new WriteBehindCoalescer((batch) => { flushedCount = batch.length; });
    wb.markDirty("doc1", { title: "A" });
    wb.markDirty("doc1", { title: "B" });
    expect(wb.flush()).toBe(1);
    expect(flushedCount).toBe(1);

    const gcra = new GCRALimiter(100, 200);
    expect(gcra.allow("k", 1000).allowed).toBe(true);
    expect(gcra.allow("k", 1000).allowed).toBe(true);
    expect(gcra.allow("k", 1000).allowed).toBe(true);
    expect(gcra.allow("k", 1000).allowed).toBe(false);

    const cusum = new WelfordCUSUM(10, 1, 4, 0.25);
    cusum.observe(10);
    expect(cusum.observe(22).isAlarm).toBe(true);

    const ent = shannonEntropy({ pub: 10, priv: 10 });
    expect(ent.entropyBits).toBeCloseTo(1.0, 2);

    const idGraph = new IdentityGraph();
    idGraph.linkIdentityCluster(["tok1", "tok2"]);
    idGraph.banCluster("tok1", "policy_violation");
    expect(idGraph.linkIdentityCluster(["tok2", "tok3"]).isBanned).toBe(true);
  });

  it("Sampling (Vose Alias), Crypto (JOAAT + ReplayWindow) e Spatial (Grid + Polygon)", () => {
    const alias = new AliasTable([
      { item: "alpha", weight: 80 },
      { item: "beta", weight: 20, unique: true },
    ]);
    expect(alias.sampleBatch(2).length).toBe(2);

    expect(joaat("MATZ")).toBe(joaat("matz"));
    expect(constantTimeEquals("secret", "secret")).toBe(true);
    expect(constantTimeEquals("secret", "secreX")).toBe(false);

    const rw = new ReplayWindow();
    expect(rw.verifyAndMark(5).ok).toBe(true);
    expect(rw.verifyAndMark(5).reason).toBe("replay_detected");

    const grid = new SpatialGrid<string>(25);
    grid.insert("p1", 10, 10, 0, 0, "Payload");
    expect(grid.queryRadius(12, 12, 0, 10, 0)).toHaveLength(1);

    const poly = new PolygonZone(-5, 5, [0, 0, 20, 0, 20, 20, 0, 20]);
    expect(poly.contains(10, 10, 0)).toBe(true);
    expect(poly.contains(30, 10, 0)).toBe(false);
  });
});
