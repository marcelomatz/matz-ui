import { matzIcon, MatzIconName } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';
import { highlightMatzCode } from '../ux/MultiFrameworkCode';
import {
  renderArcGauge,
  renderInteractiveAreaChart,
  renderRingDonutChart,
  renderSparklineCard,
  renderSpeedometerGauge,
} from '../analytics/ChartsAndGauges';
import {
  renderMatzCompleteWebsiteShowcase,
  renderMatzEcommerceSuite,
  renderMatzKanbanWorkspace,
} from './WebsiteAndLayoutComponents';

export interface ExpandedDocPageSpec {
  id: string;
  category: string;
  title: string;
  badge?: string;
  description: string;
  codeSnippet: string;
  tokens: Array<[string, string, string]>;
  mountPreview: (stage: HTMLElement) => (() => void) | void;
}

/**
 * Interactive Multi-Variant Component Stage Renderer
 * Renders a rich 3-part live workbench for each component:
 * 1. Interactive Variants & States Playground
 * 2. Real-World Application Context Example
 * 3. Quick Copyable API & Token Bar
 */
function createInteractiveSpecPage(config: {
  id: string;
  category: string;
  title: string;
  badge: string;
  description: string;
  fnName: string;
  icon: MatzIconName;
  variants: Array<{ label: string; badge: string; desc: string }>;
  tokens: Array<[string, string, string]>;
  customRender?: (host: HTMLElement, activeVariantIdx: number) => void;
}): ExpandedDocPageSpec {
  return {
    id: config.id,
    category: config.category,
    title: config.title,
    badge: config.badge,
    description: config.description,
    codeSnippet: `import '@matz/ui/styles.css';
import { ${config.fnName} } from '@matz/ui';

// Instanciação determinística em Vanilla TypeScript (Zero Dependências)
const instance = ${config.fnName}(document.getElementById('${config.id}-root')!, {
  variant: '${config.variants[0]?.label.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default'}',
  interactive: true,
  accessible: true,
});`,
    tokens: config.tokens,
    mountPreview: (stage) => {
      let activeIdx = 0;
      let sliderVal = 68;
      let toggled = true;
      let count = 4;

      const draw = () => {
        const currentVar = config.variants[activeIdx] || config.variants[0];

        stage.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:18px;width:100%;min-width:0;">
            <!-- Top Variant & State Selector Bar -->
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:12px 16px;border-radius:var(--radius-md);background:var(--surface-elevated);border:1px solid var(--border);">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:32px;height:32px;border-radius:8px;background:var(--accent-muted);color:var(--accent);display:flex;align-items:center;justify-content:center;">
                  ${matzIcon(config.icon, 16)}
                </div>
                <div>
                  <strong style="font-size:13.5px;display:block;">Variante Ativa: ${currentVar.label}</strong>
                  <span style="font-size:11.5px;color:var(--text-secondary);">${currentVar.desc}</span>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <div class="matz-segmented">
                  ${config.variants
                    .map(
                      (v, i) => `
                    <button type="button" class="matz-segmented-btn ${activeIdx === i ? 'active' : ''}" data-var-idx="${i}">
                      ${v.label}
                    </button>`
                    )
                    .join('')}
                </div>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="import { ${config.fnName} } from '@matz/ui';">
                  Copiar Import ⧉
                </button>
              </div>
            </div>

            <!-- Main Interactive Showcase Grid -->
            <div id="custom-comp-stage" style="min-width:0;width:100%;"></div>

            <!-- Interactive State & Ergonomics Controller Bar -->
            <div class="matz-card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;background:var(--surface-card-solid);">
              <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                  <span>Valor / Progresso:</span>
                  <input type="range" id="comp-live-slider" min="0" max="100" value="${sliderVal}" aria-label="Ajustar valor do componente" style="width:110px;accent-color:var(--accent);" />
                  <strong class="matz-tabular" style="color:var(--accent);">${sliderVal}%</strong>
                </label>

                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-secondary);">
                  <span>Estado Ativo:</span>
                  <button type="button" class="matz-switch ${toggled ? 'active' : ''}" id="comp-live-switch" aria-label="Alternar estado ativo"></button>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:8px;">
                <button type="button" class="matz-btn matz-btn-sm" id="comp-dec-btn">−</button>
                <span class="matz-badge matz-tabular">${count} itens</span>
                <button type="button" class="matz-btn matz-btn-sm" id="comp-inc-btn">+</button>
                <button type="button" class="matz-btn matz-btn-sm matz-btn-primary" id="comp-trigger-action">
                  ${matzIcon('check-circle', 12)} Testar Evento
                </button>
              </div>
            </div>
          </div>
        `;

        const host = stage.querySelector<HTMLElement>('#custom-comp-stage')!;
        if (config.customRender) {
          config.customRender(host, activeIdx);
        } else {
          host.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;">
              ${Array.from({ length: Math.min(6, Math.max(2, count)) })
                .map(
                  (_, idx) => `
                <div class="matz-card matz-beam-top" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;opacity:${
                  toggled ? '1' : '0.55'
                };">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="color:var(--accent);display:inline-flex;">${matzIcon(config.icon, 16)}</span>
                      <strong style="font-size:14px;">${config.title.split(',')[0]} #${idx + 1}</strong>
                    </div>
                    <span class="matz-badge ${idx === 0 ? 'matz-badge-cyan' : 'matz-badge-emerald'}">${currentVar.badge}</span>
                  </div>

                  <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.55;margin:0;">
                    ${currentVar.desc} — Calibrado com tokens semânticos e suporte completo a teclado WAI-ARIA.
                  </p>

                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);">
                      <span>Métrica em Tempo Real</span>
                      <strong class="matz-tabular" style="color:var(--text-primary);">${Math.max(10, (sliderVal + idx * 9) % 100)}%</strong>
                    </div>
                    <div class="matz-progress-track">
                      <div class="matz-progress-fill" style="width:${Math.max(10, (sliderVal + idx * 9) % 100)}%;"></div>
                    </div>
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border);">
                    <input class="matz-input" value="${currentVar.label} · Item ${idx + 1}" aria-label="Editar item" style="height:30px;font-size:12px;width:62%;" />
                    <button type="button" class="matz-btn matz-btn-sm ${idx === 0 ? 'matz-btn-primary' : ''}" data-item-act="${idx + 1}">
                      Acionar
                    </button>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          `;

          host.querySelectorAll<HTMLButtonElement>('[data-item-act]').forEach((b) => {
            b.addEventListener('click', () => {
              showMatzToast(`${config.title}: Ação executada no item #${b.dataset.itemAct}!`);
            });
          });
        }

        stage.querySelectorAll<HTMLButtonElement>('[data-var-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            activeIdx = Number(btn.dataset.varIdx);
            draw();
          });
        });

        stage.querySelector<HTMLInputElement>('#comp-live-slider')?.addEventListener('input', (e) => {
          sliderVal = Number((e.target as HTMLInputElement).value);
          draw();
        });

        stage.querySelector('#comp-live-switch')?.addEventListener('click', () => {
          toggled = !toggled;
          draw();
        });

        stage.querySelector('#comp-dec-btn')?.addEventListener('click', () => {
          count = Math.max(2, count - 1);
          draw();
        });

        stage.querySelector('#comp-inc-btn')?.addEventListener('click', () => {
          count = Math.min(6, count + 1);
          draw();
        });

        stage.querySelector('#comp-trigger-action')?.addEventListener('click', () => {
          showMatzToast(`Evento disparado em ${config.fnName} (${currentVar.label})!`);
        });
      };

      draw();
    },
  };
}

