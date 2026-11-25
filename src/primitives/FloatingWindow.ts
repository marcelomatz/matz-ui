/**
 * MatzFloatingWindow — Reusable Stage-Aware Draggable & Resizable Floating Window Primitive
 *
 * Guarantees that floating tool palettes, inline AI assistants, and contextual inspectors:
 *   1. Open in an optimal position where 100% of controls fit inside the active workspace stage.
 *   2. Automatically nudge back into view when dynamic content expands (e.g. async AI replies).
 *   3. Can be freely dragged by their header, resized from edges/corners, or snapped to stage presets.
 */

export interface MatzStageBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MatzAnchorBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MatzFloatingSizeLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface MatzFloatingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type MatzStagePreset =
  | "center"
  | "top-right"
  | "bottom-right"
  | "bottom-left"
  | "top-left";

export function clampMatzFloatingRect(
  rect: MatzFloatingRect,
  stage: MatzStageBounds,
  limits: MatzFloatingSizeLimits,
  pad = 10
): MatzFloatingRect {
  const stageW = Math.max(240, stage.right - stage.left - pad * 2);
  const stageH = Math.max(180, stage.bottom - stage.top - pad * 2);

  const effMinW = Math.min(limits.minWidth, stageW);
  const effMaxW = Math.max(effMinW, Math.min(limits.maxWidth, stageW));
  const effMinH = Math.min(limits.minHeight, stageH);
  const effMaxH = Math.max(effMinH, Math.min(limits.maxHeight, stageH));

  const width = Math.round(Math.max(effMinW, Math.min(effMaxW, rect.width)));
  const height = Math.round(Math.max(effMinH, Math.min(effMaxH, rect.height)));

  const minLeft = stage.left + pad;
  const maxLeft = Math.max(minLeft, stage.right - pad - width);
  const minTop = stage.top + pad;
  const maxTop = Math.max(minTop, stage.bottom - pad - height);

  const left = Math.round(Math.max(minLeft, Math.min(maxLeft, rect.left)));
  const top = Math.round(Math.max(minTop, Math.min(maxTop, rect.top)));

  return { left, top, width, height };
}

export function computeMatzSmartStagePlacement(
  anchor: MatzAnchorBox | null,
  desiredSize: { width: number; height: number },
  stage: MatzStageBounds,
  limits: MatzFloatingSizeLimits,
  pad = 12
): MatzFloatingRect {
  const stageW = Math.max(240, stage.right - stage.left - pad * 2);
  const stageH = Math.max(180, stage.bottom - stage.top - pad * 2);

  const width = Math.round(
    Math.max(Math.min(limits.minWidth, stageW), Math.min(Math.min(limits.maxWidth, stageW), desiredSize.width))
  );
  const height = Math.round(
    Math.max(Math.min(limits.minHeight, stageH), Math.min(Math.min(limits.maxHeight, stageH), desiredSize.height))
  );

  if (!anchor) {
    const centeredLeft = stage.left + (stage.right - stage.left - width) / 2;
    const upperCenterTop = stage.top + Math.max(pad, (stageH - height) * 0.24);
    return clampMatzFloatingRect({ left: centeredLeft, top: upperCenterTop, width, height }, stage, limits, pad);
  }

  const anchorCenterX = (anchor.left + anchor.right) / 2;
  const preferredLeft = anchorCenterX - width / 2;

  const gap = 10;
  const belowTop = anchor.bottom + gap;
  const aboveTop = anchor.top - gap - height;

  let chosenTop: number;
  if (belowTop + height <= stage.bottom - pad && belowTop >= stage.top + pad) {
    chosenTop = belowTop;
  } else if (aboveTop >= stage.top + pad && aboveTop + height <= stage.bottom - pad) {
    chosenTop = aboveTop;
  } else {
    // Neither strictly below nor strictly above fits cleanly: place at a balanced upper-center stage slot
    chosenTop = stage.top + Math.max(pad, (stageH - height) * 0.22);
  }

  return clampMatzFloatingRect(
    { left: preferredLeft, top: chosenTop, width, height },
    stage,
    limits,
    pad
  );
}

