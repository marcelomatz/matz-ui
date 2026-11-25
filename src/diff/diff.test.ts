import { describe, it, expect } from "vitest";
import {
  parseUnifiedDiff,
  computeLineDiff,
  computeIntralineSegments,
  buildSplitDiffRows,
  applySmartPatch,
  applySmartPatches,
  parseSmartPatchBlocks,
  stripThinkingBlocks,
  extractThinkingBlocks,
  parseAgentCodeActions,
  getSavedMatzDiffMode,
  setSavedMatzDiffMode,
} from "./DiffEngine";
import { getMatzLocale, setMatzLocale, matzPick } from "../i18n/index";
import { parseCurlCommandToRequest } from "../modules/ApiClientModule";

describe("@matz/ui/diff — DiffEngine", () => {
  it("parseUnifiedDiff analisa arquivos, hunks, números de linha e destaque intralinha", () => {
    const raw = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
 const a = 1;
-const b = 2;
+const b = 20;
+const c = 30;
 export { a, b };
`;
    const doc = parseUnifiedDiff(raw);
    expect(doc.totalFiles).toBe(1);
    expect(doc.totalAdditions).toBe(2);
    expect(doc.totalDeletions).toBe(1);
    expect(doc.files[0].newPath).toBe("src/app.ts");
    expect(doc.files[0].hunks).toHaveLength(1);

    const rows = buildSplitDiffRows(doc.files[0].hunks[0]);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const changedRow = rows.find((r) => r.left.kind === "del" && r.right.kind === "add");
    expect(changedRow).toBeDefined();
    expect(changedRow?.left.segments?.some((s) => s.changed)).toBe(true);
    expect(changedRow?.right.segments?.some((s) => s.changed)).toBe(true);
  });

  it("computeLineDiff calcula diff LCS em memória entre dois textos", () => {
    const doc = computeLineDiff(
      "# Título\nLinha original\nFim",
      "# Título\nLinha atualizada\nNova linha\nFim",
      "README.md"
    );
    expect(doc.totalFiles).toBe(1);
    expect(doc.totalAdditions).toBe(2);
    expect(doc.totalDeletions).toBe(1);
  });

  it("computeIntralineSegments identifica exatamente os tokens modificados", () => {
    const { oldSegs, newSegs } = computeIntralineSegments("version: '0.1.0'", "version: '0.2.0'");
    expect(oldSegs.some((s) => s.changed && s.text.includes("0.1.0"))).toBe(true);
    expect(newSegs.some((s) => s.changed && s.text.includes("0.2.0"))).toBe(true);
  });

  it("applySmartPatch executa a cascata de 4 níveis (exact, whitespace, line_trimmed, anchor)", () => {
    const src = "function soma(x: number) {\n  const a = x * 2;\n  const b = a + 10;\n  const c = b - 1;\n  return c;\n}";

    const r1 = applySmartPatch(src, "  const a = x * 2;", "  const a = x * 4;");
    expect(r1.success).toBe(true);
    expect(r1.strategyUsed).toBe("exact");
    expect(r1.result).toContain("x * 4");

    const r2 = applySmartPatch("linha1   \nlinha2\n", "linha1\nlinha2", "linhaNova");
    expect(r2.success).toBe(true);
    expect(r2.strategyUsed).toBe("whitespace");

    const r3 = applySmartPatch(src, "const a = x * 2;\nconst b = a + 10;", "  const a = x * 8;\n  const b = a + 20;");
    expect(r3.success).toBe(true);
    expect(r3.strategyUsed).toBe("line_trimmed");

    const r4 = applySmartPatch(
      src,
      "function soma(x: number) {\n  const a = x * 2;\n  // ... omitido\n  const c = b - 1;\n  return c;",
      "function soma(x: number) {\n  return x * 100;"
    );
    expect(r4.success).toBe(true);
    expect(r4.strategyUsed).toBe("anchor");
    expect(r4.result).toContain("return x * 100");
  });

  it("parseAgentCodeActions extrai ações write, patch, delete e run removendo blocos <think>", () => {
    const llmOutput = `
<thought_process>Analisando o erro de build...</thought_process>
Vou aplicar o patch em \`src/index.ts\`:
\`\`\`ts:src/index.ts
<<<<<<< SEARCH
const oldVal = 1;
=======
const newVal = 2;
>>>>>>> REPLACE
\`\`\`
\`\`\`bash:run
npm test
\`\`\`
`;
    const thoughts = extractThinkingBlocks(llmOutput);
    expect(thoughts).toHaveLength(1);
    expect(stripThinkingBlocks(llmOutput)).not.toContain("Analisando o erro");

    const actions = parseAgentCodeActions(llmOutput);
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe("patch");
    expect(actions[0].filePath).toBe("src/index.ts");
    expect(actions[0].patches).toHaveLength(1);

    const patched = applySmartPatches("const oldVal = 1;\n", parseSmartPatchBlocks(actions[0].content));
    expect(patched.success).toBe(true);
    expect(patched.result).toContain("const newVal = 2;");

    expect(actions[1].type).toBe("run");
    expect(actions[1].content).toBe("npm test");
  });

  it("i18n multi-idiomas (pt-BR, en-US, es-ES) e parser cURL do Heapi Engine funcionam com precisão", () => {
    setMatzLocale("en-US");
    expect(getMatzLocale()).toBe("en-US");
    expect(matzPick({ "pt-BR": "Arquivo", "en-US": "File", "es-ES": "Archivo" })).toBe("File");

    setMatzLocale("es-ES");
    expect(matzPick({ "pt-BR": "Arquivo", "en-US": "File", "es-ES": "Archivo" })).toBe("Archivo");

    setMatzLocale("pt-BR");
    expect(matzPick({ "pt-BR": "Arquivo", "en-US": "File", "es-ES": "Archivo" })).toBe("Arquivo");

    const parsedCurl = parseCurlCommandToRequest(
      'curl -X POST "https://api.example.com/v1/users" -H "Authorization: Bearer tok123" -d \'{"name":"Ada"}\''
    );
    expect(parsedCurl.method).toBe("POST");
    expect(parsedCurl.url).toBe("https://api.example.com/v1/users");
    expect(parsedCurl.headers.some((h) => h.key === "Authorization" && h.value.includes("tok123"))).toBe(true);
    expect(parsedCurl.body).toContain("Ada");

    setSavedMatzDiffMode("split");
    expect(getSavedMatzDiffMode("unified")).toBeDefined();
  });
});
