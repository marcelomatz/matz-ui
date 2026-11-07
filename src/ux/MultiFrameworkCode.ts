import { showMatzToast } from '../primitives/TitleBar';

export type FrameworkID = 'vanilla' | 'wails' | 'react' | 'vue' | 'svelte';
export type CssStackID = 'matz-css' | 'tailwind' | 'scss-modules';

let globalCopyInitialized = false;

function ensureGlobalCopyDelegate(): void {
  if (globalCopyInitialized || typeof document === 'undefined') return;
  globalCopyInitialized = true;

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-matz-copy-code], [data-matz-copy-text]'
    );
    if (!target) return;

    const encodedCode = target.getAttribute('data-matz-copy-code');
    const rawText = target.getAttribute('data-matz-copy-text');
    const textToCopy = encodedCode ? decodeURIComponent(encodedCode) : rawText || '';
    if (!textToCopy) return;

    navigator.clipboard?.writeText(textToCopy);
    const prevHtml = target.innerHTML;
    target.innerHTML = '✓ Copiado!';
    target.classList.add('copied');
    showMatzToast('Trecho copiado para a área de transferência!');

    setTimeout(() => {
      target.innerHTML = prevHtml;
      target.classList.remove('copied');
    }, 1500);
  });
}

export interface MultiFrameworkInput {
  id: string;
  title: string;
  vanillaCode: string;
  tokens: Array<[string, string, string]>;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * Colorized Studio Syntax Highlighter with Line Numbers
 * Tokenizes strings, comments, keywords, HTML/JSX tags, attributes, functions, and numbers
 * in a single pass so tokens never corrupt each other.
 */
export function highlightMatzCode(rawCode: string, langLabel = 'TypeScript / HTML5'): string {
  const escaped = rawCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokenRegex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(&lt;\/?[a-zA-Z0-9_-]+|\/?&gt;)|\b(import|from|export|default|function|const|let|var|return|async|await|interface|type|class|new|if|else|for|of|in|true|false|null|undefined|void|package|func|struct|defer|go|chan|select|case|switch)\b|(\b[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=))|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())|(\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%|vh|vw)?\b)|(--[a-zA-Z0-9_-]+|@[a-zA-Z_-]+)/g;

  const colorized = escaped.replace(
    tokenRegex,
    (
      match,
      comment,
      str,
      htmlTag,
      keyword,
      attrName,
      fnCall,
      numUnit,
      cssToken
    ) => {
      if (comment) return `<span class="matz-syn-comment">${comment}</span>`;
      if (str) return `<span class="matz-syn-string">${str}</span>`;
      if (htmlTag) return `<span class="matz-syn-tag">${htmlTag}</span>`;
      if (keyword) return `<span class="matz-syn-keyword">${keyword}</span>`;
      if (attrName) return `<span class="matz-syn-attr">${attrName}</span>`;
      if (fnCall) return `<span class="matz-syn-fn">${fnCall}</span>`;
      if (numUnit) return `<span class="matz-syn-num">${numUnit}</span>`;
      if (cssToken) return `<span class="matz-syn-token">${cssToken}</span>`;
      return match;
    }
  );

  ensureGlobalCopyDelegate();

  const lines = colorized.split('\n');
  const numberedLines = lines
    .map(
      (line, idx) =>
        `<div class="matz-code-line"><span class="matz-code-ln">${idx + 1}</span><span class="matz-code-src">${line || ' '}</span></div>`
    )
    .join('');

  const encodedRaw = encodeURIComponent(rawCode);

  return `<div class="matz-code-header"><span class="matz-code-dots"><i></i><i></i><i></i></span><div style="display:flex;align-items:center;gap:10px;min-width:0;"><span class="matz-code-lang" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${langLabel}</span><button type="button" class="matz-code-copy-btn" data-matz-copy-code="${encodedRaw}" aria-label="Copiar código">⧉ Copiar</button></div></div><div class="matz-code-body">${numberedLines}</div>`;
}

