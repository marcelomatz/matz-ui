import { matzIcon } from "../icons/Icons";
import { showMatzToast } from "../primitives/TitleBar";
import { matzPick } from "../i18n/index";

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

export interface HeapiKeyValueRow {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HeapiAuthConfig {
  type: "none" | "bearer" | "basic" | "apikey";
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  in?: "header" | "query";
}

export interface HeapiSavedRequest {
  id: string;
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: HeapiKeyValueRow[];
  params: HeapiKeyValueRow[];
  body: string;
  auth: HeapiAuthConfig;
  lastResult?: ApiExecutionResult | null;
}

export interface HeapiCollection {
  id: string;
  name: string;
  collapsed?: boolean;
  requests: HeapiSavedRequest[];
}

export interface HeapiEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface HeapiHistoryItem {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  timestamp: string;
  requestSnapshot: HeapiSavedRequest;
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

const ALL_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const COLS_STORAGE_KEY = "matz-heapi-collections-v2";
const ENVS_STORAGE_KEY = "matz-heapi-environments-v2";
const HIST_STORAGE_KEY = "matz-heapi-history-v2";

function escHtml(raw: string): string {
  return (raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function tryFormatJson(raw: string): string {
  if (!raw || !raw.trim()) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function highlightJsonHtml(input: string): string {
  const formatted = tryFormatJson(input);
  const escaped = escHtml(formatted);
  const tokenRegex =
    /(&quot;(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&])*&quot;(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

  return escaped.replace(tokenRegex, (match) => {
    if (match.startsWith("&quot;")) {
      if (match.endsWith(":")) {
        return `<span class="matz-tok-keyword">${match.slice(0, -1)}</span>:`;
      }
      return `<span class="matz-tok-string">${match}</span>`;
    }
    if (match === "true" || match === "false" || match === "null") {
      return `<span class="matz-tok-type">${match}</span>`;
    }
    return `<span class="matz-tok-number">${match}</span>`;
  });
}

function buildInteractiveJsonTree(data: unknown): HTMLElement {
  const root = document.createElement("div");
  root.style.fontFamily = "var(--font-mono)";
  root.style.fontSize = "11.5px";
  root.style.lineHeight = "1.6";

  let parsed: unknown = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      const pre = document.createElement("pre");
      pre.style.margin = "0";
      pre.textContent = data;
      root.appendChild(pre);
      return root;
    }
  }

  const createNode = (label: string | null, val: unknown, isLast: boolean, depth: number): HTMLElement => {
    const isObj = val !== null && typeof val === "object";
    const isArr = Array.isArray(val);
    if (!isObj) {
      const line = document.createElement("div");
      line.style.paddingLeft = `${depth * 14}px`;
      let h = label !== null ? `<span class="matz-tok-keyword">"${escHtml(label)}"</span>: ` : "";
      if (val === null) h += `<span class="matz-tok-type">null</span>`;
      else if (typeof val === "boolean") h += `<span class="matz-tok-type">${String(val)}</span>`;
      else if (typeof val === "number") h += `<span class="matz-tok-number">${val}</span>`;
      else h += `<span class="matz-tok-string">"${escHtml(String(val))}"</span>`;
      if (!isLast) h += ",";
      line.innerHTML = h;
      return line;
    }

    const entries = isArr
      ? (val as unknown[]).map((v) => [null, v] as const)
      : Object.entries(val as Record<string, unknown>);
    const openB = isArr ? "[" : "{";
    const closeB = isArr ? "]" : "}";
    let expanded = depth < 2;

    const wrap = document.createElement("div");
    const head = document.createElement("div");
    head.style.paddingLeft = `${depth * 14}px`;
    head.style.cursor = entries.length > 0 ? "pointer" : "default";
    head.style.userSelect = "none";

    const childrenBox = document.createElement("div");
    const foot = document.createElement("div");
    foot.style.paddingLeft = `${depth * 14}px`;
    foot.textContent = `${closeB}${!isLast ? "," : ""}`;

    const syncNode = () => {
      const caret = entries.length > 0 ? (expanded ? "▾ " : "▸ ") : "";
      const lbl = label !== null ? `<span class="matz-tok-keyword">"${escHtml(label)}"</span>: ` : "";
      if (!expanded && entries.length > 0) {
        head.innerHTML = `<span style="color:var(--text-muted);">${caret}</span>${lbl}${openB} <span style="color:var(--text-muted);font-size:10px;">${entries.length} ${
          isArr ? "items" : "keys"
        }</span> ${closeB}${!isLast ? "," : ""}`;
        childrenBox.style.display = "none";
        foot.style.display = "none";
      } else if (entries.length === 0) {
        head.innerHTML = `${lbl}${openB}${closeB}${!isLast ? "," : ""}`;
        childrenBox.style.display = "none";
        foot.style.display = "none";
      } else {
        head.innerHTML = `<span style="color:var(--text-muted);">${caret}</span>${lbl}${openB}`;
        childrenBox.style.display = "block";
        foot.style.display = "block";
      }
    };

    entries.forEach(([k, v], i) => {
      childrenBox.appendChild(createNode(k, v, i === entries.length - 1, depth + 1));
    });
    if (entries.length > 0) {
      head.addEventListener("click", () => {
        expanded = !expanded;
        syncNode();
      });
    }
    syncNode();
    wrap.appendChild(head);
    wrap.appendChild(childrenBox);
    wrap.appendChild(foot);
    return wrap;
  };

  root.appendChild(createNode(null, parsed, true, 0));
  return root;
}

function defaultCollections(): HeapiCollection[] {
  return [
    {
      id: "col-local-ai",
      name: "Local AI & Ollama",
      collapsed: false,
      requests: [
        {
          id: "req-ollama-tags",
          collectionId: "col-local-ai",
          name: "Listar Modelos Ollama",
          method: "GET",
          url: "{{OLLAMA_HOST}}/api/tags",
          headers: [{ key: "Accept", value: "application/json", enabled: true }],
          params: [],
          body: "",
          auth: { type: "none" },
        },
        {
          id: "req-ollama-gen",
          collectionId: "col-local-ai",
          name: "Gerar Prompt Local",
          method: "POST",
          url: "{{OLLAMA_HOST}}/api/generate",
          headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
          params: [],
          body: '{\n  "model": "qwen2.5-coder:7b",\n  "prompt": "Explique Clean Architecture em 2 linhas",\n  "stream": false\n}',
          auth: { type: "none" },
        },
      ],
    },
    {
      id: "col-rest-sandbox",
      name: "REST & Cloud Endpoints",
      collapsed: false,
      requests: [
        {
          id: "req-json-post-1",
          collectionId: "col-rest-sandbox",
          name: "GET Post #1",
          method: "GET",
          url: "{{JSON_API}}/posts/1",
          headers: [{ key: "Accept", value: "application/json", enabled: true }],
          params: [],
          body: "",
          auth: { type: "none" },
        },
        {
          id: "req-json-create",
          collectionId: "col-rest-sandbox",
          name: "POST Criar Recurso",
          method: "POST",
          url: "{{JSON_API}}/posts",
          headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
          params: [],
          body: '{\n  "title": "Heapi Native HTTP Engine",\n  "body": "Matz Suite Wails v3",\n  "userId": 1\n}',
          auth: { type: "bearer", token: "{{API_TOKEN}}" },
        },
      ],
    },
  ];
}

function defaultEnvironments(): HeapiEnvironment[] {
  return [
    {
      id: "env-local",
      name: "Local Dev",
      variables: {
        OLLAMA_HOST: "http://127.0.0.1:11434",
        JSON_API: "https://jsonplaceholder.typicode.com",
        API_TOKEN: "dev-secret-token-2026",
      },
    },
    {
      id: "env-prod",
      name: "Production",
      variables: {
        OLLAMA_HOST: "http://127.0.0.1:11434",
        JSON_API: "https://jsonplaceholder.typicode.com",
        API_TOKEN: "prod-live-token",
      },
    },
  ];
}

export function parseCurlCommandToRequest(rawCurl: string, colId = "col-rest-sandbox"): HeapiSavedRequest {
  const cleaned = rawCurl.replace(/\\\r?\n/g, " ").trim();
  let method = "GET";
  let url = "https://api.example.com";
  const headers: HeapiKeyValueRow[] = [];
  let body = "";

  const methodMatch = cleaned.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch) method = methodMatch[1].toUpperCase();

  const urlMatch = cleaned.match(/(?:curl\s+(?:-[A-Za-z]+\s+\S+\s+)*|--url\s+)['"]?(https?:\/\/[^\s'"]+)['"]?/i) ||
    cleaned.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/i);
  if (urlMatch) url = urlMatch[1];

  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headerRegex.exec(cleaned)) !== null) {
    const idx = hMatch[1].indexOf(":");
    if (idx > 0) {
      headers.push({
        key: hMatch[1].slice(0, idx).trim(),
        value: hMatch[1].slice(idx + 1).trim(),
        enabled: true,
      });
    }
  }

