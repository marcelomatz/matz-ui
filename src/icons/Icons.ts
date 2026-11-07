export type MatzIconCategory =
  | 'Navegação & Direção'
  | 'Ações & Edição'
  | 'IA, LLMs & Agentes'
  | 'Dev, Terminal & Git'
  | 'Desktop Wails & Janelas'
  | 'Arquivos, Dados & Cloud'
  | 'Segurança, Cripto & Identidade'
  | 'Telemetria, Gráficos & Finanças'
  | 'Mídia, Áudio & Criação'
  | 'Comunicação, Status & Clima';

export type MatzIconVariant = 'outline' | 'duotone' | 'filled';

export interface MatzIconOptions {
  size?: number;
  strokeWidth?: 1.25 | 1.5 | 1.75 | 2 | 2.25;
  variant?: MatzIconVariant;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

export interface MatzIconMeta {
  name: MatzIconName;
  category: MatzIconCategory;
  tags: string[];
  path: string;
}

export type MatzIconName =
  // 1. Navegação & Direção (20)
  | 'search'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'menu'
  | 'home'
  | 'compass'
  | 'sidebar'
  | 'nav-rail'
  | 'maximize'
  | 'minimize'
  | 'external'
  | 'more-horizontal'
  | 'more-vertical'
  // 2. Ações & Edição (22)
  | 'plus'
  | 'minus'
  | 'check'
  | 'close'
  | 'edit'
  | 'feather'
  | 'copy'
  | 'clipboard'
  | 'trash'
  | 'save'
  | 'upload'
  | 'download'
  | 'share'
  | 'filter'
  | 'sort'
  | 'refresh'
  | 'undo'
  | 'redo'
  | 'pin'
  | 'bookmark'
  | 'link'
  | 'archive'
  // 3. IA, LLMs & Agentes (18)
  | 'sparkles'
  | 'bot'
  | 'brain'
  | 'wand'
  | 'prompt'
  | 'token'
  | 'workflow'
  | 'reasoning'
  | 'vector'
  | 'radar'
  | 'orbit'
  | 'atom'
  | 'bolt'
  | 'sliders'
  | 'target'
  | 'infinity'
  | 'lightbulb'
  | 'scan'
  // 4. Dev, Terminal & Git (20)
  | 'terminal'
  | 'code'
  | 'api'
  | 'command'
  | 'git-branch'
  | 'git-commit'
  | 'git-merge'
  | 'git-pull-request'
  | 'fork'
  | 'bug'
  | 'package'
  | 'webhook'
  | 'braces'
  | 'brackets'
  | 'binary'
  | 'cpu'
  | 'server'
  | 'sliders-code'
  | 'puzzle'
  | 'wrench'
  // 5. Desktop Wails & Janelas (16)
  | 'window'
  | 'app-window'
  | 'split-horizontal'
  | 'split-vertical'
  | 'dock'
  | 'monitor'
  | 'laptop'
  | 'smartphone'
  | 'tablet'
  | 'keyboard'
  | 'mouse'
  | 'hard-drive'
  | 'memory'
  | 'usb'
  | 'power'
  | 'cast'
  // 6. Arquivos, Dados & Cloud (18)
  | 'folder'
  | 'folder-open'
  | 'file'
  | 'file-code'
  | 'file-text'
  | 'database'
  | 'cloud'
  | 'cloud-upload'
  | 'cloud-download'
  | 'table'
  | 'kanban'
  | 'list'
  | 'grid'
  | 'layers'
  | 'box'
  | 'vault'
  | 'inbox'
  | 'columns'
  // 7. Segurança, Cripto & Identidade (18)
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'lock'
  | 'unlock'
  | 'key'
  | 'fingerprint'
  | 'eye'
  | 'eye-off'
  | 'user'
  | 'users'
  | 'user-check'
  | 'user-plus'
  | 'badge-check'
  | 'passkey'
  | 'certificate'
  | 'firewall'
  | 'incognito'
  // 8. Telemetria, Gráficos & Finanças (18)
  | 'activity'
  | 'gauge'
  | 'chart'
  | 'chart-pie'
  | 'chart-line'
  | 'trending-up'
  | 'trending-down'
  | 'pulse'
  | 'timer'
  | 'clock'
  | 'calendar'
  | 'credit-card'
  | 'wallet'
  | 'receipt'
  | 'coins'
  | 'dollar'
  | 'percent'
  | 'tag'
  // 9. Mídia, Áudio & Criação (16)
  | 'play'
  | 'pause'
  | 'stop'
  | 'skip-back'
  | 'skip-forward'
  | 'volume'
  | 'volume-mute'
  | 'mic'
  | 'mic-off'
  | 'image'
  | 'video'
  | 'camera'
  | 'headphones'
  | 'waveform'
  | 'palette'
  | 'droplet'
  // 10. Comunicação, Status & Clima (18)
  | 'send'
  | 'mail'
  | 'message'
  | 'chat'
  | 'bell'
  | 'alert'
  | 'alert-triangle'
  | 'info'
  | 'help-circle'
  | 'check-circle'
  | 'x-circle'
  | 'circle'
  | 'star'
  | 'heart'
  | 'sun'
  | 'moon'
  | 'globe'
  | 'flag'
  | 'settings';

export const MATZ_ICON_CATALOG: MatzIconMeta[] = [
  // ==========================================================================
  // 1. NAVEGAÇÃO & DIREÇÃO (20)
  // ==========================================================================
  { name: 'search', category: 'Navegação & Direção', tags: ['busca', 'procurar', 'lupa', 'find', 'query'], path: `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>` },
  { name: 'chevron-right', category: 'Navegação & Direção', tags: ['seta', 'direita', 'avançar', 'next'], path: `<polyline points="9 18 15 12 9 6"/>` },
  { name: 'chevron-left', category: 'Navegação & Direção', tags: ['seta', 'esquerda', 'voltar', 'prev', 'back'], path: `<polyline points="15 18 9 12 15 6"/>` },
  { name: 'chevron-up', category: 'Navegação & Direção', tags: ['seta', 'cima', 'recolher', 'collapse'], path: `<polyline points="18 15 12 9 6 15"/>` },
  { name: 'chevron-down', category: 'Navegação & Direção', tags: ['seta', 'baixo', 'expandir', 'dropdown'], path: `<polyline points="6 9 12 15 18 9"/>` },
  { name: 'arrow-right', category: 'Navegação & Direção', tags: ['seta', 'ir', 'forward', 'next'], path: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>` },
  { name: 'arrow-left', category: 'Navegação & Direção', tags: ['seta', 'voltar', 'back', 'return'], path: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>` },
  { name: 'arrow-up', category: 'Navegação & Direção', tags: ['seta', 'subir', 'top', 'up'], path: `<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>` },
  { name: 'arrow-down', category: 'Navegação & Direção', tags: ['seta', 'descer', 'bottom', 'down'], path: `<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>` },
  { name: 'arrow-up-right', category: 'Navegação & Direção', tags: ['diagonal', 'link', 'externo', 'launch'], path: `<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>` },
  { name: 'menu', category: 'Navegação & Direção', tags: ['hamburger', 'gaveta', 'drawer', 'nav'], path: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>` },
  { name: 'home', category: 'Navegação & Direção', tags: ['início', 'casa', 'dashboard', 'main'], path: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` },
  { name: 'compass', category: 'Navegação & Direção', tags: ['explorar', 'bússola', 'discover', 'safari'], path: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>` },
  { name: 'sidebar', category: 'Navegação & Direção', tags: ['painel', 'lateral', 'drawer', 'pane'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>` },
  { name: 'nav-rail', category: 'Navegação & Direção', tags: ['rail', 'barra', 'compacta', 'vertical'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="3" x2="7" y2="21"/><circle cx="5" cy="7" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="17" r="1"/>` },
  { name: 'maximize', category: 'Navegação & Direção', tags: ['tela cheia', 'expandir', 'fullscreen'], path: `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>` },
  { name: 'minimize', category: 'Navegação & Direção', tags: ['reduzir', 'compactar', 'restore'], path: `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>` },
  { name: 'external', category: 'Navegação & Direção', tags: ['abrir', 'nova aba', 'link', 'window'], path: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>` },
  { name: 'more-horizontal', category: 'Navegação & Direção', tags: ['opções', 'menu', 'reticências', 'dots'], path: `<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>` },
  { name: 'more-vertical', category: 'Navegação & Direção', tags: ['opções', 'kebab', 'contexto', 'menu'], path: `<circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>` },

  // ==========================================================================
  // 2. AÇÕES & EDIÇÃO (22)
  // ==========================================================================
  { name: 'plus', category: 'Ações & Edição', tags: ['adicionar', 'novo', 'criar', 'add', 'create'], path: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>` },
  { name: 'minus', category: 'Ações & Edição', tags: ['remover', 'subtrair', 'diminuir', 'remove'], path: `<line x1="5" y1="12" x2="19" y2="12"/>` },
  { name: 'check', category: 'Ações & Edição', tags: ['confirmar', 'ok', 'sucesso', 'done'], path: `<polyline points="20 6 9 17 4 12"/>` },
  { name: 'close', category: 'Ações & Edição', tags: ['fechar', 'cancelar', 'x', 'clear'], path: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>` },
  { name: 'edit', category: 'Ações & Edição', tags: ['editar', 'lápis', 'escrever', 'pencil'], path: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>` },
  { name: 'feather', category: 'Ações & Edição', tags: ['autor', 'nota', 'markdown', 'write'], path: `<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>` },
  { name: 'copy', category: 'Ações & Edição', tags: ['copiar', 'duplicar', 'clone'], path: `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>` },
  { name: 'clipboard', category: 'Ações & Edição', tags: ['colar', 'área de transferência', 'paste'], path: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>` },
  { name: 'trash', category: 'Ações & Edição', tags: ['excluir', 'deletar', 'lixeira', 'delete'], path: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>` },
  { name: 'save', category: 'Ações & Edição', tags: ['salvar', 'gravar', 'disquete', 'persist'], path: `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>` },
  { name: 'upload', category: 'Ações & Edição', tags: ['enviar', 'importar', 'subir', 'export'], path: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>` },
  { name: 'download', category: 'Ações & Edição', tags: ['baixar', 'exportar', 'salvar', 'fetch'], path: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>` },
  { name: 'share', category: 'Ações & Edição', tags: ['compartilhar', 'publicar', 'social'], path: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>` },
  { name: 'filter', category: 'Ações & Edição', tags: ['filtrar', 'funil', 'refinar'], path: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>` },
  { name: 'sort', category: 'Ações & Edição', tags: ['ordenar', 'classificar', 'order'], path: `<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>` },
  { name: 'refresh', category: 'Ações & Edição', tags: ['atualizar', 'recarregar', 'reload', 'sync'], path: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>` },
  { name: 'undo', category: 'Ações & Edição', tags: ['desfazer', 'voltar', 'revert'], path: `<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>` },
  { name: 'redo', category: 'Ações & Edição', tags: ['refazer', 'avançar', 'repeat'], path: `<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>` },
  { name: 'pin', category: 'Ações & Edição', tags: ['fixar', 'alfinete', 'sticky'], path: `<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>` },
  { name: 'bookmark', category: 'Ações & Edição', tags: ['favorito', 'marcador', 'salvar'], path: `<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>` },
  { name: 'link', category: 'Ações & Edição', tags: ['url', 'conexão', 'corrente', 'hyper'], path: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>` },
  { name: 'archive', category: 'Ações & Edição', tags: ['arquivar', 'caixa', 'histórico'], path: `<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>` },

  // ==========================================================================
  // 3. IA, LLMs & AGENTES (18)
  // ==========================================================================
  { name: 'sparkles', category: 'IA, LLMs & Agentes', tags: ['ia', 'ai', 'magia', 'gerar', 'llm', 'genai'], path: `<path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>` },
  { name: 'bot', category: 'IA, LLMs & Agentes', tags: ['agente', 'robô', 'assistente', 'copilot'], path: `<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>` },
  { name: 'brain', category: 'IA, LLMs & Agentes', tags: ['cérebro', 'raciocínio', 'memória', 'neural', 'thinking'], path: `<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>` },
  { name: 'wand', category: 'IA, LLMs & Agentes', tags: ['varinha', 'autocompletar', 'refatorar', 'magic'], path: `<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/>` },
  { name: 'prompt', category: 'IA, LLMs & Agentes', tags: ['instrução', 'chat', 'input', 'llm'], path: `<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 10 3 2-3 2"/><line x1="12" y1="14" x2="17" y2="14"/>` },
  { name: 'token', category: 'IA, LLMs & Agentes', tags: ['contexto', 'contagem', 'moeda', 'chunk'], path: `<polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2"/><circle cx="12" cy="12" r="3"/>` },
  { name: 'workflow', category: 'IA, LLMs & Agentes', tags: ['fluxo', 'pipeline', 'grafo', 'nós', 'automation'], path: `<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/><circle cx="18" cy="6" r="3"/>` },
  { name: 'reasoning', category: 'IA, LLMs & Agentes', tags: ['chain of thought', 'cot', 'árvore', 'decisão'], path: `<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M12 7.5v4l-6 5"/><path d="m12 11.5 6 5"/>` },
  { name: 'vector', category: 'IA, LLMs & Agentes', tags: ['embedding', 'rag', 'busca semântica', 'matriz'], path: `<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10"/><path d="m6 8 5 8"/><path d="m18 8-5 8"/>` },
  { name: 'radar', category: 'IA, LLMs & Agentes', tags: ['escanear', 'monitorar', 'descoberta', 'sonar'], path: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><line x1="12" y1="12" x2="18.3" y2="5.7"/>` },
  { name: 'orbit', category: 'IA, LLMs & Agentes', tags: ['ecossistema', 'satélite', 'espaço', 'agent'], path: `<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)"/>` },
  { name: 'atom', category: 'IA, LLMs & Agentes', tags: ['física', 'núcleo', 'ciência', 'quantum'], path: `<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="3.5" ry="9"/>` },
  { name: 'bolt', category: 'IA, LLMs & Agentes', tags: ['rápido', 'flash', 'energia', 'instantâneo'], path: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>` },
  { name: 'sliders', category: 'IA, LLMs & Agentes', tags: ['parâmetros', 'temperatura', 'ajuste', 'config'], path: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>` },
  { name: 'target', category: 'IA, LLMs & Agentes', tags: ['precisão', 'meta', 'foco', 'objetivo'], path: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>` },
  { name: 'infinity', category: 'IA, LLMs & Agentes', tags: ['loop', 'contínuo', 'ilimitado', 'devops'], path: `<path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/>` },
  { name: 'lightbulb', category: 'IA, LLMs & Agentes', tags: ['ideia', 'insight', 'sugestão', 'dica'], path: `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>` },
  { name: 'scan', category: 'IA, LLMs & Agentes', tags: ['ocr', 'visão', 'ler', 'inspecionar'], path: `<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>` },

  // ==========================================================================
  // 4. DEV, TERMINAL & GIT (20)
  // ==========================================================================
  { name: 'terminal', category: 'Dev, Terminal & Git', tags: ['cli', 'shell', 'bash', 'console', 'pty'], path: `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>` },
  { name: 'code', category: 'Dev, Terminal & Git', tags: ['código', 'html', 'typescript', 'source'], path: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>` },
  { name: 'api', category: 'Dev, Terminal & Git', tags: ['endpoint', 'rest', 'graphql', 'http', 'webhook'], path: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>` },
  { name: 'command', category: 'Dev, Terminal & Git', tags: ['atalho', 'cmd', 'omnicommand', 'tecla'], path: `<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>` },
  { name: 'git-branch', category: 'Dev, Terminal & Git', tags: ['branch', 'ramo', 'versão', 'git'], path: `<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>` },
  { name: 'git-commit', category: 'Dev, Terminal & Git', tags: ['commit', 'hash', 'salvar', 'git'], path: `<circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/>` },
  { name: 'git-merge', category: 'Dev, Terminal & Git', tags: ['merge', 'unir', 'git', 'branch'], path: `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>` },
  { name: 'git-pull-request', category: 'Dev, Terminal & Git', tags: ['pr', 'review', 'git', 'diff'], path: `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>` },
  { name: 'fork', category: 'Dev, Terminal & Git', tags: ['bifurcar', 'clone', 'repositório'], path: `<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/>` },
  { name: 'bug', category: 'Dev, Terminal & Git', tags: ['erro', 'debug', 'inseto', 'issue'], path: `<rect x="8" y="6" width="8" height="14" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/>` },
  { name: 'package', category: 'Dev, Terminal & Git', tags: ['npm', 'módulo', 'lib', 'build', 'bundle'], path: `<path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>` },
  { name: 'webhook', category: 'Dev, Terminal & Git', tags: ['evento', 'callback', 'trigger', 'integração'], path: `<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>` },
  { name: 'braces', category: 'Dev, Terminal & Git', tags: ['json', 'objeto', 'chaves', 'schema'], path: `<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>` },
  { name: 'brackets', category: 'Dev, Terminal & Git', tags: ['array', 'lista', 'colchetes'], path: `<path d="M16 3h3v18h-3"/><path d="M8 21H5V3h3"/>` },
  { name: 'binary', category: 'Dev, Terminal & Git', tags: ['binário', 'compilado', 'go', 'baixo nível'], path: `<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>` },
  { name: 'cpu', category: 'Dev, Terminal & Git', tags: ['processador', 'hardware', 'chip', 'engine'], path: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>` },
  { name: 'server', category: 'Dev, Terminal & Git', tags: ['servidor', 'backend', 'infra', 'rack'], path: `<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>` },
  { name: 'sliders-code', category: 'Dev, Terminal & Git', tags: ['env', 'variáveis', 'config'], path: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/>` },
  { name: 'puzzle', category: 'Dev, Terminal & Git', tags: ['plugin', 'extensão', 'addon', 'módulo'], path: `<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>` },
  { name: 'wrench', category: 'Dev, Terminal & Git', tags: ['ferramenta', 'build', 'manutenção', 'fix'], path: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>` },

  // ==========================================================================
  // 5. DESKTOP WAILS & JANELAS (16)
  // ==========================================================================
  { name: 'window', category: 'Desktop Wails & Janelas', tags: ['janela', 'wails', 'frameless', 'titlebar'], path: `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="7" y1="6.5" x2="7.01" y2="6.5"/><line x1="10" y1="6.5" x2="10.01" y2="6.5"/>` },
  { name: 'app-window', category: 'Desktop Wails & Janelas', tags: ['aplicativo', 'desktop', 'nativo', 'gui'], path: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>` },
  { name: 'split-horizontal', category: 'Desktop Wails & Janelas', tags: ['dividir', 'colunas', 'lado a lado', 'pane'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>` },
  { name: 'split-vertical', category: 'Desktop Wails & Janelas', tags: ['dividir', 'linhas', 'empilhado'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/>` },
  { name: 'dock', category: 'Desktop Wails & Janelas', tags: ['barra', 'macos', 'taskbar', 'tray'], path: `<rect x="2" y="4" width="20" height="16" rx="2"/><rect x="6" y="14" width="12" height="3" rx="1"/>` },
  { name: 'monitor', category: 'Desktop Wails & Janelas', tags: ['tela', 'widescreen', 'display', 'desktop'], path: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>` },
  { name: 'laptop', category: 'Desktop Wails & Janelas', tags: ['notebook', 'computador', 'portátil'], path: `<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>` },
  { name: 'smartphone', category: 'Desktop Wails & Janelas', tags: ['celular', 'mobile', 'responsivo'], path: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>` },
  { name: 'tablet', category: 'Desktop Wails & Janelas', tags: ['ipad', 'viewport', 'responsivo'], path: `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>` },
  { name: 'keyboard', category: 'Desktop Wails & Janelas', tags: ['teclado', 'atalhos', 'acessibilidade', 'hotkey'], path: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>` },
  { name: 'mouse', category: 'Desktop Wails & Janelas', tags: ['cursor', 'clique', 'pointer'], path: `<rect x="6" y="3" width="12" height="18" rx="6"/><line x1="12" y1="7" x2="12" y2="11"/>` },
  { name: 'hard-drive', category: 'Desktop Wails & Janelas', tags: ['disco', 'ssd', 'armazenamento', 'local'], path: `<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>` },
  { name: 'memory', category: 'Desktop Wails & Janelas', tags: ['ram', 'memória', 'alocação'], path: `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M14 12h4M6 18v2M10 18v2M14 18v2M18 18v2"/>` },
  { name: 'usb', category: 'Desktop Wails & Janelas', tags: ['porta', 'serial', 'dispositivo'], path: `<circle cx="10" cy="7" r="1"/><circle cx="4" cy="20" r="1"/><path d="M4.7 19.3 19 5"/><path d="m21 3-3 1 2 2Z"/><path d="M9.26 7.68 5 12l2 5"/><path d="m10 14 5 2 3.5-3.5"/><path d="m18 12 1-1 1 1-1 1Z"/>` },
  { name: 'power', category: 'Desktop Wails & Janelas', tags: ['ligar', 'desligar', 'energia'], path: `<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>` },
  { name: 'cast', category: 'Desktop Wails & Janelas', tags: ['transmitir', 'tela', 'remoto'], path: `<path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><path d="M2 12a9 9 0 0 1 8 8"/><path d="M2 16a5 5 0 0 1 4 4"/><line x1="2" y1="20" x2="2.01" y2="20"/>` },

  // ==========================================================================
  // 6. ARQUIVOS, DADOS & CLOUD (18)
  // ==========================================================================
  { name: 'folder', category: 'Arquivos, Dados & Cloud', tags: ['pasta', 'diretório', 'projeto'], path: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>` },
  { name: 'folder-open', category: 'Arquivos, Dados & Cloud', tags: ['pasta aberta', 'explorar', 'workspace'], path: `<path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>` },
  { name: 'file', category: 'Arquivos, Dados & Cloud', tags: ['arquivo', 'documento', 'página'], path: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>` },
  { name: 'file-code', category: 'Arquivos, Dados & Cloud', tags: ['script', 'código', 'ts', 'go'], path: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>` },
  { name: 'file-text', category: 'Arquivos, Dados & Cloud', tags: ['texto', 'markdown', 'artigo', 'log'], path: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>` },
  { name: 'database', category: 'Arquivos, Dados & Cloud', tags: ['banco de dados', 'sqlite', 'sql', 'storage'], path: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>` },
  { name: 'cloud', category: 'Arquivos, Dados & Cloud', tags: ['nuvem', 'saas', 'remoto'], path: `<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>` },
  { name: 'cloud-upload', category: 'Arquivos, Dados & Cloud', tags: ['deploy', 'publicar', 'backup'], path: `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>` },
  { name: 'cloud-download', category: 'Arquivos, Dados & Cloud', tags: ['sincronizar', 'pull', 'restaurar'], path: `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/>` },
  { name: 'table', category: 'Arquivos, Dados & Cloud', tags: ['tabela', 'planilha', 'datagrid', 'linhas'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/>` },
  { name: 'kanban', category: 'Arquivos, Dados & Cloud', tags: ['quadro', 'board', 'tarefas', 'sprint'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>` },
  { name: 'list', category: 'Arquivos, Dados & Cloud', tags: ['lista', 'itens', 'fila'], path: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>` },
  { name: 'grid', category: 'Arquivos, Dados & Cloud', tags: ['grade', 'mosaico', 'cards', 'apps'], path: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>` },
  { name: 'layers', category: 'Arquivos, Dados & Cloud', tags: ['camadas', 'pilha', 'design system', 'stack'], path: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>` },
  { name: 'box', category: 'Arquivos, Dados & Cloud', tags: ['cubo', 'container', '3d', 'objeto'], path: `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>` },
  { name: 'vault', category: 'Arquivos, Dados & Cloud', tags: ['cofre', 'seguro', 'criptografado', 'writtt'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>` },
  { name: 'inbox', category: 'Arquivos, Dados & Cloud', tags: ['caixa de entrada', 'bandeja', 'fila'], path: `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>` },
  { name: 'columns', category: 'Arquivos, Dados & Cloud', tags: ['colunas', 'layout', 'grid'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>` },

  // ==========================================================================
  // 7. SEGURANÇA, CRIPTO & IDENTIDADE (18)
  // ==========================================================================
  { name: 'shield', category: 'Segurança, Cripto & Identidade', tags: ['escudo', 'proteção', 'segurança', 'wcag'], path: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>` },
  { name: 'shield-check', category: 'Segurança, Cripto & Identidade', tags: ['verificado', 'auditado', 'seguro', 'mtls'], path: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>` },
  { name: 'shield-alert', category: 'Segurança, Cripto & Identidade', tags: ['vulnerabilidade', 'alerta', 'risco'], path: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>` },
  { name: 'lock', category: 'Segurança, Cripto & Identidade', tags: ['cadeado', 'fechado', 'privado', 'aes'], path: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>` },
  { name: 'unlock', category: 'Segurança, Cripto & Identidade', tags: ['aberto', 'desbloquear', 'público'], path: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>` },
  { name: 'key', category: 'Segurança, Cripto & Identidade', tags: ['chave', 'token', 'api key', 'argon2'], path: `<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>` },
  { name: 'fingerprint', category: 'Segurança, Cripto & Identidade', tags: ['biometria', 'identidade', 'touchid', '2fa'], path: `<path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/>` },
  { name: 'eye', category: 'Segurança, Cripto & Identidade', tags: ['ver', 'mostrar', 'preview', 'visível'], path: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>` },
  { name: 'eye-off', category: 'Segurança, Cripto & Identidade', tags: ['ocultar', 'esconder', 'senha', 'mask'], path: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>` },
  { name: 'user', category: 'Segurança, Cripto & Identidade', tags: ['usuário', 'perfil', 'conta', 'avatar'], path: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>` },
  { name: 'users', category: 'Segurança, Cripto & Identidade', tags: ['equipe', 'time', 'grupo', 'organização'], path: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },
  { name: 'user-check', category: 'Segurança, Cripto & Identidade', tags: ['autenticado', 'aprovado', 'membro'], path: `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>` },
  { name: 'user-plus', category: 'Segurança, Cripto & Identidade', tags: ['convidar', 'novo usuário', 'cadastro'], path: `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>` },
  { name: 'badge-check', category: 'Segurança, Cripto & Identidade', tags: ['selo', 'oficial', 'certificado', 'verified'], path: `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>` },
  { name: 'passkey', category: 'Segurança, Cripto & Identidade', tags: ['webauthn', 'fido2', 'credencial'], path: `<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="17" cy="17" r="3"/><path d="m19.5 19.5 2.5 2.5"/>` },
  { name: 'certificate', category: 'Segurança, Cripto & Identidade', tags: ['tls', 'ssl', 'x509', 'assinatura'], path: `<rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="12" cy="11" r="3"/><path d="m10 17-1 5 3-2 3 2-1-5"/>` },
  { name: 'firewall', category: 'Segurança, Cripto & Identidade', tags: ['rede', 'bloqueio', 'proxy', 'waf'], path: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="9"/><line x1="15" y1="9" x2="15" y2="15"/><line x1="9" y1="15" x2="9" y2="21"/>` },
  { name: 'incognito', category: 'Segurança, Cripto & Identidade', tags: ['anônimo', 'privacidade', 'zero-knowledge'], path: `<path d="M3 11h18"/><path d="m5 11 2-6h10l2 6"/><circle cx="7.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M10 16.5h4"/>` },

  // ==========================================================================
  // 8. TELEMETRIA, GRÁFICOS & FINANÇAS (18)
  // ==========================================================================
  { name: 'activity', category: 'Telemetria, Gráficos & Finanças', tags: ['pulso', 'osciloscópio', 'sinal', 'fps'], path: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>` },
  { name: 'gauge', category: 'Telemetria, Gráficos & Finanças', tags: ['velocímetro', 'medidor', 'performance'], path: `<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>` },
  { name: 'chart', category: 'Telemetria, Gráficos & Finanças', tags: ['gráfico', 'barras', 'analytics', 'métricas'], path: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>` },
  { name: 'chart-pie', category: 'Telemetria, Gráficos & Finanças', tags: ['pizza', 'donut', 'proporção'], path: `<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>` },
  { name: 'chart-line', category: 'Telemetria, Gráficos & Finanças', tags: ['linha', 'série temporal', 'área'], path: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` },
  { name: 'trending-up', category: 'Telemetria, Gráficos & Finanças', tags: ['crescimento', 'alta', 'positivo', 'delta'], path: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>` },
  { name: 'trending-down', category: 'Telemetria, Gráficos & Finanças', tags: ['queda', 'redução', 'otimização'], path: `<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>` },
  { name: 'pulse', category: 'Telemetria, Gráficos & Finanças', tags: ['healthcheck', 'status', 'vivo'], path: `<circle cx="12" cy="12" r="9"/><path d="M7 12h2l1.5-3 3 6 1.5-3h2"/>` },
  { name: 'timer', category: 'Telemetria, Gráficos & Finanças', tags: ['cronômetro', 'latência', 'benchmark', 'ms'], path: `<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>` },
  { name: 'clock', category: 'Telemetria, Gráficos & Finanças', tags: ['relógio', 'hora', 'tempo', 'agendamento'], path: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>` },
  { name: 'calendar', category: 'Telemetria, Gráficos & Finanças', tags: ['data', 'agenda', 'datepicker', 'mês'], path: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>` },
  { name: 'credit-card', category: 'Telemetria, Gráficos & Finanças', tags: ['cartão', 'pagamento', 'billing', 'checkout'], path: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>` },
  { name: 'wallet', category: 'Telemetria, Gráficos & Finanças', tags: ['carteira', 'saldo', 'finanças'], path: `<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>` },
  { name: 'receipt', category: 'Telemetria, Gráficos & Finanças', tags: ['fatura', 'nota fiscal', 'invoice'], path: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>` },
  { name: 'coins', category: 'Telemetria, Gráficos & Finanças', tags: ['moedas', 'custo', 'créditos'], path: `<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/>` },
  { name: 'dollar', category: 'Telemetria, Gráficos & Finanças', tags: ['preço', 'receita', 'valor'], path: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>` },
  { name: 'percent', category: 'Telemetria, Gráficos & Finanças', tags: ['taxa', 'desconto', 'proporção'], path: `<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>` },
  { name: 'tag', category: 'Telemetria, Gráficos & Finanças', tags: ['etiqueta', 'categoria', 'versão', 'label'], path: `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>` },

  // ==========================================================================
  // 9. MÍDIA, ÁUDIO & CRIAÇÃO (16)
  // ==========================================================================
  { name: 'play', category: 'Mídia, Áudio & Criação', tags: ['reproduzir', 'iniciar', 'executar', 'run'], path: `<polygon points="5 3 19 12 5 21 5 3"/>` },
  { name: 'pause', category: 'Mídia, Áudio & Criação', tags: ['pausar', 'aguardar', 'interromper'], path: `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>` },
  { name: 'stop', category: 'Mídia, Áudio & Criação', tags: ['parar', 'encerrar', 'kill'], path: `<rect x="5" y="5" width="14" height="14" rx="2"/>` },
  { name: 'skip-back', category: 'Mídia, Áudio & Criação', tags: ['anterior', 'voltar faixa', 'rewind'], path: `<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>` },
  { name: 'skip-forward', category: 'Mídia, Áudio & Criação', tags: ['próxima', 'avançar faixa', 'next'], path: `<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>` },
  { name: 'volume', category: 'Mídia, Áudio & Criação', tags: ['som', 'áudio', 'alto-falante', 'speaker'], path: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>` },
  { name: 'volume-mute', category: 'Mídia, Áudio & Criação', tags: ['mudo', 'silenciar', 'sem som'], path: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>` },
  { name: 'mic', category: 'Mídia, Áudio & Criação', tags: ['microfone', 'voz', 'gravar', 'whisper'], path: `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>` },
  { name: 'mic-off', category: 'Mídia, Áudio & Criação', tags: ['microfone mudo', 'desativado'], path: `<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>` },
  { name: 'image', category: 'Mídia, Áudio & Criação', tags: ['imagem', 'foto', 'galeria', 'png'], path: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>` },
  { name: 'video', category: 'Mídia, Áudio & Criação', tags: ['vídeo', 'filme', 'stream', 'mp4'], path: `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>` },
  { name: 'camera', category: 'Mídia, Áudio & Criação', tags: ['captura', 'screenshot', 'foto'], path: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>` },
  { name: 'headphones', category: 'Mídia, Áudio & Criação', tags: ['fones', 'podcast', 'áudio', 'listen'], path: `<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>` },
  { name: 'waveform', category: 'Mídia, Áudio & Criação', tags: ['ondas', 'espectro', 'equalizador', 'voz'], path: `<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>` },
  { name: 'palette', category: 'Mídia, Áudio & Criação', tags: ['cores', 'tema', 'design', 'tokens'], path: `<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>` },
  { name: 'droplet', category: 'Mídia, Áudio & Criação', tags: ['gota', 'cor', 'opacidade', 'blur'], path: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>` },

  // ==========================================================================
  // 10. COMUNICAÇÃO, STATUS & CLIMA (19)
  // ==========================================================================
  { name: 'send', category: 'Comunicação, Status & Clima', tags: ['enviar', 'disparar', 'submit', 'request'], path: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>` },
  { name: 'mail', category: 'Comunicação, Status & Clima', tags: ['email', 'carta', 'envelope', 'contato'], path: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>` },
  { name: 'message', category: 'Comunicação, Status & Clima', tags: ['mensagem', 'balão', 'comentário'], path: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` },
  { name: 'chat', category: 'Comunicação, Status & Clima', tags: ['conversa', 'suporte', 'diálogo', 'thread'], path: `<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>` },
  { name: 'bell', category: 'Comunicação, Status & Clima', tags: ['notificação', 'sino', 'alerta', 'push'], path: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>` },
  { name: 'alert', category: 'Comunicação, Status & Clima', tags: ['aviso', 'atenção', 'exclamação', 'error'], path: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>` },
  { name: 'alert-triangle', category: 'Comunicação, Status & Clima', tags: ['perigo', 'cuidado', 'warning'], path: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>` },
  { name: 'info', category: 'Comunicação, Status & Clima', tags: ['informação', 'detalhe', 'sobre'], path: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>` },
  { name: 'help-circle', category: 'Comunicação, Status & Clima', tags: ['ajuda', 'dúvida', 'faq', 'suporte'], path: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>` },
  { name: 'check-circle', category: 'Comunicação, Status & Clima', tags: ['concluído', 'aprovado', 'sucesso', 'validado'], path: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>` },
  { name: 'x-circle', category: 'Comunicação, Status & Clima', tags: ['erro', 'falha', 'rejeitado', 'fechar'], path: `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>` },
  { name: 'circle', category: 'Comunicação, Status & Clima', tags: ['ponto', 'vazio', 'pendente', 'status'], path: `<circle cx="12" cy="12" r="9"/>` },
  { name: 'star', category: 'Comunicação, Status & Clima', tags: ['estrela', 'destaque', 'favorito', 'rating'], path: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>` },
  { name: 'heart', category: 'Comunicação, Status & Clima', tags: ['curtir', 'saúde', 'favorito'], path: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>` },
  { name: 'sun', category: 'Comunicação, Status & Clima', tags: ['claro', 'dia', 'light mode', 'alabaster'], path: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>` },
  { name: 'moon', category: 'Comunicação, Status & Clima', tags: ['escuro', 'noite', 'dark mode', 'obsidian'], path: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>` },
  { name: 'globe', category: 'Comunicação, Status & Clima', tags: ['mundo', 'web', 'internacional', 'i18n', 'rede'], path: `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>` },
  { name: 'flag', category: 'Comunicação, Status & Clima', tags: ['bandeira', 'marco', 'milestone', 'feature flag'], path: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>` },
  { name: 'settings', category: 'Comunicação, Status & Clima', tags: ['configurações', 'engrenagem', 'opções', 'preferências'], path: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>` },
];

const ICON_PATH_MAP: Record<string, string> = Object.fromEntries(
  MATZ_ICON_CATALOG.map((item) => [item.name, item.path])
);

export function matzIcon(
  name: MatzIconName,
  size = 15,
  className = '',
  options?: MatzIconOptions
): string {
  const actualSize = options?.size ?? size;
  const strokeWidth = options?.strokeWidth ?? 1.75;
  const variant = options?.variant ?? 'outline';
  const cls = [className, options?.className].filter(Boolean).join(' ');
  const styleAttr = options?.color ? ` style="color:${options.color};"` : '';
  const ariaAttr = options?.ariaLabel
    ? `role="img" aria-label="${options.ariaLabel}"`
    : `aria-hidden="true"`;

  const path = ICON_PATH_MAP[name] || ICON_PATH_MAP.sparkles;

  const fillAttr =
    variant === 'duotone'
      ? `fill="currentColor" fill-opacity="0.18"`
      : variant === 'filled'
      ? `fill="currentColor" fill-opacity="0.34"`
      : `fill="none"`;

  return `<svg class="matz-icon ${cls}" width="${actualSize}" height="${actualSize}" viewBox="0 0 24 24" ${fillAttr} stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${styleAttr} ${ariaAttr}>${path}</svg>`;
}

/**
 * Factory Tree-Shakeable para criar e renderizar 1 único ícone isolado (~160 bytes)
 * sem carregar o catálogo completo de 185 ícones no bundle final.
 */
export function defineMatzSingleIcon(svgPath: string) {
  return (size = 16, options?: MatzIconOptions): string => {
    const actualSize = options?.size ?? size;
    const strokeWidth = options?.strokeWidth ?? 1.75;
    const variant = options?.variant ?? 'outline';
    const cls = options?.className ? ` ${options.className}` : '';
    const styleAttr = options?.color ? ` style="color:${options.color};"` : '';
    const ariaAttr = options?.ariaLabel
      ? `role="img" aria-label="${options.ariaLabel}"`
      : `aria-hidden="true"`;
    const fillAttr =
      variant === 'duotone'
        ? `fill="currentColor" fill-opacity="0.18"`
        : variant === 'filled'
        ? `fill="currentColor" fill-opacity="0.34"`
        : `fill="none"`;

    return `<svg class="matz-icon${cls}" width="${actualSize}" height="${actualSize}" viewBox="0 0 24 24" ${fillAttr} stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${styleAttr} ${ariaAttr}>${svgPath}</svg>`;
  };
}

export function getIconPascalName(name: MatzIconName): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function getSingleIconSnippet(
  name: MatzIconName,
  mode: 'single-subpath' | 'single-standalone' | 'catalog',
  size = 20,
  strokeWidth: 1.25 | 1.5 | 1.75 | 2 | 2.25 = 1.75,
  variant: MatzIconVariant = 'outline'
): string {
  const pascal = getIconPascalName(name);
  const path = ICON_PATH_MAP[name] || ICON_PATH_MAP.sparkles;

  if (mode === 'single-subpath') {
    return `// Importação Modular de 1 Único Ícone (Tree-Shaking 100% · ~180 bytes Gzip)
// Nenhum outro ícone da biblioteca é incluído no seu bundle final:
import { icon${pascal} } from '@matz/ui/icons/${name}';

const iconEl = document.getElementById('icon-target')!;
iconEl.innerHTML = icon${pascal}(${size}, {
  strokeWidth: ${strokeWidth},
  variant: '${variant}',
  ariaLabel: '${name}',
});`;
  }

  if (mode === 'single-standalone') {
    const fillAttr =
      variant === 'duotone'
        ? `fill="currentColor" fill-opacity="0.18"`
        : variant === 'filled'
        ? `fill="currentColor" fill-opacity="0.34"`
        : `fill="none"`;
    return `// Função Standalone Zero-Dependência (Apenas o ícone "${name}")
// Cole diretamente no seu projeto caso queira adicionar somente este ícone:
export function icon${pascal}(size = ${size}, strokeWidth = ${strokeWidth}): string {
  return \`<svg class="matz-icon" width="\${size}" height="\${size}" viewBox="0 0 24 24" ${fillAttr} stroke="currentColor" stroke-width="\${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>\`;
}`;
  }

  return `import { matzIcon } from '@matz/ui';

const html = matzIcon('${name}', ${size}, '', {
  strokeWidth: ${strokeWidth},
  variant: '${variant}',
});`;
}