export function generateMultiFrameworkSnippet(
  spec: MultiFrameworkInput,
  fw: FrameworkID,
  css: CssStackID
): string {
  const compName = `Matz${toPascalCase(spec.id)}`;

  const cssHeader =
    css === 'matz-css'
      ? `import '@matz/ui/styles.css';`
      : css === 'tailwind'
      ? `// Tailwind CSS v4 / v3 integrado aos tokens semânticos da @matz/ui\nimport '@matz/ui/styles.css';`
      : `// CSS Modules / SCSS com tokens semânticos var(--surface-*) e var(--accent)\nimport styles from './${compName}.module.scss';`;

  const tailwindNote =
    css === 'tailwind'
      ? `\n// Classes utilitárias Tailwind mapeadas: bg-[var(--surface-card)] border-[var(--border)] text-[var(--text-primary)] focus:ring-[var(--accent)]`
      : css === 'scss-modules'
      ? `\n// Exemplo SCSS: .wrapper { background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius-md); }`
      : '';

  if (fw === 'vanilla') {
    return `// Padrão Oficial: Vanilla TypeScript + HTML5 + CSS3 Semântico\n${cssHeader}${tailwindNote}\n\n${spec.vanillaCode}`;
  }

  if (fw === 'wails') {
    return `// 1. Frontend Vanilla TypeScript com Camada Nativa @matz/ui/wails
${cssHeader}
import { createMatzWailsBridge } from '@matz/ui/wails';

const wails = createMatzWailsBridge({
  windowControls: true,
  eventsIPC: true,
  nativeDialogs: true,
  serviceBinder: true,
});

${spec.vanillaCode}

// 2. Backend Go 1.27.3 + Wails (main.go)
package main

import (
    "context"
    "fmt"
)

type ${compName}Service struct{}

func (s *${compName}Service) ExecuteNativeAction(ctx context.Context, payload string) (string, error) {
    return fmt.Sprintf("Wails IPC OK :: %s", payload), nil
}`;
  }

  if (fw === 'react') {
    return `'use client';
import React, { useEffect, useRef } from 'react';
${cssHeader}${tailwindNote}

export interface ${compName}Props {
  theme?: 'dark' | 'light';
  className?: string;
}

/**
 * ${spec.title} — Adaptador React 19 / Next.js 15 (App Router)
 */
export function ${compName}({ theme = 'dark', className = '' }: ${compName}Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    ${spec.vanillaCode
      .split('\n')
      .map((l) => `    ${l}`)
      .join('\n')
      .trim()}
  }, [theme]);

  return (
    <section
      ref={hostRef}
      data-theme={theme}
      className={\`matz-react-surface \${className}\`}
    />
  );
}`;
  }

  if (fw === 'vue') {
    return `<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
${cssHeader}${tailwindNote}

const props = withDefaults(defineProps<{
  theme?: 'dark' | 'light';
}>(), {
  theme: 'dark',
});

const container = ref<HTMLElement | null>(null);

function mountComponent() {
  if (!container.value) return;
  ${spec.vanillaCode
    .split('\n')
    .map((l) => `  ${l}`)
    .join('\n')
    .trim()}
}

onMounted(mountComponent);
watch(() => props.theme, mountComponent);
</script>

<template>
  <section ref="container" :data-theme="props.theme" class="matz-vue-surface" />
</template>`;
  }

  return `<script lang="ts">
  import { onMount } from 'svelte';
  ${cssHeader}${tailwindNote}

  let { theme = 'dark' }: { theme?: 'dark' | 'light' } = $props();
  let container: HTMLElement;

  onMount(() => {
    if (!container) return;
    ${spec.vanillaCode
      .split('\n')
      .map((l) => `    ${l}`)
      .join('\n')
      .trim()}
  });
</script>

<section bind:this={container} data-theme={theme} class="matz-svelte-surface"></section>`;
}

export function generateCssConfigExport(stack: CssStackID, accentHex: string, radiusMd: number): string {
  if (stack === 'tailwind') {
    return `/* Tailwind CSS v4 (@theme) & Tailwind v3 Preset para @matz/ui */
@import "tailwindcss";
@import "@matz/ui/styles.css";

@theme {
  --color-matz-canvas: var(--surface-canvas);
  --color-matz-card: var(--surface-card-solid);
  --color-matz-input: var(--surface-input);
  --color-matz-popover: var(--surface-popover);
  --color-matz-accent: ${accentHex};
  --color-matz-border: var(--border);
  --radius-matz-sm: ${Math.max(2, radiusMd - 3)}px;
  --radius-matz-md: ${radiusMd}px;
  --radius-matz-lg: ${radiusMd + 4}px;
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}`;
  }

  if (stack === 'scss-modules') {
    return `// _matz-tokens.scss — Sass / CSS Modules Design System Mixins
$matz-accent: ${accentHex};
$matz-radius-md: ${radiusMd}px;

@mixin matz-specular-surface {
  background: var(--surface-card);
  background-color: var(--surface-card-solid);
  border: 1px solid var(--border);
  border-top-color: var(--border-specular-top);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-specular);
}

@mixin matz-input-control {
  background-color: var(--surface-input);
  color: var(--text-primary);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-muted);
  }
}`;
  }

  return `:root {
  --accent: ${accentHex};
  --radius-sm: ${Math.max(2, radiusMd - 3)}px;
  --radius-md: ${radiusMd}px;
  --radius-lg: ${radiusMd + 4}px;
  --surface-canvas: #080a10;
  --surface-card-solid: #0c0f18;
  --surface-input: #0a0d15;
  --text-primary: #f4f6fb;
  --text-secondary: #9ba3be;
}`;
}
