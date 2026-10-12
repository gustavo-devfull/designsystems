import { setToken, type DtcgNode } from "./dtcg.ts";
import {
  isAlias,
  isRgba,
  type FigmaCollection,
  type FigmaValue,
  type FigmaVariable,
  type FigmaVariablesResponse,
} from "./figma-types.ts";

/**
 * Ownership: which token groups Figma variables are the source of truth for. Everything else in
 * the token files (shadows, typography, motion) is code-owned and survives a sync untouched.
 */
export const OWNED = {
  primitiveColor: { file: "primitive/color.json", roots: ["color"] },
  primitiveDimension: {
    file: "primitive/dimension.json",
    roots: ["spacing", "radius", "border-width"],
  },
  semanticShared: {
    file: "semantic/shared.json",
    roots: ["spacing", "radius", "size", "border-width", "breakpoint"],
  },
} as const;

export interface GeneratedFile {
  /** Relative to `packages/tokens/src`. */
  file: string;
  tree: DtcgNode;
  /** Top-level groups this file takes from Figma; other groups in the file are preserved. */
  ownedRoots: string[];
}

export interface ConversionResult {
  files: GeneratedFile[];
  warnings: string[];
}

export class ConversionError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(
      `Cannot convert Figma variables (${issues.length} issue${issues.length === 1 ? "" : "s"}):\n` +
        issues.map((i) => `  - ${i}`).join("\n"),
    );
    this.name = "ConversionError";
    this.issues = issues;
  }
}

type Layer = "primitive" | "semantic" | "component";
const LAYERS: Record<string, Layer> = {
  primitives: "primitive",
  semantic: "semantic",
  components: "component",
};
const SEGMENT = /^(?:[a-z0-9][a-z0-9-]*|DEFAULT)$/;

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** `color/action/primary/DEFAULT` → `["color","action","primary","$root"]` */
const toPath = (name: string): string[] =>
  name.split("/").map((s) => (s === "DEFAULT" ? "$root" : s));

const hex = (n: number) =>
  Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16)
    .padStart(2, "0");

function colorToHex(value: FigmaValue): string | undefined {
  if (!isRgba(value)) return undefined;
  const alpha = value.a ?? 1;
  return `#${hex(value.r)}${hex(value.g)}${hex(value.b)}${alpha < 1 ? hex(alpha) : ""}`;
}

/** Figma floats are px. Tokens use rem (÷16), except border widths and the pill radius. */
export function floatToDimension(group: string, value: number): string {
  // `radius.full` is 9999px (pill): a huge value is not a length on the rem scale.
  if (group === "border-width" || (group === "radius" && value >= 1000)) return `${value}px`;
  return `${Number((value / 16).toFixed(4))}rem`;
}

interface Context {
  variables: Map<string, FigmaVariable>;
  collections: Map<string, FigmaCollection>;
  issues: string[];
  warnings: string[];
}

function resolveValue(
  variable: FigmaVariable,
  value: FigmaValue,
  group: string,
  ctx: Context,
): unknown {
  if (isAlias(value)) {
    const target = ctx.variables.get(value.id);
    if (!target) {
      ctx.issues.push(
        `${variable.name}: alias points to an unknown variable (${value.id}); is it from a remote library?`,
      );
      return undefined;
    }
    if (target.remote) {
      ctx.issues.push(
        `${variable.name}: alias to remote variable "${target.name}" — import it into this file's collections first.`,
      );
      return undefined;
    }
    return `{${toPath(target.name).join(".")}}`;
  }
  if (variable.resolvedType === "COLOR") {
    const color = colorToHex(value);
    if (!color) ctx.issues.push(`${variable.name}: expected a colour value`);
    return color;
  }
  if (variable.resolvedType === "FLOAT" && typeof value === "number")
    return floatToDimension(group, value);
  ctx.issues.push(
    `${variable.name}: unsupported variable type ${variable.resolvedType} (only COLOR and FLOAT are synced)`,
  );
  return undefined;
}

