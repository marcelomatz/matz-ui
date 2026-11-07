import { matzIcon, MatzIconName } from '../icons/Icons';
import { showMatzToast } from '../primitives/TitleBar';

let spotlightInitialized = false;

export function enableMatzSpotlight(): void {
  if (spotlightInitialized || typeof window === 'undefined') return;
  spotlightInitialized = true;

  window.addEventListener(
    'mousemove',
    (e) => {
      const cards = document.querySelectorAll<HTMLElement>('.matz-card, .matz-spotlight');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    },
    { passive: true }
  );
}

export interface RaycastCommandItem {
  id: string;
  label: string;
  category?: string;
  icon: MatzIconName;
  shortcut: string;
  onSelect?: () => void;
}

export const DEFAULT_RAYCAST_COMMANDS: RaycastCommandItem[] = [
  { id: 'cmd-search', label: 'Procurar componentes na Matz UI...', icon: 'search', shortcut: '⌘ K' },
  { id: 'cmd-metrics', label: 'Inspecionar Telemetria & Gauges em Tempo Real', icon: 'gauge', shortcut: '⌘ J' },
  { id: 'cmd-vault', label: 'Upload Precision Obsidian · Cofre Zero-Knowledge', icon: 'lock', shortcut: '⇧ ⌘ V' },
  { id: 'cmd-optics', label: 'Alternar Tema Dark Obsidian / Light Alabaster', icon: 'sun', shortcut: '⌘ D' },
  { id: 'cmd-heapi', label: 'Disparar Requisição HTTP mTLS (Heapi Engine)', icon: 'api', shortcut: '⌘ R' },
  { id: 'cmd-bycode', label: 'Executar Agente Autônomo no Workspace (byCode)', icon: 'sparkles', shortcut: '⌘ I' },
  { id: 'cmd-myterm', label: 'Abrir Novo Split-Pane PTY (MyTerm)', icon: 'terminal', shortcut: '⌘ T' },
];

