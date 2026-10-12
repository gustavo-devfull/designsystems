import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { FixtureFigmaClient } from "./client.ts";
import { convert } from "./convert.ts";
import { diffOwned, hasDrift, type DtcgNode } from "./dtcg.ts";
import { exportToFigma } from "./export.ts";
import type { FigmaVariablesResponse } from "./figma-types.ts";
import { sync } from "./sync.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const tokensSrc = path.resolve(here, "../../../packages/tokens/src");
const fixturePath = path.join(here, "fixtures/figma-local-variables.json");
const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8")) as DtcgNode;

describe("round trip: tokens → Figma shape → tokens", () => {
  it("reproduces every Figma-owned token exactly (names, types, values, descriptions)", () => {
    const { files } = convert(exportToFigma(tokensSrc));
    assert.ok(files.length >= 7, `expected the 7 synced files, got ${files.length}`);
    for (const file of files) {
      const drift = diffOwned(
        readJson(path.join(tokensSrc, file.file)),
        file.tree,
        file.ownedRoots,
      );
      assert.deepEqual(drift, { added: [], removed: [], changed: [] }, `${file.file} drifted`);
    }
  });

  it("the committed fixture is current (regenerate with `pnpm --filter @design-system/figma-sync fixture`)", () => {
    const expected = exportToFigma(tokensSrc);
    const committed = JSON.parse(readFileSync(fixturePath, "utf8")) as FigmaVariablesResponse;
    assert.deepEqual(committed, expected);
  });
});

describe("sync", () => {
  let dir: string;
  before(() => {
    dir = mkdtempSync(path.join(tmpdir(), "figma-sync-"));
    cpSync(tokensSrc, dir, { recursive: true });
  });
  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  const withBlue600 = (hexChannel: number): FigmaVariablesResponse => {
    const response = JSON.parse(readFileSync(fixturePath, "utf8")) as FigmaVariablesResponse;
    const blue = Object.values(response.meta.variables).find((v) => v.name === "color/blue/600");
    assert.ok(blue);
    const [mode] = Object.keys(blue.valuesByMode);
    blue.valuesByMode[mode as string] = { r: hexChannel, g: 0.2, b: 0.4 };
    return response;
  };
  const clientFor = (response: FigmaVariablesResponse) => ({
    getLocalVariables: () => Promise.resolve(response),
  });

  it("check mode reports drift and writes nothing", async () => {
    const before = readFileSync(path.join(dir, "primitive/color.json"), "utf8");
    const report = await sync({ client: clientFor(withBlue600(1)), srcDir: dir, check: true });
    assert.equal(report.drifted, true);
    assert.deepEqual(report.files.find((f) => f.file === "primitive/color.json")?.drift.changed, [
      "color.blue.600",
    ]);
    assert.equal(readFileSync(path.join(dir, "primitive/color.json"), "utf8"), before);
  });

  it("applies the change and leaves code-owned tokens (shadows, typography, motion) untouched", async () => {
    const shadowBefore = readFileSync(path.join(dir, "primitive/effects.json"), "utf8");
    const typographyBefore = readFileSync(path.join(dir, "primitive/typography.json"), "utf8");
    const sharedBefore = readJson(path.join(dir, "semantic/shared.json"));

    const report = await sync({ client: clientFor(withBlue600(1)), srcDir: dir });
    assert.equal(report.files.find((f) => f.file === "primitive/color.json")?.written, true);

    const colors = readJson(path.join(dir, "primitive/color.json"));
    const blue600 = ((colors["color"] as DtcgNode)["blue"] as DtcgNode)["600"] as DtcgNode;
    assert.equal(blue600["$value"], "#ff3366");

    assert.equal(readFileSync(path.join(dir, "primitive/effects.json"), "utf8"), shadowBefore);
    assert.equal(
      readFileSync(path.join(dir, "primitive/typography.json"), "utf8"),
      typographyBefore,
    );
    const sharedAfter = readJson(path.join(dir, "semantic/shared.json"));
    assert.deepEqual(sharedAfter["elevation"], sharedBefore["elevation"]);
    assert.deepEqual(sharedAfter["transition"], sharedBefore["transition"]);
  });

  it("is idempotent: a second run finds nothing to do", async () => {
    const report = await sync({ client: clientFor(withBlue600(1)), srcDir: dir });
    assert.equal(report.drifted, false);
    assert.ok(report.files.every((f) => !f.written && !hasDrift(f.drift)));
  });

  it("works through the fixture client used by CI and demos", async () => {
    writeFileSync(
      path.join(dir, "primitive/color.json"),
      readFileSync(path.join(tokensSrc, "primitive/color.json")),
    );
    const report = await sync({
      client: new FixtureFigmaClient(fixturePath),
      srcDir: dir,
      check: true,
    });
    assert.equal(report.drifted, false);
  });
});
