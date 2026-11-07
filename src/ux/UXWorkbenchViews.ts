import { matzIcon } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';
import {
  renderArcGauge,
  renderSpeedometerGauge,
  renderInteractiveAreaChart,
  renderRingDonutChart,
  renderSparklineCard,
  mountLiveTelemetryStream,
} from '../analytics/ChartsAndGauges';
import {
  renderMatzDataTable,
  renderLinearWorkspaceCard,
  renderWarpRefractionWindow,
  renderEmbeddedRaycastPalette,
} from '../components/RichComponents';
import { MatzApiClientModule } from '../modules/ApiClientModule';
import { MatzEditorModule } from '../modules/EditorModule';
import { FrameworkID, highlightMatzCode } from './MultiFrameworkCode';

export interface ComposerBlock {
  uid: string;
  type: 'kpi-row' | 'chart-area' | 'gauges-trio' | 'data-table' | 'auth-form' | 'api-tester';
  title: string;
}

const DEFAULT_COMPOSER_BLOCKS: ComposerBlock[] = [
  { uid: 'blk-1', type: 'kpi-row', title: 'Fila de Indicadores Executivos (KPI Sparklines)' },
  { uid: 'blk-2', type: 'gauges-trio', title: 'Cluster de Gauges Radiais & Speedometer' },
  { uid: 'blk-3', type: 'data-table', title: 'Data Table Executiva com Filtro Instantâneo' },
];

let composerBlocks: ComposerBlock[] = [...DEFAULT_COMPOSER_BLOCKS];
let wireframeMode = false;
let composerExportFw: FrameworkID = 'vanilla';

