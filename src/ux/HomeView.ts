import { matzIcon } from '../icons/Icons';
import { MatzProductID, showMatzToast } from '../primitives/TitleBar';
import {
  renderArcGauge,
  renderSpeedometerGauge,
  renderInteractiveAreaChart,
  renderSparklineCard,
  mountLiveTelemetryStream,
} from '../analytics/ChartsAndGauges';
import {
  renderLinearWorkspaceCard,
  renderEmbeddedRaycastPalette,
  renderWarpRefractionWindow,
  renderMatzWaveformPlayer,
  renderMatzCombobox,
  renderMatzOTPInput,
} from '../components/RichComponents';
import {
  renderMatzWebsiteHeader,
  renderMatzWebsiteHero,
  renderMatzCompleteWebsiteShowcase,
  renderMatzWebsiteMainAndAside,
  renderMatzWebsiteFooter,
  renderMatzAnimationsAndBackgrounds,
  renderMatzCompositeAdminSuite,
  renderMatzEcommerceSuite,
  renderMatzKanbanWorkspace,
} from '../components/WebsiteAndLayoutComponents';
import { renderMatzAgenticUISuite } from '../components/DesignSystemComponents';
import { MatzApiClientModule } from '../modules/ApiClientModule';
import { MatzEditorModule } from '../modules/EditorModule';
import {
  FrameworkID,
  CssStackID,
  generateMultiFrameworkSnippet,
  highlightMatzCode,
} from './MultiFrameworkCode';
import { MATZ_UI_VERSION, openMatzVersionModal } from '../version/VersionSystem';

export interface HomeViewCallbacks {
  onNavigateMode: (
    mode: 'foundations' | 'icons' | 'explorer' | 'wails' | 'composer' | 'heuristics' | 'blueprints',
    pageId?: string
  ) => void;
  onSelectProduct: (prod: MatzProductID) => void;
  onToggleTheme: () => void;
  getCurrentTheme: () => 'dark' | 'light';
  getCurrentProduct: () => MatzProductID;
}

type CliMethodID = 'npx' | 'npm' | 'pnpm' | 'bun' | 'wails' | 'cdn';
type AiContextTabID = 'agents-md' | 'llms-txt' | 'mcp-config' | 'prompt-template';
type PlaygroundTabID =
  | 'website'
  | 'blog'
  | 'admin'
  | 'ecommerce'
  | 'kanban'
  | 'telemetry'
  | 'animations'
  | 'ai-forms';

const CLI_COMMANDS: Record<CliMethodID, { label: string; cmd: string; note: string }> = {
  npx: {
    label: 'CLI Init (Recomendado)',
    cmd: 'npx @matz/ui@beta init',
    note: 'Detecta Vite, Wails, Next.js, Vue ou Svelte e configura tokens + llms.txt automaticamente.',
  },
  npm: {
    label: 'NPM',
    cmd: 'npm install @matz/ui@beta',
    note: 'Pacote ESM/CJS com tipagem TypeScript estrita (.d.ts) e folha CSS3 nativa.',
  },
  pnpm: {
    label: 'PNPM',
    cmd: 'pnpm add @matz/ui@beta',
    note: 'Ideal para monorepos e workspaces multi-pacote.',
  },
  bun: {
    label: 'Bun',
    cmd: 'bun add @matz/ui@beta',
    note: 'Instalação instantânea com suporte nativo a TypeScript.',
  },
  wails: {
    label: 'Go + Wails v3',
    cmd: 'npx @matz/ui@beta init --wails',
    note: 'Gera a camada de encapsulamento @matz/ui/wails e os bindings IPC para Go 1.27+.',
  },
  cdn: {
    label: 'CDN (Zero-Build)',
    cmd: '<link rel="stylesheet" href="https://cdn.matz.dev/ui@0.1.0-beta.1/matz-ui.css" />',
    note: 'Use direto no HTML5 sem necessidade de bundler ou etapa de compilação.',
  },
};

const AI_CONTEXT_SNIPPETS: Record<AiContextTabID, { title: string; badge: string; code: string }> = {
  'agents-md': {
    title: 'AGENTS.md / .cursorrules / CLAUDE.md',
    badge: 'Regras para Agentes de IA',
    code: `# @matz/ui — AI Coding Agent Rules (v0.1.0-beta.1)
# Cole no seu AGENTS.md, CLAUDE.md ou .cursorrules

1. STACK PADRÃO: Use HTML5 semântico + CSS3 nativo + Vanilla TypeScript (@matz/ui) por padrão.
2. IMPORTAÇÃO BASE:
   import '@matz/ui/styles.css';
   import { enableMatzSpotlight, renderArcGauge, showMatzToast } from '@matz/ui';
3. TOKENS SEMÂNTICOS OBRIGATÓRIOS (Nunca use cores hex fixas em fundos ou inputs):
   - Fundo da página: var(--surface-canvas)
   - Cartões e painéis: class="matz-card matz-beam-top"
   - Inputs/Selects/Textareas: class="matz-input" | "matz-select" | "matz-textarea" (usam var(--surface-input))
   - Números e métricas em tempo real: adicione class="matz-tabular" (CLS = 0)
4. CAMADA DESKTOP WAILS:
   import { createMatzWailsBridge } from '@matz/ui/wails';
   const wails = createMatzWailsBridge({ windowControls: true, eventsIPC: true, serviceBinder: true });`,
  },
  'llms-txt': {
    title: 'Manifesto Estruturado /llms.txt (< 3.2k tokens)',
    badge: 'Padrão llms.txt',
    code: `# @matz/ui (v0.1.0-beta.1) — Deterministic Component Signatures
# URL: /llms.txt

// 1. Telemetria & Gauges 60fps (Atualização SVG in-place sem recriar DOM)
renderArcGauge(hostEl, { label: 'CPU Load', value: 76, min: 0, max: 100, unit: '%', interactive: true });
renderSpeedometerGauge(hostEl, { label: 'Latency P99', value: 12, max: 100, unit: 'ms', interactive: true });
renderInteractiveAreaChart(hostEl, { title: 'Throughput', labels: ['T1', 'T2'], series: [{ name: 'RPS', color: '#8b5cf6', data: [1200, 1850] }] });

// 2. Controles Ricos & Acessíveis (WCAG 2.1 AAA)
renderMatzCombobox(hostEl, [{ value: 'vanilla', label: 'Vanilla TS', badge: 'Default' }], 'vanilla', onSelect);
renderMatzOTPInput(hostEl, 6, (code) => showMatzToast('Código: ' + code));
openMatzDialog({ title: 'Confirmar Ação', description: '...', confirmLabel: 'Executar' });
openMatzSheetDrawer({ title: 'Inspeção Lateral', contentHtml: '...' });`,
  },
  'mcp-config': {
    title: 'Configuração MCP Server (@matz/ui-mcp)',
    badge: 'Model Context Protocol',
    code: `{
  "mcpServers": {
    "matz-ui": {
      "command": "npx",
      "args": ["-y", "@matz/ui-mcp@beta"],
      "env": {
        "MATZ_DEFAULT_FRAMEWORK": "vanilla",
        "MATZ_DEFAULT_THEME": "dark"
      }
    }
  }
}`,
  },
  'prompt-template': {
    title: 'Prompt Pronto para Construção de Interfaces com IA',
    badge: 'Copy & Paste Prompt',
    code: `Construa uma interface de monitoramento em tempo real usando a biblioteca @matz/ui (v0.1.0-beta.1) em Vanilla TypeScript.
Requisitos:
1. Importe '@matz/ui/styles.css' e ative enableMatzSpotlight().
2. No topo, renderize 3 Gauges interativos (renderArcGauge e renderSpeedometerGauge) e 1 gráfico de área (renderInteractiveAreaChart).
3. Adicione um formulário de configuração com .matz-input, renderMatzCombobox e validação 2FA com renderMatzOTPInput.
4. Encapsule a comunicação desktop com createMatzWailsBridge({ windowControls: true, serviceBinder: true }) de '@matz/ui/wails'.
5. Garanta acessibilidade WCAG AAA (labels associadas, aria-label e classe .matz-tabular em todos os contadores).`,
  },
};

