import type { ReactNode } from "react";

/** Themes shipped by @design-system/tokens. Adding a brand = add its name here + a tokens mode file. */
export type ResolvedTheme = "light" | "dark";
export type ThemePreference = ResolvedTheme | "system";

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial preference when nothing is stored. @default "system" */
  defaultTheme?: ThemePreference;
  /** localStorage key used to persist the preference. Omit to disable persistence. */
  storageKey?: string;
  /** Where `data-theme` is applied. @default "document" */
  scope?: "document" | "element";
  /** Only applies to `scope="element"`. */
  className?: string;
}

export interface ThemeContextValue {
  /** What the user chose, including `"system"`. */
  theme: ThemePreference;
  /** What is actually rendered. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}
