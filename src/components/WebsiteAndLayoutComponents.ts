import { matzIcon } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';
import {
  renderArcGauge,
  renderRingDonutChart,
  renderSparklineCard,
} from '../analytics/ChartsAndGauges';
import {
  renderMatzDataTable,
  openMatzSheetDrawer,
  openMatzDialog,
} from './RichComponents';
import { highlightMatzCode } from '../ux/MultiFrameworkCode';

/**
 * 1. WEBSITE HEADER, MEGA-NAVBAR & TOP ANNOUNCEMENT BANNER
 */
export function renderMatzWebsiteHeader(container: HTMLElement): void {
  let activeNav = 'produto';
  let announcementVisible = true;

  const subMenuDescriptions: Record<string, { title: string; desc: string; cta: string }> = {
    produto: {
      title: 'Plataforma Unificada de UI & Design System',
      desc: 'Mais de 110 componentes interativos, 185 ícones vetoriais modulares e suporte oficial a Go + Wails, React, Vue e Svelte.',
      cta: 'Explorar Catálogo Completo',
    },
    solucoes: {
      title: 'Arquitetura para SaaS, FinTechs, Portais e Desktop',
      desc: 'Construa desde landing pages de alta conversão até terminais financeiros a 60fps com zero layout shift.',
      cta: 'Ver Casos de Uso',
    },
    docs: {
      title: 'Documentação AI-First & Manifesto /llms.txt',
      desc: 'Contratos determinísticos para agentes de IA, tokens W3C e exemplos prontos para copiar e colar.',
      cta: 'Ler Documentação',
    },
    blog: {
      title: 'Engenharia de Interface, Performance & Web Vitals',
      desc: 'Artigos técnicos sobre renderização SVG in-place, contraste WCAG AAA e integração nativa com Go.',
      cta: 'Acessar Artigos',
    },
    precos: {
      title: 'Licenciamento Open-Source & Planos Enterprise',
      desc: 'Gratuito para projetos individuais e equipes, com suporte dedicado de arquitetura para grandes organizações.',
      cta: 'Comparar Planos',
    },
  };

  const draw = () => {
    const activeInfo = subMenuDescriptions[activeNav] || subMenuDescriptions.produto;

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;width:100%;">
        <div class="matz-card" style="padding:0;overflow:hidden;border:1px solid var(--border-strong);">
          ${
            announcementVisible
              ? `
            <!-- Top Announcement Bar -->
            <div style="padding:8px 20px;background:linear-gradient(90deg, rgba(139,92,246,0.18), rgba(6,182,212,0.15));border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="matz-badge matz-badge-cyan" style="font-size:10px;">LANÇAMENTO</span>
                <span style="color:var(--text-primary);font-weight:600;">Matz UI Design System com 110+ Componentes e 185 Ícones Modulares</span>
                <code class="matz-copy-pill" data-matz-copy-text="npx @matz/ui@beta init" title="Clique para copiar">npx @matz/ui@beta init ⧉</code>
              </div>
              <button class="matz-btn matz-btn-sm matz-btn-ghost" id="web-hdr-close-banner" style="height:22px;padding:0 6px;font-size:11px;">✕ Dispensar</button>
            </div>`
              : ''
          }

          <!-- Main Website Header -->
          <header role="banner" style="padding:14px 24px;background:var(--surface-elevated);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
            <!-- Brand Identity -->
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg, var(--accent), #06b6d4);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px var(--accent-glow);">
                ${matzIcon('layers', 18)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:7px;">
                  <strong style="font-size:15px;letter-spacing:-0.02em;color:var(--text-primary);">MATZ CLOUD</strong>
                  <span class="matz-badge matz-badge-emerald" style="font-size:9.5px;padding:1px 6px;">Enterprise</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);">Cabeçalho Principal &amp; Mega-Menu</div>
              </div>
            </div>

            <!-- Primary Navigation Links -->
            <nav role="navigation" aria-label="Navegação Principal" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
              ${[
                { id: 'produto', label: 'Produto', badge: '' },
                { id: 'solucoes', label: 'Soluções', badge: '' },
                { id: 'docs', label: 'Documentação', badge: '110+' },
                { id: 'blog', label: 'Blog & Engenharia', badge: '' },
                { id: 'precos', label: 'Planos & Preços', badge: '' },
              ]
                .map(
                  (item) => `
                <button type="button" class="matz-btn ${activeNav === item.id ? 'matz-btn-primary' : 'matz-btn-ghost'}" data-web-nav="${item.id}" style="height:34px;padding:0 12px;font-size:12.5px;">
                  <span>${item.label}</span>
                  ${item.badge ? `<span class="matz-badge matz-badge-cyan" style="font-size:9px;padding:1px 5px;">${item.badge}</span>` : ''}
                </button>`
                )
                .join('')}
            </nav>

            <!-- Right Actions: Search + CTA -->
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="position:relative;display:flex;align-items:center;">
                <input class="matz-input" placeholder="Buscar recursos..." aria-label="Buscar no site" style="height:34px;width:170px;padding-right:42px;font-size:12px;" />
                <kbd class="matz-kbd" style="position:absolute;right:8px;pointer-events:none;">⌘K</kbd>
              </div>
              <button class="matz-btn matz-btn-sm" id="web-hdr-login">Entrar</button>
              <button class="matz-btn matz-btn-sm matz-btn-primary" id="web-hdr-cta">
                ${matzIcon('bolt', 13)} Começar Grátis
              </button>
            </div>
          </header>

          <!-- Interactive Mega-Menu / Subbar Preview -->
          <div style="padding:14px 24px;background:var(--surface-card-solid);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:32px;height:32px;border-radius:8px;background:var(--accent-muted);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${matzIcon('compass', 16)}
              </div>
              <div>
                <strong style="font-size:13px;color:var(--text-primary);display:block;">${activeInfo.title}</strong>
                <span style="font-size:12px;color:var(--text-secondary);">${activeInfo.desc}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="matz-copy-pill" data-matz-copy-text="import { renderMatzWebsiteHeader } from '@matz/ui';">
                Copiar Import ⧉
              </button>
              <button class="matz-btn matz-btn-sm" id="web-hdr-sub-cta">
                ${activeInfo.cta} →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#web-hdr-close-banner')?.addEventListener('click', () => {
      announcementVisible = false;
      draw();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-web-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeNav = btn.dataset.webNav || 'produto';
        draw();
      });
    });

    container.querySelector('#web-hdr-login')?.addEventListener('click', () => {
      openMatzDialog(
        'Autenticação Corporativa',
        'Entre com sua credencial ou chave de acesso SSO.',
        `<div style="display:flex;flex-direction:column;gap:10px;">
          <input class="matz-input" placeholder="voce@empresa.com.br" />
          <input class="matz-input" type="password" placeholder="••••••••••••" />
        </div>`
      );
    });

    container.querySelector('#web-hdr-cta')?.addEventListener('click', () => {
      showMatzToast('Fluxo de criação de conta iniciado!');
    });

    container.querySelector('#web-hdr-sub-cta')?.addEventListener('click', () => {
      showMatzToast(`Navegando para: ${activeInfo.title}`);
    });
  };

  draw();
}

