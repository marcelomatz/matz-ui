export type MatzThemeFamilyId =
  | "precision-specular-glass"
  | "monolith-tone-on-tone"
  | "specular-obsidian-blue"
  | "specular-obsidian-violet"
  | "emerald-matrix"
  | "cyberpunk-amethyst"
  | "solarized-amber"
  | "midnight-cobalt"
  | "architectural-alabaster"
  | "alabaster-violet"
  | "warm-parchment"
  | "custom";

export interface MatzCustomThemeColors {
  mode: "dark" | "light";
  bgPrimary: string;
  bgSecondary: string;
  surfaceCode: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
}

export interface MatzThemeFamilyDescriptor {
  id: MatzThemeFamilyId;
  name: string;
  category: "dark" | "light" | "custom";
  defaultMode: "dark" | "light";
  description: {
    "pt-BR": string;
    "en-US": string;
    "es-ES": string;
  };
  colors: MatzCustomThemeColors;
  darkColors: MatzCustomThemeColors;
  lightColors: MatzCustomThemeColors;
}

const THEME_FAMILY_STORAGE_KEY = "matz-theme-family";
const THEME_MODE_STORAGE_KEY = "matz-theme-mode";
const CUSTOM_THEME_STORAGE_KEY = "matz-custom-theme-v1";
const ZOOM_STORAGE_KEY = "matz-ui-zoom-pct";
const BRIGHTNESS_STORAGE_KEY = "matz-screen-brightness-pct";

