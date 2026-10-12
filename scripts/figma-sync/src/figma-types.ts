/** The subset of the Figma "local variables" REST response this tool relies on. */

export interface FigmaRgba {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

export type FigmaValue = boolean | number | string | FigmaRgba | FigmaAlias;

export interface FigmaVariable {
  id: string;
  /** Slash-separated path: `color/action/primary/DEFAULT`. */
  name: string;
  variableCollectionId: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  valuesByMode: Record<string, FigmaValue>;
  description?: string;
  /** Variables imported from another library; they are not owned by this file. */
  remote?: boolean;
}

export interface FigmaCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  defaultModeId: string;
  variableIds: string[];
}

export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaCollection>;
  };
}

export const isAlias = (v: FigmaValue): v is FigmaAlias => typeof v === "object" && "type" in v;
export const isRgba = (v: FigmaValue): v is FigmaRgba => typeof v === "object" && "r" in v;
