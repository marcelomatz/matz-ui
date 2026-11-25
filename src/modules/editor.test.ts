import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expandMatzEmmet, getMatzCompletions, highlightMatzCode, lintMatzCode } from "./CodeEditorModule";
import {
  MATZ_THEME_FAMILIES,
  getMatzScreenBrightness,
  resetMatzScreenBrightness,
  setMatzScreenBrightness,
  stepMatzScreenBrightness,
} from "../theme/ThemeEngine";

describe("CodeEditorModule IntelliSense & Linter", () => {
  it("provides Go and TypeScript completions combined with document symbols", () => {
    const goCode = "package main\n\nfunc calculateChecksum() {\n\tfmt\n}";
    const res = getMatzCompletions(goCode, goCode.indexOf("fmt") + 3, "go");
    expect(res.prefix).toBe("fmt");
    expect(res.items.some((i) => i.label.startsWith("fmt."))).toBe(true);

    const symRes = getMatzCompletions(goCode + "\ncalc", goCode.length + 5, "go");
    expect(symRes.items.some((i) => i.label === "calculateChecksum")).toBe(true);
  });

  it("detects structural bracket mismatches, unclosed strings, and missing Go package", () => {
    const badGo = 'func test() {\n\ts := "unclosed\n\tif true {\n}\n';
    const diags = lintMatzCode(badGo, "go");
    expect(diags.some((d) => d.code === "GO_MISSING_PACKAGE")).toBe(true);
    expect(diags.some((d) => d.code === "UNCLOSED_STRING")).toBe(true);
    expect(diags.some((d) => d.code === "UNCLOSED_BRACKET")).toBe(true);
  });

  it("validates JSON syntax and Lua != operator", () => {
    const badJson = '{ "name": "byCode", }';
    const jsonDiags = lintMatzCode(badJson, "json");
    expect(jsonDiags.length).toBeGreaterThan(0);

    const badLua = "if a != b then\n  print(a)\nend";
    const luaDiags = lintMatzCode(badLua, "lua");
    expect(luaDiags.some((d) => d.code === "LUA_NOT_EQUAL")).toBe(true);
  });

  it("recognizes nested template literals, ${...} interpolations, embedded HTML/CSS, and regex literals with zero false positives", () => {
    const nestedSnippet = `
      host.innerHTML = \`
        <div style="display:grid;gap:16px;">
          \${Array.from({ length: Math.min(6, Math.max(2, count)) })
            .map(
              (_, idx) => \`
              <div class="matz-card" style="padding:20px;opacity:\${
                toggled ? '1' : '0.55'
              };">
                <span>\${config.title.split(',')[0]} #\${idx + 1}</span>
              </div>\`
            )
            .join("")}
        </div>
      \`;
    `;
    expect(lintMatzCode(nestedSnippet, "typescript")).toEqual([]);

    const html = highlightMatzCode(nestedSnippet, "typescript");
    expect(html).toContain("matz-tok-interp");
    expect(html).toContain("matz-tok-tag");
    expect(html).toContain("matz-tok-type");

    // Validate against real production files with deeply nested templates & complex regexes
    const catalogFile = readFileSync(resolve(__dirname, "../components/CatalogExpansionComponents.ts"), "utf-8");
    expect(lintMatzCode(catalogFile, "typescript")).toEqual([]);

    const editorFile = readFileSync(resolve(__dirname, "./CodeEditorModule.ts"), "utf-8");
    expect(lintMatzCode(editorFile, "typescript")).toEqual([]);
  });

  it("expands Emmet abbreviations for HTML, CSS, JS/TS, and embedded Template Literals on Tab/Enter", () => {
    // 1. HTML5 boilerplate (!) and complex HTML hierarchy (ul>li.item-$*3)
    const htmlDoc = expandMatzEmmet("!", 1, "html");
    expect(htmlDoc?.insertText).toContain("<!DOCTYPE html>");

    const htmlList = expandMatzEmmet("ul>li.item-$*3", 14, "html");
    expect(htmlList?.insertText).toBe(
      '<ul>\n  <li class="item-1"></li>\n  <li class="item-2"></li>\n  <li class="item-3"></li>\n</ul>'
    );

    // 2. CSS static & numeric Emmet (dfc, m12, w100p, fw700)
    expect(expandMatzEmmet("  dfc", 5, "css")?.insertText).toContain("display: flex;");
    expect(expandMatzEmmet("  m12", 5, "css")?.insertText).toBe("margin: 12px;");
    expect(expandMatzEmmet("  w100p", 7, "css")?.insertText).toBe("width: 100%;");
    expect(expandMatzEmmet("  fw700", 7, "css")?.insertText).toBe("font-weight: 700;");

    // 3. JS/TS Emmet shorthands (clg, afn, tryc) & non-interference with normal obj.prop
    const clg = expandMatzEmmet("  clg", 5, "typescript");
    expect(clg?.insertText).toBe("console.log();");
    expect(clg?.cursorBackOffset).toBe(2);

    expect(expandMatzEmmet("  config.customRender", 21, "typescript")).toBeNull();

    // 4. Embedded HTML & inline style="..." inside TS Template Literals
    const tplHtmlCode = "const html = `\n  div.matz-card>span.badge{Ativo}";
    const tplHtmlExp = expandMatzEmmet(tplHtmlCode, tplHtmlCode.length, "typescript");
    expect(tplHtmlExp?.insertText).toBe(
      '<div class="matz-card">\n  <span class="badge">Ativo</span>\n</div>'
    );

    const tplStyleCode = 'const html = `<div style="p20';
    const tplStyleExp = expandMatzEmmet(tplStyleCode, tplStyleCode.length, "typescript");
    expect(tplStyleExp?.insertText).toBe("padding: 20px;");

    // 5. Autocomplete popup places Emmet match at index 0
    const completions = getMatzCompletions("  clg", 5, "typescript");
    expect(completions.items[0]?.kind).toBe("emmet");
    expect(completions.items[0]?.insertText).toBe("console.log();");
  });

  it("ensures every @matz/ui theme family provides both darkColors and softened lightColors palettes, including Linear+Raycast+Warp and Monolith Tone-on-Tone", () => {
    expect(MATZ_THEME_FAMILIES.length).toBeGreaterThanOrEqual(11);
    expect(MATZ_THEME_FAMILIES.some((f) => f.id === "precision-specular-glass")).toBe(true);
    expect(MATZ_THEME_FAMILIES.some((f) => f.id === "monolith-tone-on-tone")).toBe(true);

    for (const fam of MATZ_THEME_FAMILIES) {
      expect(fam.darkColors.bgPrimary).toMatch(/^#/);
      expect(fam.lightColors.bgPrimary).toMatch(/^#/);
      // Light mode should be softened satin alabaster/stone rather than glaring #ffffff
      expect(fam.lightColors.bgPrimary.toLowerCase()).not.toBe("#ffffff");
      expect(fam.lightColors.bgSecondary.toLowerCase()).not.toBe("#ffffff");
      expect(fam.darkColors.textPrimary).not.toBe(fam.lightColors.textPrimary);
    }

    // Screen brightness clamping and stepping
    expect(setMatzScreenBrightness(90)).toBe(90);
    expect(stepMatzScreenBrightness(-10)).toBe(80);
    expect(setMatzScreenBrightness(20)).toBe(55);
    expect(resetMatzScreenBrightness()).toBe(100);
    expect(getMatzScreenBrightness()).toBe(100);
  });
});