export function renderEmbeddedRaycastPalette(
  container: HTMLElement,
  commands: RaycastCommandItem[] = DEFAULT_RAYCAST_COMMANDS
): void {
  let query = '';
  let activeIdx = 0;

  const draw = () => {
    const filtered = commands.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase())
    );
    if (activeIdx >= filtered.length) activeIdx = 0;

    container.innerHTML = `
      <div class="matz-raycast-box matz-beam-bottom" style="width:100%;">
        <div class="matz-raycast-input-wrap">
          <span style="color:var(--text-muted);">${matzIcon('search', 16)}</span>
          <input class="matz-raycast-input" id="rc-inline-input" placeholder="Procurar comandos ou componentes..." value="${query.replace(/"/g, '&quot;')}" autocomplete="off" />
          <span class="matz-kbd">ESC</span>
        </div>
        <div class="matz-raycast-list">
          ${
            filtered.length === 0
              ? `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12.5px;">Nenhum comando encontrado para "${query}"</div>`
              : filtered
                  .map(
                    (item, idx) => `
              <div class="matz-raycast-item ${idx === activeIdx ? 'active' : ''}" data-rc-idx="${idx}">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="color:${idx === activeIdx ? 'var(--accent)' : 'var(--text-muted)'};">${matzIcon(item.icon, 15)}</span>
                  <span style="font-size:13px;font-weight:${idx === activeIdx ? '600' : '500'};">${item.label}</span>
                </div>
                <span class="matz-kbd">${item.shortcut}</span>
              </div>
            `
                  )
                  .join('')
          }
        </div>
        <div style="padding:8px 14px;border-top:1px solid var(--border);background:var(--surface-subtle);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);">
          <span style="display:flex;align-items:center;gap:6px;">${matzIcon('command', 12)} Matz OmniCommand Engine · @matz/ui v4.0</span>
          <span><kbd class="matz-kbd">↑↓</kbd> navegar · <kbd class="matz-kbd">↵</kbd> executar</span>
        </div>
      </div>
    `;

    const input = container.querySelector<HTMLInputElement>('#rc-inline-input')!;
    input.addEventListener('input', () => {
      query = input.value;
      activeIdx = 0;
      draw();
      const nextInput = container.querySelector<HTMLInputElement>('#rc-inline-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(query.length, query.length);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % Math.max(1, filtered.length);
        draw();
        container.querySelector<HTMLInputElement>('#rc-inline-input')?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length);
        draw();
        container.querySelector<HTMLInputElement>('#rc-inline-input')?.focus();
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        const chosen = filtered[activeIdx];
        if (chosen.onSelect) chosen.onSelect();
        else showMatzToast(`Comando executado: ${chosen.label}`);
      }
    });

    container.querySelectorAll<HTMLElement>('[data-rc-idx]').forEach((row) => {
      row.addEventListener('click', () => {
        const idx = Number(row.dataset.rcIdx);
        const chosen = filtered[idx];
        if (chosen) {
          activeIdx = idx;
          if (chosen.onSelect) chosen.onSelect();
          else showMatzToast(`Comando executado: ${chosen.label}`);
          draw();
        }
      });
    });
  };

  draw();
}

export function openRaycastCommandModal(
  commands: RaycastCommandItem[] = DEFAULT_RAYCAST_COMMANDS
): void {
  const existing = document.getElementById('matz-global-raycast');
  if (existing) {
    existing.remove();
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'matz-global-raycast';
  backdrop.className = 'matz-cmd-backdrop';

  const holder = document.createElement('div');
  holder.style.width = 'min(620px, 92vw)';
  backdrop.appendChild(holder);

  const wrapped = commands.map((c) => ({
    ...c,
    onSelect: () => {
      backdrop.remove();
      if (c.onSelect) c.onSelect();
      else showMatzToast(`Comando executado: ${c.label}`);
    },
  }));

  renderEmbeddedRaycastPalette(holder, wrapped);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  document.body.appendChild(backdrop);
  holder.querySelector<HTMLInputElement>('#rc-inline-input')?.focus();
}

export interface LinearTaskItem {
  id: string;
  title: string;
  group: 'Tarefas' | 'Bloqueios' | 'Exemplos';
  tag: string;
  tagVariant: 'matz-badge-cyan' | 'matz-badge-rose' | 'matz-badge-amber' | '';
  done: boolean;
}

export function renderLinearWorkspaceCard(container: HTMLElement): void {
  const tasks: LinearTaskItem[] = [
    { id: 't-1', title: 'Otimização de renderização WebGL 60fps', group: 'Tarefas', tag: 'Optimization', tagVariant: 'matz-badge-cyan', done: true },
    { id: 't-2', title: 'Camada especular 1px Obsidian & Glass', group: 'Bloqueios', tag: 'Default', tagVariant: 'matz-badge-amber', done: false },
    { id: 't-3', title: 'Isolamento criptográfico Argon2id + AES-GCM', group: 'Bloqueios', tag: 'Important', tagVariant: 'matz-badge-rose', done: false },
    { id: 't-4', title: 'Sincronização IPC ~/.matz/ entre binários', group: 'Bloqueios', tag: 'Feature', tagVariant: '', done: true },
    { id: 't-5', title: 'Validação de certificados mTLS PKCS#12', group: 'Bloqueios', tag: 'Custom', tagVariant: 'matz-badge-cyan', done: false },
    { id: 't-6', title: 'Telemetria de releases GitHub em tempo real', group: 'Tarefas', tag: 'Analytics', tagVariant: 'matz-badge-cyan', done: false },
  ];

  let activeNav = 'Gerenciamento';

  const draw = () => {
    const doneCount = tasks.filter((t) => t.done).length;
    const score = Math.round((doneCount / tasks.length) * 100);

    container.innerHTML = `
      <div class="matz-card matz-beam-top" style="padding:0;overflow:hidden;">
        <div style="padding:10px 14px;border-bottom:1px solid var(--border);background:var(--surface-subtle);display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="width:10px;height:10px;border-radius:50%;background:#f43f5e;"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#10b981;"></span>
            <span style="margin-left:8px;font-size:11.5px;color:var(--text-secondary);font-weight:600;">Matz Workflow Board · Specular Obsidian</span>
          </div>
          <span class="matz-badge" style="font-size:10px;">${doneCount}/${tasks.length} concluídas</span>
        </div>

        <div style="display:grid;grid-template-columns:160px 1fr 145px;min-height:330px;">
          <aside style="border-right:1px solid var(--border);background:var(--surface-canvas);padding:12px 8px;display:flex;flex-direction:column;gap:3px;">
            <div style="padding:4px 8px 10px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:12px;">
              <span class="matz-brand-dot"></span>
              <span>Matz Studio</span>
            </div>
            ${[
              { name: 'Tarefas', icon: 'check-circle' as MatzIconName },
              { name: 'Conexões', icon: 'api' as MatzIconName },
              { name: 'Usuários', icon: 'user' as MatzIconName },
              { name: 'Gerenciamento', icon: 'layers' as MatzIconName },
              { name: 'Métricas', icon: 'chart' as MatzIconName },
              { name: 'Documentos', icon: 'file' as MatzIconName },
            ]
              .map(
                (n) => `
              <div data-lin-nav="${n.name}" style="display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:6px;font-size:12px;cursor:pointer;color:${
                  activeNav === n.name ? 'var(--text-primary)' : 'var(--text-secondary)'
                };background:${activeNav === n.name ? 'var(--bg-active)' : 'transparent'};font-weight:${activeNav === n.name ? '600' : '500'};">
                ${matzIcon(n.icon, 13)}
                <span>${n.name}</span>
              </div>`
              )
              .join('')}
          </aside>

          <div style="display:flex;flex-direction:column;background:var(--surface-card-solid);">
            <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;">
              <strong style="font-size:14px;">${activeNav}</strong>
              <button class="matz-btn matz-btn-sm" id="lin-add-btn">${matzIcon('plus', 12)} Adicionar</button>
            </div>
            <div style="flex:1;overflow-y:auto;">
              ${tasks
                .map(
                  (t) => `
                <div class="matz-linear-row" data-task-id="${t.id}">
                  <div style="display:flex;align-items:center;gap:9px;min-width:0;">
                    <span style="color:${t.done ? 'var(--accent)' : 'var(--text-muted)'};display:flex;">
                      ${matzIcon(t.done ? 'check-circle' : 'circle', 14)}
                    </span>
                    <span style="font-size:12.5px;color:${
                      t.done ? 'var(--text-muted)' : 'var(--text-primary)'
                    };text-decoration:${t.done ? 'line-through' : 'none'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${t.title}
                    </span>
                  </div>
                  <span class="matz-badge ${t.tagVariant}" style="font-size:10px;padding:1.5px 7px;flex-shrink:0;">${t.tag}</span>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <aside style="border-left:1px solid var(--border);background:var(--surface-canvas);padding:14px 12px;display:flex;flex-direction:column;gap:14px;">
            <div>
              <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:6px;">Velocity Score</div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;box-shadow:0 0 8px #f59e0b;"></span>
                <strong class="matz-tabular" style="font-size:22px;">${score}%</strong>
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.45;">
                Clique em qualquer item da lista para alternar seu status em tempo real.
              </p>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:12px;">
              <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:6px;">Telemetria</div>
              <div class="matz-tabular" style="font-size:11.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                <span>1. Latência: 0.4ms</span>
                <span>2. Memória: 28 MB</span>
                <span>3. FPS: 60.0</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLElement>('[data-task-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const found = tasks.find((t) => t.id === row.dataset.taskId);
        if (found) {
          found.done = !found.done;
          draw();
        }
      });
    });

    container.querySelectorAll<HTMLElement>('[data-lin-nav]').forEach((nav) => {
      nav.addEventListener('click', () => {
        activeNav = nav.dataset.linNav || 'Gerenciamento';
        draw();
      });
    });

    container.querySelector('#lin-add-btn')?.addEventListener('click', () => {
      tasks.unshift({
        id: `t-${Date.now()}`,
        title: `Nova especificação #${tasks.length + 1}`,
        group: 'Tarefas',
        tag: 'Feature',
        tagVariant: 'matz-badge-cyan',
        done: false,
      });
      draw();
    });
  };

  draw();
}

