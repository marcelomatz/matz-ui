import { matzT } from "../i18n/index";

export type MatzDiagnosticSeverity = "error" | "warning" | "info";

export interface MatzDiagnosticItem {
  line: number;
  column: number;
  severity: MatzDiagnosticSeverity;
  message: string;
  source: string;
  code?: string;
}

export type MatzCompletionKind =
  | "keyword"
  | "function"
  | "type"
  | "snippet"
  | "variable"
  | "property"
  | "emmet";

export interface MatzCompletionItem {
  label: string;
  kind: MatzCompletionKind;
  detail: string;
  insertText: string;
  cursorBackOffset?: number;
  replaceLength?: number;
}

export interface MatzCodeEditorOptions {
  value: string;
  language: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  tabSize?: number;
  wordWrap?: boolean;
  readOnly?: boolean;
  showMinimap?: boolean;
  enableAutocomplete?: boolean;
  enableLinter?: boolean;
  externalDiagnostics?: MatzDiagnosticItem[];
  initialScrollTop?: number;
  initialScrollLeft?: number;
  initialSelectionStart?: number;
  initialSelectionEnd?: number;
  onChange?: (nextValue: string) => void;
  onCursorChange?: (line: number, column: number, selectionText: string) => void;
  onScrollChange?: (scrollTop: number, scrollLeft: number) => void;
  onDiagnosticsChange?: (diagnostics: MatzDiagnosticItem[]) => void;
  onSave?: () => void;
}

export interface MatzLanguageConventions {
  tabSize: number;
  insertSpaces: boolean;
  rulerColumn: number;
  defaultEol: "LF" | "CRLF";
  lineComment: string;
  blockOpeners: RegExp;
}