export function mountMatzHomeView(
  container: HTMLElement,
  cb: HomeViewCallbacks
): () => void {
  let activeCli: CliMethodID = 'npx';
  let step1Mode = 'bundler' as 'bundler' | 'cdn';
  let homeFw: FrameworkID = 'vanilla';
  let homeCss: CssStackID = 'matz-css';
  let activeAiTab: AiContextTabID = 'agents-md';
  let activePlaygroundTab: PlaygroundTabID = 'website';
  let homeStageXray = false;
  let homeStageGrid = false;
  let streamCleanup: (() => void) | null = null;

  const quickstartSpec = {
    id: 'MatzQuickstartApp',
    title: 'Inicialização Rápida @matz/ui',
    vanillaCode: `import '@matz/ui/styles.css';
import { enableMatzSpotlight, renderArcGauge, showMatzToast } from '@matz/ui';
import { createMatzWailsBridge } from '@matz/ui/wails';

// 1. Ativa iluminação especular 1px e ponte nativa Wails (com fallback Web automático)
enableMatzSpotlight();
const wails = createMatzWailsBridge({ windowControls: true, eventsIPC: true });

// 2. Monta componente interativo a 60fps em qualquer elemento HTML
const gauge = renderArcGauge(document.getElementById('app-gauge')!, {
  label: 'Engine Throughput',
  value: 84,
  unit: '%',
  interactive: true,
});

showMatzToast('Interface @matz/ui inicializada com sucesso!');`,
    tokens: [],
  };

  const renderCliBar = () => {
    const cmdEl = container.querySelector<HTMLElement>('#hero-cli-cmd');
    const noteEl = container.querySelector<HTMLElement>('#hero-cli-note');
    if (cmdEl) cmdEl.textContent = CLI_COMMANDS[activeCli].cmd;
    if (noteEl) noteEl.textContent = CLI_COMMANDS[activeCli].note;
    container.querySelectorAll<HTMLButtonElement>('[data-cli-tab]').forEach((btn) => {
      const isAct = btn.dataset.cliTab === activeCli;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });
  };

  const renderStep1Code = () => {
    const host = container.querySelector<HTMLElement>('#home-step1-code');
    if (!host) return;
    const code =
      step1Mode === 'bundler'
        ? `# 1. Inicialize automaticamente (Vite, Wails, Next.js, Vue, Svelte)\nnpx @matz/ui@beta init\n\n# Ou instale o pacote diretamente\nnpm install @matz/ui@beta`
        : `<!-- Uso imediato via CDN ESM (Zero-Build) -->\n<link rel="stylesheet" href="https://cdn.matz.dev/ui@0.1.0-beta.1/matz-ui.css" />\n<script type="module">\n  import { enableMatzSpotlight, renderArcGauge } from 'https://cdn.matz.dev/ui@0.1.0-beta.1/matz-ui.esm.js';\n  enableMatzSpotlight();\n</script>`;
    host.innerHTML = highlightMatzCode(
      code,
      step1Mode === 'bundler' ? 'Terminal · CLI / NPM' : 'HTML5 · CDN ESM'
    );
  };

  const renderStep3Code = () => {
    const host = container.querySelector<HTMLElement>('#home-step3-code');
    if (!host) return;
    const raw = generateMultiFrameworkSnippet(quickstartSpec, homeFw, homeCss);
    host.innerHTML = highlightMatzCode(
      raw,
      `${homeFw === 'vanilla' ? 'Vanilla TypeScript (Padrão Oficial)' : homeFw.toUpperCase()} · ${homeCss}`
    );
  };

  const renderAiContextBox = () => {
    const host = container.querySelector<HTMLElement>('#home-ai-code-host');
    if (!host) return;
    const item = AI_CONTEXT_SNIPPETS[activeAiTab];
    host.innerHTML = highlightMatzCode(item.code, `${item.title} · ${item.badge}`);
    container.querySelectorAll<HTMLButtonElement>('[data-ai-tab]').forEach((btn) => {
      const isAct = btn.dataset.aiTab === activeAiTab;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });
  };

  const SCENARIO_CODE_MAP: Record<PlaygroundTabID, string> = {
    website: `import '@matz/ui/styles.css';
import { renderMatzCompleteWebsiteShowcase } from '@matz/ui';

// Monta Website completo: Header + Hero + Bento Features + Pricing Table + FAQ + Footer
renderMatzCompleteWebsiteShowcase(document.getElementById('site-root')!);`,
    blog: `import '@matz/ui/styles.css';
import { renderMatzWebsiteMainAndAside } from '@matz/ui';
import { iconZap } from '@matz/ui/icons/zap'; // Importação de 1 único ícone (~180B)

renderMatzWebsiteMainAndAside(document.getElementById('blog-portal')!);`,
    admin: `import '@matz/ui/styles.css';
import { renderMatzCompositeAdminSuite } from '@matz/ui';

renderMatzCompositeAdminSuite(document.getElementById('admin-erp-root')!);`,
    ecommerce: `import '@matz/ui/styles.css';
import { renderMatzEcommerceSuite } from '@matz/ui';

renderMatzEcommerceSuite(document.getElementById('ecommerce-root')!);`,
    kanban: `import '@matz/ui/styles.css';
import { renderMatzKanbanWorkspace } from '@matz/ui';

renderMatzKanbanWorkspace(document.getElementById('kanban-root')!);`,
    telemetry: `import '@matz/ui/styles.css';
import {
  renderArcGauge,
  renderSpeedometerGauge,
  mountLiveTelemetryStream,
  renderInteractiveAreaChart,
} from '@matz/ui';

renderArcGauge(document.getElementById('g1')!, { label: 'CPU Core Load', value: 76, unit: '%', interactive: true });
renderSpeedometerGauge(document.getElementById('g2')!, { label: 'Wails IPC P99', value: 12, unit: 'ms', interactive: true });
mountLiveTelemetryStream(document.getElementById('osc')!, 'Osciloscópio 60fps');`,
    animations: `import '@matz/ui/styles.css';
import { renderMatzAnimationsAndBackgrounds } from '@matz/ui';

renderMatzAnimationsAndBackgrounds(document.getElementById('animations-root')!);`,
    'ai-forms': `import '@matz/ui/styles.css';
import { renderMatzAgenticUISuite, renderMatzCombobox, renderMatzOTPInput } from '@matz/ui';

renderMatzAgenticUISuite(document.getElementById('ai-agent-root')!);`,
  };

  const renderPlaygroundStage = () => {
    if (streamCleanup) {
      streamCleanup();
      streamCleanup = null;
    }
    const stage = container.querySelector<HTMLElement>('#home-playground-stage');
    if (!stage) return;

    stage.classList.toggle('matz-stage-xray', homeStageXray);
    stage.classList.toggle('matz-stage-grid', homeStageGrid);

    const xrayHud = container.querySelector<HTMLElement>('#home-xray-hud');
    if (xrayHud) {
      xrayHud.style.display = homeStageXray ? 'flex' : 'none';
    }

    container.querySelectorAll<HTMLButtonElement>('[data-pg-tab]').forEach((btn) => {
      const isAct = btn.dataset.pgTab === activePlaygroundTab;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });

    if (activePlaygroundTab === 'website') {
      stage.innerHTML = `<div id="pg-web-complete-host" style="min-width:0;width:100%;"></div>`;
      renderMatzCompleteWebsiteShowcase(stage.querySelector('#pg-web-complete-host')!);
    } else if (activePlaygroundTab === 'blog') {
      stage.innerHTML = `<div id="pg-blog-host" style="min-width:0;width:100%;"></div>`;
      renderMatzWebsiteMainAndAside(stage.querySelector('#pg-blog-host')!);
    } else if (activePlaygroundTab === 'admin') {
      stage.innerHTML = `<div id="pg-admin-host" style="min-width:0;width:100%;"></div>`;
      renderMatzCompositeAdminSuite(stage.querySelector('#pg-admin-host')!);
    } else if (activePlaygroundTab === 'ecommerce') {
      stage.innerHTML = `<div id="pg-ecommerce-host" style="min-width:0;width:100%;"></div>`;
      renderMatzEcommerceSuite(stage.querySelector('#pg-ecommerce-host')!);
    } else if (activePlaygroundTab === 'kanban') {
      stage.innerHTML = `<div id="pg-kanban-host" style="min-width:0;width:100%;"></div>`;
      renderMatzKanbanWorkspace(stage.querySelector('#pg-kanban-host')!);
    } else if (activePlaygroundTab === 'telemetry') {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:22px;min-width:0;width:100%;">
          <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 235px)) minmax(0, 1fr);gap:18px;align-items:stretch;width:100%;">
            <div id="pg-gauge-1" style="min-width:0;"></div>
            <div id="pg-gauge-2" style="min-width:0;"></div>
            <div id="pg-gauge-3" style="min-width:0;"></div>
            <div id="pg-live-stream" style="min-width:0;"></div>
          </div>
          <div id="pg-area-chart" style="min-width:0;width:100%;"></div>
        </div>
      `;
      renderArcGauge(stage.querySelector('#pg-gauge-1')!, {
        label: 'CPU Core Load',
        value: 76,
        unit: '%',
        interactive: true,
      });
      renderArcGauge(stage.querySelector('#pg-gauge-2')!, {
        label: 'Memory Allocation',
        value: 64,
        max: 128,
        unit: ' MB',
        color: '#10b981',
        interactive: true,
      });
      renderSpeedometerGauge(stage.querySelector('#pg-gauge-3')!, {
        label: 'Wails IPC Latency P99',
        value: 12,
        max: 100,
        unit: 'ms',
        interactive: true,
      });
      streamCleanup = mountLiveTelemetryStream(
        stage.querySelector('#pg-live-stream')!,
        'Osciloscópio 60fps (Auto-Pause Offscreen)'
      );
      renderInteractiveAreaChart(stage.querySelector('#pg-area-chart')!, {
        title: 'Throughput de Eventos & Requisições por Segundo (Passe o cursor para inspecionar)',
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'],
        series: [
          { name: 'Wails Native IPC', color: '#8b5cf6', data: [1800, 2300, 2900, 4100, 5200, 6100, 7300, 8100, 8950] },
          { name: 'HTTP/3 Edge API', color: '#06b6d4', data: [1100, 1500, 1950, 2700, 3400, 4200, 4950, 5600, 6300] },
        ],
      });
    } else if (activePlaygroundTab === 'animations') {
      stage.innerHTML = `<div id="pg-animations-host" style="min-width:0;width:100%;"></div>`;
      renderMatzAnimationsAndBackgrounds(stage.querySelector('#pg-animations-host')!);
    } else {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:22px;min-width:0;width:100%;">
          <div id="pg-agentic-host" style="min-width:0;width:100%;"></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:20px;align-items:stretch;">
            <div class="matz-card matz-beam-top" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:15px;">Inputs Calibrados, Combobox & Cofre 2FA</strong>
                <span class="matz-badge matz-badge-emerald">Zero White-Leak · WCAG AAA</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label for="pg-endpoint-input" style="font-size:12px;font-weight:600;color:var(--text-secondary);">Endpoint da API</label>
                  <input id="pg-endpoint-input" class="matz-input" value="https://api.matz.dev/v1/telemetry" />
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">Adapter de Runtime</span>
                  <div id="pg-combobox-host"></div>
                </div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:12px;border-top:1px solid var(--border);">
                <div>
                  <div style="font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Código de Autorização TOTP</div>
                  <div id="pg-otp-host"></div>
                </div>
                <button class="matz-btn matz-btn-primary" id="pg-test-toast">
                  ${matzIcon('check-circle', 14)} Testar Toast
                </button>
              </div>
            </div>
            <div id="pg-waveform" style="min-width:0;"></div>
          </div>
        </div>
      `;
      renderMatzAgenticUISuite(stage.querySelector('#pg-agentic-host')!);
      renderMatzCombobox(
        stage.querySelector('#pg-combobox-host')!,
        [
          { value: 'vanilla', label: 'Vanilla TypeScript (Padrão)', badge: '0 KB Overhead' },
          { value: 'wails-v3', label: 'Go 1.27 + Wails v3 Bridge', badge: '19 MB RAM' },
          { value: 'react-19', label: 'React 19 / Next.js 15', badge: 'Adapter' },
        ],
        'vanilla',
        (val) => showMatzToast(`Runtime selecionado: ${val}`)
      );
      renderMatzOTPInput(stage.querySelector('#pg-otp-host')!, 6, (code) => {
        showMatzToast(`Código TOTP ${code} validado!`);
      });
      renderMatzWaveformPlayer(
        stage.querySelector('#pg-waveform')!,
        'Briefing de Engenharia — Arquitetura @matz/ui v0.1.0-beta.1'
      );
      stage.querySelector('#pg-test-toast')?.addEventListener('click', () => {
        showMatzToast('Formulário validado com contraste WCAG 2.1 AAA!');
      });
    }
  };

  container.innerHTML = `
    <div class="matz-home-shell">
      <!-- ====================================================================
           1. HERO — CARTÃO DE VISITAS DA BIBLIOTECA (FOCO NO DEV & AI-FIRST)
           ==================================================================== -->
      <section class="matz-card matz-beam-top" aria-labelledby="hero-heading" style="padding:44px 42px;display:flex;flex-direction:column;gap:32px;background:radial-gradient(ellipse 75% 60% at 50% 0%, var(--accent-muted), transparent 75%), var(--surface-card-solid);">
        <!-- Top Status & Identity Row -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <button class="matz-badge matz-badge-amber" id="hero-version-pill" style="cursor:pointer;padding:4px 11px;border:none;" aria-label="Ver notas da versão v${MATZ_UI_VERSION.version}">
              ${matzIcon('git-branch', 12)}
              <span>v${MATZ_UI_VERSION.version} · ${MATZ_UI_VERSION.stageLabel}</span>
            </button>
            <span class="matz-badge matz-badge-cyan">
              ${matzIcon('code', 12)} Vanilla TS First · Zero Dependências
            </span>
            <span class="matz-badge matz-badge-emerald">
              ${matzIcon('sparkles', 12)} AI-First Ready (/llms.txt + MCP)
            </span>
            <span class="matz-badge">
              ${matzIcon('cpu', 12)} Go + Wails v3 Native Bridge
            </span>
          </div>

          <!-- Instant Accent Palette Switcher -->
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;" role="group" aria-label="Selecionar paleta de acento em tempo real">
            <span style="font-size:11.5px;color:var(--text-muted);margin-right:4px;">Acento:</span>
            ${(
              [
                { id: 'matz', label: 'Violet', hex: '#8b5cf6' },
                { id: 'heapi', label: 'Fuchsia', hex: '#d946ef' },
                { id: 'myterm', label: 'Emerald', hex: '#10b981' },
                { id: 'bycode', label: 'Blue', hex: '#3b82f6' },
                { id: 'writtt', label: 'Amber', hex: '#f59e0b' },
              ] as Array<{ id: MatzProductID; label: string; hex: string }>
            )
              .map(
                (p) => `
              <button class="matz-btn matz-btn-sm ${cb.getCurrentProduct() === p.id ? 'matz-btn-primary' : ''}" data-hero-prod="${p.id}" aria-pressed="${cb.getCurrentProduct() === p.id}">
                <span style="width:8px;height:8px;border-radius:50%;background:${p.hex};" aria-hidden="true"></span>
                <span>${p.label}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>

        <!-- Main Hero Grid -->
        <div style="display:grid;grid-template-columns:minmax(0, 1.28fr) minmax(0, 0.72fr);gap:36px;align-items:center;min-width:0;">
          <div style="display:flex;flex-direction:column;gap:20px;min-width:0;">
            <h1 id="hero-heading" class="matz-heading-grad" style="font-size:clamp(2.15rem, 3.3vw, 3.25rem);font-weight:900;letter-spacing:-0.03em;line-height:1.24;padding-bottom:6px;">
              A Biblioteca de UI para Aplicações de Alta Densidade, Desktop Wails e Agentes de IA.
            </h1>
            <p style="font-size:15.5px;color:var(--text-secondary);line-height:1.68;max-width:860px;">
              Construa interfaces rápidas, acessíveis (<strong>WCAG 2.1 AAA</strong>) e sem dependências pesadas. Arquitetura nativa em <strong>HTML5, CSS3 e Vanilla TypeScript</strong> com adaptadores prontos para <strong>Go + Wails, React, Next.js, Vue 3, Svelte 5</strong> e contratos determinísticos para LLMs.
            </p>

            <!-- Instant CLI & Package Manager Installer Box -->
            <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:780px;min-width:0;margin-top:4px;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <span style="font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
                  Instalação & Inicialização Instantânea
                </span>
                <div class="matz-segmented" role="tablist" aria-label="Método de instalação" style="flex-wrap:wrap;">
                  ${(Object.keys(CLI_COMMANDS) as CliMethodID[])
                    .map(
                      (k) => `
                    <button class="matz-segmented-btn ${activeCli === k ? 'active' : ''}" data-cli-tab="${k}" role="tab" aria-selected="${activeCli === k}" style="padding:3px 9px;font-size:11px;">
                      ${CLI_COMMANDS[k].label}
                    </button>`
                    )
                    .join('')}
                </div>
              </div>

              <div class="matz-cli-box">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;overflow-x:auto;">
                  <span style="color:var(--accent);font-weight:700;user-select:none;flex-shrink:0;">$</span>
                  <code id="hero-cli-cmd" style="white-space:nowrap;">${CLI_COMMANDS[activeCli].cmd}</code>
                </div>
                <button class="matz-btn matz-btn-sm matz-btn-primary" id="hero-copy-cli" style="flex-shrink:0;">
                  ${matzIcon('copy', 12)} Copiar Comando
                </button>
              </div>
              <span id="hero-cli-note" style="font-size:12px;color:var(--text-muted);">
                ${CLI_COMMANDS[activeCli].note}
              </span>
            </div>

            <!-- Primary Developer Actions -->
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;">
              <button class="matz-btn matz-btn-lg matz-btn-primary" id="hero-go-docs">
                ${matzIcon('layers', 16)} Componentes (110+) →
              </button>
              <button class="matz-btn matz-btn-lg" id="hero-go-foundations">
                ${matzIcon('palette', 16)} Design System (7 Pilares)
              </button>
              <button class="matz-btn matz-btn-lg" id="hero-go-icons">
                ${matzIcon('grid', 16)} Iconography Studio (185 Ícones)
              </button>
              <button class="matz-btn matz-btn-lg" id="hero-scroll-quickstart">
                ${matzIcon('code', 16)} Guia Rápido (30s)
              </button>
              <button class="matz-btn matz-btn-lg" id="hero-scroll-ai">
                ${matzIcon('sparkles', 16)} AI-First & llms.txt
              </button>
            </div>
          </div>

          <!-- Right Column: Core Engineering & Vitals Benchmarks -->
          <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:16px;min-width:0;">
            ${renderSparklineCard({
              title: 'CSS3 Nativo (Gzip)',
              value: '6.2 KB',
              delta: 'Zero CSS-in-JS Runtime',
              data: [42, 28, 19, 14, 10, 7.5, 6.2],
              color: '#10b981',
            })}
            ${renderSparklineCard({
              title: 'Core Web Vitals',
              value: '100 / 100',
              delta: 'CLS 0.00 · LCP < 0.4s',
              data: [92, 95, 97, 98, 99, 100, 100],
              color: '#06b6d4',
            })}
            ${renderSparklineCard({
              title: 'Acessibilidade Óptica',
              value: 'WCAG AAA',
              delta: 'Contraste 16.4:1',
              data: [12, 13.5, 14.5, 15.2, 15.8, 16.1, 16.4],
              color: '#8b5cf6',
            })}
            ${renderSparklineCard({
              title: 'Contexto IA (llms.txt)',
              value: '3.1k tok',
              delta: 'API 100% Determinística',
              data: [15, 12, 9, 6, 4.5, 3.5, 3.1],
              color: '#d946ef',
            })}
          </div>
        </div>
      </section>

      <!-- ====================================================================
           2. QUICKSTART EM 3 PASSOS — DO ZERO À PRODUÇÃO EM 30 SEGUNDOS
           ==================================================================== -->
      <section class="matz-home-section" id="sec-quickstart" aria-labelledby="qs-heading">
        <div class="matz-section-head">
          <div>
            <span class="matz-badge matz-badge-cyan">QUICKSTART DESENVOLVEDOR</span>
            <h2 id="qs-heading" style="font-size:26px;font-weight:800;margin-top:8px;letter-spacing:-0.02em;">
              Comece em 30 Segundos: Instale, Importe e Renderize
            </h2>
            <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;">
              Sem configurações complexas. Escolha usar via CLI/NPM no seu bundler favorito ou direto via CDN HTML5.
            </p>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:12px;color:var(--text-muted);">Framework do Passo 3:</span>
            <div class="matz-segmented" role="tablist" aria-label="Selecionar framework para o Quickstart">
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
                <button class="matz-segmented-btn ${homeFw === f.id ? 'active' : ''}" data-qs-fw="${f.id}" style="padding:4px 10px;font-size:11.5px;">
                  ${f.label}
                </button>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr);gap:24px;align-items:stretch;min-width:0;width:100%;">
          <!-- Step 1: Install -->
          <div class="matz-step-card">
            <div style="display:flex;flex-direction:column;gap:12px;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="matz-step-num">1</span>
                  <strong style="font-size:16px;">Instale ou Use via CDN</strong>
                </div>
                <div class="matz-segmented">
                  <button class="matz-segmented-btn ${step1Mode === 'bundler' ? 'active' : ''}" data-step1-mode="bundler" style="padding:2px 8px;font-size:11px;">CLI / NPM</button>
                  <button class="matz-segmented-btn ${step1Mode === 'cdn' ? 'active' : ''}" data-step1-mode="cdn" style="padding:2px 8px;font-size:11px;">CDN</button>
                </div>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                O comando <code>init</code> configura variáveis CSS, tipos TypeScript e gera o arquivo <code>llms.txt</code> local para seu assistente de IA.
              </p>
              <div class="matz-code-block" id="home-step1-code" style="margin:0;"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
              <span>Suporta Vite 8, Next.js 15, Wails v3</span>
              <span style="color:var(--accent);font-weight:600;">Zero Config</span>
            </div>
          </div>

          <!-- Step 2: Import Tokens & Theme -->
          <div class="matz-step-card">
            <div style="display:flex;flex-direction:column;gap:12px;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="matz-step-num">2</span>
                  <strong style="font-size:16px;">Ative o Tema & Tokens</strong>
                </div>
                <span class="matz-badge matz-badge-emerald">Dual-Theme</span>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                Importe a folha de estilos única e controle o modo escuro/claro, paleta e densidade via atributos semânticos no <code>&lt;html&gt;</code>:
              </p>
              <div class="matz-code-block" style="margin:0;">${highlightMatzCode(
                `<!-- index.html -->
<html
  lang="pt-BR"
  data-theme="dark"
  data-product="matz"
  data-density="default"
>

// main.ts — Folha de estilos única (6.2 KB gzip)
import '@matz/ui/styles.css';`,
                'HTML5 + CSS Tokens'
              )}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
              <span>Dark Obsidian & Light Alabaster</span>
              <button class="matz-btn matz-btn-sm" id="qs-toggle-theme-btn" style="padding:2px 8px;font-size:11px;">
                Testar Alternância de Tema
              </button>
            </div>
          </div>

          <!-- Step 3: Mount Components -->
          <div class="matz-step-card">
            <div style="display:flex;flex-direction:column;gap:12px;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="matz-step-num">3</span>
                  <strong style="font-size:16px;">Monte os Componentes</strong>
                </div>
                <button class="matz-btn matz-btn-sm matz-btn-primary" id="qs-copy-step3">
                  ${matzIcon('copy', 12)} Copiar Código
                </button>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                Funções determinísticas com autocompletar completo. O padrão é sempre <strong>Vanilla TypeScript</strong>, com adaptadores prontos para seu framework:
              </p>
              <div class="matz-code-block" id="home-step3-code" style="margin:0;max-height:250px;overflow:auto;"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
              <span>Tipagem TypeScript 100% Estrita</span>
              <button class="matz-btn matz-btn-sm" id="qs-open-composer" style="padding:2px 8px;font-size:11px;">
                Abrir Visual Composer →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           3. ARQUITETURA AI-FIRST — PROJETADA PARA AGENTES DE IA & LLMs
           ==================================================================== -->
      <section class="matz-home-section" id="sec-ai-first" aria-labelledby="ai-heading">
        <div class="matz-section-head">
          <div>
            <span class="matz-badge matz-badge-emerald">AI-FIRST UI ARCHITECTURE · LLMS.TXT · MCP</span>
            <h2 id="ai-heading" style="font-size:26px;font-weight:800;margin-top:8px;letter-spacing:-0.02em;">
              Projetada para Humanos e Otimizada para Agentes de IA
            </h2>
            <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;max-width:820px;">
              Bibliotecas tradicionais exigem dezenas de sub-componentes aninhados que fazem LLMs alucinarem propriedades. A <strong>@matz/ui</strong> fornece contratos determinísticos de chamada única e manifesto <code>/llms.txt</code> nativo.
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <a href="/llms.txt" target="_blank" rel="noopener" class="matz-btn matz-btn-sm" style="text-decoration:none;">
              ${matzIcon('globe', 13)} Abrir /llms.txt Bruto
            </a>
            <button class="matz-btn matz-btn-sm matz-btn-primary" id="ai-copy-active-btn">
              ${matzIcon('copy', 13)} Copiar Contexto para IA
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:minmax(0, 0.85fr) minmax(0, 1.15fr);gap:28px;align-items:stretch;min-width:0;width:100%;">
          <!-- Left: 3 AI-First Engineering Pillars -->
          <div style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-width:0;">
            <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:15px;">1. API Determinística de Chamada Única</strong>
                <span class="matz-badge matz-badge-cyan">Zero Alucinação</span>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                Em vez de 14 tags aninhadas, qualquer componente complexo (Gauge, DataTable, Combobox, OTP, Wails Bridge) é instanciado com uma única função tipada <code>render*(container, config)</code>.
              </p>
            </div>

            <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:15px;">2. Tokens Semânticos &amp; Importação de 1 Único Ícone</strong>
                <span class="matz-badge matz-badge-emerald">Tree-Shakeable</span>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                Clique em qualquer token ou import essencial abaixo para copiar diretamente para seu projeto:
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <button type="button" class="matz-copy-pill" data-matz-copy-text="import { iconBot } from '@matz/ui/icons/bot';">
                  @matz/ui/icons/bot (1 Ícone) ⧉
                </button>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="var(--surface-canvas)">
                  --surface-canvas ⧉
                </button>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="var(--surface-card)">
                  --surface-card ⧉
                </button>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="var(--surface-input)">
                  --surface-input ⧉
                </button>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="var(--accent)">
                  --accent ⧉
                </button>
              </div>
            </div>

            <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:15px;">3. Pronta para Cursor, Claude Code, Antigravity & MCP</strong>
                <span class="matz-badge matz-badge-amber">&lt; 3.2k Tokens</span>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                Copie as regras ao lado para seu <code>AGENTS.md</code>, <code>CLAUDE.md</code> ou <code>.cursorrules</code>, ou conecte o servidor MCP para que o agente consulte todos os 110+ componentes instantaneamente.
              </p>
            </div>
          </div>

          <!-- Right: Interactive AI Context & Prompt Switcher -->
          <div class="matz-stage-shell" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div class="matz-stage-toolbar">
              <div class="matz-segmented" role="tablist" aria-label="Arquivos de contexto para IA">
                <button class="matz-segmented-btn active" data-ai-tab="agents-md" role="tab" aria-selected="true">
                  AGENTS.md / .cursorrules
                </button>
                <button class="matz-segmented-btn" data-ai-tab="llms-txt" role="tab" aria-selected="false">
                  Manifesto /llms.txt
                </button>
                <button class="matz-segmented-btn" data-ai-tab="mcp-config" role="tab" aria-selected="false">
                  MCP Server JSON
                </button>
                <button class="matz-segmented-btn" data-ai-tab="prompt-template" role="tab" aria-selected="false">
                  Prompt Pronto
                </button>
              </div>
            </div>
            <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
              <div class="matz-code-block" id="home-ai-code-host" style="margin:0;max-height:310px;overflow:auto;"></div>
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--text-muted);">
                <span>Compatível com Antigravity, Cursor, Claude Code, Windsurf, GitHub Copilot e v0.</span>
                <button class="matz-btn matz-btn-sm matz-btn-primary" id="ai-copy-bottom-btn">
                  ${matzIcon('copy', 12)} Copiar Bloco Selecionado
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           4. PALCO INTERATIVO DE CENÁRIOS COMPLETOS (WEBSITES, BLOGS, ADMIN, E-COMMERCE, KANBAN, TELEMETRIA & ANIMAÇÕES)
           ==================================================================== -->
      <section class="matz-home-section" aria-labelledby="pg-heading">
        <div class="matz-section-head">
          <div>
            <span class="matz-badge matz-badge-cyan">DEMONSTRAÇÃO INTERATIVA AO VIVO · CENÁRIOS REAIS</span>
            <h2 id="pg-heading" style="font-size:26px;font-weight:800;margin-top:8px;letter-spacing:-0.02em;">
              De Websites, Blogs e E-Commerce a Painéis Admin, Kanban e Dashboards 60fps
            </h2>
            <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;">
              Interaja ao vivo com 8 aplicações completas construídas com os 110+ componentes de navegação, precificação, conteúdo editorial, gestão corporativa, loja virtual, telemetria e animações da <strong>@matz/ui</strong>:
            </p>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button class="matz-btn matz-btn-sm" id="home-pg-copy-scenario">
              ${matzIcon('copy', 13)} Copiar Código deste Cenário
            </button>
            <button class="matz-btn matz-btn-primary" id="pg-explore-all-btn">
              Ver Todos os 110+ Componentes na Documentação →
            </button>
          </div>
        </div>

        <div class="matz-stage-shell">
          <div class="matz-stage-toolbar">
            <div class="matz-segmented" role="tablist" aria-label="Cenários completos do palco interativo" style="flex-wrap:wrap;">
              <button class="matz-segmented-btn active" data-pg-tab="website" role="tab" aria-selected="true">
                ${matzIcon('globe', 13)} 1. Website &amp; Landing Page
              </button>
              <button class="matz-segmented-btn" data-pg-tab="blog" role="tab" aria-selected="false">
                ${matzIcon('file-text', 13)} 2. Portal Editorial &amp; Blog
              </button>
              <button class="matz-segmented-btn" data-pg-tab="admin" role="tab" aria-selected="false">
                ${matzIcon('columns', 13)} 3. Painel Admin &amp; ERP
              </button>
              <button class="matz-segmented-btn" data-pg-tab="ecommerce" role="tab" aria-selected="false">
                ${matzIcon('wallet', 13)} 4. E-Commerce &amp; Checkout
              </button>
              <button class="matz-segmented-btn" data-pg-tab="kanban" role="tab" aria-selected="false">
                ${matzIcon('kanban', 13)} 5. Kanban &amp; Projetos
              </button>
              <button class="matz-segmented-btn" data-pg-tab="telemetry" role="tab" aria-selected="false">
                ${matzIcon('activity', 13)} 6. Telemetria 60fps
              </button>
              <button class="matz-segmented-btn" data-pg-tab="animations" role="tab" aria-selected="false">
                ${matzIcon('sparkles', 13)} 7. Animações &amp; 3D Tilt
              </button>
              <button class="matz-segmented-btn" data-pg-tab="ai-forms" role="tab" aria-selected="false">
                ${matzIcon('bot', 13)} 8. AI Studio &amp; Forms
              </button>
            </div>

            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <button class="matz-btn matz-btn-sm" id="home-pg-grid-btn" title="Alternar Grade Geométrica de 8px">
                # Grid 8px
              </button>
              <button class="matz-btn matz-btn-sm" id="home-pg-xray-btn" title="Ativar Inspeção X-Ray de Box Model nos Componentes">
                ${matzIcon('eye', 12)} X-Ray UX
              </button>
            </div>
          </div>

          <!-- Live X-Ray Telemetry Bar (Shown when X-Ray is active) -->
          <div class="matz-xray-hud" id="home-xray-hud" style="display:none;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="matz-badge matz-badge-cyan" style="font-size:10px;">X-RAY INSPECTOR ATIVO</span>
              <span id="home-xray-target-lbl">Passe o cursor sobre qualquer elemento abaixo para inspecionar tag, classes e dimensões (Box Model).</span>
            </div>
            <span style="color:var(--accent);">Cyan = Estrutura · Magenta = Elemento em Foco</span>
          </div>

          <div id="home-playground-stage" class="matz-preview-stage" style="padding:24px;min-height:460px;margin:0;"></div>
        </div>
      </section>

      <!-- ====================================================================
           5. PAGESPEED INSIGHTS (CORE WEB VITALS) & ACESSIBILIDADE WCAG AAA
           ==================================================================== -->
      <section class="matz-home-section" aria-labelledby="vitals-heading">
        <div class="matz-section-head">
          <div>
            <span class="matz-badge matz-badge-emerald">ENGENHARIA DE PERFORMANCE & ACESSIBILIDADE</span>
            <h2 id="vitals-heading" style="font-size:26px;font-weight:800;margin-top:8px;letter-spacing:-0.02em;">
              Boas Práticas de PageSpeed Insights & Acessibilidade Nativa
            </h2>
            <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;">
              Cada componente foi projetado para atingir pontuação máxima em Core Web Vitals (LCP, CLS, INP) e conformidade rigorosa com WCAG 2.1 AAA.
            </p>
          </div>
          <button class="matz-btn matz-btn-sm" id="vitals-open-wcag-lab">
            ${matzIcon('shield', 13)} Abrir Laboratório WCAG & Daltonismo →
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:20px;min-width:0;width:100%;">
          <div class="matz-card matz-beam-top" style="padding:24px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="matz-badge matz-badge-emerald">LCP &lt; 0.4s</span>
              <strong class="matz-tabular" style="font-size:18px;color:var(--accent);">6.2 KB</strong>
            </div>
            <strong style="font-size:15px;">Zero Render-Blocking</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
              CSS3 nativo baseado em Custom Properties sem custo de hidratação CSS-in-JS. Ícones vetoriais SVG inline sem requisições extras de fontes externas.
            </p>
          </div>

          <div class="matz-card matz-beam-top" style="padding:24px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="matz-badge matz-badge-cyan">CLS = 0.000</span>
              <strong class="matz-tabular" style="font-size:18px;color:var(--accent);">Tabular</strong>
            </div>
            <strong style="font-size:15px;">Estabilidade Visual Absoluta</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
              Todos os contadores, gauges e tabelas utilizam <code>font-variant-numeric: tabular-nums</code> e containers com geometria reservada para eliminar saltos de layout.
            </p>
          </div>

          <div class="matz-card matz-beam-top" style="padding:24px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="matz-badge matz-badge-emerald">INP &lt; 16ms</span>
              <strong class="matz-tabular" style="font-size:18px;color:var(--accent);">60 fps</strong>
            </div>
            <strong style="font-size:15px;">Mutação Direta DOM / SVG</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
              Sliders e gráficos atualizam apenas os atributos necessários in-place e pausam animações automaticamente fora da viewport via <code>IntersectionObserver</code>.
            </p>
          </div>

          <div class="matz-card matz-beam-top" style="padding:24px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="matz-badge matz-badge-amber">WCAG 2.1 AAA</span>
              <strong class="matz-tabular" style="font-size:18px;color:var(--accent);">16.4:1</strong>
            </div>
            <strong style="font-size:15px;">Acessibilidade Semântica</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
              Landmarks WAI-ARIA, <code>:focus-visible</code> de alto contraste, navegação integral por teclado (<code>Tab</code>, <code>⌘K</code>, <code>Esc</code>), Skip Links e suporte a <code>prefers-reduced-motion</code>.
            </p>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           6. ECOSSISTEMA MULTI-FRAMEWORK, WAILS NATIVE & ROADMAP BETA
           ==================================================================== -->
      <section class="matz-home-section" aria-labelledby="roadmap-heading">
        <div class="matz-section-head">
          <div>
            <span class="matz-badge matz-badge-amber">VERSIONAMENTO SEMVER · CANAL BETA (v${MATZ_UI_VERSION.version})</span>
            <h2 id="roadmap-heading" style="font-size:26px;font-weight:800;margin-top:8px;letter-spacing:-0.02em;">
              Ferramentas de Engenharia & Roadmap de Estabilidade
            </h2>
            <p style="font-size:14px;color:var(--text-secondary);margin-top:4px;">
              Acesse diretamente as estações da plataforma ou acompanhe o ciclo de desenvolvimento rumo à versão 1.0 LTS.
            </p>
          </div>
          <button class="matz-btn matz-btn-sm" id="home-changelog-btn">
            ${matzIcon('git-branch', 13)} Abrir Changelog & Notas da Versão
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:22px;min-width:0;width:100%;">
          ${MATZ_UI_VERSION.roadmap
            .map(
              (m) => `
            <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <code style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--accent);">v${m.targetVersion}</code>
                <span class="matz-badge ${m.status === 'in-progress' ? 'matz-badge-amber' : 'matz-badge-cyan'}">
                  ${m.status === 'in-progress' ? 'EM TESTES (ATUAL)' : 'PLANEJADO'}
                </span>
              </div>
              <strong style="font-size:15.5px;">${m.title}</strong>
              <ul style="padding-left:18px;font-size:13px;color:var(--text-secondary);display:flex;flex-direction:column;gap:6px;line-height:1.5;">
                ${m.items.map((it) => `<li>${it}</li>`).join('')}
              </ul>
            </div>`
            )
            .join('')}
        </div>
      </section>
    </div>
  `;

  // Initial Renders for Dynamic Subsections
  renderStep1Code();
  renderStep3Code();
  renderAiContextBox();
  renderPlaygroundStage();

  // Event Listeners — Hero CLI Switcher & Copy
  container.querySelectorAll<HTMLButtonElement>('[data-cli-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCli = (btn.dataset.cliTab as CliMethodID) || 'npx';
      renderCliBar();
    });
  });

  container.querySelector('#hero-copy-cli')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(CLI_COMMANDS[activeCli].cmd);
    showMatzToast(`Comando copiado: ${CLI_COMMANDS[activeCli].cmd}`);
  });

  // Hero Navigation & Smooth Anchor Scrolling
  container.querySelector('#hero-version-pill')?.addEventListener('click', () => openMatzVersionModal());
  container.querySelector('#home-changelog-btn')?.addEventListener('click', () => openMatzVersionModal());
  container.querySelector('#hero-go-docs')?.addEventListener('click', () => cb.onNavigateMode('explorer', 'introduction'));
  container.querySelector('#hero-go-foundations')?.addEventListener('click', () => cb.onNavigateMode('foundations'));
  container.querySelector('#hero-go-icons')?.addEventListener('click', () => cb.onNavigateMode('icons'));
  container.querySelector('#pg-explore-all-btn')?.addEventListener('click', () => cb.onNavigateMode('explorer', 'introduction'));
  container.querySelector('#hero-go-wails')?.addEventListener('click', () => cb.onNavigateMode('wails'));
  container.querySelector('#qs-open-composer')?.addEventListener('click', () => cb.onNavigateMode('composer'));
  container.querySelector('#vitals-open-wcag-lab')?.addEventListener('click', () => cb.onNavigateMode('heuristics'));

  container.querySelector('#hero-scroll-quickstart')?.addEventListener('click', () => {
    container.querySelector('#sec-quickstart')?.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelector('#hero-scroll-ai')?.addEventListener('click', () => {
    container.querySelector('#sec-ai-first')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Hero Accent Palette Buttons
  container.querySelectorAll<HTMLButtonElement>('[data-hero-prod]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cb.onSelectProduct((btn.dataset.heroProd as MatzProductID) || 'matz');
    });
  });

  // Quickstart Step 1, Step 2 & Step 3 Listeners
  container.querySelectorAll<HTMLButtonElement>('[data-step1-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      step1Mode = (btn.dataset.step1Mode as 'bundler' | 'cdn') || 'bundler';
      container.querySelectorAll<HTMLButtonElement>('[data-step1-mode]').forEach((b) => {
        b.classList.toggle('active', b.dataset.step1Mode === step1Mode);
      });
      renderStep1Code();
    });
  });

  container.querySelector('#qs-toggle-theme-btn')?.addEventListener('click', () => {
    cb.onToggleTheme();
  });

  container.querySelectorAll<HTMLButtonElement>('[data-qs-fw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      homeFw = (btn.dataset.qsFw as FrameworkID) || 'vanilla';
      container.querySelectorAll<HTMLButtonElement>('[data-qs-fw]').forEach((b) => {
        b.classList.toggle('active', b.dataset.qsFw === homeFw);
      });
      renderStep3Code();
    });
  });

  container.querySelector('#qs-copy-step3')?.addEventListener('click', () => {
    const raw = generateMultiFrameworkSnippet(quickstartSpec, homeFw, homeCss);
    navigator.clipboard?.writeText(raw);
    showMatzToast(`Código Quickstart (${homeFw.toUpperCase()}) copiado!`);
  });

  // AI-First Context Tabs & Copy Listeners
  container.querySelectorAll<HTMLButtonElement>('[data-ai-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeAiTab = (btn.dataset.aiTab as AiContextTabID) || 'agents-md';
      renderAiContextBox();
    });
  });

  const copyAiContext = () => {
    const item = AI_CONTEXT_SNIPPETS[activeAiTab];
    navigator.clipboard?.writeText(item.code);
    showMatzToast(`Contexto IA (${item.title}) copiado para a área de transferência!`);
  };
  container.querySelector('#ai-copy-active-btn')?.addEventListener('click', copyAiContext);
  container.querySelector('#ai-copy-bottom-btn')?.addEventListener('click', copyAiContext);

  // Interactive Playground Tabs + X-Ray & Grid Toggles
  container.querySelectorAll<HTMLButtonElement>('[data-pg-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePlaygroundTab = (btn.dataset.pgTab as PlaygroundTabID) || 'website';
      renderPlaygroundStage();
    });
  });

  const xrayBtn = container.querySelector<HTMLButtonElement>('#home-pg-xray-btn');
  xrayBtn?.addEventListener('click', () => {
    homeStageXray = !homeStageXray;
    xrayBtn.classList.toggle('matz-btn-primary', homeStageXray);
    renderPlaygroundStage();
  });

  const gridBtn = container.querySelector<HTMLButtonElement>('#home-pg-grid-btn');
  gridBtn?.addEventListener('click', () => {
    homeStageGrid = !homeStageGrid;
    gridBtn.classList.toggle('matz-btn-primary', homeStageGrid);
    renderPlaygroundStage();
  });

  container.querySelector('#home-pg-copy-scenario')?.addEventListener('click', () => {
    const code = SCENARIO_CODE_MAP[activePlaygroundTab];
    navigator.clipboard?.writeText(code);
    showMatzToast(`Código do cenário "${activePlaygroundTab.toUpperCase()}" copiado!`);
  });

  const pgStage = container.querySelector<HTMLElement>('#home-playground-stage');
  pgStage?.addEventListener('mouseover', (e) => {
    if (!homeStageXray) return;
    const el = e.target as HTMLElement | null;
    if (!el || el === pgStage) return;
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const lbl = container.querySelector<HTMLElement>('#home-xray-target-lbl');
    if (lbl) {
      lbl.innerHTML = `Elemento: <strong style="color:#22d3ee;">&lt;${tag}${cls}&gt;</strong> · Box: <strong style="color:#f472b6;">${Math.round(rect.width)}px × ${Math.round(rect.height)}px</strong>`;
    }
  });

  return () => {
    if (streamCleanup) streamCleanup();
  };
}
