import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import path from "node:path";
import { compile } from "tailwindcss";
import { DIST } from "./config.ts";

const require = createRequire(import.meta.url);

/** Compiles Tailwind's own theme + the generated design-system theme + the given utilities. */
async function generate(...candidates: string[]): Promise<string> {
  const entry = `
    @import "tailwindcss/theme.css" layer(theme);
    @import "ds-tailwind.css";
    @tailwind utilities;
  `;
  const compiler = await compile(entry, {
    base: DIST,
    loadStylesheet: (id) => {
      const file = id === "ds-tailwind.css" ? path.join(DIST, "tailwind.css") : require.resolve(id);
      return Promise.resolve({
        path: file,
        base: path.dirname(file),
        content: readFileSync(file, "utf8"),
      });
    },
  });
  return compiler.build(candidates);
}

describe("tailwind integration", () => {
  it("emits utilities that point at semantic CSS variables", async () => {
    const css = await generate(
      "bg-action-primary",
      "hover:bg-action-primary-hover",
      "text-text-primary",
      "border-border-default",
    );
    assert.match(css, /background-color: var\(--ds-color-action-primary\)/);
    assert.match(css, /color: var\(--ds-color-text-primary\)/);
    assert.match(css, /border-color: var\(--ds-color-border-default\)/);
  });

  it("does not generate physical-colour utilities", async () => {
    const css = await generate("bg-blue-500", "text-gray-900", "border-gray-300", "bg-white");
    assert.doesNotMatch(css, /background-color|border-color|color:/);
  });

  it("exposes semantic radius, spacing, shadow and component tokens", async () => {
    const css = await generate(
      "rounded-control",
      "p-md",
      "shadow-mid",
      "bg-button-background-primary",
    );
    assert.match(css, /border-radius: var\(--ds-radius-control\)/);
    assert.match(css, /padding: var\(--ds-spacing-md\)/);
    assert.match(css, /var\(--ds-elevation-mid\)/);
    assert.match(css, /background-color: var\(--ds-button-background-primary\)/);
  });

  it("provides responsive variants from breakpoint tokens", async () => {
    const css = await generate("md:p-md", "lg:flex");
    assert.match(css, /@media \(width >= 48rem\)/);
    assert.match(css, /@media \(width >= 64rem\)/);
  });

  it("keeps theme variables inline so nested [data-theme] subtrees resolve correctly", async () => {
    const css = await generate("bg-action-primary");
    assert.doesNotMatch(css, /--color-action-primary:/);
  });
});
