import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Page } from "playwright";

export type Impact = "minor" | "moderate" | "serious" | "critical";
export const IMPACT_ORDER: Impact[] = ["minor", "moderate", "serious", "critical"];

export interface Violation {
  id: string;
  impact: Impact;
  help: string;
  helpUrl: string;
  /** First offending node, for the report. */
  target: string;
  detail: string;
  nodes: number;
}

interface AxeResults {
  violations: {
    id: string;
    impact?: Impact | null;
    help: string;
    helpUrl: string;
    nodes: { target: unknown[]; failureSummary?: string }[];
  }[];
}

declare global {
  interface Window {
    axe: { run: (context: unknown, options: unknown) => Promise<AxeResults> };
  }
}

const axeSource = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);

/** WCAG 2.2 AA + best practices. Contrast is real here: this runs in a browser with layout and CSS. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** Page-level rules that make no sense for an isolated component story. */
export const COMPONENT_RULES_OFF = [
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "bypass",
];

export async function runAxe(page: Page, disabledRules: string[] = []): Promise<Violation[]> {
  await page.addScriptTag({ content: axeSource });
  const rules = Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }]));
  const results = await page.evaluate(([options]) => window.axe.run(document, options), [
    { runOnly: { type: "tag", values: TAGS }, rules },
  ] as const);
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? "minor",
    help: v.help,
    helpUrl: v.helpUrl,
    target: String(v.nodes[0]?.target.join(" ") ?? ""),
    detail: (v.nodes[0]?.failureSummary ?? "").split("\n").slice(1).join(" ").trim(),
    nodes: v.nodes.length,
  }));
}

/**
 * Proves the gate can fail: a fixture with known violations must be reported. If axe is silently
 * broken (script not injected, rules disabled, wrong tags) a green run would be meaningless.
 */
export async function selfTest(page: Page): Promise<void> {
  await page.setContent(
    `<!doctype html><html lang="en"><head><title>fixture</title></head><body>
       <p style="color:#bbbbbb;background:#ffffff">Low contrast text</p><button></button>
     </body></html>`,
  );
  const found = new Set((await runAxe(page)).map((v) => v.id));
  for (const expected of ["color-contrast", "button-name"]) {
    if (!found.has(expected)) {
      throw new Error(
        `Self-test failed: axe did not report "${expected}" on a known-bad fixture. The gate is blind.`,
      );
    }
  }
}