/**
 * 2. WEBSITE HERO SECTION WITH AURORA MESH, METRICS & MARQUEE
 */
export function renderMatzWebsiteHero(container: HTMLElement): void {
  container.innerHTML = `
    <section class="matz-card matz-beam-top matz-bg-aurora" style="padding:38px 34px;display:flex;flex-direction:column;gap:28px;border:1px solid var(--border-strong);overflow:hidden;">
      <!-- Top Hero Pill + Copyable Command -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="matz-badge matz-badge-cyan">${matzIcon('sparkles', 12)} Hero de Alta Conversão</span>
          <span class="matz-badge matz-badge-emerald">${matzIcon('bolt', 12)} Core Web Vitals 100/100</span>
          <span class="matz-badge">WCAG 2.1 AAA</span>
        </div>
        <button type="button" class="matz-copy-pill" data-matz-copy-text="import { renderMatzWebsiteHero } from '@matz/ui';">
          import { renderMatzWebsiteHero } from '@matz/ui' ⧉
        </button>
      </div>

      <!-- Main Hero 2-Column Split -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:32px;align-items:center;">
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0;">
          <h2 class="matz-heading-grad" style="font-size:clamp(1.85rem, 2.8vw, 2.65rem);font-weight:900;letter-spacing:-0.03em;line-height:1.22;">
            Infraestrutura Visual para Produtos Digitais, Portais e Sistemas Críticos.
          </h2>
          <p style="font-size:14.5px;color:var(--text-secondary);line-height:1.68;">
            Construa landing pages, portais de conteúdo, e-commerces e dashboards em tempo real com componentes modulares, temas duplos calibrados e zero dependências externas.
          </p>

          <div class="matz-cli-box" style="max-width:520px;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;">
              <span style="color:var(--accent);font-weight:700;">$</span>
              <code style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">npx @matz/ui@beta init --template=website</code>
            </div>
            <button type="button" class="matz-btn matz-btn-sm matz-btn-primary" data-matz-copy-text="npx @matz/ui@beta init --template=website">
              ${matzIcon('copy', 12)} Copiar
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;">
            <button class="matz-btn matz-btn-lg matz-btn-primary" id="web-hero-action-1">
              ${matzIcon('bolt', 15)} Criar Projeto Agora
            </button>
            <button class="matz-btn matz-btn-lg" id="web-hero-action-2">
              ${matzIcon('layers', 15)} Inspecionar Arquitetura
            </button>
          </div>
        </div>

        <!-- Right Composite Widget inside Hero -->
        <div class="matz-card" style="padding:20px;background:var(--surface-card-solid);display:flex;flex-direction:column;gap:16px;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="matz-pulse-ring" style="width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
              <strong style="font-size:13px;">Métricas em Tempo Real · Global Edge</strong>
            </div>
            <span class="matz-badge matz-badge-emerald matz-tabular">99.998% Online</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:12px;" id="web-hero-metrics"></div>
        </div>
      </div>

      <!-- Infinite Marquee Strip inside Hero -->
      <div class="matz-marquee-wrap" style="padding-top:14px;border-top:1px solid var(--border);">
        <div class="matz-marquee-track">
          ${[
            '110+ Componentes Prontos para Produção',
            'Vanilla TypeScript First (0 KB Overhead)',
            '185 Ícones Vetoriais Tree-Shakeable',
            'Go 1.27 + Wails v3 Native Bridge',
            'React 19 · Next.js 15 · Vue 3 · Svelte 5',
            'Acessibilidade Óptica WCAG 2.1 AAA',
            '110+ Componentes Prontos para Produção',
            'Vanilla TypeScript First (0 KB Overhead)',
            '185 Ícones Vetoriais Tree-Shakeable',
            'Go 1.27 + Wails v3 Native Bridge',
          ]
            .map(
              (label) => `
            <span class="matz-badge" style="padding:5px 12px;font-size:11.5px;background:var(--surface-card-solid);color:var(--text-secondary);border-color:var(--border-strong);">
              ${matzIcon('check-circle', 12)} ${label}
            </span>`
            )
            .join('')}
        </div>
      </div>
    </section>
  `;

  const metricsHost = container.querySelector<HTMLElement>('#web-hero-metrics');
  if (metricsHost) {
    metricsHost.innerHTML =
      renderSparklineCard({
        title: 'Requisições Globais',
        value: '48.2k req/s',
        delta: '+18.4% hoje',
        data: [22, 28, 31, 35, 39, 44, 48.2],
        color: '#8b5cf6',
      }) +
      renderSparklineCard({
        title: 'Latência Edge P95',
        value: '11.4 ms',
        delta: '-3.2ms otimizado',
        data: [19, 17, 15, 14, 13, 12, 11.4],
        color: '#10b981',
      });
  }

  container.querySelector('#web-hero-action-1')?.addEventListener('click', () => {
    showMatzToast('Ambiente de projeto inicializado com sucesso!');
  });
  container.querySelector('#web-hero-action-2')?.addEventListener('click', () => {
    openMatzSheetDrawer(
      'Arquitetura de Landing Page & Website',
      'Estrutura semântica otimizada para SEO, acessibilidade e conversão',
      `
        <div style="display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--text-secondary);line-height:1.6;">
          <p>Todos os blocos de website da <strong>@matz/ui</strong> combinam marcação HTML5 semântica, contrastes calibrados e carregamento zero-blocking.</p>
          <div class="matz-code-block">${highlightMatzCode(
            `import {
  renderMatzWebsiteHeader,
  renderMatzWebsiteHero,
  renderMatzWebsiteMainAndAside,
  renderMatzWebsiteFooter,
} from '@matz/ui';`,
            'website-setup.ts'
          )}</div>
        </div>
      `
    );
  });
}

/**
 * 3. COMPLETE WEBSITE & LANDING PAGE SHOWCASE (Header + Hero + Bento Features + Pricing + Testimonials + FAQ + Footer)
 */
