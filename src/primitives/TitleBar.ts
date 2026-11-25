import { matzIcon, MatzIconName } from "../icons/Icons";
import { enableMatzSpotlight } from "../components/RichComponents";
import { getMatzLocale, setMatzLocale, MATZ_LOCALES, matzT, MatzLocale } from "../i18n/index";
import { toggleMatzThemeMode } from "../theme/ThemeEngine";

export type MatzProductID = "heapi" | "myterm" | "writtt" | "bycode" | "matz";

export interface SuiteAppDescriptor {
  id: MatzProductID;
  name: string;
  version: string;
  tagline: string;
  accent: string;
  icon: MatzIconName;
}

export const MATZ_SUITE_APPS: SuiteAppDescriptor[] = [
  { id: "matz", name: "Matz Hub", version: "0.1.0", tagline: "Central de Gestão, Git & Ecossistema", accent: "#8b5cf6", icon: "layers" },
  { id: "bycode", name: "byCode", version: "0.3.0", tagline: "Native AI IDE & Super-App Workspace", accent: "#3b82f6", icon: "code" },
  { id: "heapi", name: "Heapi", version: "0.2.0", tagline: "Native HTTP, REST & mTLS Client", accent: "#d946ef", icon: "globe" },
  { id: "myterm", name: "myTerm", version: "0.6.0", tagline: "High-Speed Native PTY Terminal", accent: "#10b981", icon: "terminal" },
  { id: "writtt", name: "Writtt", version: "0.2.0", tagline: "Zero-Knowledge Markdown & Vault", accent: "#f59e0b", icon: "file-text" },
];

export interface MatzMenuBarAction {
  id: string;
  label: string;
  shortcut?: string;
  icon?: MatzIconName;
  dividerAfter?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface MatzMenuBarGroup {
  id: string;
  label: string;
  items: MatzMenuBarAction[];
}

export interface TitleBarOptions {
  currentProduct: MatzProductID;
  title: string;
  version?: string;
  subtitle?: string;
  menuBarItems?: MatzMenuBarGroup[];
  centerHtml?: string;
  rightActionsHtml?: string;
  showSuiteSwitcher?: boolean;
  onSelectSuiteApp?: (appId: MatzProductID) => void;
  onOpenCommandPalette?: () => void;
  onToggleTheme?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

let wailsDragAndResizeInitialized = false;
let lastDragSentAtMs = 0;

function installWailsPostMessageCoalescer(): void {
  if (typeof window === "undefined") return;
  const win = window as unknown as {
    __matzDragGuardInstalled?: boolean;
    chrome?: { webview?: { postMessage?: (m: unknown) => void } };
  };
  if (win.__matzDragGuardInstalled) return;
  const webview = win.chrome?.webview;
  if (webview && typeof webview.postMessage === "function") {
    const origPost = webview.postMessage.bind(webview);
    webview.postMessage = (msg: unknown) => {
      if (
        msg === "wails:drag" ||
        (typeof msg === "string" && (msg.startsWith("wails:resize:") || msg.startsWith("matz:resize:")))
      ) {
        const now = performance.now();
        if (now - lastDragSentAtMs < 350) {
          // Impede que um segundo "wails:drag" ou "wails:resize" chame w32.ReleaseCapture() e cancele o loop WM_NCLBUTTONDOWN ativo!
          return;
        }
        lastDragSentAtMs = now;
      }
      origPost(msg);
    };
    win.__matzDragGuardInstalled = true;
  }
}

export function invokeWailsNativeMessage(msg: string): void {
  try {
    installWailsPostMessageCoalescer();
    const win = window as unknown as {
      __matzUseNativeResizeBridge?: boolean;
      __matzStartResize?: (edge: string) => void;
      chrome?: { webview?: { postMessage?: (m: string) => void } };
      webkit?: { messageHandlers?: { external?: { postMessage?: (m: string) => void } } };
      runtime?: { WindowStartDrag?: () => void };
    };
    if (msg.startsWith("wails:resize:")) {
      const edge = msg.slice("wails:resize:".length);
      if (typeof win.__matzStartResize === "function") {
        win.__matzStartResize(edge);
        return;
      }
      if (win.__matzUseNativeResizeBridge && win.chrome?.webview?.postMessage) {
        win.chrome.webview.postMessage("matz:resize:" + edge);
        return;
      }
    }
    if (win.chrome?.webview?.postMessage) {
      win.chrome.webview.postMessage(msg);
      return;
    }
    if (win.webkit?.messageHandlers?.external?.postMessage) {
      win.webkit.messageHandlers.external.postMessage(msg);
      return;
    }
    if (msg === "wails:drag" && win.runtime?.WindowStartDrag) {
      win.runtime.WindowStartDrag();
    }
  } catch {
    // Browser preview mode
  }
}

export function isInteractiveTitlebarTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "button, a, input, select, textarea, [role='button'], .matz-switcher-wrapper, .matz-win-btn, .matz-no-drag, .coe-no-drag, [data-no-drag], [data-wails-resize]"
    )
  );
}

