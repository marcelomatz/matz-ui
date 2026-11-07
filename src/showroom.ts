import './styles/matz-ui.css';
import {
  enableMatzSpotlight,
  matzIcon,
  MatzIconName,
  MatzProductID,
  showMatzToast,
  openRaycastCommandModal,
  renderEmbeddedRaycastPalette,
  renderLinearWorkspaceCard,
  renderWarpRefractionWindow,
  renderArcGauge,
  renderSpeedometerGauge,
  renderRingDonutChart,
  renderInteractiveAreaChart,
  renderStackedBarChart,
  renderSparklineCard,
  renderActivityHeatmap,
  mountLiveTelemetryStream,
  renderMatzDataTable,
  renderMatzWaveformPlayer,
  renderMatzCombobox,
  renderMatzOTPInput,
  renderMatzAccordion,
  openMatzDialog,
  openMatzSheetDrawer,
  renderMatzNavigationRail,
  renderMatzChipsSuite,
  renderMatzStepperAndBreadcrumbs,
  renderMatzProgressAndIndicators,
  renderMatzAgenticUISuite,
  renderMatzWebsiteHeader,
  renderMatzWebsiteHero,
  renderMatzWebsiteMainAndAside,
  renderMatzWebsiteFooter,
  renderMatzAnimationsAndBackgrounds,
  renderMatzCompositeAdminSuite,
  EXPANDED_CATALOG_PAGES,
  MatzApiClientModule,
  MatzEditorModule,
} from './index';
import { MATZ_ICON_CATALOG } from './icons/Icons';
import {
  FrameworkID,
  CssStackID,
  generateMultiFrameworkSnippet,
  generateCssConfigExport,
  highlightMatzCode,
} from './ux/MultiFrameworkCode';
import {
  mountUXScreenComposer,
  mountUXHeuristicsLab,
  mountFullScreenBlueprints,
} from './ux/UXWorkbenchViews';
import { mountMatzHomeView } from './ux/HomeView';
import { mountMatzDesignSystemFoundations } from './ux/DesignSystemFoundations';
import { mountMatzIconStudio } from './ux/IconStudioView';
import { mountWailsNativeStudio } from './wails/WailsBridge';
import { formatVersionBadgeHtml, openMatzVersionModal } from './version/VersionSystem';

interface DocPageSpec {
  id: string;
  category: string;
  title: string;
  badge?: string;
  description: string;
  codeSnippet: string;
  tokens: Array<[string, string, string]>;
  mountPreview: (stage: HTMLElement) => (() => void) | void;
}

type StudioWorkspaceMode =
  | 'home'
  | 'foundations'
  | 'icons'
  | 'explorer'
  | 'wails'
  | 'composer'
  | 'heuristics'
  | 'blueprints';

let workspaceMode: StudioWorkspaceMode = 'home';
let activeProduct: MatzProductID = 'matz';
let theme: 'dark' | 'light' = 'dark';
let density: 'compact' | 'default' | 'spacious' = 'default';
let visionFilter: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' = 'normal';
let stageViewport: 'fluid' | '1440px' | '960px' | '420px' = 'fluid';
let stageGrid = false;
let stageXray = false;
let radiusMd = 11;
let customAccentHex = '#8b5cf6';

let activePageId = 'introduction';
let activeTab: 'preview' | 'split' | 'code' = 'preview';
let activeFramework: FrameworkID = 'vanilla';
let activeCssStack: CssStackID = 'matz-css';
let sidebarFilter = '';
let activeCleanup: (() => void) | null = null;

// Progressive Disclosure & Collapsible UX States
let inspectorOpen = false;
let codeDrawerOpen = true;
let anatomyDrawerOpen = false;
let dosDontsDrawerOpen = false;
let tokensDrawerOpen = false;
const expandedCategories = new Set<string>(['1. Overview & Foundation', '2. Form & Inputs']);
const inspectorSecOpen: Record<string, boolean> = {
  palette: true,
  geometry: true,
  wcag: false,
  export: false,
};

