import { THEMES, FOUNDATION_ROOTS, files, type Theme } from "./config.ts";
import { loadTokens, referencesOf, resolveLiteral, type FlatToken } from "./dtcg.ts";

const errors = new Set<string>();
const fail = (msg: string) => errors.add(msg);

const primitive = loadTokens(files.primitive);
const shared = loadTokens(files.shared);
const component = loadTokens(files.component);
const modes = Object.fromEntries(THEMES.map((t) => [t, loadTokens(files.mode(t))])) as Record<
  Theme,
  Map<string, FlatToken>
>;

const merge = (...maps: Map<string, FlatToken>[]) => new Map(maps.flatMap((m) => [...m]));

// 1. Theme parity: every mode must define exactly the same semantic keys.
const [firstTheme, ...otherThemes] = THEMES;
const baseKeys = new Set(modes[firstTheme].keys());
for (const theme of otherThemes) {
  const keys = new Set(modes[theme].keys());
  for (const k of baseKeys) if (!keys.has(k)) fail(`[parity] "${k}" missing in ${theme}`);
  for (const k of keys) if (!baseKeys.has(k)) fail(`[parity] "${k}" only exists in ${theme}`);
}

// 2. Layer rules.
for (const [key, t] of primitive) {
  if (referencesOf(t.value).length > 0) fail(`[primitive] "${key}" must be a literal`);
}

const keyOf = (ref: string) => ref;
const checkLayer = (
  layer: "semantic" | "component",
  tokens: Map<string, FlatToken>,
  universe: Map<string, FlatToken>,
  allowed: (target: string) => boolean,
) => {
  for (const [key, t] of tokens) {
    const refs = referencesOf(t.value);
    if (refs.length === 0) fail(`[${layer}] "${key}" is a literal; it must alias a lower layer`);
    for (const ref of refs) {
      if (!universe.has(keyOf(ref))) fail(`[${layer}] "${key}" references unknown token "${ref}"`);
      else if (!allowed(ref))
        fail(`[${layer}] "${key}" may not reference "${ref}" (layer violation)`);
    }
  }
};

for (const theme of THEMES) {
  const universe = merge(primitive, shared, modes[theme]);
  checkLayer("semantic", modes[theme], universe, (r) => primitive.has(r));
  checkLayer(
    "component",
    component,
    universe,
    (r) => !primitive.has(r) || FOUNDATION_ROOTS.some((root) => r.startsWith(`${root}.`)),
  );
}
checkLayer("semantic", shared, merge(primitive, shared), (r) => primitive.has(r));

// 3. Contrast (WCAG 2.2): text 4.5:1 (SC 1.4.3), UI components/focus 3:1 (SC 1.4.11).
const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Cannot compute contrast for "${hex}"`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5;
const UI = 3;
const c = (name: string) => `color.${name}`;
const pairs: [fg: string, bg: string, min: number][] = [];
for (const bg of [
  "background.primary",
  "background.secondary",
  "background.elevated",
  "background.tertiary",
]) {
  pairs.push(["text.primary", bg, TEXT]);
}
for (const bg of ["background.primary", "background.secondary", "background.elevated"]) {
  pairs.push(["text.secondary", bg, TEXT], ["text.link", bg, TEXT]);
}
pairs.push(
  ["text.inverse", "background.inverse", TEXT],
  ["text.placeholder", "background.primary", TEXT],
  ["text.placeholder", "background.secondary", TEXT],
  ["border.input", "background.primary", UI],
  ["focus.ring", "background.primary", UI],
  ["focus.ring", "background.secondary", UI],
);
for (const a of ["primary", "danger"]) {
  for (const s of ["$root", "hover", "active"])
    pairs.push(["text.on-action", `action.${a}.${s}`, TEXT]);
}
for (const s of ["$root", "hover", "active"])
  pairs.push(["text.primary", `action.secondary.${s}`, TEXT]);
pairs.push(["action.primary.$root", "background.primary", UI]);
for (const f of ["success", "warning", "error", "info"]) {
  pairs.push(
    [`feedback.${f}.$root`, `feedback.${f}.subtle`, TEXT],
    [`feedback.${f}.$root`, "background.primary", TEXT],
  );
}

for (const theme of THEMES) {
  const universe = merge(primitive, shared, modes[theme]);
  for (const [fg, bg, min] of pairs) {
    try {
      const ratio = contrast(
        resolveLiteral(c(fg), universe) as string,
        resolveLiteral(c(bg), universe) as string,
      );
      if (ratio < min) {
        fail(`[contrast:${theme}] ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
      }
    } catch (e) {
      fail(`[contrast:${theme}] ${fg} / ${bg}: ${(e as Error).message}`);
    }
  }
}

if (errors.size > 0) {
  console.error(
    `✖ Token validation failed (${errors.size}):\n` + [...errors].map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}
console.log(
  `✔ Tokens valid: ${primitive.size} primitive, ${shared.size + modes.light.size} semantic, ` +
    `${component.size} component; ${pairs.length * THEMES.length} contrast checks.`,
);
