import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { FigmaApiError, FixtureFigmaClient, HttpFigmaClient, type FigmaClient } from "./client.ts";
import { ConversionError } from "./convert.ts";
import { exportToFigma } from "./export.ts";
import { formatReport, sync } from "./sync.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const defaultFixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/figma-local-variables.json",
);

const { values } = parseArgs({
  options: {
    fixture: { type: "string" },
    src: { type: "string", default: path.join(root, "packages/tokens/src") },
    check: { type: "boolean", default: false },
    "no-build": { type: "boolean", default: false },
    "write-fixture": { type: "boolean", default: false },
  },
});

function run(cmd: string, args: string[]): void {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

try {
  if (values["write-fixture"]) {
    const out = values.fixture ?? defaultFixture;
    writeFileSync(out, JSON.stringify(exportToFigma(values.src), null, 2) + "\n");
    run("pnpm", ["exec", "prettier", "--write", out]);
    console.log(
      `Wrote ${path.relative(root, out)} (what a correctly set-up Figma file returns for the current tokens).`,
    );
    process.exit(0);
  }

  const client: FigmaClient = values.fixture
    ? new FixtureFigmaClient(values.fixture)
    : HttpFigmaClient.fromEnv();
  const report = await sync({ client, srcDir: values.src, check: values.check });
  console.log(formatReport(report, values.check));

  if (values.check) {
    if (report.drifted) {
      console.error(
        "\n✖ Tokens are out of sync with Figma. Run `pnpm figma:sync` and commit the result.",
      );
      process.exit(1);
    }
    console.log("\n✔ Tokens match Figma.");
    process.exit(0);
  }

  const written = report.files.filter((f) => f.written).map((f) => path.join(values.src, f.file));
  if (written.length > 0) run("pnpm", ["exec", "prettier", "--write", ...written]);
  if (!values["no-build"]) {
    // Validation (layers, theme parity, WCAG contrast) happens here, before anything is trusted.
    run("pnpm", ["--filter", "@design-system/tokens", "build"]);
  }
  console.log(
    report.drifted ? "\n✔ Tokens updated from Figma and validated." : "\n✔ Already in sync.",
  );
} catch (error) {
  if (error instanceof ConversionError) {
    console.error(`\n✖ ${error.message}`);
    process.exit(2);
  }
  if (error instanceof FigmaApiError) {
    console.error(`\n✖ ${error.message}`);
    process.exit(3);
  }
  throw error;
}
