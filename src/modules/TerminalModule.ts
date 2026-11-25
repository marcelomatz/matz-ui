import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export interface TerminalBridge {
  detectShells(): Promise<string[]>;
  createSession(shell: string, cwd: string, cols: number, rows: number): Promise<string>;
  write(sessionId: string, data: string): Promise<void>;
  resize(sessionId: string, cols: number, rows: number): Promise<void>;
  closeSession(sessionId: string): Promise<void>;
  onData(callback: (sessionId: string, chunk: string) => void): () => void;
  onExit?(callback: (sessionId: string, reason: string) => void): () => void;
}

interface TermTabInstance {
  id: string;
  title: string;
  shell: string;
  term: Terminal;
  fit: FitAddon;
  paneEl: HTMLDivElement;
}

function formatShellLabel(shellPath: string): string {
  const lower = (shellPath || "").toLowerCase();
  const base = (shellPath.split(/[\\/]/).pop() || shellPath).toLowerCase();
  if (lower.includes("git") && base.startsWith("bash")) return "Git Bash (bash.exe)";
  if (lower.includes("msys") && base.startsWith("bash")) return "MSYS2 Bash (bash.exe)";
  if (lower.includes("cygwin") && base.startsWith("bash")) return "Cygwin Bash (bash.exe)";
  if (base === "pwsh.exe" || base === "pwsh") return "PowerShell 7 (pwsh)";
  if (base === "powershell.exe" || base === "powershell") return "Windows PowerShell";
  if (base === "cmd.exe" || base === "cmd") return "Command Prompt (cmd.exe)";
  if (base === "wsl.exe" || base === "wsl") return "WSL Linux (wsl.exe)";
  if (base === "nu.exe" || base === "nu") return "NuShell (nu)";
  if (base === "zsh") return "Zsh (/bin/zsh)";
  if (base === "fish") return "Fish Shell";
  if (base === "bash" || base === "bash.exe") return "Bash Shell";
  return shellPath.split(/[\\/]/).pop() || shellPath;
}

function formatShellShortTabName(shellPath: string): string {
  const lower = (shellPath || "").toLowerCase();
  const base = (shellPath.split(/[\\/]/).pop() || "shell").replace(/\.exe$/i, "");
  if (lower.includes("git") && base.toLowerCase() === "bash") return "git-bash";
  return base;
}

export function getMatzTerminalTheme(mode: "dark" | "light") {
  if (mode === "light") {
    return {
      background: "#f8fafc",
      foreground: "#0f172a",
      cursor: "#4f46e5",
      cursorAccent: "#ffffff",
      selectionBackground: "rgba(79, 70, 229, 0.18)",
      black: "#0f172a",
      red: "#dc2626",
      green: "#059669",
      yellow: "#d97706",
      blue: "#2563eb",
      magenta: "#7c3aed",
      cyan: "#0891b2",
      white: "#475569",
      brightBlack: "#64748b",
      brightRed: "#ef4444",
      brightGreen: "#10b981",
      brightYellow: "#f59e0b",
      brightBlue: "#3b82f6",
      brightMagenta: "#8b5cf6",
      brightCyan: "#06b6d4",
      brightWhite: "#090d16",
    };
  }
  return {
    background: "#09090b",
    foreground: "#f4f4f6",
    cursor: "#10b981",
    cursorAccent: "#09090b",
    selectionBackground: "rgba(16, 185, 129, 0.28)",
    black: "#18181b",
    red: "#f87171",
    green: "#34d399",
    yellow: "#fbbf24",
    blue: "#60a5fa",
    magenta: "#c084fc",
    cyan: "#22d3ee",
    white: "#e4e4e7",
    brightBlack: "#71717a",
    brightRed: "#fca5a5",
    brightGreen: "#6ee7b7",
    brightYellow: "#fde68a",
    brightBlue: "#93c5fd",
    brightMagenta: "#d8b4fe",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  };
}

export class MatzTerminalModule {
  private container: HTMLElement;
  private bridge: TerminalBridge;
  private tabs: TermTabInstance[] = [];
  private activeId: string | null = null;
  private shells: string[] = [];
  private selectedShell = "";
  private cwd = "";
  private unsubData?: () => void;
  private resizeObserver?: ResizeObserver;
  private themeObserver?: MutationObserver;
  private onThemeCustomEvent?: () => void;

  constructor(container: HTMLElement, bridge: TerminalBridge, initialCwd = "") {
    this.container = container;
    this.bridge = bridge;
    this.cwd = initialCwd;
  }

