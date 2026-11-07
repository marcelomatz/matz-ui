import { matzIcon, MatzIconName } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';

// ============================================================================
// 1. NAVIGATION RAIL & ADAPTIVE PANE
// ============================================================================
export interface NavRailItem {
  id: string;
  label: string;
  icon: MatzIconName;
  badge?: string;
}

export function renderMatzNavigationRail(
  container: HTMLElement,
  items?: NavRailItem[]
): void {
  const navItems: NavRailItem[] = items || [
    { id: 'overview', label: 'Visão Geral', icon: 'home' },
    { id: 'agents', label: 'Agentes IA', icon: 'bot', badge: '3' },
    { id: 'telemetry', label: 'Telemetria', icon: 'gauge' },
    { id: 'vault', label: 'Cofre SQLite', icon: 'vault' },
    { id: 'settings', label: 'Ajustes', icon: 'settings' },
  ];

  let activeId = navItems[0].id;

  const draw = () => {
    const activeItem = navItems.find((i) => i.id === activeId) || navItems[0];
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:84px minmax(0, 1fr);border-radius:var(--radius-lg);border:1px solid var(--border-strong);background:var(--surface-canvas);overflow:hidden;min-height:340px;">
        <!-- Compact Vertical Navigation Rail -->
        <nav aria-label="Navigation Rail" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:16px 8px;background:var(--surface-card-solid);border-right:1px solid var(--border);">
          <div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;">
            <!-- Primary Rail FAB -->
            <button type="button" id="rail-fab-btn" aria-label="Nova Ação Rápida" style="width:44px;height:44px;border-radius:14px;background:var(--accent);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 16px var(--accent-glow);">
              ${matzIcon('plus', 18)}
            </button>

            <div style="display:flex;flex-direction:column;gap:8px;width:100%;margin-top:4px;">
              ${navItems
                .map((it) => {
                  const isAct = it.id === activeId;
                  return `
                  <button
                    type="button"
                    data-rail-id="${it.id}"
                    aria-current="${isAct ? 'page' : 'false'}"
                    style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px;border:none;background:transparent;color:${
                      isAct ? 'var(--text-primary)' : 'var(--text-secondary)'
                    };cursor:pointer;width:100%;"
                  >
                    <span style="width:52px;height:30px;border-radius:999px;background:${
                      isAct ? 'var(--accent-muted)' : 'transparent'
                    };border:1px solid ${
                      isAct ? 'var(--accent-border)' : 'transparent'
                    };display:flex;align-items:center;justify-content:center;color:${
                      isAct ? 'var(--accent)' : 'inherit'
                    };transition:all 0.16s ease;">
                      ${matzIcon(it.icon, 17, '', { variant: isAct ? 'duotone' : 'outline' })}
                    </span>
                    <span style="font-size:10.5px;font-weight:${isAct ? '700' : '500'};">${it.label}</span>
                    ${
                      it.badge
                        ? `<span class="matz-tabular" style="position:absolute;top:2px;right:10px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#f43f5e;color:#fff;font-size:9.5px;font-weight:800;display:flex;align-items:center;justify-content:center;">${it.badge}</span>`
                        : ''
                    }
                  </button>`;
                })
                .join('')}
            </div>
          </div>

          <span style="width:32px;height:32px;border-radius:50%;background:var(--surface-elevated);border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent);">
            MZ
          </span>
        </nav>

        <!-- Adaptive Primary Stage -->
        <div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:10px;">
              ${matzIcon(activeItem.icon, 20, '', { variant: 'duotone', color: 'var(--accent)' })}
              <strong style="font-size:17px;">Painel Ativo: ${activeItem.label}</strong>
            </div>
            <span class="matz-badge matz-badge-cyan">Navigation Rail (84px) + Fluid Stage</span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;">
            <div class="matz-card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;">
              <span style="font-size:12px;color:var(--text-secondary);">Módulo Selecionado</span>
              <strong style="font-size:20px;color:var(--text-primary);">${activeItem.label}</strong>
              <span style="font-size:11.5px;color:var(--text-muted);">Padrão ideal para janelas Wails Desktop e tablets (600px–1200px).</span>
            </div>
            <div class="matz-card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;">
              <span style="font-size:12px;color:var(--text-secondary);">Ergonomia de Alvo (Fitts's Law)</span>
              <strong class="matz-tabular" style="font-size:20px;color:#10b981;">52 × 30 px Pill</strong>
              <span style="font-size:11.5px;color:var(--text-muted);">Indicador em pílula com variante óptica Duotone automática.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#rail-fab-btn')?.addEventListener('click', () => {
      showMatzToast('Ação primária disparada pelo FAB do Navigation Rail!');
    });

    container.querySelectorAll<HTMLButtonElement>('[data-rail-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeId = btn.dataset.railId || navItems[0].id;
        draw();
      });
    });
  };

  draw();
}

