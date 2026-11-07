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
          <div class="matz-terminal-tabs" id="matz-term-tabs"></div>
          <div style="display:flex;align-items:center;gap:6px;">
            <select class="matz-select" id="matz-term-shell-select" style="padding:3px 8px;font-size:11.5px;">
              ${this.shells
                .map((s) => `<option value="${s}">${s.split(/[\\/]/).pop() || s}</option>`)
                .join("")}
            </select>
            <button class="matz-btn" id="matz-term-new-btn" style="padding:3px 9px;font-size:11.5px;">+ Nova Aba</button>
            <button class="matz-btn" id="matz-term-clear-btn" style="padding:3px 9px;font-size:11.5px;">Limpar</button>
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
      this.resizeObserver = new ResizeObserver(() => {
        this.fitActive();
      });
      this.resizeObserver.observe(viewports);
    }

    if (this.tabs.length === 0) {
      await this.createNewTab(this.selectedShell);
    }
  }

  async setCwd(newCwd: string): Promise<void> {
    this.cwd = newCwd;
  }

  async createNewTab(shell?: string): Promise<string> {
    const viewports = this.container.querySelector<HTMLDivElement>("#matz-term-viewports");
    if (!viewports) return "";

    const chosenShell = shell || this.selectedShell || "";
    const paneEl = document.createElement("div");
    paneEl.className = "matz-terminal-pane";
    viewports.appendChild(paneEl);

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.25,
      theme: {
        background: "#09090b",
        foreground: "#f4f4f6",
        cursor: "#10b981",
        selectionBackground: "rgba(16, 185, 129, 0.28)",
      },
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

    const shortName = (chosenShell.split(/[\\/]/).pop() || "shell").replace(/\.exe$/i, "");
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
    for (const t of this.tabs) {
      t.term.dispose();
    }
    this.tabs = [];
  }
}