export function ensureWailsResizeHandles(): void {
  if (typeof document === "undefined" || !document.body) return;
  if (document.getElementById("matz-frameless-resize-handles")) return;

  const host = document.createElement("div");
  host.id = "matz-frameless-resize-handles";
  host.setAttribute("aria-hidden", "true");
  const baseStyle =
    "position:fixed;z-index:999999;--wails-draggable:no-drag;-webkit-app-region:no-drag;app-region:no-drag;user-select:none;background:transparent;";
  const handles: Array<{ edge: string; cursor: string; pos: string }> = [
    { edge: "n-resize", cursor: "ns-resize", pos: "top:0;left:12px;right:12px;height:6px;" },
    { edge: "s-resize", cursor: "ns-resize", pos: "bottom:0;left:12px;right:12px;height:6px;" },
    { edge: "w-resize", cursor: "ew-resize", pos: "left:0;top:12px;bottom:12px;width:6px;" },
    { edge: "e-resize", cursor: "ew-resize", pos: "right:0;top:12px;bottom:12px;width:6px;" },
    { edge: "nw-resize", cursor: "nwse-resize", pos: "top:0;left:0;width:12px;height:12px;" },
    { edge: "ne-resize", cursor: "nesw-resize", pos: "top:0;right:0;width:12px;height:12px;" },
    { edge: "sw-resize", cursor: "nesw-resize", pos: "bottom:0;left:0;width:12px;height:12px;" },
    { edge: "se-resize", cursor: "nwse-resize", pos: "bottom:0;right:0;width:12px;height:12px;" },
  ];

  host.innerHTML = handles
    .map(
      (h) =>
        `<div data-wails-resize="${h.edge}" style="${baseStyle}${h.pos}cursor:${h.cursor};"></div>`
    )
    .join("");
  document.body.appendChild(host);
}