export const MATZ_THEME_FAMILIES: MatzThemeFamilyDescriptor[] = [
  {
    id: "precision-specular-glass",
    name: "Linear + Raycast + Warp — Precision Obsidian & Specular Glass",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Referência Linear + Raycast + Warp: vidro especular obsidiana, feixes de luz de borda e refração prismática (Dark & Soft White).",
      "en-US": "Linear + Raycast + Warp reference: obsidian specular glass, rim light beams, and prismatic refraction (Dark & Soft White).",
      "es-ES": "Referencia Linear + Raycast + Warp: vidrio especular obsidiana, haces de luz de borde y refracción prismática (Dark & Soft White).",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#07080e",
      bgSecondary: "#0d0f1a",
      surfaceCode: "#05060b",
      accent: "#6366f1",
      textPrimary: "#f4f6ff",
      textSecondary: "#a5b4fc",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#07080e",
      bgSecondary: "#0d0f1a",
      surfaceCode: "#05060b",
      accent: "#6366f1",
      textPrimary: "#f4f6ff",
      textSecondary: "#a5b4fc",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e8ecf4",
      bgSecondary: "#f0f3f9",
      surfaceCode: "#eceff6",
      accent: "#4f46e5",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    },
  },
  {
    id: "monolith-tone-on-tone",
    name: "Monolith Neutral — Tone-on-Tone Graphite",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Elegância monocromática tom sobre tom: carbono fosco, ícones em cinza grafite escuro e zero saturação cromática (Dark & Soft Stone).",
      "en-US": "Tone-on-tone monochromatic elegance: matte carbon, dark graphite icons, and zero chromatic saturation (Dark & Soft Stone).",
      "es-ES": "Elegancia monocromática tono sobre tono: carbono mate, iconos en gris grafito oscuro y cero saturación cromática (Dark & Soft Stone).",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#0a0a0c",
      bgSecondary: "#111114",
      surfaceCode: "#070709",
      accent: "#71717a",
      textPrimary: "#e4e4e7",
      textSecondary: "#71717a",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#0a0a0c",
      bgSecondary: "#111114",
      surfaceCode: "#070709",
      accent: "#71717a",
      textPrimary: "#e4e4e7",
      textSecondary: "#71717a",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e7e7ea",
      bgSecondary: "#efefF2",
      surfaceCode: "#ebebee",
      accent: "#52525b",
      textPrimary: "#18181b",
      textSecondary: "#52525b",
    },
  },
  {
    id: "specular-obsidian-blue",
    name: "Specular Obsidian — ByCode Blue",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Família oficial do byCode (Dark Obsidiana + Soft Alabastro) com destaque azul cobalto.",
      "en-US": "Official byCode family (Dark Obsidian + Soft Alabaster) with cobalt blue accent.",
      "es-ES": "Familia oficial de byCode (Dark Obsidiana + Soft Alabastro) con acento azul cobalto.",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#080a10",
      bgSecondary: "#0c0f18",
      surfaceCode: "#06080d",
      accent: "#3b82f6",
      textPrimary: "#f4f6fb",
      textSecondary: "#9ba3be",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#080a10",
      bgSecondary: "#0c0f18",
      surfaceCode: "#06080d",
      accent: "#3b82f6",
      textPrimary: "#f4f6fb",
      textSecondary: "#9ba3be",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e9edf3",
      bgSecondary: "#f1f4f9",
      surfaceCode: "#edf0f6",
      accent: "#2563eb",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    },
  },
  {
    id: "specular-obsidian-violet",
    name: "Specular Obsidian — Matz Violet",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Identidade clássica da suíte MATZ (Dark & Soft White) com violeta elétrico.",
      "en-US": "Classic MATZ suite identity (Dark & Soft White) with electric violet.",
      "es-ES": "Identidad clásica de la suite MATZ (Dark & Soft White) con violeta eléctrico.",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#080a10",
      bgSecondary: "#0c0f18",
      surfaceCode: "#06080d",
      accent: "#8b5cf6",
      textPrimary: "#f4f6fb",
      textSecondary: "#9ba3be",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#080a10",
      bgSecondary: "#0c0f18",
      surfaceCode: "#06080d",
      accent: "#8b5cf6",
      textPrimary: "#f4f6fb",
      textSecondary: "#9ba3be",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#eceaf4",
      bgSecondary: "#f3f1f9",
      surfaceCode: "#efedf7",
      accent: "#7c3aed",
      textPrimary: "#130f26",
      textSecondary: "#4c1d95",
    },
  },
  {
    id: "emerald-matrix",
    name: "Emerald Matrix — MyTerm Cyber",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Contraste terminal de alta precisão (Dark & Soft White) em esmeralda telemetria.",
      "en-US": "High-precision terminal contrast (Dark & Soft White) in telemetry emerald.",
      "es-ES": "Contraste de terminal de alta precisión (Dark & Soft White) en esmeralda telemetría.",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#060c0a",
      bgSecondary: "#0a1410",
      surfaceCode: "#040907",
      accent: "#10b981",
      textPrimary: "#ecfdf5",
      textSecondary: "#86efac",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#060c0a",
      bgSecondary: "#0a1410",
      surfaceCode: "#040907",
      accent: "#10b981",
      textPrimary: "#ecfdf5",
      textSecondary: "#86efac",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e7f1ec",
      bgSecondary: "#eff6f2",
      surfaceCode: "#ebf3ef",
      accent: "#059669",
      textPrimary: "#062c1e",
      textSecondary: "#166534",
    },
  },
  {
    id: "cyberpunk-amethyst",
    name: "Cyberpunk Amethyst — Heapi Neon",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Superfícies ametista com acento magenta de alto contraste (Dark & Soft White).",
      "en-US": "Amethyst surfaces with high-contrast magenta accent (Dark & Soft White).",
      "es-ES": "Superficies amatista con acento magenta de alto contraste (Dark & Soft White).",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#0b0713",
      bgSecondary: "#120c1f",
      surfaceCode: "#08050e",
      accent: "#d946ef",
      textPrimary: "#fdf4ff",
      textSecondary: "#d8b4fe",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#0b0713",
      bgSecondary: "#120c1f",
      surfaceCode: "#08050e",
      accent: "#d946ef",
      textPrimary: "#fdf4ff",
      textSecondary: "#d8b4fe",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#f0e9f4",
      bgSecondary: "#f6f1f9",
      surfaceCode: "#f2ecf6",
      accent: "#c026d3",
      textPrimary: "#240a2e",
      textSecondary: "#701a75",
    },
  },
  {
    id: "solarized-amber",
    name: "Obsidian Gold — Writtt Amber",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Conforto óptico quente com destaque âmbar dourado (Dark & Soft White).",
      "en-US": "Warm optical comfort with golden amber accent (Dark & Soft White).",
      "es-ES": "Confort óptico cálido con acento ámbar dorado (Dark & Soft White).",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#0c0a07",
      bgSecondary: "#14110b",
      surfaceCode: "#090705",
      accent: "#f59e0b",
      textPrimary: "#fef3c7",
      textSecondary: "#d6d3d1",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#0c0a07",
      bgSecondary: "#14110b",
      surfaceCode: "#090705",
      accent: "#f59e0b",
      textPrimary: "#fef3c7",
      textSecondary: "#d6d3d1",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#efeae0",
      bgSecondary: "#f6f2ea",
      surfaceCode: "#f2eee6",
      accent: "#d97706",
      textPrimary: "#1c1917",
      textSecondary: "#57534e",
    },
  },
  {
    id: "midnight-cobalt",
    name: "Midnight Cobalt — Telemetry Cyan",
    category: "dark",
    defaultMode: "dark",
    description: {
      "pt-BR": "Engenharia aeroespacial em azul abissal e ciano luminoso (Dark & Soft White).",
      "en-US": "Aerospace engineering in abyssal blue and luminous cyan (Dark & Soft White).",
      "es-ES": "Ingeniería aeroespacial en azul abisal y cian luminoso (Dark & Soft White).",
    },
    colors: {
      mode: "dark",
      bgPrimary: "#050a14",
      bgSecondary: "#091224",
      surfaceCode: "#040810",
      accent: "#06b6d4",
      textPrimary: "#f0f9ff",
      textSecondary: "#93c5fd",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#050a14",
      bgSecondary: "#091224",
      surfaceCode: "#040810",
      accent: "#06b6d4",
      textPrimary: "#f0f9ff",
      textSecondary: "#93c5fd",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e6eef5",
      bgSecondary: "#eef4f9",
      surfaceCode: "#eaf1f7",
      accent: "#0284c7",
      textPrimary: "#082f49",
      textSecondary: "#0369a1",
    },
  },
  {
    id: "architectural-alabaster",
    name: "Architectural Alabaster — Soft Satin Slate",
    category: "light",
    defaultMode: "light",
    description: {
      "pt-BR": "Tema claro acetinado de conforto ocular prolongado com variante escura correspondente.",
      "en-US": "Satin light theme for extended eye comfort with matching dark variant.",
      "es-ES": "Tema claro satinado de confort ocular prolongado con variante oscura correspondiente.",
    },
    colors: {
      mode: "light",
      bgPrimary: "#e9edf3",
      bgSecondary: "#f1f4f9",
      surfaceCode: "#edf0f6",
      accent: "#2563eb",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#0b0f17",
      bgSecondary: "#111827",
      surfaceCode: "#080c14",
      accent: "#3b82f6",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#e9edf3",
      bgSecondary: "#f1f4f9",
      surfaceCode: "#edf0f6",
      accent: "#2563eb",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    },
  },
  {
    id: "alabaster-violet",
    name: "Alabaster Studio — Royal Violet",
    category: "light",
    defaultMode: "light",
    description: {
      "pt-BR": "Tema arquitetônico acetinado com sotaque violeta MATZ nos modos Soft White & Dark.",
      "en-US": "Satin architectural theme with MATZ violet accent in Soft White & Dark modes.",
      "es-ES": "Tema arquitectónico satinado con acento violeta MATZ en modos Soft White y Dark.",
    },
    colors: {
      mode: "light",
      bgPrimary: "#eceaf4",
      bgSecondary: "#f3f1f9",
      surfaceCode: "#efedf7",
      accent: "#7c3aed",
      textPrimary: "#0f0a1c",
      textSecondary: "#4c1d95",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#0d0917",
      bgSecondary: "#151026",
      surfaceCode: "#090612",
      accent: "#8b5cf6",
      textPrimary: "#f5f3ff",
      textSecondary: "#c4b5fd",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#eceaf4",
      bgSecondary: "#f3f1f9",
      surfaceCode: "#efedf7",
      accent: "#7c3aed",
      textPrimary: "#0f0a1c",
      textSecondary: "#4c1d95",
    },
  },
  {
    id: "warm-parchment",
    name: "Warm Parchment — Editorial Paper",
    category: "light",
    defaultMode: "light",
    description: {
      "pt-BR": "Papel técnico aquecido para leitura prolongada sem fadiga visual (Soft White & Dark).",
      "en-US": "Warm technical paper for extended code reading without eye strain (Soft White & Dark).",
      "es-ES": "Papel técnico cálido para lectura prolongada sin fatiga visual (Soft White & Dark).",
    },
    colors: {
      mode: "light",
      bgPrimary: "#ede8df",
      bgSecondary: "#f4f0e8",
      surfaceCode: "#f0ece3",
      accent: "#d97706",
      textPrimary: "#1c1917",
      textSecondary: "#57534e",
    },
    darkColors: {
      mode: "dark",
      bgPrimary: "#12100e",
      bgSecondary: "#1c1917",
      surfaceCode: "#0c0a09",
      accent: "#f59e0b",
      textPrimary: "#f5f5f4",
      textSecondary: "#a8a29e",
    },
    lightColors: {
      mode: "light",
      bgPrimary: "#ede8df",
      bgSecondary: "#f4f0e8",
      surfaceCode: "#f0ece3",
      accent: "#d97706",
      textPrimary: "#1c1917",
      textSecondary: "#57534e",
    },
  },
];

