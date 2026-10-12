import type {
  FigmaCollection,
  FigmaValue,
  FigmaVariable,
  FigmaVariablesResponse,
} from "./figma-types.ts";

/** Tiny builder for hand-written Figma responses in tests. */
export function figma(spec: {
  collections: { name: string; modes?: string[] }[];
  variables: {
    collection: string;
    name: string;
    type?: FigmaVariable["resolvedType"];
    values: Record<string, FigmaValue>;
    description?: string;
    remote?: boolean;
  }[];
}): FigmaVariablesResponse {
  const collections: Record<string, FigmaCollection> = {};
  const variables: Record<string, FigmaVariable> = {};
  for (const c of spec.collections) {
    const modes = (c.modes ?? ["Value"]).map((name) => ({ modeId: `${c.name}:${name}`, name }));
    collections[c.name] = {
      id: c.name,
      name: c.name,
      modes,
      defaultModeId: modes[0]?.modeId ?? "",
      variableIds: [],
    };
  }
  for (const v of spec.variables) {
    const collection = collections[v.collection];
    if (!collection) throw new Error(`unknown collection ${v.collection}`);
    const valuesByMode = Object.fromEntries(
      Object.entries(v.values).map(([mode, value]) => [`${v.collection}:${mode}`, value]),
    );
    variables[v.name] = {
      id: v.name,
      name: v.name,
      variableCollectionId: collection.id,
      resolvedType: v.type ?? "COLOR",
      valuesByMode,
      ...(v.description ? { description: v.description } : {}),
      ...(v.remote ? { remote: true } : {}),
    };
    collection.variableIds.push(v.name);
  }
  return { status: 200, error: false, meta: { variables, variableCollections: collections } };
}

export const alias = (id: string): FigmaValue => ({ type: "VARIABLE_ALIAS", id });