export function initWailsFramelessWindowEngine(): void {
  if (typeof window === "undefined") return;
  ensureWailsResizeHandles();
  if (wailsDragAndResizeInitialized) return;
  wailsDragAndResizeInitialized = true;
  installWailsPostMessageCoalescer();

  let activeEdge = "";
  let armResize = false;
  let armTitlebarDrag = false;
  let downX = 0;
  let downY = 0;

  const cursorForEdge: Record<string, string> = {
    "n-resize": "ns-resize",
    "s-resize": "ns-resize",
    "e-resize": "ew-resize",
    "w-resize": "ew-resize",
    "nw-resize": "nwse-resize",
    "se-resize": "nwse-resize",
    "ne-resize": "nesw-resize",
    "sw-resize": "nesw-resize",
  };

  const detectEdge = (e: MouseEvent): string => {
    const target = e.target;
    if (target instanceof Element) {
      const explicitHandle = target.closest<HTMLElement>("[data-wails-resize]");
      if (explicitHandle?.dataset.wailsResize) {
        return explicitHandle.dataset.wailsResize;
      }
    }
    const pad = 6;
    const corner = 12;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w <= 0 || h <= 0) return "";
    const left = e.clientX >= 0 && e.clientX < pad;
    const right = e.clientX <= w && e.clientX >= w - pad;
    const top = e.clientY >= 0 && e.clientY < pad;
    const bottom = e.clientY <= h && e.clientY >= h - pad;

    if (!left && !right && !top && !bottom) return "";

    const leftC = e.clientX >= 0 && e.clientX < corner;
    const rightC = e.clientX <= w && e.clientX >= w - corner;
    const topC = e.clientY >= 0 && e.clientY < corner;
    const bottomC = e.clientY <= h && e.clientY >= h - corner;

    if (rightC && bottomC) return "se-resize";
    if (leftC && bottomC) return "sw-resize";
    if (leftC && topC) return "nw-resize";
    if (rightC && topC) return "ne-resize";
    if (left) return "w-resize";
    if (right) return "e-resize";
    if (top) return "n-resize";
    if (bottom) return "s-resize";
    return "";
  };

  window.addEventListener(
    "mousedown",
    (e) => {
      if (e.button !== 0) return;
      installWailsPostMessageCoalescer();
      const edge = detectEdge(e);
      if (edge) {
        e.preventDefault();
        activeEdge = edge;
        armResize = true;
        armTitlebarDrag = false;
        downX = e.clientX;
        downY = e.clientY;
        invokeWailsNativeMessage("wails:resize:" + edge);
        return;
      }
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest("#matz-native-titlebar, .matz-titlebar, .coe-titlebar, .coe-drag-region, [data-wails-titlebar]") &&
        !isInteractiveTitlebarTarget(target)
      ) {
        armTitlebarDrag = true;
        downX = e.clientX;
        downY = e.clientY;
      } else {
        armTitlebarDrag = false;
      }
    },
    { capture: true }
  );

  window.addEventListener(
    "mousemove",
    (e) => {
      if (armResize && activeEdge) {
        if ((e.buttons & 1) === 0) {
          armResize = false;
          return;
        }
        const dx = Math.abs(e.clientX - downX);
        const dy = Math.abs(e.clientY - downY);
        if (dx >= 2 || dy >= 2) {
          armResize = false;
          invokeWailsNativeMessage("wails:resize:" + activeEdge);
        }
        return;
      }
      if (armTitlebarDrag) {
        if ((e.buttons & 1) === 0) {
          armTitlebarDrag = false;
          return;
        }
        const dx = Math.abs(e.clientX - downX);
        const dy = Math.abs(e.clientY - downY);
        if (dx >= 4 || dy >= 4) {
          armTitlebarDrag = false;
          invokeWailsNativeMessage("wails:drag");
        }
        return;
      }
      const edge = detectEdge(e);
      if (edge !== activeEdge) {
        activeEdge = edge;
        document.body.style.cursor = edge ? cursorForEdge[edge] || edge : "";
      }
    },
    { capture: true }
  );

  const resetDragArm = () => {
    armResize = false;
    armTitlebarDrag = false;
  };
  window.addEventListener("mouseup", resetDragArm, { capture: true });
  window.addEventListener("pointerup", resetDragArm, { capture: true });
  window.addEventListener("blur", resetDragArm);
  window.addEventListener("contextmenu", resetDragArm, { capture: true });

  document.addEventListener("click", () => {
    document.querySelectorAll<HTMLElement>(".matz-switcher-menu.open, .matz-menubar-dropdown.open").forEach((el) => {
      el.classList.remove("open");
    });
    document.querySelectorAll<HTMLElement>(".matz-menubar-trigger.active").forEach((el) => {
      el.classList.remove("active");
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll<HTMLElement>(".matz-switcher-menu.open, .matz-menubar-dropdown.open").forEach((el) => {
        el.classList.remove("open");
      });
      document.querySelectorAll<HTMLElement>(".matz-menubar-trigger.active").forEach((el) => {
        el.classList.remove("active");
      });
    }
  });
}