export function getMatzLanguageConventions(language: string): MatzLanguageConventions {
  const lang = (language || "plaintext").toLowerCase();
  if (lang === "go") {
    return {
      tabSize: 4,
      insertSpaces: false,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "//",
      blockOpeners: /[{(\[]\s*(\/\/.*)?$/,
    };
  }
  if (lang === "python") {
    return {
      tabSize: 4,
      insertSpaces: true,
      rulerColumn: 88,
      defaultEol: "LF",
      lineComment: "#",
      blockOpeners: /(:\s*(#.*)?|[({\[]\s*)$/,
    };
  }
  if (
    lang === "rust" ||
    lang === "c" ||
    lang === "cpp" ||
    lang === "csharp" ||
    lang === "java" ||
    lang === "kotlin" ||
    lang === "swift" ||
    lang === "php"
  ) {
    return {
      tabSize: 4,
      insertSpaces: true,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "//",
      blockOpeners: /[{(\[]\s*(\/\/.*)?$/,
    };
  }
  if (lang === "lua") {
    return {
      tabSize: 2,
      insertSpaces: true,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "--",
      blockOpeners: /(\b(then|do|repeat|else)\b|function\s*[A-Za-z0-9_.:]*\s*\([^)]*\)|[{(\[])\s*(--.*)?$/,
    };
  }
  if (lang === "yaml" || lang === "toml") {
    return {
      tabSize: 2,
      insertSpaces: true,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "#",
      blockOpeners: /(:\s*(#.*)?|[{\[]\s*)$/,
    };
  }
  if (lang === "sql") {
    return {
      tabSize: 2,
      insertSpaces: true,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "--",
      blockOpeners: /(\b(BEGIN|CASE|THEN|LOOP)\b|\()\s*(--.*)?$/i,
    };
  }
  if (lang === "shell" || lang === "powershell" || lang === "dockerfile" || lang === "makefile") {
    return {
      tabSize: 2,
      insertSpaces: true,
      rulerColumn: 100,
      defaultEol: "LF",
      lineComment: "#",
      blockOpeners: /(\b(then|do)\b|\{\s*)(#.*)?$/,
    };
  }
  return {
    tabSize: 2,
    insertSpaces: true,
    rulerColumn: 100,
    defaultEol: "LF",
    lineComment: "//",
    blockOpeners: /([{(\[]|=>)\s*(\/\/.*)?$/,
  };
}

export function detectMatzEol(text: string): "LF" | "CRLF" {
  return text.includes("\r\n") ? "CRLF" : "LF";
}

export function convertMatzEol(text: string, targetEol: "LF" | "CRLF"): string {
  const normalized = text.replace(/\r\n/g, "\n");
  return targetEol === "CRLF" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

const MINIMAP_STORAGE_KEY = "matz-editor-minimap";

export function isMatzMinimapEnabled(): boolean {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(MINIMAP_STORAGE_KEY) !== "0";
    }
  } catch {
    // ignore
  }
  return true;
}

export function setMatzMinimapEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MINIMAP_STORAGE_KEY, enabled ? "1" : "0");
    }
  } catch {
    // ignore
  }
}

function escapeCodeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttrHtml(raw: string): string {
  return escapeCodeHtml(raw).replace(/"/g, "&quot;");
}

const KEYWORDS_SET = new Set([
  // Go
  "package", "import", "func", "type", "struct", "interface", "return", "defer", "go",
  "select", "case", "default", "switch", "if", "else", "for", "range", "var", "const",
  "map", "chan", "break", "continue", "fallthrough", "goto",
  // TypeScript / JavaScript / C# / Java / Kotlin / Swift / PHP
  "export", "from", "as", "async", "await", "class", "extends", "implements", "function",
  "try", "catch", "finally", "throw", "new", "typeof", "instanceof", "in", "of", "readonly",
  "private", "protected", "public", "static", "declare", "namespace", "enum", "abstract",
  "final", "override", "virtual", "using", "get", "set", "yield", "delete", "super",
  // Lua & FiveM
  "local", "then", "end", "elseif", "do", "while", "repeat", "until", "not", "and", "or",
  "fx_version", "game", "games", "author", "description", "version", "shared_script",
  "shared_scripts", "client_script", "client_scripts", "server_script", "server_scripts",
  "ui_page", "files", "dependencies", "lua54", "provide",
  // Python / Ruby / Elixir
  "def", "elif", "except", "lambda", "pass", "raise", "with", "global", "nonlocal",
  "module", "begin", "rescue", "ensure", "end", "unless", "defmodule", "defp",
  // Rust / C / C++ / Zig
  "fn", "pub", "impl", "trait", "let", "mut", "match", "use", "mod", "crate", "where",
  "unsafe", "extern", "ref", "move", "sizeof", "typedef", "union", "volatile", "inline",
  "#include", "#define", "#ifdef", "#ifndef", "#endif", "#pragma",
  // SQL
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER", "LIMIT",
  "OFFSET", "HAVING", "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "VIEW", "TRIGGER",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "NOT", "NULL", "DEFAULT",
  "AUTO_INCREMENT", "CASCADE", "DISTINCT", "AS", "AND", "OR", "IN", "EXISTS", "BETWEEN",
  "LIKE", "IS", "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION", "EXISTS",
  // Dockerfile / Makefile / Shell
  "FROM", "RUN", "CMD", "LABEL", "EXPOSE", "ENV", "ADD", "COPY", "ENTRYPOINT",
  "VOLUME", "USER", "WORKDIR", "ARG", "HEALTHCHECK", "echo", "fi", "done", "esac",
]);

const TYPES_AND_LITERALS_SET = new Set([
  // Primitives & Built-in Types
  "string", "int", "int8", "int16", "int32", "int64", "uint", "uint8", "uint16", "uint32", "uint64",
  "float", "double", "float32", "float64", "byte", "rune", "bool", "error", "any", "comparable",
  "void", "never", "unknown", "number", "boolean", "object", "symbol", "bigint", "char", "short", "long",
  "usize", "isize", "u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64", "f32", "f64", "str",
  "VARCHAR", "TEXT", "INT", "INTEGER", "BIGINT", "DECIMAL", "NUMERIC", "BOOLEAN", "TIMESTAMP", "DATETIME", "JSON", "UUID",
  // Standard Globals & Literals
  "Promise", "Record", "Partial", "Required", "Array", "Map", "Set", "HTMLElement", "HTMLInputElement",
  "Context", "Option", "Result", "Some", "None", "Ok", "Err",
  "true", "false", "nil", "null", "undefined", "NaN", "Infinity", "self", "this", "True", "False", "yes", "no",
  // Lua / FiveM Standard Library & Natives
  "pairs", "ipairs", "next", "tonumber", "tostring", "type", "print", "require", "table", "math", "os", "io",
  "Citizen", "CreateThread", "Wait", "SetTimeout", "RegisterNetEvent", "RegisterServerEvent",
  "AddEventHandler", "TriggerEvent", "TriggerServerEvent", "TriggerClientEvent", "SendNUIMessage",
  "SetNuiFocus", "RegisterNUICallback", "RegisterCommand", "exports", "PlayerPedId", "GetEntityCoords",
]);

/* ============================================================================
 * IntelliSense Autocomplete Engine (Catalogs + Document Symbol Extraction)
 * ============================================================================ */

const LANGUAGE_COMPLETION_CATALOGS: Record<string, MatzCompletionItem[]> = {
  go: [
    { label: "func", kind: "snippet", detail: "Declaração de função Go", insertText: "func () {\n\t\n}", cursorBackOffset: 6 },
    { label: "iferr", kind: "snippet", detail: "if err != nil { return err }", insertText: "if err != nil {\n\treturn err\n}" },
    { label: "struct", kind: "snippet", detail: "type Name struct { ... }", insertText: "type Name struct {\n\t\n}", cursorBackOffset: 2 },
    { label: "interface", kind: "snippet", detail: "type Name interface { ... }", insertText: "type Name interface {\n\t\n}", cursorBackOffset: 2 },
    { label: "forr", kind: "snippet", detail: "for i, v := range ...", insertText: "for i, v := range  {\n\t\n}", cursorBackOffset: 5 },
    { label: "switch", kind: "snippet", detail: "switch expr { case ... }", insertText: "switch  {\ncase :\ndefault:\n}", cursorBackOffset: 19 },
    { label: "fmt.Printf", kind: "function", detail: "fmt.Printf(format, a...)", insertText: 'fmt.Printf("%v\\n", )', cursorBackOffset: 1 },
    { label: "fmt.Sprintf", kind: "function", detail: "fmt.Sprintf(format, a...) string", insertText: 'fmt.Sprintf("%v", )', cursorBackOffset: 1 },
    { label: "fmt.Errorf", kind: "function", detail: "fmt.Errorf(format, a...) error", insertText: 'fmt.Errorf("%w", err)', cursorBackOffset: 1 },
    { label: "context.Context", kind: "type", detail: "ctx context.Context", insertText: "ctx context.Context" },
    { label: "json.Marshal", kind: "function", detail: "encoding/json Marshal", insertText: "json.Marshal()", cursorBackOffset: 1 },
    { label: "json.Unmarshal", kind: "function", detail: "encoding/json Unmarshal", insertText: "json.Unmarshal(data, &)", cursorBackOffset: 1 },
    { label: "errors.New", kind: "function", detail: "errors.New(text string) error", insertText: 'errors.New("")', cursorBackOffset: 2 },
    { label: "strings.TrimSpace", kind: "function", detail: "strings.TrimSpace(s string)", insertText: "strings.TrimSpace()", cursorBackOffset: 1 },
    { label: "strings.Contains", kind: "function", detail: "strings.Contains(s, substr)", insertText: "strings.Contains(, )", cursorBackOffset: 3 },
    { label: "strings.Split", kind: "function", detail: "strings.Split(s, sep)", insertText: 'strings.Split(, "")', cursorBackOffset: 5 },
    { label: "os.ReadFile", kind: "function", detail: "os.ReadFile(name string)", insertText: "os.ReadFile()", cursorBackOffset: 1 },
    { label: "os.WriteFile", kind: "function", detail: "os.WriteFile(name, data, 0644)", insertText: "os.WriteFile(, data, 0644)", cursorBackOffset: 13 },
    { label: "sync.Mutex", kind: "type", detail: "sync.Mutex lock", insertText: "sync.Mutex" },
    { label: "sync.WaitGroup", kind: "type", detail: "sync.WaitGroup", insertText: "sync.WaitGroup" },
    { label: "make", kind: "function", detail: "make([]T, 0)", insertText: "make([], 0)", cursorBackOffset: 4 },
    { label: "append", kind: "function", detail: "append(slice, elems...)", insertText: "append(, )", cursorBackOffset: 3 },
    { label: "defer", kind: "keyword", detail: "Adia execução para o fim da função", insertText: "defer " },
    { label: "return", kind: "keyword", detail: "Retorna da função atual", insertText: "return " },
    { label: "package", kind: "keyword", detail: "Declaração de pacote Go", insertText: "package " },
    { label: "import", kind: "keyword", detail: "Bloco de importação Go", insertText: 'import (\n\t""\n)', cursorBackOffset: 3 },
  ],
  typescript: [
    { label: "interface", kind: "snippet", detail: "export interface Name { ... }", insertText: "export interface Name {\n  \n}", cursorBackOffset: 2 },
    { label: "function", kind: "snippet", detail: "export function name() { ... }", insertText: "export function (): void {\n  \n}", cursorBackOffset: 12 },
    { label: "async", kind: "snippet", detail: "async function (): Promise<void>", insertText: "async function (): Promise<void> {\n  \n}", cursorBackOffset: 20 },
    { label: "trycatch", kind: "snippet", detail: "try { ... } catch (err) { ... }", insertText: "try {\n  \n} catch (err) {\n  console.error(err);\n}", cursorBackOffset: 36 },
    { label: "import", kind: "snippet", detail: 'import { } from "";', insertText: 'import {  } from "";', cursorBackOffset: 11 },
    { label: "export", kind: "keyword", detail: "Exporta declaração de módulo", insertText: "export " },
    { label: "const", kind: "keyword", detail: "Declaração de constante imutável", insertText: "const " },
    { label: "let", kind: "keyword", detail: "Declaração de variável de bloco", insertText: "let " },
    { label: "Promise.all", kind: "function", detail: "Promise.all([...])", insertText: "await Promise.all([])", cursorBackOffset: 2 },
    { label: "console.log", kind: "function", detail: "Registra saída no console", insertText: "console.log()", cursorBackOffset: 1 },
    { label: "console.error", kind: "function", detail: "Registra erro no console", insertText: "console.error()", cursorBackOffset: 1 },
    { label: "document.querySelector", kind: "function", detail: "Busca elemento DOM por seletor", insertText: 'document.querySelector<HTMLElement>("")', cursorBackOffset: 2 },
    { label: "document.querySelectorAll", kind: "function", detail: "Lista elementos DOM por seletor", insertText: 'document.querySelectorAll<HTMLElement>("")', cursorBackOffset: 2 },
    { label: "window.addEventListener", kind: "function", detail: "Registra listener global", insertText: 'window.addEventListener("", (e) => {\n  \n});', cursorBackOffset: 17 },
    { label: "localStorage.getItem", kind: "function", detail: "Lê chave do localStorage", insertText: 'localStorage.getItem("")', cursorBackOffset: 2 },
    { label: "localStorage.setItem", kind: "function", detail: "Salva chave no localStorage", insertText: 'localStorage.setItem("", "")', cursorBackOffset: 6 },
    { label: "JSON.stringify", kind: "function", detail: "Serializa objeto para JSON", insertText: "JSON.stringify(, null, 2)", cursorBackOffset: 10 },
    { label: "JSON.parse", kind: "function", detail: "Deserializa string JSON", insertText: "JSON.parse()", cursorBackOffset: 1 },
    { label: "Record", kind: "type", detail: "Record<string, unknown>", insertText: "Record<string, unknown>" },
    { label: "Partial", kind: "type", detail: "Partial<T>", insertText: "Partial<>", cursorBackOffset: 1 },
    { label: "requestAnimationFrame", kind: "function", detail: "Agenda callback no próximo quadro", insertText: "requestAnimationFrame(() => {\n  \n});", cursorBackOffset: 5 },
  ],
  python: [
    { label: "def", kind: "snippet", detail: "def function_name(args):", insertText: "def ():\n    ", cursorBackOffset: 8 },
    { label: "async def", kind: "snippet", detail: "async def function_name(args):", insertText: "async def ():\n    ", cursorBackOffset: 8 },
    { label: "class", kind: "snippet", detail: "class ClassName:", insertText: "class :\n    def __init__(self) -> None:\n        pass", cursorBackOffset: 44 },
    { label: "ifmain", kind: "snippet", detail: 'if __name__ == "__main__":', insertText: 'if __name__ == "__main__":\n    main()' },
    { label: "try", kind: "snippet", detail: "try ... except Exception as exc:", insertText: "try:\n    \nexcept Exception as exc:\n    raise exc", cursorBackOffset: 39 },
    { label: "with", kind: "snippet", detail: 'with open("...", "r", encoding="utf-8") as f:', insertText: 'with open("", "r", encoding="utf-8") as f:\n    ', cursorBackOffset: 36 },
    { label: "isinstance", kind: "function", detail: "isinstance(obj, class_or_tuple)", insertText: "isinstance(, )", cursorBackOffset: 3 },
    { label: "enumerate", kind: "function", detail: "enumerate(iterable, start=0)", insertText: "enumerate()", cursorBackOffset: 1 },
    { label: "dataclass", kind: "snippet", detail: "@dataclass decorator", insertText: "@dataclass\nclass :\n    ", cursorBackOffset: 6 },
    { label: "print", kind: "function", detail: "print(*values)", insertText: "print()", cursorBackOffset: 1 },
  ],
  rust: [
    { label: "fn", kind: "snippet", detail: "pub fn name() -> Result<(), Error>", insertText: "pub fn () -> Result<(), Box<dyn std::error::Error>> {\n    Ok(())\n}", cursorBackOffset: 58 },
    { label: "struct", kind: "snippet", detail: "#[derive(Debug, Clone)] pub struct", insertText: "#[derive(Debug, Clone)]\npub struct  {\n    \n}", cursorBackOffset: 8 },
    { label: "impl", kind: "snippet", detail: "impl Type { ... }", insertText: "impl  {\n    \n}", cursorBackOffset: 8 },
    { label: "match", kind: "snippet", detail: "match expr { ... }", insertText: "match  {\n    _ => {}\n}", cursorBackOffset: 15 },
    { label: "println!", kind: "function", detail: 'println!("{}", val)', insertText: 'println!("{}", );', cursorBackOffset: 2 },
    { label: "format!", kind: "function", detail: 'format!("{}", val)', insertText: 'format!("{}", )', cursorBackOffset: 1 },
    { label: "Result", kind: "type", detail: "Result<T, E>", insertText: "Result<, >", cursorBackOffset: 3 },
    { label: "Option", kind: "type", detail: "Option<T>", insertText: "Option<>", cursorBackOffset: 1 },
  ],
  lua: [
    { label: "local function", kind: "snippet", detail: "local function name(...) ... end", insertText: "local function ()\n  \nend", cursorBackOffset: 8 },
    { label: "function", kind: "snippet", detail: "function name(...) ... end", insertText: "function ()\n  \nend", cursorBackOffset: 8 },
    { label: "if", kind: "snippet", detail: "if cond then ... end", insertText: "if  then\n  \nend", cursorBackOffset: 12 },
    { label: "forpairs", kind: "snippet", detail: "for k, v in pairs(t) do ... end", insertText: "for k, v in pairs() do\n  \nend", cursorBackOffset: 11 },
    { label: "foripairs", kind: "snippet", detail: "for i, v in ipairs(t) do ... end", insertText: "for i, v in ipairs() do\n  \nend", cursorBackOffset: 11 },
    { label: "CreateThread", kind: "function", detail: "Citizen.CreateThread(function() ... end)", insertText: "Citizen.CreateThread(function()\n  \nend)", cursorBackOffset: 5 },
    { label: "RegisterNetEvent", kind: "function", detail: "RegisterNetEvent(eventName, handler)", insertText: 'RegisterNetEvent("", function()\n  \nend)', cursorBackOffset: 20 },
    { label: "TriggerServerEvent", kind: "function", detail: "TriggerServerEvent(eventName, ...)", insertText: 'TriggerServerEvent("")', cursorBackOffset: 2 },
    { label: "TriggerClientEvent", kind: "function", detail: "TriggerClientEvent(eventName, target, ...)", insertText: 'TriggerClientEvent("", -1)', cursorBackOffset: 6 },
    { label: "SendNUIMessage", kind: "function", detail: "SendNUIMessage({ action = ... })", insertText: 'SendNUIMessage({ action = "" })', cursorBackOffset: 4 },
  ],
  sql: [
    { label: "SELECT", kind: "snippet", detail: "SELECT * FROM table WHERE ...", insertText: "SELECT * FROM  WHERE id = ;", cursorBackOffset: 13 },
    { label: "INSERT INTO", kind: "snippet", detail: "INSERT INTO table (...) VALUES (...)", insertText: "INSERT INTO  () VALUES ();", cursorBackOffset: 14 },
    { label: "UPDATE", kind: "snippet", detail: "UPDATE table SET ... WHERE ...", insertText: "UPDATE  SET  WHERE id = ;", cursorBackOffset: 18 },
    { label: "CREATE TABLE", kind: "snippet", detail: "CREATE TABLE IF NOT EXISTS ...", insertText: "CREATE TABLE IF NOT EXISTS  (\n  id INTEGER PRIMARY KEY,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);", cursorBackOffset: 79 },
    { label: "LEFT JOIN", kind: "keyword", detail: "LEFT JOIN table ON ...", insertText: "LEFT JOIN  ON ", cursorBackOffset: 4 },
  ],
  html: [
    { label: "!", kind: "emmet", detail: "Emmet HTML5 Boilerplate", insertText: '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Documento</title>\n</head>\n<body>\n  \n</body>\n</html>', cursorBackOffset: 16 },
    { label: "div", kind: "emmet", detail: '<div class=""></div>', insertText: '<div class=""></div>', cursorBackOffset: 8 },
    { label: "span", kind: "emmet", detail: '<span class=""></span>', insertText: '<span class=""></span>', cursorBackOffset: 9 },
    { label: "button", kind: "emmet", detail: '<button type="button"></button>', insertText: '<button type="button" class=""></button>', cursorBackOffset: 11 },
    { label: "input", kind: "emmet", detail: '<input type="text" />', insertText: '<input type="text" class="" placeholder="" />', cursorBackOffset: 19 },
    { label: "section", kind: "emmet", detail: '<section class=""></section>', insertText: '<section class="">\n  \n</section>', cursorBackOffset: 11 },
    { label: "a", kind: "emmet", detail: '<a href=""></a>', insertText: '<a href=""></a>', cursorBackOffset: 6 },
    { label: "img", kind: "emmet", detail: '<img src="" alt="" />', insertText: '<img src="" alt="" />', cursorBackOffset: 11 },
    { label: "ul>li*3", kind: "emmet", detail: "Lista não ordenada com 3 itens", insertText: "<ul>\n  <li></li>\n  <li></li>\n  <li></li>\n</ul>", cursorBackOffset: 31 },
  ],
  css: [
    { label: "df", kind: "emmet", detail: "display: flex;", insertText: "display: flex;" },
    { label: "dfc", kind: "emmet", detail: "display: flex; align-items: center; justify-content: center;", insertText: "display: flex;\nalign-items: center;\njustify-content: center;" },
    { label: "dfsb", kind: "emmet", detail: "display: flex; align-items: center; justify-content: space-between;", insertText: "display: flex;\nalign-items: center;\njustify-content: space-between;" },
    { label: "dg", kind: "emmet", detail: "display: grid;", insertText: "display: grid;" },
    { label: "display: flex", kind: "property", detail: "Layout Flexbox alinhado", insertText: "display: flex;\nalign-items: center;\ngap: 8px;" },
    { label: "display: grid", kind: "property", detail: "Layout CSS Grid", insertText: "display: grid;\ngrid-template-columns: minmax(0, 1fr);\ngap: 12px;" },
    { label: "background", kind: "property", detail: "background: var(--surface-card);", insertText: "background: var(--surface-card);" },
    { label: "border", kind: "property", detail: "border: 1px solid var(--border);", insertText: "border: 1px solid var(--border);" },
    { label: "color", kind: "property", detail: "color: var(--text-primary);", insertText: "color: var(--text-primary);" },
  ],
};

LANGUAGE_COMPLETION_CATALOGS.javascript = LANGUAGE_COMPLETION_CATALOGS.typescript;
LANGUAGE_COMPLETION_CATALOGS.tsx = LANGUAGE_COMPLETION_CATALOGS.typescript;
LANGUAGE_COMPLETION_CATALOGS.jsx = LANGUAGE_COMPLETION_CATALOGS.typescript;
LANGUAGE_COMPLETION_CATALOGS.scss = LANGUAGE_COMPLETION_CATALOGS.css;

/* ============================================================================
 * Emmet & Smart Abbreviation Engine (HTML / JSX / CSS / JS / TS / Go / Py / Lua)
 * ============================================================================ */

const HTML_KNOWN_TAGS = new Set([
  "div", "span", "p", "a", "button", "input", "form", "label", "select", "option", "textarea",
  "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "section", "article", "header", "footer", "nav", "main", "aside", "figure", "figcaption",
  "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "small", "code", "pre", "blockquote",
  "img", "svg", "path", "canvas", "video", "audio", "iframe", "source",
  "script", "link", "style", "meta", "title", "head", "body", "html",
  "template", "slot", "dialog", "details", "summary", "hr", "br",
]);

const HTML_VOID_TAGS = new Set([
  "input", "img", "br", "hr", "meta", "link", "source", "area", "base", "col", "embed", "param", "track", "wbr",
]);

const HTML_BLOCK_TAGS = new Set([
  "div", "section", "article", "header", "footer", "nav", "main", "aside", "form",
  "ul", "ol", "table", "thead", "tbody", "tfoot", "tr", "select", "dialog", "details", "figure",
]);

const CSS_STATIC_EMMET: Record<string, string> = {
  df: "display: flex;",
  dfc: "display: flex;\nalign-items: center;\njustify-content: center;",
  dfsb: "display: flex;\nalign-items: center;\njustify-content: space-between;",
  dfcol: "display: flex;\nflex-direction: column;",
  dg: "display: grid;",
  db: "display: block;",
  dib: "display: inline-block;",
  dn: "display: none;",
  aic: "align-items: center;",
  "ai:c": "align-items: center;",
  aifs: "align-items: flex-start;",
  "ai:fs": "align-items: flex-start;",
  aife: "align-items: flex-end;",
  "ai:fe": "align-items: flex-end;",
  jcc: "justify-content: center;",
  "jc:c": "justify-content: center;",
  jcsb: "justify-content: space-between;",
  "jc:sb": "justify-content: space-between;",
  jcfe: "justify-content: flex-end;",
  "jc:fe": "justify-content: flex-end;",
  fxdc: "flex-direction: column;",
  "fxd:c": "flex-direction: column;",
  fxdr: "flex-direction: row;",
  "fxd:r": "flex-direction: row;",
  fxw: "flex-wrap: wrap;",
  posr: "position: relative;",
  "pos:r": "position: relative;",
  rel: "position: relative;",
  posa: "position: absolute;",
  "pos:a": "position: absolute;",
  abs: "position: absolute;",
  posf: "position: fixed;",
  "pos:f": "position: fixed;",
  fix: "position: fixed;",
  poss: "position: sticky;",
  "pos:s": "position: sticky;",
  ovh: "overflow: hidden;",
  "ov:h": "overflow: hidden;",
  ova: "overflow: auto;",
  "ov:a": "overflow: auto;",
  cp: "cursor: pointer;",
  "cur:p": "cursor: pointer;",
  usn: "user-select: none;",
  pen: "pointer-events: none;",
  tac: "text-align: center;",
  tal: "text-align: left;",
  tar: "text-align: right;",
  tdn: "text-decoration: none;",
  whs: "white-space: nowrap;",
  nowrap: "white-space: nowrap;",
  bxb: "box-sizing: border-box;",
  bd: "border: 1px solid var(--border);",
  bdn: "border: none;",
  bg: "background: var(--surface-card);",
  bgn: "background: none;",
  c: "color: var(--text-primary);",
  cm: "color: var(--text-muted);",
};

const CSS_NUMERIC_PROP_MAP: Record<string, { prop: string; unitless?: boolean }> = {
  m: { prop: "margin" },
  mt: { prop: "margin-top" },
  mb: { prop: "margin-bottom" },
  ml: { prop: "margin-left" },
  mr: { prop: "margin-right" },
  p: { prop: "padding" },
  pt: { prop: "padding-top" },
  pb: { prop: "padding-bottom" },
  pl: { prop: "padding-left" },
  pr: { prop: "padding-right" },
  w: { prop: "width" },
  h: { prop: "height" },
  maw: { prop: "max-width" },
  miw: { prop: "min-width" },
  mah: { prop: "max-height" },
  mih: { prop: "min-height" },
  fz: { prop: "font-size" },
  fw: { prop: "font-weight", unitless: true },
  lh: { prop: "line-height", unitless: true },
  br: { prop: "border-radius" },
  bdrs: { prop: "border-radius" },
  g: { prop: "gap" },
  gap: { prop: "gap" },
  t: { prop: "top" },
  b: { prop: "bottom" },
  l: { prop: "left" },
  r: { prop: "right" },
  z: { prop: "z-index", unitless: true },
  op: { prop: "opacity", unitless: true },
  fx: { prop: "flex", unitless: true },
  fl: { prop: "flex", unitless: true },
};

const JS_TS_EMMET_SNIPPETS: Record<string, { detail: string; template: string }> = {
  clg: { detail: "console.log(...)", template: "console.log(\0);" },
  log: { detail: "console.log(...)", template: "console.log(\0);" },
  cer: { detail: "console.error(...)", template: "console.error(\0);" },
  cwr: { detail: "console.warn(...)", template: "console.warn(\0);" },
  cti: { detail: "console.time(...)", template: 'console.time("\0");' },
  afn: { detail: "Arrow function () => { ... }", template: "(\0) => {\n  \n}" },
  anfn: { detail: "Arrow function () => { ... }", template: "(\0) => {\n  \n}" },
  afni: { detail: "Inline arrow () => ...", template: "(\0) => " },
  fn: { detail: "function name() { ... }", template: "function \0() {\n  \n}" },
  efn: { detail: "export function name(): void", template: "export function \0(): void {\n  \n}" },
  eafn: { detail: "export async function name(): Promise<void>", template: "export async function \0(): Promise<void> {\n  \n}" },
  imp: { detail: 'import { ... } from "";', template: 'import { \0 } from "";' },
  impd: { detail: 'import Name from "";', template: 'import \0 from "";' },
  exp: { detail: "export const name = ...;", template: "export const \0 = ;" },
  intf: { detail: "export interface Name { ... }", template: "export interface \0 {\n  \n}" },
  forof: { detail: "for (const item of list)", template: "for (const item of \0) {\n  \n}" },
  forin: { detail: "for (const key in obj)", template: "for (const key in \0) {\n  \n}" },
  fori: { detail: "for (let i = 0; i < n; i++)", template: "for (let i = 0; i < \0.length; i++) {\n  \n}" },
  fe: { detail: ".forEach((item) => { ... })", template: ".forEach((item) => {\n  \0\n});" },
  foreach: { detail: ".forEach((item) => { ... })", template: ".forEach((item) => {\n  \0\n});" },
  map: { detail: ".map((item) => ...)", template: ".map((item) => \0)" },
  flt: { detail: ".filter((item) => ...)", template: ".filter((item) => \0)" },
  red: { detail: ".reduce((acc, item) => ...)", template: ".reduce((acc, item) => \0, initial)" },
  ife: { detail: "if (...) { ... } else { ... }", template: "if (\0) {\n  \n} else {\n  \n}" },
  ifelse: { detail: "if (...) { ... } else { ... }", template: "if (\0) {\n  \n} else {\n  \n}" },
  tryc: { detail: "try { ... } catch (err) { ... }", template: "try {\n  \0\n} catch (err) {\n  console.error(err);\n}" },
  tc: { detail: "try { ... } catch (err) { ... }", template: "try {\n  \0\n} catch (err) {\n  console.error(err);\n}" },
  prom: { detail: "new Promise((resolve, reject) => ...)", template: "new Promise((resolve, reject) => {\n  \0\n})" },
  sto: { detail: "setTimeout(() => { ... }, ms)", template: "setTimeout(() => {\n  \0\n}, 100);" },
  sti: { detail: "setInterval(() => { ... }, ms)", template: "setInterval(() => {\n  \0\n}, 1000);" },
  raf: { detail: "requestAnimationFrame(() => { ... })", template: "requestAnimationFrame(() => {\n  \0\n});" },
  qs: { detail: 'document.querySelector<HTMLElement>("")', template: 'document.querySelector<HTMLElement>("\0")' },
  qsa: { detail: 'document.querySelectorAll<HTMLElement>("")', template: 'document.querySelectorAll<HTMLElement>("\0")' },
  ael: { detail: 'addEventListener("", (e) => { ... })', template: 'addEventListener("\0", (e) => {\n  \n});' },
  fetch: { detail: "await fetch(...) + res.json()", template: 'const res = await fetch("\0");\nconst data = await res.json();' },
};

function buildCompletionFromMarkerTemplate(
  label: string,
  detail: string,
  templateWithNullMarker: string,
  replaceLength: number
): MatzCompletionItem {
  const markerIdx = templateWithNullMarker.indexOf("\0");
  if (markerIdx === -1) {
    return {
      label,
      kind: "emmet",
      detail,
      insertText: templateWithNullMarker,
      replaceLength,
    };
  }
  const cleanText = templateWithNullMarker.replace(/\0/g, "");
  const cursorBackOffset = Math.max(0, cleanText.length - markerIdx);
  return {
    label,
    kind: "emmet",
    detail,
    insertText: cleanText,
    cursorBackOffset,
    replaceLength,
  };
}

function splitTopLevelEmmet(expr: string, delimiter: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let bracketDepth = 0;
  let braceDepth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "[") bracketDepth++;
    else if (ch === "]" && bracketDepth > 0) bracketDepth--;
    else if (ch === "{") braceDepth++;
    else if (ch === "}" && braceDepth > 0) braceDepth--;

    if (ch === delimiter && bracketDepth === 0 && braceDepth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.filter((p) => p.length > 0);
}

function expandHtmlEmmetExpression(
  abbr: string,
  useClassName = false
): MatzCompletionItem | null {
  if (abbr === "!" || abbr === "html:5" || abbr === "doc") {
    const html5 =
      '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>\0Documento</title>\n</head>\n<body>\n  \n</body>\n</html>';
    return buildCompletionFromMarkerTemplate(abbr, "Emmet -> HTML5 Boilerplate", html5, abbr.length);
  }

  const classAttrName = useClassName ? "className" : "class";

  const parseSingleSegment = (
    rawSeg: string,
    parentTag: string
  ): {
    tag: string;
    id: string;
    classes: string[];
    attrs: string[];
    text: string;
    repeat: number;
  } | null => {
    let seg = rawSeg.trim();
    if (!seg) return null;

    // Extract *N multiplication at end
    let repeat = 1;
    const multMatch = seg.match(/\*(\d+)$/);
    if (multMatch) {
      repeat = Math.max(1, Math.min(20, Number(multMatch[1])));
      seg = seg.slice(0, seg.length - multMatch[0].length);
    }

    // Extract {text}
    let text = "";
    const textMatch = seg.match(/\{([^}]*)\}/);
    if (textMatch) {
      text = textMatch[1];
      seg = seg.replace(textMatch[0], "");
    }

    // Extract [attrs]
    const attrs: string[] = [];
    const attrRegex = /\[([^\]]+)\]/g;
    let aMatch: RegExpExecArray | null;
    while ((aMatch = attrRegex.exec(seg)) !== null) {
      attrs.push(aMatch[1].trim());
    }
    seg = seg.replace(/\[[^\]]*\]/g, "");

    // Shorthand aliases
    if (seg === "btn" || seg.startsWith("btn.") || seg.startsWith("btn#")) {
      seg = "button" + seg.slice(3);
      attrs.unshift('type="button"');
    } else if (seg === "inp" || seg === "input:t" || seg === "input:text" || seg.startsWith("inp.")) {
      seg = "input" + seg.slice(seg.startsWith("inp") ? 3 : seg.length);
      attrs.unshift('type="text"');
    } else if (seg === "input:p" || seg === "input:password") {
      seg = "input";
      attrs.unshift('type="password"');
    } else if (seg === "input:c" || seg === "input:checkbox") {
      seg = "input";
      attrs.unshift('type="checkbox"');
    } else if (seg === "input:r" || seg === "input:radio") {
      seg = "input";
      attrs.unshift('type="radio"');
    } else if (seg === "a:link") {
      seg = "a";
      attrs.unshift('href="\0"');
    } else if (seg === "link:css") {
      seg = "link";
      attrs.unshift('rel="stylesheet" href="\0style.css"');
    } else if (seg === "script:src") {
      seg = "script";
      attrs.unshift('src="\0"');
    }

    // Extract tag name, #id, .classes
    const tagMatch = seg.match(/^[A-Za-z][A-Za-z0-9-]*/);
    let tag = tagMatch ? tagMatch[0].toLowerCase() : "";
    const rest = tagMatch ? seg.slice(tagMatch[0].length) : seg;

    if (!tag) {
      if (parentTag === "ul" || parentTag === "ol") tag = "li";
      else if (parentTag === "table" || parentTag === "thead" || parentTag === "tbody") tag = "tr";
      else if (parentTag === "tr") tag = "td";
      else if (parentTag === "select") tag = "option";
      else tag = "div";
    }

    let id = "";
    const classes: string[] = [];
    const modRegex = /([.#])([A-Za-z0-9_$-]+)/g;
    let mMatch: RegExpExecArray | null;
    while ((mMatch = modRegex.exec(rest)) !== null) {
      if (mMatch[1] === "#") id = mMatch[2];
      else classes.push(mMatch[2]);
    }

    if (rest.length > 0 && !id && classes.length === 0) {
      return null;
    }

    // Default helpful attributes for bare tags
    if (tag === "a" && attrs.length === 0) {
      attrs.push('href="\0"');
    } else if (tag === "img" && attrs.length === 0) {
      attrs.push('src="\0" alt=""');
    } else if (tag === "input" && attrs.length === 0) {
      attrs.push('type="text"');
    } else if (tag === "button" && attrs.length === 0) {
      attrs.push('type="button"');
    }

    return { tag, id, classes, attrs, text, repeat };
  };

  const chainLevels = splitTopLevelEmmet(abbr, ">");
  if (chainLevels.length === 0) return null;

  const renderLevel = (levelIdx: number, parentTag: string, indentDepth: number): string | null => {
    const levelExpr = chainLevels[levelIdx];
    const siblings = splitTopLevelEmmet(levelExpr, "+");
    if (siblings.length === 0) return null;

    const renderedItems: string[] = [];
    const indent = "  ".repeat(indentDepth);

    for (const sibExpr of siblings) {
      const node = parseSingleSegment(sibExpr, parentTag);
      if (!node) return null;

      for (let r = 1; r <= node.repeat; r++) {
        const replaceNumbering = (s: string) => s.replace(/\$/g, String(r));
        const idAttr = node.id ? ` id="${replaceNumbering(node.id)}"` : "";
        const clsAttr =
          node.classes.length > 0
            ? ` ${classAttrName}="${node.classes.map(replaceNumbering).join(" ")}"`
            : "";
        const extraAttrs = node.attrs.length > 0 ? " " + node.attrs.map(replaceNumbering).join(" ") : "";

        if (HTML_VOID_TAGS.has(node.tag)) {
          const voidStr = `${indent}<${node.tag}${idAttr}${clsAttr}${extraAttrs} />`;
          renderedItems.push(voidStr);
          continue;
        }

        if (levelIdx + 1 < chainLevels.length) {
          const childrenHtml = renderLevel(levelIdx + 1, node.tag, indentDepth + 1);
          if (childrenHtml === null) return null;
          renderedItems.push(
            `${indent}<${node.tag}${idAttr}${clsAttr}${extraAttrs}>\n${childrenHtml}\n${indent}</${node.tag}>`
          );
        } else {
          const innerText = node.text ? replaceNumbering(node.text) : "\0";
          if (HTML_BLOCK_TAGS.has(node.tag) && !node.text && chainLevels.length === 1 && node.repeat === 1 && siblings.length === 1 && !node.id && node.classes.length === 0) {
            renderedItems.push(`${indent}<${node.tag}${idAttr}${clsAttr}${extraAttrs}>\n${indent}  ${innerText}\n${indent}</${node.tag}>`);
          } else {
            renderedItems.push(`${indent}<${node.tag}${idAttr}${clsAttr}${extraAttrs}>${innerText}</${node.tag}>`);
          }
        }
      }
    }

    return renderedItems.join("\n");
  };

  const expanded = renderLevel(0, "", 0);
  if (!expanded) return null;

  // Keep only the FIRST \0 cursor marker so cursor lands in the first editable slot
  let seenFirstNull = false;
  const normalized = expanded.replace(/\0/g, () => {
    if (!seenFirstNull) {
      seenFirstNull = true;
      return "\0";
    }
    return "";
  });

  const previewSingleLine = normalized.replace(/\0/g, "").replace(/\s+/g, " ").slice(0, 52);
  return buildCompletionFromMarkerTemplate(
    abbr,
    `Emmet -> ${previewSingleLine}`,
    normalized,
    abbr.length
  );
}

function expandCssEmmetExpression(abbr: string, inlineStyle = false): MatzCompletionItem | null {
  const lower = abbr.toLowerCase();
  if (CSS_STATIC_EMMET[lower]) {
    let cssOut = CSS_STATIC_EMMET[lower];
    if (inlineStyle) {
      cssOut = cssOut.replace(/\n/g, " ");
    }
    return buildCompletionFromMarkerTemplate(
      abbr,
      `Emmet CSS -> ${cssOut.replace(/\n/g, " ")}`,
      cssOut + "\0",
      abbr.length
    );
  }

  const numMatch = lower.match(/^([a-z]+)(-?\d+(?:\.\d+)?)(p|%|vh|vw|rem|em|px|s|ms|deg|fr)?$/);
  if (numMatch) {
    const [, propKey, numVal, rawUnit] = numMatch;
    const spec = CSS_NUMERIC_PROP_MAP[propKey];
    if (!spec) return null;
    let unit = "";
    if (!spec.unitless && numVal !== "0") {
      if (rawUnit === "p" || rawUnit === "%") unit = "%";
      else if (rawUnit) unit = rawUnit;
      else unit = "px";
    }
    const cssOut = `${spec.prop}: ${numVal}${unit};`;
    return buildCompletionFromMarkerTemplate(
      abbr,
      `Emmet CSS -> ${cssOut}`,
      cssOut + "\0",
      abbr.length
    );
  }

  return null;
}

function detectEmmetSubContext(
  code: string,
  cursorOffset: number,
  language: string
): "html" | "jsx" | "css" | "css-inline" | "ts" | "other" {
  const lang = (language || "plaintext").toLowerCase();
  const before = code.slice(0, cursorOffset);
  const lineStart = before.lastIndexOf("\n") + 1;
  const lineBefore = before.slice(lineStart);

  // Check if cursor is inside an inline style="..." attribute on the current line
  if (/style\s*=\s*["'][^"']*$/.test(lineBefore)) {
    return "css-inline";
  }

  if (lang === "css" || lang === "scss" || lang === "less") {
    return "css";
  }

  if (lang === "html" || lang === "xml" || lang === "svg") {
    const lastStyleOpen = before.lastIndexOf("<style");
    const lastStyleClose = before.lastIndexOf("</style>");
    if (lastStyleOpen !== -1 && lastStyleOpen > lastStyleClose) {
      return "css";
    }
    return "html";
  }

  if (lang === "tsx" || lang === "jsx") {
    return "jsx";
  }

  if (lang === "typescript" || lang === "javascript") {
    // Check via stack if cursorOffset is inside a template literal (`...`) outside ${...}
    type CtxMode = { type: "template" } | { type: "expr"; braceDepth: number };
    const stack: CtxMode[] = [];
    let i = 0;
    while (i < cursorOffset) {
      const ch = code[i];
      const next = code[i + 1] || "";
      const top = stack[stack.length - 1];
      if (top && top.type === "template") {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === "$" && next === "{") {
          stack.push({ type: "expr", braceDepth: 0 });
          i += 2;
          continue;
        }
        if (ch === "`") {
          stack.pop();
          i++;
          continue;
        }
        i++;
        continue;
      }
      if (ch === "/" && next === "/") {
        const nl = code.indexOf("\n", i + 2);
        i = nl === -1 ? cursorOffset : nl + 1;
        continue;
      }
      if (ch === "/" && next === "*") {
        const endC = code.indexOf("*/", i + 2);
        i = endC === -1 ? cursorOffset : endC + 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        const q = ch;
        i++;
        while (i < cursorOffset && code[i] !== "\n") {
          if (code[i] === "\\") {
            i += 2;
            continue;
          }
          if (code[i] === q) {
            i++;
            break;
          }
          i++;
        }
        continue;
      }
      if (ch === "`") {
        stack.push({ type: "template" });
        i++;
        continue;
      }
      if (top && top.type === "expr") {
        if (ch === "{") top.braceDepth++;
        else if (ch === "}") {
          if (top.braceDepth === 0) {
            stack.pop();
            i++;
            continue;
          }
          top.braceDepth--;
        }
      }
      i++;
    }
    const activeTop = stack[stack.length - 1];
    if (activeTop && activeTop.type === "template") {
      return "html";
    }
    return "ts";
  }

  return "other";
}

export function expandMatzEmmet(
  code: string,
  cursorOffset: number,
  language: string
): MatzCompletionItem | null {
  const before = code.slice(0, cursorOffset);
  const lineStart = before.lastIndexOf("\n") + 1;
  const lineBefore = before.slice(lineStart);
  if (!lineBefore.trim()) return null;

  const subCtx = detectEmmetSubContext(code, cursorOffset, language);

  // 1. CSS / SCSS / inline style="..." context
  if (subCtx === "css" || subCtx === "css-inline") {
    const cssMatch = lineBefore.match(/(?:^|[\s;{("'])([A-Za-z][A-Za-z0-9:.-]*)$/);
    if (cssMatch) {
      const exp = expandCssEmmetExpression(cssMatch[1], subCtx === "css-inline");
      if (exp) return exp;
    }
    return null;
  }

  // 2. HTML / Embedded Template String HTML context
  if (subCtx === "html") {
    const htmlMatch = lineBefore.match(
      /(?:^|[\s(`"'>])([!]|[A-Za-z][A-Za-z0-9:-]*(?:[.#>+*\[{][^\s`"']*)?|[.#][A-Za-z_][A-Za-z0-9_-]*(?:[.#>+*\[{][^\s`"']*)?)$/
    );
    if (htmlMatch) {
      const candidate = htmlMatch[1];
      const hasComplexOp = /[.#>+*\[{:]/.test(candidate);
      if (candidate === "!" || hasComplexOp || HTML_KNOWN_TAGS.has(candidate.toLowerCase()) || candidate === "btn" || candidate === "inp" || candidate === "doc") {
        const exp = expandHtmlEmmetExpression(candidate, false);
        if (exp) return exp;
      }
    }
    return null;
  }

  // 3. JS / TS / JSX / TSX context
  if (subCtx === "ts" || subCtx === "jsx") {
    // Check fast JS/TS Emmet triggers first (e.g. clg, afn, efn, imp, forof, tryc, prom, qs)
    const jsWordMatch = lineBefore.match(/(?:^|[\s({[=;:,!])([A-Za-z_][A-Za-z0-9_]*)$/);
    if (jsWordMatch) {
      const word = jsWordMatch[1];
      const jsSnippet = JS_TS_EMMET_SNIPPETS[word];
      if (jsSnippet) {
        return buildCompletionFromMarkerTemplate(
          word,
          `Emmet JS/TS -> ${jsSnippet.detail}`,
          jsSnippet.template,
          word.length
        );
      }
      // In JSX/TSX, bare known HTML tags (div, span, button, input, section, etc.) also expand
      if (subCtx === "jsx" && (HTML_KNOWN_TAGS.has(word) || word === "btn" || word === "inp")) {
        const exp = expandHtmlEmmetExpression(word, true);
        if (exp) return exp;
      }
    }

    // Check structural HTML/JSX Emmet expressions (e.g. div.matz-card>span, ul>li*3, button.btn{Salvar})
    // Only when root tag is a known HTML tag or starts with .class / #id so normal JS obj.prop is untouched!
    const jsxStructMatch = lineBefore.match(
      /(?:^|[\s(`"'>=])([A-Za-z][A-Za-z0-9-]*[.#>+*\[{][^\s`"']*|[.#][A-Za-z_][A-Za-z0-9_-]*(?:[.#>+*\[{][^\s`"']*)?)$/
    );
    if (jsxStructMatch) {
      const candidate = jsxStructMatch[1];
      const rootTagMatch = candidate.match(/^[A-Za-z][A-Za-z0-9-]*/);
      const rootTag = rootTagMatch ? rootTagMatch[0].toLowerCase() : "";
      if (!rootTag || HTML_KNOWN_TAGS.has(rootTag) || rootTag === "btn" || rootTag === "inp") {
        const exp = expandHtmlEmmetExpression(candidate, subCtx === "jsx");
        if (exp) return exp;
      }
    }
  }

  // 4. Other languages (Go, Python, Lua, Rust): check catalog snippet exact label match for fast Tab expansion
  const lang = (language || "plaintext").toLowerCase();
  const catalog = LANGUAGE_COMPLETION_CATALOGS[lang] || [];
  const wordMatch = lineBefore.match(/(?:^|[\s({[=;:,])([A-Za-z_][A-Za-z0-9_!.]*)$/);
  if (wordMatch) {
    const token = wordMatch[1];
    const exactCatalogSnippet = catalog.find(
      (item) => item.label === token && (item.kind === "snippet" || item.kind === "emmet" || item.kind === "function")
    );
    if (exactCatalogSnippet) {
      return {
        ...exactCatalogSnippet,
        replaceLength: token.length,
      };
    }
  }

  return null;
}

export function getMatzCompletions(
  code: string,
  cursorOffset: number,
  language: string,
  forceTrigger = false
): { prefix: string; items: MatzCompletionItem[] } {
  const before = code.slice(0, cursorOffset);
  const match = before.match(/[A-Za-z_!][A-Za-z0-9_.:>#*+\[\]{}$-]*$/);
  const rawToken = match ? match[0] : "";

  const wordMatch = before.match(/[A-Za-z_][A-Za-z0-9_.]*$/);
  const prefix = wordMatch ? wordMatch[0] : rawToken;

  const emmetExpansion = expandMatzEmmet(code, cursorOffset, language);

  if (!forceTrigger && prefix.length < 2 && !emmetExpansion) {
    return { prefix: "", items: [] };
  }

  const lang = (language || "plaintext").toLowerCase();
  const lowerPrefix = prefix.toLowerCase();
  const seen = new Set<string>();
  const results: MatzCompletionItem[] = [];

  if (emmetExpansion) {
    seen.add(emmetExpansion.label);
    results.push(emmetExpansion);
  }

  // Include matching JS/TS Emmet shorthands when in TS/JS/JSX/TSX
  const isTsJs = lang === "typescript" || lang === "javascript" || lang === "tsx" || lang === "jsx";
  if (isTsJs && prefix.length >= 2) {
    for (const [abbr, spec] of Object.entries(JS_TS_EMMET_SNIPPETS)) {
      if (seen.has(abbr)) continue;
      if (abbr.startsWith(lowerPrefix)) {
        seen.add(abbr);
        results.push(
          buildCompletionFromMarkerTemplate(abbr, `Emmet -> ${spec.detail}`, spec.template, prefix.length)
        );
      }
    }
  }

  const catalog = LANGUAGE_COMPLETION_CATALOGS[lang] || [];
  for (const item of catalog) {
    if (!prefix || item.label.toLowerCase().includes(lowerPrefix)) {
      if (seen.has(item.label)) continue;
      seen.add(item.label);
      results.push({ ...item, replaceLength: prefix.length });
    }
  }

  // Extract live document symbols (functions, types, variables)
  const wordRegex = /\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g;
  let wMatch: RegExpExecArray | null;
  while ((wMatch = wordRegex.exec(code)) !== null) {
    const word = wMatch[0];
    if (word === prefix || seen.has(word)) continue;
    if (!prefix || word.toLowerCase().startsWith(lowerPrefix)) {
      seen.add(word);
      const isKw = KEYWORDS_SET.has(word);
      const isTp = TYPES_AND_LITERALS_SET.has(word);
      results.push({
        label: word,
        kind: isKw ? "keyword" : isTp ? "type" : "variable",
        detail: isKw ? "keyword" : isTp ? "type" : "document symbol",
        insertText: word,
        replaceLength: prefix.length,
      });
      if (results.length >= 28) break;
    }
  }

  // Also include matching language keywords if not yet added
  if (results.length < 18 && prefix.length >= 2) {
    for (const kw of KEYWORDS_SET) {
      if (seen.has(kw)) continue;
      if (kw.toLowerCase().startsWith(lowerPrefix)) {
        seen.add(kw);
        results.push({
          label: kw,
          kind: "keyword",
          detail: "keyword",
          insertText: kw,
          replaceLength: prefix.length,
        });
        if (results.length >= 24) break;
      }
    }
  }

  // Keep active Emmet expansion at the very top (index 0), then sort exact prefix matches
  results.sort((a, b) => {
    if (emmetExpansion) {
      if (a === emmetExpansion) return -1;
      if (b === emmetExpansion) return 1;
    }
    const aEmmet = a.kind === "emmet" || a.kind === "snippet" ? 0 : 1;
    const bEmmet = b.kind === "emmet" || b.kind === "snippet" ? 0 : 1;
    const aStarts = a.label.toLowerCase().startsWith(lowerPrefix) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(lowerPrefix) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    if (aEmmet !== bEmmet) return aEmmet - bEmmet;
    return a.label.localeCompare(b.label);
  });

  return { prefix: emmetExpansion ? emmetExpansion.label : prefix, items: results.slice(0, 14) };
}

/* ============================================================================
 * Real-Time Static Linter & Structural Diagnostics Engine
 * ============================================================================ */

export function lintMatzCode(code: string, language: string): MatzDiagnosticItem[] {
  const diags: MatzDiagnosticItem[] = [];
  if (!code || !code.trim()) return diags;

  const lang = (language || "plaintext").toLowerCase();
  if (lang === "plaintext" || lang === "markdown" || lang === "text" || lang === "log") {
    return diags;
  }

  const lines = code.split("\n");

  // 1. Check unresolved Git merge conflict markers across all code files
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^(<{7}|={7}|>{7})(\s|$)/.test(ln)) {
      diags.push({
        line: i + 1,
        column: 1,
        severity: "error",
        message: "Marcador de conflito de merge Git não resolvido",
        source: "git-lint",
        code: "MERGE_CONFLICT",
      });
    }
  }

  // 2. JSON strict validation
  if (lang === "json") {
    try {
      JSON.parse(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      let line = 1;
      let col = 1;
      const posMatch = msg.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = Math.min(code.length, Number(posMatch[1]));
        const slice = code.slice(0, pos).split("\n");
        line = slice.length;
        col = slice[slice.length - 1].length + 1;
      }
      diags.push({
        line,
        column: col,
        severity: "error",
        message: `Erro de sintaxe JSON: ${msg}`,
        source: "json-linter",
        code: "JSON_SYNTAX",
      });
    }
    return diags;
  }

  // 3. Pushdown Automaton (Stack-Based) Lexical & Structural Scanner
  // Supports nested Template Literals (`... ${ `...` } ...`), Regex Literals (/.../g),
  // Multi-line Strings (Python """/''', Go `...`, Lua [[...]], Rust/SQL), and Comments.
  const checkBracketBalance = new Set([
    "go", "typescript", "javascript", "tsx", "jsx", "python", "rust",
    "c", "cpp", "csharp", "java", "kotlin", "swift", "php", "css", "scss", "sql", "lua",
  ]).has(lang);

  const isTsJs = lang === "typescript" || lang === "javascript" || lang === "tsx" || lang === "jsx";
  const codeLinesMask = new Array<boolean>(lines.length).fill(true);

  if (checkBracketBalance) {
    interface OpenBracket {
      ch: string;
      expected: string;
      line: number;
      col: number;
    }
    type LexMode =
      | { type: "template"; startLine: number }
      | { type: "template-expr"; braceDepth: number; startLine: number }
      | { type: "multiline-quote"; quote: string; startLine: number };

    const stack: OpenBracket[] = [];
    const modeStack: LexMode[] = [];
    const pairs: Record<string, string> = { "{": "}", "(": ")", "[": "]" };
    const closers: Record<string, string> = { "}": "{", ")": "(", "]": "[" };

    let inBlockComment = false;
    let prevSigChar = "";

    const canStartRegexAt = (lineStr: string, col: number, prevChar: string): boolean => {
      const prefix = lineStr.slice(0, col).trimEnd();
      if (!prefix) {
        if (!prevChar) return true;
        return "({[=:;,!&|?+-*%~^<>".includes(prevChar);
      }
      const lastCh = prefix[prefix.length - 1];
      if ("({[=:;,!&|?+-*%~^<>".includes(lastCh)) return true;
      return /\b(?:return|case|throw|typeof|void|delete|in|of|await|yield|new|else|do)$/.test(prefix);
    };

    for (let lnIdx = 0; lnIdx < lines.length; lnIdx++) {
      const lineStr = lines[lnIdx];
      let col = 0;

      const topModeAtLineStart = modeStack[modeStack.length - 1];
      if (
        inBlockComment ||
        (topModeAtLineStart && (topModeAtLineStart.type === "template" || topModeAtLineStart.type === "multiline-quote"))
      ) {
        codeLinesMask[lnIdx] = false;
      }

      while (col < lineStr.length) {
        const ch = lineStr[col];
        const next = lineStr[col + 1] || "";

        // 3a. Inside Block Comment
        if (inBlockComment) {
          if (lang === "lua") {
            if (ch === "]" && next === "]") {
              inBlockComment = false;
              col += 2;
              continue;
            }
          } else if (ch === "*" && next === "/") {
            inBlockComment = false;
            col += 2;
            continue;
          }
          col++;
          continue;
        }

        const topMode = modeStack[modeStack.length - 1];

        // 3b. Inside Multi-line Quote (Go raw `...`, Python """/''', Lua [[...]], Rust/SQL)
        if (topMode && topMode.type === "multiline-quote") {
          if (ch === "\\" && topMode.quote !== "`" && topMode.quote !== "]]") {
            col += 2;
            continue;
          }
          if (topMode.quote.length > 1) {
            if (lineStr.slice(col, col + topMode.quote.length) === topMode.quote) {
              modeStack.pop();
              prevSigChar = '"';
              col += topMode.quote.length;
              continue;
            }
          } else if (ch === topMode.quote) {
            modeStack.pop();
            prevSigChar = '"';
            col++;
            continue;
          }
          col++;
          continue;
        }

        // 3c. Inside TS/JS Template Literal (`... ${ expr } ...`)
        if (topMode && topMode.type === "template") {
          if (ch === "\\") {
            col += 2;
            continue;
          }
          if (ch === "$" && next === "{") {
            modeStack.push({
              type: "template-expr",
              braceDepth: 0,
              startLine: lnIdx + 1,
            });
            prevSigChar = "{";
            col += 2;
            continue;
          }
          if (ch === "`") {
            modeStack.pop();
            prevSigChar = "`";
            col++;
            continue;
          }
          col++;
          continue;
        }

        // 3d. Normal CODE Mode (or inside ${ ... } template-expr)
        // Line comments
        if (ch === "/" && next === "/" && lang !== "python" && lang !== "sql" && lang !== "lua") {
          break;
        }
        if (ch === "-" && next === "-" && (lang === "lua" || lang === "sql")) {
          if (lang === "lua" && lineStr.slice(col, col + 4) === "--[[") {
            inBlockComment = true;
            col += 4;
            continue;
          }
          break;
        }
        if (ch === "#" && (lang === "python" || lang === "shell" || lang === "yaml")) {
          break;
        }

        // Block comments
        if (ch === "/" && next === "*" && lang !== "python" && lang !== "lua") {
          inBlockComment = true;
          col += 2;
          continue;
        }

        // TS/JS Regular Expression Literal (/pattern/flags)
        if (isTsJs && ch === "/" && next !== "/" && next !== "*" && canStartRegexAt(lineStr, col, prevSigChar)) {
          let regCol = col + 1;
          let inCharClass = false;
          let closedRegex = false;
          while (regCol < lineStr.length) {
            const rc = lineStr[regCol];
            if (rc === "\\") {
              regCol += 2;
              continue;
            }
            if (rc === "[") {
              inCharClass = true;
            } else if (rc === "]") {
              inCharClass = false;
            } else if (rc === "/" && !inCharClass) {
              closedRegex = true;
              regCol++;
              while (regCol < lineStr.length && /[A-Za-z]/.test(lineStr[regCol])) {
                regCol++;
              }
              break;
            }
            regCol++;
          }
          if (closedRegex) {
            prevSigChar = "/";
            col = regCol;
            continue;
          }
        }

        // Python triple quotes
        if (lang === "python" && (lineStr.slice(col, col + 3) === '"""' || lineStr.slice(col, col + 3) === "'''")) {
          modeStack.push({
            type: "multiline-quote",
            quote: lineStr.slice(col, col + 3),
            startLine: lnIdx + 1,
          });
          col += 3;
          continue;
        }

        // Lua multiline strings [[ ... ]]
        if (lang === "lua" && ch === "[" && next === "[") {
          modeStack.push({
            type: "multiline-quote",
            quote: "]]",
            startLine: lnIdx + 1,
          });
          col += 2;
          continue;
        }

        // Backtick strings: TS/JS template literal with ${} vs Go raw string
        if (ch === "`") {
          if (isTsJs) {
            modeStack.push({
              type: "template",
              startLine: lnIdx + 1,
            });
            col++;
            continue;
          }
          if (lang === "go") {
            modeStack.push({
              type: "multiline-quote",
              quote: "`",
              startLine: lnIdx + 1,
            });
            col++;
            continue;
          }
        }

        // Single-line (or Rust/SQL multiline) string literal
        if (ch === '"' || ch === "'") {
          if (lang === "rust" && ch === "'") {
            const lifeMatch = lineStr.slice(col).match(/^'[A-Za-z_][A-Za-z0-9_]*(?!')/);
            if (lifeMatch) {
              col += lifeMatch[0].length;
              prevSigChar = "a";
              continue;
            }
          }
          if ((lang === "sql" || lang === "rust") && (ch === "'" || ch === '"')) {
            modeStack.push({
              type: "multiline-quote",
              quote: ch,
              startLine: lnIdx + 1,
            });
            col++;
            continue;
          }
          const quote = ch;
          const quoteStartCol = col + 1;
          col++;
          let closed = false;
          while (col < lineStr.length) {
            if (lineStr[col] === "\\") {
              col += 2;
              continue;
            }
            if (lineStr[col] === quote) {
              closed = true;
              col++;
              break;
            }
            col++;
          }
          if (!closed) {
            diags.push({
              line: lnIdx + 1,
              column: quoteStartCol,
              severity: "error",
              message: `Literal de string (${quote}) não fechado nesta linha`,
              source: `${lang}-linter`,
              code: "UNCLOSED_STRING",
            });
          }
          prevSigChar = '"';
          continue;
        }

        // Template expression closing '}'
        if (ch === "}" && topMode && topMode.type === "template-expr" && topMode.braceDepth === 0) {
          modeStack.pop();
          col++;
          continue;
        }

        // Brackets & Braces
        if (pairs[ch]) {
          if (ch === "{" && topMode && topMode.type === "template-expr") {
            topMode.braceDepth++;
          }
          stack.push({
            ch,
            expected: pairs[ch],
            line: lnIdx + 1,
            col: col + 1,
          });
          prevSigChar = ch;
        } else if (closers[ch]) {
          if (ch === "}" && topMode && topMode.type === "template-expr" && topMode.braceDepth > 0) {
            topMode.braceDepth--;
          }
          const last = stack.pop();
          if (!last) {
            diags.push({
              line: lnIdx + 1,
              column: col + 1,
              severity: "error",
              message: `Delimitador de fechamento inesperado '${ch}' sem abertura correspondente`,
              source: `${lang}-linter`,
              code: "UNMATCHED_CLOSER",
            });
          } else if (last.expected !== ch) {
            diags.push({
              line: lnIdx + 1,
              column: col + 1,
              severity: "error",
              message: `Esperado '${last.expected}' (aberto na linha ${last.line}), mas encontrado '${ch}'`,
              source: `${lang}-linter`,
              code: "MISMATCHED_BRACKET",
            });
          }
          prevSigChar = ch;
        } else if (!/\s/.test(ch)) {
          prevSigChar = ch;
        }

        col++;
      }
    }

    for (const unclosedMode of modeStack.slice(-2)) {
      if (unclosedMode.type === "template") {
        diags.push({
          line: unclosedMode.startLine,
          column: 1,
          severity: "error",
          message: `Template literal (\`) iniciado na linha ${unclosedMode.startLine} não foi fechado`,
          source: `${lang}-linter`,
          code: "UNCLOSED_MULTILINE_STRING",
        });
      } else if (unclosedMode.type === "template-expr") {
        diags.push({
          line: unclosedMode.startLine,
          column: 1,
          severity: "error",
          message: `Expressão de interpolação (\${...}) iniciada na linha ${unclosedMode.startLine} não foi fechada com '}'`,
          source: `${lang}-linter`,
          code: "UNCLOSED_TEMPLATE_EXPR",
        });
      } else if (unclosedMode.type === "multiline-quote") {
        diags.push({
          line: unclosedMode.startLine,
          column: 1,
          severity: "error",
          message: `Literal de string multilinha (${unclosedMode.quote}) iniciado na linha ${unclosedMode.startLine} não foi fechado`,
          source: `${lang}-linter`,
          code: "UNCLOSED_MULTILINE_STRING",
        });
      }
    }

    for (const unclosed of stack.slice(-4)) {
      diags.push({
        line: unclosed.line,
        column: unclosed.col,
        severity: "error",
        message: `Delimitador '${unclosed.ch}' aberto na linha ${unclosed.line}, col ${unclosed.col} não foi fechado com '${unclosed.expected}'`,
        source: `${lang}-linter`,
        code: "UNCLOSED_BRACKET",
      });
    }
  }

  // 4. Language-specific semantic/style rules
  if (lang === "go") {
    let hasPackage = false;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;
      if (/^package\s+[A-Za-z_][A-Za-z0-9_]*\b/.test(trimmed)) {
        hasPackage = true;
      }
      break;
    }
    if (!hasPackage) {
      diags.push({
        line: 1,
        column: 1,
        severity: "error",
        message: "Arquivo Go deve iniciar com a declaração 'package <nome>'",
        source: "go-linter",
        code: "GO_MISSING_PACKAGE",
      });
    }
  } else if (isTsJs) {
    for (let i = 0; i < lines.length; i++) {
      if (!codeLinesMask[i]) continue;
      const ln = lines[i];
      const trimmed = ln.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
      if (/^\s*debugger\b/.test(ln)) {
        diags.push({
          line: i + 1,
          column: ln.indexOf("debugger") + 1,
          severity: "warning",
          message: "Instrução 'debugger' ativa no código",
          source: "ts-linter",
          code: "NO_DEBUGGER",
        });
      }
      if (/^\s*var\s+[A-Za-z_$]/.test(ln)) {
        diags.push({
          line: i + 1,
          column: ln.indexOf("var") + 1,
          severity: "warning",
          message: "Prefira 'const' ou 'let' com escopo de bloco em vez de 'var'",
          source: "ts-linter",
          code: "NO_VAR",
        });
      }
    }
  } else if (lang === "python") {
    for (let i = 0; i < lines.length; i++) {
      if (!codeLinesMask[i]) continue;
      const ln = lines[i];
      const indent = ln.match(/^[ \t]+/)?.[0] || "";
      if (indent.includes(" ") && indent.includes("\t")) {
        diags.push({
          line: i + 1,
          column: 1,
          severity: "error",
          message: "TabError: mistura de tabulações e espaços na indentação Python",
          source: "py-linter",
          code: "MIXED_INDENT",
        });
      }
      const trimmed = ln.replace(/#.*$/, "").trim();
      if (/^(else|finally|try)\s*[^:]+$/.test(trimmed)) {
        diags.push({
          line: i + 1,
          column: ln.length,
          severity: "error",
          message: "Sintaxe Python inválida: esperado ':' após declaração de bloco",
          source: "py-linter",
          code: "MISSING_COLON",
        });
      }
    }
  } else if (lang === "lua") {
    for (let i = 0; i < lines.length; i++) {
      if (!codeLinesMask[i]) continue;
      const ln = lines[i].replace(/--.*$/, "");
      const bangEq = ln.indexOf("!=");
      if (bangEq !== -1) {
        diags.push({
          line: i + 1,
          column: bangEq + 1,
          severity: "error",
          message: "Operador '!=' inválido em Lua: utilize '~=' para comparação de diferença",
          source: "lua-linter",
          code: "LUA_NOT_EQUAL",
        });
      }
    }
  }

  return diags;
}

const FLAT_TOKEN_REGEX =
  /(--\[\[[\s\S]*?\]\]|\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b|#[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*\b|<\/?[A-Za-z][A-Za-z0-9-]*)/g;

const EMBEDDED_HTML_IN_TEMPLATE_REGEX =
  /(<\/?[A-Za-z][A-Za-z0-9-]*|\/>|>|\b[a-zA-Z_:][a-zA-Z0-9_.:-]*(?==))/g;

function wrapMultilineToken(text: string, cls: string): string {
  if (!text) return "";
  if (!text.includes("\n")) {
    return `<span class="${cls}">${escapeCodeHtml(text)}</span>`;
  }
  return text
    .split("\n")
    .map((part) => (part ? `<span class="${cls}">${escapeCodeHtml(part)}</span>` : ""))
    .join("\n");
}

function highlightTemplateStringChunk(rawChunk: string): string {
  if (!rawChunk) return "";
  // Se o trecho do template literal contém tags HTML/XML injetadas (ex: innerHTML = `<div class="...">`),
  // destaca as tags e atributos preservando o estilo de template string no restante!
  if (!/<\/?[A-Za-z]/.test(rawChunk)) {
    return wrapMultilineToken(rawChunk, "matz-tok-string");
  }
  let out = "";
  let last = 0;
  EMBEDDED_HTML_IN_TEMPLATE_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EMBEDDED_HTML_IN_TEMPLATE_REGEX.exec(rawChunk)) !== null) {
    if (m.index > last) {
      out += wrapMultilineToken(rawChunk.slice(last, m.index), "matz-tok-string");
    }
    const tok = m[0];
    if (tok.startsWith("<") || tok === "/>" || tok === ">") {
      out += `<span class="matz-tok-tag">${escapeCodeHtml(tok)}</span>`;
    } else {
      out += `<span class="matz-tok-type">${escapeCodeHtml(tok)}</span>`;
    }
    last = EMBEDDED_HTML_IN_TEMPLATE_REGEX.lastIndex;
  }
  if (last < rawChunk.length) {
    out += wrapMultilineToken(rawChunk.slice(last), "matz-tok-string");
  }
  return out;
}

function highlightFlatCodeSegment(code: string, lang: string): string {
  if (!code) return "";
  let result = "";
  let lastIndex = 0;
  const regex = new RegExp(FLAT_TOKEN_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeCodeHtml(code.slice(lastIndex, match.index));
    }
    const token = match[0];
    const escaped = escapeCodeHtml(token);

    if (
      token.startsWith("//") ||
      token.startsWith("/*") ||
      token.startsWith("--[[") ||
      (token.startsWith("--") && (lang === "lua" || lang === "sql" || lang === "haskell" || lang === "ada")) ||
      (token.startsWith("#") &&
        !token.startsWith("#include") &&
        !token.startsWith("#define") &&
        !token.startsWith("#ifdef") &&
        !token.startsWith("#ifndef") &&
        !token.startsWith("#endif") &&
        !token.startsWith("#pragma") &&
        lang !== "css" &&
        lang !== "scss" &&
        lang !== "html")
    ) {
      result += wrapMultilineToken(token, "matz-tok-comment");
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      result += wrapMultilineToken(token, "matz-tok-string");
    } else if (token.startsWith("<")) {
      result += `<span class="matz-tok-tag">${escaped}</span>`;
    } else if (/^(0x|\d)/.test(token)) {
      result += `<span class="matz-tok-number">${escaped}</span>`;
    } else if (KEYWORDS_SET.has(token) || (lang === "sql" && KEYWORDS_SET.has(token.toUpperCase()))) {
      result += `<span class="matz-tok-keyword">${escaped}</span>`;
    } else if (TYPES_AND_LITERALS_SET.has(token) || (lang === "sql" && TYPES_AND_LITERALS_SET.has(token.toUpperCase()))) {
      result += `<span class="matz-tok-type">${escaped}</span>`;
    } else if (code.slice(match.index + token.length).match(/^\s*\(/)) {
      result += `<span class="matz-tok-func">${escaped}</span>`;
    } else {
      result += escaped;
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    result += escapeCodeHtml(code.slice(lastIndex));
  }
  return result;
}

/**
 * Stack-based Highlighter para linguagens com Template Literals aninhados (`... ${ `...` } ...`)
 * e código HTML/CSS injetado dentro de strings.
 */
function highlightNestedTemplateCode(code: string, lang: string): string {
  type HMode = { type: "template" } | { type: "expr"; braceDepth: number };
  const stack: HMode[] = [];
  let out = "";
  let segStart = 0;
  let i = 0;
  let prevSigChar = "";

  const flushCode = (end: number) => {
    if (end > segStart) {
      out += highlightFlatCodeSegment(code.slice(segStart, end), lang);
    }
    segStart = end;
  };

  const flushTemplate = (end: number) => {
    if (end > segStart) {
      out += highlightTemplateStringChunk(code.slice(segStart, end));
    }
    segStart = end;
  };

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1] || "";
    const top = stack[stack.length - 1];

    if (top && top.type === "template") {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === "$" && next === "{") {
        flushTemplate(i);
        out += `<span class="matz-tok-interp">\${</span>`;
        stack.push({ type: "expr", braceDepth: 0 });
        prevSigChar = "{";
        i += 2;
        segStart = i;
        continue;
      }
      if (ch === "`") {
        flushTemplate(i + 1);
        stack.pop();
        prevSigChar = "`";
        i++;
        segStart = i;
        continue;
      }
      i++;
      continue;
    }

    // Estamos em CODE mode (raiz ou dentro de ${ ... })
    // Ignorar comentários, strings e regex literals para não confundir ` ou } dentro deles
    if (ch === "/" && next === "/") {
      const nl = code.indexOf("\n", i + 2);
      i = nl === -1 ? code.length : nl + 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      const endC = code.indexOf("*/", i + 2);
      i = endC === -1 ? code.length : endC + 2;
      continue;
    }
    if (ch === "/" && next !== "/" && next !== "*" && (!prevSigChar || "({[=:;,!&|?+-*%~^<>".includes(prevSigChar))) {
      let regIdx = i + 1;
      let inClass = false;
      let closedReg = false;
      while (regIdx < code.length && code[regIdx] !== "\n") {
        const rc = code[regIdx];
        if (rc === "\\") {
          regIdx += 2;
          continue;
        }
        if (rc === "[") inClass = true;
        else if (rc === "]") inClass = false;
        else if (rc === "/" && !inClass) {
          closedReg = true;
          regIdx++;
          while (regIdx < code.length && /[A-Za-z]/.test(code[regIdx])) regIdx++;
          break;
        }
        regIdx++;
      }
      if (closedReg) {
        prevSigChar = "/";
        i = regIdx;
        continue;
      }
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      i++;
      while (i < code.length && code[i] !== "\n") {
        if (code[i] === "\\") {
          i += 2;
          continue;
        }
        if (code[i] === q) {
          i++;
          break;
        }
        i++;
      }
      prevSigChar = '"';
      continue;
    }
    if (ch === "`") {
      flushCode(i);
      stack.push({ type: "template" });
      i++;
      continue;
    }
    if (top && top.type === "expr") {
      if (ch === "{") {
        top.braceDepth++;
      } else if (ch === "}") {
        if (top.braceDepth === 0) {
          flushCode(i);
          out += `<span class="matz-tok-interp">}</span>`;
          stack.pop();
          i++;
          segStart = i;
          continue;
        }
        top.braceDepth--;
      }
    }
    if (!/\s/.test(ch)) {
      prevSigChar = ch;
    }
    i++;
  }

  const topAtEnd = stack[stack.length - 1];
  if (topAtEnd && topAtEnd.type === "template") {
    flushTemplate(code.length);
  } else {
    flushCode(code.length);
  }
  return out;
}

export function highlightMatzCode(
  code: string,
  language = "plaintext",
  diagnostics?: Map<number, MatzDiagnosticItem>
): string {
  if (!code) return "\n";
  const lang = (language || "plaintext").toLowerCase();
  if (lang === "plaintext" || lang === "text" || lang === "log") {
    return escapeCodeHtml(code) + (code.endsWith("\n") ? " " : "");
  }

  const isTsJs = lang === "typescript" || lang === "javascript" || lang === "tsx" || lang === "jsx";
  let result =
    isTsJs && code.includes("`")
      ? highlightNestedTemplateCode(code, lang)
      : highlightFlatCodeSegment(code, lang);

  // Apply inline diagnostic wave underline to lines with errors/warnings (only on single-line tokens)
  if (diagnostics && diagnostics.size > 0) {
    const htmlLines = result.split("\n");
    for (const [lnNum, diag] of diagnostics.entries()) {
      const idx = lnNum - 1;
      if (idx >= 0 && idx < htmlLines.length && htmlLines[idx].trim().length > 0) {
        const cls = diag.severity === "error" ? "matz-code-line-err" : "matz-code-line-warn";
        htmlLines[idx] = `<span class="${cls}">${htmlLines[idx]}</span>`;
      }
    }
    result = htmlLines.join("\n");
  }

  // Trailing space on final newline ensures <pre> height matches <textarea>
  if (code.endsWith("\n")) {
    result += " ";
  }
  return result;
}

/**
 * Renderiza o Minimap de código em alta densidade via Canvas 2D com tokens coloridos por linha + marcadores de diagnóstico.
 */
function paintCodeMinimapCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  activeLine: number,
  isLightTheme: boolean,
  diagnosticsMap?: Map<number, MatzDiagnosticItem>
): void {
  const rect = canvas.getBoundingClientRect();
  const widthCss = Math.max(60, Math.floor(rect.width || 86));
  const heightCss = Math.max(80, Math.floor(rect.height || 400));
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  if (canvas.width !== Math.floor(widthCss * dpr) || canvas.height !== Math.floor(heightCss * dpr)) {
    canvas.width = Math.floor(widthCss * dpr);
    canvas.height = Math.floor(heightCss * dpr);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, widthCss, heightCss);

  const lines = (text || "").split("\n");
  const totalLines = Math.max(1, lines.length);
  const rawPitch = 3; // 2px bar + 1px gap
  const pitch = totalLines * rawPitch > heightCss - 8 ? Math.max(0.8, (heightCss - 8) / totalLines) : rawPitch;
  const barH = Math.max(1, pitch * 0.66);

  const colComment = isLightTheme ? "#94a3b8" : "#64748b";
  const colString = isLightTheme ? "#059669" : "#34d399";
  const colKeyword = isLightTheme ? "#7c3aed" : "#c084fc";
  const colType = isLightTheme ? "#0284c7" : "#38bdf8";
  const colIdent = isLightTheme ? "#64748b" : "#94a3b8";
  const colActiveBg = isLightTheme ? "rgba(79, 70, 229, 0.22)" : "rgba(99, 102, 241, 0.28)";

  for (let i = 0; i < totalLines; i++) {
    const y = 4 + i * pitch;
    if (y > heightCss) break;

    if (i + 1 === activeLine) {
      ctx.fillStyle = colActiveBg;
      ctx.fillRect(0, Math.max(0, y - 1), widthCss, Math.max(3, pitch + 1));
    }

    const diag = diagnosticsMap?.get(i + 1);
    if (diag) {
      ctx.fillStyle = diag.severity === "error" ? "rgba(244, 63, 94, 0.35)" : "rgba(245, 158, 11, 0.28)";
      ctx.fillRect(0, Math.max(0, y - 0.5), widthCss, Math.max(2.5, pitch));
      ctx.fillStyle = diag.severity === "error" ? "#f43f5e" : "#f59e0b";
      ctx.fillRect(widthCss - 5, Math.max(0, y - 0.5), 5, Math.max(3, pitch + 0.5));
    }

    const ln = lines[i];
    if (!ln || !ln.trim()) continue;

    const trimmed = ln.trimStart();
    const indentCols = Math.min(24, ln.length - trimmed.length);
    let x = 5 + indentCols * 1.1;

    if (trimmed.startsWith("//") || trimmed.startsWith("--") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
      ctx.fillStyle = colComment;
      const w = Math.min(widthCss - x - 4, Math.max(6, trimmed.length * 0.85));
      ctx.fillRect(x, y, w, barH);
      continue;
    }

    const parts = trimmed.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        x += Math.min(6, part.length * 1.1);
        continue;
      }
      if (x >= widthCss - 4) break;

      const clean = part.replace(/[^A-Za-z0-9_]/g, "");
      if (part.startsWith('"') || part.startsWith("'") || part.startsWith("`")) {
        ctx.fillStyle = colString;
      } else if (KEYWORDS_SET.has(clean)) {
        ctx.fillStyle = colKeyword;
      } else if (TYPES_AND_LITERALS_SET.has(clean)) {
        ctx.fillStyle = colType;
      } else {
        ctx.fillStyle = colIdent;
      }

      const w = Math.min(widthCss - x - 3, Math.max(2, part.length * 0.95));
      ctx.fillRect(x, y, w, barH);
      x += w + 1.5;
    }
  }

  ctx.restore();
}

export interface MatzEditorHistorySnapshot {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
  timestamp: number;
}

export interface MatzCodeEditorController {
  getTextarea: () => HTMLTextAreaElement | null;
  setValue: (val: string) => void;
  setMinimapVisible: (visible: boolean) => void;
  setExternalDiagnostics: (diags: MatzDiagnosticItem[]) => void;
  setFontConfig: (fontFamily: string, fontSize: number, lineHeight?: number) => void;
  jumpToLine: (line: number, column?: number) => void;
  getScrollPosition: () => { scrollTop: number; scrollLeft: number };
  undo: () => boolean;
  redo: () => boolean;
  cut: () => string;
  copy: () => string;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistoryDepth: () => { undoCount: number; redoCount: number };
}

export function renderMatzCodeEditor(container: HTMLElement, opts: MatzCodeEditorOptions): MatzCodeEditorController {
  const conventions = getMatzLanguageConventions(opts.language);
  let fontSize = opts.fontSize || 13;
  let fontFamily = opts.fontFamily || "var(--font-mono)";
  let lineHeight = opts.lineHeight || 1.62;
  const tabSize = opts.tabSize || conventions.tabSize || 2;
  const wordWrap = Boolean(opts.wordWrap);
  const enableAutocomplete = opts.enableAutocomplete !== false && !opts.readOnly;
  const enableLinter = opts.enableLinter !== false;
  let showMinimap = opts.showMinimap !== undefined ? opts.showMinimap : isMatzMinimapEnabled();
  let currentValue = opts.value || "";
  let activeLine = 1;

  let externalDiags: MatzDiagnosticItem[] = opts.externalDiagnostics ? [...opts.externalDiagnostics] : [];
  let mergedDiags: MatzDiagnosticItem[] = [];
  let diagByLine = new Map<number, MatzDiagnosticItem>();

  const recomputeDiagnostics = () => {
    const localDiags = enableLinter ? lintMatzCode(currentValue, opts.language) : [];
    const map = new Map<number, MatzDiagnosticItem>();
    const combined: MatzDiagnosticItem[] = [];

    for (const d of [...externalDiags, ...localDiags]) {
      combined.push(d);
      const existing = map.get(d.line);
      if (!existing || (existing.severity !== "error" && d.severity === "error")) {
        map.set(d.line, d);
      }
    }
    mergedDiags = combined;
    diagByLine = map;
    opts.onDiagnosticsChange?.(mergedDiags);
  };

  recomputeDiagnostics();

  const buildGutterHtml = (text: string, curLine: number): string => {
    const count = Math.max(1, text.split("\n").length);
    const out: string[] = [];
    for (let i = 1; i <= count; i++) {
      const diag = diagByLine.get(i);
      const diagClass = diag ? (diag.severity === "error" ? "has-error" : "has-warning") : "";
      const diagTitle = diag ? ` title="${escapeAttrHtml(`[${diag.source}] Ln ${diag.line}: ${diag.message}`)}"` : "";
      out.push(
        `<div class="matz-code-ln ${i === curLine ? "active" : ""} ${diagClass}" data-ln="${i}"${diagTitle}>${i}</div>`
      );
    }
    return out.join("");
  };

  container.innerHTML = `
    <div class="matz-code-editor-wrapper">
      <div class="matz-code-editor-shell ${showMinimap ? "has-minimap" : ""}" id="matz-ed-shell">
        <div class="matz-code-gutter" id="matz-ed-gutter">${buildGutterHtml(currentValue, activeLine)}</div>
        <div class="matz-code-stage" id="matz-ed-stage">
          <pre class="matz-code-highlight-layer ${wordWrap ? "wrap" : ""}" id="matz-ed-pre" aria-hidden="true">${highlightMatzCode(
            currentValue,
            opts.language,
            diagByLine
          )}</pre>
          <textarea
            class="matz-code-input-layer ${wordWrap ? "wrap" : ""}"
            id="bycode-code-textarea"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            ${opts.readOnly ? "readonly" : ""}
          ></textarea>
          <div class="matz-code-autocomplete" id="matz-ed-autocomplete" style="display:none;" role="listbox" aria-label="IntelliSense Autocomplete"></div>
        </div>
        <aside class="matz-code-minimap" id="matz-ed-minimap" style="${showMinimap ? "" : "display:none;"}" title="Minimap">
          <canvas class="matz-code-minimap-canvas" id="matz-ed-minimap-canvas"></canvas>
          <div class="matz-code-minimap-slider" id="matz-ed-minimap-slider"></div>
        </aside>
      </div>
      <div class="matz-code-diagnostics-bar" id="matz-ed-diagnostics-bar"></div>
    </div>
  `;

  const shellEl = container.querySelector<HTMLElement>("#matz-ed-shell")!;
  const gutterEl = container.querySelector<HTMLElement>("#matz-ed-gutter")!;
  const stageEl = container.querySelector<HTMLElement>("#matz-ed-stage")!;
  const preEl = container.querySelector<HTMLElement>("#matz-ed-pre")!;
  const textarea = container.querySelector<HTMLTextAreaElement>("#bycode-code-textarea")!;
  const acPopup = container.querySelector<HTMLDivElement>("#matz-ed-autocomplete")!;
  const diagBarEl = container.querySelector<HTMLDivElement>("#matz-ed-diagnostics-bar")!;
  const minimapEl = container.querySelector<HTMLElement>("#matz-ed-minimap");
  const minimapCanvas = container.querySelector<HTMLCanvasElement>("#matz-ed-minimap-canvas");
  const minimapSlider = container.querySelector<HTMLElement>("#matz-ed-minimap-slider");

  const applyTypographyToDom = (ff: string, fs: number, lh: number) => {
    fontFamily = ff || "var(--font-mono)";
    fontSize = fs || 13;
    lineHeight = lh || 1.62;
    shellEl.style.setProperty("--editor-font-family", fontFamily);
    shellEl.style.setProperty("--editor-font-size", `${fontSize}px`);
    shellEl.style.setProperty("--editor-line-height", String(lineHeight));
    shellEl.style.fontFamily = fontFamily;
    preEl.style.fontFamily = fontFamily;
    preEl.style.fontSize = `${fontSize}px`;
    preEl.style.lineHeight = String(lineHeight);
    textarea.style.fontFamily = fontFamily;
    textarea.style.fontSize = `${fontSize}px`;
    textarea.style.lineHeight = String(lineHeight);
  };

  applyTypographyToDom(fontFamily, fontSize, lineHeight);
  textarea.value = currentValue;

  const jumpToLine = (targetLine: number, targetCol = 1) => {
    const lines = textarea.value.split("\n");
    const clampedLine = Math.max(1, Math.min(lines.length, targetLine));
    let offset = 0;
    for (let i = 0; i < clampedLine - 1; i++) {
      offset += lines[i].length + 1;
    }
    const colOffset = Math.max(0, Math.min(lines[clampedLine - 1].length, targetCol - 1));
    const finalPos = offset + colOffset;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = finalPos;
    const rowPx = fontSize * lineHeight;
    const targetScrollTop = Math.max(0, (clampedLine - 4) * rowPx);
    textarea.scrollTop = targetScrollTop;
    syncScroll();
    updateCursorMetrics();
  };

  const renderDiagnosticsBar = () => {
    if (!diagBarEl) return;
    if (!enableLinter && externalDiags.length === 0) {
      diagBarEl.style.display = "none";
      return;
    }
    diagBarEl.style.display = "flex";
    const errCount = mergedDiags.filter((d) => d.severity === "error").length;
    const warnCount = mergedDiags.filter((d) => d.severity === "warning").length;

    if (mergedDiags.length === 0) {
      diagBarEl.innerHTML = `
        <div class="matz-diag-summary ok">
          <span class="matz-diag-dot ok"></span>
          <span>Linter (${opts.language}): 0 ${matzT("common.error").toLowerCase()}s</span>
        </div>
        <div class="matz-diag-hint">Ctrl+Space: Autocomplete · Ctrl+/: Comment</div>
      `;
      return;
    }

    const pillsHtml = mergedDiags
      .slice(0, 6)
      .map(
        (d, idx) => `
        <button type="button" class="matz-diag-pill ${d.severity}" data-diag-idx="${idx}" title="${escapeAttrHtml(d.message)}">
          <strong>Ln ${d.line}:${d.column}</strong>
          <span>${escapeCodeHtml(d.message.length > 58 ? d.message.slice(0, 58) + "..." : d.message)}</span>
        </button>
      `
      )
      .join("");

    diagBarEl.innerHTML = `
      <div class="matz-diag-summary ${errCount > 0 ? "err" : "warn"}">
        <span class="matz-diag-dot ${errCount > 0 ? "err" : "warn"}"></span>
        <span>${errCount} erro(s) · ${warnCount} aviso(s)</span>
      </div>
      <div class="matz-diag-list">${pillsHtml}</div>
    `;

    diagBarEl.querySelectorAll<HTMLButtonElement>("[data-diag-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = mergedDiags[Number(btn.dataset.diagIdx)];
        if (d) {
          jumpToLine(d.line, d.column);
        }
      });
    });
  };

  renderDiagnosticsBar();

  // Transactional Undo / Redo History Stack (max 150 snapshots)
  const MAX_HISTORY_SNAPSHOTS = 150;
  const undoStack: MatzEditorHistorySnapshot[] = [
    {
      value: currentValue,
      selectionStart: typeof opts.initialSelectionStart === "number" ? opts.initialSelectionStart : 0,
      selectionEnd:
        typeof opts.initialSelectionEnd === "number"
          ? opts.initialSelectionEnd
          : typeof opts.initialSelectionStart === "number"
          ? opts.initialSelectionStart
          : 0,
      scrollTop: opts.initialScrollTop || 0,
      timestamp: Date.now(),
    },
  ];
  const redoStack: MatzEditorHistorySnapshot[] = [];

  const recordHistorySnapshot = (coalesceWindowMs = 0) => {
    const now = Date.now();
    const top = undoStack[undoStack.length - 1];
    if (top && top.value === textarea.value) {
      top.selectionStart = textarea.selectionStart;
      top.selectionEnd = textarea.selectionEnd;
      top.scrollTop = textarea.scrollTop;
      return;
    }

    if (
      coalesceWindowMs > 0 &&
      top &&
      undoStack.length > 1 &&
      now - top.timestamp <= coalesceWindowMs &&
      Math.abs(textarea.value.length - top.value.length) <= 10 &&
      !textarea.value.slice(Math.min(top.selectionStart, textarea.selectionStart), textarea.selectionStart).includes("\n")
    ) {
      top.value = textarea.value;
      top.selectionStart = textarea.selectionStart;
      top.selectionEnd = textarea.selectionEnd;
      top.scrollTop = textarea.scrollTop;
      top.timestamp = now;
      redoStack.length = 0;
      return;
    }

    undoStack.push({
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      scrollTop: textarea.scrollTop,
      timestamp: now,
    });
    if (undoStack.length > MAX_HISTORY_SNAPSHOTS) {
      undoStack.shift();
    }
    redoStack.length = 0;
  };

  // Autocomplete State & Rendering
  let acOpen = false;
  let acItems: MatzCompletionItem[] = [];
  let acSelectedIndex = 0;
  let acPrefix = "";

  const closeAutocomplete = () => {
    acOpen = false;
    acItems = [];
    acPopup.style.display = "none";
  };

  const applyCompletionItem = (item: MatzCompletionItem) => {
    recordHistorySnapshot(0);
    const savedScrollTop = textarea.scrollTop;
    const savedScrollLeft = textarea.scrollLeft;
    const cursor = textarea.selectionStart;
    const replaceLen = typeof item.replaceLength === "number" ? item.replaceLength : acPrefix.length;
    const startReplace = Math.max(0, cursor - replaceLen);
    const val = textarea.value;

    // Preserve current line's indentation for multi-line snippets & Emmet expansions
    const lineStart = val.lastIndexOf("\n", startReplace - 1) + 1;
    const lineIndent = val.slice(lineStart, startReplace).match(/^[ \t]*/)?.[0] ?? "";
    const isMultiline = item.insertText.includes("\n");
    const indentedInsert = isMultiline
      ? item.insertText
          .split("\n")
          .map((ln, idx) => (idx === 0 ? ln : lineIndent + ln))
          .join("\n")
      : item.insertText;

    const rawBack = item.cursorBackOffset ? item.cursorBackOffset : 0;
    const suffixAfterCursor = rawBack > 0 ? item.insertText.slice(item.insertText.length - rawBack) : "";
    const newlinesAfterCursor = (suffixAfterCursor.match(/\n/g) || []).length;
    const effectiveBackOffset = rawBack + (isMultiline ? newlinesAfterCursor * lineIndent.length : 0);

    textarea.value = val.slice(0, startReplace) + indentedInsert + val.slice(cursor);
    const nextCursor = startReplace + indentedInsert.length - effectiveBackOffset;
    textarea.selectionStart = textarea.selectionEnd = Math.max(startReplace, nextCursor);
    textarea.scrollTop = savedScrollTop;
    textarea.scrollLeft = savedScrollLeft;
    recordHistorySnapshot(0);
    closeAutocomplete();
    syncVisuals();
    updateCursorMetrics();
    opts.onChange?.(textarea.value);
  };

  const acceptAutocomplete = (index: number) => {
    const item = acItems[index];
    if (!item) return;
    applyCompletionItem(item);
  };

  const renderAutocompletePopup = () => {
    if (!acOpen || acItems.length === 0) {
      acPopup.style.display = "none";
      return;
    }

    const upto = textarea.value.slice(0, textarea.selectionStart);
    const lines = upto.split("\n");
    const curLineIdx = lines.length - 1;
    const curColIdx = lines[curLineIdx].length;

    const rowHeight = fontSize * lineHeight;
    const charWidth = fontSize * 0.6;
    const rawTop = 12 + (curLineIdx + 1) * rowHeight - textarea.scrollTop + 4;
    const rawLeft = 16 + Math.max(0, curColIdx - acPrefix.length) * charWidth - textarea.scrollLeft;

    const stageH = stageEl.clientHeight || 360;
    const stageW = stageEl.clientWidth || 500;
    const popupH = Math.min(220, acItems.length * 26 + 10);
    const topPx = rawTop + popupH > stageH ? Math.max(8, rawTop - popupH - rowHeight - 6) : Math.max(8, rawTop);
    const leftPx = Math.max(12, Math.min(stageW - 280, rawLeft));

    acPopup.style.top = `${Math.round(topPx)}px`;
    acPopup.style.left = `${Math.round(leftPx)}px`;
    acPopup.style.display = "flex";

    const kindBadgeMap: Record<MatzCompletionKind, { tag: string; cls: string }> = {
      keyword: { tag: "KW", cls: "kw" },
      function: { tag: "FN", cls: "fn" },
      type: { tag: "TP", cls: "tp" },
      snippet: { tag: "SN", cls: "sn" },
      variable: { tag: "VR", cls: "vr" },
      property: { tag: "PR", cls: "pr" },
      emmet: { tag: "EM", cls: "em" },
    };

    acPopup.innerHTML = acItems
      .map((item, idx) => {
        const badge = kindBadgeMap[item.kind] || kindBadgeMap.variable;
        return `
          <div class="matz-ac-item ${idx === acSelectedIndex ? "active" : ""}" data-ac-idx="${idx}" role="option" aria-selected="${
          idx === acSelectedIndex
        }">
            <div class="matz-ac-left">
              <span class="matz-ac-kind ${badge.cls}">${badge.tag}</span>
              <span class="matz-ac-label">${escapeCodeHtml(item.label)}</span>
            </div>
            <span class="matz-ac-detail">${escapeCodeHtml(item.detail)}</span>
          </div>
        `;
      })
      .join("");

    acPopup.querySelectorAll<HTMLDivElement>("[data-ac-idx]").forEach((row) => {
      row.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        acceptAutocomplete(Number(row.dataset.acIdx));
      });
    });

    const activeRow = acPopup.querySelector<HTMLElement>(".matz-ac-item.active");
    activeRow?.scrollIntoView({ block: "nearest" });
  };

  const triggerAutocomplete = (force = false) => {
    if (!enableAutocomplete) return;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      closeAutocomplete();
      return;
    }
    const { prefix, items } = getMatzCompletions(
      textarea.value,
      textarea.selectionStart,
      opts.language,
      force
    );
    if (items.length === 0) {
      closeAutocomplete();
      return;
    }
    acPrefix = prefix;
    acItems = items;
    acSelectedIndex = 0;
    acOpen = true;
    renderAutocompletePopup();
  };

  const updateMinimapSliderPosition = () => {
    if (!minimapEl || !minimapSlider || !showMinimap) return;
    const mapH = minimapEl.clientHeight || 200;
    const totalScrollable = Math.max(1, textarea.scrollHeight - textarea.clientHeight);
    const visibleRatio = Math.min(1, textarea.clientHeight / Math.max(1, textarea.scrollHeight));

    const linesCount = Math.max(1, currentValue.split("\n").length);
    const contentPaintedH = Math.min(mapH, Math.max(36, linesCount * 3 + 8));
    const sliderH = Math.max(22, Math.round(contentPaintedH * visibleRatio));
    const scrollProgress = textarea.scrollHeight > textarea.clientHeight ? textarea.scrollTop / totalScrollable : 0;
    const maxSliderTop = Math.max(0, contentPaintedH - sliderH);
    const sliderTop = Math.round(scrollProgress * maxSliderTop);

    minimapSlider.style.height = `${sliderH}px`;
    minimapSlider.style.transform = `translateY(${sliderTop}px)`;
  };

  const renderMinimap = () => {
    if (!minimapCanvas || !showMinimap) return;
    const isLight = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light";
    paintCodeMinimapCanvas(minimapCanvas, currentValue, activeLine, isLight, diagByLine);
    updateMinimapSliderPosition();
  };

  let lintDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const syncVisuals = (immediateLint = false) => {
    currentValue = textarea.value;
    if (immediateLint) {
      recomputeDiagnostics();
      renderDiagnosticsBar();
    } else if (enableLinter) {
      if (lintDebounceTimer) clearTimeout(lintDebounceTimer);
      lintDebounceTimer = setTimeout(() => {
        recomputeDiagnostics();
        preEl.innerHTML = highlightMatzCode(currentValue, opts.language, diagByLine);
        gutterEl.innerHTML = buildGutterHtml(currentValue, activeLine);
        gutterEl.scrollTop = textarea.scrollTop;
        renderDiagnosticsBar();
        renderMinimap();
      }, 220);
    }
    preEl.innerHTML = highlightMatzCode(currentValue, opts.language, diagByLine);
    gutterEl.innerHTML = buildGutterHtml(currentValue, activeLine);
    preEl.scrollTop = textarea.scrollTop;
    preEl.scrollLeft = textarea.scrollLeft;
    gutterEl.scrollTop = textarea.scrollTop;
    renderMinimap();
  };

  const syncScroll = () => {
    preEl.scrollTop = textarea.scrollTop;
    preEl.scrollLeft = textarea.scrollLeft;
    gutterEl.scrollTop = textarea.scrollTop;
    updateMinimapSliderPosition();
    if (acOpen) {
      renderAutocompletePopup();
    }
    opts.onScrollChange?.(textarea.scrollTop, textarea.scrollLeft);
  };

  const updateCursorMetrics = () => {
    const upto = textarea.value.slice(0, textarea.selectionStart);
    const lines = upto.split("\n");
    const nextLine = lines.length;
    const nextCol = lines[lines.length - 1].length + 1;
    if (nextLine !== activeLine) {
      activeLine = nextLine;
      gutterEl.innerHTML = buildGutterHtml(textarea.value, activeLine);
      gutterEl.scrollTop = textarea.scrollTop;
      renderMinimap();
    }
    const sel = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    opts.onCursorChange?.(nextLine, nextCol, sel);
  };

  // Restore saved selection and scroll position
  if (typeof opts.initialSelectionStart === "number") {
    textarea.selectionStart = opts.initialSelectionStart;
    textarea.selectionEnd =
      typeof opts.initialSelectionEnd === "number" ? opts.initialSelectionEnd : opts.initialSelectionStart;
    updateCursorMetrics();
  }
  if ((opts.initialScrollTop && opts.initialScrollTop > 0) || (opts.initialScrollLeft && opts.initialScrollLeft > 0)) {
    const targetTop = opts.initialScrollTop || 0;
    const targetLeft = opts.initialScrollLeft || 0;
    textarea.scrollTop = targetTop;
    textarea.scrollLeft = targetLeft;
    syncScroll();
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        textarea.scrollTop = targetTop;
        textarea.scrollLeft = targetLeft;
        syncScroll();
      });
    }
  }

  if (minimapEl) {
    const scrollEditorFromMinimapY = (clientY: number) => {
      const rect = minimapEl.getBoundingClientRect();
      const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const linesCount = Math.max(1, currentValue.split("\n").length);
      const effectiveH = Math.min(rect.height, Math.max(40, linesCount * 3 + 8));
      const ratio = Math.max(0, Math.min(1, relY / effectiveH));
      const maxScroll = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
      textarea.scrollTop = Math.round(ratio * maxScroll);
      syncScroll();
    };

    minimapEl.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      scrollEditorFromMinimapY(ev.clientY);
      minimapEl.classList.add("is-dragging");

      const onMove = (moveEv: MouseEvent) => {
        scrollEditorFromMinimapY(moveEv.clientY);
      };
      const onUp = () => {
        minimapEl.classList.remove("is-dragging");
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    if (typeof window !== "undefined") {
      requestAnimationFrame(() => renderMinimap());
      window.addEventListener("matz:theme-changed", () => renderMinimap());
    }
  }

  const writeToClipboardSafe = (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        void navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore in headless/non-secure environments
    }
  };

  const performUndo = (): boolean => {
    if (opts.readOnly || undoStack.length <= 1) return false;
    const currentSnap = undoStack.pop()!;
    redoStack.push({
      ...currentSnap,
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      scrollTop: textarea.scrollTop,
    });
    const prev = undoStack[undoStack.length - 1];
    textarea.value = prev.value;
    textarea.selectionStart = prev.selectionStart;
    textarea.selectionEnd = prev.selectionEnd;
    textarea.scrollTop = prev.scrollTop;
    closeAutocomplete();
    syncVisuals();
    updateCursorMetrics();
    opts.onChange?.(textarea.value);
    return true;
  };

  const performRedo = (): boolean => {
    if (opts.readOnly || redoStack.length === 0) return false;
    const next = redoStack.pop()!;
    undoStack.push(next);
    textarea.value = next.value;
    textarea.selectionStart = next.selectionStart;
    textarea.selectionEnd = next.selectionEnd;
    textarea.scrollTop = next.scrollTop;
    closeAutocomplete();
    syncVisuals();
    updateCursorMetrics();
    opts.onChange?.(textarea.value);
    return true;
  };

  const performCopy = (): string => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    let copied = "";
    if (start !== end) {
      copied = val.slice(start, end);
    } else {
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = val.indexOf("\n", start);
      copied = lineEndIdx === -1 ? val.slice(lineStart) + "\n" : val.slice(lineStart, lineEndIdx + 1);
    }
    if (copied) {
      writeToClipboardSafe(copied);
    }
    return copied;
  };

  const performCut = (): string => {
    if (opts.readOnly) return "";
    recordHistorySnapshot(0);
    const savedScrollTop = textarea.scrollTop;
    const savedScrollLeft = textarea.scrollLeft;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    let cutText = "";
    let nextCursor = start;

    if (start !== end) {
      cutText = val.slice(start, end);
      textarea.value = val.slice(0, start) + val.slice(end);
      nextCursor = start;
    } else {
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = val.indexOf("\n", start);
      if (lineEndIdx !== -1) {
        cutText = val.slice(lineStart, lineEndIdx + 1);
        textarea.value = val.slice(0, lineStart) + val.slice(lineEndIdx + 1);
        nextCursor = Math.min(textarea.value.length, lineStart);
      } else if (lineStart > 0) {
        cutText = val.slice(lineStart) + "\n";
        textarea.value = val.slice(0, lineStart - 1);
        nextCursor = textarea.value.length;
      } else {
        cutText = val;
        textarea.value = "";
        nextCursor = 0;
      }
    }

    if (cutText) {
      writeToClipboardSafe(cutText);
    }
    textarea.selectionStart = textarea.selectionEnd = nextCursor;
    textarea.scrollTop = savedScrollTop;
    textarea.scrollLeft = savedScrollLeft;
    recordHistorySnapshot(0);
    closeAutocomplete();
    syncVisuals();
    updateCursorMetrics();
    opts.onChange?.(textarea.value);
    return cutText;
  };

  const performDuplicate = (): void => {
    if (opts.readOnly) return;
    recordHistorySnapshot(0);
    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    if (start !== end) {
      const selected = val.slice(start, end);
      textarea.value = val.slice(0, end) + selected + val.slice(end);
      textarea.selectionStart = end;
      textarea.selectionEnd = end + selected.length;
    } else {
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = val.indexOf("\n", start);
      const lineEnd = lineEndIdx === -1 ? val.length : lineEndIdx;
      const currentLine = val.slice(lineStart, lineEnd);
      const colOffset = start - lineStart;
      textarea.value = val.slice(0, lineEnd) + "\n" + currentLine + val.slice(lineEnd);
      const newPos = lineEnd + 1 + colOffset;
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }

    textarea.scrollTop = savedScrollTop;
    recordHistorySnapshot(0);
    syncVisuals();
    updateCursorMetrics();
    opts.onChange?.(textarea.value);
  };

  textarea.addEventListener("input", () => {
    recordHistorySnapshot(380);
    syncVisuals();
    updateCursorMetrics();
    triggerAutocomplete(false);
    opts.onChange?.(textarea.value);
  });

  textarea.addEventListener("scroll", syncScroll, { passive: true });
  textarea.addEventListener("click", () => {
    closeAutocomplete();
    updateCursorMetrics();
  });
  textarea.addEventListener("blur", () => {
    setTimeout(() => closeAutocomplete(), 150);
  });
  textarea.addEventListener("keyup", (e) => {
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.key === "PageUp" ||
      e.key === "PageDown"
    ) {
      updateCursorMetrics();
    }
  });

  textarea.addEventListener("keydown", (e) => {
    // Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        performUndo();
        return;
      }
      if (k === "y" || (k === "z" && e.shiftKey)) {
        e.preventDefault();
        performRedo();
        return;
      }
      if (k === "x" && !e.shiftKey) {
        e.preventDefault();
        performCut();
        return;
      }
      if (k === "c" && !e.shiftKey && textarea.selectionStart === textarea.selectionEnd) {
        e.preventDefault();
        performCopy();
        return;
      }
      if (k === "d" && !e.shiftKey) {
        e.preventDefault();
        performDuplicate();
        return;
      }
    }

    // Ctrl+Space — Force open IntelliSense Autocomplete
    if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
      e.preventDefault();
      triggerAutocomplete(true);
      return;
    }

    // Autocomplete keyboard navigation when open
    if (acOpen && acItems.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        acSelectedIndex = (acSelectedIndex + 1) % acItems.length;
        renderAutocompletePopup();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        acSelectedIndex = (acSelectedIndex - 1 + acItems.length) % acItems.length;
        renderAutocompletePopup();
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        acceptAutocomplete(acSelectedIndex);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeAutocomplete();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        closeAutocomplete();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      opts.onSave?.();
      return;
    }

    // Ctrl+/ — Toggle line comment per language convention
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      recordHistorySnapshot(0);
      const savedScrollTop = textarea.scrollTop;
      const savedScrollLeft = textarea.scrollLeft;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = val.indexOf("\n", end);
      const blockEnd = lineEndIdx === -1 ? val.length : lineEndIdx;
      const block = val.slice(lineStart, blockEnd);
      const lines = block.split("\n");
      const commentPrefix = conventions.lineComment + " ";
      const allCommented = lines
        .filter((l) => l.trim().length > 0)
        .every((l) => l.trimStart().startsWith(conventions.lineComment));

      const transformed = lines
        .map((ln) => {
          if (!ln.trim()) return ln;
          if (allCommented) {
            const idx = ln.indexOf(conventions.lineComment);
            if (idx !== -1) {
              const after = ln.slice(idx + conventions.lineComment.length);
              return ln.slice(0, idx) + (after.startsWith(" ") ? after.slice(1) : after);
            }
            return ln;
          }
          const leading = ln.match(/^[ \t]*/)?.[0] ?? "";
          return leading + commentPrefix + ln.slice(leading.length);
        })
        .join("\n");

      textarea.value = val.slice(0, lineStart) + transformed + val.slice(blockEnd);
      textarea.selectionStart = lineStart;
      textarea.selectionEnd = lineStart + transformed.length;
      textarea.scrollTop = savedScrollTop;
      textarea.scrollLeft = savedScrollLeft;
      recordHistorySnapshot(0);
      syncVisuals();
      updateCursorMetrics();
      opts.onChange?.(textarea.value);
      return;
    }

    // Enter — Smart language-aware line break & auto-indentation
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      recordHistorySnapshot(0);
      const savedScrollTop = textarea.scrollTop;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const indentUnit = conventions.insertSpaces === false ? "\t" : " ".repeat(tabSize);

      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const lineBeforeCursor = val.slice(lineStart, start);
      const leadingIndent = lineBeforeCursor.match(/^[ \t]*/)?.[0] ?? "";
      const trimmedBefore = lineBeforeCursor.trimEnd();
      const charBefore = trimmedBefore.slice(-1);
      const charAfter = val.slice(end).trimStart().slice(0, 1);

      const isBracketPair =
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "(" && charAfter === ")") ||
        (charBefore === "[" && charAfter === "]");

      const shouldExtraIndent = conventions.blockOpeners.test(trimmedBefore);

      let insertText = "\n" + leadingIndent;
      let cursorOffset = insertText.length;

      if (isBracketPair) {
        const innerIndent = leadingIndent + indentUnit;
        insertText = "\n" + innerIndent + "\n" + leadingIndent;
        cursorOffset = 1 + innerIndent.length;
      } else if (shouldExtraIndent) {
        insertText = "\n" + leadingIndent + indentUnit;
        cursorOffset = insertText.length;
      }

      textarea.value = val.slice(0, start) + insertText + val.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
      textarea.scrollTop = savedScrollTop;
      recordHistorySnapshot(0);
      syncVisuals();
      updateCursorMetrics();
      opts.onChange?.(textarea.value);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      // Direct Emmet expansion on Tab even when popup was closed (e.g., !, p, a, m10, div.card, clg)
      if (!e.shiftKey && start === end && enableAutocomplete) {
        const emmetItem = expandMatzEmmet(val, start, opts.language);
        if (emmetItem) {
          applyCompletionItem(emmetItem);
          return;
        }
      }

      recordHistorySnapshot(0);
      const savedScrollTop = textarea.scrollTop;
      const indent = " ".repeat(tabSize);

      if (start !== end && val.slice(start, end).includes("\n")) {
        // Multi-line block indent / unindent
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const selectedBlock = val.slice(lineStart, end);
        const lines = selectedBlock.split("\n");
        const transformed = lines
          .map((ln) => {
            if (e.shiftKey) {
              if (ln.startsWith(indent)) return ln.slice(indent.length);
              if (ln.startsWith("\t")) return ln.slice(1);
              return ln.replace(/^ {1,2}/, "");
            }
            return indent + ln;
          })
          .join("\n");

        textarea.value = val.slice(0, lineStart) + transformed + val.slice(end);
        textarea.selectionStart = lineStart;
        textarea.selectionEnd = lineStart + transformed.length;
      } else if (e.shiftKey) {
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const currentLine = val.slice(lineStart, end);
        if (currentLine.startsWith(indent)) {
          textarea.value = val.slice(0, lineStart) + val.slice(lineStart + indent.length);
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - indent.length);
        }
      } else {
        textarea.value = val.slice(0, start) + indent + val.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }

      textarea.scrollTop = savedScrollTop;
      recordHistorySnapshot(0);
      syncVisuals();
      updateCursorMetrics();
      opts.onChange?.(textarea.value);
    }
  });

  const setMinimapVisible = (visible: boolean) => {
    const savedTop = textarea.scrollTop;
    const savedLeft = textarea.scrollLeft;
    showMinimap = visible;
    shellEl.classList.toggle("has-minimap", visible);
    if (minimapEl) {
      minimapEl.style.display = visible ? "" : "none";
    }
    textarea.scrollTop = savedTop;
    textarea.scrollLeft = savedLeft;
    syncScroll();
    if (visible) {
      requestAnimationFrame(() => {
        renderMinimap();
        textarea.scrollTop = savedTop;
        textarea.scrollLeft = savedLeft;
        syncScroll();
      });
    }
  };

  const setExternalDiagnostics = (diags: MatzDiagnosticItem[]) => {
    externalDiags = [...diags];
    recomputeDiagnostics();
    preEl.innerHTML = highlightMatzCode(currentValue, opts.language, diagByLine);
    gutterEl.innerHTML = buildGutterHtml(currentValue, activeLine);
    gutterEl.scrollTop = textarea.scrollTop;
    renderDiagnosticsBar();
    renderMinimap();
  };

  return {
    getTextarea: () => textarea,
    setValue: (val: string) => {
      const savedTop = textarea.scrollTop;
      const savedLeft = textarea.scrollLeft;
      textarea.value = val;
      textarea.scrollTop = savedTop;
      textarea.scrollLeft = savedLeft;
      recordHistorySnapshot(0);
      syncVisuals(true);
    },
    setMinimapVisible,
    setExternalDiagnostics,
    setFontConfig: (ff: string, fs: number, lh?: number) => {
      applyTypographyToDom(ff, fs, lh ?? lineHeight);
    },
    jumpToLine,
    getScrollPosition: () => ({
      scrollTop: textarea.scrollTop,
      scrollLeft: textarea.scrollLeft,
    }),
    undo: performUndo,
    redo: performRedo,
    cut: performCut,
    copy: performCopy,
    canUndo: () => undoStack.length > 1,
    canRedo: () => redoStack.length > 0,
    getHistoryDepth: () => ({
      undoCount: Math.max(0, undoStack.length - 1),
      redoCount: redoStack.length,
    }),
  };
}