// ============================================================================
// 2. CHIPS SUITE (ASSIST, FILTER, INPUT & SUGGESTION CHIPS)
// ============================================================================
export function renderMatzChipsSuite(container: HTMLElement): void {
  const activeFilters = new Set<string>(['vanilla', 'wcag']);
  let inputTags = ['Go 1.27', 'Wails v3', 'SQLite WAL', 'Argon2id'];

  const draw = () => {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
        <!-- 1. Filter Chips (Multi-Select Toggle) -->
        <div class="matz-card" style="padding:20px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:14px;">1. Filter Chips (Seleção Múltipla com Checkmark)</strong>
            <span class="matz-badge matz-badge-cyan">${activeFilters.size} ativos</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${[
              { id: 'vanilla', label: 'Vanilla TypeScript' },
              { id: 'wails', label: 'Go + Wails Bridge' },
              { id: 'wcag', label: 'WCAG 2.1 AAA' },
              { id: 'ai', label: 'AI-First (llms.txt)' },
              { id: 'telemetry', label: '60fps Telemetry' },
            ]
              .map((f) => {
                const on = activeFilters.has(f.id);
                return `
                <button
                  type="button"
                  data-filter-chip="${f.id}"
                  aria-pressed="${on}"
                  style="display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all 0.14s ease;background:${
                    on ? 'var(--accent-muted)' : 'var(--surface-elevated)'
                  };color:${on ? 'var(--text-primary)' : 'var(--text-secondary)'};border:1px solid ${
                    on ? 'var(--accent)' : 'var(--border-strong)'
                  };"
                >
                  ${on ? matzIcon('check', 13, '', { color: 'var(--accent)', strokeWidth: 2.25 }) : ''}
                  <span>${f.label}</span>
                </button>`;
              })
              .join('')}
          </div>
        </div>

        <!-- 2. Input Chips (Removable Tags + Live Input) -->
        <div class="matz-card" style="padding:20px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:14px;">2. Input Chips (Tags Removíveis & Adição Rápida)</strong>
            <span class="matz-badge">Pressione Enter para adicionar</span>
          </div>
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px;border-radius:var(--radius-md);background:var(--surface-input);border:1px solid var(--border-strong);">
            ${inputTags
              .map(
                (tag, idx) => `
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--surface-elevated);border:1px solid var(--border-strong);font-size:12px;font-weight:600;color:var(--text-primary);">
                <span>${tag}</span>
                <button type="button" data-remove-chip="${idx}" aria-label="Remover ${tag}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;display:inline-flex;padding:1px;">
                  ${matzIcon('close', 12)}
                </button>
              </span>`
              )
              .join('')}
            <input id="new-chip-input" placeholder="+ Adicionar tecnologia..." style="border:none;background:transparent;outline:none;color:var(--text-primary);font-size:12.5px;min-width:160px;flex:1;" />
          </div>
        </div>

        <!-- 3. Assist & Suggestion Chips -->
        <div class="matz-card" style="padding:20px;display:flex;flex-direction:column;gap:12px;">
          <strong style="font-size:14px;">3. Assist & AI Suggestion Chips (Ações Contextuais)</strong>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${[
              { icon: 'sparkles' as MatzIconName, label: 'Gerar Componente com IA' },
              { icon: 'terminal' as MatzIconName, label: 'Copiar Comando CLI' },
              { icon: 'shield-check' as MatzIconName, label: 'Auditar Contraste WCAG' },
              { icon: 'download' as MatzIconName, label: 'Exportar W3C Tokens JSON' },
            ]
              .map(
                (a) => `
              <button type="button" data-assist-chip="${a.label}" class="matz-btn matz-btn-sm" style="border-radius:999px;padding:6px 13px;">
                ${matzIcon(a.icon, 13, '', { color: 'var(--accent)' })}
                <span>${a.label}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-filter-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.filterChip!;
        if (activeFilters.has(id)) activeFilters.delete(id);
        else activeFilters.add(id);
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-remove-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.removeChip);
        inputTags.splice(idx, 1);
        draw();
      });
    });

    const newChipInput = container.querySelector<HTMLInputElement>('#new-chip-input');
    newChipInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && newChipInput.value.trim()) {
        inputTags.push(newChipInput.value.trim());
        draw();
        container.querySelector<HTMLInputElement>('#new-chip-input')?.focus();
      }
    });

    container.querySelectorAll<HTMLButtonElement>('[data-assist-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        showMatzToast(`Assist Chip acionado: ${btn.dataset.assistChip}`);
      });
    });
  };

  draw();
}

// ============================================================================
// 3. STEPPER, BREADCRUMBS & PAGINATION
// ============================================================================
export function renderMatzStepperAndBreadcrumbs(container: HTMLElement): void {
  let currentStep = 1;
  let currentPage = 3;
  const steps = [
    { title: 'Inicializar Projeto', desc: 'npx @matz/ui@beta init' },
    { title: 'Configurar Tema & Tokens', desc: 'Specular Obsidian / Alabaster' },
    { title: 'Vincular Camada Wails', desc: '@matz/ui/wails IPC Bridge' },
    { title: 'Build de Produção', desc: 'Binário nativo < 20 MB RAM' },
  ];

  const draw = () => {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
        <!-- Interactive Multi-Step Stepper -->
        <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:14.5px;">1. Stepper Interativo de Fluxo (Passo ${currentStep + 1} de ${steps.length})</strong>
            <span class="matz-badge matz-badge-emerald">${Math.round(((currentStep + 1) / steps.length) * 100)}% Concluído</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(${steps.length}, minmax(0, 1fr));gap:12px;">
            ${steps
              .map((s, idx) => {
                const done = idx < currentStep;
                const active = idx === currentStep;
                return `
                <button
                  type="button"
                  data-step-idx="${idx}"
                  style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--radius-md);background:${
                    active ? 'var(--accent-muted)' : 'var(--surface-subtle)'
                  };border:1px solid ${
                    active ? 'var(--accent)' : done ? '#10b981' : 'var(--border)'
                  };text-align:left;cursor:pointer;"
                >
                  <span class="matz-tabular" style="width:26px;height:26px;border-radius:50%;background:${
                    done ? '#10b981' : active ? 'var(--accent)' : 'var(--surface-elevated)'
                  };color:#fff;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${done ? matzIcon('check', 13) : idx + 1}
                  </span>
                  <div style="min-width:0;">
                    <strong style="font-size:12.5px;display:block;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.title}</strong>
                    <span style="font-size:11px;color:var(--text-secondary);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.desc}</span>
                  </div>
                </button>`;
              })
              .join('')}
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);">
            <button class="matz-btn matz-btn-sm" id="step-prev-btn" ${currentStep === 0 ? 'disabled style="opacity:0.4;"' : ''}>
              ← Etapa Anterior
            </button>
            <span style="font-size:12.5px;color:var(--text-secondary);">Etapa ativa: <strong>${steps[currentStep].title}</strong></span>
            <button class="matz-btn matz-btn-sm matz-btn-primary" id="step-next-btn">
              ${currentStep < steps.length - 1 ? 'Avançar Etapa →' : 'Concluir Fluxo ✓'}
            </button>
          </div>
        </div>

        <!-- Breadcrumbs & Pagination Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
          <div class="matz-card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <strong style="font-size:14px;">2. Breadcrumb Hierárquico Semântico</strong>
            <nav aria-label="Breadcrumb" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 14px;border-radius:8px;background:var(--surface-input);border:1px solid var(--border);">
              <span style="display:inline-flex;align-items:center;gap:5px;color:var(--text-secondary);font-size:12.5px;">
                ${matzIcon('home', 13)} Workspace
              </span>
              ${matzIcon('chevron-right', 12)}
              <span style="color:var(--text-secondary);font-size:12.5px;">Design System</span>
              ${matzIcon('chevron-right', 12)}
              <span class="matz-badge matz-badge-cyan" style="font-size:11px;">Navegação & Fluxo</span>
            </nav>
          </div>

          <div class="matz-card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <strong style="font-size:14px;">3. Paginação Tabular (CLS = 0)</strong>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="matz-tabular" style="font-size:12px;color:var(--text-secondary);">Página <strong>${currentPage}</strong> de 8</span>
              <div style="display:flex;gap:4px;">
                ${[1, 2, 3, 4, 5, 8]
                  .map(
                    (p) => `
                  <button type="button" data-page-num="${p}" class="matz-btn matz-btn-sm ${
                      currentPage === p ? 'matz-btn-primary' : ''
                    } matz-tabular" style="min-width:32px;justify-content:center;padding:4px 8px;">
                    ${p}
                  </button>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-step-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentStep = Number(btn.dataset.stepIdx);
        draw();
      });
    });

    container.querySelector('#step-prev-btn')?.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        draw();
      }
    });

    container.querySelector('#step-next-btn')?.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        draw();
      } else {
        showMatzToast('Fluxo do Stepper concluído com sucesso!');
      }
    });

    container.querySelectorAll<HTMLButtonElement>('[data-page-num]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentPage = Number(btn.dataset.pageNum);
        draw();
      });
    });
  };

  draw();
}

