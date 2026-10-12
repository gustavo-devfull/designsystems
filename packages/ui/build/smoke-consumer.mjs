import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Installs the packed tarball into an empty project, exactly as a consumer would, and checks what
 * the published contract promises: SSR works, every export resolves, React is not duplicated, unused
 * components tree-shake away, and the types work under `moduleResolution: nodenext`.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
// One component costs ~30 KB minified, of which ~28 KB is tailwind-merge (the price of safe `className`
// overrides, shared by every component). The budget guards against regressions; the ratio proves tree shaking.
const BADGE_ONLY_BUDGET_KB = 35;
const BADGE_ONLY_MAX_SHARE_OF_LIBRARY = 0.35;
const UNPACKED_BUDGET_KB = 400;

const tmp = mkdtempSync(path.join(tmpdir(), "sette-consumer-"));
const results = [];
const check = (name, fn) => {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
  } catch (error) {
    results.push({
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
const run = (cmd, args, cwd = tmp) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

try {
  // 1. Pack with pnpm, as the release does: only `pnpm pack|publish` rewrite `catalog:` / `workspace:`
  //    specifiers (a plain `npm pack` would ship an uninstallable package.json).
  const packed = JSON.parse(run("pnpm", ["pack", "--json", "--pack-destination", tmp], root));
  const tarball = packed.filename;
  const files = packed.files.map((f) => f.path);
  check("tarball contains only dist/, README, LICENSE and package.json", () => {
    const stray = files.filter((p) => !/^(dist\/|README\.md$|LICENSE$|package\.json$)/.test(p));
    if (stray.length > 0) throw new Error(`unexpected files: ${stray.slice(0, 5).join(", ")}`);
    const leaked = files.filter((p) => /\.(test|stories)\./.test(p));
    if (leaked.length > 0)
      throw new Error(`tests/stories shipped: ${leaked.slice(0, 3).join(", ")}`);
    return `${files.length} files`;
  });
  check("package.json has no unresolved catalog:/workspace: specifiers", () => {
    const out = run("tar", ["-xzOf", tarball, "package/package.json"]);
    const bad = out.match(/"(catalog|workspace):[^"]*"/g);
    if (bad) throw new Error(`unresolved: ${[...new Set(bad)].join(", ")}`);
    return "ok";
  });

  // 2. Install into an empty consumer.
  writeFileSync(
    path.join(tmp, "package.json"),
    JSON.stringify({ name: "consumer", private: true, type: "module" }),
  );
  run("npm", [
    "install",
    "--no-audit",
    "--no-fund",
    "--loglevel=error",
    tarball,
    "react@19",
    "react-dom@19",
    "@types/react@19",
    "@types/react-dom@19",
  ]);
  const installed = path.join(tmp, "node_modules/@sette/ui");
  const sizeOf = (dir) =>
    readdirSync(dir, { withFileTypes: true }).reduce(
      (sum, e) =>
        sum +
        (e.isDirectory() ? sizeOf(path.join(dir, e.name)) : statSync(path.join(dir, e.name)).size),
      0,
    );
  check(`unpacked size within budget (${UNPACKED_BUDGET_KB} KB)`, () => {
    const kb = Math.round(sizeOf(installed) / 1024);
    if (kb > UNPACKED_BUDGET_KB) throw new Error(`${kb} KB`);
    return `${kb} KB`;
  });

  // 3. SSR with the real package (client-only APIs must not crash on the server).
  writeFileSync(
    path.join(tmp, "ssr.mjs"),
    `import { createElement as h } from "react";
     import { renderToString } from "react-dom/server";
     import { Badge, Button, ThemeProvider } from "@sette/ui";
     const html = renderToString(
       h(ThemeProvider, { scope: "element", defaultTheme: "dark" },
         h(Button, { variant: "danger" }, "Delete"), h(Badge, { variant: "success" }, "Paid")));
     console.log(html);`,
  );
  check("renders on the server (SSR) with theme and variants", () => {
    const html = run("node", ["ssr.mjs"]);
    for (const expected of ['data-theme="dark"', "<button", 'data-variant="danger"', "Paid"]) {
      if (!html.includes(expected))
        throw new Error(`missing ${expected} in: ${html.slice(0, 200)}`);
    }
    return "ok";
  });

  // 4. Every documented entry point resolves, and the CSS carries the tokens and both themes.
  check("styles.css, tokens.css and tailwind.css are exported and non-empty", () => {
    const css = (name) => readFileSync(path.join(installed, "dist", name), "utf8");
    const pkg = JSON.parse(readFileSync(path.join(installed, "package.json"), "utf8"));
    for (const name of ["styles.css", "tokens.css", "tailwind.css"]) {
      if (pkg.exports[`./${name}`] !== `./dist/${name}`)
        throw new Error(`exports["./${name}"] is wrong`);
    }
    if (!css("styles.css").includes('[data-theme="dark"]'))
      throw new Error("styles.css has no dark theme");
    if (!css("tokens.css").includes("--ds-color-action-primary"))
      throw new Error("tokens.css has no tokens");
    if (!css("tailwind.css").includes("@theme inline"))
      throw new Error("tailwind.css has no theme");
    return "ok";
  });

  // 5. One copy of React.
  check("does not bundle or nest its own React", () => {
    if (existsSync(path.join(installed, "node_modules", "react")))
      throw new Error("nested react found");
    const fromConsumer = require.resolve("react", { paths: [tmp] });
    const fromUi = require.resolve("react", { paths: [installed] });
    if (fromConsumer !== fromUi) throw new Error(`${fromConsumer} !== ${fromUi}`);
    return "single copy";
  });

  // 6. Tree shaking: importing one component must not drag in the rest (or Radix).
  const esbuild = require("esbuild");
  const bundle = (code) =>
    esbuild.buildSync({
      stdin: { contents: code, resolveDir: tmp, loader: "js" },
      bundle: true,
      format: "esm",
      write: false,
      minify: true,
      external: ["react", "react-dom", "react/jsx-runtime"],
    }).outputFiles[0].text;
  check(
    "importing only Badge tree-shakes: no Radix, small share of the library, within budget",
    () => {
      const badge = bundle('import { Badge } from "@sette/ui"; console.log(Badge);');
      const whole = bundle('import * as ui from "@sette/ui"; console.log(ui);');
      const kb = (text) => Math.round((text.length / 1024) * 10) / 10;
      if (/radix|focus-scope|dismissable/i.test(badge))
        throw new Error("Radix code leaked into a Badge-only bundle");
      if (badge.length > whole.length * BADGE_ONLY_MAX_SHARE_OF_LIBRARY) {
        throw new Error(
          `Badge-only is ${kb(badge)} KB of ${kb(whole)} KB: unused components are not being dropped`,
        );
      }
      if (kb(badge) > BADGE_ONLY_BUDGET_KB)
        throw new Error(`${kb(badge)} KB exceeds the ${BADGE_ONLY_BUDGET_KB} KB budget`);
      return `Badge-only ${kb(badge)} KB vs whole library ${kb(whole)} KB`;
    },
  );

  // 7. Types under the strictest resolution, with library checks ON (catches broken .d.ts).
  writeFileSync(
    path.join(tmp, "consumer.tsx"),
    `import { Button, IconButton, Input, type ButtonProps } from "@sette/ui";
     export const props: ButtonProps = { variant: "primary", size: "md" };
     export const ok = <Button variant="danger" loading>Save</Button>;
     export const field = <Input label="Email" error="Invalid" />;
     // @ts-expect-error unknown variant
     export const bad1 = <Button variant="blue">x</Button>;
     // @ts-expect-error aria-label is mandatory
     export const bad2 = <IconButton><svg /></IconButton>;
     // @ts-expect-error label is mandatory
     export const bad3 = <Input />;`,
  );
  check("types resolve under nodenext (strict, skipLibCheck off) and enforce the API", () => {
    const tsc = path.join(path.dirname(require.resolve("typescript/package.json")), "bin/tsc");
    run("node", [
      tsc,
      "--noEmit",
      "--strict",
      "--jsx",
      "react-jsx",
      "--module",
      "nodenext",
      "--moduleResolution",
      "nodenext",
      "--target",
      "es2022",
      "--skipLibCheck",
      "false",
      "consumer.tsx",
    ]);
    return "ok";
  });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

for (const r of results)
  console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
if (results.some((r) => !r.ok)) process.exit(1);
console.log(`\n✔ ${results.length} consumer checks passed.`);