const DEFAULT_CUSTOM_THEME: MatzCustomThemeColors = {
  mode: "dark",
  bgPrimary: "#090d16",
  bgSecondary: "#101726",
  surfaceCode: "#060911",
  accent: "#38bdf8",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
};

export function getMatzThemeMode(): "dark" | "light" {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    }
    if (typeof document !== "undefined") {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") return attr;
    }
  } catch {
    // ignore
  }
  return "dark";
}

export function getMatzCustomTheme(): MatzCustomThemeColors {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MatzCustomThemeColors>;
        return {
          mode: parsed.mode === "light" ? "light" : "dark",
          bgPrimary: parsed.bgPrimary || DEFAULT_CUSTOM_THEME.bgPrimary,
          bgSecondary: parsed.bgSecondary || DEFAULT_CUSTOM_THEME.bgSecondary,
          surfaceCode: parsed.surfaceCode || DEFAULT_CUSTOM_THEME.surfaceCode,
          accent: parsed.accent || DEFAULT_CUSTOM_THEME.accent,
          textPrimary: parsed.textPrimary || DEFAULT_CUSTOM_THEME.textPrimary,
          textSecondary: parsed.textSecondary || DEFAULT_CUSTOM_THEME.textSecondary,
        };
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CUSTOM_THEME };
}

