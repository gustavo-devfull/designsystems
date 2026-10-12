import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * The playground must behave like a real consumer: it uses the *built* package and shares a single
 * copy of React with it. These checks guard the published contract (exports, peer deps).
 */
const require = createRequire(import.meta.url);
const uiRoot = path.dirname(require.resolve("@sette/ui/package.json"));
const ui = JSON.parse(readFileSync(path.join(uiRoot, "package.json"), "utf8")) as {
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  sideEffects: string[] | boolean;
};

describe("@sette/ui as consumed by an application", () => {
  it("is resolved from its build output, not from sources", () => {
    expect(existsSync(path.join(uiRoot, "dist/index.js"))).toBe(true);
    expect(existsSync(path.join(uiRoot, "dist/index.d.ts"))).toBe(true);
    expect(JSON.stringify(ui.exports)).not.toContain("src/");
  });

  it("ships the documented entry points", () => {
    for (const entry of ["styles.css", "tokens.css", "tailwind.css"]) {
      expect(ui.exports[`./${entry}`]).toBe(`./dist/${entry}`);
      expect(existsSync(path.join(uiRoot, "dist", entry))).toBe(true);
    }
  });

  it("shares one copy of React with the app (react is a peer dependency, never bundled)", () => {
    expect(ui.peerDependencies).toHaveProperty("react");
    expect(ui.peerDependencies).toHaveProperty("react-dom");
    expect(ui.dependencies).not.toHaveProperty("react");

    const fromApp = realpathSync(require.resolve("react"));
    const fromUi = realpathSync(createRequire(path.join(uiRoot, "package.json")).resolve("react"));
    expect(fromUi).toBe(fromApp);

    const bundle = readFileSync(path.join(uiRoot, "dist/index.js"), "utf8");
    expect(bundle).not.toMatch(/ReactCurrentOwner|__SECRET_INTERNALS/);
  });

  it("only CSS files have side effects, so unused components tree-shake away", () => {
    expect(ui.sideEffects).toEqual(["**/*.css"]);
  });

  it("marks component modules as client modules but leaves helpers server-callable", () => {
    const read = (file: string) => readFileSync(path.join(uiRoot, "dist", file), "utf8");
    expect(read("components/Button/Button.js").startsWith('"use client"')).toBe(true);
    expect(read("lib/cn.js")).not.toContain("use client");
    expect(read("components/Button/Button.variants.js")).not.toContain("use client");
  });
});