export function renderMatzCompleteWebsiteShowcase(container: HTMLElement): void {
  let billingCycle: 'mensal' | 'anual' = 'anual';
  let openFaqIdx = 0;

  const faqs = [
    {
      q: 'Posso importar apenas 1 componente ou 1 ícone sem carregar toda a biblioteca?',
      a: 'Sim. A @matz/ui é 100% compatível com Tree-Shaking ESM e oferece subpath imports diretos como @matz/ui/icons/bot (~180 bytes) para que seu bundle final contenha estritamente o que você utilizou.',
    },
    {
      q: 'Como funciona a integração com React, Next.js, Vue 3, Svelte 5 e Go + Wails?',
      a: 'O núcleo é construído em HTML5, CSS3 e Vanilla TypeScript puro (zero dependências), acompanhado de adaptadores idiomáticos para cada framework e uma camada nativa @matz/ui/wails para aplicações desktop.',
    },
    {
      q: 'Os componentes já atendem aos critérios do Google PageSpeed Insights e WCAG AAA?',
      a: 'Sim. Todos os contadores usam tipografia tabular (CLS = 0.00), animações fora da tela pausam automaticamente via IntersectionObserver e os temas escuro/claro garantem contraste superior a 15.8:1.',
    },
  ];

  const draw = () => {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:24px;width:100%;min-width:0;">
        <!-- 1. Website Header -->
        <div id="full-site-header"></div>

        <!-- 2. Website Hero -->
        <div id="full-site-hero"></div>

        <!-- 3. Main Feature Bento Grid -->
        <section style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <span class="matz-badge matz-badge-cyan">ARQUITETURA DE PRODUTO</span>
              <h3 style="font-size:20px;font-weight:800;margin-top:6px;">Recursos de Ponta a Ponta para Aplicações Web &amp; Desktop</h3>
            </div>
            <button type="button" class="matz-copy-pill" data-matz-copy-text="import { renderMatzCompleteWebsiteShowcase } from '@matz/ui';">
              Copiar Template de Website Completo ⧉
            </button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;">
            ${[
              {
                icon: 'palette',
                badge: 'Dual-Theme',
                title: 'Specular Obsidian & Alabaster',
                desc: 'Alternância instantânea entre tema escuro e claro com tokens semânticos que impedem vazamento de fundo branco em inputs.',
              },
              {
                icon: 'package',
                badge: '~180 Bytes',
                title: '185 Ícones Vetoriais Modulares',
                desc: 'Importe apenas o ícone desejado via subpath ou utilize o catálogo dinâmico com controle óptico de espessura e variante.',
              },
              {
                icon: 'activity',
                badge: '60.0 FPS',
                title: 'Telemetria & Gráficos Nativos',
                desc: 'Gauges radiais, osciloscópios e gráficos de área atualizados in-place no SVG sem recriar nós da árvore DOM.',
              },
              {
                icon: 'bot',
                badge: 'AI-First',
                title: 'Pronta para Agentes & LLMs',
                desc: 'Manifesto /llms.txt estruturado e assinaturas determinísticas de chamada única que eliminam alucinações de IA.',
              },
            ]
              .map(
                (f) => `
              <div class="matz-card matz-beam-top" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="width:36px;height:36px;border-radius:9px;background:var(--accent-muted);color:var(--accent);display:flex;align-items:center;justify-content:center;">
                    ${matzIcon(f.icon as any, 18)}
                  </div>
                  <span class="matz-badge">${f.badge}</span>
                </div>
                <div>
                  <strong style="font-size:15px;display:block;margin-bottom:6px;">${f.title}</strong>
                  <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">${f.desc}</p>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </section>

        <!-- 4. Interactive Pricing Section + FAQ Split -->
        <div style="display:grid;grid-template-columns:minmax(0, 1.25fr) minmax(0, 0.75fr);gap:20px;align-items:stretch;">
          <!-- Pricing Tiers -->
          <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:18px;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
              <div>
                <span class="matz-badge matz-badge-emerald">TABELA DE PREÇOS INTERATIVA</span>
                <strong style="font-size:17px;display:block;margin-top:4px;">Planos Transparentes para Qualquer Escala</strong>
              </div>
              <div class="matz-segmented">
                <button class="matz-segmented-btn ${billingCycle === 'mensal' ? 'active' : ''}" data-bill-btn="mensal">Mensal</button>
                <button class="matz-segmented-btn ${billingCycle === 'anual' ? 'active' : ''}" data-bill-btn="anual">Anual (-20%)</button>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;">
              <div style="padding:18px;border-radius:var(--radius-md);background:var(--surface-elevated);border:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div>
                  <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Open-Source / Indie</span>
                  <div class="matz-tabular" style="font-size:26px;font-weight:900;margin:6px 0;">R$ 0<span style="font-size:12px;font-weight:500;color:var(--text-muted);">/mês</span></div>
                  <p style="font-size:12px;color:var(--text-secondary);">Todos os 110+ componentes, 185 ícones e manifesto /llms.txt sob licença MIT.</p>
                </div>
                <button class="matz-btn matz-btn-sm" data-matz-copy-text="npx @matz/ui@beta init" style="width:100%;">Instalar via CLI ⧉</button>
              </div>

              <div style="padding:18px;border-radius:var(--radius-md);background:var(--accent-muted);border:1.5px solid var(--accent);display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:12px;font-weight:700;color:var(--accent);">Pro &amp; Equipes</span>
                    <span class="matz-badge matz-badge-cyan" style="font-size:9.5px;">Mais Popular</span>
                  </div>
                  <div class="matz-tabular" style="font-size:26px;font-weight:900;margin:6px 0;">
                    ${billingCycle === 'anual' ? 'R$ 149' : 'R$ 189'}<span style="font-size:12px;font-weight:500;color:var(--text-muted);">/mês</span>
                  </div>
                  <p style="font-size:12px;color:var(--text-secondary);">Blueprints completos de ERP, E-Commerce, Wails v3 e servidor MCP dedicado.</p>
                </div>
                <button class="matz-btn matz-btn-sm matz-btn-primary" id="site-pricing-pro-btn" style="width:100%;">Assinar Plano Pro</button>
              </div>
            </div>
          </div>

          <!-- Interactive FAQ Accordion -->
          <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:12px;">
            <span class="matz-badge" style="width:fit-content;">PERGUNTAS FREQUENTES (FAQ)</span>
            <strong style="font-size:16px;">Tire suas dúvidas técnicas</strong>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
              ${faqs
                .map(
                  (item, idx) => `
                <div style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;background:var(--surface-elevated);">
                  <button type="button" data-faq-idx="${idx}" style="width:100%;padding:11px 14px;background:transparent;border:none;color:var(--text-primary);font-size:12.5px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;text-align:left;">
                    <span>${item.q}</span>
                    <span style="transform:rotate(${openFaqIdx === idx ? '90deg' : '0deg'});transition:transform 0.15s ease;">${matzIcon('chevron-right', 13)}</span>
                  </button>
                  ${
                    openFaqIdx === idx
                      ? `<div style="padding:0 14px 12px;font-size:12px;color:var(--text-secondary);line-height:1.6;border-top:1px solid var(--border-subtle);padding-top:10px;">${item.a}</div>`
                      : ''
                  }
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- 5. Website Footer -->
        <div id="full-site-footer"></div>
      </div>
    `;

    renderMatzWebsiteHeader(container.querySelector('#full-site-header')!);
    renderMatzWebsiteHero(container.querySelector('#full-site-hero')!);
    renderMatzWebsiteFooter(container.querySelector('#full-site-footer')!);

    container.querySelectorAll<HTMLButtonElement>('[data-bill-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        billingCycle = (btn.dataset.billBtn as 'mensal' | 'anual') || 'anual';
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-faq-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.faqIdx);
        openFaqIdx = openFaqIdx === idx ? -1 : idx;
        draw();
      });
    });

    container.querySelector('#site-pricing-pro-btn')?.addEventListener('click', () => {
      showMatzToast(`Plano Pro (${billingCycle.toUpperCase()}) selecionado!`);
    });
  };

  draw();
}

/**
 * 4. EDITORIAL BLOG, CONTENT PORTAL & BENTO MAIN/ASIDE
 */
export function renderMatzWebsiteMainAndAside(container: HTMLElement): void {
  let viewMode: 'blog-article' | 'bento-landing' = 'blog-article';
  let clapCount = 142;
  let activeCategory = 'Engenharia de UI';
  const comments = [
    { author: 'Marina Costa · Staff Frontend', time: 'Há 2 horas', text: 'A mutação direta do stroke-dashoffset nos Gauges reduziu o uso de CPU do nosso painel em 70%.' },
    { author: 'Rafael Mendes · Go/Wails Architect', time: 'Há 5 horas', text: 'O bridge nativo @matz/ui/wails facilitou demais a migração do nosso app para Wails v3.' },
  ];

  const draw = () => {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;width:100%;">
        <!-- Editorial Portal Header Bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px 18px;background:var(--surface-elevated);border:1px solid var(--border);border-radius:var(--radius-md);">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="matz-badge matz-badge-cyan">PORTAL EDITORIAL &amp; BLOG</span>
            ${['Engenharia de UI', 'Design System', 'Go + Wails', 'AI & Agentes']
              .map(
                (cat) => `
              <button type="button" class="matz-btn matz-btn-sm ${activeCategory === cat ? 'matz-btn-primary' : 'matz-btn-ghost'}" data-blog-cat="${cat}" style="height:28px;font-size:11.5px;">
                ${cat}
              </button>`
              )
              .join('')}
          </div>
          <div class="matz-segmented">
            <button class="matz-segmented-btn ${viewMode === 'blog-article' ? 'active' : ''}" data-body-mode="blog-article">
              ${matzIcon('file-text', 13)} Leitura de Artigo &amp; Barra Lateral
            </button>
            <button class="matz-segmented-btn ${viewMode === 'bento-landing' ? 'active' : ''}" data-body-mode="bento-landing">
              ${matzIcon('grid', 13)} Vitrine Editorial em Grade (Bento)
            </button>
          </div>
        </div>

        ${
          viewMode === 'blog-article'
            ? `
          <!-- BLOG & EDITORIAL PORTAL LAYOUT -->
          <div style="display:grid;grid-template-columns:minmax(0, 1fr) 310px;gap:22px;align-items:start;width:100%;">
            <!-- Article Main Column -->
            <main class="matz-card" style="padding:28px 32px;display:flex;flex-direction:column;gap:20px;min-width:0;">
              <article style="display:flex;flex-direction:column;gap:18px;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <span class="matz-badge matz-badge-cyan">${activeCategory}</span>
                    <span class="matz-badge">Leitura: 4 min</span>
                    <time datetime="2026-11-07" style="font-size:12px;color:var(--text-muted);">Atualizado hoje</time>
                  </div>
                  <button type="button" class="matz-copy-pill" data-matz-copy-text="https://matz.dev/blog/arquitetura-zero-cls">
                    ${matzIcon('link', 11)} Copiar Link do Artigo
                  </button>
                </div>

                <h2 class="matz-heading-grad" style="font-size:24px;font-weight:800;letter-spacing:-0.025em;line-height:1.25;">
                  Como eliminamos o Layout Shift (CLS = 0.00) em Dashboards de 60fps e Portais Editoriais
                </h2>

                <p style="font-size:14px;color:var(--text-secondary);line-height:1.75;">
                  Ao construir portais de notícias, blogs técnicos ou painéis financeiros, a atualização de números em tempo real frequentemente desloca colunas adjacentes. Na <strong>@matz/ui</strong>, combinamos tipografia tabular (<code>font-variant-numeric: tabular-nums</code>) com mutação direta de atributos SVG.
                </p>

                <div class="matz-callout" style="background:var(--accent-muted);border-color:rgba(139,92,246,0.35);">
                  <span style="color:var(--accent);">${matzIcon('sparkles', 18)}</span>
                  <div style="font-size:12.5px;color:var(--text-primary);line-height:1.55;">
                    <strong>Importação Modular de 1 Único Ícone:</strong> Importe apenas o ícone necessário usando subpath imports <code>@matz/ui/icons/bolt</code> (~180 bytes) sem adicionar o restante da biblioteca ao seu bundle.
                  </div>
                </div>

                <div class="matz-code-block">${highlightMatzCode(
                  `// Importando apenas 1 ícone isolado + layout de artigo\nimport { iconBolt } from '@matz/ui/icons/bolt';\nimport { renderMatzWebsiteMainAndAside } from '@matz/ui';\n\ndocument.getElementById('badge-icon')!.innerHTML = iconBolt(16);`,
                  'blog-post.ts · Tree-Shakeable'
                )}</div>

                <!-- Interactive Comments Section inside Blog -->
                <div style="padding-top:16px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:12px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                    <strong style="font-size:14px;">Discussão Técnica (${comments.length} comentários)</strong>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <button class="matz-btn matz-btn-sm matz-btn-primary" id="blog-clap-btn">
                        ${matzIcon('heart', 13)} Aplaudir (<span class="matz-tabular">${clapCount}</span>)
                      </button>
                      <button class="matz-btn matz-btn-sm" data-matz-copy-text="npx @matz/ui@beta add blog-layout">
                        ${matzIcon('copy', 13)} Copiar Template
                      </button>
                    </div>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:8px;">
                    ${comments
                      .map(
                        (c) => `
                      <div style="padding:12px 14px;border-radius:var(--radius-sm);background:var(--surface-elevated);border:1px solid var(--border);">
                        <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;margin-bottom:4px;">
                          <strong style="color:var(--text-primary);">${c.author}</strong>
                          <span style="color:var(--text-muted);">${c.time}</span>
                        </div>
                        <p style="font-size:12.5px;color:var(--text-secondary);margin:0;">${c.text}</p>
                      </div>`
                      )
                      .join('')}
                  </div>
                </div>
              </article>
            </main>

            <!-- Right Sidebar (TOC + Author + Related Posts + Newsletter) -->
            <aside aria-label="Barra Lateral do Artigo" style="display:flex;flex-direction:column;gap:16px;min-width:0;">
              <div class="matz-card" style="padding:18px;display:flex;flex-direction:column;gap:10px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);">
                  Índice do Artigo (Sumário)
                </div>
                <nav style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;">
                  <a href="#sec-1" onclick="return false;" style="color:var(--accent);font-weight:600;text-decoration:none;border-left:2px solid var(--accent);padding-left:10px;">1. Tipografia Tabular (CLS = 0)</a>
                  <a href="#sec-2" onclick="return false;" style="color:var(--text-secondary);text-decoration:none;border-left:2px solid var(--border);padding-left:10px;">2. Importação de 1 Único Ícone</a>
                  <a href="#sec-3" onclick="return false;" style="color:var(--text-secondary);text-decoration:none;border-left:2px solid var(--border);padding-left:10px;">3. Acessibilidade e Semântica</a>
                </nav>
              </div>

              <div class="matz-card" style="padding:18px;display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;border-radius:50%;background:var(--accent-muted);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:800;">MZ</div>
                  <div>
                    <strong style="font-size:13px;display:block;">Equipe de Engenharia Matz</strong>
                    <span style="font-size:11px;color:var(--text-muted);">Arquitetura &amp; Design System</span>
                  </div>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                  Receba guias práticos sobre UI de alta densidade, Wails v3 e desenvolvimento AI-First.
                </p>
                <div style="display:flex;gap:6px;">
                  <input class="matz-input" placeholder="seu@email.dev" aria-label="Seu e-mail para newsletter" style="height:32px;font-size:12px;" />
                  <button class="matz-btn matz-btn-sm matz-btn-primary" id="aside-sub-btn">Assinar</button>
                </div>
              </div>

              <div class="matz-card" style="padding:18px;display:flex;flex-direction:column;gap:8px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);">
                  Artigos Relacionados
                </div>
                <div style="font-size:12px;color:var(--text-primary);font-weight:600;cursor:pointer;">→ Guia de Tokens W3C &amp; Tailwind v4</div>
                <div style="font-size:12px;color:var(--text-primary);font-weight:600;cursor:pointer;">→ Criando Apps Desktop com 19 MB RAM em Go</div>
              </div>
            </aside>
          </div>`
            : `
          <!-- EDITORIAL BENTO GRID -->
          <div style="display:grid;grid-template-columns:minmax(0, 1fr) 290px;gap:20px;align-items:stretch;width:100%;">
            <main style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;min-width:0;">
              <section class="matz-card matz-beam-top" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="color:var(--accent);">${matzIcon('package', 22)}</span>
                  <span class="matz-badge matz-badge-cyan">Tree-Shakeable</span>
                </div>
                <div>
                  <strong style="font-size:15px;display:block;margin-bottom:6px;">Importe 1 Único Ícone ou Módulo</strong>
                  <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                    Use <code>@matz/ui/icons/bot</code> para importar apenas os bytes do ícone escolhido, sem carregar o restante da biblioteca.
                  </p>
                </div>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="import { iconBot } from '@matz/ui/icons/bot';">
                  Copiar Import de 1 Ícone ⧉
                </button>
              </section>

              <section class="matz-card matz-beam-top" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="color:#10b981;">${matzIcon('columns', 22)}</span>
                  <span class="matz-badge matz-badge-emerald">Templates Web</span>
                </div>
                <div>
                  <strong style="font-size:15px;display:block;margin-bottom:6px;">Cabeçalho, Corpo, Artigos e Rodapé</strong>
                  <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                    Estruturas completas para portais, SaaS, documentações e blogs com suporte nativo a leitores de tela e SEO.
                  </p>
                </div>
                <button type="button" class="matz-copy-pill" data-matz-copy-text="import { renderMatzWebsiteHeader, renderMatzWebsiteFooter } from '@matz/ui';">
                  Copiar Import de Layouts ⧉
                </button>
              </section>
            </main>

            <aside class="matz-card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
              <div>
                <span class="matz-badge matz-badge-amber" style="margin-bottom:8px;">Destaques da Semana</span>
                <strong style="font-size:14px;display:block;margin-bottom:6px;">Painel Auxiliar &amp; Call-to-Action</strong>
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.55;">
                  Ideal para filtros laterais, anúncios de release, links rápidos ou calculadora de planos ao lado do conteúdo principal.
                </p>
              </div>
              <button class="matz-btn matz-btn-sm matz-btn-primary" id="bento-aside-cta" style="width:100%;">
                ${matzIcon('sparkles', 13)} Explorar Destaques
              </button>
            </aside>
          </div>`
        }
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-blog-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.blogCat || 'Engenharia de UI';
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-body-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewMode = (btn.dataset.bodyMode as typeof viewMode) || 'blog-article';
        draw();
      });
    });

    container.querySelector('#blog-clap-btn')?.addEventListener('click', () => {
      clapCount += 1;
      draw();
      showMatzToast('Obrigado pelo aplauso no artigo!');
    });

    container.querySelector('#aside-sub-btn')?.addEventListener('click', () => {
      showMatzToast('Inscrição confirmada na newsletter de engenharia!');
    });

    container.querySelector('#bento-aside-cta')?.addEventListener('click', () => {
      showMatzToast('Destaques editoriais carregados!');
    });
  };

  draw();
}

/**
 * 5. WEBSITE FOOTER WITH MULTI-COLUMN SITEMAP & LIVE STATUS
 */
export function renderMatzWebsiteFooter(container: HTMLElement): void {
  container.innerHTML = `
    <footer role="contentinfo" class="matz-card" style="padding:34px 32px 22px;display:flex;flex-direction:column;gap:26px;border:1px solid var(--border-strong);background:var(--surface-card-solid);">
      <div style="display:grid;grid-template-columns:minmax(240px, 1.4fr) repeat(3, minmax(140px, 1fr));gap:28px;align-items:start;">
        <!-- Column 1: Brand + Live Operational Status -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;gap:9px;">
            <span class="matz-brand-dot"></span>
            <strong style="font-size:15px;letter-spacing:-0.02em;">MATZ UI DESIGN SYSTEM</strong>
          </div>
          <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
            Biblioteca de UI AI-First com 110+ componentes e 185 ícones vetoriais para Websites, Blogs, E-Commerce, Dashboards 60fps e Apps Desktop Go + Wails.
          </p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
            <span class="matz-pulse-ring" style="width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
            <span style="font-size:11.5px;font-weight:600;color:#10b981;">Todos os sistemas operacionais (99.99%)</span>
          </div>
        </div>

        <!-- Column 2: Soluções Web -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <strong style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-primary);">Templates &amp; Páginas</strong>
          <a href="#hdr" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Cabeçalho &amp; Mega-Menu</a>
          <a href="#hero" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Hero &amp; Landing Pages</a>
          <a href="#main" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Portal Editorial &amp; Blog</a>
          <a href="#ecom" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">E-Commerce &amp; Checkout</a>
        </div>

        <!-- Column 3: Design System -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <strong style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-primary);">Design System</strong>
          <a href="#ds1" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Paleta Tonal Dinâmica (T0-T100)</a>
          <a href="#ds2" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">185 Ícones Tree-Shakeable</a>
          <a href="#ds3" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Tokens W3C JSON &amp; Tailwind</a>
          <a href="#ds4" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Acessibilidade WCAG 2.1 AAA</a>
        </div>

        <!-- Column 4: Ecossistema & IA -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <strong style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-primary);">Integrações &amp; IA</strong>
          <a href="/llms.txt" target="_blank" style="font-size:12.5px;color:var(--accent);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">Manifesto /llms.txt ${matzIcon('external', 11)}</a>
          <a href="#wails" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">Go 1.27 + Wails v3 Bridge</a>
          <a href="#react" onclick="return false;" style="font-size:12.5px;color:var(--text-secondary);text-decoration:none;">React 19, Vue 3 &amp; Svelte 5</a>
          <button type="button" class="matz-copy-pill" data-matz-copy-text="npm install @matz/ui@beta" style="width:fit-content;margin-top:2px;">
            npm i @matz/ui@beta ⧉
          </button>
        </div>
      </div>

      <!-- Bottom Legal & Copyright Bar -->
      <div style="padding-top:18px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:11.5px;color:var(--text-muted);">
        <span>© 2026 Matz UI UX Studio (v0.1.0-beta.1). Arquitetura Semântica Enterprise.</span>
        <div style="display:flex;align-items:center;gap:14px;">
          <span>Licença MIT</span>
          <span>Zero Rastreadores</span>
          <span>100/100 PageSpeed</span>
        </div>
      </div>
    </footer>
  `;
}

/**
 * 6. ANIMATIONS, AMBIENT BACKGROUNDS & KINETIC SURFACES
 */
export function renderMatzAnimationsAndBackgrounds(container: HTMLElement): void {
  let counterVal = 98420;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      <!-- Top Grid: Aurora Mesh + Cyber Grid Radar + 3D Specular Tilt Card -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(270px, 1fr));gap:18px;align-items:stretch;">
        <!-- 1. Aurora Prismatic Mesh Background -->
        <div class="matz-card matz-bg-aurora" style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:210px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="matz-badge matz-badge-cyan">1. Background Aurora Mesh</span>
            <button type="button" class="matz-copy-pill" data-matz-copy-text="class=&quot;matz-card matz-bg-aurora&quot;">.matz-bg-aurora ⧉</button>
          </div>
          <div>
            <strong style="font-size:16px;display:block;margin-bottom:6px;">Malha Prismática Animada</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.55;">
              Gradientes radiais multicamadas em movimento contínuo acelerado por GPU, respeitando automaticamente <code>prefers-reduced-motion</code>.
            </p>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);">
            animation: matzAuroraDrift 11s infinite
          </div>
        </div>

        <!-- 2. Cyber Grid + Radar Sonar Pulse -->
        <div class="matz-card matz-bg-cyber-grid" style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:210px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="matz-badge matz-badge-emerald">2. Cyber Grid &amp; Sonar Pulse</span>
            <button type="button" class="matz-copy-pill" data-matz-copy-text="class=&quot;matz-card matz-bg-cyber-grid&quot;">.matz-bg-cyber-grid ⧉</button>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div class="matz-pulse-ring" style="width:42px;height:42px;border-radius:50%;background:var(--accent-muted);color:var(--accent);flex-shrink:0;">
              ${matzIcon('radar', 20)}
            </div>
            <div>
              <strong style="font-size:15px;display:block;margin-bottom:4px;">Grade Geométrica 28px + Radar</strong>
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                Fundo técnico de engenharia combinado com anel de pulso contínuo (<code>.matz-pulse-ring</code>).
              </p>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border);">
            <span style="font-size:11.5px;color:var(--text-muted);">Contador Cinético Tabular:</span>
            <button class="matz-btn matz-btn-sm matz-btn-primary matz-tabular" id="anim-counter-btn">
              ${matzIcon('bolt', 12)} <span id="anim-counter-val">${counterVal.toLocaleString('pt-BR')}</span> ops/s
            </button>
          </div>
        </div>

        <!-- 3. Interactive 3D Specular Perspective Tilt Card -->
        <div class="matz-card matz-beam-top" id="anim-tilt-card" style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:210px;transition:transform 0.12s ease-out;will-change:transform;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="matz-badge matz-badge-amber">3. 3D Specular Tilt Surface</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);" id="anim-tilt-coords">X: 0° · Y: 0°</span>
          </div>
          <div>
            <strong style="font-size:16px;display:block;margin-bottom:6px;">Passe o Cursor para Inclinação 3D</strong>
            <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.55;">
              Calcula a rotação em perspectiva 3D (<code>perspective(800px) rotateX rotateY</code>) sincronizada com o feixe de luz radial sob o cursor.
            </p>
          </div>
          <div style="font-size:11.5px;color:var(--accent);font-weight:600;">
            Interaja com o mouse sobre este cartão →
          </div>
        </div>
      </div>

      <!-- Bottom Infinite Marquee Ticker Strip -->
      <div class="matz-card" style="padding:16px 20px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">4. Faixa Contínua Infinite Marquee (Pausa automaticamente ao passar o cursor)</span>
          <button type="button" class="matz-copy-pill" data-matz-copy-text="<div class=&quot;matz-marquee-wrap&quot;><div class=&quot;matz-marquee-track&quot;>...</div></div>">Copiar HTML Marquee ⧉</button>
        </div>
        <div class="matz-marquee-wrap">
          <div class="matz-marquee-track">
            ${[
              { icon: 'cpu', text: 'Wails IPC: 0.3ms' },
              { icon: 'activity', text: '60fps SVG Telemetry' },
              { icon: 'shield-check', text: 'WCAG 2.1 AAA Verified' },
              { icon: 'package', text: '185 Vector Icons' },
              { icon: 'bot', text: 'AI-First /llms.txt Ready' },
              { icon: 'sparkles', text: 'Specular Obsidian & Alabaster' },
              { icon: 'cpu', text: 'Wails IPC: 0.3ms' },
              { icon: 'activity', text: '60fps SVG Telemetry' },
              { icon: 'shield-check', text: 'WCAG 2.1 AAA Verified' },
              { icon: 'package', text: '185 Vector Icons' },
              { icon: 'bot', text: 'AI-First /llms.txt Ready' },
              { icon: 'sparkles', text: 'Specular Obsidian & Alabaster' },
            ]
              .map(
                (it) => `
              <div style="display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:var(--radius-sm);background:var(--surface-elevated);border:1px solid var(--border);font-size:12px;font-weight:600;">
                <span style="color:var(--accent);display:inline-flex;">${matzIcon(it.icon as any, 14)}</span>
                <span>${it.text}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const tiltCard = container.querySelector<HTMLElement>('#anim-tilt-card');
  const coordsLbl = container.querySelector<HTMLElement>('#anim-tilt-coords');
  tiltCard?.addEventListener('mousemove', (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = (x * 14).toFixed(1);
    const rotX = (-y * 14).toFixed(1);
    tiltCard.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
    if (coordsLbl) coordsLbl.textContent = `X: ${rotX}° · Y: ${rotY}°`;
  });
  tiltCard?.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (coordsLbl) coordsLbl.textContent = 'X: 0° · Y: 0°';
  });

  const counterBtn = container.querySelector<HTMLButtonElement>('#anim-counter-btn');
  const counterSpan = container.querySelector<HTMLElement>('#anim-counter-val');
  counterBtn?.addEventListener('click', () => {
    const start = counterVal;
    const end = start + Math.floor(Math.random() * 15000 + 5000);
    counterVal = end;
    const startTime = performance.now();
    const duration = 550;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(start + (end - start) * eased);
      if (counterSpan) counterSpan.textContent = current.toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/**
 * 7. COMPOSITE ENTERPRISE ADMIN PANEL (Sidebar + KPI Sparklines + DataTable + Donut + Gauges + Sheet Drawer)
 */
export function renderMatzCompositeAdminSuite(container: HTMLElement): void {
  let activeSection = 'clusters';

  const draw = () => {
    container.innerHTML = `
      <div class="matz-card" style="padding:0;overflow:hidden;border:1px solid var(--border-strong);display:grid;grid-template-columns:210px minmax(0, 1fr);min-height:480px;width:100%;">
        <!-- Left Admin Sidebar -->
        <aside style="background:var(--surface-elevated);border-right:1px solid var(--border);padding:16px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;padding:4px 8px;">
              <span class="matz-brand-dot"></span>
              <strong style="font-size:13.5px;">MATZ ADMIN ERP</strong>
            </div>

            <nav style="display:flex;flex-direction:column;gap:4px;">
              ${[
                { id: 'clusters', icon: 'server', label: 'Clusters & Nodes', badge: '12' },
                { id: 'usuarios', icon: 'users', label: 'Usuários & RBAC', badge: '148' },
                { id: 'faturamento', icon: 'credit-card', label: 'Faturamento & SLA', badge: '' },
                { id: 'auditoria', icon: 'shield-check', label: 'Logs de Auditoria', badge: 'Live' },
              ]
                .map(
                  (it) => `
                <button type="button" class="matz-docs-nav-link ${activeSection === it.id ? 'active' : ''}" data-adm-nav="${it.id}" style="padding:8px 10px;justify-content:space-between;">
                  <span style="display:flex;align-items:center;gap:8px;">
                    ${matzIcon(it.icon as any, 14)}
                    <span>${it.label}</span>
                  </span>
                  ${it.badge ? `<span class="matz-badge matz-tabular" style="font-size:9.5px;padding:1px 6px;">${it.badge}</span>` : ''}
                </button>`
                )
                .join('')}
            </nav>
          </div>

          <div style="padding:12px;border-radius:var(--radius-sm);background:var(--surface-card-solid);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;">
              <span style="color:var(--text-secondary);">Cota de IA / MCP</span>
              <strong class="matz-tabular" style="color:var(--accent);">82%</strong>
            </div>
            <div class="matz-progress-track"><div class="matz-progress-fill" style="width:82%;"></div></div>
            <button type="button" class="matz-copy-pill" data-matz-copy-text="import { renderMatzCompositeAdminSuite } from '@matz/ui';" style="font-size:10px;justify-content:center;">
              Copiar Admin Suite ⧉
            </button>
          </div>
        </aside>

        <!-- Right Admin Main Workspace -->
        <main style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;min-width:0;background:var(--surface-canvas);">
          <header style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Painel Administrativo Integrado</div>
              <strong style="font-size:17px;">Gestão de Infraestrutura, Usuários &amp; Telemetria</strong>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button class="matz-btn matz-btn-sm" id="adm-inspect-drawer-btn">
                ${matzIcon('sliders', 13)} Inspecionar Nó (Drawer)
              </button>
              <button class="matz-btn matz-btn-sm matz-btn-primary" id="adm-new-deploy-btn">
                ${matzIcon('plus', 13)} Novo Provisionamento
              </button>
            </div>
          </header>

          <!-- Top KPI Row -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(185px, 1fr));gap:12px;" id="adm-kpi-row"></div>

          <!-- Bottom Composite Grid: DataTable + Donut -->
          <div style="display:grid;grid-template-columns:minmax(0, 1.45fr) minmax(240px, 0.55fr);gap:16px;align-items:stretch;min-width:0;">
            <div id="adm-table-host" style="min-width:0;"></div>
            <div id="adm-gauge-host" style="min-width:0;display:flex;flex-direction:column;gap:12px;"></div>
          </div>
        </main>
      </div>
    `;

    const kpiHost = container.querySelector<HTMLElement>('#adm-kpi-row');
    if (kpiHost) {
      kpiHost.innerHTML =
        renderSparklineCard({
          title: 'Receita Recorrente (MRR)',
          value: 'R$ 428.900',
          delta: '+14.2% este mês',
          data: [310, 335, 350, 372, 395, 412, 428.9],
          color: '#10b981',
        }) +
        renderSparklineCard({
          title: 'Nós Ativos no Cluster',
          value: '128 / 128',
          delta: '100% Saudáveis',
          data: [120, 122, 124, 126, 128, 128, 128],
          color: '#8b5cf6',
        }) +
        renderSparklineCard({
          title: 'Tempo Médio de Resposta',
          value: '8.4 ms',
          delta: 'P99 < 15ms',
          data: [14, 12, 11, 10, 9.2, 8.8, 8.4],
          color: '#06b6d4',
        });
    }

    const tableHost = container.querySelector<HTMLElement>('#adm-table-host');
    if (tableHost) {
      renderMatzDataTable(
        tableHost,
        'Clusters & Instâncias Ativas',
        [
          { key: 'node', label: 'Nó / Região' },
          { key: 'role', label: 'Função' },
          { key: 'cpu', label: 'Uso CPU' },
          { key: 'status', label: 'Status' },
        ],
        [
          { node: 'sa-east-1a (SP)', role: 'Primary Edge', cpu: '42%', status: 'Operacional' },
          { node: 'us-east-1b (VA)', role: 'AI Worker MCP', cpu: '68%', status: 'Operacional' },
          { node: 'eu-central-1 (DE)', role: 'Replica Vault', cpu: '31%', status: 'Operacional' },
          { node: 'ap-northeast-1 (JP)', role: 'Stream Relay', cpu: '54%', status: 'Operacional' },
        ]
      );
    }

    const gaugeHost = container.querySelector<HTMLElement>('#adm-gauge-host');
    if (gaugeHost) {
      renderRingDonutChart(gaugeHost, 'Alocação por Região', [
        { label: 'sa-east-1 (São Paulo)', value: 48, color: '#8b5cf6' },
        { label: 'us-east-1 (Virginia)', value: 32, color: '#06b6d4' },
        { label: 'eu-central-1 (Frankfurt)', value: 20, color: '#10b981' },
      ]);
    }

    container.querySelectorAll<HTMLButtonElement>('[data-adm-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSection = btn.dataset.admNav || 'clusters';
        draw();
      });
    });

    container.querySelector('#adm-inspect-drawer-btn')?.addEventListener('click', () => {
      openMatzSheetDrawer(
        'Inspeção de Cluster · sa-east-1a',
        'Telemetria e configuração de nó em tempo real',
        `
          <div style="display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--text-secondary);">
            <p>Este painel combina <code>Navigation Rail</code>, <code>Sparkline Cards</code>, <code>DataTable</code>, <code>RingDonutChart</code> e <code>SheetDrawer</code> da <strong>@matz/ui</strong>.</p>
            <div class="matz-code-block">${highlightMatzCode(
              `import { renderMatzCompositeAdminSuite } from '@matz/ui';\n\nrenderMatzCompositeAdminSuite(document.getElementById('admin-root')!);`,
              'admin-panel.ts'
            )}</div>
          </div>
        `
      );
    });

    container.querySelector('#adm-new-deploy-btn')?.addEventListener('click', () => {
      showMatzToast('Novo cluster provisionado em sa-east-1!');
    });
  };

  draw();
}

