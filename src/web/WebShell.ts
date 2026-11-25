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

export interface MatzPortalNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

export interface MatzPortalHeaderConfig {
  product: MatzProductID;
  brandName: string;
  brandHref?: string;
  brandDataNav?: string;
  brandIcon?: string;
  version?: string;
  locale: "pt" | "en" | "es";
  theme?: "dark" | "light";
  navItems: MatzPortalNavItem[];
  secondaryLink?: {
    label: string;
    href: string;
    icon?: string;
    external?: boolean;
  };
  cta?: {
    label: string;
    href: string;
    icon?: string;
    dataNav?: string;
  };
  themeToggleId?: string;
  themeToggleTitle?: string;
  showSuiteBar?: boolean;
}

export interface MatzPortalFooterLink {
  label: string;
  href: string;
  dataNav?: string;
  external?: boolean;
}

export interface MatzPortalFooterConfig {
  product?: MatzProductID;
  brandName: string;
  brandIcon?: string;
  version?: string;
  tagline: string;
  links: MatzPortalFooterLink[];
}

export interface MatzDesktopFrameConfig {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  bodyHtml: string;
}

export interface MatzDownloadCardOption {
  osKey: string;
  osTitle: string;
  osSubtitle: string;
  recommended?: boolean;
  detectedLabel?: string;
  primaryLabel: string;
  primaryFormat: string;
  primaryFilename: string;
  primaryUrl: string;
  secondaryLabel?: string;
  secondaryFilename?: string;
  secondaryUrl?: string;
}

function escAttr(val: string): string {
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Standardized Matz UI Product Portal Header (Zero Scrollbar + Responsive Mobile Drawer)
 */
export function renderMatzPortalHeader(cfg: MatzPortalHeaderConfig): string {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-product", cfg.product);
  }
  const iconName = cfg.brandIcon || (cfg.product === "writtt" ? "feather" : "layers");
  const cleanVer = cfg.version ? cfg.version.replace(/^v/i, "") : "";
  const themeMode = cfg.theme || "dark";

  const suiteBar = cfg.showSuiteBar
    ? `<div class="matz-web-suitebar">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-weight:700;color:var(--text-primary);">ECOSYSTEM</span>
          <span>·</span>
          ${MATZ_SUITE_APPS.map(
            (a) =>
              `<a href="#suite-${a.id}" class="${a.id === cfg.product ? "active" : ""}">${escAttr(a.name)}</a>`
          ).join("")}
        </div>
      </div>`
    : "";

  const navLinksHtml = cfg.navItems
    .map(
      (item) => `
      <a
        href="${escAttr(item.href)}"
        class="matz-portal-nav-link ${item.active ? "is-active" : ""}"
        data-nav="${escAttr(item.id)}"
      >
        ${item.icon ? matzIcon(item.icon, 13) : ""}
        <span>${escAttr(item.label)}</span>
      </a>`
    )
    .join("");

  return `
    ${suiteBar}
    <header class="matz-portal-header">
      <div class="matz-portal-header-inner">
        <a
          href="${escAttr(cfg.brandHref || "#home")}"
          class="matz-portal-brand"
          ${cfg.brandDataNav ? `data-nav="${escAttr(cfg.brandDataNav)}"` : ""}
        >
          <span class="matz-portal-brand-mark">${matzIcon(iconName, 15)}</span>
          <span>${escAttr(cfg.brandName)}</span>
          ${cleanVer ? `<span class="matz-portal-version-pill">v${escAttr(cleanVer)}</span>` : ""}
        </a>

        <nav class="matz-portal-nav" aria-label="Primary navigation">
          ${navLinksHtml}
        </nav>

        <div class="matz-portal-controls">
          <div class="matz-portal-locale-group" role="group" aria-label="Language selector">
            <button type="button" class="matz-portal-locale-btn ${cfg.locale === "pt" ? "is-active" : ""}" data-locale="pt-BR">PT</button>
            <button type="button" class="matz-portal-locale-btn ${cfg.locale === "en" ? "is-active" : ""}" data-locale="en-US">EN</button>
            <button type="button" class="matz-portal-locale-btn ${cfg.locale === "es" ? "is-active" : ""}" data-locale="es-ES">ES</button>
          </div>

          <button
            type="button"
            class="matz-portal-icon-btn"
            id="${escAttr(cfg.themeToggleId || "matz-portal-theme-toggle")}"
            title="${escAttr(cfg.themeToggleTitle || "Alternar tema Escuro / Claro")}"
          >
            ${themeMode === "dark" ? matzIcon("sun", 14) : matzIcon("moon", 14)}
          </button>

          ${
            cfg.secondaryLink
              ? `<a
                  href="${escAttr(cfg.secondaryLink.href)}"
                  ${cfg.secondaryLink.external ? 'target="_blank" rel="noopener noreferrer"' : ""}
                  class="matz-portal-ghost-btn matz-portal-hide-tablet"
                >
                  ${cfg.secondaryLink.icon ? matzIcon(cfg.secondaryLink.icon, 13) : ""}
                  <span>${escAttr(cfg.secondaryLink.label)}</span>
                </a>`
              : ""
          }

          ${
            cfg.cta
              ? `<a
                  href="${escAttr(cfg.cta.href)}"
                  class="matz-portal-cta"
                  ${cfg.cta.dataNav ? `data-nav="${escAttr(cfg.cta.dataNav)}"` : ""}
                >
                  ${cfg.cta.icon ? matzIcon(cfg.cta.icon, 13) : ""}
                  <span>${escAttr(cfg.cta.label)}</span>
                </a>`
              : ""
          }

          <button
            type="button"
            class="matz-portal-icon-btn matz-portal-mobile-toggle"
            data-matz-mobile-toggle="true"
            aria-label="Menu"
          >
            ${matzIcon("menu", 15)}
          </button>
        </div>
      </div>

      <div class="matz-portal-mobile-drawer" data-matz-mobile-drawer="true">
        ${navLinksHtml}
      </div>
    </header>
  `;
}

