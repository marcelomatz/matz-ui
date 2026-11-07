import { matzIcon } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';
import { highlightMatzCode } from './MultiFrameworkCode';

type PillarID =
  | 'color'
  | 'typography'
  | 'elevation'
  | 'shape'
  | 'motion'
  | 'states'
  | 'layout-tokens';

interface TonalStep {
  tone: number;
  hex: string;
  onHex: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) =>
    lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function generateTonalPalette(seedHex: string, saturationScale = 1): TonalStep[] {
  const { h, s } = hexToHsl(seedHex);
  const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
  return tones.map((t) => {
    const sat = t === 0 || t === 100 ? 0 : Math.min(100, Math.round(s * saturationScale));
    const hex = hslToHex(h, sat, t);
    return {
      tone: t,
      hex,
      onHex: t >= 60 ? '#080a10' : '#f8fafc',
    };
  });
}

export function mountMatzDesignSystemFoundations(container: HTMLElement): void {
  let activePillar: PillarID = 'color';
  let seedHex = '#8b5cf6';
  let customSpecimenText = 'Precisão Óptica, Engenharia de UX & Execução a 60fps — 0123456789';
  let tokenExportFormat: 'w3c-json' | 'css' | 'tailwind' = 'w3c-json';

  const TYPE_SCALE = [
    { role: 'Display Large', token: '--type-display-lg', size: '52px', line: '60px', weight: '800', tracking: '-0.035em', font: 'Sans' },
    { role: 'Display Medium', token: '--type-display-md', size: '42px', line: '50px', weight: '800', tracking: '-0.03em', font: 'Sans' },
    { role: 'Display Small', token: '--type-display-sm', size: '34px', line: '42px', weight: '800', tracking: '-0.025em', font: 'Sans' },
    { role: 'Headline Large', token: '--type-headline-lg', size: '28px', line: '36px', weight: '700', tracking: '-0.02em', font: 'Sans' },
    { role: 'Headline Medium', token: '--type-headline-md', size: '24px', line: '32px', weight: '700', tracking: '-0.018em', font: 'Sans' },
    { role: 'Headline Small', token: '--type-headline-sm', size: '20px', line: '28px', weight: '700', tracking: '-0.015em', font: 'Sans' },
    { role: 'Title Large', token: '--type-title-lg', size: '18px', line: '26px', weight: '600', tracking: '-0.01em', font: 'Sans' },
    { role: 'Title Medium', token: '--type-title-md', size: '15.5px', line: '23px', weight: '600', tracking: '-0.005em', font: 'Sans' },
    { role: 'Title Small', token: '--type-title-sm', size: '14px', line: '20px', weight: '600', tracking: '0em', font: 'Sans' },
    { role: 'Body Large', token: '--type-body-lg', size: '15.5px', line: '25px', weight: '400', tracking: '0em', font: 'Sans' },
    { role: 'Body Medium (Padrão)', token: '--type-body-md', size: '13.5px', line: '21px', weight: '400', tracking: '0em', font: 'Sans' },
    { role: 'Body Small', token: '--type-body-sm', size: '12px', line: '18px', weight: '400', tracking: '0.01em', font: 'Sans' },
    { role: 'Label Large', token: '--type-label-lg', size: '13px', line: '18px', weight: '600', tracking: '0.02em', font: 'Sans' },
    { role: 'Label Small (Caps)', token: '--type-label-sm', size: '11px', line: '16px', weight: '700', tracking: '0.06em', font: 'Sans' },
    { role: 'Mono Tabular Metric', token: '--type-mono-tabular', size: '14px', line: '20px', weight: '600', tracking: '-0.01em', font: 'Mono' },
  ];

  const generateTokensExport = (): string => {
    const primaryPalette = generateTonalPalette(seedHex, 1);
    const toneMap = Object.fromEntries(primaryPalette.map((t) => [t.tone, t.hex]));

    if (tokenExportFormat === 'w3c-json') {
      return JSON.stringify(
        {
          $schema: 'https://tr.designtokens.org/format/',
          system: '@matz/ui Design System v0.1.0-beta.1',
          color: {
            seed: { $value: seedHex, $type: 'color' },
            primary: {
              default: { $value: toneMap[60], $type: 'color' },
              onPrimary: { $value: '#ffffff', $type: 'color' },
              container: { $value: toneMap[20], $type: 'color' },
              onContainer: { $value: toneMap[90], $type: 'color' },
            },
            surface: {
              canvas: { $value: '#080a10', $type: 'color' },
              containerLow: { $value: '#0c0f18', $type: 'color' },
              container: { $value: '#0f131d', $type: 'color' },
              containerHigh: { $value: '#141926', $type: 'color' },
              containerHighest: { $value: '#1c2333', $type: 'color' },
              input: { $value: '#0a0d15', $type: 'color' },
            },
          },
          shape: {
            xs: { $value: '4px', $type: 'dimension' },
            sm: { $value: '8px', $type: 'dimension' },
            md: { $value: '11px', $type: 'dimension' },
            lg: { $value: '16px', $type: 'dimension' },
            xl: { $value: '24px', $type: 'dimension' },
            full: { $value: '9999px', $type: 'dimension' },
          },
          motion: {
            easingEmphasizedDecelerate: { $value: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', $type: 'cubicBezier' },
            easingStandard: { $value: 'cubic-bezier(0.2, 0.0, 0, 1.0)', $type: 'cubicBezier' },
            durationShort2: { $value: '150ms', $type: 'duration' },
            durationMedium2: { $value: '300ms', $type: 'duration' },
          },
        },
        null,
        2
      );
    }
    if (tokenExportFormat === 'css') {
      return `:root {
  /* 1. Tonal Primary Roles (Seed: ${seedHex}) */
  --matz-primary: ${toneMap[60]};
  --matz-on-primary: #ffffff;
  --matz-primary-container: ${toneMap[20]};
  --matz-on-primary-container: ${toneMap[90]};

  /* 2. Surface Containers (Levels 0–5) */
  --surface-canvas: #080a10;
  --surface-container-low: #0c0f18;
  --surface-container: #0f131d;
  --surface-container-high: #141926;
  --surface-container-highest: #1c2333;
  --surface-input: #0a0d15;

  /* 3. Shape & Motion */
  --shape-xs: 4px;
  --shape-sm: 8px;
  --shape-md: 11px;
  --shape-lg: 16px;
  --shape-xl: 24px;
  --ease-emphasized: cubic-bezier(0.05, 0.7, 0.1, 1.0);
}`;
    }
    return `/* Tailwind CSS v4 @theme Configuration (@matz/ui) */
@import "tailwindcss";

@theme {
  --color-primary: ${toneMap[60]};
  --color-primary-container: ${toneMap[20]};
  --color-surface-canvas: #080a10;
  --color-surface-card: #0f131d;
  --color-surface-input: #0a0d15;
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 11px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}`;
  };

  const renderPillarStage = () => {
    const stage = container.querySelector<HTMLElement>('#ds-pillar-stage');
    if (!stage) return;

    container.querySelectorAll<HTMLButtonElement>('[data-pillar-tab]').forEach((btn) => {
      const isAct = btn.dataset.pillarTab === activePillar;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });

    if (activePillar === 'color') {
      const primaryTones = generateTonalPalette(seedHex, 1);
      const secondaryTones = generateTonalPalette(seedHex, 0.45);
      const neutralTones = generateTonalPalette(seedHex, 0.12);
      const pMap = Object.fromEntries(primaryTones.map((t) => [t.tone, t.hex]));
      const nMap = Object.fromEntries(neutralTones.map((t) => [t.tone, t.hex]));

      const roles = [
        { role: 'Primary', bg: pMap[60], fg: '#ffffff', token: '--accent / --primary', desc: 'Ações primárias, links ativos e indicadores de foco' },
        { role: 'On-Primary', bg: '#ffffff', fg: pMap[20], token: '--on-primary', desc: 'Texto e ícones sobre superfícies Primary' },
        { role: 'Primary Container', bg: pMap[20], fg: pMap[90], token: '--accent-muted', desc: 'Containers tonais, chips selecionados e destaques suaves' },
        { role: 'On-Primary Container', bg: pMap[90], fg: pMap[10], token: '--on-primary-container', desc: 'Texto de alto contraste dentro de Primary Container' },
        { role: 'Surface Canvas (Level 0)', bg: '#080a10', fg: '#f8fafc', token: '--surface-canvas', desc: 'Plano de fundo principal widescreen da aplicação' },
        { role: 'Surface Container (Level 1)', bg: '#0f131d', fg: '#f8fafc', token: '--surface-card-solid', desc: 'Cartões padrão, barras laterais e painéis de conteúdo' },
        { role: 'Surface Container High (Level 3)', bg: '#141926', fg: '#f8fafc', token: '--surface-elevated', desc: 'Menus suspensos, barras de comando e diálogos' },
        { role: 'Surface Input', bg: '#0a0d15', fg: '#f8fafc', token: '--surface-input', desc: 'Fundo calibrado de inputs, textareas e selects (Zero White-Leak)' },
      ];

      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:26px;">
          <!-- Seed Color Bar -->
          <div class="matz-card" style="padding:20px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <input type="color" id="ds-seed-picker" aria-label="Escolher cor semente (Seed Color)" value="${seedHex}" style="width:46px;height:46px;border:none;border-radius:10px;background:transparent;cursor:pointer;" />
              <div>
                <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Seed Color (Cor Semente Dinâmica)</div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                  <strong class="matz-tabular" style="font-family:var(--font-mono);font-size:17px;">${seedHex.toUpperCase()}</strong>
                  <span class="matz-badge matz-badge-cyan">Algoritmo Tonal HSL 13-Steps</span>
                </div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:12px;color:var(--text-secondary);">Presets Oficiais:</span>
              ${[
                { hex: '#8b5cf6', name: 'Matz Violet' },
                { hex: '#d946ef', name: 'Heapi Fuchsia' },
                { hex: '#10b981', name: 'MyTerm Emerald' },
                { hex: '#3b82f6', name: 'ByCode Blue' },
                { hex: '#f59e0b', name: 'Writtt Amber' },
                { hex: '#06b6d4', name: 'Telemetry Cyan' },
              ]
                .map(
                  (p) => `
                <button class="matz-btn matz-btn-sm" data-seed-preset="${p.hex}">
                  <span style="width:9px;height:9px;border-radius:50%;background:${p.hex};"></span>
                  <span>${p.name}</span>
                </button>`
                )
                .join('')}
            </div>
          </div>

          <!-- 13-Step Tonal Palettes -->
          <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:18px;">
            <div>
              <strong style="font-size:15px;">Escalas Tonais Geradas Automaticamente (Luminância 0 → 100)</strong>
              <p style="font-size:12.5px;color:var(--text-secondary);margin-top:2px;">Clique em qualquer célula tonal para copiar seu código hexadecimal:</p>
            </div>

            ${[
              { label: 'Primary Tonal Palette (Croma Integral)', tones: primaryTones },
              { label: 'Secondary Tonal Palette (Croma Suavizado 45%)', tones: secondaryTones },
              { label: 'Neutral Surface Palette (Croma Arquitetural 12%)', tones: neutralTones },
            ]
              .map(
                (row) => `
              <div style="display:flex;flex-direction:column;gap:6px;">
                <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${row.label}</span>
                <div style="display:grid;grid-template-columns:repeat(13, minmax(0, 1fr));gap:4px;">
                  ${row.tones
                    .map(
                      (t) => `
                    <button type="button" data-copy-hex="${t.hex}" style="height:56px;border-radius:7px;background:${t.hex};color:${t.onHex};border:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;padding:6px;cursor:pointer;font-family:var(--font-mono);font-size:10px;text-align:left;">
                      <strong>T${t.tone}</strong>
                      <span style="opacity:0.85;font-size:9.5px;">${t.hex}</span>
                    </button>`
                    )
                    .join('')}
                </div>
              </div>`
              )
              .join('')}
          </div>

          <!-- Semantic Color Roles Matrix -->
          <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
            <div>
              <strong style="font-size:15px;">Matriz de Papéis Semânticos de Cor (Color Roles)</strong>
              <p style="font-size:12.5px;color:var(--text-secondary);margin-top:2px;">
                Mapeamento direto entre papéis funcionais de interface e variáveis CSS da <code>@matz/ui</code>:
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:14px;">
              ${roles
                .map(
                  (r) => `
                <div style="border-radius:10px;border:1px solid var(--border-strong);overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;background:${r.bg};color:${r.fg};padding:16px;min-height:115px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                    <strong style="font-size:13px;">${r.role}</strong>
                    <code style="font-family:var(--font-mono);font-size:10.5px;opacity:0.9;">${r.bg}</code>
                  </div>
                  <div style="margin-top:12px;">
                    <div style="font-family:var(--font-mono);font-size:10.5px;opacity:0.85;margin-bottom:4px;">${r.token}</div>
                    <div style="font-size:11px;opacity:0.8;line-height:1.4;">${r.desc}</div>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      `;

      stage.querySelector<HTMLInputElement>('#ds-seed-picker')?.addEventListener('change', (e) => {
        seedHex = (e.target as HTMLInputElement).value;
        document.documentElement.style.setProperty('--accent', seedHex);
        renderPillarStage();
      });

      stage.querySelectorAll<HTMLButtonElement>('[data-seed-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          seedHex = btn.dataset.seedPreset || '#8b5cf6';
          document.documentElement.style.setProperty('--accent', seedHex);
          renderPillarStage();
        });
      });

      stage.querySelectorAll<HTMLButtonElement>('[data-copy-hex]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const hx = btn.dataset.copyHex || '';
          navigator.clipboard?.writeText(hx);
          showMatzToast(`Cor tonal ${hx} copiada!`);
        });
      });
    } else if (activePillar === 'typography') {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="matz-card" style="padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
            <div style="flex:1;min-width:260px;">
              <label for="ds-specimen-input" style="font-size:11.5px;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:5px;">
                Texto de Amostra ao Vivo (15 Níveis Tipográficos + Numerais Tabulares)
              </label>
              <input id="ds-specimen-input" class="matz-input" value="${customSpecimenText}" />
            </div>
            <div style="display:flex;gap:10px;">
              <span class="matz-badge matz-badge-cyan">Sans: Inter / System UI</span>
              <span class="matz-badge matz-badge-emerald">Mono: JetBrains Mono (tabular-nums)</span>
            </div>
          </div>

          <div class="matz-table-wrap">
            <table class="matz-table">
              <thead>
                <tr>
                  <th style="width:190px;">Papel Tipográfico</th>
                  <th style="width:180px;">Especificação</th>
                  <th>Amostra Renderizada ao Vivo</th>
                </tr>
              </thead>
              <tbody>
                ${TYPE_SCALE.map(
                  (t) => `
                  <tr>
                    <td>
                      <strong style="display:block;color:var(--text-primary);">${t.role}</strong>
                      <code style="font-family:var(--font-mono);font-size:11px;color:var(--accent);">${t.token}</code>
                    </td>
                    <td>
                      <span class="matz-tabular" style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-secondary);">
                        ${t.size} / ${t.line} · W${t.weight} · ${t.tracking}
                      </span>
                    </td>
                    <td>
                      <div class="ds-live-specimen ${t.font === 'Mono' ? 'matz-tabular' : ''}" style="font-size:${t.size};line-height:${t.line};font-weight:${t.weight};letter-spacing:${t.tracking};font-family:${
                        t.font === 'Mono' ? 'var(--font-mono)' : 'var(--font-sans)'
                      };color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:760px;">
                        ${customSpecimenText}
                      </div>
                    </td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const specInput = stage.querySelector<HTMLInputElement>('#ds-specimen-input');
      specInput?.addEventListener('input', () => {
        customSpecimenText = specInput.value;
        stage.querySelectorAll<HTMLElement>('.ds-live-specimen').forEach((el) => {
          el.textContent = customSpecimenText;
        });
      });
    } else if (activePillar === 'elevation') {
      const levels = [
        { lvl: 0, name: 'Level 0 · Canvas Base', tint: '0%', bg: '#080a10', shadow: 'none', usage: 'Superfície raiz da janela Wails ou página Web (--surface-canvas)' },
        { lvl: 1, name: 'Level 1 · Specular Card Low', tint: '4%', bg: '#0c0f18', shadow: '0 2px 8px rgba(0,0,0,0.32)', usage: 'Painéis secundários, sidebars e agrupadores (.matz-card)' },
        { lvl: 2, name: 'Level 2 · Elevated Surface', tint: '7%', bg: '#0f131d', shadow: '0 6px 18px rgba(0,0,0,0.42)', usage: 'Cartões interativos em hover, barras de ferramentas e cabeçalhos' },
        { lvl: 3, name: 'Level 3 · Floating Control', tint: '10%', bg: '#141926', shadow: '0 12px 28px rgba(0,0,0,0.52)', usage: 'FABs, Dropdowns, Comboboxes abertos e Toasts' },
        { lvl: 4, name: 'Level 4 · Sheet & Drawer', tint: '13%', bg: '#181e2e', shadow: '0 18px 40px rgba(0,0,0,0.62)', usage: 'Gavetas laterais (Sheet Drawer) e painéis de inspeção flutuantes' },
        { lvl: 5, name: 'Level 5 · Modal & OmniCommand', tint: '16%', bg: '#1c2333', shadow: '0 24px 56px rgba(0,0,0,0.75)', usage: 'Diálogos críticos e paleta de comandos modal (⌘K)' },
      ];

      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:20px;">
          ${levels
            .map(
              (l) => `
            <div style="padding:26px;border-radius:var(--radius-lg);background:${l.bg};border:1px solid var(--border-strong);border-top-color:rgba(255,255,255,0.16);box-shadow:${l.shadow};display:flex;flex-direction:column;justify-content:space-between;gap:18px;min-height:185px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span class="matz-badge matz-badge-cyan">Elevation ${l.lvl}</span>
                <code class="matz-tabular" style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);">Tint +${l.tint} · ${l.bg}</code>
              </div>
              <div>
                <strong style="font-size:16px;color:var(--text-primary);">${l.name}</strong>
                <p style="font-size:12.5px;color:var(--text-secondary);margin-top:6px;line-height:1.55;">${l.usage}</p>
              </div>
              <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--accent);padding-top:10px;border-top:1px solid var(--border);">
                Topo Especular 1px + Sombra Ambiental
              </div>
            </div>`
            )
            .join('')}
        </div>
      `;
    } else if (activePillar === 'shape') {
      const shapes = [
        { name: 'None (Sharp)', token: '--shape-none', px: '0px', desc: 'Tabelas full-bleed, divisores e bordas de terminal' },
        { name: 'Extra Small', token: '--shape-xs', px: '4px', desc: 'Kbd tags, checkboxes, indicadores compactos' },
        { name: 'Small', token: '--shape-sm', px: '8px', desc: 'Botões compactos, inputs, itens de menu e badges' },
        { name: 'Medium (Padrão)', token: '--shape-md', px: '11px', desc: 'Cartões padrão (.matz-card), blocos de código e alertas' },
        { name: 'Large', token: '--shape-lg', px: '16px', desc: 'Modais, gavetas, janelas prismáticas e containers hero' },
        { name: 'Extra Large', token: '--shape-xl', px: '24px', desc: 'Superfícies de destaque e cards expandidos' },
        { name: 'Full (Pill)', token: '--shape-full', px: '9999px', desc: 'Chips, switches, avatares e barras de busca circulares' },
      ];

      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:18px;">
          ${shapes
            .map(
              (s) => `
            <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
              <div style="height:84px;border-radius:${s.px};background:var(--accent-muted);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-weight:800;font-size:15px;color:var(--text-primary);">
                border-radius: ${s.px}
              </div>
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <strong style="font-size:14px;">${s.name}</strong>
                  <code style="font-family:var(--font-mono);font-size:11px;color:var(--accent);">${s.token}</code>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">${s.desc}</p>
              </div>
            </div>`
            )
            .join('')}
        </div>
      `;
    } else if (activePillar === 'motion') {
      const curves = [
        { name: 'Emphasized Decelerate (Entrada)', token: '--ease-emphasized-decelerate', bezier: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', dur: '400ms', desc: 'Usada na abertura de modais, gavetas e entrada de elementos na tela.' },
        { name: 'Standard Spatial (Transição UI)', token: '--ease-standard', bezier: 'cubic-bezier(0.2, 0.0, 0, 1.0)', dur: '250ms', desc: 'Usada para mudanças de estado, abas, acordeões e redimensionamento.' },
        { name: 'Spring Physics (Micro-Interação)', token: '--ease-spring', bezier: 'cubic-bezier(0.34, 1.56, 0.64, 1)', dur: '350ms', desc: 'Usada em switches, chips selecionados, ícones interativos e badges.' },
        { name: 'Emphasized Accelerate (Saída)', token: '--ease-emphasized-accelerate', bezier: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)', dur: '200ms', desc: 'Usada no fechamento rápido de overlays e descarte de toasts.' },
      ];

      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:18px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;color:var(--text-secondary);">Clique em <strong>Disparar Animação</strong> para comparar as 4 curvas físicas de movimento da <code>@matz/ui</code>:</span>
            <button class="matz-btn matz-btn-primary" id="ds-play-motion-btn">
              ${matzIcon('play', 13)} Disparar Animação Comparativa
            </button>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            ${curves
              .map(
                (c, i) => `
              <div class="matz-card" style="padding:18px 22px;display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <div>
                    <strong style="font-size:14px;">${c.name}</strong>
                    <span style="font-size:12px;color:var(--text-secondary);margin-left:10px;">${c.desc}</span>
                  </div>
                  <code style="font-family:var(--font-mono);font-size:11.5px;color:var(--accent);">${c.bezier} · ${c.dur}</code>
                </div>
                <div style="height:36px;border-radius:999px;background:var(--surface-input);border:1px solid var(--border);padding:4px;position:relative;overflow:hidden;">
                  <div class="ds-motion-puck" data-dur="${c.dur}" data-bezier="${c.bezier}" style="width:110px;height:26px;border-radius:999px;background:linear-gradient(90deg, var(--accent), #06b6d4);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:#fff;transition:transform ${c.dur} ${c.bezier};">
                    Curva #${i + 1}
                  </div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;

      let toggled = false;
      stage.querySelector('#ds-play-motion-btn')?.addEventListener('click', () => {
        toggled = !toggled;
        stage.querySelectorAll<HTMLElement>('.ds-motion-puck').forEach((puck) => {
          const parentW = puck.parentElement?.clientWidth || 600;
          const travel = Math.max(0, parentW - 122);
          puck.style.transform = toggled ? `translateX(${travel}px)` : 'translateX(0px)';
        });
      });
    } else if (activePillar === 'states') {
      const states = [
        { name: '1. Rest (Repouso)', overlay: '0% Opacity', ring: 'none', scale: '1.00', opacity: '1.0', desc: 'Superfície base com borda especular de 1px sem camada de estado ativa.' },
        { name: '2. Hover (Cursor Sobre)', overlay: '+8% Accent Layer', ring: 'none', scale: '1.00', opacity: '1.0', desc: 'Iluminação radial spotlight + camada translúcida de 8% sobre a superfície.' },
        { name: '3. Focus-Visible (Teclado)', overlay: '+10% Accent Layer', ring: '2px solid var(--accent)', scale: '1.00', opacity: '1.0', desc: 'Anel de foco de alto contraste com offset de 2px para navegação via Tab.' },
        { name: '4. Pressed / Active', overlay: '+12% Accent Layer', ring: 'none', scale: '0.985', opacity: '1.0', desc: 'Compressão tátil sutil (scale 0.985) e aumento da camada óptica para 12%.' },
        { name: '5. Selected / Toggled', overlay: '+16% Container Tint', ring: '1px solid var(--accent)', scale: '1.00', opacity: '1.0', desc: 'Estado persistente ativo para chips, abas, Navigation Rail e itens de lista.' },
        { name: '6. Disabled (Inativo)', overlay: '0% Layer', ring: 'none', scale: '1.00', opacity: '0.38', desc: 'Opacidade reduzida a 38% com cursor bloqueado e sem resposta a ponteiro.' },
      ];

      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px;">
          ${states
            .map(
              (st, idx) => `
            <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;opacity:${st.opacity};">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:14px;">${st.name}</strong>
                <span class="matz-badge matz-badge-cyan">${st.overlay}</span>
              </div>
              <div style="padding:18px;border-radius:10px;background:${
                idx === 0 ? 'var(--surface-elevated)' : 'var(--accent-muted)'
              };outline:${st.ring};outline-offset:2px;transform:scale(${st.scale});display:flex;align-items:center;justify-content:space-between;">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;">
                  ${matzIcon('sparkles', 15)} Botão / Superfície
                </span>
                <kbd class="matz-kbd">State</kbd>
              </div>
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.55;">${st.desc}</p>
            </div>`
            )
            .join('')}
        </div>
      `;
    } else {
      const exported = generateTokensExport();
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:minmax(0, 1fr) minmax(0, 1.15fr);gap:24px;align-items:start;">
          <!-- Canonical Adaptive Layouts -->
          <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
            <strong style="font-size:16px;">Panes Canônicos & Breakpoints Adaptativos</strong>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
              A <code>@matz/ui</code> organiza janelas desktop Wails e aplicações Web em 4 arquiteturas canônicas de painel:
            </p>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${[
                { name: 'Compact (< 600px)', layout: 'Single Pane + Bottom Bar / Drawer', cols: '1 Coluna Fluida' },
                { name: 'Medium (600px – 840px)', layout: 'Navigation Rail (72px) + Primary Stage', cols: 'Rail + 1 Pane' },
                { name: 'Expanded (840px – 1200px)', layout: 'Navigation Rail + List Feed + Detail Stage', cols: 'Dual-Pane Split' },
                { name: 'Ultra-Wide Studio (> 1200px)', layout: 'Collapsible Sidebar + Fluid Stage + Context Drawer', cols: '3-Pane Workbench' },
              ]
                .map(
                  (b) => `
                <div style="padding:12px 14px;border-radius:8px;background:var(--surface-subtle);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <div>
                    <strong style="font-size:13px;display:block;">${b.name}</strong>
                    <span style="font-size:12px;color:var(--text-secondary);">${b.layout}</span>
                  </div>
                  <span class="matz-badge">${b.cols}</span>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <!-- W3C Design Tokens Exporter -->
          <div class="matz-stage-shell">
            <div class="matz-stage-toolbar">
              <div class="matz-segmented">
                <button class="matz-segmented-btn ${tokenExportFormat === 'w3c-json' ? 'active' : ''}" data-tok-fmt="w3c-json">
                  W3C Design Tokens (.json)
                </button>
                <button class="matz-segmented-btn ${tokenExportFormat === 'css' ? 'active' : ''}" data-tok-fmt="css">
                  CSS3 Variables (.css)
                </button>
                <button class="matz-segmented-btn ${tokenExportFormat === 'tailwind' ? 'active' : ''}" data-tok-fmt="tailwind">
                  Tailwind v4 (@theme)
                </button>
              </div>
              <button class="matz-btn matz-btn-sm matz-btn-primary" id="ds-copy-tokens-btn">
                ${matzIcon('copy', 12)} Copiar Tokens
              </button>
            </div>
            <div style="padding:18px;">
              <div class="matz-code-block" style="margin:0;max-height:360px;overflow:auto;">${highlightMatzCode(
                exported,
                tokenExportFormat.toUpperCase()
              )}</div>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll<HTMLButtonElement>('[data-tok-fmt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          tokenExportFormat = (btn.dataset.tokFmt as typeof tokenExportFormat) || 'w3c-json';
          renderPillarStage();
        });
      });

      stage.querySelector('#ds-copy-tokens-btn')?.addEventListener('click', () => {
        navigator.clipboard?.writeText(exported);
        showMatzToast(`Especificação de tokens (${tokenExportFormat}) copiada!`);
      });
    }
  };

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:24px;padding:28px 36px 80px;width:100%;min-width:0;">
      <!-- Header -->
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        <div>
          <span class="matz-badge matz-badge-cyan">MATZ DESIGN SYSTEM FOUNDATIONS · 7 PILARES ESTRUTURAIS</span>
          <h1 class="matz-heading-grad" style="font-size:28px;font-weight:800;margin-top:6px;display:block;">
            Fundamentos do Sistema de Design & Motor de Tokens W3C
          </h1>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;max-width:880px;">
            Arquitetura de precisão que governa cores tonais dinâmicas, escala tipográfica de 15 níveis, elevação especular 0–5, geometria de formas, física de movimento, camadas de estado e layouts adaptativos.
          </p>
        </div>
      </div>

      <!-- 7 Pillars Navigation Bar -->
      <div class="matz-stage-shell">
        <div class="matz-stage-toolbar">
          <div class="matz-segmented" role="tablist" aria-label="Pilares do Design System" style="flex-wrap:wrap;">
            <button class="matz-segmented-btn active" data-pillar-tab="color" role="tab" aria-selected="true">
              ${matzIcon('palette', 13)} 1. Cor Tonal & Papéis
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="typography" role="tab" aria-selected="false">
              ${matzIcon('feather', 13)} 2. Tipografia (15 Níveis)
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="elevation" role="tab" aria-selected="false">
              ${matzIcon('layers', 13)} 3. Elevação (0–5)
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="shape" role="tab" aria-selected="false">
              ${matzIcon('box', 13)} 4. Geometria & Formas
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="motion" role="tab" aria-selected="false">
              ${matzIcon('activity', 13)} 5. Física de Movimento
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="states" role="tab" aria-selected="false">
              ${matzIcon('target', 13)} 6. Camadas de Estado
            </button>
            <button class="matz-segmented-btn" data-pillar-tab="layout-tokens" role="tab" aria-selected="false">
              ${matzIcon('braces', 13)} 7. Layouts & W3C Tokens
            </button>
          </div>
        </div>

        <div id="ds-pillar-stage" style="padding:26px;min-height:460px;"></div>
      </div>
    </div>
  `;

  renderPillarStage();

  container.querySelectorAll<HTMLButtonElement>('[data-pillar-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePillar = (btn.dataset.pillarTab as PillarID) || 'color';
      renderPillarStage();
    });
  });
}
