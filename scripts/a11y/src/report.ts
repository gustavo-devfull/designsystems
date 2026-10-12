import { IMPACT_ORDER, type Impact, type Violation } from "./axe.ts";

export interface RunResult {
  target: "storybook" | "playground";
  name: string;
  theme: string;
  /** Rendering/interaction failure (play function threw, page error, Storybook error screen). */
  error?: string;
  violations: Violation[];
}

export function classify(results: RunResult[], failOn: Impact) {
  const threshold = IMPACT_ORDER.indexOf(failOn);
  const failing: RunResult[] = [];
  const warnings: RunResult[] = [];
  for (const r of results) {
    const blocking = r.violations.filter((v) => IMPACT_ORDER.indexOf(v.impact) >= threshold);
    const advisory = r.violations.filter((v) => IMPACT_ORDER.indexOf(v.impact) < threshold);
    if (r.error || blocking.length > 0) failing.push({ ...r, violations: blocking });
    if (advisory.length > 0) warnings.push({ ...r, violations: advisory });
  }
  return { failing, warnings };
}

const line = (r: RunResult) =>
  `  [${r.target}:${r.theme}] ${r.name}\n` +
  [
    ...(r.error ? [`      ✖ ${r.error}`] : []),
    ...r.violations.map(
      (v) =>
        `      ✖ ${v.id} (${v.impact}) ×${v.nodes} — ${v.help}\n        ${v.target}\n        ${v.detail}\n        ${v.helpUrl}`,
    ),
  ].join("\n");

export function printSummary(results: RunResult[], failOn: Impact): boolean {
  const { failing, warnings } = classify(results, failOn);
  const byTarget = (t: string) => results.filter((r) => r.target === t).length;
  console.log(
    `\nChecked ${results.length} renders (storybook: ${byTarget("storybook")}, playground: ${byTarget("playground")}); ` +
      `gate: ${failOn} and above.`,
  );
  if (warnings.length > 0) {
    console.log(
      `\n⚠ ${warnings.length} renders with advisory findings (below the gate):\n${warnings.map(line).join("\n")}`,
    );
  }
  if (failing.length > 0) {
    console.log(
      `\n✖ ${failing.length} renders FAILED the accessibility gate:\n${failing.map(line).join("\n")}\n`,
    );
    return false;
  }
  console.log("\n✔ Accessibility gate passed.\n");
  return true;
}