export function renderWarpRefractionWindow(container: HTMLElement): void {
  const snippets: Record<string, { code: string; func: string; metrics: Array<[string, string]> }> = {
    'precision_obsidian.ts': {
      code: `import { enableMatzSpotlight } from '@matz/ui';
import { OpenWAL } from 'matz-core/sqlite';

export async function bootPrecisionGlass() {
  enableMatzSpotlight();
  const db = await OpenWAL('~/.matz/telemetry.db');
  return {
    renderer: 'WebGL2 + Specular Glass',
    refractionIndex: 1.492,
    zeroFrameworkBloat: true,
  };
}`,
      func: `function deriveRefractionKey() {
  return "argon2id::v3.5::obsidian";
}`,
      metrics: [
        ['FRAME_BUDGET', '000.16ms (60fps)'],
        ['VRAM_SHADER', '00014.2 MB'],
        ['SPECULAR_LUX', '00840.0 cd/m²'],
        ['ARGON2_HASH', '239532325527'],
        ['TLS_SESSION', '10603.930-4480-830'],
        ['NONCE_GCM', '232:23:22:3:22:3008'],
      ],
    },
    'http_engine.go': {
      code: `package httpengine

func (e *Engine) DoWithMTLS(ctx context.Context, req Request) (*Response, error) {
  ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
  defer cancel()
  body := io.LimitReader(resp.Body, 50*1024*1024)
  return parseSpecularResponse(body), nil
}`,
      func: `func verifyPKCS12Pool() bool {
  return tls.VersionTLS13 == 0x0304
}`,
      metrics: [
        ['TLS_VERSION', 'TLS 1.3 (0x0304)'],
        ['MTLS_POOL', 'ACTIVE_PKCS12'],
        ['MAX_PAYLOAD', '52,428,800 B'],
        ['DNS_LOOKUP', '00001.8 ms'],
        ['TCP_HANDSHAKE', '00006.4 ms'],
        ['STATUS_CODE', '200 OK'],
      ],
    },
  };

  let activeFile = 'precision_obsidian.ts';

  const draw = () => {
    const active = snippets[activeFile];
    const lines = active.code.split('\n');

    container.innerHTML = `
      <div class="matz-warp-frame">
        <div class="matz-warp-inner">
          <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="width:10px;height:10px;border-radius:50%;background:#f43f5e;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#10b981;"></span>
              <span style="margin-left:8px;font-size:11.5px;color:#f8fafc;font-weight:600;">Matz Prismatic Surface · Chromatic Glass</span>
            </div>
            <div style="display:flex;gap:6px;">
              ${Object.keys(snippets)
                .map(
                  (fname) => `
                <button data-warp-file="${fname}" class="matz-btn matz-btn-sm ${
                    activeFile === fname ? 'matz-btn-primary' : ''
                  }" style="font-family:var(--font-mono);height:26px;padding:0 8px;">${fname}</button>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1.35fr 1fr;min-height:330px;font-family:var(--font-mono);font-size:11.5px;">
            <div style="padding:16px;border-right:1px solid rgba(255,255,255,0.08);overflow-x:auto;">
              ${lines
                .map(
                  (line, i) => `
                <div style="display:flex;gap:12px;line-height:1.75;">
                  <span style="color:rgba(255,255,255,0.32);user-select:none;width:18px;text-align:right;">${i + 1}</span>
                  <span style="color:#e2e8f0;white-space:pre;">${line
                    .replace(/import|from|export|async|function|return|const|await|package|func|defer/g, (m) => `<span style="color:#c084fc;font-weight:600;">${m}</span>`)
                    .replace(/'[^']*'/g, (m) => `<span style="color:#38bdf8;">${m}</span>`)}</span>
                </div>`
                )
                .join('')}
            </div>

            <div style="padding:16px;display:flex;flex-direction:column;justify-content:space-between;background:rgba(4,6,12,0.45);">
              <div>
                <div style="font-size:10.5px;color:#38bdf8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Refraction Shader Kernel</div>
                <pre style="color:#e2e8f0;font-size:11px;line-height:1.6;white-space:pre-wrap;background:rgba(255,255,255,0.04);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">${active.func}</pre>
              </div>

              <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;display:flex;flex-direction:column;gap:5px;">
                ${active.metrics
                  .map(
                    ([k, v]) => `
                  <div style="display:flex;justify-content:space-between;font-size:11px;">
                    <span style="color:rgba(155,163,190,0.85);">${k}</span>
                    <strong class="matz-tabular" style="color:#f8fafc;">${v}</strong>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-warp-file]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFile = btn.dataset.warpFile || 'precision_obsidian.ts';
        draw();
      });
    });
  };

  draw();
}

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => string;
}

export function renderMatzDataTable<T extends Record<string, any>>(
  container: HTMLElement,
  title: string,
  columns: DataTableColumn<T>[],
  rows: T[]
): void {
  let searchQuery = '';
  let sortKey: keyof T | null = null;
  let sortAsc = true;

  const draw = () => {
    let filtered = rows.filter((r) =>
      Object.values(r).some((v) =>
        String(v).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      const k = sortKey;
      filtered = [...filtered].sort((a, b) => {
        const va = a[k];
        const vb = b[k];
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    container.innerHTML = `
      <div class="matz-card matz-beam-top" style="padding:0;overflow:hidden;">
        <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <strong style="font-size:14px;">${title}</strong>
            <span class="matz-badge">${filtered.length} registros</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <input class="matz-input" id="dt-search-input" placeholder="Filtrar tabela em tempo real..." value="${searchQuery.replace(/"/g, '&quot;')}" style="width:230px;" />
          </div>
        </div>
        <div class="matz-table-wrap" style="border:none;border-radius:0;">
          <table class="matz-table">
            <thead>
              <tr>
                ${columns
                  .map(
                    (col) => `
                  <th data-sort-col="${String(col.key)}">
                    <span style="display:inline-flex;align-items:center;gap:5px;">
                      ${col.label}
                      ${sortKey === col.key ? (sortAsc ? '↑' : '↓') : ''}
                    </span>
                  </th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (row) => `
                <tr>
                  ${columns
                    .map(
                      (col) =>
                        `<td>${col.render ? col.render(row) : String(row[col.key] ?? '')}</td>`
                    )
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const input = container.querySelector<HTMLInputElement>('#dt-search-input')!;
    input.addEventListener('input', () => {
      searchQuery = input.value;
      draw();
      const next = container.querySelector<HTMLInputElement>('#dt-search-input');
      if (next) {
        next.focus();
        next.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    container.querySelectorAll<HTMLTableCellElement>('[data-sort-col]').forEach((th) => {
      th.addEventListener('click', () => {
        const k = th.dataset.sortCol as keyof T;
        if (sortKey === k) sortAsc = !sortAsc;
        else {
          sortKey = k;
          sortAsc = true;
        }
        draw();
      });
    });
  };

  draw();
}

export function renderMatzWaveformPlayer(
  container: HTMLElement,
  title: string,
  subtitle = 'PodIA Deep-Synthesis Audio Engine · 48kHz Neural Stream',
  audioUrl?: string
): void {
  let playing = false;
  let progress = 36;
  let speed = '1.0x';
  const bars = Array.from({ length: 44 }, (_, i) =>
    Math.round(18 + 75 * Math.abs(Math.sin(i * 0.35) * Math.cos(i * 0.14)))
  );

  const draw = () => {
    container.innerHTML = `
      <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="matz-btn matz-btn-primary" id="wf-play-btn" style="width:36px;height:36px;border-radius:50%;padding:0;">
              ${matzIcon(playing ? 'pause' : 'play', 15)}
            </button>
            <div>
              <div style="font-size:13.5px;font-weight:700;color:var(--text-primary);">${title}</div>
              <div style="font-size:11.5px;color:var(--text-muted);">${subtitle}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="matz-btn matz-btn-sm" id="wf-speed-btn" style="font-family:var(--font-mono);">${speed}</button>
            <span class="matz-badge matz-badge-cyan">LOSSLESS</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:3px;height:46px;padding:0 4px;cursor:pointer;" id="wf-bars">
          ${bars
            .map((h, idx) => {
              const pct = (idx / bars.length) * 100;
              const passed = pct <= progress;
              return `<div data-bar-pct="${pct.toFixed(0)}" style="flex:1;height:${h}%;border-radius:99px;background:${
                passed ? 'var(--accent)' : 'var(--chart-track)'
              };box-shadow:${passed ? '0 0 8px var(--accent-glow)' : 'none'};transition:all 0.15s ease;"></div>`;
            })
            .join('')}
        </div>

        ${audioUrl ? `<audio id="wf-native-audio" src="${audioUrl}" style="display:none;"></audio>` : ''}
      </div>
    `;

    container.querySelector('#wf-play-btn')?.addEventListener('click', () => {
      playing = !playing;
      draw();
    });

    container.querySelector('#wf-speed-btn')?.addEventListener('click', () => {
      const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
      speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
      draw();
    });

    container.querySelectorAll<HTMLElement>('[data-bar-pct]').forEach((bar) => {
      bar.addEventListener('click', () => {
        progress = Number(bar.dataset.barPct);
        draw();
      });
    });
  };

  draw();
}

export function renderMatzCombobox(
  container: HTMLElement,
  options: Array<{ value: string; label: string; badge?: string }>,
  initialValue?: string,
  onChange?: (val: string) => void
): void {
  let selected = initialValue || options[0]?.value || '';
  let open = false;

  const draw = () => {
    const activeItem = options.find((o) => o.value === selected) || options[0];

    container.innerHTML = `
      <div class="matz-combobox" style="min-width:240px;">
        <button type="button" class="matz-combobox-trigger" id="cb-trigger">
          <span style="display:flex;align-items:center;gap:8px;">
            <span>${activeItem?.label || 'Selecione...'}</span>
            ${activeItem?.badge ? `<span class="matz-badge" style="font-size:10px;padding:1px 6px;">${activeItem.badge}</span>` : ''}
          </span>
          ${matzIcon('chevron-down', 14)}
        </button>
        <div class="matz-combobox-menu ${open ? 'open' : ''}">
          ${options
            .map(
              (o) => `
            <div class="matz-combobox-option ${o.value === selected ? 'selected' : ''}" data-cb-val="${o.value}">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>${o.label}</span>
                ${o.badge ? `<span class="matz-badge" style="font-size:10px;padding:1px 6px;">${o.badge}</span>` : ''}
              </span>
              ${o.value === selected ? matzIcon('check', 13) : ''}
            </div>`
            )
            .join('')}
        </div>
      </div>
    `;

    container.querySelector('#cb-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      open = !open;
      draw();
    });

    container.querySelectorAll<HTMLElement>('[data-cb-val]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = el.dataset.cbVal || '';
        open = false;
        if (onChange) onChange(selected);
        draw();
      });
    });
  };

  draw();
}

export function renderMatzOTPInput(
  container: HTMLElement,
  digits = 6,
  onComplete?: (code: string) => void
): void {
  const values = Array.from({ length: digits }, (_, i) => (i < 3 ? String(i + 4) : ''));

  const draw = () => {
    container.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:8px;">
        ${values
          .map(
            (v, idx) => `
          <input
            type="text"
            maxlength="1"
            data-otp-idx="${idx}"
            value="${v}"
            class="matz-input matz-tabular"
            style="width:42px;height:46px;text-align:center;font-size:17px;font-weight:700;font-family:var(--font-mono);padding:0;"
          />
          ${idx === Math.floor(digits / 2) - 1 ? `<span style="color:var(--text-muted);font-weight:700;">—</span>` : ''}
        `
          )
          .join('')}
      </div>
    `;

    const inputs = container.querySelectorAll<HTMLInputElement>('[data-otp-idx]');
    inputs.forEach((inp, idx) => {
      inp.addEventListener('input', () => {
        values[idx] = inp.value.slice(-1);
        if (values[idx] && idx < digits - 1) {
          inputs[idx + 1]?.focus();
        }
        const full = values.join('');
        if (full.length === digits && onComplete) {
          onComplete(full);
        }
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) {
          values[idx - 1] = '';
          inputs[idx - 1]?.focus();
        }
      });
    });
  };

  draw();
}

