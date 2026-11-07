import {
  MATZ_ICON_CATALOG,
  MatzIconCategory,
  MatzIconMeta,
  MatzIconName,
  MatzIconVariant,
  getIconPascalName,
  getSingleIconSnippet,
  matzIcon,
} from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';
import { highlightMatzCode } from './MultiFrameworkCode';

type IconCodeFormat =
  | 'single-subpath'
  | 'single-standalone'
  | 'vanilla'
  | 'svg'
  | 'wails'
  | 'react'
  | 'vue'
  | 'svelte';

export function mountMatzIconStudio(container: HTMLElement): void {
  let searchQuery = '';
  let activeCategory: MatzIconCategory | 'all' = 'all';
  let iconSize = 24;
  let strokeWidth: 1.25 | 1.5 | 1.75 | 2 | 2.25 = 1.75;
  let variant: MatzIconVariant = 'outline';
  let activeColor = 'currentColor';
  let selectedIcon: MatzIconMeta = MATZ_ICON_CATALOG[0];
  let activeCodeFormat: IconCodeFormat = 'single-subpath';

  const categories = Array.from(
    new Set(MATZ_ICON_CATALOG.map((i) => i.category))
  ) as MatzIconCategory[];

  const generateIconCode = (meta: MatzIconMeta, fmt: IconCodeFormat): string => {
    const rawSvg = matzIcon(meta.name, iconSize, '', {
      strokeWidth,
      variant,
      color: activeColor === 'currentColor' ? undefined : activeColor,
      ariaLabel: meta.name,
    });

    if (fmt === 'single-subpath') {
      return getSingleIconSnippet(meta.name, 'single-subpath', iconSize, strokeWidth, variant);
    }
    if (fmt === 'single-standalone') {
      return getSingleIconSnippet(meta.name, 'single-standalone', iconSize, strokeWidth, variant);
    }

    if (fmt === 'vanilla') {
      const hasOpts = strokeWidth !== 1.75 || variant !== 'outline' || activeColor !== 'currentColor';
      return `import { matzIcon } from '@matz/ui';

// Renderização determinística em Vanilla TypeScript (Zero Dependências)
const iconHtml = matzIcon('${meta.name}', ${iconSize}${
        hasOpts
          ? `, '', {\n  strokeWidth: ${strokeWidth},\n  variant: '${variant}',${
              activeColor !== 'currentColor' ? `\n  color: '${activeColor}',` : ''
            }\n}`
          : ''
      });

document.getElementById('icon-slot')!.innerHTML = iconHtml;`;
    }
    if (fmt === 'svg') {
      return `<!-- @matz/ui/icons · ${meta.name} (${meta.category}) -->\n${rawSvg}`;
    }
    if (fmt === 'wails') {
      return `// Frontend Wails v3 + Go 1.27 (@matz/ui/icons)
import { matzIcon } from '@matz/ui';
import { createMatzWailsBridge } from '@matz/ui/wails';

const wails = createMatzWailsBridge({ eventsIPC: true });
const btn = document.getElementById('wails-action-btn')!;
btn.innerHTML = \`\${matzIcon('${meta.name}', ${iconSize}, '', { strokeWidth: ${strokeWidth}, variant: '${variant}' })} Executar Ação Nativa\`;`;
    }
    if (fmt === 'react') {
      return `// React 19 / Next.js 15
import { matzIcon } from '@matz/ui';

export function MatzActionIcon() {
  return (
    <span
      className="inline-flex items-center justify-center"
      dangerouslySetInnerHTML={{
        __html: matzIcon('${meta.name}', ${iconSize}, '', {
          strokeWidth: ${strokeWidth},
          variant: '${variant}',
        }),
      }}
    />
  );
}`;
    }
    if (fmt === 'vue') {
      return `<!-- Vue 3 / Nuxt 3 (<script setup lang="ts">) -->
<script setup lang="ts">
import { computed } from 'vue';
import { matzIcon } from '@matz/ui';

const svgHtml = computed(() =>
  matzIcon('${meta.name}', ${iconSize}, '', { strokeWidth: ${strokeWidth}, variant: '${variant}' })
);
</script>

<template>
  <span class="inline-flex" v-html="svgHtml" />
</template>`;
    }
    return `<!-- Svelte 5 (Runes) -->
<script lang="ts">
  import { matzIcon } from '@matz/ui';
  const svg = matzIcon('${meta.name}', ${iconSize}, '', { strokeWidth: ${strokeWidth}, variant: '${variant}' });
</script>

<span class="inline-flex">{@html svg}</span>`;
  };

  const getFilteredIcons = (): MatzIconMeta[] => {
    const q = searchQuery.trim().toLowerCase();
    return MATZ_ICON_CATALOG.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  };

  const renderGridOnly = () => {
    const gridHost = container.querySelector<HTMLElement>('#icon-studio-grid-host');
    const countBadge = container.querySelector<HTMLElement>('#icon-studio-count-badge');
    if (!gridHost) return;

    const filtered = getFilteredIcons();
    if (countBadge) {
      countBadge.textContent = `${filtered.length} de ${MATZ_ICON_CATALOG.length} ícones`;
    }

    if (filtered.length === 0) {
      gridHost.innerHTML = `
        <div class="matz-card" style="padding:48px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;">
          ${matzIcon('search', 32, '', { variant: 'duotone', color: 'var(--accent)' })}
          <strong style="font-size:15px;">Nenhum ícone encontrado para "${searchQuery}"</strong>
          <span style="font-size:12.5px;color:var(--text-secondary);">Tente buscar por sinônimos como "ia", "seta", "terminal", "cofre", "gráfico" ou "wails".</span>
        </div>
      `;
      return;
    }

    gridHost.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(112px, 1fr));gap:10px;">
        ${filtered
          .map((ic) => {
            const isSel = ic.name === selectedIcon.name;
            return `
            <button
              type="button"
              data-icon-card="${ic.name}"
              aria-label="Selecionar ícone ${ic.name}"
              aria-pressed="${isSel}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px 8px;border-radius:var(--radius-md);background:${
                isSel ? 'var(--accent-muted)' : 'var(--surface-card-solid)'
              };border:1px solid ${
                isSel ? 'var(--accent)' : 'var(--border)'
              };color:${
                activeColor === 'currentColor' ? 'var(--text-primary)' : activeColor
              };cursor:pointer;transition:all 0.14s ease;min-width:0;"
            >
              <span style="display:inline-flex;align-items:center;justify-content:center;min-height:36px;">
                ${matzIcon(ic.name, iconSize, '', { strokeWidth, variant })}
              </span>
              <span style="font-family:var(--font-mono);font-size:10.5px;color:${
                isSel ? 'var(--text-primary)' : 'var(--text-secondary)'
              };font-weight:${isSel ? '700' : '500'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">
                ${ic.name}
              </span>
            </button>`;
          })
          .join('')}
      </div>
    `;

    gridHost.querySelectorAll<HTMLButtonElement>('[data-icon-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const found = MATZ_ICON_CATALOG.find((i) => i.name === btn.dataset.iconCard);
        if (found) {
          selectedIcon = found;
          renderGridOnly();
          renderInspectorOnly();
        }
      });
    });
  };

  const renderInspectorOnly = () => {
    const inspHost = container.querySelector<HTMLElement>('#icon-studio-inspector-host');
    if (!inspHost) return;

    const codeStr = generateIconCode(selectedIcon, activeCodeFormat);

    inspHost.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Selected Icon Stage Preview -->
        <div style="display:flex;align-items:center;gap:18px;padding:18px;border-radius:var(--radius-md);background:radial-gradient(var(--border) 1px, transparent 1px) 0 0 / 12px 12px, var(--surface-canvas);border:1px solid var(--border);">
          <div style="width:76px;height:76px;border-radius:14px;background:var(--surface-card-solid);border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;color:${
            activeColor === 'currentColor' ? 'var(--accent)' : activeColor
          };box-shadow:var(--shadow-specular);flex-shrink:0;">
            ${matzIcon(selectedIcon.name, Math.max(36, iconSize + 10), '', { strokeWidth, variant })}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;min-width:0;">
            <span class="matz-badge matz-badge-cyan" style="align-self:flex-start;font-size:10px;">${selectedIcon.category}</span>
            <strong style="font-family:var(--font-mono);font-size:18px;color:var(--text-primary);">${selectedIcon.name}</strong>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${selectedIcon.tags
                .map(
                  (t) =>
                    `<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:var(--surface-elevated);color:var(--text-muted);border:1px solid var(--border);">#${t}</span>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Optical Sizes Row Preview (14px, 18px, 24px, 32px) -->
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;">
          ${[14, 18, 24, 32]
            .map(
              (sz) => `
            <div style="padding:10px 6px;border-radius:8px;background:var(--surface-subtle);border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:end;gap:6px;color:${
              activeColor === 'currentColor' ? 'var(--text-primary)' : activeColor
            };">
              ${matzIcon(selectedIcon.name, sz, '', { strokeWidth, variant })}
              <span class="matz-tabular" style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">${sz}px</span>
            </div>`
            )
            .join('')}
        </div>

        <!-- Quick Copy Buttons -->
        <!-- Quick Copy Buttons (Single Icon vs SVG) -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button class="matz-btn matz-btn-sm matz-btn-primary" id="icon-copy-single-btn">
            ${matzIcon('package', 12)} Copiar 1 Único Ícone
          </button>
          <button class="matz-btn matz-btn-sm" id="icon-copy-svg-btn">
            ${matzIcon('code', 12)} Copiar SVG Puro
          </button>
        </div>

        <!-- Single-Icon Subpath Import Pill -->
        <div style="padding:8px 10px;border-radius:var(--radius-sm);background:var(--surface-input);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <code style="font-family:var(--font-mono);font-size:11px;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">import { icon${getIconPascalName(selectedIcon.name)} } from '@matz/ui/icons/${selectedIcon.name}'</code>
          <button type="button" class="matz-copy-pill" data-matz-copy-text="import { icon${getIconPascalName(selectedIcon.name)} } from '@matz/ui/icons/${selectedIcon.name}';" style="flex-shrink:0;font-size:10.5px;">Copiar</button>
        </div>

        <!-- Code Format Switcher (1 Único Ícone Tree-Shakeable Default!) -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="matz-segmented" style="display:grid;grid-template-columns:repeat(2, 1fr);gap:3px;">
            ${(
              [
                { id: 'single-subpath', label: '1 Ícone (@matz/ui/icons/*)' },
                { id: 'single-standalone', label: 'Função Isolada (Só 1 Ícone)' },
                { id: 'vanilla', label: 'Catálogo Vanilla TS' },
                { id: 'svg', label: 'SVG Puro' },
                { id: 'wails', label: 'Go + Wails' },
                { id: 'react', label: 'React / Next.js' },
                { id: 'vue', label: 'Vue 3' },
                { id: 'svelte', label: 'Svelte 5' },
              ] as Array<{ id: IconCodeFormat; label: string }>
            )
              .map(
                (f) => `
              <button class="matz-segmented-btn ${activeCodeFormat === f.id ? 'active' : ''}" data-icon-fmt="${f.id}" style="justify-content:center;padding:4px 6px;font-size:10.5px;">
                ${f.label}
              </button>`
              )
              .join('')}
          </div>

          <div class="matz-code-block" style="margin:0;max-height:260px;overflow:auto;">${highlightMatzCode(
            codeStr,
            `${
              activeCodeFormat === 'single-subpath'
                ? '1 Único Ícone (Tree-Shakeable ~180B)'
                : activeCodeFormat === 'single-standalone'
                ? 'Standalone (Zero-Import)'
                : activeCodeFormat.toUpperCase()
            } · ${selectedIcon.name}`
          )}</div>

          <button class="matz-btn matz-btn-sm" id="icon-copy-active-code" style="width:100%;">
            ${matzIcon('clipboard', 12)} Copiar Snippet (${activeCodeFormat.toUpperCase()})
          </button>
        </div>
      </div>
    `;

    inspHost.querySelectorAll<HTMLButtonElement>('[data-icon-fmt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCodeFormat = (btn.dataset.iconFmt as IconCodeFormat) || 'single-subpath';
        renderInspectorOnly();
      });
    });

    inspHost.querySelector('#icon-copy-single-btn')?.addEventListener('click', () => {
      const snippet = generateIconCode(selectedIcon, 'single-subpath');
      navigator.clipboard?.writeText(snippet);
      showMatzToast(`Importação individual de "${selectedIcon.name}" copiada!`);
    });

    inspHost.querySelector('#icon-copy-svg-btn')?.addEventListener('click', () => {
      const svg = matzIcon(selectedIcon.name, iconSize, '', { strokeWidth, variant });
      navigator.clipboard?.writeText(svg);
      showMatzToast(`SVG vetorial de "${selectedIcon.name}" copiado!`);
    });

    inspHost.querySelector('#icon-copy-active-code')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(codeStr);
      showMatzToast(`Código ${activeCodeFormat.toUpperCase()} copiado!`);
    });
  };

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:24px;padding:28px 36px 80px;width:100%;min-width:0;">
      <!-- Header -->
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        <div>
          <span class="matz-badge matz-badge-cyan">@MATZ/UI/ICONS · BIBLIOTECA VETORIAL DE PRECISÃO</span>
          <h1 class="matz-heading-grad" style="font-size:28px;font-weight:800;margin-top:6px;display:block;">
            Matz Iconography Studio (${MATZ_ICON_CATALOG.length} Ícones Vetoriais)
          </h1>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;max-width:840px;">
            10 categorias semânticas desenhadas sobre grid óptico 24×24px com suporte nativo a ajuste de espessura de traço (<code>strokeWidth</code>), variantes <strong>Outline, Duotone e Filled</strong> e zero dependências externas.
          </p>
        </div>
        <span class="matz-badge matz-badge-emerald" id="icon-studio-count-badge" style="font-size:12px;padding:5px 12px;">
          ${MATZ_ICON_CATALOG.length} de ${MATZ_ICON_CATALOG.length} ícones
        </span>
      </div>

      <!-- Optical Controller Toolbar -->
      <div class="matz-card matz-beam-top" style="padding:18px 22px;display:grid;grid-template-columns:minmax(220px, 1.2fr) repeat(4, minmax(0, auto));gap:20px;align-items:center;">
        <!-- Search Input -->
        <div style="display:flex;flex-direction:column;gap:5px;">
          <label for="icon-studio-search" style="font-size:11.5px;font-weight:700;color:var(--text-secondary);">Buscar por Nome ou Tag Semântica</label>
          <input id="icon-studio-search" class="matz-input" placeholder="Ex: ia, llm, wails, seta, cofre, git, gráfico..." value="${searchQuery}" />
        </div>

        <!-- Optical Variant -->
        <div style="display:flex;flex-direction:column;gap:5px;">
          <span style="font-size:11.5px;font-weight:700;color:var(--text-secondary);">Variante Óptica</span>
          <div class="matz-segmented">
            ${(
              [
                { id: 'outline', label: 'Outline' },
                { id: 'duotone', label: 'Duotone' },
                { id: 'filled', label: 'Filled' },
              ] as Array<{ id: MatzIconVariant; label: string }>
            )
              .map(
                (v) => `
              <button class="matz-segmented-btn ${variant === v.id ? 'active' : ''}" data-icon-var="${v.id}">
                ${v.label}
              </button>`
              )
              .join('')}
          </div>
        </div>

        <!-- Stroke Weight -->
        <div style="display:flex;flex-direction:column;gap:5px;">
          <span style="font-size:11.5px;font-weight:700;color:var(--text-secondary);">Peso de Traço (Stroke)</span>
          <div class="matz-segmented">
            ${([1.25, 1.5, 1.75, 2, 2.25] as const)
              .map(
                (sw) => `
              <button class="matz-segmented-btn ${strokeWidth === sw ? 'active' : ''}" data-icon-sw="${sw}" style="padding:4px 8px;">
                ${sw}
              </button>`
              )
              .join('')}
          </div>
        </div>

        <!-- Size Slider (In-Place Update!) -->
        <div style="display:flex;flex-direction:column;gap:5px;min-width:150px;">
          <div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;color:var(--text-secondary);">
            <label for="icon-size-slider">Tamanho</label>
            <span class="matz-tabular" id="icon-size-lbl" style="color:var(--accent);">${iconSize}px</span>
          </div>
          <input type="range" id="icon-size-slider" min="14" max="40" step="2" value="${iconSize}" style="width:100%;accent-color:var(--accent);cursor:pointer;" />
        </div>

        <!-- Color Swatches -->
        <div style="display:flex;flex-direction:column;gap:5px;">
          <span style="font-size:11.5px;font-weight:700;color:var(--text-secondary);">Cor de Preview</span>
          <div style="display:flex;align-items:center;gap:6px;">
            ${[
              { val: 'currentColor', hex: '#f8fafc', label: 'Padrão' },
              { val: 'var(--accent)', hex: '#8b5cf6', label: 'Accent' },
              { val: '#06b6d4', hex: '#06b6d4', label: 'Cyan' },
              { val: '#10b981', hex: '#10b981', label: 'Emerald' },
              { val: '#f59e0b', hex: '#f59e0b', label: 'Amber' },
              { val: '#f43f5e', hex: '#f43f5e', label: 'Rose' },
            ]
              .map(
                (c) => `
              <button type="button" data-icon-col="${c.val}" aria-label="Cor ${c.label}" title="${c.label}" style="width:24px;height:24px;border-radius:6px;background:${c.hex};border:${
                  activeColor === c.val ? '2px solid var(--text-primary)' : '1px solid var(--border-strong)'
                };cursor:pointer;"></button>`
              )
              .join('')}
          </div>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <button class="matz-btn matz-btn-sm ${activeCategory === 'all' ? 'matz-btn-primary' : ''}" data-icon-cat="all">
          Todas as Categorias (${MATZ_ICON_CATALOG.length})
        </button>
        ${categories
          .map((cat) => {
            const count = MATZ_ICON_CATALOG.filter((i) => i.category === cat).length;
            return `
            <button class="matz-btn matz-btn-sm ${activeCategory === cat ? 'matz-btn-primary' : ''}" data-icon-cat="${cat}">
              ${cat} (${count})
            </button>`;
          })
          .join('')}
      </div>

      <!-- Main 2-Column Workspace: Icon Grid (Left) + Live Code & Optical Inspector (Right) -->
      <div style="display:grid;grid-template-columns:minmax(0, 1fr) 390px;gap:24px;align-items:start;">
        <div id="icon-studio-grid-host" style="min-width:0;"></div>
        <aside class="matz-card matz-beam-top" id="icon-studio-inspector-host" style="position:sticky;top:76px;padding:20px;min-width:0;"></aside>
      </div>
    </div>
  `;

  renderGridOnly();
  renderInspectorOnly();

  // Listeners (In-Place updates so sliders and search inputs never lose focus!)
  const searchInput = container.querySelector<HTMLInputElement>('#icon-studio-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderGridOnly();
  });

  const sizeSlider = container.querySelector<HTMLInputElement>('#icon-size-slider');
  sizeSlider?.addEventListener('input', () => {
    iconSize = Number(sizeSlider.value);
    const lbl = container.querySelector<HTMLElement>('#icon-size-lbl');
    if (lbl) lbl.textContent = `${iconSize}px`;
    renderGridOnly();
    renderInspectorOnly();
  });

  container.querySelectorAll<HTMLButtonElement>('[data-icon-var]').forEach((btn) => {
    btn.addEventListener('click', () => {
      variant = (btn.dataset.iconVar as MatzIconVariant) || 'outline';
      container.querySelectorAll<HTMLButtonElement>('[data-icon-var]').forEach((b) => {
        b.classList.toggle('active', b.dataset.iconVar === variant);
      });
      renderGridOnly();
      renderInspectorOnly();
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-icon-sw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      strokeWidth = Number(btn.dataset.iconSw) as typeof strokeWidth;
      container.querySelectorAll<HTMLButtonElement>('[data-icon-sw]').forEach((b) => {
        b.classList.toggle('active', Number(b.dataset.iconSw) === strokeWidth);
      });
      renderGridOnly();
      renderInspectorOnly();
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-icon-col]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeColor = btn.dataset.iconCol || 'currentColor';
      renderGridOnly();
      renderInspectorOnly();
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-icon-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = (btn.dataset.iconCat as MatzIconCategory | 'all') || 'all';
      container.querySelectorAll<HTMLButtonElement>('[data-icon-cat]').forEach((b) => {
        b.classList.toggle('matz-btn-primary', b.dataset.iconCat === activeCategory);
      });
      renderGridOnly();
    });
  });
}
