import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { IMPACT_ORDER, selfTest, type Impact } from "./axe.ts";
import { sweepPlayground } from "./playground.ts";
import { printSummary, type RunResult } from "./report.ts";
import { serve } from "./static-server.ts";
import { sweepStorybook } from "./storybook.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const { values } = parseArgs({
  options: {
    target: { type: "string", default: "all" },
    themes: { type: "string", default: "light,dark" },
    "fail-on": { type: "string", default: "serious" },
    filter: { type: "string" },
    out: { type: "string", default: path.join(root, "a11y-report.json") },
    concurrency: { type: "string", default: process.env["A11Y_CONCURRENCY"] ?? "4" },
    storybook: { type: "string", default: path.join(root, "apps/storybook/storybook-static") },
    playground: { type: "string", default: path.join(root, "apps/playground/dist") },
  },
});

const failOn = values["fail-on"] as Impact;
if (!IMPACT_ORDER.includes(failOn)) {
  throw new Error(`--fail-on must be one of ${IMPACT_ORDER.join(", ")}`);
}
const themes = (values.themes ?? "light,dark").split(",");
const target = values.target ?? "all";
const concurrency = Number(values.concurrency);

const browser = await chromium.launch();
const results: RunResult[] = [];
const servers: { close: () => Promise<void> }[] = [];

try {
  await selfTest(await browser.newPage());
  console.log("Self-test: axe detects known violations ✔");
  if (target === "all" || target === "storybook") {
    const server = await serve(values.storybook as string);
    servers.push(server);
    console.log(`Storybook: ${server.url}`);
    results.push(
      ...(await sweepStorybook({
        browser,
        baseUrl: server.url,
        themes,
        concurrency,
        ...(values.filter ? { filter: values.filter } : {}),
      })),
    );
  }
  if (target === "all" || target === "playground") {
    const server = await serve(values.playground as string);
    servers.push(server);
    console.log(`Playground: ${server.url}`);
    results.push(...(await sweepPlayground({ browser, baseUrl: server.url, themes })));
  }
} finally {
  await browser.close();
  await Promise.all(servers.map((s) => s.close()));
}

writeFileSync(values.out as string, JSON.stringify({ failOn, themes, results }, null, 2));
process.exit(printSummary(results, failOn) ? 0 : 1);
