import { matzIcon } from '../icons/Icons';
import { openMatzDialog } from '../components/RichComponents';

export type ReleaseChannel = 'alpha' | 'beta' | 'rc' | 'stable';

export interface VersionReleaseNote {
  version: string;
  channel: ReleaseChannel;
  date: string;
  codename: string;
  summary: string;
  highlights: string[];
}

export interface RoadmapMilestone {
  targetVersion: string;
  channel: ReleaseChannel;
  title: string;
  status: 'in-progress' | 'planned' | 'completed';
  items: string[];
}

export const MATZ_UI_VERSION = {
  version: '0.1.0-beta.1',
  major: 0,
  minor: 1,
  patch: 0,
  prerelease: 'beta.1',
  channel: 'beta' as ReleaseChannel,
  stageLabel: 'BETA · Em Testes & Desenvolvimento',
  codename: 'Specular Obsidian',
  buildNumber: '2026.11.06-b104',
  releases: [
    {
      version: '0.1.0-beta.1',
      channel: 'beta',
      date: '2026-11-06',
      codename: 'Specular Obsidian',
      summary:
        'Primeiro release público em canal Beta com arquitetura Dual-Theme (Specular Obsidian & Architectural Alabaster), suporte Multi-Framework (React, Next.js, Vue, Svelte, Tailwind, SCSS) e camada de encapsulamento nativo para Go + Wails.',
      highlights: [
        'Camada de encapsulamento Wails Bridge (@matz/ui/wails) com seleção modular de capacidades (Window Controls, IPC Events, Dialogs, Go Bindings, PTY e SQLite)',
        'Página Inicial (Landing App) interativa construída 100% com os próprios componentes da biblioteca',
        'Estação de Engenharia de UX Widescreen (100vw): UX Screen Composer, Analisador WCAG 2.1 AAA/AA em tempo real e Simulador de Daltonismo',
        'Padronização de superfícies de formulário (--surface-input) eliminando qualquer vazamento de fundo branco em Dark e Light mode',
      ],
    },
    {
      version: '0.1.0-alpha.3',
      channel: 'alpha',
      date: '2026-11-05',
      codename: 'Chromatic Glass',
      summary:
        'Introdução do motor de telemetria e gráficos 60fps em SVG/Canvas sem dependências externas.',
      highlights: [
        'Radial Arc Gauge 270° e Speedometer Gauge 240° com sliders táteis em tempo real',
        'Osciloscópio de Telemetria a 60fps em HTML5 Canvas e Matriz de Atividade de 52 semanas',
        'Gráficos interativos de Área com crosshair, Barras Empilhadas e Rosca (Donut)',
      ],
    },
    {
      version: '0.1.0-alpha.2',
      channel: 'alpha',
      date: '2026-11-03',
      codename: 'Local-First Core',
      summary:
        'Integração dos módulos embarcáveis da suíte (Cliente HTTP/mTLS, Editor Markdown/Vault E2EE e Terminal PTY).',
      highlights: [
        'MatzApiClientModule com seletor Combobox customizado para verbos HTTP',
        'MatzEditorModule com preview Markdown, contagem de leitura e flag Argon2id',
        'Conjunto proprietário de 48+ ícones vetoriais SVG com traço de 1.75px',
      ],
    },
  ] as VersionReleaseNote[],
  roadmap: [
    {
      targetVersion: '0.1.0-beta.1',
      channel: 'beta',
      title: 'Fundação Visual, UX Workbench & Camada Nativa Wails',
      status: 'in-progress',
      items: [
        'Testes de estresse de componentes em diferentes resoluções e densidades (Compact, Default, Spacious)',
        'Encapsulamento seletivo de APIs nativas do Wails v2/v3 com fallback automático para Web',
        'Geradores de código para React 19, Next.js 15, Vue 3, Svelte 5 e Tailwind CSS',
      ],
    },
    {
      targetVersion: '0.2.0-beta.1',
      channel: 'beta',
      title: 'Propagação Unificada na Suíte Desktop & Web',
      status: 'planned',
      items: [
        'Aplicação dos componentes revisados no Heapi, MyTerm, Writtt e byCode IDE',
        'Sincronização de temas e preferências de UX via ~/.matz/config.yaml',
        'Testes automatizados de regressão visual e acessibilidade WCAG AAA',
      ],
    },
    {
      targetVersion: '1.0.0',
      channel: 'stable',
      title: 'Release Comercial & Pacotes Premium de Interfaces',
      status: 'planned',
      items: [
        'Distribuição oficial do pacote @matz/ui com semântica de versão estável (SemVer)',
        'Catálogo comercial de templates e blocos prontos para aplicações SaaS e Desktop',
      ],
    },
  ] as RoadmapMilestone[],
};

export function formatVersionBadgeHtml(): string {
  return `
    <span class="matz-badge matz-badge-amber" style="cursor:pointer;" id="matz-version-trigger" title="Clique para inspecionar o Changelog & Roadmap Beta">
      ${matzIcon('git-branch', 11)}
      <span>v${MATZ_UI_VERSION.version}</span>
      <span style="opacity:0.75;font-size:9.5px;text-transform:uppercase;">· ${MATZ_UI_VERSION.channel}</span>
    </span>
  `;
}

export function openMatzVersionModal(): void {
  const html = `
    <div style="display:flex;flex-direction:column;gap:16px;max-height:68vh;overflow-y:auto;padding-right:4px;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:var(--radius-sm);background:var(--surface-subtle);border:1px solid var(--border);">
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Versão Atual & Canal</div>
          <div style="font-size:16px;font-weight:800;color:var(--text-primary);margin-top:2px;">
            @matz/ui v${MATZ_UI_VERSION.version} <span class="matz-badge matz-badge-amber">${MATZ_UI_VERSION.stageLabel}</span>
          </div>
        </div>
        <div style="text-align:right;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">
          <div>Codename: ${MATZ_UI_VERSION.codename}</div>
          <div>Build: ${MATZ_UI_VERSION.buildNumber}</div>
        </div>
      </div>

      <div>
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);margin-bottom:8px;">
          Histórico de Releases (SemVer Beta)
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${MATZ_UI_VERSION.releases
            .map(
              (r) => `
            <div style="padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface-canvas);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <strong style="font-size:13px;font-family:var(--font-mono);">v${r.version} — ${r.codename}</strong>
                <span class="matz-badge ${r.channel === 'beta' ? 'matz-badge-amber' : 'matz-badge-cyan'}" style="font-size:9.5px;">${r.date}</span>
              </div>
              <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">${r.summary}</p>
              <ul style="padding-left:16px;font-size:11.5px;color:var(--text-muted);display:flex;flex-direction:column;gap:4px;">
                ${r.highlights.map((h) => `<li>${h}</li>`).join('')}
              </ul>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  openMatzDialog(
    'Sistema de Versionamento & Release Channel (@matz/ui)',
    'Acompanhamento de ciclos de desenvolvimento, estabilidade de componentes e notas de versão.',
    html
  );
}
