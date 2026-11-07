import { matzIcon, MatzIconName } from "../icons/Icons";
import { enableMatzSpotlight } from "../components/RichComponents";

export type MatzProductID = "heapi" | "myterm" | "writtt" | "bycode" | "matz";

export interface SuiteAppDescriptor {
  id: MatzProductID;
  name: string;
  tagline: string;
  accent: string;
  icon: MatzIconName;
}

export const MATZ_SUITE_APPS: SuiteAppDescriptor[] = [
  { id: "matz", name: "Matz Hub", tagline: "Central de Gestão, Git & Ecossistema", accent: "#8b5cf6", icon: "layers" },
  { id: "bycode", name: "byCode", tagline: "Native AI IDE & Super-App Workspace", accent: "#3b82f6", icon: "code" },
  { id: "heapi", name: "Heapi", tagline: "Native HTTP, REST & mTLS Client", accent: "#d946ef", icon: "globe" },
  { id: "myterm", name: "MyTerm", tagline: "High-Speed Native PTY Terminal", accent: "#10b981", icon: "terminal" },
  { id: "writtt", name: "Writtt", tagline: "Zero-Knowledge Markdown & Vault", accent: "#f59e0b", icon: "file-text" },
];

export interface TitleBarOptions {
  currentProduct: MatzProductID;
  title: string;
  version?: string;
  subtitle?: string;
  centerHtml?: string;
  rightActionsHtml?: string;
  onSelectSuiteApp?: (appId: MatzProductID) => void;
  onOpenCommandPalette?: () => void;
  onToggleTheme?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function renderMatzTitleBar(container: HTMLElement, opts: TitleBarOptions): void {
  document.documentElement.setAttribute("data-product", opts.currentProduct);
  if (!document.documentElement.getAttribute("data-theme")) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  enableMatzSpotlight();

  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

  container.innerHTML = `
    <header class="matz-titlebar">
      <div class="matz-titlebar-left">
        <div class="matz-switcher-wrapper">
          <button class="matz-brand-pill" id="matz-suite-switcher-btn" title="Alternar aplicativo da Suíte Matz">
            <span class="matz-brand-dot"></span>
            <span>${opts.title}</span>
            ${opts.version ? `<span class="matz-tabular" style="opacity:0.75;font-weight:600;font-size:10.5px;">v${opts.version.replace(/^v/, "")}</span>` : ""}
            <span style="display:inline-flex;opacity:0.7;">${matzIcon("chevron-down", 12)}</span>
          </button>
          <div class="matz-switcher-menu" id="matz-suite-switcher-menu">
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);padding:6px 8px;display:flex;align-items:center;justify-content:space-between;">
              <span>Matz Suite Ecosystem</span>
              <span class="matz-badge" style="font-size:9px;padding:1px 6px;">Wails v3</span>
            </div>
            ${MATZ_SUITE_APPS.map(
              (app) => `
              <button class="matz-switcher-item ${app.id === opts.currentProduct ? "active" : ""}" data-suite-app="${app.id}">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="width:24px;height:24px;border-radius:6px;background:color-mix(in srgb, ${app.accent} 16%, transparent);border:1px solid color-mix(in srgb, ${app.accent} 40%, transparent);color:${app.accent};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${matzIcon(app.icon, 13)}
                  </span>
                  <div style="text-align:left;">
                    <div style="font-weight:700;font-size:12px;color:var(--text-primary);">${app.name}</div>
                    <div style="font-size:10.5px;color:var(--text-muted);">${app.tagline}</div>
                  </div>
                </div>
                <span style="font-size:10px;font-weight:600;color:${app.id === opts.currentProduct ? "var(--accent)" : "var(--text-muted)"};">
                  ${app.id === opts.currentProduct ? "Ativo" : "Abrir ↗"}
                </span>
              </button>
            `
            ).join("")}
          </div>
        </div>
        ${opts.subtitle ? `<span style="color:var(--text-muted);font-size:11.5px;font-weight:500;">${opts.subtitle}</span>` : ""}
      </div>

      <div class="matz-titlebar-center">
        ${
          opts.centerHtml ||
          (opts.onOpenCommandPalette
            ? `<button class="matz-btn matz-btn-sm" id="matz-titlebar-cmd-btn" style="min-width:220px;justify-content:space-between;background:var(--surface-input);border-color:var(--border-input);color:var(--text-muted);padding:4px 10px;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;">${matzIcon("search", 12)} OmniCommand...</span>
                <kbd class="matz-kbd" style="font-size:9.5px;">Ctrl+K</kbd>
              </button>`
            : "")
        }
      </div>

      <div class="matz-titlebar-right">
        ${opts.rightActionsHtml || ""}
        <button class="matz-win-btn" id="matz-theme-toggle-btn" title="Alternar Tema Specular Obsidian (Dark) / Architectural Alabaster (Light)" style="width:auto;padding:0 8px;gap:5px;font-size:11px;">
          <span id="matz-theme-icon-wrap" style="display:inline-flex;">${matzIcon(currentTheme === "dark" ? "sun" : "moon", 13)}</span>
        </button>
        ${
          opts.onMinimize
            ? `
          <button class="matz-win-btn" id="matz-win-min" title="Minimizar">${matzIcon("minus", 12)}</button>
          <button class="matz-win-btn" id="matz-win-max" title="Maximizar / Restaurar">${matzIcon("maximize", 12)}</button>
          <button class="matz-win-btn close" id="matz-win-close" title="Fechar">${matzIcon("close", 13)}</button>
        `
            : ""
        }
      </div>
    </header>
  `;

  const switcherBtn = container.querySelector<HTMLButtonElement>("#matz-suite-switcher-btn");
  const switcherMenu = container.querySelector<HTMLDivElement>("#matz-suite-switcher-menu");

  switcherBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    switcherMenu?.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    switcherMenu?.classList.remove("open");
  });

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
    } else {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      const iconWrap = container.querySelector("#matz-theme-icon-wrap");
      if (iconWrap) {
        iconWrap.innerHTML = matzIcon(next === "dark" ? "sun" : "moon", 13);
      }
    }
  });

  container.querySelector("#matz-win-min")?.addEventListener("click", () => opts.onMinimize?.());
  container.querySelector("#matz-win-max")?.addEventListener("click", () => opts.onMaximize?.());
  container.querySelector("#matz-win-close")?.addEventListener("click", () => opts.onClose?.());
}

export function showMatzToast(message: string, durationMs = 3000): void {
  let host = document.querySelector<HTMLDivElement>(".matz-toast-container");
  if (!host) {
    host = document.createElement("div");
    host.className = "matz-toast-container";
    document.body.appendChild(host);
  }
  const item = document.createElement("div");
  item.className = "matz-toast";
  item.textContent = message;
  host.appendChild(item);
  setTimeout(() => {
    item.remove();
  }, durationMs);
}
