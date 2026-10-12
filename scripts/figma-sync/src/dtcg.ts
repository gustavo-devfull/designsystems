/** Minimal DTCG helpers: flatten for comparison, set by path, merge owned subtrees. */

export type DtcgNode = { [key: string]: unknown };

export interface FlatToken {
  type: string | undefined;
  value: unknown;
  description: string | undefined;
}

const isObject = (v: unknown): v is DtcgNode =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Flattens a DTCG tree to `dotted.path → token`, inheriting group-level `$type`. */
export function flatten(
  tree: DtcgNode,
  trail: string[] = [],
  inherited?: string,
): Map<string, FlatToken> {
  const out = new Map<string, FlatToken>();
  const type = typeof tree["$type"] === "string" ? tree["$type"] : inherited;
  if ("$value" in tree) {
    out.set(trail.join("."), {
      type,
      value: tree["$value"],
      description: typeof tree["$description"] === "string" ? tree["$description"] : undefined,
    });
    return out;
  }
  for (const [key, child] of Object.entries(tree)) {
    if ((key === "$root" || !key.startsWith("$")) && isObject(child)) {
      for (const [k, v] of flatten(child, [...trail, key], type)) out.set(k, v);
    }
  }
  return out;
}

export function setToken(tree: DtcgNode, path: string[], token: DtcgNode): void {
  let node = tree;
  for (const key of path.slice(0, -1)) {
    const next = node[key];
    if (isObject(next)) node = next;
    else {
      const created: DtcgNode = {};
      node[key] = created;
      node = created;
    }
  }
  const last = path[path.length - 1];
  if (last === undefined) throw new Error("Empty token path");
  node[last] = token;
}

/**
 * Replaces the `ownedRoots` subtrees of `existing` with those of `generated` and keeps every other
 * root untouched (e.g. `elevation`, `transition`: design intent that Figma variables cannot hold).
 */
export function mergeOwned(
  existing: DtcgNode,
  generated: DtcgNode,
  ownedRoots: readonly string[],
): DtcgNode {
  const merged: DtcgNode = Object.fromEntries(
    Object.entries(existing).filter(([key]) => !ownedRoots.includes(key)),
  );
  for (const root of ownedRoots) if (root in generated) merged[root] = generated[root];
  return merged;
}

export interface Drift {
  added: string[];
  removed: string[];
  changed: string[];
}

/** Compares owned tokens only, ignoring file formatting and group-level metadata. */
export function diffOwned(
  existing: DtcgNode,
  generated: DtcgNode,
  ownedRoots: readonly string[],
): Drift {
  const own = (m: Map<string, FlatToken>) =>
    new Map([...m].filter(([k]) => ownedRoots.includes(k.split(".")[0] ?? "")));
  const before = own(flatten(existing));
  const after = own(flatten(generated));
  const drift: Drift = { added: [], removed: [], changed: [] };
  for (const [k, v] of after) {
    const old = before.get(k);
    if (!old) drift.added.push(k);
    else if (
      JSON.stringify(old.value) !== JSON.stringify(v.value) ||
      old.type !== v.type ||
      (old.description ?? "") !== (v.description ?? "")
    ) {
      drift.changed.push(k);
    }
  }
  for (const k of before.keys()) if (!after.has(k)) drift.removed.push(k);
  return drift;
}

export const hasDrift = (d: Drift) => d.added.length + d.removed.length + d.changed.length > 0;
