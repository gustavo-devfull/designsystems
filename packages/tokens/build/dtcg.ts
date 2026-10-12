import { readFileSync } from "node:fs";

export interface FlatToken {
  /** Path segments, including `$root` when present. */
  path: string[];
  type: string | undefined;
  value: unknown;
  description: string | undefined;
}

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Flattens DTCG files into a map keyed by the dotted path (e.g. `color.action.primary.$root`). */
export function loadTokens(filePaths: string[]): Map<string, FlatToken> {
  const out = new Map<string, FlatToken>();
  const walk = (node: Json, trail: string[], inheritedType: string | undefined) => {
    const type = typeof node["$type"] === "string" ? node["$type"] : inheritedType;
    if ("$value" in node) {
      const description =
        typeof node["$description"] === "string" ? node["$description"] : undefined;
      out.set(trail.join("."), { path: trail, type, value: node["$value"], description });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "$root" || !key.startsWith("$")) {
        if (isObject(child)) walk(child, [...trail, key], type);
      }
    }
  };
  for (const file of filePaths) walk(JSON.parse(readFileSync(file, "utf8")) as Json, [], undefined);
  return out;
}

const REF = /\{([^{}]+)\}/g;

/** Collects every `{reference}` found in a token value (string or composite). */
export function referencesOf(value: unknown): string[] {
  if (typeof value === "string") return [...value.matchAll(REF)].map((m) => m[1] ?? "");
  if (Array.isArray(value)) return value.flatMap(referencesOf);
  if (isObject(value)) return Object.values(value).flatMap(referencesOf);
  return [];
}

/** Follows alias chains until a literal value is reached. */
export function resolveLiteral(key: string, tokens: Map<string, FlatToken>): unknown {
  const seen = new Set<string>();
  let current = key;
  for (;;) {
    if (seen.has(current)) throw new Error(`Circular reference at "${current}"`);
    seen.add(current);
    const token = tokens.get(current);
    if (!token) throw new Error(`Unresolved reference "${current}"`);
    const refs = typeof token.value === "string" ? referencesOf(token.value) : [];
    const ref = refs[0];
    if (typeof token.value === "string" && ref !== undefined && token.value === `{${ref}}`) {
      current = ref;
      continue;
    }
    return token.value;
  }
}