export function computeMatzStagePresetRect(
  preset: MatzStagePreset,
  currentSize: { width: number; height: number },
  stage: MatzStageBounds,
  limits: MatzFloatingSizeLimits,
  pad = 14
): MatzFloatingRect {
  const w = currentSize.width;
  const h = currentSize.height;
  let left = stage.left + pad;
  let top = stage.top + pad;

  switch (preset) {
    case "center":
      left = stage.left + (stage.right - stage.left - w) / 2;
      top = stage.top + (stage.bottom - stage.top - h) / 2;
      break;
    case "top-right":
      left = stage.right - pad - w;
      top = stage.top + pad;
      break;
    case "bottom-right":
      left = stage.right - pad - w;
      top = stage.bottom - pad - h;
      break;
    case "bottom-left":
      left = stage.left + pad;
      top = stage.bottom - pad - h;
      break;
    case "top-left":
      left = stage.left + pad;
      top = stage.top + pad;
      break;
  }

  return clampMatzFloatingRect({ left, top, width: w, height: h }, stage, limits, pad);
}

export interface MatzFloatingStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface MatzFloatingPersistedState {
  width: number;
  height: number | null;
  left: number | null;
  top: number | null;
  expanded: boolean;
  hasCustomPosition: boolean;
}

export interface MatzFloatingWindowOptions {
  getStageBounds?: () => MatzStageBounds;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  defaultWidth?: number;
  storageKey?: string;
  storage?: MatzFloatingStorageLike | null;
  onLayoutChange?: (rect: MatzFloatingRect) => void;
}

export interface MatzFloatingWindowController {
  openNearAnchor: (anchor: MatzAnchorBox | null) => void;
  ensureVisible: () => void;
  snapToPreset: (preset: MatzStagePreset) => void;
  cycleCornerPreset: () => MatzStagePreset;
  toggleExpand: () => boolean;
  isExpanded: () => boolean;
  resetCustomSizing: () => void;
  destroy: () => void;
}

const CORNER_SEQUENCE: MatzStagePreset[] = [
  "top-right",
  "bottom-right",
  "bottom-left",
  "top-left",
];

export function renderMatzResizeHandlesHtml(): string {
  return `
    <div class="matz-float-handle is-e" data-matz-resize="e"></div>
    <div class="matz-float-handle is-w" data-matz-resize="w"></div>
    <div class="matz-float-handle is-s" data-matz-resize="s"></div>
    <div class="matz-float-handle is-sw" data-matz-resize="sw"></div>
    <div class="matz-float-handle is-se" data-matz-resize="se" title="Resize"></div>
  `;
}

