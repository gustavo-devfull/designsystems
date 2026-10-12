import data from "@design-system/tokens/tokens.json";

export type Theme = "light" | "dark";
export type Layer = "primitive" | "semantic" | "component";

export interface Token {
  name: string;
  value: string | number;
  type: string;
  cssVar: string;
  layer: Layer;
  description?: string;
}

interface TokensFile {
  prefix: string;
  themes: Theme[];
  tokens: Record<Theme, Record<string, Omit<Token, "name">>>;
}

const file = data as unknown as TokensFile;

export function getTokens(theme: Theme = "light"): Token[] {
  return Object.entries(file.tokens[theme]).map(([name, t]) => ({ name, ...t }));
}

export function getToken(name: string, theme: Theme = "light"): Token | undefined {
  const t = file.tokens[theme][name];
  return t ? { name, ...t } : undefined;
}

export function byPrefix(prefix: string, theme: Theme = "light"): Token[] {
  return getTokens(theme).filter((t) => t.name.startsWith(prefix));
}

/** Theme key behind a colour utility (`color.action.primary` → `action-primary`). */
function colorKey(token: Token): string | undefined {
  if (token.type !== "color" || token.layer === "primitive") return undefined;
  const parts = token.name.split(".");
  return (token.layer === "semantic" ? parts.slice(1) : parts).join("-");
}

/** The Tailwind class that applies a semantic/component colour token (e.g. `bg-action-primary`). */
export function colorUtility(token: Token): string | undefined {
  const key = colorKey(token);
  if (!key) return undefined;
  const parts = token.name.split(".");
  const [group, , last] = token.layer === "semantic" ? parts.slice(1) : parts;
  const isFeedback = group === "feedback";
  let prefix = "bg";
  if (group === "text" || (isFeedback && last === undefined)) prefix = "text";
  else if (group === "border" || (isFeedback && last === "border")) prefix = "border";
  else if (group === "focus") prefix = "outline";
  // component tokens: button.text.primary / button.border.outline
  if (token.layer === "component") {
    if (parts[1] === "text") prefix = "text";
    else if (parts[1] === "border") prefix = "border";
  }
  return `${prefix}-${key}`;
}