export function bindMatzPortalHeaderEvents(root: ParentNode = document): void {
  const toggleBtn = root.querySelector<HTMLButtonElement>('[data-matz-mobile-toggle="true"]');
  const drawer = root.querySelector<HTMLElement>('[data-matz-mobile-drawer="true"]');
  if (!toggleBtn || !drawer) return;
  toggleBtn.addEventListener("click", () => {
    drawer.classList.toggle("is-open");
  });
}

/**
 * Standardized Matz UI Product Portal Footer
 */
export function renderMatzPortalFooter(cfg: MatzPortalFooterConfig): string {
  const iconName = cfg.brandIcon || (cfg.product === "writtt" ? "feather" : "layers");
  const cleanVer = cfg.version ? cfg.version.replace(/^v/i, "") : "";

  return `
    <footer class="matz-portal-footer">
      <div class="matz-portal-footer-inner">
        <div class="matz-portal-footer-brand">
          <div style="display:inline-flex;align-items:center;gap:9px;">
            <span class="matz-portal-brand-mark" style="width:26px;height:26px;">${matzIcon(iconName, 13)}</span>
            <strong style="font-size:14.5px;color:var(--text-primary);">${escAttr(cfg.brandName)}</strong>
            ${cleanVer ? `<span class="matz-portal-version-pill">v${escAttr(cleanVer)}</span>` : ""}
          </div>
          <p>${escAttr(cfg.tagline)}</p>
        </div>

        <div class="matz-portal-footer-links">
          ${cfg.links
            .map(
              (lnk) => `
              <a
                href="${escAttr(lnk.href)}"
                ${lnk.dataNav ? `data-nav="${escAttr(lnk.dataNav)}"` : ""}
                ${lnk.external ? 'target="_blank" rel="noopener noreferrer"' : ""}
              >${escAttr(lnk.label)}</a>`
            )
            .join("")}
        </div>
      </div>
    </footer>
  `;
}

/**
 * Standardized Native Wails v3 Frameless Window Frame for Software Screenshots & Interactive Tours
 */
