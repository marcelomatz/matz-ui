/**
 * @matz/ui/diff — Motor Unificado e Side-by-Side (Split) de Análise e Visualização de Diffs
 * Projetado para uso em toda a suíte MATZ (Matz Hub, byCode IDE, Writtt Vault, Heapi HTTP e myTerm).
 */
import { matzIcon } from "../icons/Icons";
import { showMatzToast } from "../primitives/TitleBar";
import { matzT } from "../i18n/index";

const DIFF_MODE_STORAGE_KEY = "matz-diff-view-mode";

export function getSavedMatzDiffMode(fallback: "unified" | "split" = "unified"): "unified" | "split" {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(DIFF_MODE_STORAGE_KEY);
      if (saved === "unified" || saved === "split") {
        return saved;
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}

export function setSavedMatzDiffMode(mode: "unified" | "split"): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DIFF_MODE_STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
}

export type DiffLineKind = "context" | "add" | "del";

export interface IntralineSegment {
  text: string;
  changed: boolean;
}

export interface ParsedDiffLine {
  kind: DiffLineKind;
  oldLine?: number;
  newLine?: number;
  content: string;
  intraline?: IntralineSegment[];
}

export interface ParsedDiffHunk {
  header: string;
  sectionHint: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: ParsedDiffLine[];
}

export interface ParsedDiffFile {
  oldPath: string;
  newPath: string;
  status: "modified" | "added" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  hunks: ParsedDiffHunk[];
}

export interface ParsedDiffDocument {
  files: ParsedDiffFile[];
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
}

export interface SplitDiffCell {
  lineNumber?: number;
  kind: "empty" | "context" | "add" | "del";
  content: string;
  segments?: IntralineSegment[];
}

export interface SplitDiffRow {
  left: SplitDiffCell;
  right: SplitDiffCell;
}

export interface MatzDiffViewerOptions {
  /** Patch Unified Diff bruto (git diff) OU par { before, after, fileName } */
  patch?: string;
  beforeAfter?: { before: string; after: string; fileName?: string };
  initialMode?: "unified" | "split";
  compact?: boolean;
  maxHeightPx?: number;
  title?: string;
}

const HUNK_RE = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/;

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Calcula o destaque intralinha (token/palavra) entre uma linha removida (-) e uma linha adicionada (+).
 */
