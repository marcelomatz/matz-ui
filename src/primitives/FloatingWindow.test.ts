import { describe, expect, it } from "vitest";
import {
  attachMatzFloatingWindow,
  clampMatzFloatingRect,
  computeMatzSmartStagePlacement,
  computeMatzStagePresetRect,
  MatzFloatingSizeLimits,
  MatzFloatingStorageLike,
  MatzStageBounds,
} from "./FloatingWindow";

const STAGE: MatzStageBounds = {
  left: 250,
  top: 70,
  right: 1250,
  bottom: 870,
};

const LIMITS: MatzFloatingSizeLimits = {
  minWidth: 340,
  maxWidth: 720,
  minHeight: 220,
  maxHeight: 640,
};

describe("MatzFloatingWindow stage placement & clamping", () => {
  it("places below selection when sufficient room exists below", () => {
    const anchor = { left: 450, top: 180, right: 650, bottom: 204 };
    const placed = computeMatzSmartStagePlacement(anchor, { width: 420, height: 300 }, STAGE, LIMITS);
    expect(placed.top).toBe(214);
    expect(placed.left).toBeGreaterThanOrEqual(STAGE.left + 12);
    expect(placed.left + placed.width).toBeLessThanOrEqual(STAGE.right - 12);
    expect(placed.top + placed.height).toBeLessThanOrEqual(STAGE.bottom - 12);
  });

  it("flips above selection when selection is near bottom of stage", () => {
    const anchor = { left: 500, top: 760, right: 700, bottom: 785 };
    const placed = computeMatzSmartStagePlacement(anchor, { width: 420, height: 320 }, STAGE, LIMITS);
    expect(placed.top).toBe(430);
    expect(placed.top + placed.height).toBeLessThanOrEqual(STAGE.bottom - 12);
  });

  it("falls back to balanced stage slot when selection spans whole viewport", () => {
    const tallAnchor = { left: 300, top: 80, right: 900, bottom: 850 };
    const placed = computeMatzSmartStagePlacement(tallAnchor, { width: 430, height: 360 }, STAGE, LIMITS);
    expect(placed.top).toBeGreaterThanOrEqual(STAGE.top + 12);
    expect(placed.top + placed.height).toBeLessThanOrEqual(STAGE.bottom - 12);
  });

  it("clamps oversized dimensions and off-screen coordinates strictly inside stage", () => {
    const clamped = clampMatzFloatingRect(
      { left: -50, top: 2000, width: 1400, height: 1200 },
      STAGE,
      LIMITS,
      10
    );
    expect(clamped.width).toBe(LIMITS.maxWidth);
    expect(clamped.height).toBe(LIMITS.maxHeight);
    expect(clamped.left).toBe(STAGE.left + 10);
    expect(clamped.top + clamped.height).toBe(STAGE.bottom - 10);
  });

  it("computes stage presets (center, top-right, bottom-right) accurately", () => {
    const center = computeMatzStagePresetRect("center", { width: 400, height: 300 }, STAGE, LIMITS);
    expect(center.left).toBe(550);
    expect(center.top).toBe(320);

    const topRight = computeMatzStagePresetRect("top-right", { width: 400, height: 300 }, STAGE, LIMITS, 14);
    expect(topRight.left).toBe(STAGE.right - 14 - 400);
    expect(topRight.top).toBe(STAGE.top + 14);
  });

  it("preserves user stage position, size and expand settings across resets and re-openings", () => {
    const mem = new Map<string, string>();
    const storage: MatzFloatingStorageLike = {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => {
        mem.set(k, v);
      },
      removeItem: (k) => {
        mem.delete(k);
      },
    };

    const makeMockEl = () =>
      ({
        style: { left: "", top: "", width: "", height: "", maxHeight: "" },
        offsetHeight: 280,
        classList: { contains: () => true, add: () => {}, remove: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as HTMLElement;

    const el1 = makeMockEl();
    const ctrl1 = attachMatzFloatingWindow(el1, {
      defaultWidth: 440,
      getStageBounds: () => STAGE,
      storageKey: "test-float-layout",
      storage,
    });

    ctrl1.snapToPreset("top-right");
    const savedLeft = el1.style.left;
    const savedTop = el1.style.top;
    expect(savedLeft).toBe("796px");
    expect(savedTop).toBe("84px");

    // Simulate content reset (ensureVisible) — keeps exact user coordinates
    ctrl1.ensureVisible();
    expect(el1.style.left).toBe(savedLeft);
    expect(el1.style.top).toBe(savedTop);
    ctrl1.destroy();

    // Simulate re-opening in a fresh controller instance: restores user's saved position instead of overriding
    const el2 = makeMockEl();
    const ctrl2 = attachMatzFloatingWindow(el2, {
      defaultWidth: 440,
      getStageBounds: () => STAGE,
      storageKey: "test-float-layout",
      storage,
    });
    ctrl2.openNearAnchor({ left: 300, top: 600, right: 420, bottom: 620 });
    expect(el2.style.left).toBe(savedLeft);
    expect(el2.style.top).toBe(savedTop);
    ctrl2.destroy();
  });
});