export const EXPANDED_CATALOG_PAGES: ExpandedDocPageSpec[] = [
  // ==========================================================================
  // 1. OVERVIEW & FOUNDATION (Additional Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'design-tokens-w3c',
    category: '1. Overview & Foundation',
    title: 'W3C Design Tokens, CSS Variables & Scales',
    badge: 'W3C Standard',
    description:
      'Arquitetura padronizada de Design Tokens no formato oficial W3C (.tokens.json), mapeando cores tonais, tipografia, raios geométricos e camadas de estado para CSS3, Tailwind v4 e Go + Wails.',
    fnName: 'exportMatzW3CTokens',
    icon: 'palette',
    variants: [
      { label: 'W3C JSON', badge: 'Standard', desc: 'Esquema hierárquico compatível com Style Dictionary e Figma Tokens' },
      { label: 'CSS3 Custom Props', badge: 'Zero-Runtime', desc: 'Variáveis nativas :root com alternância instantânea Dark/Light' },
      { label: 'Tailwind v4 @theme', badge: 'Utility', desc: 'Mapeamento direto para classes utilitárias sem configuração JS' },
    ],
    tokens: [
      ['--surface-canvas', '#080a10 / #f8fafc', 'Token global de superfície de fundo'],
      ['--surface-card-solid', '#0c0f18 / #ffffff', 'Token de superfície de cartões e módulos'],
      ['--surface-input', '#0a0d15 / #ffffff', 'Token de controles de entrada sem vazamento branco'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'spacing-elevation-grid',
    category: '1. Overview & Foundation',
    title: 'Spacing System, Elevation 0–5 & 8px Grid',
    badge: 'Spatial System',
    description:
      'Sistema espacial baseado em múltiplos de 4px/8px combinado com os 6 níveis de elevação especular (Nível 0 a Nível 5) para hierarquia óptica sem poluição de bordas.',
    fnName: 'applyMatzSpatialGrid',
    icon: 'grid',
    variants: [
      { label: 'Elevação 0–5', badge: 'Specular 1px', desc: 'Combinação de tintura tonal de superfície e sombra difusa' },
      { label: 'Grade 8px', badge: 'Spatial', desc: 'Ritmo vertical e horizontal estrito para alta densidade' },
      { label: 'Densidade Compact/Spacious', badge: 'Ergonomics', desc: 'Escalonamento dinâmico de paddings e alturas de controles' },
    ],
    tokens: [
      ['--shadow-specular', 'inset 0 1px 0 + ambient', 'Elevação com feixe superior de 1px'],
      ['--control-height', '32px / 36px / 42px', 'Altura ergonômica adaptativa por densidade'],
    ],
  }),

  // ==========================================================================
  // 2. FORM & INPUTS (11 Additional Rich Input Components)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'number-input-stepper',
    category: '2. Form & Inputs',
    title: 'Number Input, Counter & Spinbutton',
    badge: 'Tabular Numeric',
    description:
      'Campo numérico de precisão com botões de incremento/decremento, suporte a passo customizado (step), limites min/max, formatação de moeda/unidade e teclas direcionais.',
    fnName: 'renderMatzNumberInput',
    icon: 'sliders',
    variants: [
      { label: 'Counter Stepper', badge: 'Tabular', desc: 'Controle numérico com botões + e − integrados' },
      { label: 'Currency & Unit', badge: 'Formatted', desc: 'Prefixo monetário (R$, USD) ou sufixo técnico (ms, MB, %)' },
      { label: 'Compact Spinbutton', badge: 'Dense', desc: 'Ideal para células de tabela e carrinhos de e-commerce' },
    ],
    tokens: [
      ['role="spinbutton"', 'aria-valuenow / min / max', 'Acessibilidade nativa para campos numéricos'],
      ['.matz-tabular', 'tabular-nums', 'Impede oscilação horizontal ao incrementar dígitos'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'range-slider-dual',
    category: '2. Form & Inputs',
    title: 'Range Slider, Dual Thumb & Marks',
    badge: '60fps Drag',
    description:
      'Controle deslizante contínuo e discreto com suporte a intervalo duplo (min/max), marcações de escala (ticks), tooltip de valor em tempo real e sincronização com Gauges.',
    fnName: 'renderMatzRangeSlider',
    icon: 'sliders-code',
    variants: [
      { label: 'Single Range', badge: 'Continuous', desc: 'Deslizamento fluido com preenchimento gradiente' },
      { label: 'Dual Thumb (Min/Max)', badge: 'Interval', desc: 'Seleção de faixa de preço ou janela de frequência' },
      { label: 'Stepped Marks', badge: 'Discrete', desc: 'Pontos de parada calibrados (0%, 25%, 50%, 75%, 100%)' },
    ],
    tokens: [
      ['accent-color', 'var(--accent)', 'Sincronização cromática com a paleta ativa'],
      ['aria-valuetext', 'Formatted Value', 'Leitura clara do valor para leitores de tela'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'date-time-picker',
    category: '2. Form & Inputs',
    title: 'Date Picker, Date Range & Time Selector',
    badge: 'Calendar UI',
    description:
      'Seletor de data e hora com grade mensal navegável, atalhos rápidos (Hoje, Últimos 7 dias, Este mês), seleção de intervalo (Date Range) e seletor de horário 24h.',
    fnName: 'renderMatzDatePicker',
    icon: 'calendar',
    variants: [
      { label: 'Single Date', badge: 'Popover', desc: 'Calendário compacto com navegação por teclado' },
      { label: 'Date Range + Presets', badge: 'Analytics', desc: 'Filtro de período para dashboards e relatórios' },
      { label: 'DateTime 24h', badge: 'Precision', desc: 'Combinação de data, hora, minuto e fuso horário UTC' },
    ],
    tokens: [
      ['--surface-popover', '#111623 / #ffffff', 'Superfície flutuante do calendário'],
      ['.matz-tabular', 'Grid Alignment', 'Alinhamento perfeito dos dias do mês'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'color-picker-swatches',
    category: '2. Form & Inputs',
    title: 'Color Picker, HEX/HSL Input & Swatches',
    badge: 'Chromatic',
    description:
      'Seletor cromático profissional com espectro 2D, controle de opacidade (Alpha), entradas diretas HEX/RGB/HSL, conta-gotas e paleta de amostras (Swatches) verificadas para WCAG.',
    fnName: 'renderMatzColorPicker',
    icon: 'droplet',
    variants: [
      { label: 'Spectrum + HEX', badge: 'Full', desc: 'Controle completo de matiz, saturação e luminosidade' },
      { label: 'Brand Swatches', badge: 'Presets', desc: 'Grade rápida de cores semânticas do Design System' },
      { label: 'Alpha Channel', badge: 'RGBA/HSLA', desc: 'Ajuste de transparência para camadas de vidro e estado' },
    ],
    tokens: [
      ['--accent', 'Dynamic Seed', 'Atualiza a cor semente do tema em tempo real'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'file-upload-dropzone',
    category: '2. Form & Inputs',
    title: 'File Upload, Drag-and-Drop Zone & Progress',
    badge: 'Dropzone',
    description:
      'Zona de upload por arrastar e soltar (Drag & Drop) com validação de MIME type e tamanho máximo, pré-visualização de miniaturas e barra de progresso individual por arquivo.',
    fnName: 'renderMatzFileDropzone',
    icon: 'cloud-upload',
    variants: [
      { label: 'Drag & Drop Zone', badge: 'Multi-File', desc: 'Área tracejada interativa com feedback de hover' },
      { label: 'Upload Progress List', badge: 'Streaming', desc: 'Lista de arquivos com taxa de transferência e cancelamento' },
      { label: 'Avatar / Image Crop', badge: 'Media', desc: 'Upload compacto com pré-visualização circular imediata' },
    ],
    tokens: [
      ['border-style: dashed', 'var(--border-strong)', 'Indicador visual de área de soltura'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'tag-multi-input',
    category: '2. Form & Inputs',
    title: 'Tag Input, Email Chips & Tokenized Field',
    badge: 'Multi-Token',
    description:
      'Campo de entrada tokenizado que converte textos separados por Enter ou vírgula em Input Chips removíveis via clique ou tecla Backspace, ideal para destinatários de e-mail e filtros.',
    fnName: 'renderMatzTagInput',
    icon: 'tag',
    variants: [
      { label: 'Tag Tokenizer', badge: 'Chips', desc: 'Criação e remoção fluida de tags com validação de duplicatas' },
      { label: 'Email Recipients', badge: 'Validation', desc: 'Valida formato de e-mail e destaca endereços inválidos' },
      { label: 'Keyword Filter Bar', badge: 'Search', desc: 'Combina pares chave:valor (ex: status:active region:sp)' },
    ],
    tokens: [
      ['--surface-input', 'Unified Wrapper', 'Contêiner que agrupa chips e input nativo sem borda dupla'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'autocomplete-suggestions',
    category: '2. Form & Inputs',
    title: 'Autocomplete Input & Async Search',
    badge: 'Typeahead',
    description:
      'Campo de busca preditiva com debounce integrado, destaque de termos correspondentes, agrupamento por categoria, histórico recente e suporte a fontes assíncronas.',
    fnName: 'renderMatzAutocomplete',
    icon: 'search',
    variants: [
      { label: 'Instant Typeahead', badge: 'Local', desc: 'Filtragem em < 1ms com realce do trecho buscado' },
      { label: 'Async API Search', badge: 'Debounced', desc: 'Indicador de carregamento e tratamento de lista vazia' },
      { label: 'Command Suggestions', badge: 'AI Prompt', desc: 'Sugestões acionadas por / ou @ em editores' },
    ],
    tokens: [
      ['role="combobox"', 'aria-autocomplete="list"', 'Padrão WAI-ARIA para campos preditivos'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'rating-stars-feedback',
    category: '2. Form & Inputs',
    title: 'Star Rating, Emoji Reaction & NPS Scale',
    badge: 'Feedback UI',
    description:
      'Controles de avaliação e sentimento do usuário: classificação de 1 a 5 estrelas (com suporte a meia estrela), barra de reação rápida e escala Net Promoter Score (0 a 10).',
    fnName: 'renderMatzRatingInput',
    icon: 'star',
    variants: [
      { label: '5-Star Rating', badge: 'Interactive', desc: 'Seleção por hover e teclado com contagem de avaliações' },
      { label: 'NPS Score (0–10)', badge: 'Enterprise', desc: 'Escala numérica segmentada entre Detratores, Neutros e Promotores' },
      { label: 'Sentiment Reaction', badge: 'Quick Poll', desc: 'Feedback instantâneo para artigos de documentação e respostas de IA' },
    ],
    tokens: [
      ['role="radiogroup"', 'Keyboard Arrows', 'Navegação acessível entre notas com setas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'transfer-dual-list',
    category: '2. Form & Inputs',
    title: 'Transfer List & Dual Column Selector',
    badge: 'RBAC / Permissions',
    description:
      'Seletor de lista dupla para transferência de itens entre "Disponíveis" e "Selecionados", com busca independente em cada coluna, seleção em lote e contadores tabulares.',
    fnName: 'renderMatzTransferList',
    icon: 'split-horizontal',
    variants: [
      { label: 'Dual Transfer List', badge: 'Searchable', desc: 'Ideal para atribuição de permissões RBAC e colunas de exportação' },
      { label: 'Grouped Transfer', badge: 'Hierarchical', desc: 'Transferência organizada por departamentos ou categorias' },
    ],
    tokens: [
      ['--surface-card-solid', 'Dual Pane', 'Painéis gêmeos com rolagem independente'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'cascader-hierarchy-select',
    category: '2. Form & Inputs',
    title: 'Cascader & Multi-Level Category Select',
    badge: 'Multi-Level',
    description:
      'Seletor em cascata para estruturas hierárquicas profundas (ex: País → Estado → Cidade ou Organização → Cluster → Namespace) exibidas em colunas lado a lado.',
    fnName: 'renderMatzCascader',
    icon: 'folder-open',
    variants: [
      { label: '3-Level Cascader', badge: 'Columns', desc: 'Seleção progressiva com caminho completo exibido no input' },
      { label: 'Hover Expand', badge: 'Fast Nav', desc: 'Abre subníveis instantaneamente ao passar o cursor' },
    ],
    tokens: [
      ['aria-haspopup="tree"', 'Multi-Column Menu', 'Navegação estruturada por setas ← e →'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'form-validation-wizard',
    category: '2. Form & Inputs',
    title: 'Form Layout, Inline Validation & Fieldsets',
    badge: 'Zero-CLS Errors',
    description:
      'Arquitetura completa de formulários com validação síncrona/assíncrona, mensagens de erro sem deslocamento de layout (Zero-CLS), indicadores de força de senha e agrupamento semântico.',
    fnName: 'renderMatzValidatedForm',
    icon: 'shield-check',
    variants: [
      { label: 'Inline Validation', badge: ' WCAG AAA', desc: 'Estados de erro, alerta e sucesso com ícones redundantes' },
      { label: 'Multi-Column Fieldset', badge: 'Enterprise', desc: 'Grade responsiva para cadastros complexos de ERP' },
      { label: 'Sticky Form Actions', badge: 'UX Pattern', desc: 'Barra inferior fixa para salvar ou descartar alterações' },
    ],
    tokens: [
      ['aria-invalid="true"', 'aria-describedby', 'Associação automática entre campo e mensagem de erro'],
    ],
  }),

  // ==========================================================================
  // 3. PRIMITIVES & LAYOUT (7 Additional Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'button-group-split',
    category: '3. Primitives & Layout',
    title: 'Button Group, Split Button & Floating Action FAB',
    badge: 'Compound Action',
    description:
      'Agrupamentos de botões com bordas colapsadas, Split Button (ação principal + menu dropdown de variações) e Floating Action Button (FAB) compacto ou estendido.',
    fnName: 'renderMatzButtonGroup',
    icon: 'bolt',
    variants: [
      { label: 'Split Action Button', badge: 'Primary + Menu', desc: 'Combina execução imediata (ex: Deploy) com opções secundárias' },
      { label: 'Attached Button Group', badge: 'Toolbar', desc: 'Grupo contínuo para alinhamento, zoom ou paginação' },
      { label: 'Extended FAB', badge: 'Floating', desc: 'Botão de ação flutuante com elevação nível 3' },
    ],
    tokens: [
      ['role="group"', 'Joined Borders', 'Raios externos preservados e divisores internos de 1px'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'icon-button-toolbar',
    category: '3. Primitives & Layout',
    title: 'Icon Buttons, Action Bar & Formatting Toolbar',
    badge: '40x40 Hit Area',
    description:
      'Botões circulares e quadrados exclusivos para ícones com área de toque mínima garantida, estado toggle (pressed) e barras de ferramentas flutuantes para editores.',
    fnName: 'renderMatzIconToolbar',
    icon: 'wand',
    variants: [
      { label: 'Formatting Toolbar', badge: 'Editor', desc: 'Barra de formatação rica com separadores e atalhos Kbd' },
      { label: 'Toggle Icon Buttons', badge: 'aria-pressed', desc: 'Botões de estado binário (Favoritar, Fixar, Silenciar)' },
      { label: 'Ghost & Tonal Icons', badge: 'Subtle', desc: 'Variações de baixa interferência visual para cabeçalhos' },
    ],
    tokens: [
      ['aria-label', 'Mandatory A11y', 'Rótulo acessível obrigatório em botões sem texto visível'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'avatar-group-presence',
    category: '3. Primitives & Layout',
    title: 'Avatar, Avatar Stack & Presence Status',
    badge: 'Collaboration',
    description:
      'Avatares de usuário e agentes de IA com fallback automático para iniciais cromáticas, indicador luminoso de presença (Online, Ausente, Ocupado) e pilha sobreposta (+N).',
    fnName: 'renderMatzAvatarGroup',
    icon: 'users',
    variants: [
      { label: 'Overlapping Stack', badge: 'Multiplayer', desc: 'Pilha compacta de colaboradores ativos no documento' },
      { label: 'Presence & Status Ring', badge: 'Live Dot', desc: 'Indicador semântico de disponibilidade em tempo real' },
      { label: 'AI Agent Badges', badge: 'Bot Avatar', desc: 'Identificação visual diferenciada para agentes autônomos' },
    ],
    tokens: [
      ['--shape-full', '9999px / Squircle', 'Suporte a recorte circular ou squircle corporativo'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'divider-spacer-stack',
    category: '3. Primitives & Layout',
    title: 'Dividers, Vertical Separators & Flex/Grid Stack',
    badge: 'Layout Primitives',
    description:
      'Divisores horizontais e verticais com suporte a rótulo centralizado ou botão de expansão, acompanhados de containers utilitários HStack, VStack e Wrap.',
    fnName: 'renderMatzStackAndDividers',
    icon: 'columns',
    variants: [
      { label: 'Labeled Divider', badge: 'Section', desc: 'Linha especular de 1px com badge ou texto centralizado' },
      { label: 'HStack & VStack', badge: '8px Rhythm', desc: 'Alinhamento flexível com espaçamento padronizado por token' },
    ],
    tokens: [
      ['role="separator"', 'aria-orientation', 'Semântica estrutural para divisores horizontais e verticais'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'aspect-ratio-media',
    category: '3. Primitives & Layout',
    title: 'Aspect Ratio Container, Image Frame & Zoom',
    badge: 'Zero-CLS Media',
    description:
      'Contêiner de proporção fixa (16:9, 4:3, 1:1, 21:9) que reserva o espaço geométrico antes do carregamento da mídia, eliminando totalmente o Cumulative Layout Shift (CLS = 0).',
    fnName: 'renderMatzAspectRatio',
    icon: 'image',
    variants: [
      { label: '16:9 Widescreen Video', badge: 'Zero-CLS', desc: 'Proporção exata com skeleton shimmer durante carregamento' },
      { label: '1:1 Square & 4:3', badge: 'Gallery', desc: 'Moldura com legenda semântica <figure> + <figcaption>' },
    ],
    tokens: [
      ['aspect-ratio', '16 / 9 | 4 / 3 | 1 / 1', 'Reserva nativa de caixa no motor de layout CSS'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'scroll-area-virtual',
    category: '3. Primitives & Layout',
    title: 'Custom Scroll Area, Shadow Scroll & Back-to-Top',
    badge: 'Smooth Scroll',
    description:
      'Área de rolagem customizada com barras finas discretas, sombras indicadoras de conteúdo oculto no topo/base e botão flutuante para retorno imediato ao início.',
    fnName: 'renderMatzScrollArea',
    icon: 'arrow-up',
    variants: [
      { label: 'Shadow Scroll Container', badge: 'Optical Cue', desc: 'Exibe gradiente sutil indicando que há mais itens abaixo' },
      { label: 'Horizontal Snap Strip', badge: 'Touch/Wheel', desc: 'Rolagem horizontal com encaixe magnético (scroll-snap)' },
    ],
    tokens: [
      ['scrollbar-width: thin', 'Custom Scrollbar', 'Estilização consistente em Chromium, Firefox e WebKit/Wails'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'copy-button-clipboard',
    category: '3. Primitives & Layout',
    title: 'Copy Button, Snippet Pill & Share Action',
    badge: '1-Click Copy',
    description:
      'Botões e pílulas interativas para cópia instantânea de comandos CLI, chaves de API, hashes SHA-256, tokens CSS e blocos de código com confirmação visual e sonora.',
    fnName: 'renderMatzCopyButton',
    icon: 'copy',
    variants: [
      { label: 'Inline Copy Pill', badge: '.matz-copy-pill', desc: 'Pílula compacta para variáveis, URLs e imports' },
      { label: 'Secret Key Mask + Copy', badge: 'API Key', desc: 'Oculta token sensível com asteriscos e permite copiar em 1 clique' },
      { label: 'CLI Command Bar', badge: 'Terminal', desc: 'Caixa de comando completa com seletor de gerenciador de pacotes' },
    ],
    tokens: [
      ['data-matz-copy-text', 'Global Delegate', 'Atributo declarativo que ativa cópia automática em qualquer elemento'],
    ],
  }),

  // ==========================================================================
  // 4. OVERLAYS & NAVIGATION (Additional Navigation & Overlay Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'tabs-underline-pills',
    category: '4. Overlays & Navigation',
    title: 'Tabs: Underline, Pill, Vertical & Closeable',
    badge: 'WAI-ARIA Tabs',
    description:
      'Sistema completo de abas com indicador ativo deslizante, variação em pílula (.matz-segmented), abas verticais para configurações e abas dinâmicas fecháveis estilo IDE/Browser.',
    fnName: 'renderMatzTabs',
    icon: 'folder',
    variants: [
      { label: 'Segmented Pill Tabs', badge: 'Studio', desc: 'Alternância rápida com alto contraste em qualquer superfície' },
      { label: 'Closeable IDE Tabs', badge: 'Dynamic', desc: 'Permite abrir novas abas (+), reordenar e fechar (✕)' },
      { label: 'Vertical Settings Tabs', badge: 'Sidebar', desc: 'Navegação lateral para painéis de preferências' },
    ],
    tokens: [
      ['role="tablist"', 'role="tab" + role="tabpanel"', 'Conformidade integral com navegação por setas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'sidebar-collapsible-tree',
    category: '4. Overlays & Navigation',
    title: 'Collapsible Sidebar & Multi-Level Menu',
    badge: 'Progressive UX',
    description:
      'Barra lateral de navegação com categorias expansíveis, filtro de busca instantâneo, contadores numéricos por seção, atalhos fixados no topo e modo recolhido.',
    fnName: 'renderMatzCollapsibleSidebar',
    icon: 'sidebar',
    variants: [
      { label: 'Categorized Docs Sidebar', badge: 'Searchable', desc: 'Organização limpa para dezenas ou centenas de páginas' },
      { label: 'Multi-Level Nested Tree', badge: '3 Levels', desc: 'Submenus indentados com linha guia vertical de 1px' },
    ],
    tokens: [
      ['aria-expanded', 'true | false', 'Estado semântico sincronizado com o chevron rotativo'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'bottom-navigation-bar',
    category: '4. Overlays & Navigation',
    title: 'Bottom Navigation Bar & Mobile Dock',
    badge: 'Adaptive Mobile',
    description:
      'Barra de navegação inferior ergonômica para viewports compactos (< 600px) e janelas utilitárias, suportando de 3 a 5 destinos principais com badges de notificação.',
    fnName: 'renderMatzBottomNav',
    icon: 'smartphone',
    variants: [
      { label: 'Mobile Bottom Bar', badge: '4 Destinations', desc: 'Alcançabilidade máxima para o polegar em telas móveis' },
      { label: 'Floating Glass Dock', badge: 'Translucent', desc: 'Barra flutuante com backdrop-filter blur(20px)' },
    ],
    tokens: [
      ['backdrop-filter', 'blur(20px) saturate(180%)', 'Translúcido sobre o conteúdo rolável'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'anchor-scrollspy-toc',
    category: '4. Overlays & Navigation',
    title: 'Table of Contents (TOC) & Scrollspy Anchor',
    badge: 'Scrollspy',
    description:
      'Índice lateral fixo (Sticky Table of Contents) que monitora a posição de rolagem da página via IntersectionObserver e destaca automaticamente a seção em leitura.',
    fnName: 'renderMatzScrollspyTOC',
    icon: 'list',
    variants: [
      { label: 'Sticky Right TOC', badge: 'Scrollspy', desc: 'Indicador lateral ativo sincronizado com os títulos H2/H3' },
      { label: 'Reading Progress Bar', badge: '0–100%', desc: 'Inclui percentual de leitura concluída do artigo' },
    ],
    tokens: [
      ['IntersectionObserver', 'Zero Scroll Jank', 'Detecção passiva de cabeçalhos visíveis sem listener de scroll pesado'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'command-bar-dock',
    category: '4. Overlays & Navigation',
    title: 'Floating Command Dock & Quick Launcher',
    badge: 'Desktop & Web',
    description:
      'Dock flutuante interativo com ampliação suave de ícones, indicadores de aplicativos em execução, separadores contextuais e atalhos rápidos.',
    fnName: 'renderMatzCommandDock',
    icon: 'dock',
    variants: [
      { label: 'Interactive App Dock', badge: 'Magnify', desc: 'Lançador rápido de módulos (Terminal, Editor, API, IA)' },
      { label: 'Contextual Selection Bar', badge: 'Bulk Action', desc: 'Aparece na parte inferior ao selecionar múltiplos itens na tabela' },
    ],
    tokens: [
      ['--shadow-elevated', 'Floating Layer', 'Sombra profunda para destacar o dock sobre o canvas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'dropdown-context-menu',
    category: '4. Overlays & Navigation',
    title: 'Dropdown Menu, Submenus & Context Menu',
    badge: 'Right-Click & Menu',
    description:
      'Menus suspensos e menus de contexto acionados pelo botão direito (contextmenu), com suporte a ícones, atalhos de teclado alinhados à direita, itens selecionáveis e ações destrutivas.',
    fnName: 'renderMatzDropdownMenu',
    icon: 'more-horizontal',
    variants: [
      { label: 'Action Dropdown Menu', badge: 'Hotkeys', desc: 'Menu de opções com atalhos ⌘C, ⌘V, ⌫ e divisores' },
      { label: 'Right-Click Context Menu', badge: 'Canvas', desc: 'Menu contextual posicionado nas coordenadas exatas do cursor' },
    ],
    tokens: [
      ['role="menu"', 'role="menuitem"', 'Navegação completa por setas ↑/↓ e fechamento com Esc'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'menubar-desktop-app',
    category: '4. Overlays & Navigation',
    title: 'Desktop Application Menubar (File, Edit, View)',
    badge: 'Wails & IDE',
    description:
      'Barra de menu clássica de aplicações desktop (Arquivo, Editar, Exibir, Terminal, Janela, Ajuda) integrada à TitleBar sem bordas do Wails ou a IDEs web.',
    fnName: 'renderMatzDesktopMenubar',
    icon: 'app-window',
    variants: [
      { label: 'Frameless TitleBar Menu', badge: 'Wails v3', desc: 'Combina controles de janela nativos e menus de aplicação' },
      { label: 'Compact Studio Menubar', badge: 'Dense', desc: '28px de altura para máximo aproveitamento vertical' },
    ],
    tokens: [
      ['role="menubar"', '-webkit-app-region: no-drag', 'Permite clicar nos menus dentro de barras arrastáveis do Wails'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'toast-notifications',
    category: '4. Overlays & Navigation',
    title: 'Toast Queue, Action Toasts & Notification Stack',
    badge: 'Live Feedback',
    description:
      'Sistema de notificações empilhadas não-bloqueantes com auto-dismiss configurável, variantes semânticas (Sucesso, Alerta, Erro, Progresso) e botão de ação Desfazer.',
    fnName: 'showMatzToast',
    icon: 'bell',
    variants: [
      { label: 'Interactive Toast Stack', badge: 'Non-Blocking', desc: 'Empilhamento suave no canto inferior direito' },
      { label: 'Toast with Undo Action', badge: 'Recoverable', desc: 'Inclui botão de reversão imediata da operação' },
    ],
    tokens: [
      ['role="status"', 'aria-live="polite"', 'Anuncia notificações sem interromper o foco do usuário'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'alert-dialog-confirm',
    category: '4. Overlays & Navigation',
    title: 'Alert Dialog & Destructive Confirmation',
    badge: 'Focus Trap',
    description:
      'Modal de confirmação crítica com retenção de foco (Focus Trap), exigência opcional de digitação do nome do recurso para exclusão permanente e botões de alto contraste.',
    fnName: 'openMatzAlertDialog',
    icon: 'alert-triangle',
    variants: [
      { label: 'Destructive Confirm', badge: 'Safety Lock', desc: 'Prevenção de exclusão acidental de bancos de dados ou chaves' },
      { label: 'Unsaved Changes Prompt', badge: 'Guard', desc: 'Alerta ao sair de formulários com edições pendentes' },
    ],
    tokens: [
      ['role="alertdialog"', 'aria-modal="true"', 'Semântica estrita para decisões críticas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'popover-rich-card',
    category: '4. Overlays & Navigation',
    title: 'Popover, Filter Popover & Quick Edit',
    badge: 'Contextual Overlay',
    description:
      'Painel flutuante ancorado a um botão gatilho para edição rápida de propriedades, configuração de filtros compostos, compartilhamento de permissões ou calculadora inline.',
    fnName: 'renderMatzPopover',
    icon: 'sliders',
    variants: [
      { label: 'Quick Filter Popover', badge: 'Multi-Rule', desc: 'Adicione regras de filtragem sem sair da visualização atual' },
      { label: 'Share & Permissions', badge: 'Access Control', desc: 'Convite de membros e link de compartilhamento copiável' },
    ],
    tokens: [
      ['--surface-popover', 'z-index: 600', 'Camada flutuante com sombra especular profunda'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'hover-card-preview',
    category: '4. Overlays & Navigation',
    title: 'Hover Card & Rich Entity Preview',
    badge: 'Zero-Click Inspect',
    description:
      'Cartão de pré-visualização rico acionado ao repousar o cursor sobre links, menções (@usuario), commits Git ou IDs de servidores, exibindo métricas sem abrir nova página.',
    fnName: 'renderMatzHoverCard',
    icon: 'eye',
    variants: [
      { label: 'Developer / User Profile', badge: '@mention', desc: 'Mostra avatar, cargo, fuso horário e repositórios recentes' },
      { label: 'Server Node Preview', badge: 'Telemetry', desc: 'Exibe carga de CPU, memória e uptime instantaneamente no hover' },
    ],
    tokens: [
      ['transition-delay', '180ms open / 100ms close', 'Evita aberturas acidentais ao cruzar a tela rapidamente'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'tooltip-rich-hotkey',
    category: '4. Overlays & Navigation',
    title: 'Tooltips, Directional Hints & Hotkey Badges',
    badge: 'Micro-Help',
    description:
      'Dicas contextuais instantâneas com posicionamento inteligente (Top, Bottom, Left, Right), suporte a combinação de teclas (<kbd>) e descrições de métricas técnicas.',
    fnName: 'renderMatzTooltip',
    icon: 'help-circle',
    variants: [
      { label: 'Tooltip + Hotkey Kbd', badge: '⌘K / ⌘S', desc: 'Ensina atalhos de teclado naturalmente durante o uso' },
      { label: 'Metric Formula Tooltip', badge: 'Analytics', desc: 'Explica o cálculo exato de KPIs financeiros e P99' },
    ],
    tokens: [
      ['role="tooltip"', 'aria-describedby', 'Vinculação acessível ao botão ou ícone de origem'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'banner-announcement-strip',
    category: '4. Overlays & Navigation',
    title: 'Sticky Announcement Banner & Privacy Consent',
    badge: 'Site-Wide Strip',
    description:
      'Faixas globais de topo ou rodapé para comunicados de nova versão, janelas de manutenção programada, alertas de conectividade offline e consentimento LGPD/GDPR.',
    fnName: 'renderMatzBannerStrip',
    icon: 'flag',
    variants: [
      { label: 'Release Announcement', badge: 'Top Strip', desc: 'Faixa gradiente compacta com CTA e botão de fechar' },
      { label: 'Offline / Reconnecting', badge: 'Network', desc: 'Aviso automático quando a conexão WebSocket/IPC oscila' },
      { label: 'LGPD / Privacy Card', badge: 'Compliance', desc: 'Controle granular e transparente de preferências de cookies' },
    ],
    tokens: [
      ['position: sticky', 'top: 0 / bottom: 0', 'Permanência visual sem cobrir controles essenciais'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'empty-state-zero-data',
    category: '4. Overlays & Navigation',
    title: 'Empty States, Zero-Results & Onboarding Card',
    badge: 'First-Time UX',
    description:
      'Estados vazios construtivos para listas sem dados, buscas sem resultados ou projetos recém-criados, orientando o usuário com ações claras de criação ou importação.',
    fnName: 'renderMatzEmptyState',
    icon: 'inbox',
    variants: [
      { label: 'New Project Onboarding', badge: 'Actionable', desc: 'Guia inicial com 1 clique para criar o primeiro registro' },
      { label: 'Zero Search Results', badge: 'Clear Filter', desc: 'Sugere termos alternativos ou botão para limpar filtros' },
    ],
    tokens: [
      ['--surface-subtle', 'Dashed Container', 'Moldura acolhedora que evita telas em branco confusas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'error-boundary-fallback',
    category: '4. Overlays & Navigation',
    title: 'Error State, Crash Recovery & Diagnostic Card',
    badge: 'Resilience UX',
    description:
      'Superfície de recuperação de falhas (Error Boundary / 500 / Timeout) com código de diagnóstico copiável, stack trace recolhível e botão de nova tentativa imediata.',
    fnName: 'renderMatzErrorFallback',
    icon: 'bug',
    variants: [
      { label: 'Component Error Boundary', badge: 'Isolated', desc: 'Isola a falha em um único card sem derrubar o restante da aplicação' },
      { label: 'API / IPC Timeout Retry', badge: 'Backoff', desc: 'Contagem regressiva de reconexão automática + botão Tentar Agora' },
    ],
    tokens: [
      ['--status-err', '#ef4444 / #f43f5e', 'Sinalização semântica de falha com contraste seguro'],
    ],
  }),

  // ==========================================================================
  // 5. DATA DISPLAY (10 Additional Data Display & Visualization Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'tree-view-explorer',
    category: '5. Data Display',
    title: 'Tree View, File Explorer & JSON Inspector',
    badge: 'Hierarchical',
    description:
      'Visualizador de árvore hierárquica para diretórios de código, esquemas de banco de dados e objetos JSON profundos, com expansão recursiva, ícones por tipo de arquivo e busca.',
    fnName: 'renderMatzTreeView',
    icon: 'folder-open',
    variants: [
      { label: 'IDE File Explorer', badge: 'Files & Folders', desc: 'Árvore de diretórios com indicadores de modificação Git (M, U, A)' },
      { label: 'Interactive JSON Tree', badge: 'API Payload', desc: 'Inspeção colapsável de chaves, arrays e tipos primitivos com cópia de path' },
    ],
    tokens: [
      ['role="tree"', 'role="treeitem"', 'Navegação hierárquica padrão WAI-ARIA'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'description-property-list',
    category: '5. Data Display',
    title: 'Description List, Key-Value Grid & Metadata',
    badge: 'Inspector Grid',
    description:
      'Listas de descrição semânticas (<dl>, <dt>, <dd>) organizadas em colunas ou linhas zebradas para exibir especificações de servidores, faturas, certificados SSL e metadados.',
    fnName: 'renderMatzPropertyList',
    icon: 'file-text',
    variants: [
      { label: '2-Column Key-Value Card', badge: 'Metadata', desc: 'Pares rótulo/valor com botões de cópia rápida por linha' },
      { label: 'Compact Property Inspector', badge: 'Sidebar', desc: 'Grade densa ideal para painéis laterais de inspeção' },
    ],
    tokens: [
      ['<dl> + <dt> + <dd>', 'Semantic Pairs', 'Associação nativa entre chave e valor'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'stat-kpi-metric-cards',
    category: '5. Data Display',
    title: 'KPI Stat Cards, Delta Badges & Goal Meters',
    badge: 'Executive KPIs',
    description:
      'Cartões de indicadores-chave de desempenho (KPIs) combinando valor principal tabular, badge de variação percentual (Delta +/-), meta de progresso e mini-sparkline.',
    fnName: 'renderMatzStatCardGrid',
    icon: 'trending-up',
    variants: [
      { label: 'Executive KPI Row', badge: 'Sparkline + Delta', desc: 'Visão consolidada de receita, conversão, latência e usuários' },
      { label: 'Goal & Quota Progress', badge: 'Target Bar', desc: 'Compara o realizado contra a meta mensal com alerta de limite' },
    ],
    tokens: [
      ['.matz-tabular', 'Zero-Shift Numbers', 'Alinhamento perfeito de cifras financeiras'],
    ],
    customRender: (host) => {
      host.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;">
          ${renderSparklineCard({ title: 'Receita Anual (ARR)', value: 'R$ 5.14M', delta: '+24.8% YoY', data: [2.8, 3.2, 3.6, 4.1, 4.5, 4.8, 5.14], color: '#10b981' })}
          ${renderSparklineCard({ title: 'Throughput Global', value: '142.8k rps', delta: 'Pico Histórico', data: [85, 92, 104, 118, 125, 134, 142.8], color: '#8b5cf6' })}
          ${renderSparklineCard({ title: 'Taxa de Erro HTTP 5xx', value: '0.002%', delta: '-0.014% hoje', data: [0.04, 0.03, 0.02, 0.015, 0.008, 0.004, 0.002], color: '#06b6d4' })}
          ${renderSparklineCard({ title: 'Tempo de Build CI/CD', value: '18.4 s', delta: '-42% c/ Cache', data: [45, 38, 32, 28, 24, 20, 18.4], color: '#d946ef' })}
        </div>
      `;
    },
  }),
  createInteractiveSpecPage({
    id: 'calendar-schedule-view',
    category: '5. Data Display',
    title: 'Calendar Grid, Event Agenda & Date Strip',
    badge: 'Scheduling',
    description:
      'Visualizador de agenda e calendário de eventos para sprints, deploys programados, plantões de engenharia (On-Call) e reservas, com visão mensal, semanal e lista diária.',
    fnName: 'renderMatzScheduleCalendar',
    icon: 'calendar',
    variants: [
      { label: 'Sprint & Deploy Calendar', badge: 'Month Grid', desc: 'Grade com pílulas coloridas por categoria de evento' },
      { label: 'Daily Timeline Agenda', badge: 'Hourly', desc: 'Linha do tempo horária com indicador da hora atual' },
    ],
    tokens: [
      ['display: grid', 'repeat(7, minmax(0, 1fr))', 'Grade de 7 dias perfeitamente simétrica'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'kanban-board-columns',
    category: '5. Data Display',
    title: 'Kanban Board, Sprint Cards & Swimlanes',
    badge: 'Project Flow',
    description:
      'Quadro Kanban interativo multi-colunas com contagem de WIP (Work in Progress), cartões ricos com ID, tags, responsável, prioridade e movimentação instantânea entre etapas.',
    fnName: 'renderMatzKanbanWorkspace',
    icon: 'kanban',
    variants: [
      { label: 'Sprint Kanban Board', badge: 'Interactive', desc: 'Clique em qualquer cartão para avançar seu status na sprint' },
      { label: 'CRM Deal Pipeline', badge: 'Sales Funnel', desc: 'Colunas com soma financeira total por estágio do funil' },
    ],
    tokens: [
      ['--surface-elevated', 'Kanban Lane', 'Coluna de etapa com cabeçalho fixo e contador tabular'],
    ],
    customRender: (host) => {
      renderMatzKanbanWorkspace(host);
    },
  }),
  createInteractiveSpecPage({
    id: 'carousel-slider-gallery',
    category: '5. Data Display',
    title: 'Carousel, Content Slider & Media Gallery',
    badge: 'Snap Slider',
    description:
      'Carrossel interativo de cartões, depoimentos e capturas de tela com controles anterior/próximo, indicadores de página (dots), autoplay pausável e suporte a teclado.',
    fnName: 'renderMatzCarousel',
    icon: 'image',
    variants: [
      { label: 'Multi-Card Showcase', badge: 'Responsive', desc: 'Desliza suavemente entre cartões de recursos ou produtos' },
      { label: 'Full-Width Spotlight Slide', badge: 'Hero Gallery', desc: 'Apresentação passo a passo com legendas técnicas' },
    ],
    tokens: [
      ['scroll-snap-type', 'x mandatory', 'Ancoragem física suave nativa do CSS'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'masonry-bento-grid',
    category: '5. Data Display',
    title: 'Bento Grid & Asymmetric Feature Cards',
    badge: 'Modern Layout',
    description:
      'Grades assimétricas estilo Bento Box (combinando cartões 1x1, 2x1, 1x2 e 2x2) para vitrines de produtos, resumos executivos e páginas principais de alto impacto visual.',
    fnName: 'renderMatzBentoGrid',
    icon: 'grid',
    variants: [
      { label: 'Asymmetric Bento 4-Cell', badge: 'Featured', desc: 'Destaca o recurso principal em coluna dupla ao lado de métricas' },
      { label: 'Dense Telemetry Bento', badge: 'Dashboard', desc: 'Mosaico compacto sem espaços perdidos em telas widescreen' },
    ],
    tokens: [
      ['grid-column: span 2', 'Responsive Span', 'Colapsa automaticamente para 1 coluna em telas menores'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'comparison-matrix-table',
    category: '5. Data Display',
    title: 'Feature Comparison Matrix & Benchmark Table',
    badge: 'Decision Matrix',
    description:
      'Tabela comparativa de recursos, planos ou benchmarks técnicos com cabeçalho fixo, coluna em destaque, ícones de verificação (✓ / —) e dicas explicativas por linha.',
    fnName: 'renderMatzComparisonMatrix',
    icon: 'table',
    variants: [
      { label: 'Plan Feature Matrix', badge: 'SaaS Pricing', desc: 'Compara recursos entre planos Community, Pro e Enterprise' },
      { label: 'Performance Benchmark', badge: 'Engineering', desc: 'Compara tamanho de bundle, memória RAM e FPS' },
    ],
    tokens: [
      ['.matz-table', 'Sticky Header', 'Preserva os títulos das colunas durante a rolagem'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'diff-viewer-code',
    category: '5. Data Display',
    title: 'Code Diff Viewer (Side-by-Side & Unified)',
    badge: 'Git & AI Review',
    description:
      'Visualizador de diferenças de código (Git Diff / AI Patch) com numeração dupla de linhas, destaque semântico de adições (+) em esmeralda e remoções (−) em carmim.',
    fnName: 'renderMatzDiffViewer',
    icon: 'git-pull-request',
    variants: [
      { label: 'Unified Patch Diff', badge: '+14 / -4', desc: 'Visualização compacta ideal para revisão de PRs e patches de IA' },
      { label: 'Side-by-Side Split Diff', badge: '2 Columns', desc: 'Compara o arquivo original e modificado lado a lado' },
    ],
    tokens: [
      ['rgba(16, 185, 129, 0.14)', 'Diff Added Line', 'Fundo semântico de linha adicionada'],
      ['rgba(244, 63, 94, 0.14)', 'Diff Removed Line', 'Fundo semântico de linha removida'],
    ],
    customRender: (host) => {
      host.innerHTML = `
        <div class="matz-code-block">${highlightMatzCode(
          `// git diff · src/theme/tokens.ts (+4 -2)\n- const LEGACY_BG = '#ffffff';\n- const LEGACY_BORDER = '#cccccc';\n+ import '@matz/ui/styles.css';\n+ const SURFACE_CARD = 'var(--surface-card-solid)';\n+ const SURFACE_INPUT = 'var(--surface-input)';\n+ const BORDER_SPECULAR = 'var(--border)';`,
          'Diff Viewer · Unified Patch'
        )}</div>
      `;
    },
  }),
  createInteractiveSpecPage({
    id: 'log-viewer-console',
    category: '5. Data Display',
    title: 'Live Log Stream Viewer, Severity Filter & Search',
    badge: 'DevOps Console',
    description:
      'Console de logs em tempo real com filtragem instantânea por nível de severidade (INFO, WARN, ERROR, DEBUG), timestamps tabulares em microssegundos, auto-scroll e exportação.',
    fnName: 'renderMatzLogViewer',
    icon: 'terminal',
    variants: [
      { label: 'Real-Time Stream', badge: ' Tail -f', desc: 'Fluxo de logs coloridos com pausa automática ao selecionar texto' },
      { label: 'Error & Stack Filter', badge: 'Severity', desc: 'Isola imediatamente falhas críticas e exceções' },
    ],
    tokens: [
      ['--font-mono', 'JetBrains Mono', 'Alinhamento estrito de colunas de timestamp e serviço'],
    ],
  }),

  // ==========================================================================
  // 6. TELEMETRY, CHARTS & GAUGES (4 Additional Chart Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'candlestick-financial-chart',
    category: '6. Telemetry, Charts & Gauges',
    title: 'Financial Candlestick & Orderbook Depth',
    badge: 'FinTech 60fps',
    description:
      'Gráfico financeiro de velas (OHLC Candlestick) em SVG vetorial combinado com livro de ofertas (Orderbook Bids/Asks) de alta frequência e variação tabular.',
    fnName: 'renderMatzCandlestickChart',
    icon: 'coins',
    variants: [
      { label: 'OHLC Candlestick SVG', badge: 'Trading', desc: 'Velas de alta (Esmeralda) e baixa (Carmim) com pavio de máxima/mínima' },
      { label: 'Orderbook Depth Wall', badge: 'Bids / Asks', desc: 'Barras horizontais proporcionais ao volume de liquidez' },
    ],
    tokens: [
      ['#10b981 / #f43f5e', 'Bull / Bear Candles', 'Cores calibradas com suporte a simulador de daltonismo'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'radar-spider-chart',
    category: '6. Telemetry, Charts & Gauges',
    title: 'Radar / Spider Multi-Axis Benchmark Chart',
    badge: 'Multi-Axis SVG',
    description:
      'Gráfico de radar poligonal para comparação multidimensional (ex: Performance, Acessibilidade, Segurança, DX, Bundle Size e Latência) entre diferentes versões ou modelos.',
    fnName: 'renderMatzRadarChart',
    icon: 'radar',
    variants: [
      { label: '6-Axis System Benchmark', badge: 'Polygon SVG', desc: 'Sobreposição translúcida comparando duas séries de dados' },
      { label: 'AI Model Evaluation', badge: 'LLM Eval', desc: 'Compara raciocínio, velocidade, código e janela de contexto' },
    ],
    tokens: [
      ['fill-opacity: 0.22', 'Radar Polygon', 'Preenchimento translúcido que permite comparar séries sobrepostas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'funnel-conversion-chart',
    category: '6. Telemetry, Charts & Gauges',
    title: 'Conversion Funnel & Pipeline Drop-off Chart',
    badge: 'Growth & Analytics',
    description:
      'Visualizador de funil de conversão etapa por etapa (Visitantes → Cadastro → Ativação → Assinatura Pro) destacando a taxa de retenção e o gargalo de perda.',
    fnName: 'renderMatzFunnelChart',
    icon: 'filter',
    variants: [
      { label: 'SaaS Onboarding Funnel', badge: 'Conversion %', desc: 'Exibe volume absoluto e percentual de passagem entre etapas' },
      { label: 'E-Commerce Checkout Funnel', badge: 'Cart → Paid', desc: 'Identifica abandono de carrinho em tempo real' },
    ],
    tokens: [
      ['--accent-secondary', 'Stage Gradient', 'Degradê progressivo ao longo das etapas do funil'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'uptime-status-tracker',
    category: '6. Telemetry, Charts & Gauges',
    title: '90-Day Uptime Bars & SLA Latency Tracker',
    badge: 'Status Page',
    description:
      'Monitor de disponibilidade de serviços (estilo Status Page) com 90 barras diárias interativas, cálculo de SLA (99.99%), histórico de incidentes e latência média.',
    fnName: 'renderMatzUptimeTracker',
    icon: 'activity',
    variants: [
      { label: '90-Day Uptime Strip', badge: '99.998% SLA', desc: 'Passe o cursor sobre cada dia para inspecionar o tempo online' },
      { label: 'Multi-Region Health', badge: 'Global Edge', desc: 'Status consolidado de API, Banco de Dados, CDN e MCP Server' },
    ],
    tokens: [
      ['.matz-pulse-ring', 'Live Status Dot', 'Sinalizador verde pulsante de operação normal'],
    ],
  }),

  // ==========================================================================
  // 10. WEBSITE & PORTAL BLOCKS (7 Additional Marketing & Portal Sections)
  // ==========================================================================
  {
    id: 'website-complete-landing',
    category: '10. Website & Portal Blocks',
    title: 'Complete Website & SaaS Landing Page Template',
    badge: 'Full Page',
    description:
      'Página principal de website completa unindo Cabeçalho com Mega-Menu, Hero com Aurora Mesh, Bento Grid de Recursos, Tabela de Preços Interativa (Mensal/Anual), FAQ Accordion e Rodapé.',
    codeSnippet: `import { renderMatzCompleteWebsiteShowcase } from '@matz/ui';

renderMatzCompleteWebsiteShowcase(document.getElementById('website-root')!);`,
    tokens: [
      ['Header + Hero + Main + Pricing + FAQ + Footer', 'Complete Website', 'Página inteira pronta para produção'],
    ],
    mountPreview: (stage) => {
      renderMatzCompleteWebsiteShowcase(stage);
    },
  },
  createInteractiveSpecPage({
    id: 'pricing-table-tiers',
    category: '10. Website & Portal Blocks',
    title: 'Pricing Plans, Monthly/Annual Toggle & Enterprise Tier',
    badge: 'High Conversion',
    description:
      'Seção de preços e planos de assinatura com alternador Mensal/Anual (desconto automático), cartão central em destaque (Mais Popular), lista de benefícios e calculadora de assentos.',
    fnName: 'renderMatzPricingSection',
    icon: 'credit-card',
    variants: [
      { label: '3-Tier SaaS Pricing', badge: 'Annual -20%', desc: 'Planos Indie, Pro (Destaque Especular) e Enterprise Custom' },
      { label: 'Usage-Based Calculator', badge: 'Slider', desc: 'Estima o valor mensal conforme volume de requisições ou usuários' },
    ],
    tokens: [
      ['border: 1.5px solid var(--accent)', 'Featured Tier', 'Destaque cromático para o plano recomendado'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'testimonials-social-proof',
    category: '10. Website & Portal Blocks',
    title: 'Testimonials Wall, Customer Quotes & Logo Strip',
    badge: 'Social Proof',
    description:
      'Mural de depoimentos de clientes e engenheiros em grade Bento ou faixa contínua, acompanhado de nota de avaliação, cargo verificado e barra de logotipos parceiros.',
    fnName: 'renderMatzTestimonials',
    icon: 'heart',
    variants: [
      { label: 'Executive Quotes Grid', badge: 'Verified', desc: 'Depoimentos com métricas reais de ganho de velocidade' },
      { label: 'Infinite Testimonial Ticker', badge: 'Marquee', desc: 'Desfile contínuo de avaliações com pausa no hover' },
    ],
    tokens: [
      ['<blockquote> + <figcaption>', 'Semantic Quote', 'Marcação semântica para citações e autoria'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'faq-accordion-section',
    category: '10. Website & Portal Blocks',
    title: 'FAQ Section, Searchable Help & Support CTA',
    badge: 'Self-Service',
    description:
      'Seção de Perguntas Frequentes (FAQ) com busca instantânea por palavra-chave, agrupamento por tema (Licenciamento, Técnico, Faturamento) e cartão de contato direto com suporte.',
    fnName: 'renderMatzFaqSection',
    icon: 'help-circle',
    variants: [
      { label: 'Searchable FAQ Accordion', badge: 'Instant Filter', desc: 'Expande automaticamente as perguntas que coincidem com a busca' },
      { label: '2-Column Help Center', badge: 'Portal', desc: 'Combina perguntas frequentes com links para a documentação' },
    ],
    tokens: [
      ['aria-expanded', 'Accordion Trigger', 'Controle acessível de abertura e fechamento de respostas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'cta-newsletter-banners',
    category: '10. Website & Portal Blocks',
    title: 'Call-to-Action Sections & Newsletter Capture',
    badge: 'Lead Capture',
    description:
      'Blocos de conversão de final de página com fundo Aurora Mesh, captura de e-mail validada, comando CLI copiável e garantias de segurança/SLA.',
    fnName: 'renderMatzCtaSection',
    icon: 'send',
    variants: [
      { label: 'Aurora Conversion Banner', badge: 'Dual CTA', desc: 'Bloco de alto impacto para iniciar teste gratuito ou agendar demo' },
      { label: 'Developer Newsletter Box', badge: 'Input + Toast', desc: 'Formulário horizontal enxuto com confirmação instantânea' },
    ],
    tokens: [
      ['.matz-bg-aurora', 'Backdrop Glow', 'Iluminação atmosférica suave para destacar o bloco de conversão'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'team-authors-grid',
    category: '10. Website & Portal Blocks',
    title: 'Team Directory, Author Bios & Contributors',
    badge: 'About & Blog',
    description:
      'Grade de apresentação de equipe, autores de artigos e mantenedores open-source com avatar, especialidade técnica, localização e links rápidos.',
    fnName: 'renderMatzTeamGrid',
    icon: 'users',
    variants: [
      { label: 'Leadership & Engineering Grid', badge: 'Cards', desc: 'Cartões de perfil com badges de área (Core, Wails, Design System)' },
      { label: 'Compact Article Author Box', badge: 'Editorial', desc: 'Assinatura de autor para rodapé de artigos técnicos' },
    ],
    tokens: [
      ['--surface-card-solid', 'Profile Surface', 'Cartão estruturado com feixe especular superior'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'changelog-release-timeline',
    category: '10. Website & Portal Blocks',
    title: 'Product Changelog, Release Notes & Version Feed',
    badge: 'SemVer Feed',
    description:
      'Feed cronológico de atualizações do produto (Changelog) com badges de versão SemVer, tags categorizadas (Novo, Correção, Performance, Breaking) e snippets de migração.',
    fnName: 'renderMatzChangelogFeed',
    icon: 'git-branch',
    variants: [
      { label: 'Release Notes Timeline', badge: 'v0.1.0-beta.1', desc: 'Histórico detalhado de evolução com filtros por tipo de mudança' },
      { label: 'What’s New Modal / Drawer', badge: 'In-App', desc: 'Resumo compacto de novidades exibido dentro da aplicação' },
    ],
    tokens: [
      ['.matz-badge-amber / .matz-badge-emerald', 'Release Tags', 'Diferenciação imediata entre versões Beta e Stable'],
    ],
  }),

  // ==========================================================================
  // 11. E-COMMERCE, FINTECH & SAAS (8 Pages)
  // ==========================================================================
  {
    id: 'product-card-catalog',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'E-Commerce Storefront, Product Cards & Cart Suite',
    badge: 'Storefront',
    description:
      'Vitrine completa de E-Commerce com filtragem por categoria, cartões de produto com avaliação em estrelas, cálculo automático de subtotal e carrinho lateral integrado.',
    codeSnippet: `import { renderMatzEcommerceSuite } from '@matz/ui';

renderMatzEcommerceSuite(document.getElementById('ecommerce-root')!);`,
    tokens: [
      ['Catalog Grid + Live Cart', 'E-Commerce Suite', 'Fluxo completo de adição ao carrinho e checkout'],
    ],
    mountPreview: (stage) => {
      renderMatzEcommerceSuite(stage);
    },
  },
  createInteractiveSpecPage({
    id: 'shopping-cart-drawer',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'Shopping Cart Summary, Promo Code & Order Total',
    badge: 'Cart UX',
    description:
      'Resumo detalhado de carrinho de compras com ajuste de quantidade (+/−), aplicação de cupom de desconto, barra de progresso para frete grátis e cálculo de impostos.',
    fnName: 'renderMatzShoppingCart',
    icon: 'wallet',
    variants: [
      { label: 'Slide-Over Cart Drawer', badge: 'Free Shipping Bar', desc: 'Mostra quanto falta para atingir frete expresso gratuito' },
      { label: 'B2B Bulk Order Summary', badge: 'Tabular', desc: 'Resumo otimizado para pedidos corporativos com múltiplos SKUs' },
    ],
    tokens: [
      ['.matz-tabular', 'Currency Alignment', 'Alinhamento decimal perfeito em subtotais, descontos e taxas'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'checkout-payment-form',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'Multi-Step Checkout, Credit Card & PIX/Crypto',
    badge: 'Zero-Friction',
    description:
      'Formulário de pagamento de alta conversão com alternância instantânea entre Cartão de Crédito (com pré-visualização visual do cartão), PIX QR Code copiável e boleto/fatura.',
    fnName: 'renderMatzCheckoutForm',
    icon: 'credit-card',
    variants: [
      { label: 'Credit Card + Live Preview', badge: 'Encrypted', desc: 'Formatação automática de número do cartão, validade e CVV' },
      { label: 'Instant PIX Copy & Paste', badge: 'QR + Code', desc: 'Código PIX copia-e-cola com confirmação em tempo real via webhook' },
    ],
    tokens: [
      ['autocomplete="cc-number"', 'Browser Autofill', 'Compatibilidade nativa com preenchimento seguro do navegador'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'invoice-receipt-preview',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'Invoice Generator, Tax Breakdown & Receipt Card',
    badge: 'Billing & ERP',
    description:
      'Visualizador de fatura comercial (Invoice) e recibo de pagamento com discriminação de itens, impostos, chave de transação copiável, status de quitação e ação de impressão.',
    fnName: 'renderMatzInvoiceCard',
    icon: 'receipt',
    variants: [
      { label: 'Enterprise SaaS Invoice', badge: 'Paid / Open', desc: 'Documento estruturado pronto para exportação ou envio por e-mail' },
      { label: 'Compact Transaction Receipt', badge: 'FinTech', desc: 'Comprovante instantâneo com hash de autenticação copiável' },
    ],
    tokens: [
      ['@media print', 'Print Ready', 'Layout limpo otimizado para geração de PDF'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'subscription-usage-billing',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'SaaS Plan Usage, Quota Bars & Upgrade Card',
    badge: 'Cloud Billing',
    description:
      'Painel de consumo de recursos SaaS/Cloud exibindo cotas de tokens de IA, armazenamento, largura de banda, previsão de fatura do ciclo atual e alerta de limite.',
    fnName: 'renderMatzUsageBilling',
    icon: 'gauge',
    variants: [
      { label: 'Resource Quota Meters', badge: '82% Used', desc: 'Barras segmentadas com alerta automático ao ultrapassar 80% da franquia' },
      { label: 'Plan Upgrade Comparison', badge: '1-Click Scale', desc: 'Simula o aumento imediato de limites ao migrar de plano' },
    ],
    tokens: [
      ['.matz-progress-fill', 'Quota Indicator', 'Transição cromática suave conforme o uso se aproxima do teto'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'wallet-crypto-swap',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'FinTech Wallet, Multi-Currency Swap & Ledger',
    badge: 'Financial UI',
    description:
      'Módulo de carteira digital e câmbio (BRL / USD / EUR / BTC) com cotação em tempo real, inversão de par em 1 clique, estimativa de spread e extrato auditável.',
    fnName: 'renderMatzFinTechSwap',
    icon: 'dollar',
    variants: [
      { label: 'Instant Currency Swap', badge: 'Live Rate', desc: 'Conversão bidirecional com cálculo instantâneo de taxa líquida' },
      { label: 'Treasury Balance Card', badge: 'Multi-Asset', desc: 'Visão consolidada de liquidez em múltiplas moedas' },
    ],
    tokens: [
      ['.matz-tabular', '8-Decimal Precision', 'Suporte a casas decimais financeiras sem salto visual'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'order-tracking-stepper',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'Order Fulfillment Tracker & Delivery Timeline',
    badge: 'Logistics UX',
    description:
      'Rastreador de pedidos e entregas em tempo real com linha do tempo de etapas (Pedido Confirmado → Em Separação → Em Trânsito → Entregue), código de rastreio copiável e previsão.',
    fnName: 'renderMatzOrderTracker',
    icon: 'box',
    variants: [
      { label: 'Live Delivery Stepper', badge: 'In Transit', desc: 'Mostra o progresso físico do envio com horários exatos' },
      { label: 'Deployment Pipeline Tracker', badge: 'CI/CD', desc: 'Mesma arquitetura aplicada a pipelines de build, teste e produção' },
    ],
    tokens: [
      ['aria-current="step"', 'Active Milestone', 'Destaca a etapa atual do pedido ou pipeline'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'customer-crm-profile',
    category: '11. E-Commerce, FinTech & SaaS',
    title: 'CRM Contact Card, Deal Stage & Activity Notes',
    badge: 'Sales & Success',
    description:
      'Ficha 360° de cliente corporativo (CRM) reunindo dados da conta, pontuação de saúde (Health Score), valor do contrato (LTV), histórico de interações e notas rápidas.',
    fnName: 'renderMatzCrmCustomerCard',
    icon: 'user-check',
    variants: [
      { label: 'Account Health & LTV', badge: 'Score 94/100', desc: 'Visão executiva para equipes de Customer Success e Vendas' },
      { label: 'Interaction Timeline', badge: 'Calls & Emails', desc: 'Registro cronológico de reuniões, tickets e renovações' },
    ],
    tokens: [
      ['--surface-card-solid', 'CRM Dossier', 'Painel unificado de relacionamento com o cliente'],
    ],
  }),

  // ==========================================================================
  // 9. AI & AGENTIC INTERFACES (5 Additional AI Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'ai-chat-conversation',
    category: '9. AI & Agentic Interfaces',
    title: 'AI Streaming Chat, Markdown Bubbles & Citations',
    badge: 'LLM Stream',
    description:
      'Interface de conversação para assistentes de IA com renderização de blocos de código coloridos, pílulas de citação de fontes ([1], [2]), botões de regenerar/copiar resposta e avaliação.',
    fnName: 'renderMatzAiChatThread',
    icon: 'chat',
    variants: [
      { label: 'Streaming Code & Citations', badge: 'RAG Ready', desc: 'Mensagens estruturadas com fontes clicáveis e cópia em 1 clique' },
      { label: 'Multi-Agent Debate View', badge: 'Orchestrator', desc: 'Diferencia visualmente respostas do Agente Planejador, Executor e Revisor' },
    ],
    tokens: [
      ['role="log"', 'aria-live="polite"', 'Acessibilidade nativa para fluxos de mensagens em streaming'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'ai-model-selector-params',
    category: '9. AI & Agentic Interfaces',
    title: 'LLM Model Selector, Temperature & Top-P Sliders',
    badge: 'AI Playground',
    description:
      'Painel de configuração de inferência para LLMs: seletor de modelo (com badges de velocidade, raciocínio e janela de contexto), controle de Temperature, Top-P, Max Tokens e System Prompt.',
    fnName: 'renderMatzAiModelConfig',
    icon: 'brain',
    variants: [
      { label: 'Model & Hyperparameters', badge: 'Temp / Top-P', desc: 'Ajuste fino determinístico vs criativo com presets prontos' },
      { label: 'System Instructions Editor', badge: 'Persona', desc: 'Editor com contagem de tokens do prompt de sistema em tempo real' },
    ],
    tokens: [
      ['.matz-tabular', 'Parameter Readout', 'Exibição numérica precisa de hiperparâmetros (ex: 0.20, 4096)'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'ai-token-cost-analyzer',
    category: '9. AI & Agentic Interfaces',
    title: 'Context Window Meter, Token Counter & Cost Estimator',
    badge: 'Tokenomics',
    description:
      'Analisador de janela de contexto em tempo real que decompõe o uso de tokens entre System Prompt, Histórico, Arquivos Anexados, Ferramentas MCP e Resposta, calculando o custo estimado.',
    fnName: 'renderMatzTokenAnalyzer',
    icon: 'token',
    variants: [
      { label: 'Segmented Context Bar', badge: '128k / 1M', desc: 'Decomposição visual colorida do consumo da janela de contexto' },
      { label: 'Batch Cost Calculator', badge: 'FinOps IA', desc: 'Projeta custo por 1.000 execuções com cache de contexto ativo' },
    ],
    tokens: [
      ['--accent / #06b6d4 / #10b981', 'Token Segments', 'Cores distintas para Input Tokens, Cached Tokens e Output Tokens'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'ai-artifact-code-canvas',
    category: '9. AI & Agentic Interfaces',
    title: 'AI Side-by-Side Artifact Canvas & Live Preview',
    badge: 'Generative UI',
    description:
      'Superfície dividida (Split Artifact Canvas) onde o agente de IA gera código, documentos ou diagramas à esquerda enquanto o usuário interage com a pré-visualização renderizada à direita.',
    fnName: 'renderMatzAiArtifactCanvas',
    icon: 'split-vertical',
    variants: [
      { label: 'Live UI Artifact Preview', badge: 'Preview + Code', desc: 'Alterna instantaneamente entre o componente gerado e seu código-fonte' },
      { label: 'Versioned Artifact Diff', badge: 'v1 → v2', desc: 'Permite navegar entre iterações anteriores geradas pela IA' },
    ],
    tokens: [
      ['grid-template-columns', '1fr 1fr', 'Painel duplo responsivo com barra de ferramentas unificada'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'ai-voice-multimodal-orb',
    category: '9. AI & Agentic Interfaces',
    title: 'Multimodal Voice Orb, Audio Spectrum & Transcript',
    badge: 'Realtime Voice',
    description:
      'Interface para agentes de voz em tempo real com orbe pulsante reativo à frequência sonora, seletor de microfone, botão Push-to-Talk (Espaço) e transcrição sincronizada.',
    fnName: 'renderMatzAiVoiceOrb',
    icon: 'mic',
    variants: [
      { label: 'Reactive Voice Orb', badge: 'Low-Latency', desc: 'Estados visuais claros para Ouvindo, Processando e Falando' },
      { label: 'Live Bilingual Transcript', badge: 'Captions', desc: 'Legendas em tempo real com exportação para Markdown' },
    ],
    tokens: [
      ['.matz-pulse-ring', 'Audio Reactive', 'Ondas concêntricas sincronizadas com a atividade de voz'],
    ],
  }),

  // ==========================================================================
  // 12. ANIMATIONS, SHADERS & OPTICAL FX (5 Additional FX Pages)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'spotlight-cursor-beam',
    category: '12. Animations, Shaders & Optical FX',
    title: 'Interactive Radial Cursor Spotlight & Border Beam',
    badge: 'Optical Engine',
    description:
      'Motor de iluminação especular que projeta um feixe radial suave nas coordenadas exatas do cursor (--mouse-x, --mouse-y), revelando bordas e texturas em cartões adjacentes.',
    fnName: 'enableMatzSpotlight',
    icon: 'sparkles',
    variants: [
      { label: 'Radial Cursor Spotlight', badge: '60fps CSS Vars', desc: 'Iluminação reativa ao mouse com custo zero de re-renderização' },
      { label: 'Top Specular Beam 1px', badge: '.matz-beam-top', desc: 'Reflexo superior que simula luz zenital em vidro obsidiana' },
    ],
    tokens: [
      ['--mouse-x / --mouse-y', 'Pointer Coordinates', 'Variáveis CSS atualizadas passivamente via pointermove'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'kinetic-typography-counters',
    category: '12. Animations, Shaders & Optical FX',
    title: 'Kinetic Tabular Counters & Text Reveal',
    badge: 'Zero-CLS Motion',
    description:
      'Animações numéricas de alta precisão (interpolação cúbica a 60fps com dígitos tabulares) e efeitos de revelação progressiva de títulos e métricas.',
    fnName: 'renderMatzKineticCounter',
    icon: 'bolt',
    variants: [
      { label: 'Cubic-Out Number Ticker', badge: '60fps Tabular', desc: 'Anima de 0 ao valor final sem alterar a largura da caixa de texto' },
      { label: 'Cipher / Matrix Decode', badge: 'Tech Reveal', desc: 'Efeito de decodificação de caracteres monoespaçados para hashes e chaves' },
    ],
    tokens: [
      ['font-variant-numeric', 'tabular-nums', 'Garante que cada dígito ocupe exatamente a mesma largura durante a animação'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'marquee-infinite-ticker',
    category: '12. Animations, Shaders & Optical FX',
    title: 'Infinite Horizontal & Dual-Direction Marquee',
    badge: 'GPU Accelerated',
    description:
      'Faixas contínuas de rolagem infinita aceleradas por GPU (translateX) com máscara de desvanecimento lateral (mask-image), pausa automática no hover e suporte a duas direções.',
    fnName: 'renderMatzMarquee',
    icon: 'infinity',
    variants: [
      { label: 'Single Track Marquee', badge: 'Pause on Hover', desc: 'Ideal para tickers de cotações, métricas de rede ou logotipos' },
      { label: 'Dual Counter-Rotating', badge: '2 Directions', desc: 'Duas faixas deslizando em sentidos opostos para vitrines de componentes' },
    ],
    tokens: [
      ['mask-image', 'linear-gradient(to right, ...)', 'Desvanecimento óptico suave nas extremidades esquerda e direita'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'meteors-particles-canvas',
    category: '12. Animations, Shaders & Optical FX',
    title: 'Meteor Beams & Constellation Dot Matrix',
    badge: 'Ambient Canvas',
    description:
      'Superfícies decorativas de fundo para seções Hero e telas de login: feixes diagonais luminosos (Meteors) e matriz de pontos geométricos de baixo consumo de GPU.',
    fnName: 'renderMatzAmbientParticles',
    icon: 'orbit',
    variants: [
      { label: 'Diagonal Meteor Beams', badge: 'Pure CSS', desc: 'Feixes sutis de luz cruzando o horizonte da superfície escura' },
      { label: 'Dot Matrix Field', badge: '18px Grid', desc: 'Malha pontilhada técnica que reforça a sensação de precisão espacial' },
    ],
    tokens: [
      ['prefers-reduced-motion', 'Auto-Disable', 'Desativa animações decorativas quando solicitado pelo sistema operacional'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'glassmorphism-refraction-cards',
    category: '12. Animations, Shaders & Optical FX',
    title: 'Chromatic Glass Refraction & Specular Layers',
    badge: 'Prismatic UI',
    description:
      'Superfícies translúcidas multicamadas com refração cromática (backdrop-filter blur + saturate), bordas prismáticas de 1.5px e contraste de texto certificado WCAG AAA.',
    fnName: 'renderMatzGlassSurface',
    icon: 'layers',
    variants: [
      { label: 'Specular Obsidian Glass', badge: 'Dark Mode', desc: 'Translucidez profunda calibrada sobre fundos #080a10' },
      { label: 'Architectural Alabaster Glass', badge: 'Light Mode', desc: 'Vidro fosco luminoso com sombras suaves para ambientes claros' },
    ],
    tokens: [
      ['backdrop-filter', 'blur(24px) saturate(180%)', 'Refração óptica das cores de fundo através do cartão'],
    ],
  }),

  // ==========================================================================
  // 8. APPLICATION BLOCKS (Additional Full Application Shells)
  // ==========================================================================
  createInteractiveSpecPage({
    id: 'wails-frameless-window',
    category: '8. Application Blocks',
    title: 'Wails Native TitleBar, Window Controls & IPC Bridge',
    badge: 'Go 1.27 + Wails',
    description:
      'Casca completa de janela desktop nativa para Go + Wails v2/v3 com área de arraste (-webkit-app-region: drag), botões nativos Minimizar/Maximizar/Fechar, seletor de produto e monitor IPC.',
    fnName: 'createMatzWailsBridge',
    icon: 'window',
    variants: [
      { label: 'Windows 11 / Linux Controls', badge: 'Frameless', desc: 'Controles de janela à direita com destaque carmim no botão Fechar' },
      { label: 'macOS Traffic Lights', badge: 'Native Inset', desc: 'Semáforo de janela à esquerda integrado à barra de ferramentas' },
    ],
    tokens: [
      ['-webkit-app-region', 'drag / no-drag', 'Permite mover a janela nativa do sistema operacional pelo cabeçalho HTML'],
    ],
  }),
  createInteractiveSpecPage({
    id: 'ide-split-workbench',
    category: '8. Application Blocks',
    title: 'Multi-Pane IDE Workbench, File Tree & Terminal',
    badge: 'Developer IDE',
    description:
      'Bancada completa de desenvolvimento (estilo IDE) combinando Navigation Rail, árvore de arquivos lateral, abas de código com syntax highlighting e console de terminal integrado.',
    fnName: 'renderMatzIdeWorkbench',
    icon: 'code',
    variants: [
      { label: '3-Pane Code + Terminal IDE', badge: 'Full Workbench', desc: 'Layout completo para ferramentas de engenharia, SQL e automação' },
      { label: 'Zen Distraction-Free Mode', badge: '100% Focus', desc: 'Oculta painéis laterais mantendo apenas o editor e a OmniCommand (⌘K)' },
    ],
    tokens: [
      ['.matz-app-shell', 'Zero-Scroll Viewport', 'Casca de aplicação de tela cheia com painéis roláveis independentes'],
    ],
  }),
];