export function computeIntralineSegments(
  oldLine: string,
  newLine: string
): { oldSegs: IntralineSegment[]; newSegs: IntralineSegment[] } {
  const tokenize = (s: string): string[] => s.match(/(\s+|[\w.-]+|[^\s\w.-]+)/g) || [];
  const oldToks = tokenize(oldLine);
  const newToks = tokenize(newLine);

  // Limite de segurança para linhas muito longas mantendo O(1) percebido na UI
  if (oldToks.length > 140 || newToks.length > 140) {
    return {
      oldSegs: [{ text: oldLine, changed: true }],
      newSegs: [{ text: newLine, changed: true }],
    };
  }

  const m = oldToks.length;
  const n = newToks.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldToks[i] === newToks[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const oldRaw: IntralineSegment[] = [];
  const newRaw: IntralineSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldToks[i] === newToks[j]) {
      oldRaw.push({ text: oldToks[i], changed: false });
      newRaw.push({ text: newToks[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      oldRaw.push({ text: oldToks[i], changed: true });
      i++;
    } else {
      newRaw.push({ text: newToks[j], changed: true });
      j++;
    }
  }
  while (i < m) {
    oldRaw.push({ text: oldToks[i++], changed: true });
  }
  while (j < n) {
    newRaw.push({ text: newToks[j++], changed: true });
  }

  const mergeSegs = (segs: IntralineSegment[]): IntralineSegment[] => {
    const merged: IntralineSegment[] = [];
    for (const s of segs) {
      const last = merged[merged.length - 1];
      if (last && last.changed === s.changed) {
        last.text += s.text;
      } else {
        merged.push({ ...s });
      }
    }
    return merged;
  };

  return {
    oldSegs: mergeSegs(oldRaw),
    newSegs: mergeSegs(newRaw),
  };
}

function enrichHunkWithIntraline(hunk: ParsedDiffHunk): void {
  const lines = hunk.lines;
  let idx = 0;
  while (idx < lines.length) {
    if (lines[idx].kind !== "del") {
      idx++;
      continue;
    }
    const delStart = idx;
    while (idx < lines.length && lines[idx].kind === "del") idx++;
    const delEnd = idx;
    const addStart = idx;
    while (idx < lines.length && lines[idx].kind === "add") idx++;
    const addEnd = idx;

    const pairCount = Math.min(delEnd - delStart, addEnd - addStart);
    for (let k = 0; k < pairCount; k++) {
      const dLine = lines[delStart + k];
      const aLine = lines[addStart + k];
      const { oldSegs, newSegs } = computeIntralineSegments(dLine.content, aLine.content);
      dLine.intraline = oldSegs;
      aLine.intraline = newSegs;
    }
  }
}

/**
 * Analisa uma string Unified Diff (git diff multi-arquivo ou hunk único) em estrutura tipada.
 */
export function parseUnifiedDiff(rawPatch: string): ParsedDiffDocument {
  const normalized = (rawPatch || "").replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    return { files: [], totalFiles: 0, totalAdditions: 0, totalDeletions: 0 };
  }

  const rawLines = normalized.split("\n");
  const files: ParsedDiffFile[] = [];
  let curFile: ParsedDiffFile | null = null;
  let curHunk: ParsedDiffHunk | null = null;
  let oldLn = 1;
  let newLn = 1;

  const flushHunk = () => {
    if (curFile && curHunk) {
      enrichHunkWithIntraline(curHunk);
      curFile.hunks.push(curHunk);
      curHunk = null;
    }
  };

  const flushFile = () => {
    flushHunk();
    if (curFile) {
      files.push(curFile);
      curFile = null;
    }
  };

  for (const line of rawLines) {
    if (line.startsWith("diff --git ")) {
      flushFile();
      const parts = line.trim().split(/\s+/);
      const oldP = (parts[2] || "arquivo").replace(/^a\//, "");
      const newP = (parts[3] || oldP).replace(/^b\//, "");
      curFile = {
        oldPath: oldP,
        newPath: newP,
        status: "modified",
        additions: 0,
        deletions: 0,
        hunks: [],
      };
      continue;
    }

    if (!curFile) {
      if (line.startsWith("--- ")) {
        const p = line.slice(4).trim().replace(/^a\//, "");
        curFile = {
          oldPath: p,
          newPath: p,
          status: "modified",
          additions: 0,
          deletions: 0,
          hunks: [],
        };
        continue;
      }
      if (HUNK_RE.test(line)) {
        curFile = {
          oldPath: "patch",
          newPath: "patch",
          status: "modified",
          additions: 0,
          deletions: 0,
          hunks: [],
        };
      } else {
        continue;
      }
    }

    if (line.startsWith("new file mode")) {
      curFile.status = "added";
      continue;
    }
    if (line.startsWith("deleted file mode")) {
      curFile.status = "deleted";
      continue;
    }
    if (line.startsWith("rename from ")) {
      curFile.status = "renamed";
      curFile.oldPath = line.slice("rename from ".length).trim();
      continue;
    }
    if (line.startsWith("rename to ")) {
      curFile.status = "renamed";
      curFile.newPath = line.slice("rename to ".length).trim();
      continue;
    }
    if (line.startsWith("--- ")) {
      const p = line.slice(4).trim();
      if (p === "/dev/null") curFile.status = "added";
      else curFile.oldPath = p.replace(/^a\//, "");
      continue;
    }
    if (line.startsWith("+++ ")) {
      const p = line.slice(4).trim();
      if (p === "/dev/null") curFile.status = "deleted";
      else curFile.newPath = p.replace(/^b\//, "");
      continue;
    }

    const m = line.match(HUNK_RE);
    if (m) {
      flushHunk();
      const oStart = parseInt(m[1], 10) || 1;
      const oCount = m[2] !== undefined ? parseInt(m[2], 10) : 1;
      const nStart = parseInt(m[3], 10) || 1;
      const nCount = m[4] !== undefined ? parseInt(m[4], 10) : 1;
      oldLn = oStart;
      newLn = nStart;
      curHunk = {
        header: line,
        sectionHint: (m[5] || "").trim(),
        oldStart: oStart,
        oldCount: oCount,
        newStart: nStart,
        newCount: nCount,
        lines: [],
      };
      continue;
    }

    if (curHunk) {
      if (line.startsWith("+")) {
        curFile.additions++;
        curHunk.lines.push({
          kind: "add",
          newLine: newLn++,
          content: line.slice(1),
        });
      } else if (line.startsWith("-")) {
        curFile.deletions++;
        curHunk.lines.push({
          kind: "del",
          oldLine: oldLn++,
          content: line.slice(1),
        });
      } else if (line.startsWith(" ") || line === "") {
        curHunk.lines.push({
          kind: "context",
          oldLine: oldLn++,
          newLine: newLn++,
          content: line.length > 0 ? line.slice(1) : "",
        });
      }
    }
  }

  flushFile();

  let totalAdditions = 0;
  let totalDeletions = 0;
  for (const f of files) {
    totalAdditions += f.additions;
    totalDeletions += f.deletions;
  }

  return {
    files,
    totalFiles: files.length,
    totalAdditions,
    totalDeletions,
  };
}

/**
 * Calcula um diff estruturado linha-a-linha em memória (LCS) entre dois textos arbitrários.
 */
export function computeLineDiff(
  beforeText: string,
  afterText: string,
  fileName = "documento.md"
): ParsedDiffDocument {
  const normBefore = (beforeText || "").replace(/\r\n/g, "\n");
  const normAfter = (afterText || "").replace(/\r\n/g, "\n");
  if (normBefore === normAfter) {
    return { files: [], totalFiles: 0, totalAdditions: 0, totalDeletions: 0 };
  }

  const oldLines = normBefore ? normBefore.split("\n") : [];
  const newLines = normAfter ? normAfter.split("\n") : [];
  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const rawDiff: ParsedDiffLine[] = [];
  let i = 0;
  let j = 0;
  let oLn = 1;
  let nLn = 1;
  let additions = 0;
  let deletions = 0;

  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      rawDiff.push({ kind: "context", oldLine: oLn++, newLine: nLn++, content: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      deletions++;
      rawDiff.push({ kind: "del", oldLine: oLn++, content: oldLines[i++] });
    } else {
      additions++;
      rawDiff.push({ kind: "add", newLine: nLn++, content: newLines[j++] });
    }
  }
  while (i < m) {
    deletions++;
    rawDiff.push({ kind: "del", oldLine: oLn++, content: oldLines[i++] });
  }
  while (j < n) {
    additions++;
    rawDiff.push({ kind: "add", newLine: nLn++, content: newLines[j++] });
  }

  const hunk: ParsedDiffHunk = {
    header: `@@ -1,${m} +1,${n} @@ ${fileName}`,
    sectionHint: fileName,
    oldStart: 1,
    oldCount: m,
    newStart: 1,
    newCount: n,
    lines: rawDiff,
  };
  enrichHunkWithIntraline(hunk);

  const file: ParsedDiffFile = {
    oldPath: fileName,
    newPath: fileName,
    status: "modified",
    additions,
    deletions,
    hunks: [hunk],
  };

  return {
    files: [file],
    totalFiles: 1,
    totalAdditions: additions,
    totalDeletions: deletions,
  };
}

/**
 * Converte um Hunk Unified em linhas alinhadas para exibição Side-by-Side (Split View).
 */
export function buildSplitDiffRows(hunk: ParsedDiffHunk): SplitDiffRow[] {
  const rows: SplitDiffRow[] = [];
  const lines = hunk.lines;
  let i = 0;

  while (i < lines.length) {
    const cur = lines[i];
    if (cur.kind === "context") {
      rows.push({
        left: { lineNumber: cur.oldLine, kind: "context", content: cur.content },
        right: { lineNumber: cur.newLine, kind: "context", content: cur.content },
      });
      i++;
      continue;
    }

    const dels: ParsedDiffLine[] = [];
    while (i < lines.length && lines[i].kind === "del") {
      dels.push(lines[i++]);
    }
    const adds: ParsedDiffLine[] = [];
    while (i < lines.length && lines[i].kind === "add") {
      adds.push(lines[i++]);
    }

    const maxLen = Math.max(dels.length, adds.length);
    for (let k = 0; k < maxLen; k++) {
      const d = dels[k];
      const a = adds[k];
      rows.push({
        left: d
          ? { lineNumber: d.oldLine, kind: "del", content: d.content, segments: d.intraline }
          : { kind: "empty", content: "" },
        right: a
          ? { lineNumber: a.newLine, kind: "add", content: a.content, segments: a.intraline }
          : { kind: "empty", content: "" },
      });
    }
  }

  return rows;
}

function renderSegmentsHtml(content: string, segments?: IntralineSegment[], kind?: "add" | "del"): string {
  if (!segments || segments.length === 0) {
    return escapeHtml(content);
  }
  const hlClass = kind === "add" ? "matz-diff-word-add" : "matz-diff-word-del";
  return segments
    .map((s) => (s.changed ? `<mark class="${hlClass}">${escapeHtml(s.text)}</mark>` : escapeHtml(s.text)))
    .join("");
}

/**
 * Renderiza o componente visual completo de inspeção de Diffs (@matz/ui/diff) com modos Unified e Side-by-Side.
 */
export function renderMatzDiffViewer(container: HTMLElement, options: MatzDiffViewerOptions): void {
  const doc = options.beforeAfter
    ? computeLineDiff(
        options.beforeAfter.before,
        options.beforeAfter.after,
        options.beforeAfter.fileName || "documento.md"
      )
    : parseUnifiedDiff(options.patch || "");

  let viewMode: "unified" | "split" = getSavedMatzDiffMode(options.initialMode || "unified");
  let selectedFileIdx: number | "all" = "all";
  const collapsedFiles = new Set<number>();

  const draw = () => {
    if (doc.files.length === 0) {
      container.innerHTML = `
        <div class="matz-diff-empty">
          <span style="color:#10b981;">${matzIcon("check-circle", 16)}</span>
          <span>${matzT("diff.clean")}</span>
        </div>
      `;
      return;
    }

    const totalChanges = Math.max(1, doc.totalAdditions + doc.totalDeletions);
    const addPct = Math.round((doc.totalAdditions / totalChanges) * 100);
    const visibleFiles =
      selectedFileIdx === "all" ? doc.files : [doc.files[selectedFileIdx]].filter(Boolean);

    container.innerHTML = `
      <div class="matz-diff-viewer">
        <div class="matz-diff-header">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;">
            <span style="display:inline-flex;align-items:center;gap:5px;font-weight:700;font-size:11.5px;color:var(--text-primary);">
              ${matzIcon("git-branch", 12)} ${escapeHtml(options.title || "Matz Diff Analyzer")}
            </span>
            <span class="matz-pill-xs">${doc.totalFiles} ${matzT("diff.files")}</span>
            <span class="matz-pill-xs matz-tabular" style="color:#10b981;border-color:rgba(16,185,129,0.35);">+${
              doc.totalAdditions
            }</span>
            <span class="matz-pill-xs matz-tabular" style="color:#f43f5e;border-color:rgba(244,63,94,0.35);">-${
              doc.totalDeletions
            }</span>
            <div class="matz-diff-ratio-bar" title="+${doc.totalAdditions} / -${doc.totalDeletions}">
              <div style="width:${addPct}%;background:#10b981;height:100%;"></div>
              <div style="width:${100 - addPct}%;background:#f43f5e;height:100%;"></div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
            <button type="button" class="matz-btn-xs ${
              viewMode === "unified" ? "primary" : ""
            }" data-diff-mode="unified">Unified</button>
            <button type="button" class="matz-btn-xs ${
              viewMode === "split" ? "primary" : ""
            }" data-diff-mode="split">Side-by-Side (Split)</button>
            <button type="button" class="matz-btn-xs" id="matz-diff-copy-all" title="${matzT("diff.copyPatch")}">${matzIcon(
              "copy",
              11
            )} ${matzT("diff.copyPatch")}</button>
          </div>
        </div>

        ${
          doc.files.length > 1
            ? `
          <div class="matz-diff-file-tabs">
            <button type="button" class="matz-btn-xs ${
              selectedFileIdx === "all" ? "primary" : ""
            }" data-diff-file-tab="all">${matzT("diff.all")} (${doc.files.length})</button>
            ${doc.files
              .map(
                (f, idx) => `
              <button type="button" class="matz-btn-xs ${
                selectedFileIdx === idx ? "primary" : ""
              }" data-diff-file-tab="${idx}">
                <span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(
                  f.newPath.split("/").pop() || f.newPath
                )}</span>
                <span style="color:#10b981;font-family:var(--font-mono);font-size:9.5px;">+${f.additions}</span>
                <span style="color:#f43f5e;font-family:var(--font-mono);font-size:9.5px;">-${f.deletions}</span>
              </button>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        <div class="matz-diff-scroll" style="${
          options.maxHeightPx ? `max-height:${options.maxHeightPx}px;` : ""
        }">
          ${visibleFiles
            .map((file, idx) => {
              const realIdx = selectedFileIdx === "all" ? idx : (selectedFileIdx as number);
              const isCollapsed = collapsedFiles.has(realIdx);
              return `
                <div class="matz-diff-file-card">
                  <div class="matz-diff-file-bar" data-toggle-file="${realIdx}">
                    <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                      <span>${matzIcon(isCollapsed ? "chevron-right" : "chevron-down", 12)}</span>
                      <span class="matz-pill-xs" style="text-transform:uppercase;font-size:9px;">${escapeHtml(
                        file.status
                      )}</span>
                      <code style="font-size:11px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;">${escapeHtml(
                        file.newPath
                      )}</code>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                      <span class="matz-tabular" style="color:#10b981;font-family:var(--font-mono);font-size:10.5px;font-weight:700;">+${
                        file.additions
                      }</span>
                      <span class="matz-tabular" style="color:#f43f5e;font-family:var(--font-mono);font-size:10.5px;font-weight:700;">-${
                        file.deletions
                      }</span>
                    </div>
                  </div>

                  ${
                    isCollapsed
                      ? ""
                      : file.hunks
                          .map((hunk) => {
                            if (viewMode === "split") {
                              const splitRows = buildSplitDiffRows(hunk);
                              return `
                                <div class="matz-diff-hunk-bar">${escapeHtml(hunk.header)}</div>
                                <table class="matz-diff-table split">
                                  <tbody>
                                    ${splitRows
                                      .map(
                                        (r) => `
                                      <tr>
                                        <td class="matz-diff-ln ${r.left.kind}">${r.left.lineNumber ?? ""}</td>
                                        <td class="matz-diff-code ${r.left.kind}">${
                                          r.left.kind === "del"
                                            ? renderSegmentsHtml(r.left.content, r.left.segments, "del")
                                            : escapeHtml(r.left.content)
                                        }</td>
                                        <td class="matz-diff-ln ${r.right.kind}">${r.right.lineNumber ?? ""}</td>
                                        <td class="matz-diff-code ${r.right.kind}">${
                                          r.right.kind === "add"
                                            ? renderSegmentsHtml(r.right.content, r.right.segments, "add")
                                            : escapeHtml(r.right.content)
                                        }</td>
                                      </tr>
                                    `
                                      )
                                      .join("")}
                                  </tbody>
                                </table>
                              `;
                            }

                            return `
                              <div class="matz-diff-hunk-bar">${escapeHtml(hunk.header)}</div>
                              <table class="matz-diff-table unified">
                                <tbody>
                                  ${hunk.lines
                                    .map(
                                      (ln) => `
                                    <tr class="matz-diff-row ${ln.kind}">
                                      <td class="matz-diff-ln">${ln.oldLine ?? ""}</td>
                                      <td class="matz-diff-ln">${ln.newLine ?? ""}</td>
                                      <td class="matz-diff-sign">${
                                        ln.kind === "add" ? "+" : ln.kind === "del" ? "-" : " "
                                      }</td>
                                      <td class="matz-diff-code ${ln.kind}">${
                                        ln.kind === "add" || ln.kind === "del"
                                          ? renderSegmentsHtml(ln.content, ln.intraline, ln.kind)
                                          : escapeHtml(ln.content)
                                      }</td>
                                    </tr>
                                  `
                                    )
                                    .join("")}
                                </tbody>
                              </table>
                            `;
                          })
                          .join("")
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>("[data-diff-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        viewMode = btn.dataset.diffMode as "unified" | "split";
        setSavedMatzDiffMode(viewMode);
        draw();
      });
    });

    container.querySelectorAll<HTMLButtonElement>("[data-diff-file-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.diffFileTab!;
        selectedFileIdx = val === "all" ? "all" : Number(val);
        draw();
      });
    });

    container.querySelectorAll<HTMLElement>("[data-toggle-file]").forEach((bar) => {
      bar.addEventListener("click", () => {
        const idx = Number(bar.dataset.toggleFile);
        if (collapsedFiles.has(idx)) collapsedFiles.delete(idx);
        else collapsedFiles.add(idx);
        draw();
      });
    });

    container.querySelector("#matz-diff-copy-all")?.addEventListener("click", () => {
      const textToCopy =
        options.patch ||
        doc.files
          .map((f) =>
            f.hunks
              .map(
                (h) =>
                  `${h.header}\n` +
                  h.lines
                    .map((l) => `${l.kind === "add" ? "+" : l.kind === "del" ? "-" : " "}${l.content}`)
                    .join("\n")
              )
              .join("\n")
          )
          .join("\n\n");
      void navigator.clipboard?.writeText(textToCopy);
      showMatzToast(matzT("diff.copied"));
    });
  };

  draw();
}

/**
 * Abre um Modal Widescreen de Inspeção de Diff (Unified & Side-by-Side Split) com suporte a fechamento via ESC.
 */
export function openMatzDiffModal(
  title: string,
  subtitle: string,
  source: string | { before: string; after: string; fileName?: string }
): void {
  document.getElementById("matz-diff-modal-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "matz-diff-modal-overlay";
  overlay.className = "matz-cmd-backdrop";
  overlay.style.alignItems = "center";
  overlay.style.paddingTop = "0";

  overlay.innerHTML = `
    <div class="matz-card matz-beam-top" style="width:min(1180px,95vw);max-height:88vh;background:var(--surface-popover);border-color:var(--border-strong);box-shadow:var(--shadow-raycast);display:flex;flex-direction:column;gap:10px;padding:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);padding-bottom:8px;">
        <div>
          <h3 style="font-size:14px;font-weight:700;color:var(--text-primary);">${escapeHtml(title)}</h3>
          <p style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${escapeHtml(subtitle)}</p>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="matz-kbd">ESC</span>
          <button type="button" class="matz-btn-xs" id="matz-diff-modal-close">${matzIcon("close", 12)} Fechar</button>
        </div>
      </div>
      <div id="matz-diff-modal-body" style="flex:1;min-height:0;overflow:hidden;"></div>
    </div>
  `;

  const close = () => {
    window.removeEventListener("keydown", onKey, true);
    overlay.remove();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };
  window.addEventListener("keydown", onKey, true);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector("#matz-diff-modal-close")?.addEventListener("click", close);

  document.body.appendChild(overlay);
  const bodyHost = overlay.querySelector<HTMLElement>("#matz-diff-modal-body")!;
  renderMatzDiffViewer(bodyHost, {
    patch: typeof source === "string" ? source : undefined,
    beforeAfter: typeof source === "object" ? source : undefined,
    initialMode: "split",
    maxHeightPx: Math.round(window.innerHeight * 0.7),
    title,
  });
}

// ============================================================================
// MOTOR SMARTDIFF (4 NÍVEIS SEARCH/REPLACE) & AGENTIC CODE ACTION PARSER
// ============================================================================

export interface SmartPatchBlock {
  search: string;
  replace: string;
}

export interface SmartPatchResult {
  success: boolean;
  result: string;
  error?: string;
  strategyUsed?: "exact" | "whitespace" | "line_trimmed" | "anchor";
  linesChanged: number;
}

export interface ExtractedCodeAction {
  id: string;
  type: "write" | "patch" | "delete" | "run";
  filePath: string;
  language: string;
  content: string;
  applied: boolean;
  rejected: boolean;
  patches?: SmartPatchBlock[];
}

const PATCH_BLOCK_RE = /<{3,7}\s*SEARCH\r?\n([\s\S]*?)\r?\n={3,7}\r?\n([\s\S]*?)\r?\n>{3,7}\s*REPLACE/g;

/**
 * Remove blocos de raciocínio (<thought_process>, <think>, <thinking>, <|channel>thought) de respostas de LLMs.
 */
export function stripThinkingBlocks(raw: string): string {
  return (raw || "")
    .replace(/<thought_process>[\s\S]*?<\/thought_process>/gi, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<\|channel\|?>thought[\s\S]*?<channel\|?>/gi, "")
    .trim();
}

/**
 * Extrai todos os blocos de raciocínio (<thought_process>, <think>, <thinking>) de uma resposta.
 */
export function extractThinkingBlocks(raw: string): string[] {
  const blocks: string[] = [];
  const regexes = [
    /<thought_process>([\s\S]*?)<\/thought_process>/gi,
    /<think>([\s\S]*?)<\/think>/gi,
    /<thinking>([\s\S]*?)<\/thinking>/gi,
  ];
  for (const re of regexes) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw || "")) !== null) {
      if (m[1]?.trim()) blocks.push(m[1].trim());
    }
  }
  return blocks;
}