/**
 * 8. E-COMMERCE STOREFRONT, PRODUCT CATALOG & CHECKOUT SUITE
 */
export function renderMatzEcommerceSuite(container: HTMLElement): void {
  let cartItems = [
    { id: 'p1', name: 'Licença Matz Studio Enterprise', price: 890, qty: 1 },
    { id: 'p2', name: 'Hardware Key Passkey FIDO2', price: 320, qty: 2 },
  ];
  let selectedCategory = 'Todos';

  const products = [
    { id: 'p1', name: 'Licença Matz Studio Enterprise', cat: 'Software', price: 890, rating: '5.0', badge: 'Mais Vendido' },
    { id: 'p2', name: 'Hardware Key Passkey FIDO2', cat: 'Segurança', price: 320, rating: '4.9', badge: 'Novo' },
    { id: 'p3', name: 'Servidor Edge Mini-Node ARM64', cat: 'Hardware', price: 2490, rating: '4.8', badge: 'Estoque' },
  ];

  const draw = () => {
    const subtotal = cartItems.reduce((acc, it) => acc + it.price * it.qty, 0);
    const filtered = selectedCategory === 'Todos' ? products : products.filter((p) => p.cat === selectedCategory);

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0, 1.45fr) minmax(300px, 0.55fr);gap:20px;align-items:start;width:100%;">
        <!-- Left Storefront Catalog -->
        <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;gap:18px;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--border);padding-bottom:12px;">
            <div>
              <span class="matz-badge matz-badge-cyan">E-COMMERCE &amp; CATÁLOGO</span>
              <strong style="font-size:17px;display:block;margin-top:4px;">Vitrine de Produtos, Filtros &amp; Avaliação</strong>
            </div>
            <div class="matz-segmented">
              ${['Todos', 'Software', 'Segurança', 'Hardware']
                .map(
                  (c) => `
                <button class="matz-segmented-btn ${selectedCategory === c ? 'active' : ''}" data-ecom-cat="${c}">${c}</button>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;">
            ${filtered
              .map(
                (p) => `
              <div class="matz-card matz-beam-top" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:var(--surface-elevated);">
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span class="matz-badge">${p.badge}</span>
                    <span style="font-size:12px;color:#fbbf24;font-weight:700;">★ ${p.rating}</span>
                  </div>
                  <div style="height:82px;border-radius:var(--radius-sm);background:var(--surface-card-solid);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--accent);">
                    ${matzIcon('box', 28)}
                  </div>
                  <strong style="font-size:14px;">${p.name}</strong>
                  <span style="font-size:11.5px;color:var(--text-muted);">Categoria: ${p.cat}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border);">
                  <strong class="matz-tabular" style="font-size:16px;color:var(--text-primary);">R$ ${p.price}</strong>
                  <button class="matz-btn matz-btn-sm matz-btn-primary" data-add-prod="${p.id}">
                    ${matzIcon('plus', 12)} Adicionar
                  </button>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>

        <!-- Right Shopping Cart & Instant Checkout -->
        <div class="matz-card matz-beam-top" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:15px;">Carrinho &amp; Checkout Rápido</strong>
            <span class="matz-badge matz-badge-emerald matz-tabular">${cartItems.length} itens</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">
            ${cartItems
              .map(
                (item) => `
              <div style="padding:10px 12px;border-radius:var(--radius-sm);background:var(--surface-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="min-width:0;">
                  <strong style="font-size:12.5px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</strong>
                  <span class="matz-tabular" style="font-size:11.5px;color:var(--text-muted);">${item.qty}x R$ ${item.price}</span>
                </div>
                <strong class="matz-tabular" style="font-size:13px;">R$ ${item.price * item.qty}</strong>
              </div>`
              )
              .join('')}
          </div>

          <div style="padding-top:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--text-secondary);">
              <span>Frete Expresso Segurado</span>
              <span style="color:#10b981;font-weight:600;">Grátis</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;">
              <span>Total do Pedido</span>
              <span class="matz-tabular" style="color:var(--accent);">R$ ${subtotal.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <button class="matz-btn matz-btn-primary" id="ecom-checkout-btn" style="width:100%;">
            ${matzIcon('credit-card', 14)} Finalizar Compra (PIX / Cartão)
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-ecom-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.ecomCat || 'Todos';
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-add-prod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.addProd;
        const found = products.find((p) => p.id === id);
        if (!found) return;
        const existing = cartItems.find((c) => c.id === id);
        if (existing) existing.qty += 1;
        else cartItems.push({ id: found.id, name: found.name, price: found.price, qty: 1 });
        draw();
        showMatzToast(`"${found.name}" adicionado ao carrinho!`);
      });
    });

    container.querySelector('#ecom-checkout-btn')?.addEventListener('click', () => {
      showMatzToast(`Pedido de R$ ${subtotal.toLocaleString('pt-BR')} processado com sucesso!`);
    });
  };

  draw();
}