// ============================================================================
// 4. CIRCULAR & LINEAR PROGRESS INDICATORS + TIMELINE
// ============================================================================
export function renderMatzProgressAndIndicators(container: HTMLElement): void {
  let pct = 72;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <!-- Circular & Linear Progress Card -->
        <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:15px;">Indicadores de Progresso Circular & Linear</strong>
            <span class="matz-badge matz-badge-cyan matz-tabular" id="prog-val-badge">${pct}%</span>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-around;gap:20px;padding:12px 0;">
            <!-- Determinate Circular SVG -->
            <div style="position:relative;width:88px;height:88px;display:flex;align-items:center;justify-content:center;">
              <svg width="88" height="88" viewBox="0 0 88 88" style="transform:rotate(-90deg);">
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--chart-track)" stroke-width="7"/>
                <circle id="prog-circ-ring" cx="44" cy="44" r="36" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="226.2" stroke-dashoffset="${(
                  226.2 *
                  (1 - pct / 100)
                ).toFixed(1)}"/>
              </svg>
              <span class="matz-tabular" id="prog-circ-lbl" style="position:absolute;font-size:16px;font-weight:800;font-family:var(--font-mono);">${pct}%</span>
            </div>

            <!-- Dual-Ring Telemetry Spinner -->
            <div style="position:relative;width:88px;height:88px;display:flex;align-items:center;justify-content:center;">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--chart-track)" stroke-width="6"/>
                <circle cx="44" cy="44" r="36" fill="none" stroke="#06b6d4" stroke-width="6" stroke-linecap="round" stroke-dasharray="70 160">
                  <animateTransform attributeName="transform" type="rotate" from="0 44 44" to="360 44 44" dur="1.2s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <span style="position:absolute;font-size:10.5px;font-weight:700;color:var(--text-secondary);">SYNC</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);">
              <label for="prog-range-slider">Ajustar Progresso Determinístico</label>
              <strong class="matz-tabular" id="prog-linear-lbl">${pct}%</strong>
            </div>
            <div class="matz-progress-track">
              <div class="matz-progress-fill" id="prog-linear-bar" style="width:${pct}%;"></div>
            </div>
            <input type="range" id="prog-range-slider" aria-label="Ajustar progresso" min="0" max="100" value="${pct}" style="width:100%;accent-color:var(--accent);cursor:pointer;margin-top:4px;" />
          </div>
        </div>

        <!-- Activity Timeline Feed -->
        <div class="matz-card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
          <strong style="font-size:15px;">Timeline de Eventos & Auditoria</strong>
          <div style="display:flex;flex-direction:column;gap:14px;border-left:2px solid var(--border-strong);margin-left:10px;padding-left:18px;">
            ${[
              { time: 'Agora · 0.4ms', title: 'Wails v3 IPC Bridge Conectada', desc: 'Canal bidirecional Go 1.27 inicializado sem erro.', color: '#10b981' },
              { time: 'Há 2 min', title: 'Contexto AI-First (/llms.txt) Sincronizado', desc: '185 ícones e 7 pilares de tokens indexados.', color: '#8b5cf6' },
              { time: 'Há 8 min', title: 'Cofre SQLite WAL Criptografado', desc: 'Chave derivada via Argon2id + AES-256-GCM.', color: '#06b6d4' },
            ]
              .map(
                (ev) => `
              <div style="position:relative;display:flex;flex-direction:column;gap:3px;">
                <span style="position:absolute;left:-24px;top:4px;width:10px;height:10px;border-radius:50%;background:${ev.color};box-shadow:0 0 8px ${ev.color};"></span>
                <span class="matz-tabular" style="font-size:10.5px;font-family:var(--font-mono);color:var(--text-muted);">${ev.time}</span>
                <strong style="font-size:13px;color:var(--text-primary);">${ev.title}</strong>
                <span style="font-size:12px;color:var(--text-secondary);">${ev.desc}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // In-place update on slider drag!
  const slider = container.querySelector<HTMLInputElement>('#prog-range-slider');
  const ring = container.querySelector<SVGCircleElement>('#prog-circ-ring');
  const circLbl = container.querySelector<HTMLElement>('#prog-circ-lbl');
  const linLbl = container.querySelector<HTMLElement>('#prog-linear-lbl');
  const linBar = container.querySelector<HTMLElement>('#prog-linear-bar');
  const badge = container.querySelector<HTMLElement>('#prog-val-badge');

  slider?.addEventListener('input', () => {
    pct = Number(slider.value);
    const offset = (226.2 * (1 - pct / 100)).toFixed(1);
    ring?.setAttribute('stroke-dashoffset', offset);
    if (circLbl) circLbl.textContent = `${pct}%`;
    if (linLbl) linLbl.textContent = `${pct}%`;
    if (badge) badge.textContent = `${pct}%`;
    if (linBar) linBar.style.width = `${pct}%`;
  });
}

// ============================================================================
// 5. AI-FIRST & AGENTIC UI SUITE (PROMPT COMPOSER, REASONING TRACE & TOOL CALLS)
// ============================================================================
export function renderMatzAgenticUISuite(container: HTMLElement): void {
  let reasoningOpen = true;
  let selectedModel = 'Claude 4.5 / Gemini 2.5 Pro';
  let promptText = 'Construa uma tela de telemetria com 3 gauges @matz/ui e ponte nativa Wails v3...';

  const draw = () => {
    const tokenCount = Math.max(12, Math.round(promptText.length * 0.35) + 148);
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
        <!-- 1. Collapsible Streaming Reasoning / Chain-of-Thought Card -->
        <div class="matz-collapsible-section">
          <button type="button" class="matz-collapsible-trigger" id="ai-reasoning-toggle">
            <div style="display:flex;align-items:center;gap:10px;">
              ${matzIcon('brain', 16, '', { variant: 'duotone', color: 'var(--accent)' })}
              <span style="font-weight:700;">Raciocínio do Agente (Chain-of-Thought)</span>
              <span class="matz-badge matz-badge-emerald matz-tabular">1.2s · 94 tok/s</span>
            </div>
            <span style="font-size:12px;color:var(--text-secondary);">
              ${reasoningOpen ? 'Recolher trilha ▾' : 'Expandir trilha ▸'}
            </span>
          </button>
          ${
            reasoningOpen
              ? `<div class="matz-collapsible-body" style="display:flex;flex-direction:column;gap:10px;font-size:12.5px;color:var(--text-secondary);">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${matzIcon('check-circle', 14, '', { color: '#10b981' })}
                    <span>Consultou manifesto <code>/llms.txt</code> (3.1k tokens) — identificou <code>renderArcGauge</code> e <code>createMatzWailsBridge</code>.</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${matzIcon('check-circle', 14, '', { color: '#10b981' })}
                    <span>Validou tokens semânticos <code>--surface-card</code> e <code>--surface-input</code> para conformidade WCAG 2.1 AAA.</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--surface-input);border:1px solid var(--border);">
                    ${matzIcon('terminal', 14, '', { color: '#06b6d4' })}
                    <code style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-primary);">MCP Tool Call: @matz/ui-mcp.inspectComponent({ id: "gauges-telemetry", framework: "vanilla" })</code>
                  </div>
                </div>`
              : ''
          }
        </div>

        <!-- 2. AI Prompt Composer Dock -->
        <div class="matz-card matz-beam-top" style="padding:18px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="matz-badge matz-badge-cyan">
                ${matzIcon('file-code', 11)} Contexto: /llms.txt anexado
              </span>
              <span class="matz-badge">
                ${matzIcon('shield-check', 11)} Zero-Hallucination Mode
              </span>
            </div>
            <span class="matz-tabular" id="ai-token-counter" style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);">
              ~${tokenCount} tokens no contexto
            </span>
          </div>

          <textarea id="ai-prompt-textarea" aria-label="Prompt para o Agente de IA" class="matz-textarea" style="height:76px;font-size:13.5px;">${promptText}</textarea>

          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <select id="ai-model-select" aria-label="Selecionar modelo de IA" class="matz-select" style="height:32px;font-size:12px;">
                <option>${selectedModel}</option>
                <option>Antigravity Agentic Pro</option>
                <option>Local Ollama / Llama 3.3 70B</option>
              </select>
              <button type="button" class="matz-btn matz-btn-sm" id="ai-attach-token-btn">
                ${matzIcon('plus', 12)} Anexar Token W3C
              </button>
            </div>

            <button type="button" class="matz-btn matz-btn-primary" id="ai-send-prompt-btn">
              ${matzIcon('send', 13)} Executar Geração UI
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#ai-reasoning-toggle')?.addEventListener('click', () => {
      reasoningOpen = !reasoningOpen;
      draw();
    });

    const ta = container.querySelector<HTMLTextAreaElement>('#ai-prompt-textarea');
    const tokCounter = container.querySelector<HTMLElement>('#ai-token-counter');
    ta?.addEventListener('input', () => {
      promptText = ta.value;
      const nextCount = Math.max(12, Math.round(promptText.length * 0.35) + 148);
      if (tokCounter) tokCounter.textContent = `~${nextCount} tokens no contexto`;
    });

    container.querySelector('#ai-attach-token-btn')?.addEventListener('click', () => {
      showMatzToast('Especificação W3C Design Tokens anexada ao prompt!');
    });

    container.querySelector('#ai-send-prompt-btn')?.addEventListener('click', () => {
      showMatzToast('Prompt enviado ao motor de geração @matz/ui!');
    });
  };

  draw();
}