export function saveMatzCustomTheme(custom: MatzCustomThemeColors): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(custom));
    }
  } catch {
    // ignore
  }
  applyMatzThemeFamily("custom", custom, custom.mode);
}

export function getMatzActiveThemeFamily(): MatzThemeFamilyId {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(THEME_FAMILY_STORAGE_KEY) as MatzThemeFamilyId | null;
      if (saved && (saved === "custom" || MATZ_THEME_FAMILIES.some((f) => f.id === saved))) {
        return saved;
      }
    }
  } catch {
    // ignore
  }
  return "specular-obsidian-blue";
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || "#3b82f6").replace("#", "").trim();
  if (clean.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildComplementaryVariant(base: MatzCustomThemeColors, targetMode: "dark" | "light"): MatzCustomThemeColors {
  if (base.mode === targetMode) return base;
  if (targetMode === "light") {
    return {
      mode: "light",
      bgPrimary: "#e9edf3",
      bgSecondary: "#f1f4f9",
      surfaceCode: "#edf0f6",
      accent: base.accent,
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    };
  }
  return {
    mode: "dark",
    bgPrimary: "#080a10",
    bgSecondary: "#0c0f18",
    surfaceCode: "#06080d",
    accent: base.accent,
    textPrimary: "#f4f6fb",
    textSecondary: "#9ba3be",
  };
}

export function applyMatzThemeFamily(
  familyId: MatzThemeFamilyId,
  customOverride?: MatzCustomThemeColors,
  modeOverride?: "dark" | "light"
): MatzCustomThemeColors {
  let colors: MatzCustomThemeColors;
  let targetMode: "dark" | "light";

  if (familyId === "custom") {
    const baseCustom = customOverride || getMatzCustomTheme();
    targetMode = modeOverride || baseCustom.mode;
    colors = buildComplementaryVariant(baseCustom, targetMode);
  } else {
    const found = MATZ_THEME_FAMILIES.find((f) => f.id === familyId) || MATZ_THEME_FAMILIES[0];
    targetMode = modeOverride || found.defaultMode;
    colors = targetMode === "light" ? found.lightColors : found.darkColors;
  }

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_FAMILY_STORAGE_KEY, familyId);
      localStorage.setItem(THEME_MODE_STORAGE_KEY, targetMode);
    }
  } catch {
    // ignore
  }

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", targetMode);
    root.setAttribute("data-theme-family", familyId);

    const isLight = targetMode === "light";
    const isToneOnTone = familyId === "monolith-tone-on-tone";
    const subtleBg = isLight
      ? `color-mix(in srgb, ${colors.bgPrimary} 88%, #d8e0eb)`
      : `color-mix(in srgb, ${colors.bgSecondary} 75%, #1e293b)`;
    const hoverBg = isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.05)";
    const activeBg = isLight ? "rgba(15, 23, 42, 0.09)" : "rgba(255, 255, 255, 0.09)";
    const borderCol = isLight ? "rgba(15, 23, 42, 0.11)" : "rgba(255, 255, 255, 0.08)";
    const borderStrongCol = isLight ? "rgba(15, 23, 42, 0.18)" : "rgba(255, 255, 255, 0.14)";
    const mutedText = isToneOnTone
      ? isLight
        ? "#64646d"
        : "#52525b"
      : isLight
      ? "#5b687b"
      : "#64748b";
    const iconTone = isToneOnTone
      ? isLight
        ? "#52525b"
        : "#71717a"
      : colors.textSecondary;

    root.style.setProperty("--bg-primary", colors.bgPrimary);
    root.style.setProperty("--bg-secondary", colors.bgSecondary);
    root.style.setProperty("--bg-tertiary", subtleBg);
    root.style.setProperty("--bg-elevated", colors.bgSecondary);
    root.style.setProperty("--bg-hover", hoverBg);
    root.style.setProperty("--bg-active", activeBg);
    root.style.setProperty("--bg-input", colors.surfaceCode);

    root.style.setProperty("--surface-base", colors.bgPrimary);
    root.style.setProperty("--surface-canvas", colors.bgPrimary);
    root.style.setProperty("--surface-elevated", colors.bgSecondary);
    root.style.setProperty("--surface-subtle", subtleBg);
    root.style.setProperty("--surface-hover", hoverBg);
    root.style.setProperty("--surface-active", activeBg);
    root.style.setProperty("--surface-input", colors.surfaceCode);
    root.style.setProperty("--surface-card", colors.bgSecondary);
    root.style.setProperty("--surface-card-solid", colors.bgSecondary);
    root.style.setProperty("--surface-code", colors.surfaceCode);

    root.style.setProperty("--border", borderCol);
    root.style.setProperty("--border-subtle", borderCol);
    root.style.setProperty("--border-strong", borderStrongCol);

    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-hover", colors.accent);
    root.style.setProperty("--accent-muted", hexToRgba(colors.accent, isLight ? 0.12 : 0.16));
    root.style.setProperty("--accent-glow", hexToRgba(colors.accent, isLight ? 0.25 : 0.38));

    root.style.setProperty("--text-primary", colors.textPrimary);
    root.style.setProperty("--text-secondary", colors.textSecondary);
    root.style.setProperty("--text-muted", mutedText);
    root.style.setProperty("--icon-tone", iconTone);

    const savedBrightness = getMatzScreenBrightness();
    if (savedBrightness !== 100) {
      root.style.setProperty("--matz-screen-brightness", String(savedBrightness / 100));
      root.style.filter = `brightness(${savedBrightness / 100})`;
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("matz:theme-changed", {
        detail: { theme: targetMode, familyId, colors },
      })
    );
  }

  return colors;
}