  const dataMatch = cleaned.match(/(?:-d|--data|--data-raw|--data-binary)\s+(['"])([\s\S]*?)\1/i);
  if (dataMatch) {
    body = dataMatch[2];
    if (!methodMatch) method = "POST";
  }

  return {
    id: `req-${Date.now()}`,
    collectionId: colId,
    name: `${method} ${url.replace(/^https?:\/\//, "").slice(0, 28)}`,
    method,
    url,
    headers: headers.length > 0 ? headers : [{ key: "Accept", value: "application/json", enabled: true }],
    params: [],
    body,
    auth: { type: "none" },
  };
}

export class MatzApiClientModule {
  private container: HTMLElement;
  private bridge: ApiClientBridge;

  private collections: HeapiCollection[] = [];
  private environments: HeapiEnvironment[] = [];
  private history: HeapiHistoryItem[] = [];
  private activeEnvId = "env-local";

  private openTabs: HeapiSavedRequest[] = [];
  private activeTabId = "";

  private leftSidebarWidth = 240;
  private leftSidebarMode: "collections" | "history" | "environments" = "collections";
  private searchFilter = "";

  private configSubTab: "params" | "headers" | "auth" | "body" = "headers";
  private responseSubTab: "pretty" | "tree" | "raw" | "headers" = "pretty";
  private rightDrawerOpen = false;
  private rightDrawerTab: "snippets" | "curl-import" = "snippets";
  private curlImportText = "";

  private loading = false;
  private methodMenuOpen = false;
  private splitVertical = false;
  private requestSplitPct = 48;

  constructor(container: HTMLElement, bridge: ApiClientBridge) {
    this.container = container;
    this.bridge = bridge;
    this.loadPersistedState();
  }

  private loadPersistedState(): void {
    try {
      const rawCols = typeof localStorage !== "undefined" ? localStorage.getItem(COLS_STORAGE_KEY) : null;
      this.collections = rawCols ? JSON.parse(rawCols) : defaultCollections();
    } catch {
      this.collections = defaultCollections();
    }
    try {
      const rawEnvs = typeof localStorage !== "undefined" ? localStorage.getItem(ENVS_STORAGE_KEY) : null;
      this.environments = rawEnvs ? JSON.parse(rawEnvs) : defaultEnvironments();
    } catch {
      this.environments = defaultEnvironments();
    }
    try {
      const rawHist = typeof localStorage !== "undefined" ? localStorage.getItem(HIST_STORAGE_KEY) : null;
      this.history = rawHist ? JSON.parse(rawHist) : [];
    } catch {
      this.history = [];
    }

    const firstReq = this.collections[0]?.requests?.[0];
    if (firstReq) {
      this.openTabs = [structuredClone(firstReq)];
      this.activeTabId = firstReq.id;
    }
  }

  private savePersistedState(): void {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(this.collections));
      localStorage.setItem(ENVS_STORAGE_KEY, JSON.stringify(this.environments));
      localStorage.setItem(HIST_STORAGE_KEY, JSON.stringify(this.history.slice(0, 40)));
    } catch {
      // ignore
    }
  }

  private getActiveTab(): HeapiSavedRequest | undefined {
    return this.openTabs.find((t) => t.id === this.activeTabId) || this.openTabs[0];
  }

  private interpolateVars(input: string): string {
    if (!input) return "";
    const env = this.environments.find((e) => e.id === this.activeEnvId);
    if (!env) return input;
    return input.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
      return env.variables[key] !== undefined ? env.variables[key] : `{{${key}}}`;
    });
  }

  private buildResolvedRequest(req: HeapiSavedRequest): {
    method: string;
    url: string;
    headersJson: string;
    body: string;
    authJson: string;
    headersMap: Record<string, string>;
  } {
    let url = this.interpolateVars(req.url || "");
    const enabledParams = (req.params || []).filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length > 0) {
      const base = url.split("?")[0];
      const qs = new URLSearchParams();
      enabledParams.forEach((p) => qs.append(this.interpolateVars(p.key.trim()), this.interpolateVars(p.value)));
      url = `${base}?${qs.toString()}`;
    }

    const headersList = (req.headers || [])
      .filter((h) => h.enabled && h.key.trim())
      .map((h) => ({
        key: this.interpolateVars(h.key.trim()),
        value: this.interpolateVars(h.value),
        enabled: true,
      }));

    const auth: HeapiAuthConfig = {
      type: req.auth?.type || "none",
      token: this.interpolateVars(req.auth?.token || ""),
      username: this.interpolateVars(req.auth?.username || ""),
      password: this.interpolateVars(req.auth?.password || ""),
      key: this.interpolateVars(req.auth?.key || ""),
      value: this.interpolateVars(req.auth?.value || ""),
      in: req.auth?.in || "header",
    };

    if (auth.type === "bearer" && auth.token) {
      headersList.push({ key: "Authorization", value: `Bearer ${auth.token}`, enabled: true });
    } else if (auth.type === "basic" && auth.username) {
      const b64 = typeof btoa === "function" ? btoa(`${auth.username}:${auth.password || ""}`) : "";
      headersList.push({ key: "Authorization", value: `Basic ${b64}`, enabled: true });
    } else if (auth.type === "apikey" && auth.key) {
      if (auth.in === "query") {
        const sep = url.includes("?") ? "&" : "?";
        url += `${sep}${encodeURIComponent(auth.key)}=${encodeURIComponent(auth.value || "")}`;
      } else {
        headersList.push({ key: auth.key, value: auth.value || "", enabled: true });
      }
    }

    const headersMap: Record<string, string> = {};
    headersList.forEach((h) => {
      headersMap[h.key] = h.value;
    });

    return {
      method: (req.method || "GET").toUpperCase(),
      url,
      headersJson: JSON.stringify(headersList),
      body: this.interpolateVars(req.body || ""),
      authJson: JSON.stringify(auth),
      headersMap,
    };
  }

  private generateSnippets(req: HeapiSavedRequest): { curl: string; fetch: string; go: string; python: string } {
    const resolved = this.buildResolvedRequest(req);
    const entries = Object.entries(resolved.headersMap);

    // 1. cURL
    let curl = `curl -X ${resolved.method} "${resolved.url}"`;
    entries.forEach(([k, v]) => {
      curl += ` \\\n  -H "${k}: ${v}"`;
    });
    if (resolved.body && resolved.method !== "GET" && resolved.method !== "HEAD") {
      curl += ` \\\n  -d '${resolved.body.replace(/'/g, "\\'")}'`;
    }

    // 2. Fetch (TS/JS)
    const fetchOpts: Record<string, unknown> = { method: resolved.method };
    if (entries.length > 0) fetchOpts.headers = resolved.headersMap;
    if (resolved.body && resolved.method !== "GET" && resolved.method !== "HEAD") {
      fetchOpts.body = resolved.body;
    }
    const fetchCode = `const response = await fetch("${resolved.url}", ${JSON.stringify(fetchOpts, null, 2)});\nconst data = await response.json();\nconsole.log(data);`;

    // 3. Go (net/http)
    const hasBody = Boolean(resolved.body && resolved.method !== "GET" && resolved.method !== "HEAD");
    let go = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"${hasBody ? '\n\t"strings"' : ""}\n)\n\nfunc main() {\n`;
    if (hasBody) {
      go += `\tpayload := strings.NewReader(${JSON.stringify(resolved.body)})\n`;
      go += `\treq, _ := http.NewRequest("${resolved.method}", "${resolved.url}", payload)\n`;
    } else {
      go += `\treq, _ := http.NewRequest("${resolved.method}", "${resolved.url}", nil)\n`;
    }
    entries.forEach(([k, v]) => {
      go += `\treq.Header.Set("${k}", "${v}")\n`;
    });
    go += `\tresp, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;

    // 4. Python (requests)
    let py = `import requests\n\nurl = "${resolved.url}"\nheaders = ${JSON.stringify(resolved.headersMap, null, 2)}\n`;
    if (hasBody) {
      py += `payload = ${JSON.stringify(resolved.body)}\nresponse = requests.request("${resolved.method}", url, headers=headers, data=payload)\n`;
    } else {
      py += `response = requests.request("${resolved.method}", url, headers=headers)\n`;
    }
    py += `print(response.status_code, response.text)`;

    return { curl, fetch: fetchCode, go, python: py };
  }

  mount(): void {
    this.render();
  }

  render(): void {
    const activeTab = this.getActiveTab();
    if (activeTab && this.activeTabId !== activeTab.id) {
      this.activeTabId = activeTab.id;
    }
    const method = (activeTab?.method || "GET").toUpperCase();
    const methodColor = METHOD_COLORS[method] || "var(--accent)";
    const activeEnv = this.environments.find((e) => e.id === this.activeEnvId);
    const snippets = activeTab ? this.generateSnippets(activeTab) : { curl: "", fetch: "", go: "", python: "" };

    const enabledHeadersCount = (activeTab?.headers || []).filter((h) => h.key.trim() !== "").length;
    const enabledParamsCount = (activeTab?.params || []).filter((p) => p.key.trim() !== "").length;

    this.container.innerHTML = `
      <div style="display:flex;flex-direction:row;height:100%;width:100%;background:var(--surface-canvas);overflow:hidden;">
        <!-- Left Sidebar: Collections, History & Environments -->
        <aside id="heapi-left-sidebar" style="width:${this.leftSidebarWidth}px;min-width:${this.leftSidebarWidth}px;max-width:${this.leftSidebarWidth}px;background:var(--surface-elevated);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;">
          <div style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:3px;">
            <button type="button" class="matz-btn-xs ${this.leftSidebarMode === "collections" ? "primary" : ""}" data-heapi-sb="collections" style="flex:1;justify-content:center;font-size:10px;">
              ${matzIcon("folder", 11)} ${matzPick({ "pt-BR": "Coleções", "en-US": "Collections", "es-ES": "Colecciones" })}
            </button>
            <button type="button" class="matz-btn-xs ${this.leftSidebarMode === "history" ? "primary" : ""}" data-heapi-sb="history" style="flex:1;justify-content:center;font-size:10px;">
              ${matzIcon("clock", 11)} ${matzPick({ "pt-BR": "Histórico", "en-US": "History", "es-ES": "Historial" })}
            </button>
            <button type="button" class="matz-btn-xs ${this.leftSidebarMode === "environments" ? "primary" : ""}" data-heapi-sb="environments" style="flex:1;justify-content:center;font-size:10px;">
              ${matzIcon("globe", 11)} Env
            </button>
          </div>

          ${
            this.leftSidebarMode === "collections"
              ? `
            <div style="padding:6px 8px;border-bottom:1px solid var(--border);display:flex;gap:4px;align-items:center;">
              <input id="heapi-sb-search" class="matz-input" placeholder="${matzPick({
                "pt-BR": "Filtrar endpoints...",
                "en-US": "Filter endpoints...",
                "es-ES": "Filtrar endpoints...",
              })}" value="${escHtml(this.searchFilter)}" style="height:24px;font-size:11px;flex:1;" />
              <button type="button" class="matz-btn-xs" id="heapi-new-col-btn" title="${matzPick({
                "pt-BR": "Nova Coleção",
                "en-US": "New Collection",
                "es-ES": "Nueva Colección",
              })}" style="height:24px;">${matzIcon("plus", 11)}</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:6px;display:flex;flex-direction:column;gap:6px;">
              ${this.collections
                .map((col) => {
                  const q = this.searchFilter.trim().toLowerCase();
                  const reqs = col.requests.filter(
                    (r) => !q || r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
                  );
                  return `
                    <div class="matz-card" style="padding:4px 6px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;cursor:pointer;padding:3px 2px;" data-heapi-col-toggle="${escHtml(col.id)}">
                        <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--text-primary);">
                          ${matzIcon(col.collapsed ? "chevron-right" : "chevron-down", 11)}
                          ${matzIcon("folder", 12, "", { color: "#d946ef" })}
                          <span>${escHtml(col.name)}</span>
                        </span>
                        <button type="button" class="matz-btn-xs" data-heapi-add-req="${escHtml(col.id)}" title="${matzPick({
                    "pt-BR": "Adicionar Requisição",
                    "en-US": "Add Request",
                    "es-ES": "Añadir Petición",
                  })}" style="height:18px;padding:0 4px;font-size:9.5px;">+ Req</button>
                      </div>
                      ${
                        col.collapsed
                          ? ""
                          : `<div style="display:flex;flex-direction:column;gap:2px;margin-top:4px;padding-left:6px;">
                              ${reqs
                                .map((r) => {
                                  const isAct = activeTab?.id === r.id;
                                  const mCol = METHOD_COLORS[r.method] || "var(--accent)";
                                  return `
                                    <div data-heapi-open-req="${escHtml(r.id)}" data-heapi-col="${escHtml(col.id)}" style="display:flex;align-items:center;justify-content:space-between;gap:5px;padding:4px 6px;border-radius:4px;cursor:pointer;background:${
                                    isAct ? "var(--accent-muted)" : "transparent"
                                  };border:1px solid ${isAct ? "var(--accent)" : "transparent"};">
                                      <div style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;">
                                        <span style="font-family:var(--font-mono);font-size:9.5px;font-weight:800;color:${mCol};min-width:32px;">${escHtml(
                                    r.method === "DELETE" ? "DEL" : r.method
                                  )}</span>
                                        <span style="font-size:11px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(
                                          r.name
                                        )}</span>
                                      </div>
                                      <button type="button" data-heapi-del-req="${escHtml(r.id)}" data-heapi-del-col="${escHtml(
                                    col.id
                                  )}" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:10px;padding:0 2px;">x</button>
                                    </div>
                                  `;
                                })
                                .join("")}
                            </div>`
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
          `
              : this.leftSidebarMode === "history"
              ? `
            <div style="flex:1;overflow-y:auto;padding:6px;display:flex;flex-direction:column;gap:4px;">
              ${
                this.history.length === 0
                  ? `<div style="padding:14px;font-size:11px;color:var(--text-muted);text-align:center;">${matzPick({
                      "pt-BR": "Nenhuma requisição executada ainda.",
                      "en-US": "No requests executed yet.",
                      "es-ES": "Ninguna petición ejecutada aún.",
                    })}</div>`
                  : this.history
                      .map(
                        (h, idx) => `
                      <div class="matz-card" data-heapi-hist-idx="${idx}" style="padding:6px 8px;cursor:pointer;display:flex;flex-direction:column;gap:3px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                          <span style="font-family:var(--font-mono);font-size:10px;font-weight:800;color:${
                            METHOD_COLORS[h.method] || "var(--accent)"
                          };">${escHtml(h.method)}</span>
                          <span class="matz-badge ${h.statusCode > 0 && h.statusCode < 400 ? "matz-badge-emerald" : "matz-badge-rose"}" style="font-size:9px;">
                            ${h.statusCode} · ${h.durationMs}ms
                          </span>
                        </div>
                        <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(
                          h.url
                        )}</div>
                        <div style="font-size:9.5px;color:var(--text-muted);">${escHtml(h.timestamp)} · ${formatBytes(h.sizeBytes)}</div>
                      </div>
                    `
                      )
                      .join("")
              }
            </div>
          `
              : `
            <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:8px;">
              <div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">
                ${matzPick({
                  "pt-BR": "Variáveis do Ambiente Ativo",
                  "en-US": "Active Environment Variables",
                  "es-ES": "Variables del Entorno Activo",
                })} (${escHtml(activeEnv?.name || "Local Dev")})
              </div>
              <p style="font-size:10.5px;color:var(--text-secondary);margin:0;">
                ${matzPick({
                  "pt-BR": "Use {{VAR}} na URL, Headers, Auth ou Body:",
                  "en-US": "Use {{VAR}} in URL, Headers, Auth, or Body:",
                  "es-ES": "Use {{VAR}} en URL, Headers, Auth o Body:",
                })}
              </p>
              <textarea id="heapi-env-json" class="matz-textarea" style="flex:1;min-height:180px;font-family:var(--font-mono);font-size:11px;">${escHtml(
                JSON.stringify(activeEnv?.variables || {}, null, 2)
              )}</textarea>
              <button type="button" class="matz-btn matz-btn-xs matz-btn-primary" id="heapi-save-env-btn" style="justify-content:center;">
                ${matzIcon("save", 11)} ${matzPick({
                  "pt-BR": "Salvar Variáveis",
                  "en-US": "Save Variables",
                  "es-ES": "Guardar Variables",
                })}
              </button>
            </div>
          `
          }
        </aside>

        <div class="matz-sash-v" id="heapi-sash-left" title="Arraste para redimensionar"></div>

        <!-- Center Area: Request Tabs + URL Bar + Split Request/Response -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;height:100%;overflow:hidden;">
          <!-- Request Tabs + Environment Bar -->
          <div style="height:32px;min-height:32px;background:var(--surface-elevated);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 8px;gap:6px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:3px;min-width:0;overflow-x:auto;scrollbar-width:none;">
              ${this.openTabs
                .map((t) => {
                  const isAct = t.id === activeTab?.id;
                  const mCol = METHOD_COLORS[t.method] || "var(--accent)";
                  return `
                    <div data-heapi-tab="${escHtml(t.id)}" style="display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border-radius:4px;cursor:pointer;font-size:11px;border:1px solid ${
                    isAct ? "var(--accent)" : "var(--border)"
                  };background:${isAct ? "var(--surface-canvas)" : "var(--surface-subtle)"};flex-shrink:0;">
                      <span style="font-family:var(--font-mono);font-size:9.5px;font-weight:800;color:${mCol};">${escHtml(t.method)}</span>
                      <span style="color:var(--text-primary);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(t.name)}</span>
                      ${
                        this.openTabs.length > 1
                          ? `<button type="button" data-heapi-close-tab="${escHtml(t.id)}" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:10px;padding:0 2px;">x</button>`
                          : ""
                      }
                    </div>
                  `;
                })
                .join("")}
              <button type="button" class="matz-btn-xs" id="heapi-new-tab-btn" title="Nova Requisição (Ctrl+T)" style="height:22px;padding:0 6px;">${matzIcon("plus", 11)}</button>
            </div>

            <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
              <select id="heapi-env-select" class="matz-select" style="height:22px;font-size:10.5px;padding:0 20px 0 6px;">
                ${this.environments
                  .map(
                    (e) =>
                      `<option value="${escHtml(e.id)}" ${e.id === this.activeEnvId ? "selected" : ""}>Env: ${escHtml(e.name)}</option>`
                  )
                  .join("")}
              </select>
              <button type="button" class="matz-btn-xs" id="heapi-toggle-split-dir" title="Alternar Split Horizontal / Vertical" style="height:22px;">
                ${matzIcon("columns", 11)}
              </button>
              <button type="button" class="matz-btn-xs ${this.rightDrawerOpen ? "primary" : ""}" id="heapi-toggle-snippets" title="Code Snippets (cURL, Fetch, Go, Python) & Import cURL" style="height:22px;">
                ${matzIcon("code", 11)} Snippets / cURL
              </button>
            </div>
          </div>

          <!-- Top URL & Method Bar -->
          <div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;background:var(--surface-subtle);flex-shrink:0;">
            <span class="matz-badge" style="flex-shrink:0;">${matzIcon("globe", 11)} Heapi v0.2</span>

            <div class="matz-combobox" style="min-width:98px;">
              <button type="button" class="matz-combobox-trigger" id="matz-api-method-trigger" style="height:28px;padding:0 8px;">
                <span style="font-family:var(--font-mono);font-weight:800;font-size:11.5px;color:${methodColor};">${method}</span>
                ${matzIcon("chevron-down", 12)}
              </button>
              <div class="matz-combobox-menu ${this.methodMenuOpen ? "open" : ""}" id="matz-api-method-menu">
                ${ALL_METHODS.map(
                  (m) => `
                  <div class="matz-combobox-option ${method === m ? "selected" : ""}" data-http-method="${m}">
                    <span style="font-family:var(--font-mono);font-weight:700;color:${METHOD_COLORS[m]};">${m}</span>
                    ${method === m ? matzIcon("check", 12) : ""}
                  </div>`
                ).join("")}
              </div>
            </div>

            <input
              class="matz-input"
              id="matz-api-url"
              value="${escHtml(activeTab?.url || "")}"
              placeholder="https://api.example.com/v1/... (suporta {{VAR}} ou digite /POST para trocar método)"
              style="flex:1;height:28px;font-family:var(--font-mono);font-size:12px;"
            />

            <button type="button" class="matz-btn matz-btn-sm matz-btn-primary" id="matz-api-send" style="height:28px;flex-shrink:0;">
              ${matzIcon("send", 12)}
              <span>${
                this.loading
                  ? matzPick({ "pt-BR": "Enviando...", "en-US": "Sending...", "es-ES": "Enviando..." })
                  : matzPick({ "pt-BR": "Enviar", "en-US": "Send", "es-ES": "Enviar" })
              }</span>
            </button>

            <button type="button" class="matz-btn matz-btn-sm" id="heapi-save-req-btn" title="Salvar na Coleção" style="height:28px;flex-shrink:0;">
              ${matzIcon("save", 12)}
            </button>
          </div>

          <!-- Split Request Config & Response Inspector -->
          <div id="heapi-split-stage" style="flex:1;min-height:0;display:flex;flex-direction:${
            this.splitVertical ? "column" : "row"
          };overflow:hidden;">
            <!-- Request Pane -->
            <div id="heapi-req-pane" style="${
              this.splitVertical ? `height:${this.requestSplitPct}%` : `width:${this.requestSplitPct}%`
            };min-width:220px;min-height:140px;display:flex;flex-direction:column;overflow:hidden;background:var(--surface-card-solid);">
              <div style="height:28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:var(--surface-elevated);flex-shrink:0;">
                <div style="display:flex;gap:4px;">
                  <button type="button" class="matz-btn-xs ${this.configSubTab === "params" ? "primary" : ""}" data-heapi-cfg="params">
                    Params ${enabledParamsCount > 0 ? `(${enabledParamsCount})` : ""}
                  </button>
                  <button type="button" class="matz-btn-xs ${this.configSubTab === "headers" ? "primary" : ""}" data-heapi-cfg="headers">
                    Headers ${enabledHeadersCount > 0 ? `(${enabledHeadersCount})` : ""}
                  </button>
                  <button type="button" class="matz-btn-xs ${this.configSubTab === "auth" ? "primary" : ""}" data-heapi-cfg="auth">
                    Auth ${activeTab?.auth?.type && activeTab.auth.type !== "none" ? "•" : ""}
                  </button>
                  <button type="button" class="matz-btn-xs ${this.configSubTab === "body" ? "primary" : ""}" data-heapi-cfg="body">
                    Body ${activeTab?.body?.trim() ? "•" : ""}
                  </button>
                </div>
                ${
                  this.configSubTab === "body"
                    ? `<button type="button" class="matz-btn-xs" id="heapi-prettify-btn">${matzIcon("code", 10)} Prettify JSON</button>`
                    : ""
                }
              </div>

              <div style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;">
                ${this.renderConfigSubTabHtml(activeTab)}
              </div>
            </div>

            <div class="${this.splitVertical ? "matz-sash-h" : "matz-sash-v"}" id="heapi-sash-center" title="Arraste para redimensionar Request / Response"></div>

            <!-- Response Pane -->
            <div style="flex:1;min-width:220px;min-height:140px;display:flex;flex-direction:column;overflow:hidden;background:var(--surface-canvas);">
              <div style="height:28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:var(--surface-elevated);flex-shrink:0;">
                <div style="display:flex;gap:4px;">
                  <button type="button" class="matz-btn-xs ${this.responseSubTab === "pretty" ? "primary" : ""}" data-heapi-resp="pretty">Pretty JSON</button>
                  <button type="button" class="matz-btn-xs ${this.responseSubTab === "tree" ? "primary" : ""}" data-heapi-resp="tree">JSON Tree</button>
                  <button type="button" class="matz-btn-xs ${this.responseSubTab === "raw" ? "primary" : ""}" data-heapi-resp="raw">Raw</button>
                  <button type="button" class="matz-btn-xs ${this.responseSubTab === "headers" ? "primary" : ""}" data-heapi-resp="headers">
                    Headers (${Object.keys(activeTab?.lastResult?.headers || {}).length})
                  </button>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  ${
                    activeTab?.lastResult
                      ? `<span class="matz-badge ${
                          activeTab.lastResult.status_code > 0 && activeTab.lastResult.status_code < 400
                            ? "matz-badge-emerald"
                            : "matz-badge-rose"
                        }" style="font-size:10px;">
                          ${activeTab.lastResult.status_code} ${escHtml(activeTab.lastResult.status_text || "")}
                        </span>
                        <span class="matz-tabular" style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-muted);">${
                          activeTab.lastResult.duration
                        } ms</span>
                        <span class="matz-tabular" style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-muted);">${formatBytes(
                          activeTab.lastResult.size_bytes
                        )}</span>
                        <button type="button" class="matz-btn-xs" id="heapi-copy-resp" title="Copiar Resposta">${matzIcon("copy", 10)}</button>`
                      : `<span class="matz-badge" style="font-size:9.5px;">READY</span>`
                  }
                </div>
              </div>

              <div id="heapi-response-body-host" style="flex:1;overflow:auto;padding:10px;"></div>
            </div>
          </div>
        </div>

        ${
          this.rightDrawerOpen
            ? `
          <aside style="width:320px;min-width:280px;border-left:1px solid var(--border);background:var(--surface-elevated);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;">
            <div style="height:32px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 10px;">
              <div style="display:flex;gap:4px;">
                <button type="button" class="matz-btn-xs ${this.rightDrawerTab === "snippets" ? "primary" : ""}" data-heapi-rdrawer="snippets">Code Snippets</button>
                <button type="button" class="matz-btn-xs ${this.rightDrawerTab === "curl-import" ? "primary" : ""}" data-heapi-rdrawer="curl-import">Import cURL</button>
              </div>
              <button type="button" class="matz-win-btn" id="heapi-close-rdrawer">${matzIcon("close", 12)}</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:10px;">
              ${
                this.rightDrawerTab === "snippets"
                  ? `
                ${[
                  { id: "curl", label: "cURL", code: snippets.curl },
                  { id: "fetch", label: "JavaScript / TypeScript (fetch)", code: snippets.fetch },
                  { id: "go", label: "Go (net/http)", code: snippets.go },
                  { id: "python", label: "Python (requests)", code: snippets.python },
                ]
                  .map(
                    (sn) => `
                  <div class="matz-card" style="padding:8px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                      <span style="font-size:10.5px;font-weight:700;color:var(--text-secondary);">${sn.label}</span>
                      <button type="button" class="matz-btn-xs" data-copy-snip="${sn.id}">${matzIcon("copy", 10)} Copiar</button>
                    </div>
                    <pre style="margin:0;padding:8px;background:var(--surface-input);border:1px solid var(--border-input);border-radius:4px;font-family:var(--font-mono);font-size:10.5px;overflow-x:auto;white-space:pre-wrap;color:var(--text-primary);">${escHtml(
                      sn.code
                    )}</pre>
                  </div>
                `
                  )
                  .join("")}
              `
                  : `
                <div style="font-size:11px;color:var(--text-secondary);">
                  ${matzPick({
                    "pt-BR": "Cole um comando cURL para converter automaticamente em uma requisição Heapi:",
                    "en-US": "Paste a cURL command to automatically convert into a Heapi request:",
                    "es-ES": "Pegue un comando cURL para convertir automáticamente en una petición Heapi:",
                  })}
                </div>
                <textarea id="heapi-curl-import-ta" class="matz-textarea" style="height:180px;font-family:var(--font-mono);font-size:11px;" placeholder='curl -X POST "https://api.example.com/v1/items" -H "Authorization: Bearer token" -d "{\"name\":\"item\"}"'>${escHtml(
                    this.curlImportText
                  )}</textarea>
                <button type="button" class="matz-btn matz-btn-sm matz-btn-primary" id="heapi-exec-curl-import" style="justify-content:center;">
                  ${matzIcon("upload", 12)} ${matzPick({
                    "pt-BR": "Importar Comando cURL",
                    "en-US": "Import cURL Command",
                    "es-ES": "Importar Comando cURL",
                  })}
                </button>
              `
              }
            </div>
          </aside>
        `
            : ""
        }
      </div>
    `;

    this.populateResponseContent(activeTab);
    this.bindEvents(activeTab, snippets);
  }

  private renderConfigSubTabHtml(req?: HeapiSavedRequest): string {
    if (!req) return "";

    if (this.configSubTab === "params" || this.configSubTab === "headers") {
      const isParams = this.configSubTab === "params";
      const list = isParams ? req.params : req.headers;
      const rows = list.length > 0 ? [...list, { key: "", value: "", enabled: true }] : [{ key: "", value: "", enabled: true }];

      return `
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:grid;grid-template-columns:24px 1fr 1fr 26px;gap:6px;font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;padding:0 4px;">
            <span>Atv</span>
            <span>${isParams ? "Query Param" : "Header Name"}</span>
            <span>Value ({{VAR}})</span>
            <span></span>
          </div>
          ${rows
            .map(
              (r, idx) => `
            <div style="display:grid;grid-template-columns:24px 1fr 1fr 26px;gap:6px;align-items:center;" data-kv-row="${idx}">
              <input type="checkbox" data-kv-enabled="${idx}" ${r.enabled ? "checked" : ""} />
              <input class="matz-input" data-kv-key="${idx}" value="${escHtml(r.key)}" placeholder="${
                isParams ? "page" : "Authorization"
              }" style="height:25px;font-family:var(--font-mono);font-size:11px;" />
              <input class="matz-input" data-kv-val="${idx}" value="${escHtml(r.value)}" placeholder="${
                isParams ? "1" : "Bearer {{API_TOKEN}}"
              }" style="height:25px;font-family:var(--font-mono);font-size:11px;" />
              <button type="button" class="matz-btn-xs" data-kv-del="${idx}" style="height:22px;padding:0;">x</button>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    if (this.configSubTab === "auth") {
      const auth = req.auth || { type: "none" };
      return `
        <div style="display:flex;flex-direction:column;gap:10px;max-width:460px;">
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:4px;">${matzPick({
              "pt-BR": "Esquema de Autenticação",
              "en-US": "Authentication Scheme",
              "es-ES": "Esquema de Autenticación",
            })}</label>
            <select id="heapi-auth-type" class="matz-select" style="width:100%;">
              <option value="none" ${auth.type === "none" ? "selected" : ""}>${matzPick({
                "pt-BR": "Sem Autenticação (None)",
                "en-US": "No Authentication (None)",
                "es-ES": "Sin Autenticación (None)",
              })}</option>
              <option value="bearer" ${auth.type === "bearer" ? "selected" : ""}>Bearer Token (JWT / OAuth2)</option>
              <option value="basic" ${auth.type === "basic" ? "selected" : ""}>Basic Auth (Username & Password)</option>
              <option value="apikey" ${auth.type === "apikey" ? "selected" : ""}>API Key (Header / Query Param)</option>
            </select>
          </div>
          ${
            auth.type === "bearer"
              ? `
            <div>
              <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Bearer Token ({{API_TOKEN}})</label>
              <input id="heapi-auth-token" class="matz-input" value="${escHtml(auth.token || "")}" placeholder="eyJhbGciOi... / {{API_TOKEN}}" style="width:100%;font-family:var(--font-mono);" />
            </div>
          `
              : auth.type === "basic"
              ? `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Username</label>
                <input id="heapi-auth-user" class="matz-input" value="${escHtml(auth.username || "")}" style="width:100%;font-family:var(--font-mono);" />
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Password</label>
                <input id="heapi-auth-pass" type="password" class="matz-input" value="${escHtml(auth.password || "")}" style="width:100%;font-family:var(--font-mono);" />
              </div>
            </div>
          `
              : auth.type === "apikey"
              ? `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Header / Param Key</label>
                <input id="heapi-auth-key" class="matz-input" value="${escHtml(auth.key || "X-API-Key")}" style="width:100%;font-family:var(--font-mono);" />
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Value</label>
                <input id="heapi-auth-val" class="matz-input" value="${escHtml(auth.value || "")}" placeholder="{{API_KEY}}" style="width:100%;font-family:var(--font-mono);" />
              </div>
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">${matzPick({
                "pt-BR": "Enviar Em",
                "en-US": "Send In",
                "es-ES": "Enviar En",
              })}</label>
              <select id="heapi-auth-in" class="matz-select" style="width:100%;">
                <option value="header" ${auth.in !== "query" ? "selected" : ""}>HTTP Header</option>
                <option value="query" ${auth.in === "query" ? "selected" : ""}>URL Query Param</option>
              </select>
            </div>
          `
              : ""
          }
        </div>
      `;
    }

    return `
      <textarea
        class="matz-textarea"
        id="matz-api-body"
        style="flex:1;min-height:140px;font-family:var(--font-mono);font-size:12px;"
        placeholder='{\n  "key": "value"\n}'
      >${escHtml(req.body || "")}</textarea>
    `;
  }

  private populateResponseContent(req?: HeapiSavedRequest): void {
    const host = this.container.querySelector<HTMLElement>("#heapi-response-body-host");
    if (!host) return;

    const res = req?.lastResult;
    if (!res) {
      host.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);gap:6px;font-size:11.5px;">
          ${matzIcon("globe", 22)}
          <span>${matzPick({
            "pt-BR": "Envie uma requisição HTTP para inspecionar o payload, árvore JSON e headers.",
            "en-US": "Send an HTTP request to inspect payload, JSON tree, and headers.",
            "es-ES": "Envíe una petición HTTP para inspeccionar payload, árbol JSON y headers.",
          })}</span>
        </div>
      `;
      return;
    }

    if (res.error) {
      host.innerHTML = `<pre style="margin:0;color:var(--danger);font-family:var(--font-mono);font-size:12px;white-space:pre-wrap;">Erro: ${escHtml(
        res.error
      )}</pre>`;
      return;
    }

    if (this.responseSubTab === "pretty") {
      host.innerHTML = `<pre style="margin:0;font-family:var(--font-mono);font-size:12px;line-height:1.55;white-space:pre-wrap;">${highlightJsonHtml(
        res.body || ""
      )}</pre>`;
    } else if (this.responseSubTab === "tree") {
      host.innerHTML = "";
      host.appendChild(buildInteractiveJsonTree(res.body || ""));
    } else if (this.responseSubTab === "raw") {
      const pre = document.createElement("pre");
      pre.style.margin = "0";
      pre.style.fontFamily = "var(--font-mono)";
      pre.style.fontSize = "12px";
      pre.style.whiteSpace = "pre-wrap";
      pre.textContent = res.body || "";
      host.innerHTML = "";
      host.appendChild(pre);
    } else {
      const entries = Object.entries(res.headers || {});
      host.innerHTML =
        entries.length === 0
          ? `<div style="font-size:11px;color:var(--text-muted);">Sem headers de resposta.</div>`
          : `<div style="display:flex;flex-direction:column;gap:4px;">
              ${entries
                .map(
                  ([k, v]) => `
                <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;padding:4px 6px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:11px;">
                  <strong style="color:var(--accent);">${escHtml(k)}</strong>
                  <span style="color:var(--text-primary);word-break:break-all;">${escHtml(String(v))}</span>
                </div>
              `
                )
                .join("")}
            </div>`;
    }
  }

  private bindEvents(
    activeTab: HeapiSavedRequest | undefined,
    snippets: { curl: string; fetch: string; go: string; python: string }
  ): void {
    // Sidebar Mode Switch
    this.container.querySelectorAll<HTMLButtonElement>("[data-heapi-sb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.leftSidebarMode = btn.dataset.heapiSb as typeof this.leftSidebarMode;
        this.render();
      });
    });

    // Search Filter
    const searchInp = this.container.querySelector<HTMLInputElement>("#heapi-sb-search");
    searchInp?.addEventListener("input", () => {
      this.searchFilter = searchInp.value;
      this.render();
      const restored = this.container.querySelector<HTMLInputElement>("#heapi-sb-search");
      restored?.focus();
      restored?.setSelectionRange(this.searchFilter.length, this.searchFilter.length);
    });

    // New Collection
    this.container.querySelector("#heapi-new-col-btn")?.addEventListener("click", () => {
      const colId = `col-${Date.now()}`;
      this.collections.push({
        id: colId,
        name: `Coleção ${this.collections.length + 1}`,
        collapsed: false,
        requests: [],
      });
      this.savePersistedState();
      this.render();
    });

    // Toggle Collection / Add Request
    this.container.querySelectorAll<HTMLElement>("[data-heapi-col-toggle]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const addBtn = (e.target as HTMLElement).closest("[data-heapi-add-req]") as HTMLElement | null;
        const colId = el.dataset.heapiColToggle!;
        const col = this.collections.find((c) => c.id === colId);
        if (!col) return;
        if (addBtn) {
          e.stopPropagation();
          const newReq: HeapiSavedRequest = {
            id: `req-${Date.now()}`,
            collectionId: col.id,
            name: `Nova Requisição ${col.requests.length + 1}`,
            method: "GET",
            url: "{{JSON_API}}/posts/1",
            headers: [{ key: "Accept", value: "application/json", enabled: true }],
            params: [],
            body: "",
            auth: { type: "none" },
          };
          col.collapsed = false;
          col.requests.push(newReq);
          this.openTabs.push(structuredClone(newReq));
          this.activeTabId = newReq.id;
          this.savePersistedState();
          this.render();
          return;
        }
        col.collapsed = !col.collapsed;
        this.savePersistedState();
        this.render();
      });
    });

    // Open Request from Collection
    this.container.querySelectorAll<HTMLElement>("[data-heapi-open-req]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const delBtn = (e.target as HTMLElement).closest("[data-heapi-del-req]") as HTMLElement | null;
        if (delBtn) {
          e.stopPropagation();
          const rId = delBtn.dataset.heapiDelReq!;
          const cId = delBtn.dataset.heapiDelCol!;
          const col = this.collections.find((c) => c.id === cId);
          if (col) {
            col.requests = col.requests.filter((r) => r.id !== rId);
            this.openTabs = this.openTabs.filter((t) => t.id !== rId);
            if (this.openTabs.length === 0 && this.collections[0]?.requests[0]) {
              this.openTabs = [structuredClone(this.collections[0].requests[0])];
            }
            this.activeTabId = this.openTabs[0]?.id || "";
            this.savePersistedState();
            this.render();
          }
          return;
        }
        const reqId = el.dataset.heapiOpenReq!;
        const colId = el.dataset.heapiCol!;
        const col = this.collections.find((c) => c.id === colId);
        const found = col?.requests.find((r) => r.id === reqId);
        if (!found) return;
        const existingTab = this.openTabs.find((t) => t.id === found.id);
        if (!existingTab) {
          this.openTabs.push(structuredClone(found));
        }
        this.activeTabId = found.id;
        this.render();
      });
    });

    // Replay History Item
    this.container.querySelectorAll<HTMLElement>("[data-heapi-hist-idx]").forEach((el) => {
      el.addEventListener("click", () => {
        const item = this.history[Number(el.dataset.heapiHistIdx)];
        if (!item) return;
        const snap = structuredClone(item.requestSnapshot);
        const existing = this.openTabs.find((t) => t.id === snap.id);
        if (existing) {
          Object.assign(existing, snap);
        } else {
          this.openTabs.push(snap);
        }
        this.activeTabId = snap.id;
        this.render();
      });
    });

    // Save Environment Variables
    this.container.querySelector("#heapi-save-env-btn")?.addEventListener("click", () => {
      const ta = this.container.querySelector<HTMLTextAreaElement>("#heapi-env-json");
      const env = this.environments.find((e) => e.id === this.activeEnvId);
      if (!ta || !env) return;
      try {
        env.variables = JSON.parse(ta.value);
        this.savePersistedState();
        showMatzToast(`Variáveis do ambiente ${env.name} salvas!`);
      } catch {
        showMatzToast("JSON inválido nas variáveis de ambiente.");
      }
    });

    // Request Tabs
    this.container.querySelectorAll<HTMLElement>("[data-heapi-tab]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const closeBtn = (e.target as HTMLElement).closest("[data-heapi-close-tab]") as HTMLElement | null;
        if (closeBtn) {
          e.stopPropagation();
          const cId = closeBtn.dataset.heapiCloseTab!;
          this.openTabs = this.openTabs.filter((t) => t.id !== cId);
          if (this.activeTabId === cId) {
            this.activeTabId = this.openTabs[0]?.id || "";
          }
          this.render();
          return;
        }
        this.activeTabId = el.dataset.heapiTab!;
        this.render();
      });
    });

    this.container.querySelector("#heapi-new-tab-btn")?.addEventListener("click", () => {
      const req: HeapiSavedRequest = {
        id: `req-${Date.now()}`,
        collectionId: this.collections[0]?.id || "col-rest-sandbox",
        name: `Request ${this.openTabs.length + 1}`,
        method: "GET",
        url: "{{JSON_API}}/posts/1",
        headers: [{ key: "Accept", value: "application/json", enabled: true }],
        params: [],
        body: "",
        auth: { type: "none" },
      };
      this.openTabs.push(req);
      this.activeTabId = req.id;
      this.render();
    });

    // Environment Select
    this.container.querySelector<HTMLSelectElement>("#heapi-env-select")?.addEventListener("change", (e) => {
      this.activeEnvId = (e.target as HTMLSelectElement).value;
      this.render();
    });

    this.container.querySelector("#heapi-toggle-split-dir")?.addEventListener("click", () => {
      this.splitVertical = !this.splitVertical;
      this.render();
    });

    this.container.querySelector("#heapi-toggle-snippets")?.addEventListener("click", () => {
      this.rightDrawerOpen = !this.rightDrawerOpen;
      this.render();
    });

    this.container.querySelector("#heapi-close-rdrawer")?.addEventListener("click", () => {
      this.rightDrawerOpen = false;
      this.render();
    });

    this.container.querySelectorAll<HTMLButtonElement>("[data-heapi-rdrawer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.rightDrawerTab = btn.dataset.heapiRdrawer as typeof this.rightDrawerTab;
        this.render();
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>("[data-copy-snip]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.copySnip as keyof typeof snippets;
        void navigator.clipboard?.writeText(snippets[k] || "");
        showMatzToast(`Snippet ${k.toUpperCase()} copiado!`);
      });
    });

    this.container.querySelector("#heapi-exec-curl-import")?.addEventListener("click", () => {
      const ta = this.container.querySelector<HTMLTextAreaElement>("#heapi-curl-import-ta");
      const raw = ta?.value?.trim() || "";
      if (!raw) return;
      this.curlImportText = raw;
      const imported = parseCurlCommandToRequest(raw, this.collections[0]?.id || "col-rest-sandbox");
      this.collections[0]?.requests.push(imported);
      this.openTabs.push(structuredClone(imported));
      this.activeTabId = imported.id;
      this.savePersistedState();
      showMatzToast(`Comando cURL importado: ${imported.method} ${imported.url}`);
      this.render();
    });

    // Method Selector & URL Slash Command
    this.container.querySelector("#matz-api-method-trigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.methodMenuOpen = !this.methodMenuOpen;
      this.render();
    });

    this.container.querySelectorAll<HTMLElement>("[data-http-method]").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeTab) activeTab.method = opt.dataset.httpMethod || "GET";
        this.methodMenuOpen = false;
        this.render();
      });
    });

    const urlInp = this.container.querySelector<HTMLInputElement>("#matz-api-url");
    urlInp?.addEventListener("input", () => {
      if (!activeTab) return;
      const val = urlInp.value;
      if (val.startsWith("/")) {
        const cmd = val.slice(1).toUpperCase().trim();
        if (ALL_METHODS.includes(cmd) && val.endsWith(" ")) {
          activeTab.method = cmd;
          activeTab.url = "";
          this.render();
          this.container.querySelector<HTMLInputElement>("#matz-api-url")?.focus();
          return;
        }
      }
      activeTab.url = val;
    });

    urlInp?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.container.querySelector<HTMLButtonElement>("#matz-api-send")?.click();
      }
    });

    // Save Request back to Collection
    this.container.querySelector("#heapi-save-req-btn")?.addEventListener("click", () => {
      if (!activeTab) return;
      let col = this.collections.find((c) => c.id === activeTab.collectionId) || this.collections[0];
      if (!col) return;
      const idx = col.requests.findIndex((r) => r.id === activeTab.id);
      if (idx >= 0) {
        col.requests[idx] = structuredClone(activeTab);
      } else {
        col.requests.push(structuredClone(activeTab));
      }
      this.savePersistedState();
      showMatzToast(`Salvo na coleção "${col.name}"`);
      this.render();
    });

    // Sub-tabs switching
    this.container.querySelectorAll<HTMLButtonElement>("[data-heapi-cfg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.configSubTab = btn.dataset.heapiCfg as typeof this.configSubTab;
        this.render();
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>("[data-heapi-resp]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.responseSubTab = btn.dataset.heapiResp as typeof this.responseSubTab;
        this.render();
      });
    });

    this.container.querySelector("#heapi-copy-resp")?.addEventListener("click", () => {
      if (!activeTab?.lastResult?.body) return;
      void navigator.clipboard?.writeText(tryFormatJson(activeTab.lastResult.body));
      showMatzToast("Resposta copiada para a área de transferência!");
    });

    // KV Rows (Params & Headers)
    if (activeTab && (this.configSubTab === "params" || this.configSubTab === "headers")) {
      const isParams = this.configSubTab === "params";
      const targetList = isParams ? activeTab.params : activeTab.headers;

      const ensureIdx = (idx: number) => {
        while (targetList.length <= idx) {
          targetList.push({ key: "", value: "", enabled: true });
        }
      };

      this.container.querySelectorAll<HTMLInputElement>("[data-kv-enabled]").forEach((chk) => {
        chk.addEventListener("change", () => {
          const idx = Number(chk.dataset.kvEnabled);
          ensureIdx(idx);
          targetList[idx].enabled = chk.checked;
        });
      });

      this.container.querySelectorAll<HTMLInputElement>("[data-kv-key]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.kvKey);
          const wasTail = idx >= targetList.length;
          ensureIdx(idx);
          targetList[idx].key = inp.value;
          if (wasTail && inp.value.trim()) {
            this.render();
            const restored = this.container.querySelector<HTMLInputElement>(`[data-kv-key="${idx}"]`);
            restored?.focus();
            restored?.setSelectionRange(inp.value.length, inp.value.length);
          }
        });
      });

      this.container.querySelectorAll<HTMLInputElement>("[data-kv-val]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.kvVal);
          ensureIdx(idx);
          targetList[idx].value = inp.value;
        });
      });

      this.container.querySelectorAll<HTMLButtonElement>("[data-kv-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.kvDel);
          if (idx < targetList.length) {
            targetList.splice(idx, 1);
            this.render();
          }
        });
      });
    }

    // Auth Inputs
    if (activeTab && this.configSubTab === "auth") {
      this.container.querySelector<HTMLSelectElement>("#heapi-auth-type")?.addEventListener("change", (e) => {
        activeTab.auth.type = (e.target as HTMLSelectElement).value as HeapiAuthConfig["type"];
        this.render();
      });
      this.container.querySelector<HTMLInputElement>("#heapi-auth-token")?.addEventListener("input", (e) => {
        activeTab.auth.token = (e.target as HTMLInputElement).value;
      });
      this.container.querySelector<HTMLInputElement>("#heapi-auth-user")?.addEventListener("input", (e) => {
        activeTab.auth.username = (e.target as HTMLInputElement).value;
      });
      this.container.querySelector<HTMLInputElement>("#heapi-auth-pass")?.addEventListener("input", (e) => {
        activeTab.auth.password = (e.target as HTMLInputElement).value;
      });
      this.container.querySelector<HTMLInputElement>("#heapi-auth-key")?.addEventListener("input", (e) => {
        activeTab.auth.key = (e.target as HTMLInputElement).value;
      });
      this.container.querySelector<HTMLInputElement>("#heapi-auth-val")?.addEventListener("input", (e) => {
        activeTab.auth.value = (e.target as HTMLInputElement).value;
      });
      this.container.querySelector<HTMLSelectElement>("#heapi-auth-in")?.addEventListener("change", (e) => {
        activeTab.auth.in = (e.target as HTMLSelectElement).value as "header" | "query";
      });
    }

    // Body Input & Prettify
    const bodyTa = this.container.querySelector<HTMLTextAreaElement>("#matz-api-body");
    bodyTa?.addEventListener("input", () => {
      if (activeTab) activeTab.body = bodyTa.value;
    });
    this.container.querySelector("#heapi-prettify-btn")?.addEventListener("click", () => {
      if (!activeTab) return;
      activeTab.body = tryFormatJson(activeTab.body);
      this.render();
    });

    // Execute Request
    this.container.querySelector("#matz-api-send")?.addEventListener("click", async () => {
      if (!activeTab) return;
      this.methodMenuOpen = false;
      this.loading = true;
      this.render();
      try {
        const resolved = this.buildResolvedRequest(activeTab);
        const res = await this.bridge.executeRequest(
          resolved.method,
          resolved.url,
          resolved.headersJson,
          resolved.body,
          resolved.authJson
        );
        activeTab.lastResult = res;
        this.history.unshift({
          id: `hist-${Date.now()}`,
          method: resolved.method,
          url: resolved.url,
          statusCode: res.status_code,
          statusText: res.status_text,
          durationMs: res.duration,
          sizeBytes: res.size_bytes,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          requestSnapshot: structuredClone(activeTab),
        });
        this.savePersistedState();
      } finally {
        this.loading = false;
        this.render();
      }
    });

    // Left Sidebar Sash Resize
    const sashLeft = this.container.querySelector<HTMLElement>("#heapi-sash-left");
    const sbLeft = this.container.querySelector<HTMLElement>("#heapi-left-sidebar");
    if (sashLeft && sbLeft) {
      sashLeft.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        const startX = ev.clientX;
        const startW = sbLeft.getBoundingClientRect().width;
        sashLeft.classList.add("is-dragging");
        document.body.style.cursor = "col-resize";
        const onMove = (mEv: MouseEvent) => {
          const next = Math.max(180, Math.min(440, Math.round(startW + (mEv.clientX - startX))));
          this.leftSidebarWidth = next;
          sbLeft.style.width = `${next}px`;
          sbLeft.style.minWidth = `${next}px`;
          sbLeft.style.maxWidth = `${next}px`;
        };
        const onUp = () => {
          sashLeft.classList.remove("is-dragging");
          document.body.style.cursor = "";
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });
    }

    // Center Split Sash Resize
    const sashCenter = this.container.querySelector<HTMLElement>("#heapi-sash-center");
    const splitStage = this.container.querySelector<HTMLElement>("#heapi-split-stage");
    const reqPane = this.container.querySelector<HTMLElement>("#heapi-req-pane");
    if (sashCenter && splitStage && reqPane) {
      sashCenter.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        sashCenter.classList.add("is-dragging");
        const rect = splitStage.getBoundingClientRect();
        document.body.style.cursor = this.splitVertical ? "row-resize" : "col-resize";
        const onMove = (mEv: MouseEvent) => {
          const pct = this.splitVertical
            ? ((mEv.clientY - rect.top) / rect.height) * 100
            : ((mEv.clientX - rect.left) / rect.width) * 100;
          this.requestSplitPct = Math.max(22, Math.min(78, Math.round(pct)));
          if (this.splitVertical) {
            reqPane.style.height = `${this.requestSplitPct}%`;
          } else {
            reqPane.style.width = `${this.requestSplitPct}%`;
          }
        };
        const onUp = () => {
          sashCenter.classList.remove("is-dragging");
          document.body.style.cursor = "";
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });
    }
  }
}