export function renderMatzAccordion(
  container: HTMLElement,
  items: Array<{ title: string; content: string }>
): void {
  let openIdx: number | null = 0;

  const draw = () => {
    container.innerHTML = `
      <div style="width:100%;border-top:1px solid var(--border);">
        ${items
          .map(
            (item, idx) => `
          <div class="matz-accordion-item">
            <button type="button" class="matz-accordion-trigger" data-acc-idx="${idx}">
              <span>${item.title}</span>
              ${matzIcon(openIdx === idx ? 'chevron-down' : 'chevron-right', 15)}
            </button>
            ${openIdx === idx ? `<div class="matz-accordion-content">${item.content}</div>` : ''}
          </div>`
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-acc-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.accIdx);
        openIdx = openIdx === idx ? null : idx;
        draw();
      });
    });
  };

  draw();
}

export function openMatzDialog(title: string, description: string, bodyHtml: string): void {
  const existing = document.getElementById('matz-dialog-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'matz-dialog-overlay';
  overlay.className = 'matz-cmd-backdrop';
  overlay.style.alignItems = 'center';
  overlay.style.paddingTop = '0';

  overlay.innerHTML = `
    <div class="matz-card matz-beam-top" style="width:min(480px,92vw);background:var(--surface-popover);border-color:var(--border-strong);box-shadow:var(--shadow-raycast);display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
          <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);">${title}</h3>
          <p style="font-size:12.5px;color:var(--text-secondary);margin-top:4px;">${description}</p>
        </div>
        <button class="matz-btn matz-btn-ghost matz-btn-sm" id="matz-dlg-close">${matzIcon('close', 14)}</button>
      </div>
      <div>${bodyHtml}</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid var(--border);">
        <button class="matz-btn" id="matz-dlg-cancel">Cancelar</button>
        <button class="matz-btn matz-btn-primary" id="matz-dlg-confirm">Confirmar Alterações</button>
      </div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('#matz-dlg-close')?.addEventListener('click', close);
  overlay.querySelector('#matz-dlg-cancel')?.addEventListener('click', close);
  overlay.querySelector('#matz-dlg-confirm')?.addEventListener('click', () => {
    close();
    showMatzToast('Ação confirmada com sucesso!');
  });

  document.body.appendChild(overlay);
}

