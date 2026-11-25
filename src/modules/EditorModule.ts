import { matzIcon } from "../icons/Icons";

export interface MatzNoteSummary {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  is_vault: boolean;
  updated_at: string;
}

export interface MatzNoteDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_vault: boolean;
  encrypted?: boolean;
}

export interface NotesBridge {
  listDocuments(filter: string): Promise<MatzNoteSummary[]>;
  readDocument(id: string): Promise<MatzNoteDocument | null>;
  saveDocument(doc: MatzNoteDocument): Promise<string>;
  deleteDocument(id: string): Promise<void>;
  search?(query: string): Promise<MatzNoteSummary[]>;
}

export class MatzEditorModule {
  private container: HTMLElement;
  private bridge: NotesBridge;
  private docs: MatzNoteSummary[] = [];
  private activeDoc: MatzNoteDocument | null = null;
  private filter = "all";
  private previewMode = false;

  constructor(container: HTMLElement, bridge: NotesBridge) {
    this.container = container;
    this.bridge = bridge;
  }

  async mount(): Promise<void> {
    this.docs = await this.bridge.listDocuments(this.filter);
    if (this.docs.length > 0 && !this.activeDoc) {
      this.activeDoc = await this.bridge.readDocument(this.docs[0].id);
    }
    this.render();
  }