const DOC_PAGES: DocPageSpec[] = [
  // ==========================================================================
  // 1. OVERVIEW & FOUNDATION
  // ==========================================================================
  {
    id: 'introduction',
    category: '1. Overview & Foundation',
    title: 'Introduction & Matz Signature Suite',
    badge: 'v4.0 UX Studio',
    description:
      'Plataforma proprietária de Design System, Engenharia de UX e Componentes Multi-Framework (@matz/ui v4.0). Projetada com arquitetura Dual-Theme (Specular Obsidian & Architectural Alabaster), iluminação radial interativa sob o cursor e suporte oficial para Vanilla TS, Go + Wails v3, React, Next.js, Vue 3, Svelte 5, Tailwind CSS e SCSS.',
    codeSnippet: `import {
  enableMatzSpotlight,
  renderLinearWorkspaceCard,
  renderEmbeddedRaycastPalette,
  renderWarpRefractionWindow,
} from '@matz/ui';

enableMatzSpotlight();
renderLinearWorkspaceCard(document.getElementById('workflow-host')!);
renderEmbeddedRaycastPalette(document.getElementById('omnicommand-host')!);
renderWarpRefractionWindow(document.getElementById('prismatic-host')!);`,
    tokens: [
      ['--surface-canvas', '#080a10 (Dark) / #f8fafc (Light)', 'Superfície base widescreen da aplicação'],
      ['--surface-card', 'Specular Obsidian / Alabaster Gradient', 'Superfície elevada com topo especular 1px'],
      ['--surface-input', '#0a0d15 (Dark) / #ffffff (Light)', 'Fundo unificado de inputs, textareas e selects'],
    ],
    mountPreview: (stage) => {
      let introSubTab: 'workflow' | 'omnicmd' | 'prismatic' | 'stacked' = 'workflow';

      function drawIntroStage(): void {
        stage.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:16px;width:100%;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--border);">
              <div style="font-size:12px;color:var(--text-secondary);">
                Explore cada superfície proprietária individualmente em largura total ou empilhadas:
              </div>
              <div class="matz-segmented">
                <button class="matz-segmented-btn ${introSubTab === 'workflow' ? 'active' : ''}" data-intro-sub="workflow">
                  1. Workflow Sprint Board
                </button>
                <button class="matz-segmented-btn ${introSubTab === 'omnicmd' ? 'active' : ''}" data-intro-sub="omnicmd">
                  2. OmniCommand Palette (⌘K)
                </button>
                <button class="matz-segmented-btn ${introSubTab === 'prismatic' ? 'active' : ''}" data-intro-sub="prismatic">
                  3. Prismatic Code Surface
                </button>
                <button class="matz-segmented-btn ${introSubTab === 'stacked' ? 'active' : ''}" data-intro-sub="stacked">
                  Visão Completa Empilhada
                </button>
              </div>
            </div>

            <div id="intro-sub-host" style="display:flex;flex-direction:column;gap:20px;width:100%;"></div>
          </div>
        `;

        const host = stage.querySelector<HTMLElement>('#intro-sub-host')!;
        if (introSubTab === 'workflow') {
          renderLinearWorkspaceCard(host);
        } else if (introSubTab === 'omnicmd') {
          renderEmbeddedRaycastPalette(host);
        } else if (introSubTab === 'prismatic') {
          renderWarpRefractionWindow(host);
        } else {
          host.innerHTML = `
            <div id="intro-s-1"></div>
            <div id="intro-s-2"></div>
            <div id="intro-s-3"></div>
          `;
          renderLinearWorkspaceCard(host.querySelector<HTMLElement>('#intro-s-1')!);
          renderEmbeddedRaycastPalette(host.querySelector<HTMLElement>('#intro-s-2')!);
          renderWarpRefractionWindow(host.querySelector<HTMLElement>('#intro-s-3')!);
        }

        stage.querySelectorAll<HTMLButtonElement>('[data-intro-sub]').forEach((btn) => {
          btn.addEventListener('click', () => {
            introSubTab = (btn.dataset.introSub as typeof introSubTab) || 'workflow';
            drawIntroStage();
          });
        });
      }

      drawIntroStage();
    },
  },
  {
    id: 'multi-framework-hub',
    category: '1. Overview & Foundation',
    title: 'Multi-Framework & CSS Integration',
    badge: 'React · Vue · Svelte',
    description:
      'A @matz/ui opera sobre padrões universais (HTML5 semântico, CSS Custom Properties e controladores TypeScript puros), garantindo compatibilidade nativa com React 19, Next.js 15 (App Router), Vue 3, Svelte 5, Tailwind CSS v4/v3, CSS Modules e Sass/SCSS.',
    codeSnippet: `// Instalação Universal
npm install @matz/ui

// 1. Importe a folha de estilos base ou o preset Tailwind CSS
import '@matz/ui/styles.css';

// 2. Use em React / Next.js, Vue 3, Svelte 5 ou Vanilla TS
// Selecione sua tecnologia nas abas de código acima para gerar o adaptador exato!`,
    tokens: [
      ['React 19 & Next.js 15', "'use client' + useRef / Props tipadas", 'Suporte completo a Server & Client Components'],
      ['Vue 3 & Nuxt 3', '<script setup lang="ts"> SFC', 'Reatividade nativa com Composition API'],
      ['Svelte 5 & SvelteKit', 'Runes ($props, $state) + bind:this', 'Zero overhead de hidratação'],
      ['Tailwind CSS v4 / v3', '@theme tokens & utility classes', 'Mapeamento direto de --surface-* e --accent'],
    ],
    mountPreview: (stage) => {
      const stacks = [
        {
          id: 'react' as FrameworkID,
          name: 'React 19 & Next.js 15',
          tag: 'TSX · App Router',
          desc: 'Hooks encapsulados, suporte a SSR/RSC e tipagem estrita de propriedades para todos os 35+ componentes.',
          color: '#38bdf8',
        },
        {
          id: 'vue' as FrameworkID,
          name: 'Vue 3 & Nuxt 3',
          tag: 'Composition API · SFC',
          desc: 'Integração direta via <script setup lang="ts"> com sincronização reativa de temas e eventos.',
          color: '#10b981',
        },
        {
          id: 'svelte' as FrameworkID,
          name: 'Svelte 5 & SvelteKit',
          tag: 'Runes ($props / $state)',
          desc: 'Ações nativas de DOM e zero runtime virtual para performance máxima em aplicações web.',
          color: '#f97316',
        },
        {
          id: 'vanilla' as FrameworkID,
          name: 'Vanilla TypeScript & Vite 8',
          tag: 'Zero Dependencies',
          desc: 'Execução direta em HTML5 + CSS3 + TS com inicialização sub-milissegundo.',
          color: '#8b5cf6',
        },
        {
          id: 'wails' as FrameworkID,
          name: 'Go 1.27 + Wails v3',
          tag: 'Native Desktop IPC',
          desc: 'Binários nativos Windows, macOS e Linux com menos de 25 MB de consumo de RAM.',
          color: '#06b6d4',
        },
      ];

      const cssLibs = [
        { id: 'matz-css' as CssStackID, name: 'Matz Native CSS3', desc: 'Classes semânticas .matz-* e Custom Properties nativas.' },
        { id: 'tailwind' as CssStackID, name: 'Tailwind CSS v4 / v3', desc: 'Preset @theme conectado às variáveis --surface-* e --accent.' },
        { id: 'scss-modules' as CssStackID, name: 'CSS Modules & Sass/SCSS', desc: 'Mixins @include matz-specular-surface e escopo modular.' },
      ];

      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:14px;">
            ${stacks
              .map(
                (s) => `
              <div class="matz-card" data-pick-fw="${s.id}" style="cursor:pointer;border-top:3px solid ${s.color};display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                    <strong style="font-size:14px;">${s.name}</strong>
                    <span class="matz-badge" style="font-size:10px;">${s.tag}</span>
                  </div>
                  <p style="font-size:12px;color:var(--text-secondary);line-height:1.55;">${s.desc}</p>
                </div>
                <button class="matz-btn matz-btn-sm ${activeFramework === s.id ? 'matz-btn-primary' : ''}">
                  ${activeFramework === s.id ? '✓ Framework Ativo nos Exemplos' : 'Definir como Padrão'}
                </button>
              </div>`
              )
              .join('')}
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
            ${cssLibs
              .map(
                (c) => `
              <div class="matz-card" data-pick-css="${c.id}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-weight:700;font-size:13.5px;">${c.name}</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${c.desc}</div>
                </div>
                <button class="matz-btn matz-btn-sm ${activeCssStack === c.id ? 'matz-btn-primary' : ''}">
                  ${activeCssStack === c.id ? 'Ativo' : 'Usar'}
                </button>
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;

      stage.querySelectorAll<HTMLElement>('[data-pick-fw]').forEach((el) => {
        el.addEventListener('click', () => {
          activeFramework = (el.dataset.pickFw as FrameworkID) || 'react';
          showMatzToast(`Exemplos de código configurados para: ${activeFramework.toUpperCase()}`);
          renderPortal();
        });
      });

      stage.querySelectorAll<HTMLElement>('[data-pick-css]').forEach((el) => {
        el.addEventListener('click', () => {
          activeCssStack = (el.dataset.pickCss as CssStackID) || 'matz-css';
          showMatzToast(`Arquitetura CSS configurada para: ${activeCssStack}`);
          renderPortal();
        });
      });
    },
  },
  {
    id: 'theme-studio',
    category: '1. Overview & Foundation',
    title: 'Theme Studio & Dual-Theme Tokens',
    badge: 'Dual-Theme',
    description:
      'Motor de temas semânticos com calibração de luminância para Dark Specular Obsidian (#080a10) e Light Architectural Alabaster (#f8fafc), além de 5 paletas de produto e cor de acento livre.',
    codeSnippet: `// Alternar Tema, Densidade e Paleta em Tempo Real
document.documentElement.setAttribute('data-theme', 'dark'); // 'dark' | 'light'
document.documentElement.setAttribute('data-density', 'default'); // 'compact' | 'default' | 'spacious'
document.documentElement.setAttribute('data-product', 'matz');`,
    tokens: [
      ['data-theme="dark"', 'Specular Obsidian (#080a10)', 'Modo escuro profundo com bordas especulares'],
      ['data-theme="light"', 'Architectural Alabaster (#f8fafc)', 'Modo claro de alto contraste óptico'],
      ['data-density', 'compact | default | spacious', 'Escala ergonômica de altura e padding'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;width:100%;">
          ${[
            { id: 'matz', name: 'Matz Violet', hex: '#8b5cf6' },
            { id: 'heapi', name: 'Heapi Fuchsia', hex: '#d946ef' },
            { id: 'myterm', name: 'MyTerm Emerald', hex: '#10b981' },
            { id: 'bycode', name: 'byCode Blue', hex: '#3b82f6' },
            { id: 'writtt', name: 'Writtt Amber', hex: '#f59e0b' },
          ]
            .map(
              (p) => `
            <div class="matz-card" data-pick-prod="${p.id}" data-pick-hex="${p.hex}" style="cursor:pointer;display:flex;flex-direction:column;gap:10px;border-top:3px solid ${p.hex};">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong>${p.name}</strong>
                <span style="width:14px;height:14px;border-radius:50%;background:${p.hex};box-shadow:0 0 10px ${p.hex};"></span>
              </div>
              <code style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">${p.hex}</code>
              <button class="matz-btn matz-btn-sm ${activeProduct === p.id ? 'matz-btn-primary' : ''}">Ativar Paleta</button>
            </div>`
            )
            .join('')}
        </div>
      `;
      stage.querySelectorAll<HTMLElement>('[data-pick-prod]').forEach((el) => {
        el.addEventListener('click', () => {
          activeProduct = (el.dataset.pickProd as MatzProductID) || 'matz';
          customAccentHex = el.dataset.pickHex || '#8b5cf6';
          document.documentElement.style.removeProperty('--accent');
          renderPortal();
        });
      });
    },
  },
  {
    id: 'icons-typography',
    category: '1. Overview & Foundation',
    title: 'Vector Icons & Tabular Typography',
    description:
      'Conjunto proprietário de ícones vetoriais SVG com traço geométrico de 1.75px (zero emojis) e tipografia calibrada com números tabulares (tabular-nums).',
    codeSnippet: `import { matzIcon } from '@matz/ui';

container.innerHTML = \`
  <button class="matz-btn matz-btn-primary">
    \${matzIcon('sparkles', 15)}
    <span>Executar Ação</span>
  </button>
\`;`,
    tokens: [
      ['--font-sans', 'Inter, system-ui, sans-serif', 'Tipografia principal de interface'],
      ['--font-mono', 'JetBrains Mono, Fira Code, monospace', 'Tipografia de código e telemetria'],
      ['.matz-tabular', 'font-variant-numeric: tabular-nums', 'Alinhamento numérico de precisão'],
    ],
    mountPreview: (stage) => {
      const iconList: MatzIconName[] = [
        'search', 'command', 'terminal', 'code', 'api', 'feather', 'shield', 'lock',
        'unlock', 'sparkles', 'cpu', 'activity', 'gauge', 'chart', 'layers', 'folder',
        'file', 'git-branch', 'play', 'pause', 'check', 'check-circle', 'alert', 'settings',
        'globe', 'user', 'credit-card', 'database', 'bolt', 'copy', 'sliders', 'volume',
      ];
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;width:100%;">
          ${iconList
            .map(
              (ic) => `
            <div class="matz-card" data-copy-icon="${ic}" style="padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;text-align:center;">
              <span style="color:var(--accent);">${matzIcon(ic, 20)}</span>
              <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-secondary);">${ic}</span>
            </div>`
            )
            .join('')}
        </div>
      `;
      stage.querySelectorAll<HTMLElement>('[data-copy-icon]').forEach((el) => {
        el.addEventListener('click', () => {
          const name = el.dataset.copyIcon;
          navigator.clipboard?.writeText(`matzIcon('${name}', 16)`);
          showMatzToast(`Copiado: matzIcon('${name}', 16)`);
        });
      });
    },
  },

  // ==========================================================================
  // 2. FORM & INPUTS
  // ==========================================================================
  {
    id: 'input',
    category: '2. Form & Inputs',
    title: 'Input (Text, Search & Password)',
    badge: 'Pixel-Perfect',
    description:
      'Campos de entrada de texto com superfície semântica (--surface-input), anel de foco suave (--accent-muted) e contraste WCAG AAA nos modos Dark e Light.',
    codeSnippet: `<div style="display:flex;flex-direction:column;gap:6px;">
  <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Endpoint URL</label>
  <input class="matz-input" type="url" placeholder="https://api.matz.dev/v2/..." />
</div>`,
    tokens: [
      ['.matz-input', 'height: var(--control-height); background: var(--surface-input)', 'Classe base de input'],
      ['--border-input', 'rgba(255,255,255,0.12) / #cbd5e1', 'Borda calibrada para Dark e Light mode'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;width:100%;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">E-mail Corporativo</label>
            <input class="matz-input" type="email" placeholder="marcelo@matz.dev" value="marcelo@matz.dev" />
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Chave Mestra Argon2id</label>
            <input class="matz-input" type="password" value="••••••••••••" />
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Busca com Atalho</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input class="matz-input" placeholder="Filtrar repositórios..." style="padding-right:52px;" />
              <kbd class="matz-kbd" style="position:absolute;right:8px;">⌘ K</kbd>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Estado Desabilitado (Read-Only)</label>
            <input class="matz-input" disabled value="Registro Bloqueado por Política" />
          </div>
        </div>
      `;
    },
  },
  {
    id: 'textarea',
    category: '2. Form & Inputs',
    title: 'Textarea (JSON, Markdown & Prompts)',
    badge: 'Pixel-Perfect',
    description:
      'Área de texto multi-linha para payloads JSON, Markdown, prompts de IA e headers HTTP — 100% integrada ao token --surface-input sem vazamento de fundo branco.',
    codeSnippet: `<label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Payload JSON</label>
<textarea class="matz-textarea" rows="5" placeholder='{"key": "value"}'></textarea>`,
    tokens: [['.matz-textarea', 'min-height: 84px; background: var(--surface-input)', 'Área de texto estilizada']],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;width:100%;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;">
              <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Headers HTTP (JSON)</label>
              <span class="matz-badge" style="font-size:10px;">UTF-8</span>
            </div>
            <textarea class="matz-textarea" style="font-family:var(--font-mono);height:130px;">[\n  { "key": "Accept", "value": "application/json" },\n  { "key": "X-Matz-Suite", "value": "v4.0" }\n]</textarea>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;">
              <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Prompt de Engenharia / IA</label>
              <span style="font-size:11px;color:var(--text-muted);">Markdown suportado</span>
            </div>
            <textarea class="matz-textarea" style="height:130px;">Refatore o módulo HTTP para utilizar io.LimitReader de 50 MB e validação estrita mTLS PKCS#12.</textarea>
          </div>
        </div>
      `;
    },
  },
  {
    id: 'select-combobox',
    category: '2. Form & Inputs',
    title: 'Select & Custom Combobox',
    description:
      'Inclui o componente Combobox customizado com popover flutuante, badges e indicador de seleção, além do <select class="matz-select"> nativo estilizado.',
    codeSnippet: `import { renderMatzCombobox } from '@matz/ui';

renderMatzCombobox(container, [
  { value: 'go-127', label: 'Go 1.27.3 + Wails v3.1', badge: 'Recommended' },
  { value: 'sqlite-wal', label: 'Pure-Go SQLite WAL', badge: 'Fast' },
  { value: 'argon2id', label: 'Argon2id + AES-256-GCM', badge: 'Zero-Knowledge' },
]);`,
    tokens: [
      ['.matz-combobox', 'Popover customizado de alta precisão', 'Menu flutuante com suporte a badges e check'],
      ['.matz-select', 'Select nativo com chevron SVG embutido', 'Fundo --surface-popover sem vazamento branco'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;width:100%;align-items:start;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Custom Combobox Popover</label>
            <div id="demo-combobox-host"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Native Select Estilizado</label>
            <select class="matz-select" style="width:100%;">
              <option value="powershell">PowerShell 7 (pwsh.exe)</option>
              <option value="wsl">WSL2 Ubuntu 24.04 LTS</option>
              <option value="zsh">macOS Zsh (/bin/zsh)</option>
            </select>
          </div>
        </div>
      `;
      renderMatzCombobox(
        stage.querySelector<HTMLElement>('#demo-combobox-host')!,
        [
          { value: 'go-127', label: 'Go 1.27.3 + Wails v3', badge: 'Recommended' },
          { value: 'sqlite-wal', label: 'SQLite WAL + FTS5', badge: 'Local-First' },
          { value: 'argon2id', label: 'Argon2id + AES-256-GCM', badge: 'E2EE' },
        ],
        'go-127',
        (val) => showMatzToast(`Selecionado: ${val}`)
      );
    },
  },
  {
    id: 'switch-checkbox-radio',
    category: '2. Form & Inputs',
    title: 'Switch, Checkbox & Radio Group',
    description:
      'Controles táteis de alternância (Switch), caixas de seleção vetoriais (Checkbox) e grupos de seleção exclusiva (Radio Group).',
    codeSnippet: `<div class="matz-switch active"></div>
<div class="matz-checkbox checked">\${matzIcon('check', 12)}</div>
<div class="matz-radio checked"></div>`,
    tokens: [
      ['.matz-switch.active', 'background: var(--accent)', 'Toggle switch com brilho especular'],
      ['.matz-checkbox.checked', 'background: var(--accent)', 'Checkbox vetorial'],
      ['.matz-radio.checked', 'border: 5px solid var(--accent)', 'Radio button de precisão'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;width:100%;">
          <div class="matz-card" style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:600;font-size:13px;">Criptografia Zero-Knowledge (Argon2id)</div>
              <div style="font-size:11.5px;color:var(--text-muted);">Criptografa todas as notas antes de gravar no disco</div>
            </div>
            <div class="matz-switch active" id="sw-demo-1"></div>
          </div>
          <div class="matz-card" style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" id="chk-demo-1">
              <div class="matz-checkbox checked">${matzIcon('check', 12)}</div>
              <span style="font-size:13px;font-weight:500;">Validar certificados mTLS PKCS#12 automaticamente</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;padding-top:8px;border-top:1px solid var(--border-subtle);">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;" data-radio-opt="tls13">
                <span class="matz-radio checked"></span>
                <span style="font-size:12.5px;">TLS 1.3 Strict</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;" data-radio-opt="tls12">
                <span class="matz-radio"></span>
                <span style="font-size:12.5px;">TLS 1.2 Fallback</span>
              </label>
            </div>
          </div>
        </div>
      `;
      stage.querySelector('#sw-demo-1')?.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).classList.toggle('active');
      });
      stage.querySelector('#chk-demo-1')?.addEventListener('click', (e) => {
        const box = (e.currentTarget as HTMLElement).querySelector('.matz-checkbox')!;
        box.classList.toggle('checked');
        box.innerHTML = box.classList.contains('checked') ? matzIcon('check', 12) : '';
      });
      stage.querySelectorAll<HTMLElement>('[data-radio-opt]').forEach((lbl) => {
        lbl.addEventListener('click', () => {
          stage.querySelectorAll('.matz-radio').forEach((r) => r.classList.remove('checked'));
          lbl.querySelector('.matz-radio')?.classList.add('checked');
        });
      });
    },
  },
  {
    id: 'otp-date-dropzone',
    category: '2. Form & Inputs',
    title: 'Input OTP 2FA & File Dropzone',
    badge: 'Zero-Knowledge',
    description:
      'Entrada de código TOTP de 6 dígitos com auto-avanço de foco + Zona de Upload Drag & Drop para certificados .pfx/.p12 e backups criptografados.',
    codeSnippet: `import { renderMatzOTPInput } from '@matz/ui';

renderMatzOTPInput(container, 6, (code) => {
  console.log('Código TOTP validado:', code);
});`,
    tokens: [
      ['[data-otp-idx]', '42px × 46px tabular-nums', 'Célula individual de código OTP'],
      ['.matz-dropzone', 'border: 1.5px dashed var(--border-strong)', 'Área interativa de upload'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:20px;width:100%;">
          <div class="matz-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
            <span class="matz-badge matz-badge-emerald">${matzIcon('shield', 12)} TOTP 2FA VERIFICATION</span>
            <div style="font-weight:700;font-size:14px;">Digite o código de 6 dígitos do autenticador</div>
            <div id="otp-demo-host"></div>
          </div>
          <div class="matz-dropzone" id="dz-demo">
            <div style="color:var(--accent);margin-bottom:8px;">${matzIcon('folder', 28)}</div>
            <div style="font-weight:700;font-size:14px;">Arraste certificados PKCS#12 (.pfx / .p12) ou clique aqui</div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">Processamento 100% local em memória (limite de 50 MB)</p>
          </div>
        </div>
      `;
      renderMatzOTPInput(stage.querySelector<HTMLElement>('#otp-demo-host')!, 6, (code) => {
        showMatzToast(`Código TOTP ${code} validado com sucesso!`);
      });
      stage.querySelector('#dz-demo')?.addEventListener('click', () => {
        showMatzToast('Seletor de arquivos nativo acionado!');
      });
    },
  },

  // ==========================================================================
  // 3. PRIMITIVES & LAYOUT
  // ==========================================================================
  {
    id: 'button',
    category: '3. Primitives & Layout',
    title: 'Button & Action Toolbar',
    description:
      'Botões com acabamento tátil, variantes Primary, Secondary, Ghost e Destructive, e 3 escalas de altura (sm, default, lg).',
    codeSnippet: `<button class="matz-btn matz-btn-primary">Primary Action</button>
<button class="matz-btn">Secondary</button>
<button class="matz-btn matz-btn-ghost">Ghost</button>
<button class="matz-btn matz-btn-destructive">Delete</button>`,
    tokens: [
      ['.matz-btn', 'height: var(--control-height)', 'Botão padrão adaptável à densidade'],
      ['.matz-btn-primary', 'background: var(--accent)', 'Ação principal com iluminação especular'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:18px;width:100%;">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <button class="matz-btn matz-btn-primary">${matzIcon('bolt', 14)} Primary Action</button>
            <button class="matz-btn">${matzIcon('layers', 14)} Secondary</button>
            <button class="matz-btn matz-btn-ghost">${matzIcon('settings', 14)} Ghost Button</button>
            <button class="matz-btn matz-btn-destructive">${matzIcon('trash', 14)} Destructive</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <button class="matz-btn matz-btn-sm">Small (30px)</button>
            <button class="matz-btn">Default (36px)</button>
            <button class="matz-btn matz-btn-lg matz-btn-primary">Large Studio CTA (42px)</button>
          </div>
        </div>
      `;
    },
  },
  {
    id: 'badge-kbd-callout',
    category: '3. Primitives & Layout',
    title: 'Badge, Kbd & Callout Alerts',
    description:
      'Pills semânticos para status de telemetria, indicadores de atalhos físicos <kbd> e banners de alerta contextual (Callouts).',
    codeSnippet: `<span class="matz-badge">v4.0 Studio</span>
<span class="matz-badge matz-badge-emerald">200 OK</span>
<kbd class="matz-kbd">⌘ K</kbd>
<div class="matz-callout">Mensagem de auditoria...</div>`,
    tokens: [
      ['.matz-badge-*', 'cyan | emerald | amber | rose', 'Variantes semânticas Dual-Theme'],
      ['.matz-callout', 'border-left: 3px solid var(--accent)', 'Banner de destaque contextual'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:18px;width:100%;">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <span class="matz-badge">${matzIcon('sparkles', 11)} Accent Default</span>
            <span class="matz-badge matz-badge-cyan">Cyan Telemetry</span>
            <span class="matz-badge matz-badge-emerald">200 OK · Optimal</span>
            <span class="matz-badge matz-badge-amber">Warning · 82% Load</span>
            <span class="matz-badge matz-badge-rose">503 Critical</span>
            <span style="margin-left:auto;display:flex;gap:6px;">
              <kbd class="matz-kbd">⌘</kbd><kbd class="matz-kbd">⇧</kbd><kbd class="matz-kbd">P</kbd>
            </span>
          </div>
          <div class="matz-callout">
            <span style="color:var(--accent);">${matzIcon('shield', 18)}</span>
            <div>
              <div style="font-weight:700;font-size:13px;">Isolamento Criptográfico Ativo</div>
              <div style="font-size:12px;color:var(--text-secondary);">Todas as chaves privadas permanecem exclusivamente no cofre local SQLite WAL.</div>
            </div>
          </div>
        </div>
      `;
    },
  },
  {
    id: 'accordion-tabs',
    category: '3. Primitives & Layout',
    title: 'Accordion, Collapsible & Segmented Tabs',
    description:
      'Painéis expansíveis verticais e controles segmentados de navegação para alternância rápida de contexto.',
    codeSnippet: `import { renderMatzAccordion } from '@matz/ui';

renderMatzAccordion(container, [
  { title: 'Como integrar em projetos React, Vue ou Svelte?', content: '...' },
]);`,
    tokens: [['.matz-accordion-item', 'border-bottom: 1px solid var(--border)', 'Item expansível']],
    mountPreview: (stage) => {
      const wrap = document.createElement('div');
      wrap.style.width = '100%';
      stage.appendChild(wrap);
      renderMatzAccordion(wrap, [
        {
          title: 'Como a @matz/ui suporta React, Next.js, Vue, Svelte e Vanilla TS simultaneamente?',
          content:
            'A biblioteca separa a camada óptica (CSS Custom Properties e classes semânticas) dos controladores imperativos leves, permitindo uso direto via JSX/TSX, templates Vue SFC, Svelte Runes ou HTML puro.',
        },
        {
          title: 'Posso usar Tailwind CSS ou SCSS junto com a @matz/ui?',
          content:
            'Sim! Você pode exportar o preset @theme para Tailwind CSS v4/v3 ou os mixins SCSS diretamente no painel direito do Matz UX Studio.',
        },
      ]);
    },
  },
  {
    id: 'skeleton-progress',
    category: '3. Primitives & Layout',
    title: 'Progress Bar & Skeleton Shimmer',
    description:
      'Barras de progresso com gradiente especular e placeholders animados (Skeleton Shimmer) para estados assíncronos.',
    codeSnippet: `<div class="matz-progress-track">
  <div class="matz-progress-fill" style="width: 74%;"></div>
</div>
<div class="matz-skeleton" style="width: 100%; height: 20px;"></div>`,
    tokens: [
      ['.matz-progress-fill', 'linear-gradient(90deg, var(--accent), var(--accent-secondary))', 'Barra animada'],
      ['.matz-skeleton', 'animation: matzShimmer 1.6s infinite', 'Placeholder de carregamento'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;width:100%;">
          <div class="matz-card" style="display:flex;flex-direction:column;gap:10px;justify-content:center;">
            <div style="display:flex;justify-content:space-between;font-size:12px;">
              <strong>Indexando Embeddings Locais...</strong>
              <span class="matz-tabular">74%</span>
            </div>
            <div class="matz-progress-track">
              <div class="matz-progress-fill" style="width:74%;"></div>
            </div>
          </div>
          <div class="matz-card" style="display:flex;align-items:center;gap:14px;">
            <div class="matz-skeleton" style="width:44px;height:44px;border-radius:50%;flex-shrink:0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
              <div class="matz-skeleton" style="width:65%;height:14px;"></div>
              <div class="matz-skeleton" style="width:90%;height:12px;"></div>
            </div>
          </div>
        </div>
      `;
    },
  },

  // ==========================================================================
  // 4. OVERLAYS & NAVIGATION
  // ==========================================================================
  {
    id: 'command-palette',
    category: '4. Overlays & Navigation',
    title: 'OmniCommand Palette (⌘K)',
    badge: 'Signature',
    description:
      'Motor de paleta de comandos da Matz UI com busca instantânea, navegação por teclado (↑/↓/Enter), atalhos <kbd> e feixe especular inferior.',
    codeSnippet: `import { openRaycastCommandModal, renderEmbeddedRaycastPalette } from '@matz/ui';

// Abrir como modal global (Ctrl+K / ⌘K)
openRaycastCommandModal();

// Ou renderizar inline em qualquer container
renderEmbeddedRaycastPalette(container);`,
    tokens: [['.matz-cmd-box', 'backdrop-filter: blur(32px)', 'Container flutuante OmniCommand']],
    mountPreview: (stage) => {
      const host = document.createElement('div');
      host.style.width = '100%';
      stage.appendChild(host);
      renderEmbeddedRaycastPalette(host);
    },
  },
  {
    id: 'dialog-sheet',
    category: '4. Overlays & Navigation',
    title: 'Dialog Modal & Sheet Drawer',
    description:
      'Janelas modais centralizadas (Dialog), painéis laterais deslizantes (Sheet Drawer) e notificações Toast empilháveis.',
    codeSnippet: `import { openMatzDialog, openMatzSheetDrawer, showMatzToast } from '@matz/ui';

openMatzDialog('Rotacionar Chave Argon2id', 'Descrição...', '<input class="matz-input" />');
openMatzSheetDrawer('Configurações do Endpoint', 'Inspecione headers e mTLS', '...');
showMatzToast('Operação concluída!');`,
    tokens: [
      ['openMatzDialog', 'Modal centralizado', 'Suporta confirmação e fechamento por ESC/Clique fora'],
      ['openMatzSheetDrawer', 'Drawer lateral direito', 'Ideal para inspetores e filtros avançados'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <button class="matz-btn matz-btn-primary" id="btn-open-dialog">
            ${matzIcon('layers', 14)} Abrir Dialog Modal
          </button>
          <button class="matz-btn" id="btn-open-sheet">
            ${matzIcon('sliders', 14)} Abrir Sheet Drawer Lateral
          </button>
          <button class="matz-btn" id="btn-trigger-toast">
            ${matzIcon('alert', 14)} Disparar Toast Notification
          </button>
        </div>
      `;
      stage.querySelector('#btn-open-dialog')?.addEventListener('click', () => {
        openMatzDialog(
          'Configurar Certificado mTLS PKCS#12',
          'Selecione o arquivo .pfx/.p12 e informe a senha de descriptografia local.',
          `<div style="display:flex;flex-direction:column;gap:10px;">
            <input class="matz-input" value="certificado_producao_2026.pfx" />
            <input class="matz-input" type="password" placeholder="Senha do certificado..." value="••••••••" />
          </div>`
        );
      });
      stage.querySelector('#btn-open-sheet')?.addEventListener('click', () => {
        openMatzSheetDrawer(
          'Propriedades do Workspace',
          'Ajuste limites de memória, modelos locais e sincronização E2EE.',
          `<div style="display:flex;flex-direction:column;gap:12px;">
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Modelo Local Padrão</label>
            <input class="matz-input" value="qwen2.5-coder:14b" />
            <label style="font-size:12px;font-weight:600;color:var(--text-secondary);">Notas de Auditoria</label>
            <textarea class="matz-textarea">Sincronização ativa via ~/.matz/config.yaml</textarea>
          </div>`
        );
      });
      stage.querySelector('#btn-trigger-toast')?.addEventListener('click', () => {
        showMatzToast('Notificação Toast renderizada com contraste Dual-Theme!');
      });
    },
  },

  // ==========================================================================
  // 5. DATA DISPLAY
  // ==========================================================================
  {
    id: 'data-table',
    category: '5. Data Display',
    title: 'Data Table Pro',
    badge: 'Interactive',
    description:
      'Tabela de dados executiva full-width com busca instantânea em tempo real, ordenação ascendente/descendente por coluna e células customizáveis.',
    codeSnippet: `import { renderMatzDataTable } from '@matz/ui';

renderMatzDataTable(container, 'Softwares da Suíte', columns, rows);`,
    tokens: [['.matz-table', 'width: 100%; border-collapse: collapse', 'Tabela de alta densidade']],
    mountPreview: (stage) => {
      const host = document.createElement('div');
      host.style.width = '100%';
      stage.appendChild(host);
      renderMatzDataTable(
        host,
        'Softwares & Binários do Ecossistema Matz',
        [
          { key: 'name', label: 'Software', render: (r) => `<strong>${r.name}</strong>` },
          { key: 'engine', label: 'Arquitetura' },
          { key: 'ram', label: 'RAM Idle', render: (r) => `<span class="matz-tabular">${r.ram}</span>` },
          {
            key: 'status',
            label: 'Status',
            render: (r) => `<span class="matz-badge matz-badge-emerald">${r.status}</span>`,
          },
        ],
        [
          { name: 'Heapi v2.1', engine: 'Go 1.27 + Wails v3 + matz-core/httpengine', ram: '24.2 MB', status: 'PRODUCTION' },
          { name: 'MyTerm v2.0', engine: 'Go 1.27 + Wails v3 + matz-core/terminal', ram: '19.8 MB', status: 'PRODUCTION' },
          { name: 'Writtt v2.0', engine: 'Go 1.27 + Wails v3 + matz-core/notes', ram: '21.4 MB', status: 'PRODUCTION' },
          { name: 'byCode IDE v2.0', engine: 'Go 1.27 + Wails v3 + Full Suite Embedded', ram: '42.6 MB', status: 'PRODUCTION' },
        ]
      );
    },
  },

  // ==========================================================================
  // 6. ANALYTICS & GAUGES
  // ==========================================================================
  {
    id: 'arc-gauge',
    category: '6. Analytics & Gauges',
    title: 'Radial Arc & Speedometer Gauges',
    badge: '60fps SVG',
    description:
      'Medidores radiais de 270° com 28 marcações de escala, filtro neon glow e Speedometer de 240° com agulha animada. Arraste os sliders para testar em tempo real.',
    codeSnippet: `import { renderArcGauge, renderSpeedometerGauge } from '@matz/ui';

const ctrl = renderArcGauge(container, {
  label: 'Go 1.27 Engine Load',
  value: 78,
  unit: '%',
  interactive: true,
});`,
    tokens: [
      ['--chart-tick-major', 'Marcações principais do arco', 'Adapta contraste em Dark e Light mode'],
      ['--chart-track', 'Trilha de fundo do gauge', 'Contraste calibrado'],
    ],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;width:100%;">
          <div id="pg-gauge-1"></div>
          <div id="pg-gauge-2"></div>
          <div id="pg-gauge-3"></div>
        </div>
      `;
      renderArcGauge(stage.querySelector<HTMLElement>('#pg-gauge-1')!, {
        label: 'Go 1.27 Engine Load',
        value: 76,
        unit: '%',
        interactive: true,
      });
      renderArcGauge(stage.querySelector<HTMLElement>('#pg-gauge-2')!, {
        label: 'Argon2id KDF Pool',
        value: 64,
        max: 128,
        unit: ' MB',
        color: '#10b981',
        interactive: true,
      });
      renderSpeedometerGauge(stage.querySelector<HTMLElement>('#pg-gauge-3')!, {
        label: 'mTLS P99 Latency',
        value: 14,
        max: 100,
        unit: 'ms',
        interactive: true,
      });
    },
  },
  {
    id: 'area-bar-charts',
    category: '6. Analytics & Gauges',
    title: 'Area, Bar & Donut Charts',
    badge: 'Interactive',
    description:
      'Gráficos de área suaves com crosshair interativo no mouse, gráficos de barras empilhadas e gráficos de rosca (Donut) com expansão no hover.',
    codeSnippet: `import { renderInteractiveAreaChart, renderStackedBarChart, renderRingDonutChart } from '@matz/ui';

renderInteractiveAreaChart(host, {
  title: 'Crescimento MRR & Downloads',
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  series: [{ name: 'Downloads', color: '#06b6d4', data: [1200, 1900, 2800, 3900, 5100, 6800] }],
});`,
    tokens: [['--chart-grid', 'Linhas de grade tracejadas', 'Visível em Dark e Light mode']],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
          <div id="pg-area"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div id="pg-bar"></div>
            <div id="pg-donut"></div>
          </div>
        </div>
      `;
      renderInteractiveAreaChart(stage.querySelector<HTMLElement>('#pg-area')!, {
        title: 'Crescimento do Ecossistema (Passe o mouse para inspecionar)',
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
        series: [
          { name: 'Downloads OSS', color: '#06b6d4', data: [1400, 1850, 2400, 3100, 3950, 4800, 5600, 6500, 7480] },
          { name: 'Assinantes Pro', color: '#8b5cf6', data: [400, 620, 890, 1250, 1680, 2190, 2750, 3400, 4120] },
        ],
      });
      renderStackedBarChart(stage.querySelector<HTMLElement>('#pg-bar')!, 'Requisições / Hora por Produto', [
        { label: 'Heapi', value: 840, secondaryValue: 320 },
        { label: 'MyTerm', value: 620, secondaryValue: 210 },
        { label: 'Writtt', value: 910, secondaryValue: 410 },
        { label: 'byCode', value: 1280, secondaryValue: 540 },
      ]);
      renderRingDonutChart(stage.querySelector<HTMLElement>('#pg-donut')!, 'Marketshare por SO', [
        { label: 'Windows 11', value: 4820, color: '#8b5cf6' },
        { label: 'macOS Sequoia', value: 2940, color: '#06b6d4' },
        { label: 'Linux', value: 1860, color: '#10b981' },
      ]);
    },
  },
  {
    id: 'telemetry-heatmap',
    category: '6. Analytics & Gauges',
    title: '60fps Oscilloscope & Heatmap',
    badge: 'Real-Time',
    description:
      'Stream de telemetria em tempo real renderizado a 60fps em HTML5 Canvas + Matriz de Atividade de 52 semanas e Cards KPI com Sparklines.',
    codeSnippet: `import { mountLiveTelemetryStream, renderActivityHeatmap, renderSparklineCard } from '@matz/ui';

const stop = mountLiveTelemetryStream(streamHost);
renderActivityHeatmap(heatmapHost, 'Matriz de Deploys (52 Semanas)');`,
    tokens: [['mountLiveTelemetryStream', 'Retorna função de cleanup () => void', 'Loop requestAnimationFrame 60fps']],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:18px;width:100%;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" id="pg-sparks"></div>
          <div id="pg-stream"></div>
          <div id="pg-heatmap"></div>
        </div>
      `;
      stage.querySelector('#pg-sparks')!.innerHTML = [
        renderSparklineCard({
          title: 'Receita Recorrente (MRR)',
          value: 'R$ 48.920',
          delta: '+24.8%',
          data: [22, 26, 25, 31, 35, 38, 42, 49],
          color: '#10b981',
        }),
        renderSparklineCard({
          title: 'Throughput Global',
          value: '184.390 req/m',
          delta: '+31.2%',
          data: [80, 95, 110, 108, 134, 152, 169, 184],
          color: '#06b6d4',
        }),
      ].join('');
      const stop = mountLiveTelemetryStream(stage.querySelector<HTMLElement>('#pg-stream')!);
      renderActivityHeatmap(stage.querySelector<HTMLElement>('#pg-heatmap')!, 'Matriz de Telemetria (52 Semanas)');
      return stop;
    },
  },

  // ==========================================================================
  // 7. MEDIA & AI
  // ==========================================================================
  {
    id: 'waveform-audio',
    category: '7. Media & AI',
    title: 'Audio Waveform Player (PodIA)',
    description:
      'Player de áudio interativo com 44 barras de frequência clicáveis, seletor de velocidade (1.0x a 2.0x) e estética Specular Glass.',
    codeSnippet: `import { renderMatzWaveformPlayer } from '@matz/ui';

renderMatzWaveformPlayer(container, 'PodIA #04 — A Ilusão do Vibe Coding');`,
    tokens: [['[data-bar-pct]', 'Barras de onda clicáveis', 'Iluminação especular proporcional ao progresso']],
    mountPreview: (stage) => {
      const host = document.createElement('div');
      host.style.width = '100%';
      stage.appendChild(host);
      renderMatzWaveformPlayer(host, 'PodIA #04 — A Perigosa Ilusão do Vibe Coding na Era dos Agentes');
    },
  },

  // ==========================================================================
  // 8. APPLICATION BLOCKS (TEMPLATES)
  // ==========================================================================
  {
    id: 'block-heapi-client',
    category: '8. Application Blocks',
    title: 'Heapi HTTP & mTLS Client Block',
    badge: 'Full Module',
    description:
      'Módulo completo de cliente HTTP/REST com seletor Combobox customizado para verbos HTTP (GET/POST/PUT/DELETE) e textareas de JSON/Payload com token --surface-input.',
    codeSnippet: `import { MatzApiClientModule } from '@matz/ui';

const client = new MatzApiClientModule(container, bridge);
client.mount();`,
    tokens: [
      ['.matz-textarea', 'background: var(--surface-input)', 'Zero vazamento de fundo branco'],
      ['.matz-combobox', 'Seletor customizado de método HTTP', 'Cores semânticas por método'],
    ],
    mountPreview: (stage) => {
      const card = document.createElement('div');
      card.className = 'matz-card';
      card.style.padding = '0';
      card.style.width = '100%';
      card.style.height = '440px';
      card.style.overflow = 'hidden';
      stage.appendChild(card);

      const api = new MatzApiClientModule(card, {
        executeRequest: async (method, url) => ({
          status_code: 200,
          status_text: '200 OK',
          duration: 18,
          size_bytes: 284,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(
            {
              module: 'MatzApiClientModule v4.0',
              theme: document.documentElement.getAttribute('data-theme'),
              method,
              url,
              status: 'Inputs & Textareas 100% Pixel-Perfect',
            },
            null,
            2
          ),
        }),
      });
      api.mount();
    },
  },
  {
    id: 'block-writtt-vault',
    category: '8. Application Blocks',
    title: 'Writtt Markdown & Vault Studio Block',
    badge: 'E2EE Block',
    description:
      'Estúdio completo de escrita Markdown com busca FTS5, alternância de preview em tempo real, contagem de palavras e flag de cofre criptografado Argon2id.',
    codeSnippet: `import { MatzEditorModule } from '@matz/ui';

const editor = new MatzEditorModule(container, notesBridge);
await editor.mount();`,
    tokens: [['.matz-editor-module', 'Split Sidebar + Markdown Surface', 'Layout completo de escrita']],
    mountPreview: (stage) => {
      const card = document.createElement('div');
      card.className = 'matz-card';
      card.style.padding = '0';
      card.style.width = '100%';
      card.style.height = '440px';
      card.style.overflow = 'hidden';
      stage.appendChild(card);

      const editor = new MatzEditorModule(card, {
        listDocuments: async () => [
          {
            id: 'doc-1',
            title: 'Arquitetura Dual-Theme Pixel-Perfect',
            snippet: 'Tokens semânticos Specular Obsidian & Architectural Alabaster',
            tags: ['design-system'],
            is_vault: true,
            updated_at: 'Agora',
          },
        ],
        readDocument: async () => ({
          id: 'doc-1',
          title: 'Arquitetura Dual-Theme Pixel-Perfect',
          content:
            '# @matz/ui v4.0 — Matz UX Studio\n\nTodos os componentes e blocos utilizam variáveis semânticas (`--surface-input`, `--surface-card`, `--border-input`).\n\n- **Dark Mode**: Matz Specular Obsidian (`#080a10`)\n- **Light Mode**: Matz Architectural Alabaster (`#f8fafc`)\n- **Multi-Framework**: Exemplos prontos para React, Next.js, Vue 3, Svelte 5, Tailwind CSS e Wails v3.',
          tags: ['design-system'],
          is_vault: true,
        }),
        saveDocument: async (d) => {
          showMatzToast(`Documento "${d.title}" salvo!`);
          return d.id || 'doc-1';
        },
        deleteDocument: async () => {},
      });
      void editor.mount();
    },
  },
  {
    id: 'block-workflow-prismatic',
    category: '8. Application Blocks',
    title: 'Workflow Sprint Board & Prismatic Surface',
    badge: 'Matz Signature',
    description:
      'Blocos completos de gestão de sprints/tarefas e superfície cromática de código/telemetria com identidade 100% proprietária Matz.',
    codeSnippet: `import { renderLinearWorkspaceCard, renderWarpRefractionWindow } from '@matz/ui';

renderLinearWorkspaceCard(workflowContainer);
renderWarpRefractionWindow(prismaticContainer);`,
    tokens: [['.matz-prismatic-frame', 'Prismatic Gradient Border 1.5px', 'Moldura cromática de alto impacto']],
    mountPreview: (stage) => {
      stage.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;width:100%;align-items:start;">
          <div id="blk-wf"></div>
          <div id="blk-prism"></div>
        </div>
      `;
      renderLinearWorkspaceCard(stage.querySelector<HTMLElement>('#blk-wf')!);
      renderWarpRefractionWindow(stage.querySelector<HTMLElement>('#blk-prism')!);
    },
  },
  // ==========================================================================
  // NEW DESIGN SYSTEM FAMILIES (CHIPS, NAVIGATION RAIL, STEPPER, PROGRESS, AI)
  // ==========================================================================
  {
    id: 'chips-selection-suite',
    category: '3. Primitives & Layout',
    title: 'Chips (Assist, Filter, Input & Suggestion)',
    badge: 'Design System',
    description:
      'Família completa de Chips interativos dividida nos 4 papéis semânticos do Design System: Assist Chips (ações rápidas de contexto), Filter Chips (seleção múltipla com check animado), Input Chips (entidades removíveis) e Suggestion Chips (respostas preditivas).',
    codeSnippet: `import { renderMatzChipsSuite } from '@matz/ui';

renderMatzChipsSuite(document.getElementById('chips-host')!);`,
    tokens: [
      ['--shape-sm', '8px', 'Raio padrão de Assist, Filter e Suggestion Chips'],
      ['--shape-full', '9999px', 'Raio de pílula contínua para Input Chips'],
      ['--state-selected-opacity', '0.16 (16%)', 'Camada de estado ativa em Filter Chips selecionados'],
    ],
    mountPreview: (stage) => {
      renderMatzChipsSuite(stage);
    },
  },
  {
    id: 'nav-rail-adaptive',
    category: '4. Overlays & Navigation',
    title: 'Navigation Rail & Adaptive Panes',
    badge: 'Adaptive Layout',
    description:
      'Trilho vertical compacto (80px) com expansão fluida para Navigation Drawer (240px), indicadores ativos em pílula com camada de estado 16%, emblemas numéricos tabulares e botão de ação flutuante (FAB) integrado.',
    codeSnippet: `import { renderMatzNavigationRail } from '@matz/ui';

renderMatzNavigationRail(document.getElementById('nav-rail-host')!);`,
    tokens: [
      ['width (Compact Rail)', '80px', 'Modo compacto ergonômico para janelas Desktop Wails e Tablets'],
      ['width (Expanded Drawer)', '240px', 'Modo expandido com rótulos completos e contadores'],
      ['--motion-easing-emphasized-decelerate', 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', 'Curva física de transição entre 80px e 240px'],
    ],
    mountPreview: (stage) => {
      renderMatzNavigationRail(stage);
    },
  },
  {
    id: 'stepper-breadcrumbs-pagination',
    category: '4. Overlays & Navigation',
    title: 'Stepper, Breadcrumbs & Pagination',
    badge: 'Wayfinding',
    description:
      'Componentes de orientação espacial e fluxos multi-etapas: Stepper interativo com validação de etapas concluídas, Breadcrumbs hierárquicos com colapso semântico e Paginação tabular com seletor de densidade.',
    codeSnippet: `import { renderMatzStepperAndBreadcrumbs } from '@matz/ui';

renderMatzStepperAndBreadcrumbs(document.getElementById('stepper-host')!);`,
    tokens: [
      ['aria-current="step"', 'WAI-ARIA Stepper', 'Identifica a etapa ativa para leitores de tela'],
      ['aria-current="page"', 'WAI-ARIA Breadcrumb / Pagination', 'Identifica a página atual na trilha de navegação'],
      ['.matz-tabular', 'font-variant-numeric: tabular-nums', 'Impede layout shift ao alternar páginas'],
    ],
    mountPreview: (stage) => {
      renderMatzStepperAndBreadcrumbs(stage);
    },
  },
  {
    id: 'circular-linear-timeline',
    category: '5. Data Display',
    title: 'Circular/Linear Progress & Activity Timeline',
    badge: '60fps SVG',
    description:
      'Indicadores determinísticos e indeterminados (Circular SVG Ring Progress, Linear Buffer & Segmented Bar) controlados em tempo real sem recriar DOM, combinados com Activity Timeline vertical de auditoria e eventos.',
    codeSnippet: `import { renderMatzProgressAndIndicators } from '@matz/ui';

renderMatzProgressAndIndicators(document.getElementById('progress-host')!);`,
    tokens: [
      ['stroke-dashoffset', 'Dynamic SVG Attribute', 'Atualização in-place do anel circular a 60fps'],
      ['role="progressbar"', 'aria-valuemin / aria-valuemax / aria-valuenow', 'Semântica completa para tecnologias assistivas'],
    ],
    mountPreview: (stage) => {
      renderMatzProgressAndIndicators(stage);
    },
  },
  {
    id: 'ai-agentic-suite',
    category: '9. AI & Agentic Interfaces',
    title: 'AI Prompt Composer, Reasoning Trace & MCP Cards',
    badge: 'AI-First Native',
    description:
      'Suíte de componentes nativos para aplicações baseadas em LLMs e Agentes Autônomos: Prompt Composer multimodal com anexos de contexto (@arquivo, /comando), árvore colapsável de raciocínio (Chain-of-Thought), pílulas de execução de ferramentas MCP e medidor de janela de contexto em tempo real.',
    codeSnippet: `import { renderMatzAgenticUISuite } from '@matz/ui';

renderMatzAgenticUISuite(document.getElementById('agentic-ui-host')!);`,
    tokens: [
      ['--surface-input', '#0a0d15 (Dark) / #ffffff (Light)', 'Superfície calibrada do Prompt Composer'],
      ['.matz-tabular', 'Tabular Numerals', 'Contagem de tokens, custo estimado e latência de tool calls'],
      ['MCP Tool Call Card', 'Structured JSON I/O', 'Inspeção determinística de argumentos e retorno de ferramentas'],
    ],
    mountPreview: (stage) => {
      renderMatzAgenticUISuite(stage);
    },
  },
  // ==========================================================================
  // 10. WEBSITE, BLOG, ANIMATIONS & COMPOSITE APPLICATION BLOCKS
  // ==========================================================================
  {
    id: 'animations-backgrounds-3d',
    category: '3. Primitives & Layout',
    title: 'Animations, Ambient Backgrounds & 3D Tilt',
    badge: 'GPU Kinetic',
    description:
      'Coleção de fundos ambientais animados (Aurora Prismatic Mesh, Cyber Grid 28px), anel de pulso sonar (.matz-pulse-ring), cartões com inclinação 3D em perspectiva (rotateX/rotateY), contadores cinéticos tabulares e faixa contínua Infinite Marquee.',
    codeSnippet: `import { renderMatzAnimationsAndBackgrounds } from '@matz/ui';

renderMatzAnimationsAndBackgrounds(document.getElementById('animations-host')!);`,
    tokens: [
      ['.matz-bg-aurora', 'matzAuroraDrift 11s infinite', 'Malha prismática animada acelerada por GPU'],
      ['.matz-bg-cyber-grid', 'Linear Grid 28px × 28px', 'Grade geométrica técnica para fundos de engenharia'],
      ['.matz-marquee-wrap', 'matzMarqueeScroll 24s linear', 'Faixa contínua com pausa automática no hover'],
      ['.matz-pulse-ring', 'matzRadarPulse 2s infinite', 'Indicador luminoso com onda de choque contínua'],
    ],
    mountPreview: (stage) => {
      renderMatzAnimationsAndBackgrounds(stage);
    },
  },
  {
    id: 'composite-admin-erp',
    category: '8. Application Blocks',
    title: 'Composite Admin ERP & SaaS Control Panel',
    badge: 'Full Composite',
    description:
      'Painel administrativo completo construído pela união de múltiplos componentes da @matz/ui: barra lateral de navegação, cartões KPI com Sparklines, DataTable pesquisável, gráfico Ring Donut e gaveta de inspeção SheetDrawer.',
    codeSnippet: `import { renderMatzCompositeAdminSuite } from '@matz/ui';

renderMatzCompositeAdminSuite(document.getElementById('admin-erp-root')!);`,
    tokens: [
      ['<aside> + <main> + <header>', 'Composite Admin Grid', 'Estrutura unificada de painel administrativo'],
      ['renderMatzDataTable + renderRingDonutChart', 'Composite Data View', 'Integração nativa de tabela e telemetria'],
    ],
    mountPreview: (stage) => {
      renderMatzCompositeAdminSuite(stage);
    },
  },
  {
    id: 'website-header-nav',
    category: '10. Website & Portal Blocks',
    title: 'Website Header, Mega-Navbar & Top Banner',
    badge: 'Semantic HTML5',
    description:
      'Cabeçalho semântico completo com faixa superior de anúncio dispensável, identidade visual, links de navegação com pré-visualização Mega-Menu, busca OmniCommand integrada (⌘K) e botões de conversão.',
    codeSnippet: `import { renderMatzWebsiteHeader } from '@matz/ui';

renderMatzWebsiteHeader(document.getElementById('site-header')!);`,
    tokens: [
      ['role="banner"', 'WAI-ARIA Landmark', 'Cabeçalho semântico principal do website'],
      ['role="navigation"', 'Accessible Navbar', 'Navegação estruturada para SEO e leitores de tela'],
    ],
    mountPreview: (stage) => {
      renderMatzWebsiteHeader(stage);
    },
  },
  {
    id: 'website-hero-aurora',
    category: '10. Website & Portal Blocks',
    title: 'Website Hero, Aurora Mesh & Marquee',
    badge: 'Landing Page',
    description:
      'Seção Hero de alto impacto combinando fundo animado Aurora Mesh, título com gradiente óptico sem corte de descendentes, instalador CLI copiável em 1 clique, widget de métricas ao vivo e faixa Infinite Marquee.',
    codeSnippet: `import { renderMatzWebsiteHero } from '@matz/ui';

renderMatzWebsiteHero(document.getElementById('site-hero')!);`,
    tokens: [
      ['.matz-bg-aurora', 'Animated Hero Backdrop', 'Fundo dinâmico multicamadas para Landing Pages'],
      ['.matz-cli-box', 'Copyable CLI Box', 'Caixa de comando terminal com botão de cópia integrado'],
    ],
    mountPreview: (stage) => {
      renderMatzWebsiteHero(stage);
    },
  },
  {
    id: 'website-main-article-aside',
    category: '10. Website & Portal Blocks',
    title: 'Website Editorial Blog, Article & Sidebar',
    badge: 'Blog & Bento',
    description:
      'Arquitetura semântica para o corpo do site e portais editoriais. Alterna ao vivo entre um Portal Editorial / Blog Técnico (com filtro de categorias, comentários, índice TOC lateral, autor e newsletter) e uma Bento Grid de recursos.',
    codeSnippet: `import { renderMatzWebsiteMainAndAside } from '@matz/ui';

renderMatzWebsiteMainAndAside(document.getElementById('site-main-body')!);`,
    tokens: [
      ['Editorial Content Surface', 'Main + Article', 'Corpo principal de leitura com tipografia calibrada'],
      ['Contextual Sidebar / TOC', 'Sticky Aside', 'Barra lateral semântica para índice, filtros e newsletter'],
    ],
    mountPreview: (stage) => {
      renderMatzWebsiteMainAndAside(stage);
    },
  },
  {
    id: 'website-footer-status',
    category: '10. Website & Portal Blocks',
    title: 'Website Footer, Sitemap & Live Status',
    badge: 'Semantic Footer',
    description:
      'Rodapé corporativo semântico com mapa do site multicolunas, indicador luminoso de status operacional em tempo real (99.99% Online), atalhos copiáveis e barra legal.',
    codeSnippet: `import { renderMatzWebsiteFooter } from '@matz/ui';

renderMatzWebsiteFooter(document.getElementById('site-footer')!);`,
    tokens: [
      ['role="contentinfo"', 'WAI-ARIA Footer Landmark', 'Rodapé semântico oficial para portais e websites'],
      ['.matz-pulse-ring', 'Live SLA Indicator', 'Sinalizador animado de disponibilidade do sistema'],
    ],
    mountPreview: (stage) => {
      renderMatzWebsiteFooter(stage);
    },
  },
  ...EXPANDED_CATALOG_PAGES,
];

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openRaycastCommandModal(
      DOC_PAGES.map((p) => ({
        id: p.id,
        label: `Abrir: ${p.title} (${p.category})`,
        icon: 'layers',
        shortcut: '↵',
        onSelect: () => {
          workspaceMode = 'explorer';
          activePageId = p.id;
          activeTab = 'preview';
          renderPortal();
        },
      }))
    );
  }
});

function renderPortal(): void {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  document.documentElement.setAttribute('data-product', activeProduct);
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-density', density);
  document.documentElement.setAttribute('data-vision', visionFilter);
  document.documentElement.style.setProperty('--radius-md', `${radiusMd}px`);
  document.documentElement.style.setProperty('--radius-sm', `${Math.max(2, radiusMd - 3)}px`);
  document.documentElement.style.setProperty('--radius-lg', `${radiusMd + 4}px`);

  const currentIdx = Math.max(
    0,
    DOC_PAGES.findIndex((p) => p.id === activePageId)
  );
  const page = DOC_PAGES[currentIdx] || DOC_PAGES[0];
  const prevPage = currentIdx > 0 ? DOC_PAGES[currentIdx - 1] : null;
  const nextPage = currentIdx < DOC_PAGES.length - 1 ? DOC_PAGES[currentIdx + 1] : null;

  // Ensure the active page's category is expanded
  expandedCategories.add(page.category);

  // Group pages by category for the left sidebar
  const groups = new Map<string, DocPageSpec[]>();
  for (const p of DOC_PAGES) {
    if (
      sidebarFilter &&
      !p.title.toLowerCase().includes(sidebarFilter.toLowerCase()) &&
      !p.category.toLowerCase().includes(sidebarFilter.toLowerCase())
    ) {
      continue;
    }
    if (!groups.has(p.category)) groups.set(p.category, []);
    groups.get(p.category)!.push(p);
  }

  const allCategoryNames = Array.from(new Set(DOC_PAGES.map((p) => p.category)));
  const allCategoriesExpanded = allCategoryNames.every((c) => expandedCategories.has(c));

  const generatedCode = generateMultiFrameworkSnippet(
    {
      id: page.id,
      title: page.title,
      vanillaCode: page.codeSnippet,
      tokens: page.tokens,
    },
    activeFramework,
    activeCssStack
  );

  const frameworkTabsHtml = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <div class="matz-segmented">
        ${(
          [
            { id: 'vanilla', label: 'Vanilla TS (Padrão)' },
            { id: 'wails', label: 'Go + Wails' },
            { id: 'react', label: 'React / Next.js' },
            { id: 'vue', label: 'Vue 3' },
            { id: 'svelte', label: 'Svelte 5' },
          ] as Array<{ id: FrameworkID; label: string }>
        )
          .map(
            (f) => `
          <button class="matz-segmented-btn ${activeFramework === f.id ? 'active' : ''}" data-fw-tab="${f.id}" style="padding:3px 8px;font-size:11px;">
            ${f.label}
          </button>`
          )
          .join('')}
      </div>

      <div class="matz-segmented">
        ${(
          [
            { id: 'matz-css', label: 'Matz CSS' },
            { id: 'tailwind', label: 'Tailwind' },
            { id: 'scss-modules', label: 'SCSS' },
          ] as Array<{ id: CssStackID; label: string }>
        )
          .map(
            (c) => `
          <button class="matz-segmented-btn ${activeCssStack === c.id ? 'active' : ''}" data-css-tab="${c.id}" style="padding:3px 8px;font-size:11px;">
            ${c.label}
          </button>`
          )
          .join('')}
      </div>

      <button class="matz-btn matz-btn-sm matz-btn-primary" data-copy-code-trigger="true">
        ${matzIcon('copy', 12)} Copiar (${activeFramework.toUpperCase()})
      </button>
    </div>
  `;

  const app = document.getElementById('app')!;
  app.innerHTML = `
    <!-- Full-Width Top Studio Command Bar -->
    <header class="matz-web-navbar" role="banner" style="height:58px;padding:0 20px;gap:14px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="display:flex;align-items:center;gap:9px;cursor:pointer;" id="brand-home" role="button" tabindex="0" aria-label="Voltar para a Página Principal da @matz/ui">
          <span class="matz-brand-dot" aria-hidden="true"></span>
          <strong style="font-size:15px;letter-spacing:-0.02em;">MATZ UI</strong>
        </div>
        ${formatVersionBadgeHtml()}
      </div>

      <!-- Studio Workspace Mode Switcher -->
      <nav class="matz-segmented" aria-label="Modos da Plataforma @matz/ui" style="flex-wrap:wrap;">
        <button class="matz-segmented-btn ${workspaceMode === 'home' ? 'active' : ''}" data-ws-mode="home" aria-current="${workspaceMode === 'home' ? 'page' : 'false'}">
          ${matzIcon('sparkles', 13)} Início
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'foundations' ? 'active' : ''}" data-ws-mode="foundations" aria-current="${workspaceMode === 'foundations' ? 'page' : 'false'}">
          ${matzIcon('palette', 13)} Design System (7 Pilares)
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'icons' ? 'active' : ''}" data-ws-mode="icons" aria-current="${workspaceMode === 'icons' ? 'page' : 'false'}">
          ${matzIcon('grid', 13)} Iconography (${MATZ_ICON_CATALOG.length})
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'explorer' ? 'active' : ''}" data-ws-mode="explorer" aria-current="${workspaceMode === 'explorer' ? 'page' : 'false'}">
          ${matzIcon('layers', 13)} Componentes (${DOC_PAGES.length})
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'wails' ? 'active' : ''}" data-ws-mode="wails" aria-current="${workspaceMode === 'wails' ? 'page' : 'false'}">
          ${matzIcon('cpu', 13)} Wails Bridge
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'composer' ? 'active' : ''}" data-ws-mode="composer" aria-current="${workspaceMode === 'composer' ? 'page' : 'false'}">
          ${matzIcon('sliders', 13)} Screen Composer
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'heuristics' ? 'active' : ''}" data-ws-mode="heuristics" aria-current="${workspaceMode === 'heuristics' ? 'page' : 'false'}">
          ${matzIcon('shield', 13)} WCAG Lab
        </button>
        <button class="matz-segmented-btn ${workspaceMode === 'blueprints' ? 'active' : ''}" data-ws-mode="blueprints" aria-current="${workspaceMode === 'blueprints' ? 'page' : 'false'}">
          ${matzIcon('globe', 13)} Blueprints
        </button>
      </nav>

      <!-- Right Studio Actions -->
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="matz-btn matz-btn-sm" id="top-cmd-btn" aria-label="Abrir paleta de comandos OmniCommand (Ctrl+K)" style="min-width:165px;justify-content:space-between;color:var(--text-secondary);">
          <span style="display:flex;align-items:center;gap:6px;">${matzIcon('search', 13)} OmniCommand...</span>
          <kbd class="matz-kbd">⌘ K</kbd>
        </button>
        <button class="matz-btn matz-btn-sm" id="top-theme-btn" aria-label="Alternar tema escuro ou claro" title="Alternar Tema Dark Obsidian / Light Alabaster">
          ${matzIcon(theme === 'dark' ? 'sun' : 'moon', 14)}
          <span>${theme === 'dark' ? 'Light Alabaster' : 'Dark Obsidian'}</span>
        </button>
      </div>
    </header>

    ${
      workspaceMode === 'home'
        ? `<main id="main-content" role="main" style="width:100%;"><div id="matz-home-stage-root" style="width:100%;"></div></main>`
        : `
    <!-- Full-Width (100vw) Progressive Disclosure UX Studio Layout -->
    <div class="matz-docs-layout ${!inspectorOpen ? 'inspector-collapsed' : ''}">
      <!-- LEFT PANE: Collapsible Categorized Component Navigator -->
      <aside class="matz-docs-sidebar" aria-label="Navegação de Componentes">
        <!-- Quick Design System & Icon Studio Shortcuts -->
        <div style="display:flex;flex-direction:column;gap:4px;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:4px;">
          <button class="matz-docs-nav-link ${workspaceMode === 'foundations' ? 'active' : ''}" data-ws-mode="foundations" style="padding:7px 10px;font-size:12.5px;font-weight:700;">
            <span style="display:flex;align-items:center;gap:7px;">
              ${matzIcon('palette', 13)} Design System (7 Pilares)
            </span>
            <span class="matz-badge matz-badge-cyan" style="font-size:9.5px;padding:1px 6px;">W3C</span>
          </button>
          <button class="matz-docs-nav-link ${workspaceMode === 'icons' ? 'active' : ''}" data-ws-mode="icons" style="padding:7px 10px;font-size:12.5px;font-weight:700;">
            <span style="display:flex;align-items:center;gap:7px;">
              ${matzIcon('grid', 13)} Iconography Studio
            </span>
            <span class="matz-badge matz-badge-emerald matz-tabular" style="font-size:9.5px;padding:1px 6px;">${MATZ_ICON_CATALOG.length}</span>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;padding:0 2px;">
          <input class="matz-input" id="sidebar-filter-input" aria-label="Buscar componentes na documentação" placeholder="Buscar entre ${DOC_PAGES.length} componentes..." value="${sidebarFilter.replace(/"/g, '&quot;')}" style="height:33px;font-size:12px;" />
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;">
            <span style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
              ${allCategoryNames.length} Categorias · ${DOC_PAGES.length} Itens
            </span>
            <button id="toggle-all-cats-btn" style="border:none;background:transparent;color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;padding:0;">
              ${allCategoriesExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
            </button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;">
          ${Array.from(groups.entries())
            .map(([cat, items]) => {
              const isExpanded = Boolean(sidebarFilter) || expandedCategories.has(cat);
              const hasActiveItem = workspaceMode === 'explorer' && items.some((it) => it.id === page.id);
              return `
              <div style="display:flex;flex-direction:column;gap:2px;">
                <button class="matz-sidebar-cat-btn ${isExpanded ? 'expanded' : ''}" data-cat-toggle="${cat}" aria-expanded="${isExpanded}" style="${
                  hasActiveItem ? 'color:var(--text-primary);' : ''
                }">
                  <span style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    <span class="cat-chevron" aria-hidden="true">${matzIcon('chevron-right', 11)}</span>
                    <span>${cat}</span>
                  </span>
                  <span class="matz-tabular" style="font-size:10px;padding:1px 6px;border-radius:999px;background:var(--surface-elevated);color:var(--text-muted);border:1px solid var(--border);">
                    ${items.length}
                  </span>
                </button>
                ${
                  isExpanded
                    ? `<div style="display:flex;flex-direction:column;gap:2px;padding-left:10px;border-left:1px solid var(--border);margin-left:11px;margin-top:2px;">
                        ${items
                          .map((it) => {
                            const active = workspaceMode === 'explorer' && it.id === page.id;
                            return `
                            <button class="matz-docs-nav-link ${active ? 'active' : ''}" data-nav-page="${it.id}" aria-current="${active ? 'page' : 'false'}" style="padding:6px 10px;font-size:12.5px;">
                              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${it.title}</span>
                              ${
                                active
                                  ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;" aria-hidden="true"></span>`
                                  : ''
                              }
                            </button>`;
                          })
                          .join('')}
                      </div>`
                    : ''
                }
              </div>`;
            })
            .join('')}
        </div>
      </aside>

      <!-- CENTER PANE: Clean Progressive-Disclosure Documentation & Interactive Stage -->
      <main class="matz-docs-main" id="main-content" role="main">
        ${
          workspaceMode !== 'explorer'
            ? `<div id="ux-special-view-host" style="width:100%;"></div>`
            : `
          <!-- Top Row: Breadcrumb + Right UX Inspector Drawer Toggle -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);">
              <span style="cursor:pointer;color:var(--text-secondary);" data-ws-mode="home">Início</span>
              ${matzIcon('chevron-right', 12)}
              <span>${page.category}</span>
              ${matzIcon('chevron-right', 12)}
              <span style="color:var(--text-primary);font-weight:600;">${page.title}</span>
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button class="matz-btn matz-btn-sm ${stageXray ? 'matz-btn-primary' : ''}" id="top-toggle-xray-btn" title="Ativar/Desativar Inspeção X-Ray de Box Model nos Componentes">
                ${matzIcon('eye', 13)}
                <span>${stageXray ? 'X-Ray UX: Ativo' : 'X-Ray UX'}</span>
              </button>
              <button class="matz-btn matz-btn-sm ${stageGrid ? 'matz-btn-primary' : ''}" id="top-toggle-grid-btn" title="Mostrar Grade Geométrica de 8px">
                <span># Grid 8px</span>
              </button>
              <button class="matz-btn matz-btn-sm ${inspectorOpen ? 'matz-btn-primary' : ''}" id="toggle-inspector-btn" title="Abrir/Recolher Painel Lateral de Tokens & UX Inspector">
                ${matzIcon('sliders', 13)}
                <span>${inspectorOpen ? 'Ocultar UX Inspector' : 'UX Inspector & Tokens'}</span>
              </button>
            </div>
          </div>

          <!-- Component Header & Concise Description -->
          <div style="margin-bottom:20px;max-width:920px;">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
              <h1 class="matz-heading-grad" style="font-size:28px;font-weight:800;letter-spacing:-0.03em;">${page.title}</h1>
              ${page.badge ? `<span class="matz-badge matz-badge-cyan">${page.badge}</span>` : ''}
            </div>
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.65;">
              ${page.description}
            </p>
          </div>

          <!-- UNIFIED STAGE SHELL: Single Clean Header Toolbar + Interactive Preview / Code -->
          <div class="matz-stage-shell">
            <div class="matz-stage-toolbar">
              <!-- Left: Stage View Mode -->
              <div class="matz-segmented">
                <button class="matz-segmented-btn ${activeTab === 'preview' ? 'active' : ''}" id="tab-btn-preview">
                  ${matzIcon('eye', 13)} Palco Interativo
                </button>
                <button class="matz-segmented-btn ${activeTab === 'code' ? 'active' : ''}" id="tab-btn-code">
                  ${matzIcon('code', 13)} Código Colorido (${activeFramework === 'vanilla' ? 'Vanilla TS' : activeFramework.toUpperCase()})
                </button>
                <button class="matz-segmented-btn ${activeTab === 'split' ? 'active' : ''}" id="tab-btn-split">
                  ${matzIcon('layers', 13)} Lado a Lado (Split)
                </button>
              </div>

              <!-- Right: Contextual Controls (Viewport in Preview, Framework Tabs in Code/Split) -->
              ${
                activeTab === 'preview'
                  ? `
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <div class="matz-segmented">
                      ${(['fluid', '960px', '420px'] as const)
                        .map(
                          (vp) => `
                        <button class="matz-segmented-btn ${stageViewport === vp ? 'active' : ''}" data-vp-btn="${vp}" style="padding:3px 9px;font-size:11px;">
                          ${vp === 'fluid' ? '100% Fluido' : vp === '960px' ? 'Tablet (960px)' : 'Mobile (420px)'}
                        </button>`
                        )
                        .join('')}
                    </div>
                    <button class="matz-btn matz-btn-sm ${stageGrid ? 'matz-btn-primary' : ''}" id="toggle-grid-btn" title="Mostrar Grade 8px">
                      # Grid 8px
                    </button>
                    <button class="matz-btn matz-btn-sm ${stageXray ? 'matz-btn-primary' : ''}" id="toggle-xray-btn" title="Inspecionar Box Model (X-Ray)">
                      ${matzIcon('eye', 12)} X-Ray
                    </button>
                  </div>`
                  : frameworkTabsHtml
              }
            </div>

            <!-- Live X-Ray Telemetry HUD (Visible when X-Ray is enabled) -->
            ${
              stageXray
                ? `<div class="matz-xray-hud" id="doc-xray-hud">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span class="matz-badge matz-badge-cyan" style="font-size:10px;">X-RAY BOX MODEL ATIVO</span>
                      <span id="doc-xray-target-lbl">Passe o cursor sobre qualquer elemento do componente abaixo para inspecionar tag, classe, dimensões e padding.</span>
                    </div>
                    <span style="color:var(--accent);font-size:11px;">Outline Ciano = Árvore DOM · Magenta = Hover</span>
                  </div>`
                : ''
            }

            <!-- Stage Body -->
            <div style="padding:24px;">
              ${
                activeTab === 'preview'
                  ? `<div class="matz-preview-stage ${stageGrid ? 'matz-stage-grid' : ''} ${stageXray ? 'matz-stage-xray' : ''}" id="doc-preview-stage" style="margin:0;border:none;padding:12px;${
                      stageGrid ? '' : 'background:transparent;'
                    }box-shadow:none;max-width:${
                      stageViewport === 'fluid' ? '100%' : stageViewport
                    };margin-inline:auto;"></div>`
                  : activeTab === 'split'
                  ? `<div style="display:grid;grid-template-columns:minmax(0, 1.15fr) minmax(0, 0.85fr);gap:20px;align-items:start;width:100%;">
                      <div class="matz-preview-stage ${stageGrid ? 'matz-stage-grid' : ''} ${stageXray ? 'matz-stage-xray' : ''}" id="doc-preview-stage" style="margin:0;"></div>
                      <div class="matz-code-block" style="margin:0;max-height:560px;overflow:auto;">${highlightMatzCode(
                        generatedCode,
                        `${activeFramework === 'vanilla' ? 'Vanilla TypeScript (Padrão)' : activeFramework.toUpperCase()} · ${activeCssStack}`
                      )}</div>
                    </div>`
                  : `<div class="matz-code-block" style="margin:0;">${highlightMatzCode(
                      generatedCode,
                      `${activeFramework === 'vanilla' ? 'Vanilla TypeScript (Padrão)' : activeFramework.toUpperCase()} · ${activeCssStack}`
                    )}</div>`
              }
            </div>
          </div>

          <!-- PROGRESSIVE DISCLOSURE DRAWER 1: Collapsible Implementation Code (When in Preview Mode) -->
          ${
            activeTab === 'preview'
              ? `
              <div class="matz-collapsible-section">
                <button class="matz-collapsible-trigger" id="toggle-code-drawer-btn">
                  <div style="display:flex;align-items:center;gap:10px;">
                    ${matzIcon('code', 15)}
                    <span style="font-weight:700;font-size:13.5px;">Código de Implementação & Adaptadores Multi-Framework</span>
                    <span class="matz-badge matz-badge-cyan" style="font-size:10px;">
                      ${activeFramework === 'vanilla' ? 'Vanilla TS (Padrão)' : activeFramework.toUpperCase()} · ${activeCssStack}
                    </span>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-size:12px;">
                    <span>${codeDrawerOpen ? 'Recolher código' : 'Expandir código'}</span>
                    <span style="display:inline-flex;transform:rotate(${codeDrawerOpen ? '90deg' : '0deg'});transition:transform 0.18s ease;">
                      ${matzIcon('chevron-right', 13)}
                    </span>
                  </div>
                </button>
                ${
                  codeDrawerOpen
                    ? `<div class="matz-collapsible-body" style="display:flex;flex-direction:column;gap:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                          <span style="font-size:12px;color:var(--text-secondary);">
                            Selecione o framework ou biblioteca CSS (Vanilla TypeScript é sempre o padrão oficial):
                          </span>
                          ${frameworkTabsHtml}
                        </div>
                        <div class="matz-code-block" style="margin:0;">${highlightMatzCode(
                          generatedCode,
                          `${activeFramework === 'vanilla' ? 'Vanilla TypeScript (Padrão)' : activeFramework.toUpperCase()} · ${activeCssStack}`
                        )}</div>
                      </div>`
                    : ''
                }
              </div>`
              : ''
          }

          <!-- PROGRESSIVE DISCLOSURE DRAWER 2: Component Anatomy, Interactive State Layers & Keyboard/WAI-ARIA Map -->
          <div class="matz-collapsible-section" id="sec-anatomy">
            <button class="matz-collapsible-trigger" id="toggle-anatomy-drawer-btn">
              <div style="display:flex;align-items:center;gap:10px;">
                ${matzIcon('sliders', 15)}
                <span style="font-weight:700;font-size:13.5px;">Anatomia, Camadas de Estado (Hover/Focus/Pressed) & Mapa de Teclado WAI-ARIA</span>
                <span class="matz-badge matz-badge-emerald" style="font-size:10px;">WCAG 2.1 AAA</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-size:12px;">
                <span>${anatomyDrawerOpen ? 'Recolher anatomia' : 'Expandir anatomia & estados'}</span>
                <span style="display:inline-flex;transform:rotate(${anatomyDrawerOpen ? '90deg' : '0deg'});transition:transform 0.18s ease;">
                  ${matzIcon('chevron-right', 13)}
                </span>
              </div>
            </button>
            ${
              anatomyDrawerOpen
                ? `<div class="matz-collapsible-body" style="display:flex;flex-direction:column;gap:16px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;">
                      <div class="matz-card" style="padding:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                          <strong style="font-size:12.5px;">1. Superfície & Elevação</strong>
                          <span class="matz-badge" style="font-size:10px;">1px Specular</span>
                        </div>
                        <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                          Contêiner estruturado sobre <code>var(--surface-card)</code> ou <code>var(--surface-input)</code> com feixe especular superior de 1px e raio governado por <code>var(--radius-md)</code>.
                        </p>
                      </div>
                      <div class="matz-card" style="padding:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                          <strong style="font-size:12.5px;">2. State Layers (Opacidade)</strong>
                          <span class="matz-badge matz-badge-cyan" style="font-size:10px;">8% · 10% · 12%</span>
                        </div>
                        <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                          Hover aplica <code>+8%</code> de película cromática; Focus-Visible aplica <code>+10%</code> + anel <code>2px</code>; Pressed aplica <code>+12%</code>; Disabled reduz opacidade para <code>38%</code>.
                        </p>
                      </div>
                      <div class="matz-card" style="padding:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                          <strong style="font-size:12.5px;">3. Navegação por Teclado</strong>
                          <span class="matz-badge matz-badge-emerald" style="font-size:10px;">WAI-ARIA 1.2</span>
                        </div>
                        <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                          Suporte integral a <kbd class="matz-kbd">Tab</kbd>, <kbd class="matz-kbd">Shift+Tab</kbd>, <kbd class="matz-kbd">Enter</kbd>, <kbd class="matz-kbd">Space</kbd>, <kbd class="matz-kbd">Esc</kbd> e teclas direcionais (<kbd class="matz-kbd">↑</kbd> <kbd class="matz-kbd">↓</kbd> <kbd class="matz-kbd">←</kbd> <kbd class="matz-kbd">→</kbd>).
                        </p>
                      </div>
                    </div>
                  </div>`
                : ''
            }
          </div>

          <!-- PROGRESSIVE DISCLOSURE DRAWER 3: UX Do's & Don'ts -->
          <div class="matz-collapsible-section" id="sec-dosdonts">
            <button class="matz-collapsible-trigger" id="toggle-dosdonts-drawer-btn">
              <div style="display:flex;align-items:center;gap:10px;">
                ${matzIcon('shield-check', 15)}
                <span style="font-weight:700;font-size:13.5px;">Boas Práticas de UX & Engenharia: Do's & Don'ts</span>
                <span class="matz-badge" style="font-size:10px;">Diretrizes Oficiais</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-size:12px;">
                <span>${dosDontsDrawerOpen ? 'Recolher diretrizes' : 'Expandir Do\'s & Don\'ts'}</span>
                <span style="display:inline-flex;transform:rotate(${dosDontsDrawerOpen ? '90deg' : '0deg'});transition:transform 0.18s ease;">
                  ${matzIcon('chevron-right', 13)}
                </span>
              </div>
            </button>
            ${
              dosDontsDrawerOpen
                ? `<div class="matz-collapsible-body">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;">
                      <div style="padding:16px;border-radius:var(--radius-md);border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;align-items:center;gap:8px;color:#10b981;font-weight:800;font-size:13px;">
                          ${matzIcon('check-circle', 15)} RECOMENDADO (DO)
                        </div>
                        <ul style="margin:0;padding-left:18px;font-size:12.5px;color:var(--text-secondary);line-height:1.65;display:flex;flex-direction:column;gap:4px;">
                          <li>Utilize sempre tokens semânticos (<code>var(--surface-input)</code>, <code>var(--surface-card)</code>, <code>var(--accent)</code>) para garantir paridade automática entre Dark Obsidian e Light Alabaster.</li>
                          <li>Aplique a classe <code>.matz-tabular</code> em contadores, badges numéricos e telemetria para manter <code>CLS = 0.00</code>.</li>
                          <li>Preserve rótulos explícitos ou <code>aria-label</code> em botões somente com ícone.</li>
                        </ul>
                      </div>

                      <div style="padding:16px;border-radius:var(--radius-md);border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;align-items:center;gap:8px;color:#ef4444;font-weight:800;font-size:13px;">
                          ${matzIcon('alert-triangle', 15)} EVITE (DON'T)
                        </div>
                        <ul style="margin:0;padding-left:18px;font-size:12.5px;color:var(--text-secondary);line-height:1.65;display:flex;flex-direction:column;gap:4px;">
                          <li>Nunca defina cores hexadecimais estáticas (como <code>#ffffff</code> ou <code>#000000</code>) diretamente em inputs ou cartões.</li>
                          <li>Evite recriar árvores DOM inteiras em loops de alta frequência; atualize atributos SVG in-place como nos Gauges da <code>@matz/ui</code>.</li>
                          <li>Não empilhe múltiplos modais simultâneos; prefira <code>openMatzSheetDrawer</code> para inspeção contextual.</li>
                        </ul>
                      </div>
                    </div>
                  </div>`
                : ''
            }
          </div>

          <!-- PROGRESSIVE DISCLOSURE DRAWER 4: Collapsible Technical Spec, Classes & Design Tokens -->
          <div class="matz-collapsible-section" id="sec-tokens">
            <button class="matz-collapsible-trigger" id="toggle-tokens-drawer-btn">
              <div style="display:flex;align-items:center;gap:10px;">
                ${matzIcon('layers', 15)}
                <span style="font-weight:700;font-size:13.5px;">Especificação Técnica, Classes CSS & Design Tokens</span>
                <span class="matz-badge" style="font-size:10px;">${page.tokens.length} especificações</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-size:12px;">
                <span>${tokensDrawerOpen ? 'Recolher tabela' : 'Expandir especificações'}</span>
                <span style="display:inline-flex;transform:rotate(${tokensDrawerOpen ? '90deg' : '0deg'});transition:transform 0.18s ease;">
                  ${matzIcon('chevron-right', 13)}
                </span>
              </div>
            </button>
            ${
              tokensDrawerOpen
                ? `<div class="matz-collapsible-body">
                    <div class="matz-table-wrap">
                      <table class="matz-table">
                        <thead>
                          <tr>
                            <th>Token / Seletor</th>
                            <th>Especificação</th>
                            <th>Função na Arquitetura</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${page.tokens
                            .map(
                              ([tok, val, desc]) => `
                            <tr>
                              <td><code style="font-family:var(--font-mono);color:var(--accent);font-weight:600;">${tok}</code></td>
                              <td><code style="font-family:var(--font-mono);font-size:11.5px;">${val}</code></td>
                              <td>${desc}</td>
                            </tr>`
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>`
                : ''
            }
          </div>

          <!-- Prev / Next Component Footer -->
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:16px;">
            ${
              prevPage
                ? `<button class="matz-btn" data-nav-page="${prevPage.id}">← ${prevPage.title}</button>`
                : `<span></span>`
            }
            ${
              nextPage
                ? `<button class="matz-btn matz-btn-primary" data-nav-page="${nextPage.id}">${nextPage.title} →</button>`
                : `<span></span>`
            }
          </div>
        `
        }
      </main>

      <!-- RIGHT PANE: Collapsible UX Inspector & Live Token Controller Drawer -->
      <aside class="matz-docs-toc">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border);">
          <span style="font-weight:800;color:var(--text-primary);text-transform:uppercase;font-size:11px;letter-spacing:0.06em;display:flex;align-items:center;gap:6px;">
            ${matzIcon('sliders', 12)} UX Inspector & Tokens
          </span>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="matz-badge matz-badge-emerald" style="font-size:9.5px;">LIVE</span>
            <button class="matz-btn matz-btn-sm" id="close-inspector-btn" style="padding:2px 7px;font-size:11px;" title="Recolher UX Inspector">✕</button>
          </div>
        </div>

        <!-- Collapsible Inspector Card 1: Product Accent & Custom Color -->
        <div class="matz-collapsible-section" style="margin-top:0;">
          <button class="matz-collapsible-trigger" data-insp-sec="palette" style="padding:10px 12px;">
            <span style="font-weight:700;font-size:12px;">1. Paleta de Acento & Identidade</span>
            <span style="display:inline-flex;transform:rotate(${inspectorSecOpen.palette ? '90deg' : '0deg'});">
              ${matzIcon('chevron-right', 12)}
            </span>
          </button>
          ${
            inspectorSecOpen.palette
              ? `<div class="matz-collapsible-body" style="padding:12px;display:flex;flex-direction:column;gap:10px;">
                  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${(
                      [
                        { id: 'matz', hex: '#8b5cf6', label: 'Violet' },
                        { id: 'heapi', hex: '#d946ef', label: 'Fuchsia' },
                        { id: 'myterm', hex: '#10b981', label: 'Emerald' },
                        { id: 'bycode', hex: '#3b82f6', label: 'Blue' },
                        { id: 'writtt', hex: '#f59e0b', label: 'Amber' },
                      ] as Array<{ id: MatzProductID; hex: string; label: string }>
                    )
                      .map(
                        (p) => `
                      <button data-prod-btn="${p.id}" data-prod-hex="${p.hex}" title="${p.label}" style="height:28px;border-radius:6px;border:${
                          activeProduct === p.id ? '2px solid var(--text-primary)' : '1px solid var(--border)'
                        };background:${p.hex};cursor:pointer;"></button>`
                      )
                      .join('')}
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <span style="font-size:11.5px;color:var(--text-secondary);">Cor Customizada:</span>
                    <input type="color" id="ux-custom-accent" value="${customAccentHex}" style="width:36px;height:26px;border:none;background:transparent;cursor:pointer;" />
                  </div>
                </div>`
              : ''
          }
        </div>

        <!-- Collapsible Inspector Card 2: Geometry & Ergonomic Density -->
        <div class="matz-collapsible-section" style="margin-top:0;">
          <button class="matz-collapsible-trigger" data-insp-sec="geometry" style="padding:10px 12px;">
            <span style="font-weight:700;font-size:12px;">2. Geometria & Densidade</span>
            <span style="display:inline-flex;transform:rotate(${inspectorSecOpen.geometry ? '90deg' : '0deg'});">
              ${matzIcon('chevron-right', 12)}
            </span>
          </button>
          ${
            inspectorSecOpen.geometry
              ? `<div class="matz-collapsible-body" style="padding:12px;display:flex;flex-direction:column;gap:12px;">
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-secondary);margin-bottom:4px;">
                      <span>Border Radius (--radius-md)</span>
                      <strong class="matz-tabular" id="ux-radius-lbl">${radiusMd}px</strong>
                    </div>
                    <input type="range" id="ux-radius-slider" min="0" max="20" step="1" value="${radiusMd}" style="width:100%;accent-color:var(--accent);cursor:pointer;" />
                  </div>

                  <div>
                    <div style="font-size:11.5px;color:var(--text-secondary);margin-bottom:6px;">Densidade de Controles</div>
                    <div class="matz-segmented" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);">
                      ${(['compact', 'default', 'spacious'] as const)
                        .map(
                          (d) => `
                        <button class="matz-segmented-btn ${density === d ? 'active' : ''}" data-density-btn="${d}" style="justify-content:center;padding:4px;">
                          ${d === 'compact' ? 'Compact' : d === 'default' ? 'Default' : 'Spacious'}
                        </button>`
                        )
                        .join('')}
                    </div>
                  </div>
                </div>`
              : ''
          }
        </div>

        <!-- Collapsible Inspector Card 3: Accessibility & Vision Simulator -->
        <div class="matz-collapsible-section" style="margin-top:0;">
          <button class="matz-collapsible-trigger" data-insp-sec="wcag" style="padding:10px 12px;">
            <span style="font-weight:700;font-size:12px;">3. Simulador Visual & WCAG</span>
            <span class="matz-badge matz-badge-emerald" style="font-size:9.5px;">${theme === 'dark' ? '15.8:1 AAA' : '16.4:1 AAA'}</span>
          </button>
          ${
            inspectorSecOpen.wcag
              ? `<div class="matz-collapsible-body" style="padding:12px;display:flex;flex-direction:column;gap:10px;">
                  <select class="matz-select" id="ux-vision-select" style="width:100%;font-size:12px;">
                    <option value="normal" ${visionFilter === 'normal' ? 'selected' : ''}>Visão Padrão (Tricromata)</option>
                    <option value="protanopia" ${visionFilter === 'protanopia' ? 'selected' : ''}>Protanopia (Deficiência Vermelho)</option>
                    <option value="deuteranopia" ${visionFilter === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Deficiência Verde)</option>
                    <option value="tritanopia" ${visionFilter === 'tritanopia' ? 'selected' : ''}>Tritanopia (Deficiência Azul)</option>
                    <option value="achromatopsia" ${visionFilter === 'achromatopsia' ? 'selected' : ''}>Acromatopsia (Monocromático)</option>
                  </select>
                  <div style="font-size:11px;color:var(--text-muted);line-height:1.45;">
                    Valida se badges, gráficos e alertas mantêm distinção sem depender exclusivamente de matiz.
                  </div>
                </div>`
              : ''
          }
        </div>

        <!-- Collapsible Inspector Card 4: Export Theme Config (CSS / Tailwind / SCSS) -->
        <div class="matz-collapsible-section" style="margin-top:0;">
          <button class="matz-collapsible-trigger" data-insp-sec="export" style="padding:10px 12px;">
            <span style="font-weight:700;font-size:12px;">4. Exportar Tokens (${activeCssStack})</span>
            <span style="display:inline-flex;transform:rotate(${inspectorSecOpen.export ? '90deg' : '0deg'});">
              ${matzIcon('chevron-right', 12)}
            </span>
          </button>
          ${
            inspectorSecOpen.export
              ? `<div class="matz-collapsible-body" style="padding:12px;display:flex;flex-direction:column;gap:10px;">
                  <div class="matz-code-block" id="ux-token-export-box" style="max-height:175px;overflow:auto;margin:0;">${highlightMatzCode(
                    generateCssConfigExport(activeCssStack, customAccentHex, radiusMd),
                    activeCssStack
                  )}</div>
                  <button class="matz-btn matz-btn-sm matz-btn-primary" id="ux-export-tokens-btn" style="width:100%;">
                    ${matzIcon('copy', 12)} Copiar Configuração de Tema
                  </button>
                </div>`
              : ''
          }
        </div>
      </aside>
    </div>`
    }
  `;

  // Mount active view content
  if (workspaceMode === 'home') {
    const homeHost = app.querySelector<HTMLElement>('#matz-home-stage-root');
    if (homeHost) {
      activeCleanup = mountMatzHomeView(homeHost, {
        onNavigateMode: (mode, pageId) => {
          workspaceMode = mode;
          if (pageId) activePageId = pageId;
          renderPortal();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onSelectProduct: (prod) => {
          activeProduct = prod;
          document.documentElement.style.removeProperty('--accent');
          renderPortal();
        },
        onToggleTheme: () => {
          theme = theme === 'dark' ? 'light' : 'dark';
          renderPortal();
        },
        getCurrentTheme: () => theme,
        getCurrentProduct: () => activeProduct,
      });
    }
  } else if (workspaceMode === 'foundations') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) {
      const cleanup = mountMatzDesignSystemFoundations(host);
      if (typeof cleanup === 'function') activeCleanup = cleanup;
    }
  } else if (workspaceMode === 'icons') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) {
      const cleanup = mountMatzIconStudio(host);
      if (typeof cleanup === 'function') activeCleanup = cleanup;
    }
  } else if (workspaceMode === 'wails') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) mountWailsNativeStudio(host);
  } else if (workspaceMode === 'composer') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) mountUXScreenComposer(host);
  } else if (workspaceMode === 'heuristics') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) mountUXHeuristicsLab(host);
  } else if (workspaceMode === 'blueprints') {
    const host = app.querySelector<HTMLElement>('#ux-special-view-host');
    if (host) activeCleanup = mountFullScreenBlueprints(host);
  } else if (activeTab === 'preview' || activeTab === 'split') {
    const stage = app.querySelector<HTMLElement>('#doc-preview-stage');
    if (stage) {
      const cleanup = page.mountPreview(stage);
      if (typeof cleanup === 'function') {
        activeCleanup = cleanup;
      }
    }
  }

  // Event Listeners
  app.querySelector('#brand-home')?.addEventListener('click', () => {
    workspaceMode = 'home';
    renderPortal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  app.querySelector('#matz-version-trigger')?.addEventListener('click', () => {
    openMatzVersionModal();
  });

  app.querySelectorAll<HTMLElement>('[data-ws-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      workspaceMode = (btn.dataset.wsMode as StudioWorkspaceMode) || 'home';
      renderPortal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Sidebar Category Collapse / Expand Listeners
  app.querySelectorAll<HTMLButtonElement>('[data-cat-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.catToggle;
      if (!cat) return;
      if (expandedCategories.has(cat)) {
        expandedCategories.delete(cat);
      } else {
        expandedCategories.add(cat);
      }
      renderPortal();
    });
  });

  app.querySelector('#toggle-all-cats-btn')?.addEventListener('click', () => {
    if (allCategoriesExpanded) {
      expandedCategories.clear();
      expandedCategories.add(page.category);
    } else {
      allCategoryNames.forEach((c) => expandedCategories.add(c));
    }
    renderPortal();
  });

  // Right UX Inspector Drawer Toggle & Section Collapses
  app.querySelector('#toggle-inspector-btn')?.addEventListener('click', () => {
    inspectorOpen = !inspectorOpen;
    renderPortal();
  });

  app.querySelector('#close-inspector-btn')?.addEventListener('click', () => {
    inspectorOpen = false;
    renderPortal();
  });

  app.querySelectorAll<HTMLButtonElement>('[data-insp-sec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sec = btn.dataset.inspSec;
      if (sec) {
        inspectorSecOpen[sec] = !inspectorSecOpen[sec];
        renderPortal();
      }
    });
  });

  // Center Progressive Disclosure Drawers (Code, Anatomy, Do's & Don'ts, Tokens)
  app.querySelector('#toggle-code-drawer-btn')?.addEventListener('click', () => {
    codeDrawerOpen = !codeDrawerOpen;
    renderPortal();
  });

  app.querySelector('#toggle-anatomy-drawer-btn')?.addEventListener('click', () => {
    anatomyDrawerOpen = !anatomyDrawerOpen;
    renderPortal();
  });

  app.querySelector('#toggle-dosdonts-drawer-btn')?.addEventListener('click', () => {
    dosDontsDrawerOpen = !dosDontsDrawerOpen;
    renderPortal();
  });

  app.querySelector('#toggle-tokens-drawer-btn')?.addEventListener('click', () => {
    tokensDrawerOpen = !tokensDrawerOpen;
    renderPortal();
  });

  app.querySelectorAll<HTMLButtonElement>('[data-prod-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeProduct = (btn.dataset.prodBtn as MatzProductID) || 'matz';
      customAccentHex = btn.dataset.prodHex || '#8b5cf6';
      document.documentElement.style.removeProperty('--accent');
      renderPortal();
    });
  });

  app.querySelector<HTMLInputElement>('#ux-custom-accent')?.addEventListener('input', (e) => {
    customAccentHex = (e.target as HTMLInputElement).value;
    document.documentElement.style.setProperty('--accent', customAccentHex);
  });

  app.querySelector<HTMLInputElement>('#ux-radius-slider')?.addEventListener('input', (e) => {
    radiusMd = Number((e.target as HTMLInputElement).value);
    document.documentElement.style.setProperty('--radius-md', `${radiusMd}px`);
    document.documentElement.style.setProperty('--radius-sm', `${Math.max(2, radiusMd - 3)}px`);
    document.documentElement.style.setProperty('--radius-lg', `${radiusMd + 4}px`);
    const lbl = app.querySelector<HTMLElement>('#ux-radius-lbl');
    if (lbl) lbl.textContent = `${radiusMd}px`;
    const expBox = app.querySelector<HTMLElement>('#ux-token-export-box');
    if (expBox) {
      expBox.innerHTML = highlightMatzCode(
        generateCssConfigExport(activeCssStack, customAccentHex, radiusMd),
        activeCssStack
      );
    }
  });

  app.querySelectorAll<HTMLButtonElement>('[data-density-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      density = (btn.dataset.densityBtn as typeof density) || 'default';
      renderPortal();
    });
  });

  app.querySelector<HTMLSelectElement>('#ux-vision-select')?.addEventListener('change', (e) => {
    visionFilter = (e.target as HTMLSelectElement).value as typeof visionFilter;
    renderPortal();
  });

  app.querySelector('#ux-export-tokens-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(generateCssConfigExport(activeCssStack, customAccentHex, radiusMd));
    showMatzToast(`Tokens (${activeCssStack}) copiados para a área de transferência!`);
  });

  app.querySelector('#top-cmd-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  });

  app.querySelector('#top-theme-btn')?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    renderPortal();
  });

  app.querySelectorAll<HTMLElement>('[data-nav-page]').forEach((el) => {
    el.addEventListener('click', () => {
      workspaceMode = 'explorer';
      activePageId = el.dataset.navPage || 'introduction';
      renderPortal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-vp-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      stageViewport = (btn.dataset.vpBtn as typeof stageViewport) || 'fluid';
      renderPortal();
    });
  });

  const toggleGrid = () => {
    stageGrid = !stageGrid;
    renderPortal();
  };
  app.querySelector('#toggle-grid-btn')?.addEventListener('click', toggleGrid);
  app.querySelector('#top-toggle-grid-btn')?.addEventListener('click', toggleGrid);

  const toggleXray = () => {
    stageXray = !stageXray;
    renderPortal();
  };
  app.querySelector('#toggle-xray-btn')?.addEventListener('click', toggleXray);
  app.querySelector('#top-toggle-xray-btn')?.addEventListener('click', toggleXray);

  const docStage = app.querySelector<HTMLElement>('#doc-preview-stage');
  docStage?.addEventListener('mouseover', (e) => {
    if (!stageXray) return;
    const el = e.target as HTMLElement | null;
    if (!el || el === docStage) return;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const cls =
      el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
    const lbl = app.querySelector<HTMLElement>('#doc-xray-target-lbl');
    if (lbl) {
      lbl.innerHTML = `Elemento: <strong style="color:#22d3ee;">&lt;${tag}${cls}&gt;</strong> · Dimensões: <strong style="color:#f472b6;">${Math.round(
        rect.width
      )}px × ${Math.round(rect.height)}px</strong> · Padding: <code>${cs.padding}</code> · Radius: <code>${
        cs.borderRadius
      }</code>`;
    }
  });

  app.querySelector('#tab-btn-preview')?.addEventListener('click', () => {
    activeTab = 'preview';
    renderPortal();
  });

  app.querySelector('#tab-btn-split')?.addEventListener('click', () => {
    activeTab = 'split';
    // Automatically collapse right inspector in Split mode so the 2 columns have maximum breathing room
    inspectorOpen = false;
    renderPortal();
  });

  app.querySelector('#tab-btn-code')?.addEventListener('click', () => {
    activeTab = 'code';
    renderPortal();
  });

  app.querySelectorAll<HTMLButtonElement>('[data-fw-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFramework = (btn.dataset.fwTab as FrameworkID) || 'vanilla';
      renderPortal();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-css-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCssStack = (btn.dataset.cssTab as CssStackID) || 'matz-css';
      renderPortal();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-copy-code-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(generatedCode);
      showMatzToast(`Código ${activeFramework.toUpperCase()} (${activeCssStack}) copiado!`);
    });
  });

  const filterInput = app.querySelector<HTMLInputElement>('#sidebar-filter-input');
  filterInput?.addEventListener('input', () => {
    sidebarFilter = filterInput.value;
    renderPortal();
    const nextInput = document.querySelector<HTMLInputElement>('#sidebar-filter-input');
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(sidebarFilter.length, sidebarFilter.length);
    }
  });

  enableMatzSpotlight();
}

renderPortal();