export function attachMatzFloatingWindow(
  windowEl: HTMLElement,
  options: MatzFloatingWindowOptions = {}
): MatzFloatingWindowController {
  const defaultWidth = options.defaultWidth ?? 430;
  const limits: MatzFloatingSizeLimits = {
    minWidth: options.minWidth ?? 340,
    maxWidth: options.maxWidth ?? 760,
    minHeight: options.minHeight ?? 210,
    maxHeight: options.maxHeight ?? 680,
  };

  let userWidth = defaultWidth;
  let userHeight: number | null = null;
  let customLeft: number | null = null;
  let customTop: number | null = null;
  let hasCustomPosition = false;
  let expanded = false;
  let preExpandState: { left: number; top: number; width: number; height: number | null } | null = null;
  let cornerIdx = -1;

  const resolveStorage = (): MatzFloatingStorageLike | null => {
    if (options.storage !== undefined) return options.storage;
    try {
      return typeof localStorage !== "undefined" ? localStorage : null;
    } catch {
      return null;
    }
  };

  const persistState = () => {
    if (!options.storageKey) return;
    const store = resolveStorage();
    if (!store) return;
    try {
      const payload: MatzFloatingPersistedState = {
        width: userWidth,
        height: userHeight,
        left: customLeft,
        top: customTop,
        expanded,
        hasCustomPosition,
      };
      store.setItem(options.storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  };

  if (options.storageKey) {
    const store = resolveStorage();
    if (store) {
      try {
        const raw = store.getItem(options.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<MatzFloatingPersistedState>;
          if (typeof parsed.width === "number" && Number.isFinite(parsed.width)) {
            userWidth = Math.max(limits.minWidth, Math.min(limits.maxWidth, parsed.width));
          }
          if (typeof parsed.height === "number" && Number.isFinite(parsed.height)) {
            userHeight = Math.max(limits.minHeight, Math.min(limits.maxHeight, parsed.height));
          }
          if (typeof parsed.left === "number" && Number.isFinite(parsed.left)) {
            customLeft = parsed.left;
          }
          if (typeof parsed.top === "number" && Number.isFinite(parsed.top)) {
            customTop = parsed.top;
          }
          if (typeof parsed.hasCustomPosition === "boolean") {
            hasCustomPosition = parsed.hasCustomPosition;
          }
          if (typeof parsed.expanded === "boolean") {
            expanded = parsed.expanded;
          }
        }
      } catch {
        // ignore malformed state
      }
    }
  }

  const resolveStage = (): MatzStageBounds => {
    if (options.getStageBounds) {
      const b = options.getStageBounds();
      if (b.right - b.left > 120 && b.bottom - b.top > 120) {
        return b;
      }
    }
    const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      left: 10,
      top: 70,
      right: winW - 10,
      bottom: winH - 28,
    };
  };

  const applyRect = (left: number, top: number, width: number, explicitHeight: number | null) => {
    const stage = resolveStage();
    const maxAvailH = Math.max(180, stage.bottom - stage.top - 20);
    windowEl.style.maxHeight = `${Math.min(limits.maxHeight, maxAvailH)}px`;
    windowEl.style.width = `${width}px`;
    windowEl.style.height = explicitHeight !== null ? `${explicitHeight}px` : "auto";

    const measuredH = explicitHeight ?? Math.max(limits.minHeight, windowEl.offsetHeight || 260);
    const clamped = clampMatzFloatingRect({ left, top, width, height: measuredH }, stage, limits, 10);

    windowEl.style.left = `${clamped.left}px`;
    windowEl.style.top = `${clamped.top}px`;
    windowEl.style.width = `${clamped.width}px`;
    if (explicitHeight !== null) {
      windowEl.style.height = `${clamped.height}px`;
    }
    options.onLayoutChange?.(clamped);
  };

  const openNearAnchor = (anchor: MatzAnchorBox | null) => {
    const stage = resolveStage();
    if (expanded) {
      const targetW = Math.min(660, stage.right - stage.left - 32);
      const targetH = Math.min(540, stage.bottom - stage.top - 32);
      const centered = computeMatzStagePresetRect("center", { width: targetW, height: targetH }, stage, limits, 16);
      applyRect(centered.left, centered.top, centered.width, centered.height);
      return;
    }

    if (hasCustomPosition && customLeft !== null && customTop !== null) {
      applyRect(customLeft, customTop, userWidth, userHeight);
      return;
    }

    const maxAvailH = Math.max(180, stage.bottom - stage.top - 24);
    windowEl.style.maxHeight = `${Math.min(limits.maxHeight, maxAvailH)}px`;
    windowEl.style.width = `${userWidth}px`;
    windowEl.style.height = userHeight !== null ? `${userHeight}px` : "auto";

    const naturalH = userHeight ?? Math.max(limits.minHeight, windowEl.offsetHeight || 280);
    const placed = computeMatzSmartStagePlacement(
      anchor,
      { width: userWidth, height: naturalH },
      stage,
      limits,
      12
    );
    windowEl.style.left = `${placed.left}px`;
    windowEl.style.top = `${placed.top}px`;
    windowEl.style.width = `${placed.width}px`;
    if (userHeight !== null) {
      windowEl.style.height = `${placed.height}px`;
    }
    options.onLayoutChange?.(placed);
  };

  const ensureVisible = () => {
    const curLeft = parseFloat(windowEl.style.left) || customLeft || 40;
    const curTop = parseFloat(windowEl.style.top) || customTop || 90;
    const curW = parseFloat(windowEl.style.width) || userWidth;
    const expH = expanded
      ? parseFloat(windowEl.style.height) || null
      : userHeight;
    applyRect(curLeft, curTop, curW, expH);
  };

  const snapToPreset = (preset: MatzStagePreset) => {
    const stage = resolveStage();
    const curW = parseFloat(windowEl.style.width) || userWidth;
    const curH = (expanded ? parseFloat(windowEl.style.height) : userHeight) ?? Math.max(limits.minHeight, windowEl.offsetHeight || 280);
    const target = computeMatzStagePresetRect(preset, { width: curW, height: curH }, stage, limits, 14);
    customLeft = target.left;
    customTop = target.top;
    hasCustomPosition = true;
    persistState();
    applyRect(target.left, target.top, target.width, expanded ? target.height : userHeight);
  };

  const cycleCornerPreset = (): MatzStagePreset => {
    cornerIdx = (cornerIdx + 1) % CORNER_SEQUENCE.length;
    const nextPreset = CORNER_SEQUENCE[cornerIdx];
    snapToPreset(nextPreset);
    return nextPreset;
  };

  const toggleExpand = (): boolean => {
    const stage = resolveStage();
    if (!expanded) {
      preExpandState = {
        left: parseFloat(windowEl.style.left) || stage.left + 24,
        top: parseFloat(windowEl.style.top) || stage.top + 24,
        width: userWidth,
        height: userHeight,
      };
      expanded = true;
      persistState();
      const targetW = Math.min(660, stage.right - stage.left - 32);
      const targetH = Math.min(540, stage.bottom - stage.top - 32);
      const centered = computeMatzStagePresetRect("center", { width: targetW, height: targetH }, stage, limits, 16);
      applyRect(centered.left, centered.top, centered.width, centered.height);
    } else {
      expanded = false;
      persistState();
      const prev = preExpandState;
      preExpandState = null;
      if (prev) {
        applyRect(prev.left, prev.top, prev.width, prev.height);
      } else {
        ensureVisible();
      }
    }
    return expanded;
  };

  let activeMoveCleanup: (() => void) | null = null;

  const onMouseDown = (ev: MouseEvent) => {
    if (ev.button !== 0) return;
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    const resizeEl = target.closest("[data-matz-resize]") as HTMLElement | null;
    if (resizeEl) {
      ev.preventDefault();
      ev.stopPropagation();
      const dir = resizeEl.dataset.matzResize || "se";
      const startX = ev.clientX;
      const startY = ev.clientY;
      const rect0 = windowEl.getBoundingClientRect();
      windowEl.classList.add("is-interacting");

      const onMove = (m: MouseEvent) => {
        const dx = m.clientX - startX;
        const dy = m.clientY - startY;
        let nextLeft = rect0.left;
        let nextTop = rect0.top;
        let nextW = rect0.width;
        let nextH = rect0.height;
        let heightTouched = userHeight !== null || expanded;

        if (dir.includes("e")) nextW = rect0.width + dx;
        if (dir.includes("w")) {
          nextW = rect0.width - dx;
          nextLeft = rect0.left + dx;
        }
        if (dir.includes("s")) {
          nextH = rect0.height + dy;
          heightTouched = true;
        }

        const stage = resolveStage();
        const clamped = clampMatzFloatingRect(
          { left: nextLeft, top: nextTop, width: nextW, height: nextH },
          stage,
          limits,
          10
        );
        userWidth = clamped.width;
        if (heightTouched) {
          userHeight = clamped.height;
        }
        if (dir.includes("w")) {
          customLeft = clamped.left;
          customTop = clamped.top;
          hasCustomPosition = true;
        }
        expanded = false;
        applyRect(clamped.left, clamped.top, clamped.width, heightTouched ? clamped.height : null);
      };

      const onUp = () => {
        windowEl.classList.remove("is-interacting");
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        activeMoveCleanup = null;
        persistState();
      };

      activeMoveCleanup = onUp;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return;
    }

    const dragHeader = target.closest("[data-matz-float-drag]") as HTMLElement | null;
    if (dragHeader && !target.closest("button, input, textarea, select, a, [data-no-drag]")) {
      ev.preventDefault();
      ev.stopPropagation();
      const startX = ev.clientX;
      const startY = ev.clientY;
      const rect0 = windowEl.getBoundingClientRect();
      windowEl.classList.add("is-interacting");

      const onMove = (m: MouseEvent) => {
        const nextLeft = rect0.left + (m.clientX - startX);
        const nextTop = rect0.top + (m.clientY - startY);
        const curH = expanded ? rect0.height : userHeight;
        applyRect(nextLeft, nextTop, rect0.width, curH);
        customLeft = parseFloat(windowEl.style.left) || nextLeft;
        customTop = parseFloat(windowEl.style.top) || nextTop;
        hasCustomPosition = true;
      };

      const onUp = () => {
        windowEl.classList.remove("is-interacting");
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        activeMoveCleanup = null;
        persistState();
      };

      activeMoveCleanup = onUp;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  };

  const onDblClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-matz-float-drag]") && !target.closest("button, input, textarea, select, a, [data-no-drag]")) {
      ev.preventDefault();
      toggleExpand();
    }
  };

  const onWindowResize = () => {
    if (windowEl.classList.contains("is-visible")) {
      ensureVisible();
    }
  };

  windowEl.addEventListener("mousedown", onMouseDown);
  windowEl.addEventListener("dblclick", onDblClick);
  if (typeof window !== "undefined") {
    window.addEventListener("resize", onWindowResize);
  }

  return {
    openNearAnchor,
    ensureVisible,
    snapToPreset,
    cycleCornerPreset,
    toggleExpand,
    isExpanded: () => expanded,
    resetCustomSizing: () => {
      userWidth = defaultWidth;
      userHeight = null;
      customLeft = null;
      customTop = null;
      hasCustomPosition = false;
      expanded = false;
      preExpandState = null;
      if (options.storageKey) {
        const store = resolveStorage();
        store?.removeItem?.(options.storageKey);
      }
    },
    destroy: () => {
      activeMoveCleanup?.();
      windowEl.removeEventListener("mousedown", onMouseDown);
      windowEl.removeEventListener("dblclick", onDblClick);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onWindowResize);
      }
    },
  };
}
