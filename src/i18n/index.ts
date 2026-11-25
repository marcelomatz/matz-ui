/**
 * @matz/ui/i18n — Motor de Internacionalização Nativo Multi-Idiomas da Suíte MATZ
 * Suporta Português (pt-BR), Inglês (en-US) e Espanhol (es-ES) com persistência e reatividade global.
 */

export type MatzLocale = "pt-BR" | "en-US" | "es-ES";

export interface MatzLocaleOption {
  code: MatzLocale;
  shortLabel: string;
  label: string;
}

export const MATZ_LOCALES: MatzLocaleOption[] = [
  { code: "pt-BR", shortLabel: "PT", label: "Português (BR)" },
  { code: "en-US", shortLabel: "EN", label: "English (US)" },
  { code: "es-ES", shortLabel: "ES", label: "Español (ES)" },
];

const STORAGE_KEY = "matz-locale";

let currentLocale: MatzLocale = detectInitialLocale();

function detectInitialLocale(): MatzLocale {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as MatzLocale | null;
      if (saved === "pt-BR" || saved === "en-US" || saved === "es-ES") {
        return saved;
      }
    }
  } catch {
    // ignore storage errors
  }
  return "pt-BR";
}

export function getMatzLocale(): MatzLocale {
  return currentLocale;
}

export function setMatzLocale(next: MatzLocale): void {
  if (next !== "pt-BR" && next !== "en-US" && next !== "es-ES") return;
  currentLocale = next;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", next);
      document.documentElement.setAttribute("data-locale", next);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("matz:locale-changed", { detail: { locale: next } }));
    }
  } catch {
    // ignore
  }
}

export function cycleMatzLocale(): MatzLocale {
  const order: MatzLocale[] = ["pt-BR", "en-US", "es-ES"];
  const idx = order.indexOf(currentLocale);
  const next = order[(idx + 1) % order.length];
  setMatzLocale(next);
  return next;
}

export function onMatzLocaleChange(callback: (locale: MatzLocale) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (ev: Event) => {
    const custom = ev as CustomEvent<{ locale?: MatzLocale }>;
    callback(custom.detail?.locale || currentLocale);
  };
  window.addEventListener("matz:locale-changed", handler);
  return () => window.removeEventListener("matz:locale-changed", handler);
}

/**
 * Seleciona a tradução correspondente ao idioma ativo da Suíte MATZ.
 */
export function matzPick(translations: {
  "pt-BR": string;
  "en-US": string;
  "es-ES"?: string;
}): string {
  if (currentLocale === "en-US") return translations["en-US"];
  if (currentLocale === "es-ES") return translations["es-ES"] || translations["en-US"];
  return translations["pt-BR"];
}

const SUITE_DICTIONARY: Record<string, { "pt-BR": string; "en-US": string; "es-ES": string }> = {
  "titlebar.switchSuite": {
    "pt-BR": "Alternar aplicativo da Matz Suite",
    "en-US": "Switch Matz Suite application",
    "es-ES": "Cambiar aplicación de Matz Suite",
  },
  "titlebar.ecosystem": {
    "pt-BR": "Ecossistema Matz Suite",
    "en-US": "Matz Suite Ecosystem",
    "es-ES": "Ecosistema Matz Suite",
  },
  "titlebar.active": {
    "pt-BR": "Ativo",
    "en-US": "Active",
    "es-ES": "Activo",
  },
  "titlebar.open": {
    "pt-BR": "Abrir",
    "en-US": "Open",
    "es-ES": "Abrir",
  },
  "titlebar.theme": {
    "pt-BR": "Alternar tema Claro / Escuro",
    "en-US": "Toggle Light / Dark theme",
    "es-ES": "Cambiar tema Claro / Oscuro",
  },
  "titlebar.language": {
    "pt-BR": "Idioma da Interface (PT / EN / ES)",
    "en-US": "Interface Language (PT / EN / ES)",
    "es-ES": "Idioma de la Interfaz (PT / EN / ES)",
  },
  "titlebar.minimize": {
    "pt-BR": "Minimizar",
    "en-US": "Minimize",
    "es-ES": "Minimizar",
  },
  "titlebar.maximize": {
    "pt-BR": "Maximizar / Restaurar",
    "en-US": "Maximize / Restore",
    "es-ES": "Maximizar / Restaurar",
  },
  "titlebar.close": {
    "pt-BR": "Fechar",
    "en-US": "Close",
    "es-ES": "Cerrar",
  },
  "diff.clean": {
    "pt-BR": "Working tree limpa — nenhuma diferença encontrada para exibir.",
    "en-US": "Working tree clean — no differences found to display.",
    "es-ES": "Working tree limpio — no se encontraron diferencias para mostrar.",
  },
  "diff.files": {
    "pt-BR": "arq.",
    "en-US": "files",
    "es-ES": "arch.",
  },
  "diff.all": {
    "pt-BR": "Todos",
    "en-US": "All",
    "es-ES": "Todos",
  },
  "diff.copyPatch": {
    "pt-BR": "Copiar Patch",
    "en-US": "Copy Patch",
    "es-ES": "Copiar Patch",
  },
  "diff.copied": {
    "pt-BR": "Patch copiado para a área de transferência!",
    "en-US": "Patch copied to clipboard!",
    "es-ES": "¡Patch copiado al portapapeles!",
  },
  "editor.minimap": {
    "pt-BR": "Minimap",
    "en-US": "Minimap",
    "es-ES": "Minimapa",
  },
};

export function matzT(key: string): string {
  const entry = SUITE_DICTIONARY[key];
  if (!entry) return key;
  return entry[currentLocale] || entry["pt-BR"];
}