export function convert(response: FigmaVariablesResponse): ConversionResult {
  const ctx: Context = {
    variables: new Map(Object.entries(response.meta.variables).map(([, v]) => [v.id, v])),
    collections: new Map(
      Object.entries(response.meta.variableCollections).map(([, c]) => [c.id, c]),
    ),
    issues: [],
    warnings: [],
  };
  const outputs = new Map<string, GeneratedFile>();
  const seen = new Set<string>();

  const target = (file: string, roots: readonly string[]): GeneratedFile => {
    let out = outputs.get(file);
    if (!out) {
      out = { file, tree: {}, ownedRoots: [...roots] };
      outputs.set(file, out);
    }
    return out;
  };

  for (const collection of ctx.collections.values()) {
    if (!(slug(collection.name) in LAYERS)) {
      ctx.warnings.push(
        `Collection "${collection.name}" ignored (expected Primitives, Semantic or Components).`,
      );
    }
  }

  for (const variable of [...ctx.variables.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    if (variable.remote) continue;
    const collection = ctx.collections.get(variable.variableCollectionId);
    const layer = collection ? LAYERS[slug(collection.name)] : undefined;
    if (!collection || !layer) continue;

    const segments = variable.name.split("/");
    const bad = segments.find((s) => !SEGMENT.test(s));
    if (bad !== undefined) {
      ctx.issues.push(
        `${variable.name}: invalid name segment "${bad}" (use lowercase letters, digits and hyphens; DEFAULT for a group's own value)`,
      );
      continue;
    }
    const path = toPath(variable.name);
    const [group = ""] = path;
    const type = variable.resolvedType === "COLOR" ? "color" : "dimension";
    const key = `${layer}:${path.join(".")}`;
    if (seen.has(key)) {
      ctx.issues.push(`${variable.name}: duplicate variable path`);
      continue;
    }
    seen.add(key);

    const token = (value: unknown, withDescription = true): DtcgNode => ({
      $type: type,
      $value: value,
      ...(variable.description && withDescription ? { $description: variable.description } : {}),
    });

    if (layer === "primitive") {
      const spec =
        group === "color"
          ? OWNED.primitiveColor
          : (OWNED.primitiveDimension.roots as readonly string[]).includes(group)
            ? OWNED.primitiveDimension
            : undefined;
      if (!spec) {
        ctx.issues.push(
          `${variable.name}: primitive group "${group}" is not synced from Figma (synced: color, spacing, radius, border-width). Typography and effects are code-owned.`,
        );
        continue;
      }
      const value = variable.valuesByMode[collection.defaultModeId];
      if (value === undefined) {
        ctx.issues.push(`${variable.name}: no value for the default mode`);
        continue;
      }
      const resolved = resolveValue(variable, value, group, ctx);
      if (resolved !== undefined)
        setToken(target(spec.file, spec.roots).tree, path, token(resolved));
    } else if (layer === "semantic" && variable.resolvedType === "COLOR") {
      for (const mode of collection.modes) {
        const value = variable.valuesByMode[mode.modeId];
        if (value === undefined) {
          ctx.issues.push(
            `${variable.name}: missing a value for mode "${mode.name}" (every colour needs every mode)`,
          );
          continue;
        }
        const resolved = resolveValue(variable, value, group, ctx);
        if (resolved !== undefined) {
          // A description belongs to the variable, not to a mode: keep it in the default mode's file only.
          const isDefaultMode = mode.modeId === collection.defaultModeId;
          setToken(
            target(`semantic/color.${slug(mode.name)}.json`, ["color"]).tree,
            path,
            token(resolved, isDefaultMode),
          );
        }
      }
    } else if (layer === "semantic") {
      if (!(OWNED.semanticShared.roots as readonly string[]).includes(group)) {
        ctx.issues.push(
          `${variable.name}: semantic group "${group}" is not synced from Figma (synced: ${OWNED.semanticShared.roots.join(", ")}). Elevation and transitions are code-owned.`,
        );
        continue;
      }
      const value = variable.valuesByMode[collection.defaultModeId];
      const resolved = value === undefined ? undefined : resolveValue(variable, value, group, ctx);
      if (resolved !== undefined)
        setToken(
          target(OWNED.semanticShared.file, OWNED.semanticShared.roots).tree,
          path,
          token(resolved),
        );
    } else {
      const value = variable.valuesByMode[collection.defaultModeId];
      const resolved = value === undefined ? undefined : resolveValue(variable, value, group, ctx);
      if (resolved !== undefined)
        setToken(target(`component/${group}.json`, [group]).tree, path, token(resolved));
    }
  }

  const modeFiles = [...outputs.keys()].filter((f) => f.startsWith("semantic/color."));
  if (
    !modeFiles.includes("semantic/color.light.json") ||
    !modeFiles.includes("semantic/color.dark.json")
  ) {
    ctx.warnings.push(
      "The Semantic collection has no Light and Dark modes; theme files are generated for the modes found.",
    );
  }
  if (ctx.issues.length > 0) throw new ConversionError(ctx.issues);
  return {
    files: [...outputs.values()].sort((a, b) => a.file.localeCompare(b.file)),
    warnings: ctx.warnings,
  };
}