export function openMatzSheetDrawer(title: string, subtitle: string, bodyHtml: string): void {
  const existing = document.getElementById('matz-sheet-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'matz-sheet-overlay';
  overlay.className = 'matz-cmd-backdrop';
  overlay.style.justifyContent = 'flex-end';
  overlay.style.paddingTop = '0';

  overlay.innerHTML = `
    <div style="width:min(400px,90vw);height:100vh;background:var(--surface-popover);border-left:1px solid var(--border-strong);box-shadow:var(--shadow-raycast);padding:24px;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <h3 style="font-size:17px;font-weight:700;color:var(--text-primary);">${title}</h3>
            <p style="font-size:12.5px;color:var(--text-secondary);margin-top:4px;">${subtitle}</p>
          </div>
          <button class="matz-btn matz-btn-ghost matz-btn-sm" id="matz-sheet-close">${matzIcon('close', 14)}</button>
        </div>
        <div>${bodyHtml}</div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border);">
        <button class="matz-btn" id="matz-sheet-cancel">Fechar</button>
        <button class="matz-btn matz-btn-primary" id="matz-sheet-save">Salvar no Cofre</button>
      </div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('#matz-sheet-close')?.addEventListener('click', close);
  overlay.querySelector('#matz-sheet-cancel')?.addEventListener('click', close);
  overlay.querySelector('#matz-sheet-save')?.addEventListener('click', () => {
    close();
    showMatzToast('Configurações salvas no Sheet Drawer!');
  });

  document.body.appendChild(overlay);
}