  async mount(): Promise<void> {
    try {
      this.shells = await this.bridge.detectShells();
      this.selectedShell = this.shells[0] || "";
    } catch {
      this.shells = ["powershell.exe", "cmd.exe", "bash"];
      this.selectedShell = this.shells[0];
    }

    this.container.innerHTML = `
      <div class="matz-terminal-module">
        <div class="matz-terminal-toolbar">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span class="matz-badge" style="font-size:9.5px;padding:1px 6px;color:#10b981;border-color:rgba(16,185,129,0.35);background:rgba(16,185,129,0.12);font-family:var(--font-mono);">myTerm PTY</span>
            <div class="matz-terminal-tabs" id="matz-term-tabs"></div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <select class="matz-select" id="matz-term-shell-select" title="Selecionar Shell instalado no sistema" style="padding:3px 8px;font-size:11.5px;height:26px;">
              ${this.shells
                .map((s) => `<option value="${s}">${formatShellLabel(s)}</option>`)
                .join("")}
            </select>
            <button class="matz-btn-xs" id="matz-term-new-btn" title="Abrir nova sessão com o shell selecionado (Ctrl+Shift+T)">+ Nova Aba</button>
            <button class="matz-btn-xs" id="matz-term-clear-btn" title="Limpar buffer do terminal ativo">Limpar</button>
          </div>
        </div>
        <div class="matz-terminal-viewports" id="matz-term-viewports"></div>
      </div>
    `;

    const shellSelect = this.container.querySelector<HTMLSelectElement>("#matz-term-shell-select");
    shellSelect?.addEventListener("change", () => {
      this.selectedShell = shellSelect.value;
    });

    this.container.querySelector("#matz-term-new-btn")?.addEventListener("click", () => {
      void this.createNewTab(this.selectedShell);
    });

    this.container.querySelector("#matz-term-clear-btn")?.addEventListener("click", () => {
      const cur = this.tabs.find((t) => t.id === this.activeId);
      cur?.term.clear();
    });

    this.unsubData = this.bridge.onData((sessionId, chunk) => {
      const target = this.tabs.find((t) => t.id === sessionId);
      target?.term.write(chunk);
    });

    const viewports = this.container.querySelector<HTMLDivElement>("#matz-term-viewports");
    if (viewports) {
      let lastWidth = 0;
      let lastHeight = 0;
      let rafPending = false;
      this.resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (Math.abs(w - lastWidth) < 4 && Math.abs(h - lastHeight) < 4) {
          return;
        }
        lastWidth = w;
        lastHeight = h;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            rafPending = false;
            this.fitActive();
          });
        }
      });
      this.resizeObserver.observe(viewports);
    }

    const syncTheme = () => {
      const mode = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextPalette = getMatzTerminalTheme(mode);
      for (const t of this.tabs) {
        t.term.options.theme = nextPalette;
      }
    };

    this.themeObserver = new MutationObserver(() => syncTheme());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    this.onThemeCustomEvent = () => syncTheme();
    window.addEventListener("matz:theme-changed", this.onThemeCustomEvent);

    if (this.tabs.length === 0) {
      await this.createNewTab(this.selectedShell);
    }
  }

  async setCwd(newCwd: string): Promise<void> {
    this.cwd = newCwd;
  }

  async sendCommand(cmdLine: string): Promise<void> {
    if (!this.activeId || this.tabs.length === 0) {
      await this.createNewTab(this.selectedShell);
    }
    if (this.activeId) {
      await this.bridge.write(this.activeId, `${cmdLine}\r`);
    }
  }

  async createNewTab(shell?: string): Promise<string> {
    const viewports = this.container.querySelector<HTMLDivElement>("#matz-term-viewports");
    if (!viewports) return "";

    const chosenShell = shell || this.selectedShell || "";
    const paneEl = document.createElement("div");
    paneEl.className = "matz-terminal-pane";
    viewports.appendChild(paneEl);

    const currentMode = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.25,
      theme: getMatzTerminalTheme(currentMode),
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(paneEl);
    fit.fit();

    const cols = term.cols || 100;
    const rows = term.rows || 30;
    const sessionId = await this.bridge.createSession(chosenShell, this.cwd, cols, rows);

    term.onData((data) => {
      void this.bridge.write(sessionId, data);
    });

    const shortName = formatShellShortTabName(chosenShell);
    const instance: TermTabInstance = {
      id: sessionId,
      title: `${shortName} #${this.tabs.length + 1}`,
      shell: chosenShell,
      term,
      fit,
      paneEl,
    };

    this.tabs.push(instance);
    this.activateTab(sessionId);
    return sessionId;
  }

  activateTab(id: string): void {
    this.activeId = id;
    for (const t of this.tabs) {
      t.paneEl.style.display = t.id === id ? "block" : "none";
    }
    this.renderTabsBar();
    this.fitActive();
  }

  async closeTab(id: string): Promise<void> {
    const idx = this.tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const [removed] = this.tabs.splice(idx, 1);
    removed.term.dispose();
    removed.paneEl.remove();
    await this.bridge.closeSession(id);

    if (this.activeId === id) {
      this.activeId = this.tabs[0]?.id || null;
    }
    if (this.activeId) {
      this.activateTab(this.activeId);
    } else {
      this.renderTabsBar();
    }
  }

  fitActive(): void {
    const cur = this.tabs.find((t) => t.id === this.activeId);
    if (!cur) return;
    try {
      cur.fit.fit();
      void this.bridge.resize(cur.id, cur.term.cols, cur.term.rows);
    } catch {
      // Ignore transient layout resize errors
    }
  }

  private renderTabsBar(): void {
    const tabsHost = this.container.querySelector<HTMLDivElement>("#matz-term-tabs");
    if (!tabsHost) return;
    tabsHost.innerHTML = this.tabs
      .map(
        (t) => `
        <div class="matz-terminal-tab ${t.id === this.activeId ? "active" : ""}" data-tab-id="${t.id}">
          <span>›_ ${t.title}</span>
          <span data-close-id="${t.id}" style="opacity:0.6;font-size:10px;padding:0 2px;">✕</span>
        </div>
      `
      )
      .join("");

    tabsHost.querySelectorAll<HTMLDivElement>("[data-tab-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.tabId;
        if (id) this.activateTab(id);
      });
    });

    tabsHost.querySelectorAll<HTMLSpanElement>("[data-close-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = el.dataset.closeId;
        if (id) void this.closeTab(id);
      });
    });
  }

  destroy(): void {
    this.unsubData?.();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    if (this.onThemeCustomEvent) {
      window.removeEventListener("matz:theme-changed", this.onThemeCustomEvent);
    }
    for (const t of this.tabs) {
      t.term.dispose();
    }
    this.tabs = [];
  }
}
