import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { FigmaClient } from "./client.ts";
import { convert } from "./convert.ts";
import { diffOwned, hasDrift, mergeOwned, type Drift, type DtcgNode } from "./dtcg.ts";

export interface FileReport {
  file: string;
  drift: Drift;
  written: boolean;
}

export interface SyncReport {
  files: FileReport[];
  warnings: string[];
  drifted: boolean;
}

/**
 * fetch → convert → compare → (write).
 * In `check` mode nothing is written; the report says whether the repository has drifted from Figma.
 */
export async function sync(options: {
  client: FigmaClient;
  srcDir: string;
  check?: boolean;
}): Promise<SyncReport> {
  const { files, warnings } = convert(await options.client.getLocalVariables());
  const reports: FileReport[] = [];

  for (const generated of files) {
    const target = path.join(options.srcDir, generated.file);
    const existing: DtcgNode = existsSync(target)
      ? (JSON.parse(readFileSync(target, "utf8")) as DtcgNode)
      : {};
    const drift = diffOwned(existing, generated.tree, generated.ownedRoots);
    const changed = hasDrift(drift);
    if (changed && !options.check) {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(
        target,
        JSON.stringify(mergeOwned(existing, generated.tree, generated.ownedRoots), null, 2) + "\n",
      );
    }
    reports.push({ file: generated.file, drift, written: changed && !options.check });
  }

  return { files: reports, warnings, drifted: reports.some((r) => hasDrift(r.drift)) };
}

export function formatReport(report: SyncReport, check: boolean): string {
  const lines: string[] = [];
  for (const w of report.warnings) lines.push(`⚠ ${w}`);
  for (const f of report.files) {
    const { added, removed, changed } = f.drift;
    if (!hasDrift(f.drift)) {
      lines.push(`  = ${f.file} (in sync)`);
      continue;
    }
    lines.push(
      `  ${check ? "≠" : "✎"} ${f.file}: +${added.length} -${removed.length} ~${changed.length}`,
    );
    for (const k of added.slice(0, 5)) lines.push(`      + ${k}`);
    for (const k of removed.slice(0, 5)) lines.push(`      - ${k}`);
    for (const k of changed.slice(0, 5)) lines.push(`      ~ ${k}`);
  }
  return lines.join("\n");
}
