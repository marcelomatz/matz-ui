import { matzIcon } from "../icons/Icons";

export interface ApiExecutionResult {
  status_code: number;
  status_text: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size_bytes: number;
  error?: string;
}

export interface ApiClientBridge {
  executeRequest(
    method: string,
    url: string,
    headersJson: string,
    body: string,
    authJson: string
  ): Promise<ApiExecutionResult>;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "#10b981",
  POST: "#38bdf8",
  PUT: "#f59e0b",
  PATCH: "#a855f7",
  DELETE: "#f43f5e",
  HEAD: "#94a3b8",
  OPTIONS: "#64748b",
};

export class MatzApiClientModule {
  private container: HTMLElement;
  private bridge: ApiClientBridge;
  private method = "GET";
  private url = "https://jsonplaceholder.typicode.com/posts/1";
  private headers = '[\n  { "key": "Accept", "value": "application/json", "enabled": true }\n]';
  private body = '{\n  "suite": "Matz UI v3.5",\n  "mode": "mTLS"\n}';
  private auth = '{"type":"none"}';
  private lastResult: ApiExecutionResult | null = null;
  private loading = false;
  private methodMenuOpen = false;

  constructor(container: HTMLElement, bridge: ApiClientBridge) {
    this.container = container;
    this.bridge = bridge;
  }

  mount(): void {
    this.render();
  }

  render(): void {
    const methodColor = METHOD_COLORS[this.method] || "var(--accent)";

    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;width:100%;background:var(--surface-card-solid);overflow:hidden;">
        <!-- Top Request Bar -->
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--surface-subtle);">
          <span class="matz-badge" style="flex-shrink:0;">${matzIcon("api", 12)} Heapi Engine</span>

          <!-- Matz Select Combobox for HTTP Method -->
          <div class="matz-combobox" style="min-width:112px;">
            <button type="button" class="matz-combobox-trigger" id="matz-api-method-trigger">
              <span style="font-family:var(--font-mono);font-weight:700;color:${methodColor};">${this.method}</span>
              ${matzIcon("chevron-down", 13)}
            </button>
            <div class="matz-combobox-menu ${this.methodMenuOpen ? "open" : ""}" id="matz-api-method-menu">
              ${["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
                .map(
                  (m) => `
                <div class="matz-combobox-option ${this.method === m ? "selected" : ""}" data-http-method="${m}">
                  <span style="font-family:var(--font-mono);font-weight:700;color:${METHOD_COLORS[m]};">${m}</span>
                  ${this.method === m ? matzIcon("check", 13) : ""}
                </div>`
                )
                .join("")}
            </div>
          </div>

          <input class="matz-input" id="matz-api-url" value="${this.url.replace(/"/g, "&quot;")}" placeholder="https://api.example.com/v1/..." style="flex:1;font-family:var(--font-mono);font-size:12.5px;" />

          <button class="matz-btn matz-btn-primary" id="matz-api-send" style="flex-shrink:0;">
            ${matzIcon("send", 13)}
            <span>${this.loading ? "Enviando..." : "Enviar Requisição"}</span>
          </button>
        </div>

        <!-- Split Request / Response Workspace -->
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;min-height:0;overflow:hidden;">
          <div style="border-right:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <label style="font-weight:600;font-size:12px;color:var(--text-secondary);">Headers (JSON)</label>
              <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">application/json</span>
            </div>
            <textarea class="matz-textarea" id="matz-api-headers" style="height:92px;font-family:var(--font-mono);font-size:12px;">${this.headers}</textarea>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
              <label style="font-weight:600;font-size:12px;color:var(--text-secondary);">Request Body</label>
              <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">RAW Payload</span>
            </div>
            <textarea class="matz-textarea" id="matz-api-body" style="flex:1;min-height:96px;font-family:var(--font-mono);font-size:12px;" placeholder='{"key": "value"}'>${this.body}</textarea>
          </div>

          <div style="padding:16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;background:var(--surface-canvas);">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:600;font-size:12px;color:var(--text-secondary);">Resposta HTTP</span>
              ${
                this.lastResult
                  ? `<div class="matz-tabular" style="display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11.5px;">
                      <span class="matz-badge ${this.lastResult.status_code < 400 ? "matz-badge-emerald" : "matz-badge-rose"}">
                        ${this.lastResult.status_code} ${this.lastResult.status_text}
                      </span>
                      <span style="color:var(--text-muted);">${this.lastResult.duration} ms</span>
                      <span style="color:var(--text-muted);">${this.lastResult.size_bytes} B</span>
                    </div>`
                  : `<span class="matz-badge" style="font-size:10px;">READY</span>`
              }
            </div>
            <pre style="flex:1;margin:0;background:var(--surface-input);border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:14px;overflow:auto;font-family:var(--font-mono);font-size:12px;line-height:1.6;color:var(--text-primary);">${
              this.lastResult
                ? this.lastResult.error
                  ? `Erro: ${this.lastResult.error}`
                  : this.formatBody(this.lastResult.body)
                : "// Clique em 'Enviar Requisição' para executar via matz-core/httpengine"
            }</pre>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector("#matz-api-method-trigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.syncInputs();
      this.methodMenuOpen = !this.methodMenuOpen;
      this.render();
    });

    this.container.querySelectorAll<HTMLElement>("[data-http-method]").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        this.syncInputs();
        this.method = opt.dataset.httpMethod || "GET";
        this.methodMenuOpen = false;
        this.render();
      });
    });

    this.container.querySelector("#matz-api-send")?.addEventListener("click", async () => {
      this.syncInputs();
      this.methodMenuOpen = false;
      this.loading = true;
      this.render();
      try {
        this.lastResult = await this.bridge.executeRequest(
          this.method,
          this.url,
          this.headers,
          this.body,
          this.auth
        );
      } finally {
        this.loading = false;
        this.render();
      }
    });
  }

  private syncInputs(): void {
    const uEl = this.container.querySelector<HTMLInputElement>("#matz-api-url");
    const hEl = this.container.querySelector<HTMLTextAreaElement>("#matz-api-headers");
    const bEl = this.container.querySelector<HTMLTextAreaElement>("#matz-api-body");
    if (uEl) this.url = uEl.value;
    if (hEl) this.headers = hEl.value;
    if (bEl) this.body = bEl.value;
  }

  private formatBody(raw: string): string {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    } catch {
      return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }
}
