import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { DIST } from "./config.ts";

const css = readFileSync(path.join(DIST, "tokens.css"), "utf8");
const json = JSON.parse(readFileSync(path.join(DIST, "tokens.json"), "utf8")) as {
  tokens: Record<"light" | "dark", Record<string, { value: string; cssVar: string }>>;
};

describe("tokens.css", () => {
  it("emits namespaced custom properties", () => {
    assert.match(css, /--ds-color-action-primary: var\(--ds-color-blue-600\);/);
    assert.match(css, /--ds-spacing-md: var\(--ds-spacing-4\);/);
  });

  it("scopes themes with data-theme", () => {
    assert.match(css, /:root, \[data-theme="light"\] \{/);
    assert.match(css, /\[data-theme="dark"\] \{/);
  });

  it("re-declares component tokens per theme so nested themes resolve correctly", () => {
    assert.match(css, /:root, \[data-theme\] \{\n {2}--ds-button-/);
  });

  it("honours prefers-reduced-motion", () => {
    assert.match(
      css,
      /prefers-reduced-motion: reduce[\s\S]*--ds-transition-duration-default: 0\.01ms/,
    );
  });

  it("never leaks DTCG internals into names", () => {
    assert.doesNotMatch(css, /root--|\$root|-root:/);
  });
});

describe("tokens.json", () => {
  it("resolves aliases to literal values per theme", () => {
    assert.equal(json.tokens.light["color.action.primary"]?.value, "#2563eb");
    assert.equal(json.tokens.dark["color.action.primary"]?.value, "#60a5fa");
  });

  it("exposes the same token names in every theme", () => {
    assert.deepEqual(Object.keys(json.tokens.light), Object.keys(json.tokens.dark));
  });

  it("matches the CSS variable of each token", () => {
    for (const [name, t] of Object.entries(json.tokens.light)) {
      assert.ok(css.includes(`${t.cssVar}:`), `${name} → ${t.cssVar} missing in tokens.css`);
    }
  });
});