export function renderMatzTitleBar(container: HTMLElement, opts: TitleBarOptions): void {
  document.documentElement.setAttribute("data-product", opts.currentProduct);
  if (!document.documentElement.getAttribute("data-theme")) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  enableMatzSpotlight();
  initWailsFramelessWindowEngine();

  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const currentLocale = getMatzLocale();
  const currentLocaleObj = MATZ_LOCALES.find((l) => l.code === currentLocale) || MATZ_LOCALES[0];
  const hasMenus = Array.isArray(opts.menuBarItems) && opts.menuBarItems.length > 0;
  const showSwitcher = opts.showSuiteSwitcher ?? Boolean(opts.onSelectSuiteApp);

  container.innerHTML = `
    <header class="matz-titlebar" id="matz-native-titlebar" style="--wails-draggable:drag;-webkit-app-region:drag;app-region:drag;">
      <div class="matz-titlebar-left">
        ${
          showSwitcher
            ? `<div class="matz-switcher-wrapper matz-no-drag" data-no-drag="true" style="--wails-draggable:no-drag;-webkit-app-region:no-drag;app-region:no-drag;">
                <button type="button" class="matz-brand-pill matz-no-drag" id="matz-suite-switcher-btn" title="${matzT("titlebar.switchSuite")}">
                  <span class="matz-brand-dot"></span>
                  <span class="matz-brand-title">${opts.title}</span>
                  ${opts.version ? `<span class="matz-brand-ver matz-tabular">v${opts.version.replace(/^v/, "")}</span>` : ""}
                  <span class="matz-brand-chevron">${matzIcon("chevron-down", 11)}</span>
                </button>
                <div class="matz-switcher-menu matz-no-drag" id="matz-suite-switcher-menu">
                  <div class="matz-switcher-head">
                    <span>${matzT("titlebar.ecosystem")}</span>
                  </div>
                  ${MATZ_SUITE_APPS.map(
                    (app) => `
                    <button type="button" class="matz-switcher-item ${app.id === opts.currentProduct ? "active" : ""}" data-suite-app="${app.id}">
                      <div style="display:flex;align-items:center;gap:9px;min-width:0;">
                        <span style="width:24px;height:24px;border-radius:6px;background:color-mix(in srgb, ${app.accent} 16%, transparent);border:1px solid color-mix(in srgb, ${app.accent} 40%, transparent);color:${app.accent};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
                          ${matzIcon(app.icon, 12)}
                        </span>
                        <div style="text-align:left;min-width:0;">
                          <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-weight:700;font-size:11.5px;color:var(--text-primary);">${app.name}</span>
                            <span class="matz-tabular" style="font-size:9px;font-weight:600;color:var(--text-muted);background:var(--surface-subtle);padding:0 5px;border-radius:4px;border:1px solid var(--border);">v${app.version}</span>
                          </div>
                          <div style="font-size:10px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${app.tagline}</div>
                        </div>
                      </div>
                      <span style="font-size:9.5px;font-weight:700;color:${app.id === opts.currentProduct ? "var(--accent)" : "var(--text-muted)"};flex-shrink:0;">
                        ${app.id === opts.currentProduct ? matzT("titlebar.active") : `${matzT("titlebar.open")}`}
                      </span>
                    </button>
                  `
                  ).join("")}
                </div>
              </div>`
            : `<div class="matz-brand-pill is-standalone" style="cursor:default;">
                <span class="matz-brand-dot"></span>
                <span class="matz-brand-title">${opts.title}</span>
                ${opts.version ? `<span class="matz-brand-ver matz-tabular">v${opts.version.replace(/^v/, "")}</span>` : ""}
              </div>`
        }
        ${
          hasMenus
            ? `<nav class="matz-titlebar-menubar matz-no-drag" data-no-drag="true" aria-label="Menu Principal">
                ${opts.menuBarItems!
                  .map(
                    (grp, gIdx) => `
                  <div class="matz-menubar-group matz-no-drag" data-no-drag="true">
                    <button type="button" class="matz-menubar-trigger matz-no-drag" data-menu-idx="${gIdx}">${grp.label}</button>
                    <div class="matz-menubar-dropdown matz-no-drag" data-menu-dropdown="${gIdx}">
                      ${grp.items
                        .map(
                          (item, iIdx) => `
                        <button type="button" class="matz-menubar-item ${item.disabled ? "disabled" : ""}" data-menu-action="${gIdx}:${iIdx}" ${
                            item.disabled ? "disabled" : ""
                          }>
                          <span class="matz-menubar-item-left">
                            <span class="matz-menubar-item-icon">${item.icon ? matzIcon(item.icon, 12) : ""}</span>
                            <span>${item.label}</span>
                          </span>
                          ${item.shortcut ? `<kbd class="matz-kbd" style="font-size:9.5px;height:16px;">${item.shortcut}</kbd>` : ""}
                        </button>
                        ${item.dividerAfter ? `<div class="matz-menubar-sep"></div>` : ""}
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </nav>`
            : opts.subtitle
            ? `<span class="matz-titlebar-divider" aria-hidden="true"></span><span class="matz-titlebar-subtitle">${opts.subtitle}</span>`
            : ""
        }
      </div>

      <div class="matz-titlebar-center">
        ${
          opts.centerHtml ||
          (opts.onOpenCommandPalette
            ? `<button type="button" class="matz-btn matz-btn-sm matz-no-drag" data-no-drag="true" id="matz-titlebar-cmd-btn" style="min-width:210px;justify-content:space-between;background:var(--surface-input);border-color:var(--border-input);color:var(--text-muted);padding:3px 9px;height:24px;--wails-draggable:no-drag;-webkit-app-region:no-drag;app-region:no-drag;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;">${matzIcon("search", 11)} OmniCommand...</span>
                <kbd class="matz-kbd" style="font-size:9px;height:16px;">Ctrl+K</kbd>
              </button>`
            : "")
        }
      </div>

      <div class="matz-titlebar-right" style="--wails-draggable:drag;-webkit-app-region:drag;app-region:drag;">
        <div class="matz-titlebar-win matz-no-drag" data-no-drag="true" style="display:inline-flex;align-items:center;gap:4px;--wails-draggable:no-drag;-webkit-app-region:no-drag;app-region:no-drag;">
          ${opts.rightActionsHtml || ""}
          <div class="matz-switcher-wrapper matz-no-drag" data-no-drag="true" style="position:relative;--wails-draggable:no-drag;-webkit-app-region:no-drag;app-region:no-drag;">
            <button type="button" class="matz-win-btn matz-no-drag" id="matz-locale-toggle-btn" title="${matzT("titlebar.language")}" style="width:auto;min-width:34px;height:24px;padding:0 6px;gap:3px;font-family:var(--font-mono);font-size:10px;font-weight:700;">
              ${matzIcon("globe", 11)}
              <span>${currentLocaleObj.shortLabel}</span>
            </button>
            <div class="matz-switcher-menu matz-no-drag" id="matz-locale-switcher-menu" style="right:0;left:auto;min-width:155px;">
              <div class="matz-switcher-head">
                <span>${matzT("titlebar.language")}</span>
              </div>
              ${MATZ_LOCALES.map(
                (loc) => `
                <button type="button" class="matz-switcher-item ${loc.code === currentLocale ? "active" : ""}" data-matz-locale="${loc.code}" style="padding:6px 10px;">
                  <span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:${loc.code === currentLocale ? "700" : "500"};color:var(--text-primary);">
                    <strong style="font-family:var(--font-mono);font-size:10px;color:var(--accent);">${loc.shortLabel}</strong>
                    <span>${loc.label}</span>
                  </span>
                  ${loc.code === currentLocale ? matzIcon("check", 11) : ""}
                </button>
              `
              ).join("")}
            </div>
          </div>
          <button type="button" class="matz-win-btn matz-no-drag" id="matz-theme-toggle-btn" title="${matzT("titlebar.theme")}" style="width:28px;height:24px;">
            <span id="matz-theme-icon-wrap" style="display:inline-flex;">${matzIcon(currentTheme === "dark" ? "sun" : "moon", 12)}</span>
          </button>
          ${
            opts.onMinimize
              ? `
            <button type="button" class="matz-win-btn matz-no-drag" id="matz-win-min" title="${matzT("titlebar.minimize")}">${matzIcon("minus", 11)}</button>
            <button type="button" class="matz-win-btn matz-no-drag" id="matz-win-max" title="${matzT("titlebar.maximize")}">${matzIcon("maximize", 11)}</button>
            <button type="button" class="matz-win-btn close matz-no-drag" id="matz-win-close" title="${matzT("titlebar.close")}">${matzIcon("close", 12)}</button>
          `
              : ""
          }
        </div>
      </div>
    </header>
  `;

  const titlebarEl = container.querySelector<HTMLElement>("#matz-native-titlebar");
  titlebarEl?.addEventListener("dblclick", (e) => {
    if (isInteractiveTitlebarTarget(e.target)) return;
    if (opts.onMaximize) {
      opts.onMaximize();
    } else {
      invokeWailsNativeMessage("wails:drag:doubleclick");
    }
  });

  const switcherBtn = container.querySelector<HTMLButtonElement>("#matz-suite-switcher-btn");
  const switcherMenu = container.querySelector<HTMLDivElement>("#matz-suite-switcher-menu");
  const localeBtn = container.querySelector<HTMLButtonElement>("#matz-locale-toggle-btn");
  const localeMenu = container.querySelector<HTMLDivElement>("#matz-locale-switcher-menu");

  switcherBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    container.querySelectorAll<HTMLElement>(".matz-menubar-dropdown.open").forEach((el) => el.classList.remove("open"));
    container.querySelectorAll<HTMLElement>(".matz-menubar-trigger.active").forEach((el) => el.classList.remove("active"));
    localeMenu?.classList.remove("open");
    switcherMenu?.classList.toggle("open");
  });

  localeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    container.querySelectorAll<HTMLElement>(".matz-menubar-dropdown.open").forEach((el) => el.classList.remove("open"));
    container.querySelectorAll<HTMLElement>(".matz-menubar-trigger.active").forEach((el) => el.classList.remove("active"));
    switcherMenu?.classList.remove("open");
    localeMenu?.classList.toggle("open");
  });

  container.querySelectorAll<HTMLButtonElement>("[data-matz-locale]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const loc = btn.dataset.matzLocale as MatzLocale;
      localeMenu?.classList.remove("open");
      setMatzLocale(loc);
    });
  });

  if (hasMenus && opts.menuBarItems) {
    const closeAllMenus = () => {
      container.querySelectorAll<HTMLElement>(".matz-menubar-dropdown.open").forEach((el) => el.classList.remove("open"));
      container.querySelectorAll<HTMLElement>(".matz-menubar-trigger.active").forEach((el) => el.classList.remove("active"));
    };

    container.querySelectorAll<HTMLButtonElement>("[data-menu-idx]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        switcherMenu?.classList.remove("open");
        const idx = trigger.dataset.menuIdx!;
        const drop = container.querySelector<HTMLElement>(`[data-menu-dropdown="${idx}"]`);
        const isOpen = drop?.classList.contains("open");
        closeAllMenus();
        if (!isOpen && drop) {
          drop.classList.add("open");
          trigger.classList.add("active");
        }
      });

      trigger.addEventListener("mouseenter", () => {
        const anyOpen = container.querySelector(".matz-menubar-dropdown.open");
        if (!anyOpen) return;
        const idx = trigger.dataset.menuIdx!;
        const drop = container.querySelector<HTMLElement>(`[data-menu-dropdown="${idx}"]`);
        closeAllMenus();
        if (drop) {
          drop.classList.add("open");
          trigger.classList.add("active");
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>("[data-menu-action]").forEach((itemBtn) => {
      itemBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [gStr, iStr] = (itemBtn.dataset.menuAction || "").split(":");
        const grp = opts.menuBarItems?.[Number(gStr)];
        const act = grp?.items?.[Number(iStr)];
        closeAllMenus();
        if (act && !act.disabled) {
          act.onSelect();
        }
      });
    });
  }

  container.querySelectorAll<HTMLButtonElement>("[data-suite-app]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const appId = btn.dataset.suiteApp as MatzProductID;
      switcherMenu?.classList.remove("open");
      if (opts.onSelectSuiteApp) {
        opts.onSelectSuiteApp(appId);
      }
    });
  });

  container.querySelector("#matz-titlebar-cmd-btn")?.addEventListener("click", () => {
    opts.onOpenCommandPalette?.();
  });

  container.querySelector("#matz-theme-toggle-btn")?.addEventListener("click", () => {
    if (opts.onToggleTheme) {
      opts.onToggleTheme();
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const iconWrap = container.querySelector("#matz-theme-icon-wrap");
      if (iconWrap) {
        iconWrap.innerHTML = matzIcon(cur === "dark" ? "sun" : "moon", 12);
      }
      window.dispatchEvent(new CustomEvent("matz:theme-changed", { detail: { theme: cur } }));
    } else {
      const next = toggleMatzThemeMode();
      const iconWrap = container.querySelector("#matz-theme-icon-wrap");
      if (iconWrap) {
        iconWrap.innerHTML = matzIcon(next === "dark" ? "sun" : "moon", 12);
      }
    }
  });

  container.querySelector("#matz-win-min")?.addEventListener("click", () => opts.onMinimize?.());
  container.querySelector("#matz-win-max")?.addEventListener("click", () => opts.onMaximize?.());
  container.querySelector("#matz-win-close")?.addEventListener("click", () => opts.onClose?.());
}

let activeToastTimer: ReturnType<typeof setTimeout> | null = null;

export function showMatzToast(message: string, durationMs = 3000): void {
  let host = document.querySelector<HTMLDivElement>(".matz-toast-container");
  if (!host) {
    host = document.createElement("div");
    host.className = "matz-toast-container";
    document.body.appendChild(host);
  }
  let item = host.querySelector<HTMLDivElement>(".matz-toast[data-reusable='1']");
  if (!item) {
    item = document.createElement("div");
    item.className = "matz-toast";
    item.setAttribute("data-reusable", "1");
    host.appendChild(item);
  }
  item.textContent = message;
  if (activeToastTimer) {
    clearTimeout(activeToastTimer);
  }
  activeToastTimer = setTimeout(() => {
    item?.remove();
    activeToastTimer = null;
  }, durationMs);
}