export function mountUXScreenComposer(container: HTMLElement): void {
  const draw = () => {
    const rawCode = generateComposedScreenCode(composerBlocks, composerExportFw);

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:22px;width:100%;">
        <!-- Header & Composer Toolbar -->
        <div class="matz-card matz-beam-top" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="matz-badge matz-badge-cyan">${matzIcon('layers', 12)} UX SCREEN & FLOW COMPOSER</span>
              <span class="matz-badge">${composerBlocks.length} Blocos Ativos</span>
            </div>
            <h2 style="font-size:20px;font-weight:800;margin-top:6px;">Construtor Visual de Interfaces & Fluxos de Usuário</h2>
            <p style="font-size:13px;color:var(--text-secondary);">
              Monte telas completas combinando blocos da biblioteca, alterne entre modo Wireframe Estrutural e Alta Fidelidade, e exporte o código completo em Vanilla TS (padrão), Go + Wails, React, Vue ou Svelte.
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button class="matz-btn ${wireframeMode ? 'matz-btn-primary' : ''}" id="ux-comp-wireframe">
              ${matzIcon('eye', 14)} ${wireframeMode ? 'Modo Wireframe: ATIVO' : 'Alternar Wireframe Lo-Fi'}
            </button>
            <button class="matz-btn" id="ux-comp-reset">Restaurar Layout Padrão</button>
          </div>
        </div>

        <!-- Add Block Palette -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;">
          ${[
            { type: 'kpi-row', label: '+ Adicionar KPI Sparklines', icon: 'activity' as const },
            { type: 'gauges-trio', label: '+ Adicionar Cluster Gauges', icon: 'gauge' as const },
            { type: 'chart-area', label: '+ Adicionar Area Analytics', icon: 'chart' as const },
            { type: 'data-table', label: '+ Adicionar Data Table', icon: 'database' as const },
            { type: 'auth-form', label: '+ Adicionar Bloco Auth 2FA', icon: 'shield' as const },
            { type: 'api-tester', label: '+ Adicionar Bloco HTTP Client', icon: 'api' as const },
          ]
            .map(
              (b) => `
            <button class="matz-btn" data-add-blk="${b.type}" data-add-title="${b.label.replace('+ Adicionar ', '')}" style="justify-content:flex-start;height:38px;">
              <span style="color:var(--accent);">${matzIcon(b.icon, 14)}</span>
              <span>${b.label}</span>
            </button>`
            )
            .join('')}
        </div>

        <!-- Full-Width Visual Canvas -->
        <div class="matz-preview-stage ${wireframeMode ? 'matz-stage-xray matz-stage-grid' : ''}" style="padding:24px;min-height:460px;justify-content:flex-start;">
          ${
            composerBlocks.length === 0
              ? `<div style="padding:60px;text-align:center;color:var(--text-muted);">Canvas vazio. Clique nos botões acima para adicionar blocos de interface.</div>`
              : composerBlocks
                  .map(
                    (blk, idx) => `
                <div class="matz-card" style="width:100%;padding:16px;display:flex;flex-direction:column;gap:14px;${
                  wireframeMode ? 'filter:grayscale(1) contrast(1.05);' : ''
                }">
                  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span class="matz-badge" style="font-family:var(--font-mono);">STEP 0${idx + 1}</span>
                      <strong style="font-size:13px;">${blk.title}</strong>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <button class="matz-btn matz-btn-sm" data-move-up="${idx}" ${idx === 0 ? 'disabled' : ''}>↑ Subir</button>
                      <button class="matz-btn matz-btn-sm" data-move-down="${idx}" ${idx === composerBlocks.length - 1 ? 'disabled' : ''}>↓ Descer</button>
                      <button class="matz-btn matz-btn-sm matz-btn-destructive" data-del-blk="${blk.uid}">${matzIcon('trash', 12)}</button>
                    </div>
                  </div>
                  <div id="composer-slot-${blk.uid}" style="width:100%;"></div>
                </div>`
                  )
                  .join('')
          }
        </div>

        <!-- Multi-Framework Export Box for the Composed Screen -->
        <div class="matz-card" style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <strong>Código Gerado da Tela Composta (${composerBlocks.length} seções)</strong>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="matz-segmented">
                ${(['vanilla', 'wails', 'react', 'vue', 'svelte'] as FrameworkID[])
                  .map(
                    (f) => `
                  <button class="matz-segmented-btn ${composerExportFw === f ? 'active' : ''}" data-comp-fw="${f}">
                    ${
                      f === 'vanilla'
                        ? 'Vanilla TS (Padrão)'
                        : f === 'wails'
                        ? 'Go + Wails'
                        : f === 'react'
                        ? 'React / Next.js'
                        : f === 'vue'
                        ? 'Vue 3'
                        : 'Svelte 5'
                    }
                  </button>`
                  )
                  .join('')}
              </div>
              <button class="matz-btn matz-btn-primary matz-btn-sm" id="copy-composed-screen">
                ${matzIcon('copy', 12)} Copiar Tela Completa
              </button>
            </div>
          </div>
          <div class="matz-code-block">${highlightMatzCode(rawCode, `Export · ${composerExportFw.toUpperCase()}`)}</div>
        </div>
      </div>
    `;

    // Hydrate each block inside the canvas
    composerBlocks.forEach((blk) => {
      const slot = container.querySelector<HTMLElement>(`#composer-slot-${blk.uid}`);
      if (!slot) return;

      if (blk.type === 'kpi-row') {
        slot.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">
          ${renderSparklineCard({ title: 'Conversão do Funil UX', value: '94.2%', delta: '+8.4%', data: [65, 70, 74, 79, 85, 91, 94], color: '#10b981' })}
          ${renderSparklineCard({ title: 'Tempo de Tarefa (TTR)', value: '1.18s', delta: '-34.0%', data: [32, 28, 25, 21, 18, 15, 12], color: '#06b6d4' })}
          ${renderSparklineCard({ title: 'Satisfação CSAT / NPS', value: '98.7', delta: '+4.1%', data: [88, 90, 92, 94, 96, 97, 99], color: '#8b5cf6' })}
        </div>`;
      } else if (blk.type === 'gauges-trio') {
        slot.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
          <div id="g1-${blk.uid}"></div>
          <div id="g2-${blk.uid}"></div>
          <div id="g3-${blk.uid}"></div>
        </div>`;
        renderArcGauge(slot.querySelector(`#g1-${blk.uid}`)!, { label: 'CPU Cluster Load', value: 72, unit: '%', interactive: true });
        renderArcGauge(slot.querySelector(`#g2-${blk.uid}`)!, { label: 'Memory Pool', value: 48, max: 128, unit: ' GB', color: '#10b981', interactive: true });
        renderSpeedometerGauge(slot.querySelector(`#g3-${blk.uid}`)!, { label: 'API Latency P99', value: 16, max: 100, unit: 'ms', interactive: true });
      } else if (blk.type === 'chart-area') {
        renderInteractiveAreaChart(slot, {
          title: 'Telemetria de Sessões Ativas & Engajamento',
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          series: [
            { name: 'Desktop App', color: '#8b5cf6', data: [1200, 1450, 1680, 1920, 2340, 2100, 2590] },
            { name: 'Web Cloud', color: '#06b6d4', data: [800, 950, 1120, 1340, 1580, 1490, 1840] },
          ],
        });
      } else if (blk.type === 'data-table') {
        renderMatzDataTable(
          slot,
          'Auditoria de Componentes & Eventos da Tela',
          [
            { key: 'component', label: 'Componente' },
            { key: 'interaction', label: 'Meta de UX' },
            { key: 'wcag', label: 'Acessibilidade', render: (r) => `<span class="matz-badge matz-badge-emerald">${r.wcag}</span>` },
          ],
          [
            { component: 'OmniCommand Bar', interaction: 'Atalho Global < 50ms', wcag: 'WCAG AAA (15.8:1)' },
            { component: 'Form Input Surface', interaction: 'Focus Ring + Validação Inline', wcag: 'WCAG AAA (12.4:1)' },
            { component: 'Interactive Gauges', interaction: 'Feedback Tátil 60fps', wcag: 'WCAG AA+ (7.9:1)' },
          ]
        );
      } else if (blk.type === 'auth-form') {
        slot.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:center;">
            <div style="display:flex;flex-direction:column;gap:8px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Identidade Corporativa</label>
              <input class="matz-input" value="arquitetura@matz.dev" />
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Chave de Segurança / Passkey</label>
              <div style="display:flex;gap:8px;">
                <input class="matz-input" type="password" value="••••••••••••" />
                <button class="matz-btn matz-btn-primary">Autenticar</button>
              </div>
            </div>
          </div>
        `;
      } else if (blk.type === 'api-tester') {
        slot.style.height = '320px';
        const api = new MatzApiClientModule(slot, {
          executeRequest: async (method, url) => ({
            status_code: 200,
            status_text: '200 OK',
            duration: 14,
            size_bytes: 196,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ composer: true, method, url, status: 'UX Flow Verified' }, null, 2),
          }),
        });
        api.mount();
      }
    });

    // Event bindings
    container.querySelector('#ux-comp-wireframe')?.addEventListener('click', () => {
      wireframeMode = !wireframeMode;
      draw();
    });

    container.querySelector('#ux-comp-reset')?.addEventListener('click', () => {
      composerBlocks = [...DEFAULT_COMPOSER_BLOCKS];
      draw();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-add-blk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.addBlk as ComposerBlock['type'];
        const title = btn.dataset.addTitle || 'Bloco Customizado';
        composerBlocks.push({ uid: `blk-${Date.now()}`, type, title });
        draw();
        showMatzToast(`Bloco "${title}" adicionado ao canvas!`);
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-del-blk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        composerBlocks = composerBlocks.filter((b) => b.uid !== btn.dataset.delBlk);
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-move-up]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.moveUp);
        if (idx > 0) {
          const tmp = composerBlocks[idx - 1];
          composerBlocks[idx - 1] = composerBlocks[idx];
          composerBlocks[idx] = tmp;
          draw();
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-move-down]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.moveDown);
        if (idx < composerBlocks.length - 1) {
          const tmp = composerBlocks[idx + 1];
          composerBlocks[idx + 1] = composerBlocks[idx];
          composerBlocks[idx] = tmp;
          draw();
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-comp-fw]').forEach((btn) => {
      btn.addEventListener('click', () => {
        composerExportFw = (btn.dataset.compFw as FrameworkID) || 'vanilla';
        draw();
      });
    });

    container.querySelector('#copy-composed-screen')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(rawCode);
      showMatzToast('Código completo da tela copiado!');
    });
  };

  draw();
}

function generateComposedScreenCode(blocks: ComposerBlock[], fw: FrameworkID): string {
  const listComment = blocks.map((b, i) => `  // Seção ${i + 1}: ${b.title} (${b.type})`).join('\n');
  if (fw === 'vanilla' || fw === 'wails') {
    return `import '@matz/ui/styles.css';\n\nexport function mountComposedScreen(root: HTMLElement) {\n${listComment}\n  root.innerHTML = \`\n${blocks.map((b) => `    <section class="matz-card" data-block="${b.type}">${b.title}</section>`).join('\n')}\n  \`;\n}`;
  }
  if (fw === 'react') {
    return `'use client';
import React from 'react';
import '@matz/ui/styles.css';

export default function MatzComposedScreen() {
  return (
    <main className="matz-composed-screen" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
${listComment}
      ${blocks.map((b) => `<section className="matz-card" data-block="${b.type}">{/* ${b.title} */}</section>`).join('\n      ')}
    </main>
  );
}`;
  }
  if (fw === 'vue') {
    return `<script setup lang="ts">
import '@matz/ui/styles.css';
</script>

<template>
  <main class="matz-composed-screen" style="display:flex;flex-direction:column;gap:20px;padding:24px;">
${blocks.map((b) => `    <section class="matz-card" data-block="${b.type}"><!-- ${b.title} --></section>`).join('\n')}
  </main>
</template>`;
  }
  return `<script lang="ts">
  import '@matz/ui/styles.css';
</script>

<main class="matz-composed-screen" style="display:flex;flex-direction:column;gap:20px;padding:24px;">
${blocks.map((b) => `  <section class="matz-card" data-block="${b.type}"><!-- ${b.title} --></section>`).join('\n')}
</main>`;
}

/**
 * UX Heuristics, Accessibility & Token Lab View
 */
export function mountUXHeuristicsLab(container: HTMLElement): void {
  let fgHex = '#f4f6fb';
  let bgHex = '#080a10';
  let baseFontPx = 14;
  let scaleRatio = 1.25;

  function hexToLuminance(hex: string): number {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  function calcContrast(hex1: string, hex2: string): number {
    const l1 = hexToLuminance(hex1);
    const l2 = hexToLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  const renderScaleRows = () =>
    [
      { token: '--text-xs', pow: -1, label: 'Telemetry Caption & Kbd' },
      { token: '--text-sm', pow: 0, label: 'Body Control & Table Cell' },
      { token: '--text-md', pow: 1, label: 'Card Heading & Section Title' },
      { token: '--text-lg', pow: 2, label: 'Module Header' },
      { token: '--text-xl', pow: 3, label: 'Executive Display KPI' },
    ]
      .map((s) => {
        const px = (baseFontPx * Math.pow(scaleRatio, s.pow)).toFixed(1);
        return `<div style="display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:5px;">
          <code style="font-family:var(--font-mono);font-size:11px;color:var(--accent);">${s.token} (${px}px)</code>
          <span style="font-size:${px}px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.label}</span>
        </div>`;
      })
      .join('');

  const ratio = calcContrast(fgHex, bgHex);
  const passAAA = ratio >= 7.0;
  const passAA = ratio >= 4.5;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:24px;width:100%;">
      <div class="matz-card matz-beam-top">
        <span class="matz-badge matz-badge-emerald">${matzIcon('shield', 12)} UX HEURISTICS, WCAG CONTRAST & MOTION LAB</span>
        <h2 style="font-size:22px;font-weight:800;margin-top:8px;">Laboratório de Engenharia de UX, Acessibilidade & Escala Tipográfica</h2>
        <p style="font-size:13.5px;color:var(--text-secondary);margin-top:4px;">
          Valide contraste ótico WCAG 2.1 AAA/AA em tempo real, inspecione a escala tipográfica modular, teste curvas de animação física e audite heurísticas ergonômicas aplicadas aos componentes.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <!-- Interactive WCAG 2.1 Contrast Analyzer -->
        <div class="matz-card" style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:15px;">Analisador de Contraste Ótico (WCAG 2.1)</strong>
            <span class="matz-badge ${passAAA ? 'matz-badge-emerald' : passAA ? 'matz-badge-amber' : 'matz-badge-rose'}" id="wcag-badge">
              ${ratio.toFixed(2)}:1 · ${passAAA ? 'PASS AAA' : passAA ? 'PASS AA' : 'FAIL'}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:11.5px;font-weight:600;color:var(--text-secondary);">Cor do Texto (Foreground)</label>
              <div style="display:flex;gap:8px;margin-top:4px;">
                <input type="color" id="wcag-fg-color" value="${fgHex}" style="width:42px;height:36px;border:none;background:transparent;cursor:pointer;" />
                <input class="matz-input" id="wcag-fg-text" value="${fgHex}" style="font-family:var(--font-mono);" />
              </div>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:600;color:var(--text-secondary);">Superfície de Fundo (Background)</label>
              <div style="display:flex;gap:8px;margin-top:4px;">
                <input type="color" id="wcag-bg-color" value="${bgHex}" style="width:42px;height:36px;border:none;background:transparent;cursor:pointer;" />
                <input class="matz-input" id="wcag-bg-text" value="${bgHex}" style="font-family:var(--font-mono);" />
              </div>
            </div>
          </div>

          <div id="wcag-sample-box" style="padding:22px;border-radius:var(--radius-md);background:${bgHex};color:${fgHex};border:1px solid var(--border);">
            <div id="wcag-sample-title" style="font-size:18px;font-weight:800;margin-bottom:6px;">Amostra Tipográfica de Alta Precisão (${ratio.toFixed(2)}:1)</div>
            <p style="font-size:13px;opacity:0.9;">
              Interfaces críticas exigem legibilidade imediata em ambientes noturnos (Obsidian) e sob luz solar direta (Alabaster).
            </p>
          </div>
        </div>

        <!-- Modular Typography Scale Calculator -->
        <div class="matz-card" style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:15px;">Calculadora de Escala Tipográfica Modular</strong>
            <span class="matz-badge matz-badge-cyan" id="typo-badge">Base ${baseFontPx}px · Ratio ${scaleRatio}</span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:11.5px;color:var(--text-secondary);">Tamanho Base: <strong id="typo-base-lbl">${baseFontPx}px</strong></label>
              <input type="range" id="typo-base-range" min="12" max="18" step="1" value="${baseFontPx}" style="width:100%;accent-color:var(--accent);margin-top:6px;cursor:pointer;" />
            </div>
            <div>
              <label style="font-size:11.5px;color:var(--text-secondary);">Proporção Harmônica</label>
              <select class="matz-select" id="typo-ratio-sel" style="width:100%;margin-top:4px;">
                <option value="1.125" ${scaleRatio === 1.125 ? 'selected' : ''}>1.125 — Major Second (Alta Densidade)</option>
                <option value="1.2" ${scaleRatio === 1.2 ? 'selected' : ''}>1.200 — Minor Third (Dashboards)</option>
                <option value="1.25" ${scaleRatio === 1.25 ? 'selected' : ''}>1.250 — Major Third (Padrão Matz Studio)</option>
                <option value="1.333" ${scaleRatio === 1.333 ? 'selected' : ''}>1.333 — Perfect Fourth (Editorial)</option>
              </select>
            </div>
          </div>

          <div id="typo-scale-list" style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--radius-sm);background:var(--surface-subtle);">
            ${renderScaleRows()}
          </div>
        </div>
      </div>
    </div>
  `;

  const updateWcagInPlace = () => {
    const r = calcContrast(fgHex, bgHex);
    const pAAA = r >= 7.0;
    const pAA = r >= 4.5;
    const badge = container.querySelector<HTMLElement>('#wcag-badge');
    const box = container.querySelector<HTMLElement>('#wcag-sample-box');
    const title = container.querySelector<HTMLElement>('#wcag-sample-title');
    if (badge) {
      badge.className = `matz-badge ${pAAA ? 'matz-badge-emerald' : pAA ? 'matz-badge-amber' : 'matz-badge-rose'}`;
      badge.textContent = `${r.toFixed(2)}:1 · ${pAAA ? 'PASS AAA' : pAA ? 'PASS AA' : 'FAIL'}`;
    }
    if (box) {
      box.style.background = bgHex;
      box.style.color = fgHex;
    }
    if (title) {
      title.textContent = `Amostra Tipográfica de Alta Precisão (${r.toFixed(2)}:1)`;
    }
  };

  container.querySelector<HTMLInputElement>('#wcag-fg-color')?.addEventListener('input', (e) => {
    fgHex = (e.target as HTMLInputElement).value;
    const txt = container.querySelector<HTMLInputElement>('#wcag-fg-text');
    if (txt) txt.value = fgHex;
    updateWcagInPlace();
  });

  container.querySelector<HTMLInputElement>('#wcag-bg-color')?.addEventListener('input', (e) => {
    bgHex = (e.target as HTMLInputElement).value;
    const txt = container.querySelector<HTMLInputElement>('#wcag-bg-text');
    if (txt) txt.value = bgHex;
    updateWcagInPlace();
  });

  const updateTypoInPlace = () => {
    const lbl = container.querySelector<HTMLElement>('#typo-base-lbl');
    const badge = container.querySelector<HTMLElement>('#typo-badge');
    const list = container.querySelector<HTMLElement>('#typo-scale-list');
    if (lbl) lbl.textContent = `${baseFontPx}px`;
    if (badge) badge.textContent = `Base ${baseFontPx}px · Ratio ${scaleRatio}`;
    if (list) list.innerHTML = renderScaleRows();
  };

  container.querySelector<HTMLInputElement>('#typo-base-range')?.addEventListener('input', (e) => {
    baseFontPx = Number((e.target as HTMLInputElement).value);
    updateTypoInPlace();
  });

  container.querySelector<HTMLSelectElement>('#typo-ratio-sel')?.addEventListener('change', (e) => {
    scaleRatio = Number((e.target as HTMLSelectElement).value);
    updateTypoInPlace();
  });
}

/**
 * Full-Screen Application Blueprints View
 */
export function mountFullScreenBlueprints(container: HTMLElement): () => void {
  let activeBlueprint: 'noc' | 'api-studio' | 'vault-studio' | 'workflow-ide' = 'noc';
  let cleanupFn: (() => void) | null = null;

  const draw = () => {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
        <div class="matz-card matz-beam-top" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div>
            <span class="matz-badge matz-badge-cyan">FULL-SCREEN APP BLUEPRINTS</span>
            <h2 style="font-size:20px;font-weight:800;margin-top:6px;">Templates Completos de Aplicações Widescreen</h2>
          </div>
          <div class="matz-segmented">
            <button class="matz-segmented-btn ${activeBlueprint === 'noc' ? 'active' : ''}" data-bp="noc">
              ${matzIcon('gauge', 13)} Executive NOC & Telemetry
            </button>
            <button class="matz-segmented-btn ${activeBlueprint === 'api-studio' ? 'active' : ''}" data-bp="api-studio">
              ${matzIcon('api', 13)} HTTP & mTLS API Studio
            </button>
            <button class="matz-segmented-btn ${activeBlueprint === 'vault-studio' ? 'active' : ''}" data-bp="vault-studio">
              ${matzIcon('lock', 13)} Markdown & E2EE Vault
            </button>
            <button class="matz-segmented-btn ${activeBlueprint === 'workflow-ide' ? 'active' : ''}" data-bp="workflow-ide">
              ${matzIcon('code', 13)} Sprint Board & Prismatic IDE
            </button>
          </div>
        </div>

        <div id="blueprint-stage" style="width:100%;"></div>
      </div>
    `;

    const stage = container.querySelector<HTMLElement>('#blueprint-stage')!;

    if (activeBlueprint === 'noc') {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:18px;width:100%;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;">
            ${renderSparklineCard({ title: 'Receita Recorrente (MRR)', value: 'R$ 64.890', delta: '+28.4%', data: [28, 34, 39, 44, 51, 58, 65], color: '#10b981' })}
            ${renderSparklineCard({ title: 'Throughput Global', value: '248.910 req/m', delta: '+34.2%', data: [110, 135, 152, 178, 198, 224, 249], color: '#06b6d4' })}
            ${renderSparklineCard({ title: 'Clusters Ativos', value: '42 Nodes', delta: '100% Online', data: [38, 39, 40, 40, 41, 42, 42], color: '#8b5cf6' })}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
            <div id="bp-g1"></div>
            <div id="bp-g2"></div>
            <div id="bp-g3"></div>
            <div id="bp-donut"></div>
          </div>
          <div id="bp-osc"></div>
        </div>
      `;
      renderArcGauge(stage.querySelector('#bp-g1')!, { label: 'Engine CPU Load', value: 78, unit: '%', interactive: true });
      renderArcGauge(stage.querySelector('#bp-g2')!, { label: 'Argon2id Memory', value: 64, max: 128, unit: ' MB', color: '#10b981', interactive: true });
      renderSpeedometerGauge(stage.querySelector('#bp-g3')!, { label: 'mTLS Handshake P99', value: 14, max: 100, unit: 'ms', interactive: true });
      renderRingDonutChart(stage.querySelector('#bp-donut')!, 'Distribuição de Tráfego', [
        { label: 'Desktop Wails v3', value: 5400, color: '#8b5cf6' },
        { label: 'Web Cloud', value: 3800, color: '#06b6d4' },
        { label: 'CLI Agents', value: 2100, color: '#10b981' },
      ]);
      cleanupFn = mountLiveTelemetryStream(stage.querySelector('#bp-osc')!);
    } else if (activeBlueprint === 'api-studio') {
      const card = document.createElement('div');
      card.className = 'matz-card';
      card.style.padding = '0';
      card.style.height = '540px';
      card.style.overflow = 'hidden';
      stage.appendChild(card);
      const api = new MatzApiClientModule(card, {
        executeRequest: async (method, url) => ({
          status_code: 200,
          status_text: '200 OK',
          duration: 15,
          size_bytes: 342,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ blueprint: 'Full-Screen API Studio', method, url, tls: 'TLS 1.3 + PKCS#12' }, null, 2),
        }),
      });
      api.mount();
    } else if (activeBlueprint === 'vault-studio') {
      const card = document.createElement('div');
      card.className = 'matz-card';
      card.style.padding = '0';
      card.style.height = '540px';
      card.style.overflow = 'hidden';
      stage.appendChild(card);
      const editor = new MatzEditorModule(card, {
        listDocuments: async () => [
          {
            id: 'bp-doc-1',
            title: 'Especificação de UX & Multi-Framework',
            snippet: 'Padrão Vanilla TS + Camada Nativa Wails + Suporte Multi-Framework',
            tags: ['arquitetura'],
            is_vault: true,
            updated_at: 'Agora',
          },
        ],
        readDocument: async () => ({
          id: 'bp-doc-1',
          title: 'Especificação de UX & Multi-Framework',
          content:
            '# Matz UX Studio v0.1.0-beta.1\n\nEste ambiente combina **Engenharia de UX**, **Camada Nativa Wails** e **Componentes Multi-Framework** aproveitando 100% da largura da tela.\n\n- **Padrão Oficial**: Vanilla TypeScript + HTML5 + CSS3\n- **Desktop Nativo**: Go 1.27 + Wails (`@matz/ui/wails`)\n- **Adaptadores**: React 19, Next.js 15, Vue 3, Svelte 5, Tailwind CSS e SCSS.',
          tags: ['arquitetura'],
          is_vault: true,
        }),
        saveDocument: async (d) => d.id || 'bp-doc-1',
        deleteDocument: async () => {},
      });
      void editor.mount();
    } else if (activeBlueprint === 'workflow-ide') {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start;">
          <div id="bp-wf"></div>
          <div style="display:flex;flex-direction:column;gap:20px;">
            <div id="bp-cmd"></div>
            <div id="bp-prism"></div>
          </div>
        </div>
      `;
      renderLinearWorkspaceCard(stage.querySelector('#bp-wf')!);
      renderEmbeddedRaycastPalette(stage.querySelector('#bp-cmd')!);
      renderWarpRefractionWindow(stage.querySelector('#bp-prism')!);
    }

    container.querySelectorAll<HTMLButtonElement>('[data-bp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeBlueprint = (btn.dataset.bp as typeof activeBlueprint) || 'noc';
        draw();
      });
    });
  };

  draw();
  return () => {
    if (cleanupFn) cleanupFn();
  };
}