/**
 * 9. KANBAN, CRM & PROJECT MANAGEMENT WORKSPACE
 */
export function renderMatzKanbanWorkspace(container: HTMLElement): void {
  const tasks = [
    { id: 'MATZ-101', title: 'Exportação W3C Design Tokens JSON', col: 'todo', tag: 'Tokens', prio: 'Alta' },
    { id: 'MATZ-102', title: 'Subpath Import de 1 Único Ícone (@matz/ui/icons/*)', col: 'doing', tag: 'Icons', prio: 'Crítica' },
    { id: 'MATZ-103', title: 'Inspeção X-Ray UX com Telemetria Box Model', col: 'doing', tag: 'UX Studio', prio: 'Alta' },
    { id: 'MATZ-104', title: 'Contraste WCAG 2.1 AAA em Inputs Semânticos', col: 'done', tag: 'WCAG', prio: 'Concluído' },
    { id: 'MATZ-105', title: 'Catálogo Expandido com 110+ Componentes', col: 'done', tag: 'Core', prio: 'Concluído' },
  ];

  const draw = () => {
    const cols = [
      { id: 'todo', title: 'Backlog & Planejado', badgeCls: '' },
      { id: 'doing', title: 'Em Execução (Sprint Ativa)', badgeCls: 'matz-badge-cyan' },
      { id: 'done', title: 'Concluído & Validado', badgeCls: 'matz-badge-emerald' },
    ];

    container.innerHTML = `
      <div class="matz-card" style="padding:22px;display:flex;flex-direction:column;gap:18px;width:100%;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
          <div>
            <span class="matz-badge matz-badge-cyan">KANBAN, CRM &amp; PROJETOS</span>
            <strong style="font-size:17px;display:block;margin-top:4px;">Quadro de Sprints Interativo (Clique em um cartão para avançar etapa)</strong>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="matz-badge matz-badge-emerald matz-tabular">${tasks.filter((t) => t.col === 'done').length}/${tasks.length} Entregues</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;align-items:stretch;">
          ${cols
            .map((c) => {
              const items = tasks.filter((t) => t.col === c.id);
              return `
              <div style="padding:14px;border-radius:var(--radius-md);background:var(--surface-elevated);border:1px solid var(--border);display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <strong style="font-size:13px;">${c.title}</strong>
                  <span class="matz-badge ${c.badgeCls} matz-tabular">${items.length}</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${items
                    .map(
                      (item) => `
                    <div class="matz-card" data-kb-card="${item.id}" style="padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:8px;background:var(--surface-card-solid);">
                      <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;">
                        <code style="font-family:var(--font-mono);color:var(--accent);font-weight:700;">${item.id}</code>
                        <span class="matz-badge" style="font-size:9.5px;padding:1px 6px;">${item.tag}</span>
                      </div>
                      <strong style="font-size:13px;line-height:1.4;">${item.title}</strong>
                      <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);">
                        <span>Prioridade: ${item.prio}</span>
                        <span style="color:var(--accent);font-weight:600;">Mover →</span>
                      </div>
                    </div>`
                    )
                    .join('')}
                </div>
              </div>`;
            })
            .join('')}
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLElement>('[data-kb-card]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.kbCard;
        const t = tasks.find((x) => x.id === id);
        if (!t) return;
        t.col = t.col === 'todo' ? 'doing' : t.col === 'doing' ? 'done' : 'todo';
        draw();
        showMatzToast(`Tarefa ${t.id} movida para "${t.col.toUpperCase()}"!`);
      });
    });
  };

  draw();
}