/**
 * Extrai blocos <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE de um texto.
 */
export function parseSmartPatchBlocks(content: string): SmartPatchBlock[] {
  const patches: SmartPatchBlock[] = [];
  PATCH_BLOCK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PATCH_BLOCK_RE.exec(content || "")) !== null) {
    patches.push({
      search: match[1],
      replace: match[2],
    });
  }
  return patches;
}

/**
 * Aplica um bloco SEARCH/REPLACE usando cascata de 4 níveis:
 * 1. Exact Match
 * 2. Whitespace-Normalized Match (CRLF/LF e espaços à direita por linha)
 * 3. Line-by-Line Trimmed Match (ignora indentação divergente e linhas em branco extras)
 * 4. Anchor Match (primeiras 2 + últimas 2 linhas não-vazias quando o LLM omite o miolo com // ...)
 */
export function applySmartPatch(
  originalContent: string,
  search: string,
  replace: string
): SmartPatchResult {
  const origNorm = (originalContent || "").replace(/\r\n/g, "\n");
  const searchNorm = (search || "").replace(/\r\n/g, "\n");
  const replaceNorm = (replace || "").replace(/\r\n/g, "\n");
  const countLn = (s: string) => (s ? s.split("\n").length : 0);

  // Nível 1: Exact Match
  const exactIdx = origNorm.indexOf(searchNorm);
  if (exactIdx !== -1) {
    const result =
      origNorm.slice(0, exactIdx) + replaceNorm + origNorm.slice(exactIdx + searchNorm.length);
    return {
      success: true,
      result,
      strategyUsed: "exact",
      linesChanged: countLn(replaceNorm) - countLn(searchNorm),
    };
  }

  // Nível 2: Whitespace-Normalized Match (trimEnd por linha)
  const origLines = origNorm.split("\n");
  const searchLines = searchNorm.split("\n");
  if (searchLines.length > 0 && origLines.length >= searchLines.length) {
    for (let i = 0; i <= origLines.length - searchLines.length; i++) {
      let match = true;
      for (let j = 0; j < searchLines.length; j++) {
        if (origLines[i + j].trimEnd() !== searchLines[j].trimEnd()) {
          match = false;
          break;
        }
      }
      if (match) {
        const result = [
          ...origLines.slice(0, i),
          replaceNorm,
          ...origLines.slice(i + searchLines.length),
        ].join("\n");
        return {
          success: true,
          result,
          strategyUsed: "whitespace",
          linesChanged: countLn(replaceNorm) - searchLines.length,
        };
      }
    }
  }

  // Nível 3: Line-by-Line Trimmed Match
  const searchTrimmed = searchLines.map((l) => l.trim()).filter((l) => l !== "");
  if (searchTrimmed.length > 0) {
    const origNonEmpty: Array<{ idx: number; text: string }> = [];
    for (let i = 0; i < origLines.length; i++) {
      const t = origLines[i].trim();
      if (t !== "") origNonEmpty.push({ idx: i, text: t });
    }
    for (let i = 0; i <= origNonEmpty.length - searchTrimmed.length; i++) {
      let match = true;
      for (let j = 0; j < searchTrimmed.length; j++) {
        if (origNonEmpty[i + j].text !== searchTrimmed[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        const startIdx = origNonEmpty[i].idx;
        const endIdx = origNonEmpty[i + searchTrimmed.length - 1].idx;
        const result = [
          ...origLines.slice(0, startIdx),
          replaceNorm,
          ...origLines.slice(endIdx + 1),
        ].join("\n");
        return {
          success: true,
          result,
          strategyUsed: "line_trimmed",
          linesChanged: countLn(replaceNorm) - (endIdx - startIdx + 1),
        };
      }
    }
  }

  // Nível 4: Anchor Match (primeiras 2 e últimas 2 linhas não-vazias)
  if (searchTrimmed.length >= 4) {
    const origTrimmed = origLines.map((l) => l.trim());
    const start0 = searchTrimmed[0];
    const start1 = searchTrimmed[1];
    const end0 = searchTrimmed[searchTrimmed.length - 2];
    const end1 = searchTrimmed[searchTrimmed.length - 1];

    let startIdx = -1;
    for (let i = 0; i <= origTrimmed.length - 2; i++) {
      if (origTrimmed[i] === start0 && origTrimmed[i + 1] === start1) {
        startIdx = i;
        break;
      }
    }
    if (startIdx !== -1) {
      let endIdx = -1;
      for (let i = startIdx + 1; i <= origTrimmed.length - 2; i++) {
        if (origTrimmed[i] === end0 && origTrimmed[i + 1] === end1) {
          endIdx = i + 1;
          break;
        }
      }
      if (endIdx !== -1) {
        const result = [
          ...origLines.slice(0, startIdx),
          replaceNorm,
          ...origLines.slice(endIdx + 1),
        ].join("\n");
        return {
          success: true,
          result,
          strategyUsed: "anchor",
          linesChanged: countLn(replaceNorm) - (endIdx - startIdx + 1),
        };
      }
    }
  }

  return {
    success: false,
    result: originalContent,
    error: "Bloco SEARCH não encontrado no arquivo após cascata de 4 níveis.",
    linesChanged: 0,
  };
}

/**
 * Aplica múltiplos blocos SEARCH/REPLACE em sequência.
 */
export function applySmartPatches(
  originalContent: string,
  patches: SmartPatchBlock[]
): SmartPatchResult {
  let current = originalContent;
  let totalChanged = 0;
  let lastStrategy: SmartPatchResult["strategyUsed"] = "exact";

  for (let i = 0; i < patches.length; i++) {
    const res = applySmartPatch(current, patches[i].search, patches[i].replace);
    if (!res.success) {
      return {
        success: false,
        result: current,
        error: `Patch ${i + 1}/${patches.length} falhou: ${res.error}`,
        linesChanged: totalChanged,
      };
    }
    current = res.result;
    totalChanged += res.linesChanged;
    if (res.strategyUsed) lastStrategy = res.strategyUsed;
  }

  return {
    success: true,
    result: current,
    strategyUsed: lastStrategy,
    linesChanged: totalChanged,
  };
}

/**
 * Extrai ações executáveis (write, patch, delete, run) de respostas Markdown/XML de agentes IA.
 */
export function parseAgentCodeActions(markdown: string): ExtractedCodeAction[] {
  const cleaned = stripThinkingBlocks(markdown || "");
  const actions: ExtractedCodeAction[] = [];

  // 1. Formato estruturado <bycode_actions>[...]</bycode_actions>
  const xmlRe = /<bycode_actions>\s*([\s\S]*?)\s*<\/bycode_actions>/gi;
  let xmlMatch: RegExpExecArray | null;
  while ((xmlMatch = xmlRe.exec(cleaned)) !== null) {
    try {
      const parsed = JSON.parse(xmlMatch[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const content = String(item.content || "");
          const patches = parseSmartPatchBlocks(content);
          actions.push({
            id: `act-${actions.length + 1}-${Date.now()}`,
            type: patches.length > 0 ? "patch" : item.type || "write",
            filePath: String(item.filePath || item.path || "").replace(/\\/g, "/").replace(/^\.\//, ""),
            language: String(item.language || "text"),
            content,
            applied: false,
            rejected: false,
            patches: patches.length > 0 ? patches : undefined,
          });
        }
      }
    } catch {
      // Continua para o parser de code blocks Markdown
    }
  }

  // 2. Blocos de código Markdown (```lang:path, ```lang path, ou comentário // path na 1ª linha)
  const fenceRe = /```([^\n`]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(cleaned)) !== null) {
    const header = (m[1] || "").trim();
    const content = (m[2] || "").trim();
    if (!content) continue;

    let lang = "text";
    let filePath = "";

    if (header.includes(":")) {
      const idx = header.indexOf(":");
      lang = header.slice(0, idx).trim();
      filePath = header.slice(idx + 1).trim();
    } else if (header.includes(" ")) {
      const parts = header.split(/\s+/);
      lang = parts[0];
      const titleMatch = header.match(/title=["']([^"']+)["']/);
      filePath = titleMatch ? titleMatch[1] : parts[1];
    } else {
      lang = header || "text";
      const firstLine = content.split("\n")[0] || "";
      const commentPath = firstLine.match(/^(?:\/\/|#|--)\s*([\w./-]+\.[a-zA-Z0-9]+)\s*$/);
      if (commentPath) {
        filePath = commentPath[1];
      }
    }

    filePath = filePath.replace(/\\/g, "/").replace(/^\.\//, "");

    if (lang === "delete" && filePath) {
      actions.push({
        id: `act-${actions.length + 1}-${Date.now()}`,
        type: "delete",
        filePath,
        language: "",
        content: "",
        applied: false,
        rejected: false,
      });
    } else if ((lang === "bash" || lang === "sh" || lang === "powershell") && (filePath === "run" || !filePath)) {
      actions.push({
        id: `act-${actions.length + 1}-${Date.now()}`,
        type: "run",
        filePath: "",
        language: lang,
        content,
        applied: false,
        rejected: false,
      });
    } else if (filePath) {
      const patches = parseSmartPatchBlocks(content);
      actions.push({
        id: `act-${actions.length + 1}-${Date.now()}`,
        type: patches.length > 0 ? "patch" : "write",
        filePath,
        language: lang,
        content,
        applied: false,
        rejected: false,
        patches: patches.length > 0 ? patches : undefined,
      });
    }
  }

  return actions;
}
