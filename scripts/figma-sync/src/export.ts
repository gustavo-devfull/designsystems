import { readFileSync } from "node:fs";
import path from "node:path";
import { OWNED } from "./convert.ts";
import { flatten, type DtcgNode } from "./dtcg.ts";
import type {
  FigmaCollection,
  FigmaValue,
  FigmaVariable,
  FigmaVariablesResponse,
} from "./figma-types.ts";

/**
 * Inverse of `convert`: builds the Figma response a correctly set-up Figma file would return for the
 * tokens in `packages/tokens/src`. It is the executable specification for designers (names, collections,
 * modes) and powers the round-trip test and the offline fixture.
 */

const read = (srcDir: string, file: string): DtcgNode =>
  JSON.parse(readFileSync(path.join(srcDir, file), "utf8")) as DtcgNode;

const fromHex = (hex: string) => {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Not a hex colour: ${hex}`);
  const n = parseInt(m[1], 16);
  const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a };
};

const fromDimension = (value: string): number => {
  const m = /^(-?[\d.]+)(rem|px)$/.exec(value);
  if (!m?.[1]) throw new Error(`Not a dimension: ${value}`);
  return m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1]);
};

const figmaName = (dotted: string) =>
  dotted
    .split(".")
    .map((s) => (s === "$root" ? "DEFAULT" : s))
    .join("/");
const refPath = (value: string) => /^\{(.+)\}$/.exec(value)?.[1];

export function exportToFigma(srcDir: string): FigmaVariablesResponse {
  const variables: Record<string, FigmaVariable> = {};
  const idByLayerAndPath = new Map<string, string>();
  let next = 1;
  const newId = () => `VariableID:1:${next++}`;

  const collections: Record<string, FigmaCollection> = {
    primitives: {
      id: "VariableCollectionId:1:1",
      name: "Primitives",
      modes: [{ modeId: "1:0", name: "Value" }],
      defaultModeId: "1:0",
      variableIds: [],
    },
    semantic: {
      id: "VariableCollectionId:1:2",
      name: "Semantic",
      modes: [
        { modeId: "2:0", name: "Light" },
        { modeId: "2:1", name: "Dark" },
      ],
      defaultModeId: "2:0",
      variableIds: [],
    },
    components: {
      id: "VariableCollectionId:1:3",
      name: "Components",
      modes: [{ modeId: "3:0", name: "Value" }],
      defaultModeId: "3:0",
      variableIds: [],
    },
  };

  // Pass 1: declare variables (so aliases can be resolved by name regardless of order).
  const declare = (
    layer: keyof typeof collections,
    dotted: string,
    type: "COLOR" | "FLOAT",
    description: string | undefined,
  ) => {
    const key = `${layer}:${dotted}`;
    const existing = idByLayerAndPath.get(key);
    if (existing) return existing;
    const id = newId();
    const collection = collections[layer] as FigmaCollection;
    variables[id] = {
      id,
      name: figmaName(dotted),
      variableCollectionId: collection.id,
      resolvedType: type,
      valuesByMode: {},
      ...(description ? { description } : {}),
    };
    collection.variableIds.push(id);
    idByLayerAndPath.set(key, id);
    return id;
  };

  const valueFor = (raw: unknown, type: "COLOR" | "FLOAT"): FigmaValue => {
    if (typeof raw !== "string") throw new Error(`Unsupported token value: ${JSON.stringify(raw)}`);
    const ref = refPath(raw);
    if (ref) {
      const id =
        idByLayerAndPath.get(`primitives:${ref}`) ?? idByLayerAndPath.get(`semantic:${ref}`);
      if (!id) throw new Error(`Unresolved reference {${ref}}`);
      return { type: "VARIABLE_ALIAS", id };
    }
    return type === "COLOR" ? fromHex(raw) : fromDimension(raw);
  };

  const owned = (flat: ReturnType<typeof flatten>, roots: readonly string[]) =>
    [...flat].filter(([k]) => roots.includes(k.split(".")[0] ?? ""));

  const primitives = [
    ...owned(flatten(read(srcDir, OWNED.primitiveColor.file)), OWNED.primitiveColor.roots),
    ...owned(flatten(read(srcDir, OWNED.primitiveDimension.file)), OWNED.primitiveDimension.roots),
  ];
  for (const [dotted, t] of primitives)
    declare("primitives", dotted, t.type === "color" ? "COLOR" : "FLOAT", t.description);

  const light = owned(flatten(read(srcDir, "semantic/color.light.json")), ["color"]);
  const dark = new Map(owned(flatten(read(srcDir, "semantic/color.dark.json")), ["color"]));
  const shared = owned(
    flatten(read(srcDir, OWNED.semanticShared.file)),
    OWNED.semanticShared.roots,
  );
  for (const [dotted, t] of light) declare("semantic", dotted, "COLOR", t.description);
  for (const [dotted, t] of shared) declare("semantic", dotted, "FLOAT", t.description);

  const componentFlat = new Map<string, ReturnType<typeof flatten>>();
  for (const file of ["button", "input"])
    componentFlat.set(file, flatten(read(srcDir, `component/${file}.json`)));
  for (const flat of componentFlat.values()) {
    for (const [dotted, t] of flat)
      declare("components", dotted, t.type === "color" ? "COLOR" : "FLOAT", t.description);
  }

  // Pass 2: values.
  for (const [dotted, t] of primitives) {
    const v = variables[idByLayerAndPath.get(`primitives:${dotted}`) as string] as FigmaVariable;
    v.valuesByMode["1:0"] = valueFor(t.value, t.type === "color" ? "COLOR" : "FLOAT");
  }
  for (const [dotted, t] of light) {
    const v = variables[idByLayerAndPath.get(`semantic:${dotted}`) as string] as FigmaVariable;
    v.valuesByMode["2:0"] = valueFor(t.value, "COLOR");
    v.valuesByMode["2:1"] = valueFor(dark.get(dotted)?.value, "COLOR");
  }
  for (const [dotted, t] of shared) {
    const v = variables[idByLayerAndPath.get(`semantic:${dotted}`) as string] as FigmaVariable;
    const value = valueFor(t.value, "FLOAT");
    v.valuesByMode["2:0"] = value; // Figma needs a value in every mode of the collection
    v.valuesByMode["2:1"] = value;
  }
  for (const flat of componentFlat.values()) {
    for (const [dotted, t] of flat) {
      const v = variables[idByLayerAndPath.get(`components:${dotted}`) as string] as FigmaVariable;
      v.valuesByMode["3:0"] = valueFor(t.value, t.type === "color" ? "COLOR" : "FLOAT");
    }
  }

  return {
    status: 200,
    error: false,
    meta: {
      variables,
      variableCollections: Object.fromEntries(Object.values(collections).map((c) => [c.id, c])),
    },
  };
}
