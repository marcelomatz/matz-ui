import { MatzProductID, MATZ_SUITE_APPS } from "../primitives/TitleBar";

export interface WebNavLink {
  label: string;
  href: string;
}

export interface WebShellConfig {
  product: MatzProductID;
  brandName: string;
  version?: string;
  locale: "pt" | "en";
  links: WebNavLink[];
  ctaLabel: string;
  ctaHref: string;
  onLocaleChange?: (locale: "pt" | "en") => void;
}

export function renderMatzWebHeader(cfg: WebShellConfig): string {
  document.documentElement.setAttribute("data-product", cfg.product);
  return `
    <div class="matz-web-suitebar">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-weight:700;color:var(--text-primary);">MATZ SUITE</span>
        <span>·</span>
        ${MATZ_SUITE_APPS.map(
          (a) =>
            `<a href="#suite-${a.id}" class="${a.id === cfg.product ? "active" : ""}">${a.name}</a>`
        ).join("")}
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span>Go 1.27 + Wails v3 + Vanilla TS</span>
        <button class="matz-btn" id="matz-web-lang-btn" style="padding:2px 8px;font-size:11px;">
          ${cfg.locale === "pt" ? "🇧🇷 PT" : "🇺🇸 EN"}
        </button>
      </div>
    </div>
    <nav class="matz-web-navbar">
      <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-primary);font-weight:800;font-size:1.15rem;">
        <span class="matz-brand-dot"></span>
        <span>${cfg.brandName}</span>
        ${cfg.version ? `<span class="matz-badge">v${cfg.version.replace(/^v/, "")}</span>` : ""}
      </a>
      <div style="display:flex;align-items:center;gap:22px;">
        ${cfg.links
          .map(
            (l) =>
              `<a href="${l.href}" style="color:var(--text-secondary);text-decoration:none;font-size:0.92rem;font-weight:500;">${l.label}</a>`
          )
          .join("")}
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <a href="${cfg.ctaHref}" class="matz-btn matz-btn-primary" style="padding:8px 16px;font-size:0.9rem;">
          ${cfg.ctaLabel}
        </a>
      </div>
    </nav>
  `;
}

export function renderMatzWebFooter(brandName: string, locale: "pt" | "en" = "pt"): string {
  return `
    <footer style="margin-top:auto;border-top:1px solid var(--border);background:var(--bg-secondary);padding:48px 24px;">
      <div class="matz-web-container" style="padding:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:1.05rem;">
            <span class="matz-brand-dot"></span>
            <span>${brandName}</span>
            <span style="color:var(--text-muted);font-weight:500;font-size:0.85rem;">by Marcelo Matz</span>
          </div>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:6px;">
            ${
              locale === "pt"
                ? "Parte da Suíte Matz — Softwares nativos em Go + Wails v3 & HTML5/CSS3/Vanilla TS."
                : "Part of the Matz Suite — Native software built with Go + Wails v3 & HTML5/CSS3/Vanilla TS."
            }
          </p>
        </div>
        <div style="display:flex;gap:18px;font-size:0.85rem;color:var(--text-secondary);">
          <a href="https://github.com/marcelomatz" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">GitHub</a>
          <a href="#features" style="color:inherit;text-decoration:none;">${locale === "pt" ? "Recursos" : "Features"}</a>
          <a href="#changelog" style="color:inherit;text-decoration:none;">Changelog</a>
          <a href="#download" style="color:inherit;text-decoration:none;">Download</a>
        </div>
      </div>
    </footer>
  `;
}