export function setMatzThemeMode(mode: "dark" | "light"): "dark" | "light" {
  const familyId = getMatzActiveThemeFamily();
  applyMatzThemeFamily(familyId, undefined, mode);
  return mode;
}

export function toggleMatzThemeMode(): "dark" | "light" {
  const cur = getMatzThemeMode();
  const next = cur === "dark" ? "light" : "dark";
  return setMatzThemeMode(next);
}

let memoryZoomPct = 100;
let memoryBrightnessPct = 100;

export function getMatzZoomLevel(): number {
  try {
    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      const raw = Number(localStorage.getItem(ZOOM_STORAGE_KEY));
      if (Number.isFinite(raw) && raw >= 75 && raw <= 160) {
        memoryZoomPct = Math.round(raw);
        return memoryZoomPct;
      }
    }
  } catch {
    // ignore
  }
  return memoryZoomPct;
}

export function setMatzZoomLevel(pct: number, targetSelector = "#app"): number {
  const clamped = Math.max(80, Math.min(150, Math.round(pct / 5) * 5));
  memoryZoomPct = clamped;
  try {
    if (typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
      localStorage.setItem(ZOOM_STORAGE_KEY, String(clamped));
    }
  } catch {
    // ignore
  }

  if (typeof document !== "undefined") {
    const z = clamped / 100;
    const root = document.documentElement;
    root.style.setProperty("--matz-zoom", String(z));
    // Apply native Chromium root zoom without mutating #app 100vw/100vh dimensions (zero ResizeObserver oscillation)
    (root.style as unknown as Record<string, string>).zoom = clamped === 100 ? "" : `${clamped}%`;

    const appEl = document.querySelector<HTMLElement>(targetSelector);
    if (appEl) {
      (appEl.style as unknown as Record<string, string>).zoom = "";
      appEl.style.width = "100%";
      appEl.style.height = "100%";
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("matz:zoom-changed", { detail: { zoom: clamped } }));
  }

  return clamped;
}

