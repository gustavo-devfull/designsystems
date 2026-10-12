import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SRC = path.join(ROOT, "src");
export const DIST = path.join(ROOT, "dist");

/** CSS custom property prefix: --ds-color-action-primary */
export const PREFIX = "ds";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

const rel = (...p: string[]) => path.join(SRC, ...p);

export const files = {
  primitive: ["color", "dimension", "typography", "effects"].map((n) =>
    rel("primitive", `${n}.json`),
  ),
  shared: [rel("semantic", "shared.json")],
  mode: (theme: Theme) => [rel("semantic", `color.${theme}.json`)],
  component: ["button", "input"].map((n) => rel("component", `${n}.json`)),
};

/**
 * Token groups that components may consume without a semantic alias.
 * Typography is a foundation scale; color/spacing/radius/border must go through semantics.
 */
export const FOUNDATION_ROOTS = ["font"] as const;

/** Tokens zeroed under `prefers-reduced-motion: reduce`. */
export const MOTION_TOKENS = [
  "transition.duration.fast",
  "transition.duration.default",
  "transition.duration.slow",
] as const;