export function renderMatzDesktopFrame(cfg: MatzDesktopFrameConfig): string {
  return `
    <div class="matz-window-frame">
      <div class="matz-window-titlebar">
        <div class="matz-window-brand">
          <span class="matz-portal-brand-mark" style="width:20px;height:20px;border-radius:5px;">
            ${matzIcon(cfg.icon || "feather", 11)}
          </span>
          <span>${escAttr(cfg.title)}</span>
          ${cfg.subtitle ? `<span class="matz-window-subtitle">— ${escAttr(cfg.subtitle)}</span>` : ""}
        </div>
        <div style="display:inline-flex;align-items:center;gap:10px;">
          ${cfg.badge ? `<span class="matz-portal-version-pill">${escAttr(cfg.badge)}</span>` : ""}
          <div class="matz-window-dots" aria-hidden="true">
            <span class="matz-window-dot"></span>
            <span class="matz-window-dot"></span>
            <span class="matz-window-dot"></span>
          </div>
        </div>
      </div>
      ${cfg.bodyHtml}
    </div>
  `;
}

/**
 * Standardized OS-Aware Download Cards (Primary Installer + Secondary Portable / Archive)
 */
export function renderMatzDownloadCards(items: MatzDownloadCardOption[]): string {
  return `
    <div class="matz-dl-grid">
      ${items
        .map(
          (item) => `
          <div class="matz-dl-card ${item.recommended ? "is-recommended" : ""}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <span class="matz-portal-version-pill">${escAttr(item.osSubtitle)}</span>
              ${
                item.recommended && item.detectedLabel
                  ? `<span class="matz-badge matz-badge-emerald" style="font-size:10.5px;">${escAttr(item.detectedLabel)}</span>`
                  : ""
              }
            </div>

            <div>
              <h3 style="font-size:19px;font-weight:800;margin:2px 0 4px;color:var(--text-primary);">${escAttr(item.osTitle)}</h3>
              <p style="font-size:13px;color:var(--text-secondary);margin:0;">${escAttr(item.primaryFormat)}</p>
            </div>

            <code style="font-family:var(--font-mono);font-size:11px;padding:6px 9px;border-radius:6px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escAttr(item.primaryFilename)}</code>

            <a
              href="${escAttr(item.primaryUrl)}"
              class="matz-portal-cta"
              style="width:100%;height:40px;font-size:13px;${
                item.recommended
                  ? ""
                  : "background:var(--bg-tertiary);color:var(--text-primary);border-color:var(--border-strong);"
              }"
            >
              ${matzIcon("download", 14)}
              <span>${escAttr(item.primaryLabel)}</span>
            </a>

            ${
              item.secondaryUrl && item.secondaryLabel
                ? `<div class="matz-dl-alt-row">
                    <span>${escAttr(item.secondaryFilename || "")}</span>
                    <a href="${escAttr(item.secondaryUrl)}" class="matz-dl-alt-link">
                      ${matzIcon("download", 12)}
                      <span>${escAttr(item.secondaryLabel)}</span>
                    </a>
                  </div>`
                : ""
            }
          </div>`
        )
        .join("")}
    </div>
  `;
}

// Legacy helpers preserved for backwards compatibility
export function renderMatzWebHeader(cfg: WebShellConfig): string {
  return renderMatzPortalHeader({
    product: cfg.product,
    brandName: cfg.brandName,
    version: cfg.version,
    locale: cfg.locale,
    navItems: cfg.links.map((l, idx) => ({
      id: `link-${idx}`,
      label: l.label,
      href: l.href,
    })),
    cta: {
      label: cfg.ctaLabel,
      href: cfg.ctaHref,
    },
    showSuiteBar: cfg.showSuiteBar,
  });
}

export function renderMatzWebFooter(
  brandName: string,
  locale: "pt" | "en" | "es" = "pt",
  taglineOverride?: string
): string {
  const defaultTagline =
    locale === "pt"
      ? "Software nativo open-source construído em Go + Wails v3 & HTML5/CSS3/Vanilla TS."
      : locale === "es"
      ? "Software nativo open-source construido con Go + Wails v3 y HTML5/CSS3/Vanilla TS."
      : "Open-source native desktop software built with Go + Wails v3 & HTML5/CSS3/Vanilla TS.";

  return renderMatzPortalFooter({
    brandName,
    tagline: taglineOverride || defaultTagline,
    links: [
      { label: "GitHub", href: "https://github.com/marcelomatz", external: true },
      { label: locale === "en" ? "Features" : "Recursos", href: "#features" },
      { label: locale === "en" ? "Docs" : locale === "es" ? "Documentación" : "Documentação", href: "#docs" },
      { label: locale === "es" ? "Descargar" : "Download", href: "#download" },
    ],
  });
}