export function stepMatzZoomLevel(deltaPct: number, targetSelector = "#app"): number {
  return setMatzZoomLevel(getMatzZoomLevel() + deltaPct, targetSelector);
}

export function resetMatzZoomLevel(targetSelector = "#app"): number {
  return setMatzZoomLevel(100, targetSelector);
}

export function getMatzScreenBrightness(): number {
  try {
    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      const raw = Number(localStorage.getItem(BRIGHTNESS_STORAGE_KEY));
      if (Number.isFinite(raw) && raw >= 55 && raw <= 115) {
        memoryBrightnessPct = Math.round(raw);
        return memoryBrightnessPct;
      }
    }
  } catch {
    // ignore
  }
  return memoryBrightnessPct;
}

export function setMatzScreenBrightness(pct: number): number {
  const clamped = Math.max(55, Math.min(115, Math.round(pct / 5) * 5));
  memoryBrightnessPct = clamped;
  try {
    if (typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
      localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(clamped));
    }
  } catch {
    // ignore
  }

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--matz-screen-brightness", String(clamped / 100));
    root.style.filter = clamped === 100 ? "" : `brightness(${clamped / 100})`;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("matz:brightness-changed", { detail: { brightness: clamped } }));
  }

  return clamped;
}

export function stepMatzScreenBrightness(deltaPct: number): number {
  return setMatzScreenBrightness(getMatzScreenBrightness() + deltaPct);
}

export function resetMatzScreenBrightness(): number {
  return setMatzScreenBrightness(100);
}