  private countWords(text: string): { words: number; chars: number; readMin: number } {
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const chars = text.length;
    const readMin = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMin };
  }

  private renderMarkdownPreview(md: string): string {
    return md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
  }

  render(): void {
    const stats = this.countWords(this.activeDoc?.content || "");

    this.container.innerHTML = `
      <div class="matz-editor-module">
        <aside class="matz-editor-sidebar">
          <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);">
                Documentos & Vault
              </span>
              <button class="matz-btn matz-btn-primary" id="matz-note-new-btn" style="padding:4px 9px;font-size:11px;">+ Novo</button>
            </div>
            <input class="matz-input" id="matz-note-search" placeholder="Buscar notas (FTS5)..." style="width:100%;" />
          </div>
          <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px;" id="matz-note-list">
            ${
              this.docs.length === 0
                ? `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Nenhum documento ainda.</div>`
                : this.docs
                    .map(
                      (d) => `
                  <div class="matz-switcher-item ${this.activeDoc?.id === d.id ? "active" : ""}" data-doc-id="${d.id}" style="flex-direction:column;align-items:flex-start;gap:4px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                      <span style="font-weight:600;font-size:12.5px;display:inline-flex;align-items:center;gap:4px;">${d.is_vault ? matzIcon("lock", 11) : ""}${d.title || "Sem título"}</span>
                    </div>
                    <span style="font-size:11px;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">
                      ${d.snippet || "Documento vazio"}
                    </span>
                  </div>
                `
                    )
                    .join("")
            }
          </div>
        </aside>

        <main class="matz-editor-main">
          ${
            this.activeDoc
              ? `
            <div style="padding:10px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-secondary);">
              <input class="matz-input" id="matz-note-title" value="${this.activeDoc.title.replace(/"/g, "&quot;")}" placeholder="Título do documento..." style="font-size:15px;font-weight:700;border-color:transparent;background:transparent;flex:1;" />
              <div style="display:flex;align-items:center;gap:8px;">
                <label style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-secondary);cursor:pointer;">
                  <input type="checkbox" id="matz-note-vault" ${this.activeDoc.is_vault ? "checked" : ""} />
                  ${matzIcon("lock", 11)} Vault E2EE
                </label>
                <button class="matz-btn" id="matz-note-preview-btn">${this.previewMode ? "Editar" : "Preview MD"}</button>
                <button class="matz-btn matz-btn-primary" id="matz-note-save-btn">Salvar (Ctrl+S)</button>
                <button class="matz-btn" id="matz-note-del-btn" style="color:var(--status-err);">Excluir</button>
              </div>
            </div>
            ${
              this.previewMode
                ? `<div class="matz-editor-surface" style="overflow-y:auto;">${this.renderMarkdownPreview(this.activeDoc.content)}</div>`
                : `<textarea class="matz-editor-surface" id="matz-note-content" placeholder="Comece a escrever em Markdown...">${this.activeDoc.content}</textarea>`
            }
            <footer style="height:28px;border-top:1px solid var(--border);background:var(--bg-secondary);padding:0 20px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);">
              <span>${stats.words} palavras · ${stats.chars} caracteres · ~${stats.readMin} min de leitura</span>
              <span style="display:inline-flex;align-items:center;gap:4px;">${this.activeDoc.is_vault ? `${matzIcon("lock", 11)} Criptografia Argon2id + AES-256-GCM ativa` : "Markdown Local-First"}</span>
            </footer>
          `
              : `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);gap:12px;">
              <p>Selecione ou crie um documento para começar a escrever.</p>
              <button class="matz-btn matz-btn-primary" id="matz-note-empty-new">+ Criar Primeiro Documento</button>
            </div>
          `
          }
        </main>
      </div>
    `;

    const createNew = async () => {
      const newDoc: MatzNoteDocument = {
        id: "",
        title: "Nova Nota",
        content: "# Nova Nota\n\nEscreva suas ideias aqui...",
        tags: [],
        is_vault: false,
      };
      const id = await this.bridge.saveDocument(newDoc);
      this.docs = await this.bridge.listDocuments(this.filter);
      this.activeDoc = await this.bridge.readDocument(id);
      this.render();
    };

    this.container.querySelector("#matz-note-new-btn")?.addEventListener("click", () => void createNew());
    this.container.querySelector("#matz-note-empty-new")?.addEventListener("click", () => void createNew());

    this.container.querySelectorAll<HTMLDivElement>("[data-doc-id]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.dataset.docId;
        if (id) {
          this.activeDoc = await this.bridge.readDocument(id);
          this.render();
        }
      });
    });

    this.container.querySelector("#matz-note-preview-btn")?.addEventListener("click", () => {
      const textarea = this.container.querySelector<HTMLTextAreaElement>("#matz-note-content");
      if (textarea && this.activeDoc) {
        this.activeDoc.content = textarea.value;
      }
      this.previewMode = !this.previewMode;
      this.render();
    });

    this.container.querySelector("#matz-note-save-btn")?.addEventListener("click", async () => {
      if (!this.activeDoc) return;
      const titleEl = this.container.querySelector<HTMLInputElement>("#matz-note-title");
      const contentEl = this.container.querySelector<HTMLTextAreaElement>("#matz-note-content");
      const vaultEl = this.container.querySelector<HTMLInputElement>("#matz-note-vault");
      if (titleEl) this.activeDoc.title = titleEl.value;
      if (contentEl) this.activeDoc.content = contentEl.value;
      if (vaultEl) this.activeDoc.is_vault = vaultEl.checked;

      await this.bridge.saveDocument(this.activeDoc);
      this.docs = await this.bridge.listDocuments(this.filter);
      this.render();
    });

    this.container.querySelector("#matz-note-del-btn")?.addEventListener("click", async () => {
      if (!this.activeDoc) return;
      await this.bridge.deleteDocument(this.activeDoc.id);
      this.activeDoc = null;
      this.docs = await this.bridge.listDocuments(this.filter);
      if (this.docs.length > 0) {
        this.activeDoc = await this.bridge.readDocument(this.docs[0].id);
      }
      this.render();
    });

    const searchInput = this.container.querySelector<HTMLInputElement>("#matz-note-search");
    searchInput?.addEventListener("input", async () => {
      const q = searchInput.value.trim();
      if (q && this.bridge.search) {
        this.docs = await this.bridge.search(q);
      } else {
        this.docs = await this.bridge.listDocuments(this.filter);
      }
      this.render();
    });
  }
}
