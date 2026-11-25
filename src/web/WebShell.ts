import { matzIcon } from "../icons/Icons";
import { MatzProductID, MATZ_SUITE_APPS } from "../primitives/TitleBar";

export interface WebNavLink {
  label: string;
  href: string;
}

export interface WebShellConfig {
  product: MatzProductID;
  brandName: string;
  version?: string;
  locale: "pt" | "en" | "es";
  links: WebNavLink[];
  ctaLabel: string;
  ctaHref: string;
  showSuiteBar?: boolean;
  onLocaleChange?: (locale: "pt" | "en" | "es") => void;
}

export function renderMatzWebHeader(cfg: WebShellConfig): string {
  document.documentElement.setAttribute("data-product", cfg.product);
  const suiteBar = cfg.showSuiteBar
    ? `<div class="matz-web-suitebar">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-weight:700;color:var(--text-primary);">ECOSYSTEM</span>
          <span>·</span>
          ${MATZ_SUITE_APPS.map(
            (a) =>
              `<a href="#suite-${a.id}" class="${a.id === cfg.product ? "active" : ""}">${a.name}</a>`
          ).join("")}
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span>Go 1.27 + Wails v3 + Vanilla TS</span>
        </div>
      </div>`
    : "";

  return `
    ${suiteBar}
    <nav class="matz-web-navbar">
      <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-primary);font-weight:800;font-size:1.12rem;">
        <span class="matz-brand-dot"></span>
        <span>${cfg.brandName}</span>
        ${cfg.version ? `<span class="matz-badge matz-tabular">v${cfg.version.replace(/^v/, "")}</span>` : ""}
      </a>
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        ${cfg.links
          .map(
            (l) =>
              `<a href="${l.href}" style="color:var(--text-secondary);text-decoration:none;font-size:0.9rem;font-weight:500;">${l.label}</a>`
          )
          .join("")}
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button type="button" class="matz-btn" id="matz-web-lang-btn" style="padding:4px 9px;font-size:11px;font-family:var(--font-mono);font-weight:700;">
          ${matzIcon("globe", 12)} <span>${cfg.locale.toUpperCase()}</span>
        </button>
        <a href="${cfg.ctaHref}" class="matz-btn matz-btn-primary" style="padding:7px 15px;font-size:0.88rem;text-decoration:none;">
          ${cfg.ctaLabel}
        </a>
      </div>
    </nav>
  `;
}

export function renderMatzWebFooter(
  brandName: string,
  locale: "pt" | "en" | "es" = "pt",
  taglineOverride?: string
): string {
  const defaultTagline =
    locale === "pt"
      ? "Software nativo open-source construido em Go + Wails v3 & HTML5/CSS3/Vanilla TS."
      : locale === "es"
      ? "Software nativo open-source construido con Go + Wails v3 y HTML5/CSS3/Vanilla TS."
      : "Open-source native desktop software built with Go + Wails v3 & HTML5/CSS3/Vanilla TS.";

  return `
    <footer style="margin-top:auto;border-top:1px solid var(--border);background:var(--bg-secondary);padding:42px 24px;">
      <div class="matz-web-container" style="padding:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:1.05rem;">
            <span class="matz-brand-dot"></span>
            <span>${brandName}</span>
          </div>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:6px;">
            ${taglineOverride || defaultTagline}
          </p>
        </div>
        <div style="display:flex;gap:18px;font-size:0.85rem;color:var(--text-secondary);">
          <a href="https://github.com/marcelomatz" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">GitHub</a>
          <a href="#features" style="color:inherit;text-decoration:none;">${locale === "en" ? "Features" : "Recursos"}</a>
          <a href="#docs" style="color:inherit;text-decoration:none;">${locale === "en" ? "Docs" : "Documentacao"}</a>
          <a href="#download" style="color:inherit;text-decoration:none;">Download</a>
        </div>
      </div>
    </footer>
  `;
}
